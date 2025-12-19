
import React from 'react';
import { UserChoices } from '../../types';
import TagButton from '../TagButton';

interface Props {
  choices: UserChoices;
  setChoices: React.Dispatch<React.SetStateAction<UserChoices>>;
  onGenerate: () => void;
  onBack: () => void;
}

const TOOLS = ['가스레인지', '에어프라이어', '전자레인지', '오븐', '인덕션', '압력솥'];
const LEVELS = ['Lv.1 요린이', 'Lv.2 평범한 주부', 'Lv.3 주방의 고수'];

const EnvironmentStep: React.FC<Props> = ({ choices, setChoices, onGenerate, onBack }) => {
  const toggleTool = (tool: string) => {
    setChoices(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  return (
    <div className="space-y-12 step-transition py-4">
      <section className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900">조리 도구 선택</h2>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(tool => (
            <TagButton
              key={tool}
              label={tool}
              selected={choices.tools.includes(tool)}
              onClick={() => toggleTool(tool)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900">요리 자신감</h2>
        <div className="space-y-3">
          {LEVELS.map(lv => (
            <button
              key={lv}
              onClick={() => setChoices(prev => ({ ...prev, level: lv }))}
              className={`w-full p-6 rounded-3xl text-left font-bold transition-all border-2 ${
                choices.level === lv
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                  : 'border-slate-100 bg-white text-slate-500'
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </section>

      <div className="pt-6 space-y-4">
        <button
          onClick={onGenerate}
          className="w-full py-7 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-2xl font-black rounded-3xl shadow-2xl shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          ✨ 레시피 완성하기
        </button>
        <button onClick={onBack} className="w-full py-2 text-slate-300 font-bold">
          이전으로
        </button>
      </div>
    </div>
  );
};

export default EnvironmentStep;
