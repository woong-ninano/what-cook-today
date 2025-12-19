
import React, { useState } from 'react';
import { RecipeResult } from '../types';

interface Props {
  result: RecipeResult;
  onReset: () => void;
}

const ResultView: React.FC<Props> = ({ result, onReset }) => {
  const [tab, setTab] = useState<'easy' | 'gourmet'>('easy');

  return (
    <div className="animate-fadeIn space-y-8 pb-20 pt-10">
      <div className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 bg-orange-50 text-[#ff5d01] text-xs font-black rounded-full uppercase tracking-widest">
          Fusion Master Recipe
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight">
          {result.dishName}
        </h2>
        <div className="relative px-6">
          <p className="text-slate-500 italic text-lg font-medium leading-relaxed">
            "{result.comment}"
          </p>
        </div>
      </div>

      <div className="bg-[#F2F4F6] p-1.5 rounded-2xl flex sticky top-4 z-30">
        <button
          onClick={() => setTab('easy')}
          className={`flex-1 py-4 text-sm font-black rounded-xl transition-all ${
            tab === 'easy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          ⚡ 간편 레시피
        </button>
        <button
          onClick={() => setTab('gourmet')}
          className={`flex-1 py-4 text-sm font-black rounded-xl transition-all ${
            tab === 'gourmet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          ✨ 셰프의 킥
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-50">
        <h3 className="text-xl font-black text-slate-900 mb-8 brand-orange-text">Step by Step</h3>
        <div 
          className="recipe-content prose prose-slate max-w-none text-slate-800 font-medium"
          dangerouslySetInnerHTML={{ __html: tab === 'easy' ? result.easyRecipe : result.gourmetRecipe }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900">추천 퓨전 대안</h3>
        {result.similarRecipes.map((recipe, idx) => (
          <div key={idx} className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
            <h4 className="text-lg font-black text-orange-900 mb-1">{recipe.title}</h4>
            <p className="text-sm text-orange-700 font-medium leading-relaxed">{recipe.reason}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 pt-10">
        <button
          onClick={onReset}
          className="w-full py-6 bg-[#ff5d01] text-white font-bold text-lg rounded-2xl shadow-xl active:scale-95 transition-all"
        >
          새로운 추천 받기
        </button>
      </div>

      <style>{`
        .recipe-content ol { list-style: none; counter-reset: r-step; padding: 0; display: flex; flex-direction: column; gap: 1.5rem; }
        .recipe-content ol li { counter-increment: r-step; position: relative; padding-left: 3.5rem; font-size: 1.1rem; line-height: 1.6; }
        .recipe-content ol li::before {
          content: counter(r-step);
          position: absolute; left: 0; top: 0;
          width: 2.2rem; height: 2.2rem;
          background: #FFF3ED; color: #ff5d01;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px; font-weight: 900; font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default ResultView;
