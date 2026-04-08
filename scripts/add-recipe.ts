import { supabase } from './db';

async function addRecipe() {
  const args = process.argv.slice(2);

  // Parse arguments
  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const name = getArg('name');
  const type = getArg('type') || 'main';
  const cuisine = getArg('cuisine') || 'japanese';
  const servings = parseInt(getArg('servings') || '2');
  const ingredientsJson = getArg('ingredients') || '[]';
  const userId = getArg('user-id');
  const memo = getArg('memo');

  if (!name) {
    console.error('Usage: npx tsx scripts/add-recipe.ts --name "レシピ名" [--type main|soup|side] [--cuisine japanese|western|chinese|other] [--servings 2] [--ingredients \'[...]\'] [--user-id UUID] [--memo "メモ"]');
    process.exit(1);
  }

  // Get user ID if not provided
  let targetUserId = userId;
  if (!targetUserId) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (!users || users.length === 0) {
      console.error('No users found.');
      process.exit(1);
    }
    targetUserId = users[0].id;
  }

  const ingredients = JSON.parse(ingredientsJson);

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: targetUserId,
      name,
      type,
      cuisine,
      servings,
      ingredients,
      is_preset: false,
      memo: memo || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to add recipe:', error.message);
    process.exit(1);
  }

  console.log(`Recipe added: ${data.name} (${data.id})`);
}

addRecipe();
