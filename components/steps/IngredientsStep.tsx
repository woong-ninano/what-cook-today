
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
    <div className="space-y-10 animate-fadeIn py-4">
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900 flex flex-col gap-2">
          <span>🧊</span>
          냉장고에 있는<br/>주재료를 적어주세요
        </h2>
        <div className="relative">
          <textarea
            rows={3}
            value={choices.ingredients}
            onChange={(e) => setChoices(prev => ({ ...prev, ingredients: e.target.value }))}
            placeholder="예: 삼겹살, 고등어, 두부..."
            className="w-full p-6 border-4 border-slate-100 rounded-[32px] bg-white text-slate-900 font-black placeholder:text-slate-200 focus:border-amber-500 focus:outline-none transition-all shadow-xl text-2xl"
          />
        </div>
        <p className="text-lg text-slate-400 font-bold px-2">여러 개면 쉼표(,)로 구분하면 좋아요.</p>
      </div>

      <div className="pt-8 flex flex-col gap-4">
        <button
          onClick={onNext}
          disabled={!choices.ingredients.trim()}
          className="w-full py-7 bg-slate-900 text-white text-2xl font-black rounded-[32px] shadow-2xl hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 transition-all active:scale-95 border-b-8 border-black"
        >
          마스터에게 추천받기
        </button>
        <button onClick={onBack} className="w-full py-3 text-slate-400 text-xl font-black hover:text-slate-600">
          처음으로
        </button>
      </div>
    </div>
  );
};

export default IngredientsStep;
