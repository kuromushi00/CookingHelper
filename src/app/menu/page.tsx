'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { useWeeklyMenu } from '@/hooks/useWeeklyMenu';
import { useRecipes } from '@/hooks/useRecipes';
import { getWeekStart, formatDate, getWeekEndDate } from '@/lib/utils';
import { DAY_LABELS, DAYS_OF_WEEK } from '@/types';
import type { DayOfWeek, Recipe, RecipeType } from '@/types';
import { soupSuggestions, sideSuggestions } from '@/data/cuisineRules';

export default function MenuPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return getWeekStart(d);
  }, [weekOffset]);

  const { menuItems, setMeal, clearDay } = useWeeklyMenu(weekStart);
  const { recipes } = useRecipes();
  const [pickerOpen, setPickerOpen] = useState<{ day: DayOfWeek; slot: 'main' | 'soup' | 'side' } | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const getRecipe = (id: string | null): Recipe | undefined => {
    if (!id) return undefined;
    return recipes.find((r) => r.id === id);
  };

  const getSuggestions = (day: DayOfWeek, slot: 'soup' | 'side'): Recipe[] => {
    const item = menuItems.find((m) => m.day_of_week === day);
    const mainRecipe = getRecipe(item?.main_recipe_id ?? null);
    if (!mainRecipe) return [];

    const names = slot === 'soup'
      ? soupSuggestions[mainRecipe.cuisine] || []
      : sideSuggestions[mainRecipe.cuisine] || [];

    return recipes.filter((r) => names.includes(r.name));
  };

  const getPickerRecipes = (): Recipe[] => {
    if (!pickerOpen) return [];
    const typeMap: Record<string, RecipeType> = { main: 'main', soup: 'soup', side: 'side' };
    const type = typeMap[pickerOpen.slot];
    return recipes
      .filter((r) => r.type === type)
      .filter((r) => r.name.includes(pickerSearch));
  };

  const handleSelect = async (recipe: Recipe) => {
    if (!pickerOpen) return;
    const { day, slot } = pickerOpen;
    const item = menuItems.find((m) => m.day_of_week === day);

    if (slot === 'main') {
      await setMeal(day, { main_recipe_id: recipe.id });
    } else if (slot === 'soup') {
      await setMeal(day, { soup_recipe_id: recipe.id });
    } else {
      const currentSides = item?.side_recipe_ids || [];
      if (!currentSides.includes(recipe.id)) {
        await setMeal(day, { side_recipe_ids: [...currentSides, recipe.id] });
      }
    }
    setPickerOpen(null);
    setPickerSearch('');
  };

  const handleRemove = async (day: DayOfWeek, slot: 'main' | 'soup' | 'side', sideId?: string) => {
    const item = menuItems.find((m) => m.day_of_week === day);
    if (slot === 'main') {
      await setMeal(day, { main_recipe_id: null, soup_recipe_id: null, side_recipe_ids: [] });
    } else if (slot === 'soup') {
      await setMeal(day, { soup_recipe_id: null });
    } else if (sideId && item) {
      await setMeal(day, { side_recipe_ids: item.side_recipe_ids.filter((id) => id !== sideId) });
    }
  };

  return (
    <div>
      <Header title="献立" />

      {/* Week selector */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="text-orange-500 text-lg px-2">&lt;</button>
        <span className="text-sm font-medium text-gray-700">
          {formatDate(weekStart)} 〜 {formatDate(getWeekEndDate(weekStart))}
        </span>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="text-orange-500 text-lg px-2">&gt;</button>
      </div>

      {/* Days */}
      <div className="px-4 pb-4 space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const item = menuItems.find((m) => m.day_of_week === day);
          const mainRecipe = getRecipe(item?.main_recipe_id ?? null);
          const soupRecipe = getRecipe(item?.soup_recipe_id ?? null);
          const sideRecipes = (item?.side_recipe_ids || []).map((id) => getRecipe(id)).filter(Boolean) as Recipe[];
          const soupSuggs = mainRecipe ? getSuggestions(day, 'soup') : [];
          const sideSuggs = mainRecipe ? getSuggestions(day, 'side') : [];

          return (
            <div key={day} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                  {DAY_LABELS[day]}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {mainRecipe ? mainRecipe.name : ''}
                </span>
              </div>

              {/* Main */}
              <div className="space-y-2">
                {mainRecipe ? (
                  <div className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                    <span className="text-sm">
                      <span className="text-xs text-orange-500 mr-1">メイン</span>
                      {mainRecipe.name}
                    </span>
                    <button onClick={() => handleRemove(day, 'main')} className="text-gray-400 text-sm">×</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickerOpen({ day, slot: 'main' })}
                    className="w-full py-2 text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg"
                  >
                    + メイン料理を選択
                  </button>
                )}

                {/* Soup */}
                {mainRecipe && (
                  soupRecipe ? (
                    <div className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                      <span className="text-sm">
                        <span className="text-xs text-yellow-600 mr-1">スープ</span>
                        {soupRecipe.name}
                      </span>
                      <button onClick={() => handleRemove(day, 'soup')} className="text-gray-400 text-sm">×</button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setPickerOpen({ day, slot: 'soup' })}
                        className="w-full py-2 text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg"
                      >
                        + スープを選択
                      </button>
                      {soupSuggs.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {soupSuggs.slice(0, 3).map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setMeal(day, { soup_recipe_id: s.id })}
                              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full"
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Sides */}
                {mainRecipe && (
                  <>
                    {sideRecipes.map((side) => (
                      <div key={side.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                        <span className="text-sm">
                          <span className="text-xs text-green-600 mr-1">副菜</span>
                          {side.name}
                        </span>
                        <button onClick={() => handleRemove(day, 'side', side.id)} className="text-gray-400 text-sm">×</button>
                      </div>
                    ))}
                    <div>
                      <button
                        onClick={() => setPickerOpen({ day, slot: 'side' })}
                        className="w-full py-1.5 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg"
                      >
                        + 副菜を追加
                      </button>
                      {sideRecipes.length === 0 && sideSuggs.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {sideSuggs.slice(0, 3).map((s) => (
                            <button
                              key={s.id}
                              onClick={async () => {
                                const currentSides = item?.side_recipe_ids || [];
                                await setMeal(day, { side_recipe_ids: [...currentSides, s.id] });
                              }}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">
                {pickerOpen.slot === 'main' ? 'メイン' : pickerOpen.slot === 'soup' ? 'スープ' : '副菜'}を選択
              </h3>
              <button onClick={() => { setPickerOpen(null); setPickerSearch(''); }} className="text-gray-400 text-lg">×</button>
            </div>
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="検索..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4">
              {getPickerRecipes().map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelect(recipe)}
                  className="w-full text-left py-3 border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900">{recipe.name}</p>
                  <p className="text-xs text-gray-500">{recipe.servings}人前</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
