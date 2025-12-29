
import { createClient } from '@supabase/supabase-js';
import { RecipeResult, Comment } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 초기화
export const supabase = (supabaseUrl && supabaseKey && supabaseUrl !== "undefined" && supabaseUrl !== "") 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase 설정이 누락되었습니다. .env 또는 환경변수 설정을 확인하세요.");
}

/**
 * UTILS
 */
const base64ToBlob = (base64: string): Blob => {
  try {
    const parts = base64.split(';base64,');
    const contentType = parts.length > 1 ? parts[0].split(':')[1] : 'image/jpeg';
    const b64Data = parts.length > 1 ? parts[1] : parts[0];
    const raw = window.atob(b64Data);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (e) {
    console.error("Base64 decoding failed", e);
    return new Blob();
  }
};

const createThumbnail = (base64Str: string, maxWidth = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64Str);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const uploadImageToStorage = async (base64Image: string, prefix = 'full'): Promise<string | null> => {
  if (!supabase) return null;
  try {
    const blob = base64ToBlob(base64Image);
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, blob, { 
        contentType: 'image/jpeg', 
        upsert: false,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error(`[Storage Error] ${prefix}:`, uploadError);
      return null;
    }
    
    const { data: urlData } = supabase.storage.from('recipe-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (err) {
    console.error('[Storage Unexpected Error]:', err);
    return null;
  }
};

/**
 * AUTH
 */
export const signInWithGoogle = async () => {
  if (!supabase) return alert("Supabase 연결 설정이 필요합니다.");
  try {
    const currentUrl = window.location.origin + window.location.pathname;
    const { error } = await (supabase.auth as any).signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: currentUrl,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error) throw error;
  } catch (err: any) {
    console.error("Login Error:", err.message);
  }
};

export const signOut = async () => {
  if (supabase) await (supabase.auth as any).signOut();
};

/**
 * DB - RECIPES
 */
export const saveRecipeToDB = async (recipe: RecipeResult) => {
  if (!supabase) return null;
  try {
    let finalImageUrl = recipe.imageUrl;
    let finalThumbnailUrl = recipe.thumbnailUrl;

    // 이미지 업로드 로직 강화 (개별 업로드 오류 처리)
    if (recipe.imageUrl && recipe.imageUrl.startsWith('data:image')) {
      try {
        const thumbBase64 = await createThumbnail(recipe.imageUrl);
        const fullUrl = await uploadImageToStorage(recipe.imageUrl, 'full');
        const thumbUrl = await uploadImageToStorage(thumbBase64, 'thumb');
        
        if (fullUrl) finalImageUrl = fullUrl;
        if (thumbUrl) finalThumbnailUrl = thumbUrl;
        else if (fullUrl) finalThumbnailUrl = fullUrl; // 썸네일 실패 시 원본 사용
      } catch (imgErr) {
        console.warn("[DB] Image processing failed, using original base64 if available", imgErr);
      }
    }

    const recipeToSave = { 
      ...recipe, 
      imageUrl: finalImageUrl, 
      thumbnailUrl: finalThumbnailUrl 
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert([{
        dish_name: recipe.dishName,
        image_url: finalImageUrl,
        thumbnail_url: finalThumbnailUrl,
        comment: recipe.comment,
        full_json: recipeToSave,
        download_count: 0,
        rating_sum: 0,
        rating_count: 0,
        vote_success: 0,
        vote_fail: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('[DB Insert Error]:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Save Flow Failed]:', err);
    return null;
  }
};

export const fetchRecipeById = async (id: number): Promise<RecipeResult | null> => {
  if (!supabase || !id) return null;
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
  if (error || !data) return null;
  return { ...data.full_json, id: data.id, created_at: data.created_at } as RecipeResult;
};

export const fetchCommunityRecipes = async (
  search: string, 
  sortBy: 'latest' | 'rating' | 'success' | 'comments',
  page: number = 0,
  pageSize: number = 8
): Promise<RecipeResult[]> => {
  if (!supabase) return [];
  try {
    let query = supabase.from('recipes').select('*');
    if (search) query = query.ilike('dish_name', `%${search}%`);
    
    if (sortBy === 'rating') query = query.order('rating_sum', { ascending: false });
    else if (sortBy === 'success') query = query.order('vote_success', { ascending: false });
    else query = query.order('created_at', { ascending: false }).order('id', { ascending: false });

    const from = page * pageSize;
    const { data, error } = await query.range(from, from + pageSize - 1);
    
    if (error) return [];

    return data.map((row: any) => ({
      id: row.id,
      dishName: row.dish_name,
      imageUrl: row.image_url,
      thumbnailUrl: row.thumbnail_url || row.image_url,
      comment: row.comment,
      created_at: row.created_at,
      rating_sum: row.rating_sum,
      rating_count: row.rating_count,
      vote_success: row.vote_success,
      vote_fail: row.vote_fail
    } as RecipeResult));
  } catch (err) {
    return [];
  }
};

export const incrementDownloadCount = async (id: number) => {
  if (!id || !supabase) return;
  const { data: current } = await supabase.from('recipes').select('download_count').eq('id', id).single();
  if (current) await supabase.from('recipes').update({ download_count: (current.download_count || 0) + 1 }).eq('id', id);
};

export const updateRating = async (id: number, score: number) => {
  if (!id || !supabase) return;
  const { data: current } = await supabase.from('recipes').select('rating_sum, rating_count').eq('id', id).single();
  if (current) await supabase.from('recipes').update({ 
    rating_sum: (current.rating_sum || 0) + score, 
    rating_count: (current.rating_count || 0) + 1 
  }).eq('id', id);
};

export const updateVoteCounts = async (id: number, successDelta: number, failDelta: number) => {
  if (!id || !supabase) return;
  const { data: current } = await supabase.from('recipes').select('vote_success, vote_fail').eq('id', id).single();
  if (current) await supabase.from('recipes').update({ 
    vote_success: Math.max(0, (current.vote_success || 0) + successDelta), 
    vote_fail: Math.max(0, (current.vote_fail || 0) + failDelta) 
  }).eq('id', id);
};

export const fetchComments = async (recipeId: number): Promise<Comment[]> => {
  if (!supabase || !recipeId) return [];
  const { data, error } = await supabase.from('comments').select('*').eq('recipe_id', recipeId).order('created_at', { ascending: false });
  return error ? [] : data as Comment[];
};

export const addComment = async (recipeId: number, userId: string, userEmail: string, content: string): Promise<Comment | null> => {
  if (!supabase || !recipeId || !userId) return null;
  const { data, error } = await supabase.from('comments').insert([{ recipe_id: recipeId, user_id: userId, user_email: userEmail, content: content }]).select().single();
  return error ? null : data as Comment;
};
