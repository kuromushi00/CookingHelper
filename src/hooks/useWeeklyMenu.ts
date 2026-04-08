'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { WeeklyMenuItem, DayOfWeek } from '@/types';

export function useWeeklyMenu(weekStart: string) {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<WeeklyMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart);
    setMenuItems((data as WeeklyMenuItem[]) ?? []);
    setLoading(false);
  }, [user, weekStart]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const setMeal = async (
    dayOfWeek: DayOfWeek,
    updates: {
      main_recipe_id?: string | null;
      soup_recipe_id?: string | null;
      side_recipe_ids?: string[];
      servings?: number;
    }
  ) => {
    if (!user) return;
    const existing = menuItems.find((m) => m.day_of_week === dayOfWeek);
    if (existing) {
      await supabase
        .from('weekly_menus')
        .update(updates)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('weekly_menus')
        .insert({
          user_id: user.id,
          week_start: weekStart,
          day_of_week: dayOfWeek,
          main_recipe_id: null,
          soup_recipe_id: null,
          side_recipe_ids: [],
          servings: 2,
          ...updates,
        });
    }
    await fetchMenu();
  };

  const clearDay = async (dayOfWeek: DayOfWeek) => {
    if (!user) return;
    const existing = menuItems.find((m) => m.day_of_week === dayOfWeek);
    if (existing) {
      await supabase.from('weekly_menus').delete().eq('id', existing.id);
      await fetchMenu();
    }
  };

  return { menuItems, loading, setMeal, clearDay, refetch: fetchMenu };
}
