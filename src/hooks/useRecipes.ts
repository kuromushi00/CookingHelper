'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Recipe, RecipeType } from '@/types';

export function useRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setRecipes((data as Recipe[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase
      .from('recipes')
      .insert({ ...recipe, user_id: user.id });
    if (!error) await fetchRecipes();
    return error;
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const { error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchRecipes();
    return error;
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    if (!error) await fetchRecipes();
    return error;
  };

  const getByType = (type: RecipeType) => recipes.filter((r) => r.type === type);

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, getByType, refetch: fetchRecipes };
}
