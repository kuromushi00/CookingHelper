import type { Recipe, WeeklyMenuItem, IngredientCategory } from '@/types';

export interface GeneratedItem {
  ingredient_name: string;
  total_amount: number;
  unit: string;
  category: IngredientCategory;
  from_recipes: string[];
}

export function generateShoppingList(
  menuItems: WeeklyMenuItem[],
  recipes: Recipe[]
): GeneratedItem[] {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const aggregated = new Map<string, GeneratedItem>();

  const processRecipe = (recipeId: string | null, servings: number) => {
    if (!recipeId) return;
    const recipe = recipeMap.get(recipeId);
    if (!recipe) return;

    const ratio = servings / recipe.servings;
    for (const ing of recipe.ingredients) {
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

  for (const menu of menuItems) {
    processRecipe(menu.main_recipe_id, menu.servings);
    processRecipe(menu.soup_recipe_id, menu.servings);
    for (const sideId of menu.side_recipe_ids || []) {
      processRecipe(sideId, menu.servings);
    }
  }

  return Array.from(aggregated.values()).map((item) => ({
    ...item,
    total_amount: Math.round(item.total_amount * 100) / 100,
  }));
}
