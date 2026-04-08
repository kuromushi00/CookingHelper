'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import { getWeekStart, formatDate, getWeekEndDate } from '@/lib/utils';
import { DAY_LABELS, DAYS_OF_WEEK } from '@/types';
import type { DayOfWeek } from '@/types';
import Link from 'next/link';

interface AISuggestion {
  days: { day: DayOfWeek; main: string; soup: string; sides: string[] }[];
}

export default function Home() {
  const { user } = useAuth();
  const weekStart = getWeekStart();
  const { menuItems, setMeal, refetch: refetchMenu } = useWeeklyMenu(weekStart);
  const { recipes } = useRecipes();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [aiError, setAiError] = useState('');

  const getRecipeName = (id: string | null) => {
    if (!id) return null;
    return recipes.find((r) => r.id === id)?.name ?? null;
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      // Get previous week's menu for variety
      const prevWeekDate = new Date(weekStart);
      prevWeekDate.setDate(prevWeekDate.getDate() - 7);
      const previousMenuNames = menuItems
        .map((m) => getRecipeName(m.main_recipe_id))
        .filter(Boolean) as string[];

      const res = await fetch('/api/suggest-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeNames: recipes.map((r) => `${r.name}(${r.type})`),
          previousWeekMenuNames: previousMenuNames,
          servings: 2,
        }),
      });

      if (!res.ok) throw new Error('提案の取得に失敗しました');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiSuggestion(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setAiLoading(false);
    }
  };

  const findRecipe = (name: string) => {
    // まず完全一致を試す
    const exact = recipes.find((r) => r.name === name);
    if (exact) return exact;
    // AIが「(type)」付きで返した場合に対応
    const stripped = name.replace(/\((?:main|soup|side|新規)\)$/, '').trim();
    return recipes.find((r) => r.name === stripped) ?? null;
  };

  const handleAcceptSuggestion = async () => {
    if (!aiSuggestion) return;
    setAiLoading(true);
    setAiError('');

    try {
      for (const daySugg of aiSuggestion.days) {
        const mainRecipe = findRecipe(daySugg.main);
        const soupRecipe = findRecipe(daySugg.soup);
        const sideRecipes = daySugg.sides
          .map((name) => findRecipe(name))
          .filter(Boolean);

        await setMeal(daySugg.day as DayOfWeek, {
          main_recipe_id: mainRecipe?.id ?? null,
          soup_recipe_id: soupRecipe?.id ?? null,
          side_recipe_ids: sideRecipes.map((r) => r!.id),
        });
      }

      setAiSuggestion(null);
      await refetchMenu();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : '献立の保存に失敗しました');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <Header title="CookingHelper" />
      <div className="px-4 py-4 space-y-4">
        <div className="text-center text-sm text-gray-500">
          {formatDate(weekStart)} 〜 {formatDate(getWeekEndDate(weekStart))} の献立
        </div>

        {/* AI Suggestion Button */}
        <button
          onClick={handleAISuggest}
          disabled={aiLoading || recipes.length === 0}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {aiLoading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              AIが考え中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AIに1週間の献立を提案してもらう
            </>
          )}
        </button>

        {recipes.length === 0 && (
          <p className="text-center text-sm text-gray-400">レシピを登録するとAIが献立を提案できます</p>
        )}

        {aiError && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{aiError}</div>
        )}

        {/* AI Suggestion Preview */}
        {aiSuggestion && (
          <div className="bg-purple-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-purple-700 text-sm">AIの提案</h3>
            {aiSuggestion.days.map((daySugg) => (
              <div key={daySugg.day} className="flex items-start gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-xs flex-shrink-0 mt-0.5">
                  {DAY_LABELS[daySugg.day as DayOfWeek]}
                </span>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{daySugg.main}</p>
                  <p className="text-gray-500 text-xs">{daySugg.soup} / {daySugg.sides.join(', ')}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAcceptSuggestion}
                disabled={aiLoading}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                この献立にする
              </button>
              <button
                onClick={() => setAiSuggestion(null)}
                className="flex-1 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium border border-purple-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* Weekly Overview */}
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day) => {
            const item = menuItems.find((m) => m.day_of_week === day);
            const mainName = getRecipeName(item?.main_recipe_id ?? null);
            const soupName = getRecipeName(item?.soup_recipe_id ?? null);
            return (
              <div key={day} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                    {DAY_LABELS[day]}
                  </span>
                  <div className="flex-1 min-w-0">
                    {mainName ? (
                      <>
                        <p className="font-medium text-gray-900 truncate">{mainName}</p>
                        {soupName && (
                          <p className="text-xs text-gray-500 truncate">{soupName}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">未設定</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link
            href="/menu"
            className="flex-1 py-3 bg-orange-500 text-white text-center rounded-xl font-medium active:bg-orange-600"
          >
            献立を編集
          </Link>
          <Link
            href="/shopping"
            className="flex-1 py-3 bg-white text-orange-500 text-center rounded-xl font-medium border border-orange-500 active:bg-orange-50"
          >
            買い物リスト
          </Link>
        </div>
      </div>
    </div>
  );
}
