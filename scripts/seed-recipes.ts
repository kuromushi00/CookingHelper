import { supabase } from './db';

// defaultRecipes.ts uses @/ alias which doesn't work in scripts, so we inline the import path
// We need to use a different approach: read the file and use the data directly

const defaultRecipes = [
  // We'll fetch from the module after building, or duplicate the data
  // For simplicity, this script reads from the compiled source
];

async function seedRecipes() {
  // Get all users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Failed to list users:', usersError.message);
    process.exit(1);
  }

  if (users.length === 0) {
    console.error('No users found. Please sign up first.');
    process.exit(1);
  }

  const userId = process.argv[2] || users[0].id;
  console.log(`Seeding recipes for user: ${userId}`);

  // Check if user already has preset recipes
  const { data: existing } = await supabase
    .from('recipes')
    .select('id')
    .eq('user_id', userId)
    .eq('is_preset', true)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('Preset recipes already exist. Skipping seed.');
    return;
  }

  // Import recipe data (using dynamic import with path resolution)
  const { defaultRecipes: recipes } = await import('../src/data/defaultRecipes');

  const rows = recipes.map((r: Record<string, unknown>) => ({
    ...r,
    user_id: userId,
  }));

  const { error } = await supabase.from('recipes').insert(rows);
  if (error) {
    console.error('Failed to seed recipes:', error.message);
    process.exit(1);
  }

  console.log(`Successfully seeded ${rows.length} recipes.`);
}

seedRecipes();
