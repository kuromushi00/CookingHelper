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
  const [importingImage, setImportingImage] = useState(false);

  const handleImportImage = async (file: File) => {
    setImportingImage(true);
    setImportError('');
    try {
      // Resize image to reduce payload size
      const resized = await resizeImage(file, 1200);
      const res = await fetch('/api/import-recipe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: resized.base64, mediaType: resized.mediaType }),
      });
      if (!res.ok) throw new Error('画像の取り込みに失敗しました');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setName(data.name || '');
      setType(data.type || 'main');
      setCuisine(data.cuisine || 'japanese');
      setServings(data.servings || 2);
      setIngredients(data.ingredients || []);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setImportingImage(false);
    }
  };

  const resizeImage = (file: File, maxWidth: number): Promise<{ base64: string; mediaType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, mediaType: 'image/jpeg' });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
        {/* Image Import */}
        <div className="bg-green-50 rounded-xl p-4">
          <label className="block text-sm font-bold text-green-700 mb-2">写真からレシピを取り込む</label>
          <div className="flex gap-2">
            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition ${importingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-green-700">
                {importingImage ? '読み取り中...' : '写真を撮る / 選択'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportImage(file);
                  e.target.value = '';
                }}
                disabled={importingImage}
              />
            </label>
          </div>
          {importingImage && <p className="text-green-600 text-xs mt-2">画像を解析しています...</p>}
        </div>

        {/* URL Import */}
        <div className="bg-purple-50 rounded-xl p-4">
          <label className="block text-sm font-bold text-purple-700 mb-2">URLからレシピを取り込む</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="レシピURL（cookpad, YouTube, Instagram等）"
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
          {importUrl && /youtube\.com|youtu\.be/.test(importUrl) && (
            <p className="text-purple-600 text-xs mt-1">YouTube動画の字幕・説明文からレシピを取り込みます</p>
          )}
          {importUrl && /instagram\.com/.test(importUrl) && (
            <p className="text-purple-600 text-xs mt-1">Instagramの投稿からレシピを取り込みます</p>
          )}
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
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 relative">
                <button
                  onClick={() => {
                    const newIngredients = [...ingredients];
                    newIngredients.splice(i, 1);
                    setIngredients(newIngredients);
                  }}
                  className="absolute top-1 right-1 text-gray-400 w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-200 text-lg"
                >
                  ×
                </button>
                <div className="flex gap-2 mb-2 pr-7">
                  <input
                    type="text"
                    placeholder="材料名"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="量"
                    value={ing.amount || ''}
                    onChange={(e) => updateIngredient(i, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="単位"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                    className="w-20 px-3 py-2 border rounded-lg text-sm"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => updateIngredient(i, 'category', e.target.value)}
                    className="flex-1 px-2 py-2 border rounded-lg text-sm"
                  >
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
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
