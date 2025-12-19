
import React from 'react';
import { UserChoices } from '../../types';
import TagButton from '../TagButton';

interface Props {
  choices: UserChoices;
  setChoices: React.Dispatch<React.SetStateAction<UserChoices>>;
  items: {name: string, desc: string}[];
  onNext: () => void;
  onBack: () => void;
}

const SeasonalStep: React.FC<Props> = ({ choices, setChoices, items, onNext, onBack }) => {
  const toggleItem = (name: string) => {
    const current = choices.ingredients;
    if (current.includes(name)) {
      setChoices(prev => ({
        ...prev,
        ingredients: current.split(',').map(s => s.trim()).filter(s => s !== name).join(', ')
      }));
    } else {
      setChoices(prev => ({
        ...prev,
        ingredients: current ? `${current}, ${name}` : name
      }));
    }
  };

  return (
    <div className="space-y-8 pt-12 step-transition">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">장바구니에 담아볼까요?</h2>
        <p className="text-slate-500 font-medium">지금 시즌에 가장 좋은 재료들이에요.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map(item => (
          <TagButton
            key={item.name}
            label={item.name}
            subLabel={item.desc}
            selected={choices.ingredients.includes(item.name)}
            onClick={() => toggleItem(item.name)}
          />
        ))}
      </div>

      <div className="pt-6 space-y-4">
        <button
          onClick={onNext}
          disabled={!choices.ingredients.trim()}
          className="w-full py-5 bg-[#ff5d01] text-white text-lg font-bold rounded-2xl shadow-lg disabled:opacity-30"
        >
          재료 선택 완료
        </button>
        <button onClick={onBack} className="w-full py-2 text-slate-400 font-bold">이전으로</button>
      </div>
    </div>
  );
};

export default SeasonalStep;
