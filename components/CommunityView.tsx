
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCommunityRecipes, signInWithGoogle, signOut, supabase } from '../services/supabase';
import { RecipeResult, CommunityCache } from '../types';

interface Props {
  onSelectRecipe: (recipe: RecipeResult) => void;
  user: any | null;
  cache: CommunityCache;
  onUpdateCache: (update: Partial<CommunityCache>) => void;
}

const PAGE_SIZE = 8;

const CommunityView: React.FC<Props> = ({ onSelectRecipe, user, cache, onUpdateCache }) => {
  const [recipes, setRecipes] = useState<RecipeResult[]>(cache.recipes);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(cache.searchTerm);
  const [sortBy, setSortBy] = useState(cache.sortBy);
  const [hasMore, setHasMore] = useState(cache.hasMore);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(cache.page);
  const fetchingRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 로컬 정렬 함수 (즉각적인 피드백용)
  const sortLocally = useCallback((list: RecipeResult[], criteria: string) => {
    const sorted = [...list];
    if (criteria === 'rating') {
      sorted.sort((a, b) => {
        const rateA = (a.rating_sum || 0) / (a.rating_count || 1);
        const rateB = (b.rating_sum || 0) / (b.rating_count || 1);
        return rateB - rateA;
      });
    } else if (criteria === 'success') {
      sorted.sort((a, b) => (b.vote_success || 0) - (a.vote_success || 0));
    } else if (criteria === 'latest') {
      sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return sorted;
  }, []);

  const loadRecipes = useCallback(async (isReset: boolean = false) => {
    if (fetchingRef.current || !supabase) return;
    
    fetchingRef.current = true;
    setLoading(true);

    try {
      const targetPage = isReset ? 0 : pageRef.current;
      const newRecipes = await fetchCommunityRecipes(searchTerm, sortBy, targetPage, PAGE_SIZE);
      
      const nextHasMore = newRecipes.length >= PAGE_SIZE;
      setHasMore(nextHasMore);
      
      let updatedList: RecipeResult[];
      if (isReset) {
        updatedList = newRecipes;
        pageRef.current = 1;
      } else {
        const existingIds = new Set(recipes.map(r => r.id));
        const filtered = newRecipes.filter(r => !existingIds.has(r.id));
        updatedList = [...recipes, ...filtered];
        pageRef.current += 1;
      }

      setRecipes(updatedList);
      onUpdateCache({ 
        recipes: updatedList, 
        hasMore: nextHasMore, 
        page: pageRef.current,
        searchTerm,
        sortBy
      });
    } catch (err) {
      console.error("Community Load Error:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [searchTerm, sortBy, recipes, onUpdateCache]);

  // 정렬/검색 변경 시
  useEffect(() => {
    if (recipes.length > 0) {
      const locallySorted = sortLocally(recipes, sortBy);
      setRecipes(locallySorted);
    }

    const timeoutId = setTimeout(() => {
      loadRecipes(true);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortBy]);

  // 스크롤 복구
  useEffect(() => {
    if (containerRef.current && cache.scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, cache.scrollPosition);
      }, 50);
    }
  }, []);

  // 스크롤 위치 저장 (언마운트 시)
  useEffect(() => {
    const handleScroll = () => {
      onUpdateCache({ scrollPosition: window.scrollY });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onUpdateCache]);

  // 무한 스크롤
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !supabase || loading || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fetchingRef.current && hasMore) {
        loadRecipes(false);
      }
    }, { threshold: 0.1, rootMargin: '200px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadRecipes, hasMore, loading]);

  const getStarLabel = (sum?: number, count?: number) => {
    if (!sum || !count) return "0.0";
    return (sum / count).toFixed(1);
  };

  return (
    <div ref={containerRef} className="pt-8 px-5 animate-fadeIn pb-10 min-h-full w-full max-w-full box-border overflow-x-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h2 className="text-3xl font-black text-slate-900 truncate">모두의 <span className="brand-orange-text">레시피</span></h2>
          <p className="text-slate-600 font-bold text-xs sm:text-sm">요리 고수들의 조합을 훔쳐보세요.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
          {user ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 truncate max-w-[90px]">
                {user.email?.split('@')[0]}
              </span>
              <button onClick={signOut} className="text-[9px] text-slate-400 underline mt-1">로그아웃</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-sm active:scale-95 transition-all">로그인</button>
          )}
          <button 
            onClick={() => loadRecipes(true)} 
            className="p-1.5 bg-slate-50 rounded-full hover:rotate-180 transition-transform active:bg-slate-100 disabled:opacity-50"
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              <polyline points="21 3 21 8 16 8"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6 sticky top-0 bg-white/95 backdrop-blur-md z-10 py-2 border-b border-slate-50 w-full">
        <div className="relative">
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="요리 이름 검색..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#ff5d01] shadow-sm box-border"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-base">🔍</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {[
            { id: 'latest', label: '최신' },
            { id: 'rating', label: '별점' },
            { id: 'success', label: '성공' },
            { id: 'comments', label: '댓글' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setSortBy(tab.id as any)} 
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${sortBy === tab.id ? 'bg-white text-[#ff5d01] shadow-sm translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full box-border">
        {recipes.map((recipe, idx) => (
          <button 
            key={`${recipe.id}-${idx}`} 
            onClick={() => onSelectRecipe(recipe)} 
            className="w-full bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex gap-3 text-left active:scale-[0.98] transition-all hover:border-orange-100 group animate-fadeIn box-border overflow-hidden"
            style={{ animationDelay: `${Math.min(idx * 50, 500)}ms` }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-50">
              <img src={recipe.thumbnailUrl || recipe.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#ff5d01] leading-tight">
                  {recipe.dishName}
                </h3>
                <p className="text-[10px] text-slate-400 truncate mt-1 font-medium">
                  {recipe.comment}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-bold text-slate-400 mt-1.5 overflow-hidden">
                <span className="text-yellow-500 shrink-0">⭐ {getStarLabel(recipe.rating_sum, recipe.rating_count)}</span>
                <span className="text-green-500 shrink-0">😋 {recipe.vote_success}</span>
                <span className="ml-auto text-[9px] text-slate-300 shrink-0 truncate">
                  {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString().slice(2) : ''}
                </span>
              </div>
            </div>
          </button>
        ))}
        
        {recipes.length === 0 && !loading && (
          <div className="text-center py-24 text-slate-300 w-full">
            <p className="text-5xl mb-4">👨‍🍳</p>
            <p className="text-sm font-bold">찾으시는 레시피가 아직 없어요.</p>
          </div>
        )}

        <div ref={loadMoreRef} className="h-24 flex items-center justify-center w-full">
          {loading && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-orange-100 border-t-[#ff5d01] rounded-full animate-spin"></div>
              <span className="text-[10px] text-slate-400 font-bold">가져오고 있어요</span>
            </div>
          )}
          {!hasMore && recipes.length > 0 && (
            <div className="flex flex-col items-center gap-1.5 py-4">
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              <span className="text-[10px] text-slate-300 font-bold">모든 레시피를 다 확인하셨습니다.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
