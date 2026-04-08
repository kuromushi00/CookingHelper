import { supabase } from './db';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

interface AggregatedItem {
  ingredient_name: string;
  total_amount: number;
  unit: string;
  category: string;
  from_recipes: string[];
}

async function generateShoppingList() {
  const weekStart = process.argv[2] === '--week' ? process.argv[3] : undefined;
  const userId = process.argv.indexOf('--user-id') !== -1
    ? process.argv[process.argv.indexOf('--user-id') + 1]
    : undefined;

  if (!weekStart) {
    console.error('Usage: npx tsx scripts/generate-shopping-list.ts --week 2026-04-06');
    process.exit(1);
  }

  // Get user ID
  let targetUserId = userId;
  if (!targetUserId) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (!users || users.length === 0) {
      console.error('No users found.');
      process.exit(1);
    }
    targetUserId = users[0].id;
  }

  // Fetch menu for the week
  const { data: menus } = await supabase
    .from('weekly_menus')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('week_start', weekStart);

  if (!menus || menus.length === 0) {
    console.log('No menu found for this week.');
    return;
  }

  // Collect all recipe IDs
  const recipeIds = new Set<string>();
  for (const menu of menus) {
    if (menu.main_recipe_id) recipeIds.add(menu.main_recipe_id);
    if (menu.soup_recipe_id) recipeIds.add(menu.soup_recipe_id);
    if (menu.side_recipe_ids) {
      for (const id of menu.side_recipe_ids) recipeIds.add(id);
    }
  }

  if (recipeIds.size === 0) {
    console.log('No recipes assigned to this week.');
    return;
  }

  // Fetch recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .in('id', Array.from(recipeIds));

  if (!recipes) {
    console.error('Failed to fetch recipes.');
    return;
  }

  const recipeMap = new Map(recipes.map(r => [r.id, r]));

  // Aggregate ingredients
  const aggregated = new Map<string, AggregatedItem>();

  for (const menu of menus) {
    const processRecipe = (recipeId: string | null) => {
      if (!recipeId) return;
      const recipe = recipeMap.get(recipeId);
      if (!recipe) return;

      const ratio = menu.servings / recipe.servings;
      for (const ing of recipe.ingredients as Ingredient[]) {
        const key = `${ing.name}|${ing.unit}`;
        const existing = aggregated.get(key);
        if (existing) {
          existing.total_amount += ing.amount * ratio;
          if (!existing.from_recipes.includes(recipe.name)) {
            existing.from_recipes.push(recipe.name);
          }
        } else {
          aggregated.set(key, {
            ingredient_name: ing.name,
            total_amount: ing.amount * ratio,
            unit: ing.unit,
            category: ing.category,
            from_recipes: [recipe.name],
          });
        }
      }
    };

    processRecipe(menu.main_recipe_id);
    processRecipe(menu.soup_recipe_id);
    if (menu.side_recipe_ids) {
      for (const id of menu.side_recipe_ids) {
        processRecipe(id);
      }
    }
  }

  // Delete existing shopping items for this week
  await supabase
    .from('shopping_items')
    .delete()
    .eq('user_id', targetUserId)
    .eq('week_start', weekStart);

  // Insert new items
  const items = Array.from(aggregated.values()).map(item => ({
    user_id: targetUserId,
    week_start: weekStart,
    ingredient_name: item.ingredient_name,
    total_amount: Math.round(item.total_amount * 100) / 100,
    unit: item.unit,
    category: item.category,
    checked: false,
    from_recipes: item.from_recipes,
  }));

  const { error } = await supabase.from('shopping_items').insert(items);
  if (error) {
    console.error('Failed to generate shopping list:', error.message);
    process.exit(1);
  }

  console.log(`Shopping list generated: ${items.length} items`);
  const categoryGroups = new Map<string, typeof items>();
  for (const item of items) {
    const cat = item.category;
    if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
    categoryGroups.get(cat)!.push(item);
  }
  for (const [cat, catItems] of categoryGroups) {
    console.log(`\n【${cat}】`);
    for (const item of catItems) {
      console.log(`  ${item.ingredient_name} ${item.total_amount}${item.unit} (${item.from_recipes.join(', ')})`);
    }
  }
}

generateShoppingList();
