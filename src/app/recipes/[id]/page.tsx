'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useRecipes } from '@/hooks/useRecipes';
import type { Recipe, Ingredient, RecipeType, CuisineType, IngredientCategory } from '@/types';

const typeOptions: { value: RecipeType; label: string }[] = [
  { value: 'main', label: 'メイン' },
  { value: 'soup', label: 'スープ' },
  { value: 'side', label: '副菜' },
];

const cuisineOptions: { value: CuisineType; label: string }[] = [
  { value: 'japanese', label: '和食' },
  { value: 'western', label: '洋食' },
  { value: 'chinese', label: '中華' },
  { value: 'other', label: 'その他' },
];

const categoryOptions: IngredientCategory[] = [
  '野菜・果物', '肉', '魚', '豆腐・乳製品', '卵', '米・麺・パン', '調味料', '乾物', '冷凍食品', '飲み物', 'その他',
];

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { recipes, updateRecipe, deleteRecipe, loading } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Recipe>>({});

  useEffect(() => {
    const found = recipes.find((r) => r.id === params.id);
    if (found) {
      setRecipe(found);
      setEditData(found);
    }
  }, [recipes, params.id]);

  if (loading || !recipe) {
    return (
      <div>
        <Header title="レシピ詳細" />
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateRecipe(recipe.id, editData);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('このレシピを削除しますか？')) {
      await deleteRecipe(recipe.id);
      router.push('/recipes');
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const ingredients = [...(editData.ingredients || [])];
    ingredients[index] = { ...ingredients[index], [field]: value };
    setEditData({ ...editData, ingredients });
  };

  const addIngredient = () => {
    const ingredients = [...(editData.ingredients || [])];
    ingredients.push({ name: '', amount: 0, unit: '', category: 'その他' });
    setEditData({ ...editData, ingredients });
  };

  const removeIngredient = (index: number) => {
    const ingredients = [...(editData.ingredients || [])];
    ingredients.splice(index, 1);
    setEditData({ ...editData, ingredients });
  };

  const cuisineLabel = cuisineOptions.find(c => c.value === recipe.cuisine)?.label || '';
  const typeLabel = typeOptions.find(t => t.value === recipe.type)?.label || '';

  return (
    <div>
      <Header
        title={editing ? 'レシピ編集' : recipe.name}
        rightAction={
          !editing ? (
            <button onClick={() => setEditing(true)} className="text-orange-500 font-medium text-sm">
              編集
            </button>
          ) : (
            <button onClick={handleSave} className="text-orange-500 font-medium text-sm">
              保存
            </button>
          )
        }
      />

      <div className="px-4 py-4 space-y-4">
        {editing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
                <select
                  value={editData.type || 'main'}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value as RecipeType })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                <select
                  value={editData.cuisine || 'japanese'}
                  onChange={(e) => setEditData({ ...editData, cuisine: e.target.value as CuisineType })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {cuisineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="w-20">
                <label className="block text-sm font-medium text-gray-700 mb-1">人数</label>
                <input
                  type="number"
                  value={editData.servings || 2}
                  onChange={(e) => setEditData({ ...editData, servings: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">材料</label>
              <div className="space-y-2">
                {(editData.ingredients || []).map((ing, i) => (
                  <div key={i} className="flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="名前"
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="量"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(i, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="単位"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                      className="w-16 px-2 py-1.5 border rounded text-sm"
                    />
                    <select
                      value={ing.category}
                      onChange={(e) => updateIngredient(i, 'category', e.target.value)}
                      className="w-24 px-1 py-1.5 border rounded text-xs"
                    >
                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => removeIngredient(i)} className="text-red-400 text-lg px-1">×</button>
                  </div>
                ))}
              </div>
              <button
                onClick={addIngredient}
                className="mt-2 text-sm text-orange-500 hover:underline"
              >
                + 材料を追加
              </button>
            </div>

            {!recipe.is_preset && (
              <button
                onClick={handleDelete}
                className="w-full py-2 text-red-500 border border-red-300 rounded-lg text-sm"
              >
                このレシピを削除
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2 text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded">{typeLabel}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">{cuisineLabel}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">{recipe.servings}人前</span>
            </div>

            {recipe.memo && (
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{recipe.memo}</p>
            )}

            <div>
              <h2 className="font-medium text-gray-900 mb-2">材料</h2>
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-900">{ing.name}</span>
                    <span className="text-gray-500">{ing.amount} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
