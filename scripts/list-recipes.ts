import { supabase } from './db';

async function listRecipes() {
  const typeFilter = process.argv[2] === '--type' ? process.argv[3] : undefined;

  let query = supabase.from('recipes').select('id, name, type, cuisine, servings, is_preset');

  if (typeFilter) {
    query = query.eq('type', typeFilter);
  }

  const { data, error } = await query.order('type').order('name');

  if (error) {
    console.error('Failed to list recipes:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No recipes found.');
    return;
  }

  const typeLabels: Record<string, string> = { main: 'メイン', soup: 'スープ', side: '副菜' };
  const cuisineLabels: Record<string, string> = { japanese: '和', western: '洋', chinese: '中', other: '他' };

  let currentType = '';
  for (const r of data) {
    if (r.type !== currentType) {
      currentType = r.type;
      console.log(`\n=== ${typeLabels[r.type] || r.type} ===`);
    }
    const preset = r.is_preset ? '' : ' [カスタム]';
    console.log(`  ${r.name} (${cuisineLabels[r.cuisine]}, ${r.servings}人前)${preset} [${r.id}]`);
  }
}

listRecipes();
