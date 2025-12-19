
import React from 'react';
import { UserChoices } from '../../types';

interface Props {
  choices: UserChoices;
  setChoices: React.Dispatch<React.SetStateAction<UserChoices>>;
  onNext: () => void;
  onBack: () => void;
}

const IngredientsStep: React.FC<Props> = ({ choices, setChoices, onNext, onBack }) => {
  return (
    <div className="space-y-10 animate-fadeIn h-full flex flex-col">
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            지금 냉장고에<br/><span className="text-emerald-600">무엇이 있나요?</span>
          </h2>
          <p className="text-slate-400 font-bold text-lg">주재료를 자유롭게 적어주세요.</p>
        </div>
        
        <div className="group relative">
          <textarea
            rows={4}
            value={choices.ingredients}
            onChange={(e) => setChoices(prev => ({ ...prev, ingredients: e.target.value }))}
            placeholder="예: 삼겹살, 김치, 계란..."
            className="w-full p-8 bg-white border border-slate-100 rounded-[40px] text-xl font-bold placeholder:text-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:outline-none transition-all shadow-sm group-hover:shadow-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onNext}
          disabled={!choices.ingredients.trim()}
          className="w-full py-6 bg-emerald-600 text-white text-xl font-bold rounded-[32px] shadow-lg shadow-emerald-100 disabled:bg-slate-100 disabled:text-slate-300 transition-all active:scale-95"
        >
          다음으로
        </button>
        <button onClick={onBack} className="w-full py-3 text-slate-400 text-lg font-bold hover:text-slate-600">
          처음으로
        </button>
      </div>
    </div>
  );
};

export default IngredientsStep;
