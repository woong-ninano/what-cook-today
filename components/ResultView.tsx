
import React, { useState, useRef, useEffect } from 'react';
import { RecipeResult } from '../types';

interface Props {
  result: RecipeResult;
  onReset: () => void;
}

const ResultView: React.FC<Props> = ({ result, onReset }) => {
  const [tab, setTab] = useState<'easy' | 'gourmet'>('easy');
  const recipeRef = useRef<HTMLDivElement>(null);

  // 탭 변경 시 레시피 상단으로 스크롤
  useEffect(() => {
    if (recipeRef.current) {
      recipeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tab]);

  return (
    <div className="animate-fadeIn space-y-10 pb-16">
      <div className="text-center space-y-4 pt-4">
        <span className="px-6 py-2 bg-amber-500 text-white text-sm font-black rounded-full uppercase tracking-widest shadow-lg">AI Master's Choice</span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tighter px-2">{result.dishName}</h2>
        <p className="text-slate-600 italic text-xl font-bold px-4 leading-relaxed">"{result.comment}"</p>
      </div>

      <div className="bg-slate-200 p-2 rounded-[32px] flex border-2 border-slate-300 sticky top-4 z-30 shadow-xl" ref={recipeRef}>
        <button
          onClick={() => setTab('easy')}
          className={`flex-1 py-5 text-lg font-black rounded-[28px] transition-all duration-300 ${
            tab === 'easy' ? 'bg-white text-slate-900 shadow-lg transform scale-102' : 'text-slate-500'
          }`}
        >
          🚀 5분 완성
        </button>
        <button
          onClick={() => setTab('gourmet')}
          className={`flex-1 py-5 text-lg font-black rounded-[28px] transition-all duration-300 ${
            tab === 'gourmet' ? 'bg-white text-slate-900 shadow-lg transform scale-102' : 'text-slate-500'
          }`}
        >
          🎩 미식가 모드
        </button>
      </div>

      <div className="bg-white border-4 border-slate-50 rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-slate-200 min-h-[400px]">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
          마스터의 조리 비법
        </h3>
        <div 
          className="prose prose-slate prose-xl max-w-none text-slate-800 leading-relaxed font-bold recipe-list"
          dangerouslySetInnerHTML={{ __html: tab === 'easy' ? result.easyRecipe : result.gourmetRecipe }}
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-2">
          <span>💡</span> 마스터의 또 다른 제안
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {result.similarRecipes.map((recipe, idx) => (
            <div key={idx} className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-2">{recipe.title}</h4>
              <p className="text-lg text-slate-500 font-bold leading-relaxed">{recipe.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-2">
          <span>🔍</span> 더 알아보기
        </h3>
        <div className="flex flex-col gap-3">
          {result.referenceLinks.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] hover:border-amber-300 transition-all group shadow-sm active:scale-95"
            >
              <span className="text-xl font-black text-slate-700 group-hover:text-amber-600">{link.title} 보러가기</span>
              <span className="text-slate-300 text-3xl group-hover:translate-x-2 transition-transform">→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-10">
        <button
          onClick={onReset}
          className="w-full py-7 bg-slate-900 text-white font-black text-2xl rounded-[32px] shadow-2xl hover:bg-black transition-all active:scale-95 border-b-8 border-black"
        >
          처음부터 다시하기
        </button>
        <button
          onClick={() => window.print()}
          className="w-full py-4 text-slate-400 text-lg font-black tracking-widest hover:text-slate-600"
        >
          이 레시피를 종이로 출력하기
        </button>
      </div>

      <style>{`
        .recipe-list ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .recipe-list ol li {
          padding-left: 0.8rem;
          font-size: 1.25rem;
          line-height: 1.6;
        }
        .recipe-list ol li::marker {
          font-weight: 900;
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
};

export default ResultView;
