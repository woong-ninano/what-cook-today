
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCommunityRecipes, signInWithGoogle, signOut, supabase } from '../services/supabase';
import { RecipeResult } from '../types';

interface Props {
  onSelectRecipe: (recipe: RecipeResult) => void;
  user: any | null;
}

const PAGE_SIZE = 8;

const CommunityView: React.FC<Props> = ({ onSelectRecipe, user }) => {
  const [recipes, setRecipes] = useState<RecipeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'success' | 'comments'>('latest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const fetchingRef = useRef(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadRecipes = useCallback(async (isReset: boolean = false) => {
    if (fetchingRef.current || !supabase) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const targetPage = isReset ? 0 : page;
      const newRecipes = await fetchCommunityRecipes(searchTerm, sortBy, targetPage, PAGE_SIZE);
      
      setHasMore(newRecipes.length >= PAGE_SIZE);
      
      if (isReset) {
        setRecipes(newRecipes);
        setPage(1);
      } else {
        setRecipes(prev => {
          const ids = new Set(prev.map(r => r.id));
          return [...prev, ...newRecipes.filter(r => !ids.has(r.id))];
        });
        setPage(prev => prev + 1);
      }
      
      if (isReset && newRecipes.length === 0 && searchTerm === '') {
        // 데이터가 아예 없는 경우 (테이블은 있지만 내용 없음)
      }
    } catch (err) {
      console.error("Community Load Error:", err);
      setError("레시피를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, searchTerm, sortBy]);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase 설정이 필요합니다. 관리자에게 문의하세요.");
      return;
    }
    setPage(0);
    setHasMore(true);
    setRecipes([]);
    const timeoutId = setTimeout(() => {
      loadRecipes(true);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortBy, loadRecipes]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !supabase) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fetchingRef.current && hasMore && !loading) {
        loadRecipes(false);
      }
    }, { threshold: 0.1, rootMargin: '150px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadRecipes, hasMore, loading]);

  const getStarLabel = (sum?: number, count?: number) => {
    if (!sum || !count) return "0.0";
    return (sum / count).toFixed(1);
  };

  return (
    <div className="pt-8 px-6 animate-fadeIn pb-10 min-h-full max-w-full">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2 flex-1 min-w-0">
          <h2 className="text-3xl font-black text-slate-900 truncate">모두의 <span className="brand-orange-text">레시피</span></h2>
          <p className="text-slate-600 font-bold text-sm">요리 고수들의 조합을 훔쳐보세요.</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {user ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 truncate max-w-[80px]">
                {user.email?.split('@')[0]}
              </span>
              <button onClick={signOut} className="text-[9px] text-slate-400 underline mt-1">로그아웃</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-sm active:scale-95 transition-all">로그인</button>
          )}
          <button onClick={() => loadRecipes(true)} className="p-2 bg-slate-50 rounded-full hover:rotate-180 transition-transform active:bg-slate-100"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg></button>
        </div>
      </div>

      {!supabase && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-6">
          <p className="text-red-600 font-bold text-sm mb-2">🔌 연결 오류</p>
          <p className="text-red-400 text-xs leading-relaxed">환경 변수가 설정되지 않았습니다.<br/>Supabase URL과 Key를 등록해 주세요.</p>
        </div>
      )}

      {error && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center mb-6">
          <p className="text-orange-600 font-bold text-xs">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-6 sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-2">
        <div className="relative">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="요리 이름 검색..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#ff5d01] shadow-sm"/>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-lg">🔍</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {['latest', 'rating', 'success', 'comments'].map((id) => (
            <button key={id} onClick={() => setSortBy(id as any)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${sortBy === id ? 'bg-white text-[#ff5d01] shadow-sm' : 'text-slate-400'}`}>
              {id === 'latest' ? '최신' : id === 'rating' ? '별점' : id === 'success' ? '성공' : '댓글'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {recipes.map((recipe, idx) => (
          <button key={`${recipe.id}-${idx}`} onClick={() => onSelectRecipe(recipe)} className="w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4 text-left active:scale-[0.98] transition-all hover:border-orange-100 group">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-50">
              <img src={recipe.thumbnailUrl || recipe.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#ff5d01]">{recipe.dishName}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-medium">{recipe.comment}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-2">
                <span className="text-yellow-500">⭐ {getStarLabel(recipe.rating_sum, recipe.rating_count)}</span>
                <span className="text-green-500">😋 {recipe.vote_success}</span>
                <span className="ml-auto text-[9px] text-slate-300">{recipe.created_at ? new Date(recipe.created_at).toLocaleDateString().slice(2) : ''}</span>
              </div>
            </div>
          </button>
        ))}
        
        {recipes.length === 0 && !loading && !error && (
          <div className="text-center py-20 text-slate-300">
            <p className="text-4xl mb-3">🍳</p>
            <p className="text-sm">아직 등록된 레시피가 없어요.</p>
          </div>
        )}

        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-100 border-t-[#ff5d01] rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400 font-bold">로딩 중...</span>
            </div>
          )}
          {!hasMore && recipes.length > 0 && <span className="text-[10px] text-slate-300">마지막 레시피입니다.</span>}
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
