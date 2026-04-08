// ---- Ingredient Category ----
export type IngredientCategory =
  | '野菜・果物'
  | '肉'
  | '魚'
  | '豆腐・乳製品'
  | '卵'
  | '米・麺・パン'
  | '調味料'
  | '乾物'
  | '冷凍食品'
  | '飲み物'
  | 'その他';

export const DEFAULT_CATEGORY_ORDER: IngredientCategory[] = [
  '野菜・果物',
  '肉',
  '魚',
  '豆腐・乳製品',
  '卵',
  '米・麺・パン',
  '調味料',
  '乾物',
  '冷凍食品',
  '飲み物',
  'その他',
];

// ---- Recipe ----
export type RecipeType = 'main' | 'soup' | 'side';
export type CuisineType = 'japanese' | 'western' | 'chinese' | 'other';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  type: RecipeType;
  cuisine: CuisineType;
  servings: number;
  ingredients: Ingredient[];
  is_preset: boolean;
  memo?: string;
  created_at: string;
}

// ---- Weekly Menu ----
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
  sun: '日',
};

export const DAYS_OF_WEEK: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export interface WeeklyMenuItem {
  id: string;
  user_id: string;
  week_start: string;
  day_of_week: DayOfWeek;
  main_recipe_id: string | null;
  soup_recipe_id: string | null;
  side_recipe_ids: string[];
  servings: number;
}

// ---- Shopping List ----
export interface ShoppingItem {
  id: string;
  user_id: string;
  week_start: string;
  ingredient_name: string;
  total_amount: number;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
  from_recipes: string[];
}

// ---- User Settings ----
export interface UserSettings {
  user_id: string;
  category_order: IngredientCategory[];
  default_servings: number;
}
