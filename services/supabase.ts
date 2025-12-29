
import { createClient } from '@supabase/supabase-js';
import { RecipeResult, Comment } from '../types';

// 환경 변수 가져오기
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Use any to bypass version-specific typing issues with SupabaseAuthClient
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * UTILS
 */
// Base64 문자열을 Blob으로 변환하는 헬퍼 함수
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

// 클라이언트 사이드 이미지 리사이징 (썸네일 생성용)
const createThumbnail = (base64Str: string, maxWidth = 300): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
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
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

// 이미지를 Supabase Storage에 업로드하고 Public URL을 반환하는 함수
const uploadImageToStorage = async (base64Image: string, prefix = 'full'): Promise<string | null> => {
  if (!supabase) return null;

  try {
    const blob = base64ToBlob(base64Image);
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Image upload failed:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error('Error processing image:', err);
    return null;
  }
};

/**
 * AUTHENTICATION
 */
export const signInWithGoogle = async () => {
  if (!supabase) return;
  // Cast to any to fix missing signInWithOAuth type error on SupabaseAuthClient
  const { error } = await (supabase.auth as any).signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
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
  // Cast to any to fix missing signOut type error on SupabaseAuthClient
  await (supabase.auth as any).signOut();
};

// Return any to avoid User type dependency issues
export const getCurrentUser = async (): Promise<any | null> => {
  if (!supabase) return null;
  // Cast to any to fix missing getSession type error on SupabaseAuthClient
  const { data: { session } } = await (supabase.auth as any).getSession();
  return session?.user || null;
};

/**
 * DATABASE - RECIPES
 */
export const saveRecipeToDB = async (recipe: RecipeResult) => {
  if (!supabase) return null;

  try {
    let finalImageUrl = recipe.imageUrl;
    let finalThumbnailUrl = undefined;

    // Base64 이미지라면 원본 + 썸네일 업로드
    if (recipe.imageUrl && recipe.imageUrl.startsWith('data:image')) {
      // 1. 썸네일 생성
      const thumbBase64 = await createThumbnail(recipe.imageUrl);
      
      // 2. 동시 업로드 시도
      const [fullUrl, thumbUrl] = await Promise.all([
        uploadImageToStorage(recipe.imageUrl, 'full'),
        uploadImageToStorage(thumbBase64, 'thumb')
      ]);

      if (fullUrl) finalImageUrl = fullUrl;
      if (thumbUrl) finalThumbnailUrl = thumbUrl;
    }

    const recipeToSave = { 
      ...recipe, 
      imageUrl: finalImageUrl, 
      thumbnailUrl: finalThumbnailUrl 
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          dish_name: recipe.dishName,
          image_url: finalImageUrl,
          thumbnail_url: finalThumbnailUrl, // 썸네일 컬럼 저장
          comment: recipe.comment,
          full_json: recipeToSave,
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
      console.error('Error saving recipe:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected exception:', err);
    return null;
  }
};

// 상세 데이터 조회를 위한 함수
export const fetchRecipeById = async (id: number): Promise<RecipeResult | null> => {
  if (!supabase || !id) return null;
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching full recipe:', error);
    return null;
  }

  // full_json에 상세 레시피 정보가 모두 들어있음
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

// Pagination 및 경량화된 Select 적용
export const fetchCommunityRecipes = async (
  search: string, 
  sortBy: 'latest' | 'rating' | 'success' | 'comments',
  page: number = 0,
  pageSize: number = 5
): Promise<RecipeResult[]> => {
  if (!supabase) return [];

  // 목록에서는 thumbnail_url을 우선적으로 가져옴
  let query = supabase
    .from('recipes')
    .select(`
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
      download_count,
      comments(count)
    `);

  if (search) {
    query = query.ilike('dish_name', `%${search}%`);
  }

  if (sortBy === 'rating') {
    query = query.order('rating_sum', { ascending: false });
  } else if (sortBy === 'success') {
    query = query.order('vote_success', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) return [];

  return data.map((row: any) => ({
    id: row.id,
    dishName: row.dish_name || '이름 없는 레시피',
    imageUrl: row.image_url, 
    thumbnailUrl: row.thumbnail_url || row.image_url, // 썸네일 없으면 원본이라도
    comment: row.comment || '설명이 없습니다.',
    ingredientsList: '',
    easyRecipe: '',
    gourmetRecipe: '',
    similarRecipes: [],
    referenceLinks: [],
    created_at: row.created_at,
    rating_sum: row.rating_sum,
    rating_count: row.rating_count,
    download_count: row.download_count,
    vote_success: row.vote_success || 0,
    vote_fail: row.vote_fail || 0,
    comment_count: row.comments?.[0]?.count || 0
  }));
};

export const incrementDownloadCount = async (id: number) => {
  if (!id || !supabase) return;
  try {
    const { data: current } = await supabase.from('recipes').select('download_count').eq('id', id).single();
    if (current) await supabase.from('recipes').update({ download_count: current.download_count + 1 }).eq('id', id);
  } catch (err) {}
};

export const updateRating = async (id: number, score: number) => {
  if (!id || !supabase) return;
  try {
    const { data: current } = await supabase.from('recipes').select('rating_sum, rating_count').eq('id', id).single();
    if (current) await supabase.from('recipes').update({ rating_sum: current.rating_sum + score, rating_count: current.rating_count + 1 }).eq('id', id);
  } catch (err) {}
};

export const updateVoteCounts = async (id: number, successDelta: number, failDelta: number) => {
  if (!id || !supabase) return;
  try {
    const { data: current } = await supabase.from('recipes').select('vote_success, vote_fail').eq('id', id).single();
    if (current) await supabase.from('recipes').update({ vote_success: Math.max(0, current.vote_success + successDelta), vote_fail: Math.max(0, current.vote_fail + failDelta) }).eq('id', id);
  } catch (err) {}
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
