
import { createClient } from '@supabase/supabase-js';
import { RecipeResult, Comment } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 초기화 및 상태 체크
export const supabase = (supabaseUrl && supabaseKey && supabaseUrl !== "undefined") 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!supabase) {
  console.error("⚠️ Supabase 환경 변수가 설정되지 않았거나 유효하지 않습니다. VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY를 확인하세요.");
}

/**
 * UTILS
 */
const base64ToBlob = (base64: string): Blob => {
  try {
    const parts = base64.split(';base64,');
    if (parts.length < 2) return new Blob();
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (e) {
    console.error("Base64 to Blob failed", e);
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
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const uploadImageToStorage = async (base64Image: string, prefix = 'full'): Promise<string | null> => {
  if (!supabase) return null;
  try {
    const blob = base64ToBlob(base64Image);
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error('Upload Error:', err);
    return null;
  }
};

/**
 * AUTH
 */
export const signInWithGoogle = async () => {
  if (!supabase) {
    alert("Supabase 연결 설정이 되어 있지 않습니다.");
    return;
  }
  try {
    const { error } = await (supabase.auth as any).signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin, 
        queryParams: { access_type: 'offline', prompt: 'consent' } 
      },
    });
    if (error) throw error;
  } catch (err) {
    console.error("Login Error:", err);
    alert("로그인 시도 중 오류가 발생했습니다.");
  }
};

export const signOut = async () => {
  if (!supabase) return;
  await (supabase.auth as any).signOut();
};

export const getCurrentUser = async (): Promise<any | null> => {
  if (!supabase) return null;
  const { data: { session } } = await (supabase.auth as any).getSession();
  return session?.user || null;
};

/**
 * DB - RECIPES
 */
export const saveRecipeToDB = async (recipe: RecipeResult) => {
  if (!supabase) return null;
  try {
    let finalImageUrl = recipe.imageUrl;
    let finalThumbnailUrl = undefined;

    if (recipe.imageUrl && recipe.imageUrl.startsWith('data:image')) {
      const thumbBase64 = await createThumbnail(recipe.imageUrl);
      const [fullUrl, thumbUrl] = await Promise.all([
        uploadImageToStorage(recipe.imageUrl, 'full'),
        uploadImageToStorage(thumbBase64, 'thumb')
      ]);
      if (fullUrl) finalImageUrl = fullUrl;
      if (thumbUrl) finalThumbnailUrl = thumbUrl;
    }

    const recipeToSave = { ...recipe, imageUrl: finalImageUrl, thumbnailUrl: finalThumbnailUrl };
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
      .select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Save DB Error:', err);
    return null;
  }
};

export const fetchRecipeById = async (id: number): Promise<RecipeResult | null> => {
  if (!supabase || !id) return null;
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
  if (error || !data) return null;

  return {
    ...data.full_json,
    id: data.id,
    created_at: data.created_at,
    rating_sum: data.rating_sum,
    rating_count: data.rating_count,
    download_count: data.download_count,
    vote_success: data.vote_success,
    vote_fail: data.vote_fail
  } as RecipeResult;
};

export const fetchCommunityRecipes = async (
  search: string, 
  sortBy: 'latest' | 'rating' | 'success' | 'comments',
  page: number = 0,
  pageSize: number = 8
): Promise<RecipeResult[]> => {
  if (!supabase) return [];
  
  try {
    // 1단계: 기본 쿼리 구성 (관계성 쿼리 comments(count)는 DB 설정에 따라 실패할 수 있으므로 주의)
    let query = supabase.from('recipes').select(`
      id, 
      dish_name, 
      image_url, 
      thumbnail_url, 
      comment, 
      created_at, 
      rating_sum, 
      rating_count, 
      vote_success, 
      vote_fail, 
      download_count
    `);

    if (search) query = query.ilike('dish_name', `%${search}%`);
    
    // 2단계: 정렬 적용
    if (sortBy === 'rating') {
      // 별점 평균(sum/count)을 바로 정렬할 수 없으므로 보통 sum 기준 정렬
      query = query.order('rating_sum', { ascending: false });
    } else if (sortBy === 'success') {
      query = query.order('vote_success', { ascending: false });
    } else if (sortBy === 'comments') {
      // 댓글순 정렬은 Join 이슈가 있을 수 있어 기본적으로 최신순으로 대체하거나 추후 보강
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
    }

    const from = page * pageSize;
    const { data, error } = await query.range(from, from + pageSize - 1);
    
    if (error) {
      console.error("Supabase Query Error:", error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      dishName: row.dish_name || '이름 없음',
      imageUrl: row.image_url,
      thumbnailUrl: row.thumbnail_url || row.image_url,
      comment: row.comment || '',
      created_at: row.created_at,
      rating_sum: row.rating_sum || 0,
      rating_count: row.rating_count || 0,
      download_count: row.download_count || 0,
      vote_success: row.vote_success || 0,
      vote_fail: row.vote_fail || 0,
      comment_count: 0 // 관계성 쿼리 제거로 인한 기본값 설정
    } as RecipeResult));
  } catch (err) {
    console.error("Fetch Community Recipes Global Error:", err);
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
