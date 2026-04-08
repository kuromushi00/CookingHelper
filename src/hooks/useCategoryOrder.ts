'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { DEFAULT_CATEGORY_ORDER } from '@/types';
import type { IngredientCategory, UserSettings } from '@/types';

export function useCategoryOrder() {
  const { user } = useAuth();
  const [categoryOrder, setCategoryOrder] = useState<IngredientCategory[]>(DEFAULT_CATEGORY_ORDER);
  const [defaultServings, setDefaultServings] = useState(2);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setCategoryOrder((data as UserSettings).category_order);
      setDefaultServings((data as UserSettings).default_servings);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateCategoryOrder = async (newOrder: IngredientCategory[]) => {
    if (!user) return;
    setCategoryOrder(newOrder);
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, category_order: newOrder, default_servings: defaultServings });
  };

  const updateDefaultServings = async (servings: number) => {
    if (!user) return;
    setDefaultServings(servings);
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, category_order: categoryOrder, default_servings: servings });
  };

  return { categoryOrder, defaultServings, loading, updateCategoryOrder, updateDefaultServings };
}
