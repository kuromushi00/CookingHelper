import type { Recipe } from '@/types';

type PresetRecipe = Omit<Recipe, 'id' | 'user_id' | 'created_at'>;

export const defaultRecipes: PresetRecipe[] = [
  // ==================== メイン料理 (20品) ====================
  {
    name: 'カレーライス', type: 'main', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '玉ねぎ', amount: 2, unit: '個', category: '野菜・果物' },
      { name: 'にんじん', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'じゃがいも', amount: 3, unit: '個', category: '野菜・果物' },
      { name: '豚肉', amount: 300, unit: 'g', category: '肉' },
      { name: 'カレールー', amount: 1, unit: '箱', category: '調味料' },
      { name: 'サラダ油', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '肉じゃが', type: 'main', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '牛肉薄切り', amount: 200, unit: 'g', category: '肉' },
      { name: 'じゃがいも', amount: 4, unit: '個', category: '野菜・果物' },
      { name: '玉ねぎ', amount: 1, unit: '個', category: '野菜・果物' },
      { name: 'にんじん', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'しらたき', amount: 1, unit: '袋', category: 'その他' },
      { name: '醤油', amount: 3, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 1, unit: '大さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: '生姜焼き', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '豚ロース薄切り', amount: 300, unit: 'g', category: '肉' },
      { name: '玉ねぎ', amount: 1, unit: '個', category: '野菜・果物' },
      { name: '生姜', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '酒', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '鶏の唐揚げ', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '鶏もも肉', amount: 400, unit: 'g', category: '肉' },
      { name: '生姜', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: 'にんにく', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '酒', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '片栗粉', amount: 50, unit: 'g', category: '調味料' },
      { name: 'サラダ油', amount: 500, unit: 'ml', category: '調味料' },
    ],
  },
  {
    name: 'ハンバーグ', type: 'main', cuisine: 'western', servings: 4, is_preset: true,
    ingredients: [
      { name: '合い挽き肉', amount: 400, unit: 'g', category: '肉' },
      { name: '玉ねぎ', amount: 1, unit: '個', category: '野菜・果物' },
      { name: 'パン粉', amount: 30, unit: 'g', category: '乾物' },
      { name: '卵', amount: 1, unit: '個', category: '卵' },
      { name: '牛乳', amount: 50, unit: 'ml', category: '豆腐・乳製品' },
      { name: 'ケチャップ', amount: 3, unit: '大さじ', category: '調味料' },
      { name: 'ウスターソース', amount: 2, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '焼き魚（鮭）', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '鮭切り身', amount: 2, unit: '切', category: '魚' },
      { name: '塩', amount: 1, unit: '少々', category: '調味料' },
      { name: '大根', amount: 5, unit: 'cm', category: '野菜・果物' },
      { name: 'レモン', amount: 0.5, unit: '個', category: '野菜・果物' },
    ],
  },
  {
    name: '親子丼', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '鶏もも肉', amount: 200, unit: 'g', category: '肉' },
      { name: '玉ねぎ', amount: 1, unit: '個', category: '野菜・果物' },
      { name: '卵', amount: 4, unit: '個', category: '卵' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: '麻婆豆腐', type: 'main', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: '豆腐', amount: 1, unit: '丁', category: '豆腐・乳製品' },
      { name: '豚ひき肉', amount: 150, unit: 'g', category: '肉' },
      { name: 'ねぎ', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'にんにく', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '豆板醤', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '醤油', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '片栗粉', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '野菜炒め', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'キャベツ', amount: 0.25, unit: '玉', category: '野菜・果物' },
      { name: 'もやし', amount: 1, unit: '袋', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ピーマン', amount: 2, unit: '個', category: '野菜・果物' },
      { name: '豚バラ薄切り', amount: 150, unit: 'g', category: '肉' },
      { name: '塩こしょう', amount: 1, unit: '適量', category: '調味料' },
      { name: '醤油', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'チキン南蛮', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '鶏むね肉', amount: 300, unit: 'g', category: '肉' },
      { name: '卵', amount: 2, unit: '個', category: '卵' },
      { name: '小麦粉', amount: 50, unit: 'g', category: '調味料' },
      { name: '酢', amount: 3, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'マヨネーズ', amount: 3, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '煮込みうどん', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'うどん', amount: 2, unit: '玉', category: '米・麺・パン' },
      { name: '鶏もも肉', amount: 150, unit: 'g', category: '肉' },
      { name: 'ねぎ', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'しいたけ', amount: 2, unit: '個', category: '野菜・果物' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 1, unit: '大さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: '回鍋肉', type: 'main', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: '豚バラ薄切り', amount: 200, unit: 'g', category: '肉' },
      { name: 'キャベツ', amount: 0.25, unit: '玉', category: '野菜・果物' },
      { name: 'ピーマン', amount: 2, unit: '個', category: '野菜・果物' },
      { name: 'にんにく', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '甜麺醤', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '豆板醤', amount: 1, unit: '小さじ', category: '調味料' },
      { name: '醤油', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '筑前煮', type: 'main', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '鶏もも肉', amount: 300, unit: 'g', category: '肉' },
      { name: 'れんこん', amount: 1, unit: '節', category: '野菜・果物' },
      { name: 'ごぼう', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'にんじん', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'こんにゃく', amount: 1, unit: '枚', category: 'その他' },
      { name: 'しいたけ', amount: 4, unit: '個', category: '野菜・果物' },
      { name: '醤油', amount: 3, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '鯖の味噌煮', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '鯖切り身', amount: 2, unit: '切', category: '魚' },
      { name: '味噌', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '生姜', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '酒', amount: 2, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'オムライス', type: 'main', cuisine: 'western', servings: 2, is_preset: true,
    ingredients: [
      { name: '鶏もも肉', amount: 150, unit: 'g', category: '肉' },
      { name: '玉ねぎ', amount: 0.5, unit: '個', category: '野菜・果物' },
      { name: '卵', amount: 4, unit: '個', category: '卵' },
      { name: 'ケチャップ', amount: 4, unit: '大さじ', category: '調味料' },
      { name: 'ご飯', amount: 2, unit: '膳', category: '米・麺・パン' },
      { name: 'バター', amount: 20, unit: 'g', category: '豆腐・乳製品' },
    ],
  },
  {
    name: '豚の角煮', type: 'main', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '豚バラブロック', amount: 500, unit: 'g', category: '肉' },
      { name: 'ねぎ', amount: 1, unit: '本', category: '野菜・果物' },
      { name: '生姜', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '醤油', amount: 4, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 3, unit: '大さじ', category: '調味料' },
      { name: '酒', amount: 100, unit: 'ml', category: '調味料' },
    ],
  },
  {
    name: 'エビチリ', type: 'main', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'エビ', amount: 200, unit: 'g', category: '魚' },
      { name: 'ねぎ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'にんにく', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: '生姜', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: 'ケチャップ', amount: 3, unit: '大さじ', category: '調味料' },
      { name: '豆板醤', amount: 1, unit: '小さじ', category: '調味料' },
      { name: '片栗粉', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '青椒肉絲', type: 'main', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: '牛肉薄切り', amount: 200, unit: 'g', category: '肉' },
      { name: 'ピーマン', amount: 4, unit: '個', category: '野菜・果物' },
      { name: 'たけのこ水煮', amount: 100, unit: 'g', category: '野菜・果物' },
      { name: 'オイスターソース', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '醤油', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '酒', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '片栗粉', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'パスタ（ミートソース）', type: 'main', cuisine: 'western', servings: 2, is_preset: true,
    ingredients: [
      { name: 'スパゲッティ', amount: 200, unit: 'g', category: '米・麺・パン' },
      { name: '合い挽き肉', amount: 200, unit: 'g', category: '肉' },
      { name: '玉ねぎ', amount: 1, unit: '個', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'トマト缶', amount: 1, unit: '缶', category: '乾物' },
      { name: 'にんにく', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: 'コンソメ', amount: 1, unit: '個', category: '調味料' },
    ],
  },
  {
    name: '焼きそば', type: 'main', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '焼きそば麺', amount: 2, unit: '玉', category: '米・麺・パン' },
      { name: '豚バラ薄切り', amount: 100, unit: 'g', category: '肉' },
      { name: 'キャベツ', amount: 0.25, unit: '玉', category: '野菜・果物' },
      { name: 'もやし', amount: 1, unit: '袋', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ソース', amount: 3, unit: '大さじ', category: '調味料' },
    ],
  },

  // ==================== スープ・汁物 (10品) ====================
  {
    name: '味噌汁', type: 'soup', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '豆腐', amount: 0.5, unit: '丁', category: '豆腐・乳製品' },
      { name: 'わかめ', amount: 5, unit: 'g', category: '乾物' },
      { name: 'ねぎ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: '味噌', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: '豚汁', type: 'soup', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '豚バラ薄切り', amount: 100, unit: 'g', category: '肉' },
      { name: '大根', amount: 5, unit: 'cm', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ごぼう', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'こんにゃく', amount: 0.5, unit: '枚', category: 'その他' },
      { name: '味噌', amount: 3, unit: '大さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: 'けんちん汁', type: 'soup', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '豆腐', amount: 0.5, unit: '丁', category: '豆腐・乳製品' },
      { name: '大根', amount: 5, unit: 'cm', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ごぼう', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ねぎ', amount: 1, unit: '本', category: '野菜・果物' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
      { name: 'ごま油', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'かきたま汁', type: 'soup', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '卵', amount: 1, unit: '個', category: '卵' },
      { name: 'ねぎ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: '醤油', amount: 1, unit: '小さじ', category: '調味料' },
      { name: 'だしの素', amount: 1, unit: '小さじ', category: '調味料' },
      { name: '片栗粉', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: 'わかめスープ', type: 'soup', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'わかめ', amount: 5, unit: 'g', category: '乾物' },
      { name: 'ねぎ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: '鶏がらスープの素', amount: 1, unit: '小さじ', category: '調味料' },
      { name: 'ごま油', amount: 1, unit: '小さじ', category: '調味料' },
      { name: '白ごま', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: 'コーンスープ', type: 'soup', cuisine: 'western', servings: 2, is_preset: true,
    ingredients: [
      { name: 'コーンクリーム缶', amount: 1, unit: '缶', category: '乾物' },
      { name: '牛乳', amount: 200, unit: 'ml', category: '豆腐・乳製品' },
      { name: 'コンソメ', amount: 1, unit: '個', category: '調味料' },
      { name: 'バター', amount: 10, unit: 'g', category: '豆腐・乳製品' },
    ],
  },
  {
    name: 'ミネストローネ', type: 'soup', cuisine: 'western', servings: 4, is_preset: true,
    ingredients: [
      { name: '玉ねぎ', amount: 1, unit: '個', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'セロリ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ベーコン', amount: 50, unit: 'g', category: '肉' },
      { name: 'トマト缶', amount: 1, unit: '缶', category: '乾物' },
      { name: 'コンソメ', amount: 1, unit: '個', category: '調味料' },
    ],
  },
  {
    name: '中華スープ', type: 'soup', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: '卵', amount: 1, unit: '個', category: '卵' },
      { name: 'ねぎ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'わかめ', amount: 3, unit: 'g', category: '乾物' },
      { name: '鶏がらスープの素', amount: 1, unit: '小さじ', category: '調味料' },
      { name: 'ごま油', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: 'トマトスープ', type: 'soup', cuisine: 'western', servings: 2, is_preset: true,
    ingredients: [
      { name: 'トマト缶', amount: 0.5, unit: '缶', category: '乾物' },
      { name: '玉ねぎ', amount: 0.5, unit: '個', category: '野菜・果物' },
      { name: 'にんにく', amount: 1, unit: 'かけ', category: '野菜・果物' },
      { name: 'コンソメ', amount: 1, unit: '個', category: '調味料' },
      { name: 'オリーブオイル', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'クラムチャウダー', type: 'soup', cuisine: 'western', servings: 2, is_preset: true,
    ingredients: [
      { name: 'あさり水煮缶', amount: 1, unit: '缶', category: '魚' },
      { name: '玉ねぎ', amount: 0.5, unit: '個', category: '野菜・果物' },
      { name: 'じゃがいも', amount: 1, unit: '個', category: '野菜・果物' },
      { name: 'ベーコン', amount: 30, unit: 'g', category: '肉' },
      { name: '牛乳', amount: 300, unit: 'ml', category: '豆腐・乳製品' },
      { name: 'バター', amount: 15, unit: 'g', category: '豆腐・乳製品' },
      { name: '小麦粉', amount: 1, unit: '大さじ', category: '調味料' },
      { name: 'コンソメ', amount: 1, unit: '個', category: '調味料' },
    ],
  },

  // ==================== 副菜 (10品) ====================
  {
    name: '卵焼き', type: 'side', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '卵', amount: 3, unit: '個', category: '卵' },
      { name: '砂糖', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '醤油', amount: 1, unit: '小さじ', category: '調味料' },
      { name: 'だしの素', amount: 0.5, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: 'ほうれん草のおひたし', type: 'side', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'ほうれん草', amount: 1, unit: '束', category: '野菜・果物' },
      { name: '醤油', amount: 1, unit: '大さじ', category: '調味料' },
      { name: 'かつお節', amount: 3, unit: 'g', category: '乾物' },
    ],
  },
  {
    name: 'きんぴらごぼう', type: 'side', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'ごぼう', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: '醤油', amount: 1, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 1, unit: '大さじ', category: '調味料' },
      { name: 'ごま油', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '白ごま', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'ひじきの煮物', type: 'side', cuisine: 'japanese', servings: 4, is_preset: true,
    ingredients: [
      { name: '乾燥ひじき', amount: 15, unit: 'g', category: '乾物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: '油揚げ', amount: 1, unit: '枚', category: '豆腐・乳製品' },
      { name: '醤油', amount: 2, unit: '大さじ', category: '調味料' },
      { name: 'みりん', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: '冷奴', type: 'side', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: '豆腐', amount: 1, unit: '丁', category: '豆腐・乳製品' },
      { name: 'ねぎ', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: '生姜', amount: 0.5, unit: 'かけ', category: '野菜・果物' },
      { name: '醤油', amount: 1, unit: '適量', category: '調味料' },
      { name: 'かつお節', amount: 3, unit: 'g', category: '乾物' },
    ],
  },
  {
    name: '酢の物', type: 'side', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'きゅうり', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'わかめ', amount: 5, unit: 'g', category: '乾物' },
      { name: '酢', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '砂糖', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '醤油', amount: 1, unit: '小さじ', category: '調味料' },
    ],
  },
  {
    name: 'コールスロー', type: 'side', cuisine: 'western', servings: 2, is_preset: true,
    ingredients: [
      { name: 'キャベツ', amount: 0.25, unit: '玉', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'コーン缶', amount: 50, unit: 'g', category: '乾物' },
      { name: 'マヨネーズ', amount: 2, unit: '大さじ', category: '調味料' },
      { name: '酢', amount: 1, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'マカロニサラダ', type: 'side', cuisine: 'western', servings: 4, is_preset: true,
    ingredients: [
      { name: 'マカロニ', amount: 100, unit: 'g', category: '米・麺・パン' },
      { name: 'きゅうり', amount: 1, unit: '本', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ハム', amount: 4, unit: '枚', category: '肉' },
      { name: 'マヨネーズ', amount: 4, unit: '大さじ', category: '調味料' },
    ],
  },
  {
    name: 'ナムル', type: 'side', cuisine: 'chinese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'もやし', amount: 1, unit: '袋', category: '野菜・果物' },
      { name: 'ほうれん草', amount: 0.5, unit: '束', category: '野菜・果物' },
      { name: 'にんじん', amount: 0.5, unit: '本', category: '野菜・果物' },
      { name: 'ごま油', amount: 1, unit: '大さじ', category: '調味料' },
      { name: '鶏がらスープの素', amount: 1, unit: '小さじ', category: '調味料' },
      { name: 'にんにく', amount: 0.5, unit: 'かけ', category: '野菜・果物' },
    ],
  },
  {
    name: '浅漬け', type: 'side', cuisine: 'japanese', servings: 2, is_preset: true,
    ingredients: [
      { name: 'きゅうり', amount: 2, unit: '本', category: '野菜・果物' },
      { name: '白菜', amount: 2, unit: '枚', category: '野菜・果物' },
      { name: '塩', amount: 1, unit: '小さじ', category: '調味料' },
      { name: '昆布', amount: 5, unit: 'cm', category: '乾物' },
    ],
  },
];
