import type { CuisineType } from '@/types';

export const soupSuggestions: Record<CuisineType, string[]> = {
  japanese: ['味噌汁', '豚汁', 'けんちん汁', 'かきたま汁'],
  western: ['コーンスープ', 'ミネストローネ', 'トマトスープ', 'クラムチャウダー'],
  chinese: ['わかめスープ', '中華スープ', 'トマトスープ'],
  other: ['味噌汁', 'わかめスープ', 'コーンスープ'],
};

export const sideSuggestions: Record<CuisineType, string[]> = {
  japanese: ['ほうれん草のおひたし', 'きんぴらごぼう', 'ひじきの煮物', '冷奴', '酢の物', '浅漬け', '卵焼き'],
  western: ['コールスロー', 'マカロニサラダ'],
  chinese: ['ナムル', '酢の物', '冷奴'],
  other: ['卵焼き', '冷奴', 'コールスロー'],
};
