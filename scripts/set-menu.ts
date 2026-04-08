import { supabase } from './db';

async function setMenu() {
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const weekStart = getArg('week');
  const day = getArg('day');
  const mainName = getArg('main');
  const soupName = getArg('soup');
  const sideName = getArg('side');
  const userId = getArg('user-id');
  const servings = parseInt(getArg('servings') || '2');

  if (!weekStart || !day) {
    console.error('Usage: npx tsx scripts/set-menu.ts --week 2026-04-06 --day mon [--main "カレーライス"] [--soup "味噌汁"] [--side "卵焼き"] [--servings 2]');
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

  // Resolve recipe names to IDs
  const resolveRecipeId = async (name: string | undefined): Promise<string | null> => {
    if (!name) return null;
    const { data } = await supabase
      .from('recipes')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('name', name)
      .limit(1)
      .single();
    if (!data) {
      console.warn(`Recipe not found: ${name}`);
      return null;
    }
    return data.id;
  };

  const mainId = await resolveRecipeId(mainName);
  const soupId = await resolveRecipeId(soupName);
  const sideId = await resolveRecipeId(sideName);
  const sideIds = sideId ? [sideId] : [];

  // Upsert menu
  const { error } = await supabase
    .from('weekly_menus')
    .upsert(
      {
        user_id: targetUserId,
        week_start: weekStart,
        day_of_week: day,
        main_recipe_id: mainId,
        soup_recipe_id: soupId,
        side_recipe_ids: sideIds,
        servings,
      },
      { onConflict: 'user_id,week_start,day_of_week' }
    );

  if (error) {
    console.error('Failed to set menu:', error.message);
    process.exit(1);
  }

  console.log(`Menu set for ${weekStart} ${day}: main=${mainName || 'なし'}, soup=${soupName || 'なし'}, side=${sideName || 'なし'}`);
}

setMenu();
