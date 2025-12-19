
import React from 'react';
import { UserChoices } from '../../types';
import TagButton from '../TagButton';

interface Props {
  choices: UserChoices;
  setChoices: React.Dispatch<React.SetStateAction<UserChoices>>;
  suggestions: { subIngredients: string[], sauces: string[] };
  onNext: () => void;
  onBack: () => void;
}

const SuggestionStep: React.FC<Props> = ({ choices, setChoices, suggestions, onNext, onBack }) => {
  const toggleItem = (field: 'sauces', value: string) => {
    setChoices(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubIngredientToggle = (item: string) => {
    const current = choices.ingredients;
    if (current.includes(item)) {
      setChoices(prev => ({
        ...prev,
        ingredients: current.replace(new RegExp(`,?\\s?${item}`, 'g'), '').replace(/^,\s?/, '').trim()
      }));
    } else {
      setChoices(prev => ({
        ...prev,
        ingredients: current ? `${current}, ${item}` : item
      }));
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn py-6">
      <div className="space-y-3">
        <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
          마스터 웅이의<br/>
          <span className="text-amber-500">추천 재료</span> 등장!
        </h2>
        <p className="text-2xl text-slate-500 font-bold leading-relaxed">
          이것들도 함께 넣으면<br/>맛이 훨씬 깊어집니다.
        </p>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="text-3xl">🥦</span> 어울리는 부재료
        </h3>
        <div className="flex flex-wrap gap-3">
          {suggestions.subIngredients.map(item => (
            <TagButton
              key={item}
              label={item}
              selected={choices.ingredients.includes(item)}
              onClick={() => handleSubIngredientToggle(item)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="text-3xl">🧴</span> 찰떡궁합 양념
        </h3>
        <div className="flex flex-wrap gap-3">
          {suggestions.sauces.map(sauce => (
            <TagButton
              key={sauce}
              label={sauce}
              selected={choices.sauces.includes(sauce)}
              onClick={() => toggleItem('sauces', sauce)}
            />
          ))}
        </div>
      </section>

      <div className="pt-10 flex flex-col gap-4">
        <button
          onClick={onNext}
          className="w-full py-7 bg-amber-500 text-white text-3xl font-black rounded-[40px] shadow-2xl hover:bg-amber-600 transition-all active:scale-95 border-b-8 border-amber-800"
        >
          좋아요, 이걸로 할게요!
        </button>
        <button onClick={onBack} className="w-full py-4 text-slate-400 text-xl font-black hover:text-slate-600">
          재료 다시 쓰기
        </button>
      </div>
    </div>
  );
};

export default SuggestionStep;
