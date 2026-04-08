'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { ShoppingItem } from '@/types';

export function useShoppingList(weekStart: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart);
    setItems((data as ShoppingItem[]) ?? []);
    setLoading(false);
  }, [user, weekStart]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await supabase
      .from('shopping_items')
      .update({ checked: !item.checked })
      .eq('id', id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const uncheckAll = async () => {
    if (!user) return;
    await supabase
      .from('shopping_items')
      .update({ checked: false })
      .eq('user_id', user.id)
      .eq('week_start', weekStart);
    setItems((prev) => prev.map((i) => ({ ...i, checked: false })));
  };

  return { items, loading, toggleItem, uncheckAll, refetch: fetchItems };
}
