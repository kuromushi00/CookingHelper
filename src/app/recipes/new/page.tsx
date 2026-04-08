'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useRecipes } from '@/hooks/useRecipes';
import type { Ingredient, RecipeType, CuisineType, IngredientCategory } from '@/types';

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

export default function NewRecipePage() {
  const router = useRouter();
  const { addRecipe } = useRecipes();
  const [name, setName] = useState('');
  const [type, setType] = useState<RecipeType>('main');
  const [cuisine, setCuisine] = useState<CuisineType>('japanese');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: 0, unit: '', category: 'その他' },
  ]);
  const [saving, setSaving] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      if (!res.ok) throw new Error('取り込みに失敗しました');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setName(data.name || '');
      setType(data.type || 'main');
      setCuisine(data.cuisine || 'japanese');
      setServings(data.servings || 2);
      setIngredients(data.ingredients || []);
      setImportUrl('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setImporting(false);
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    await addRecipe({
      name: name.trim(),
      type,
      cuisine,
      servings,
      ingredients: validIngredients,
      is_preset: false,
    });
    router.push('/recipes');
  };

  return (
    <div>
      <Header
        title="レシピ追加"
        rightAction={
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="text-orange-500 font-medium text-sm disabled:opacity-50"
          >
            保存
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* URL Import */}
        <div className="bg-purple-50 rounded-xl p-4">
          <label className="block text-sm font-bold text-purple-700 mb-2">URLからレシピを取り込む</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://cookpad.com/recipe/..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleImportUrl}
              disabled={importing || !importUrl.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
            >
              {importing ? '取込中...' : '取り込み'}
            </button>
          </div>
          {importError && <p className="text-red-500 text-xs mt-1">{importError}</p>}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-gray-50 px-2 text-gray-400">または手動入力</span></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">レシピ名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: チキンカツ"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RecipeType)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value as CuisineType)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {cuisineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="w-20">
            <label className="block text-sm font-medium text-gray-700 mb-1">人数</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 2)}
              className="w-full px-3 py-2 border rounded-lg"
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">材料</label>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
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
                  value={ing.amount || ''}
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
                <button
                  onClick={() => {
                    const newIngredients = [...ingredients];
                    newIngredients.splice(i, 1);
                    setIngredients(newIngredients);
                  }}
                  className="text-red-400 text-lg px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIngredients([...ingredients, { name: '', amount: 0, unit: '', category: 'その他' }])}
            className="mt-2 text-sm text-orange-500 hover:underline"
          >
            + 材料を追加
          </button>
        </div>
      </div>
    </div>
  );
}
