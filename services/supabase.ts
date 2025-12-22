
import { createClient, User } from '@supabase/supabase-js';
import { RecipeResult, Comment } from '../types';

// 환경 변수 가져오기
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * AUTHENTICATION
 */
export const signInWithGoogle = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // 로그인 후 현재 페이지로 복귀
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) console.error('Login failed:', error);
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

/**
 * DATABASE - RECIPES
 */
export const saveRecipeToDB = async (recipe: RecipeResult) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          dish_name: recipe.dishName,
          full_json: recipe,
          download_count: 0,
          rating_sum: 0,
          rating_count: 0,
          vote_success: 0,
          vote_fail: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error saving recipe:', err);
    return null;
  }
};

export const incrementDownloadCount = async (id: number) => {
  if (!id || !supabase) return;
  
  try {
    const { data: current } = await supabase
      .from('recipes')
      .select('download_count')
      .eq('id', id)
      .single();

    if (current) {
      await supabase
        .from('recipes')
        .update({ download_count: current.download_count + 1 })
        .eq('id', id);
    }
  } catch (err) {
    console.error('Error updating download count:', err);
  }
};

export const updateRating = async (id: number, score: number) => {
  if (!id || !supabase) return;

  try {
    const { data: current } = await supabase
      .from('recipes')
      .select('rating_sum, rating_count')
      .eq('id', id)
      .single();

    if (current) {
      await supabase
        .from('recipes')
        .update({ 
          rating_sum: current.rating_sum + score,
          rating_count: current.rating_count + 1
        })
        .eq('id', id);
    }
  } catch (err) {
    console.error('Error updating rating:', err);
  }
};

export const updateVote = async (id: number, type: 'success' | 'fail') => {
  if (!id || !supabase) return;

  const field = type === 'success' ? 'vote_success' : 'vote_fail';
  
  try {
    const { data: current } = await supabase
      .from('recipes')
      .select(field)
      .eq('id', id)
      .single();

    if (current) {
      await supabase
        .from('recipes')
        .update({ [field]: current[field] + 1 })
        .eq('id', id);
    }
  } catch (err) {
    console.error('Error updating vote:', err);
  }
};

/**
 * DATABASE - COMMENTS
 */
export const fetchComments = async (recipeId: number): Promise<Comment[]> => {
  if (!supabase || !recipeId) return [];
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data as Comment[];
};

export const addComment = async (recipeId: number, userId: string, userEmail: string, content: string): Promise<Comment | null> => {
  if (!supabase || !recipeId || !userId) return null;

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        recipe_id: recipeId,
        user_id: userId,
        user_email: userEmail,
        content: content
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  return data as Comment;
};
