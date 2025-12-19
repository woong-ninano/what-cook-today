
import React, { useState } from 'react';
import { RecipeResult } from '../types';

interface Props {
  result: RecipeResult;
  onReset: () => void;
}

const ResultView: React.FC<Props> = ({ result, onReset }) => {
  const [tab, setTab] = useState<'easy' | 'gourmet'>('easy');

  return (
    <div className="animate-fadeIn space-y-8 pb-20">
      <div className="text-center space-y-6 pt-4">
        <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">
          Recipe Suggested by AI
        </div>
        <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
          {result.dishName}
        </h2>
        <div className="relative px-6">
          <span className="absolute left-0 top-0 text-4xl text-emerald-100">"</span>
          <p className="text-slate-500 italic text-lg font-medium leading-relaxed">
            {result.comment}
          </p>
          <span className="absolute right-0 bottom-0 text-4xl text-emerald-100">"</span>
        </div>
      </div>

      <div className="bg-slate-100 p-1.5 rounded-[28px] flex sticky top-4 z-30 backdrop-blur-md bg-opacity-80">
        <button
          onClick={() => setTab('easy')}
          className={`flex-1 py-4 text-sm font-black rounded-[24px] transition-all ${
            tab === 'easy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          ⚡ 간편 조리
        </button>
        <button
          onClick={() => setTab('gourmet')}
          className={`flex-1 py-4 text-sm font-black rounded-[24px] transition-all ${
            tab === 'gourmet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          ✨ 셰프 조리
        </button>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-100 border border-slate-50">
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <span className="text-emerald-500">Step by Step</span>
        </h3>
        <div 
          className="recipe-content prose prose-slate max-w-none text-slate-800 font-medium"
          dangerouslySetInnerHTML={{ __html: tab === 'easy' ? result.easyRecipe : result.gourmetRecipe }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-black text-slate-900 px-2 mt-4">유사한 요리 추천</h3>
        {result.similarRecipes.map((recipe, idx) => (
          <div key={idx} className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
            <h4 className="text-lg font-black text-emerald-900 mb-1">{recipe.title}</h4>
            <p className="text-sm text-emerald-700 font-medium leading-relaxed">{recipe.reason}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 pt-10">
        <button
          onClick={onReset}
          className="w-full py-6 bg-slate-900 text-white font-bold text-lg rounded-[32px] shadow-xl hover:bg-black transition-all active:scale-95"
        >
          다른 요리 하기
        </button>
        <button
          onClick={() => window.print()}
          className="w-full py-4 text-slate-300 text-sm font-bold hover:text-slate-400"
        >
          레시피 인쇄하기
        </button>
      </div>

      <style>{`
        .recipe-content ol {
          list-style-type: none;
          counter-reset: recipe-step;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .recipe-content ol li {
          counter-increment: recipe-step;
          position: relative;
          padding-left: 3.5rem;
          font-size: 1.15rem;
          line-height: 1.7;
        }
        .recipe-content ol li::before {
          content: counter(recipe-step);
          position: absolute;
          left: 0;
          top: 0;
          width: 2.5rem;
          height: 2.5rem;
          background: #ECFDF5;
          color: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1rem;
          font-weight: 900;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ResultView;
