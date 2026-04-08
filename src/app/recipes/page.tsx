'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useRecipes } from '@/hooks/useRecipes';
import type { RecipeType } from '@/types';
import Link from 'next/link';

const tabs: { type: RecipeType; label: string }[] = [
  { type: 'main', label: 'メイン' },
  { type: 'soup', label: 'スープ' },
  { type: 'side', label: '副菜' },
];

const cuisineLabels: Record<string, string> = {
  japanese: '和食', western: '洋食', chinese: '中華', other: 'その他',
};

export default function RecipesPage() {
  const { recipes, loading } = useRecipes();
  const [activeTab, setActiveTab] = useState<RecipeType>('main');
  const [search, setSearch] = useState('');

  const filtered = recipes
    .filter((r) => r.type === activeTab)
    .filter((r) => r.name.includes(search));

  return (
    <div>
      <Header
        title="レシピ"
        rightAction={
          <Link href="/recipes/new" className="text-orange-500 font-medium text-sm">
            + 追加
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === tab.type
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="レシピを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Recipe List */}
      <div className="px-4 pb-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">レシピがありません</div>
        ) : (
          filtered.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{recipe.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {cuisineLabels[recipe.cuisine]} / {recipe.servings}人前 / 材料{recipe.ingredients.length}品
                  </p>
                </div>
                {!recipe.is_preset && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                    カスタム
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
