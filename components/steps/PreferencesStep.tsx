
import React from 'react';
import { UserChoices } from '../../types';
import TagButton from '../TagButton';

interface Props {
  choices: UserChoices;
  setChoices: React.Dispatch<React.SetStateAction<UserChoices>>;
  onNext: () => void;
  onBack: () => void;
}

const PARTNERS = ['👤 혼밥', '💑 부부', '👶 손주/아이', '👨‍👩‍👧 가족', '🍻 친구'];
const THEMES = ['🍺 안주', '💪 건강식', '🌿 다이어트', '🍚 든든한 밥', '🍝 특별한 날'];

const PreferencesStep: React.FC<Props> = ({ choices, setChoices, onNext, onBack }) => {
  return (
    <div className="space-y-12 animate-fadeIn py-6">
      <section className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900">누구와 함께 드시나요?</h2>
        <div className="flex flex-wrap gap-3">
          {PARTNERS.map(p => (
            <TagButton
              key={p}
              label={p}
              selected={choices.partner === p}
              onClick={() => setChoices(prev => ({ ...prev, partner: p }))}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900">어떤 분위기인가요?</h2>
        <div className="flex flex-wrap gap-3">
          {THEMES.map(t => (
            <TagButton
              key={t}
              label={t}
              selected={choices.theme === t}
              onClick={() => setChoices(prev => ({ ...prev, theme: t }))}
            />
          ))}
        </div>
      </section>

      <div className="pt-8 flex flex-col gap-4">
        <button
          onClick={onNext}
          className="w-full py-7 bg-slate-900 text-white text-2xl font-black rounded-[32px] shadow-2xl hover:bg-black transition-all active:scale-95 border-b-8 border-black"
        >
          거의 다 됐어요!
        </button>
        <button onClick={onBack} className="w-full py-3 text-slate-400 text-xl font-black hover:text-slate-600">
          이전으로
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;
