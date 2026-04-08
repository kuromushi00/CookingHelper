'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useCategoryOrder } from '@/hooks/useCategoryOrder';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_CATEGORY_ORDER } from '@/types';
import type { IngredientCategory } from '@/types';

export default function SettingsPage() {
  const { categoryOrder, defaultServings, updateCategoryOrder, updateDefaultServings } = useCategoryOrder();
  const { signOut } = useAuth();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= categoryOrder.length) return;
    const newOrder = [...categoryOrder];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    updateCategoryOrder(newOrder);
  };

  const handleReset = () => {
    if (confirm('売り場の順番をデフォルトに戻しますか？')) {
      updateCategoryOrder([...DEFAULT_CATEGORY_ORDER]);
    }
  };

  return (
    <div>
      <Header title="設定" />

      <div className="px-4 py-4 space-y-6">
        {/* Default servings */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">デフォルト人数</h2>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
            <button
              onClick={() => updateDefaultServings(Math.max(1, defaultServings - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold"
            >
              -
            </button>
            <span className="text-lg font-medium text-gray-900 w-12 text-center">
              {defaultServings}人
            </span>
            <button
              onClick={() => updateDefaultServings(defaultServings + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Category order */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-700">売り場の並び順</h2>
            <button onClick={handleReset} className="text-xs text-gray-500 hover:underline">
              リセット
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            上下ボタンで順番を変更。スーパーの入口から回る順に並べてください。
          </p>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {categoryOrder.map((cat, index) => (
              <div key={cat} className="flex items-center px-4 py-3">
                <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                <span className="flex-1 text-sm text-gray-900">{cat}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === categoryOrder.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-500 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { if (confirm('ログアウトしますか？')) signOut(); }}
          className="w-full py-3 text-red-500 bg-white rounded-xl shadow-sm text-sm font-medium"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
