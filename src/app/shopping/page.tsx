'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu';
import { useRecipes } from '@/hooks/useRecipes';
import { useCategoryOrder } from '@/hooks/useCategoryOrder';
import { useAuth } from '@/hooks/useAuth';
import { getWeekStart, formatDate, getWeekEndDate } from '@/lib/utils';
import { generateShoppingList } from '@/lib/shoppingListGenerator';
import { supabase } from '@/lib/supabase';
import type { IngredientCategory } from '@/types';

export default function ShoppingPage() {
  const { user } = useAuth();
  const weekStart = getWeekStart();
  const { items, loading, toggleItem, uncheckAll, refetch } = useShoppingList(weekStart);
  const { menuItems } = useWeeklyMenu(weekStart);
  const { recipes } = useRecipes();
  const { categoryOrder } = useCategoryOrder();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);

    const generated = generateShoppingList(menuItems, recipes);

    // Delete existing items
    await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', user.id)
      .eq('week_start', weekStart);

    // Insert new items
    if (generated.length > 0) {
      await supabase.from('shopping_items').insert(
        generated.map((item) => ({
          user_id: user.id,
          week_start: weekStart,
          ingredient_name: item.ingredient_name,
          total_amount: item.total_amount,
          unit: item.unit,
          category: item.category,
          checked: false,
          from_recipes: item.from_recipes,
        }))
      );
    }

    await refetch();
    setGenerating(false);
  };

  // Group by category in order
  const grouped = useMemo(() => {
    const groups = new Map<IngredientCategory, typeof items>();
    for (const cat of categoryOrder) {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length > 0) groups.set(cat, catItems);
    }
    // Add items with unknown category
    const knownCats = new Set(categoryOrder);
    const unknownItems = items.filter((i) => !knownCats.has(i.category as IngredientCategory));
    if (unknownItems.length > 0) groups.set('その他' as IngredientCategory, [...(groups.get('その他' as IngredientCategory) || []), ...unknownItems]);
    return groups;
  }, [items, categoryOrder]);

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div>
      <Header
        title="買い物リスト"
        rightAction={
          items.length > 0 ? (
            <button onClick={uncheckAll} className="text-sm text-gray-500">
              リセット
            </button>
          ) : null
        }
      />

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            {formatDate(weekStart)} 〜 {formatDate(getWeekEndDate(weekStart))}
          </span>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {generating ? '生成中...' : 'リスト生成'}
          </button>
        </div>

        {items.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>{checkedCount} / {items.length} チェック済み</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-2">買い物リストがありません</p>
            <p className="text-sm">献立を設定して「リスト生成」を押してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([category, catItems]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 px-1">
                  {category}
                </h3>
                <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                  {catItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        item.checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                      }`}>
                        {item.checked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {item.ingredient_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.from_recipes?.join(', ')}
                        </p>
                      </div>
                      <span className={`text-sm flex-shrink-0 ${item.checked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.total_amount} {item.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
