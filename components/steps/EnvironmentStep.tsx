
import React from 'react';
import { UserChoices } from '../../types';
import TagButton from '../TagButton';

interface Props {
  choices: UserChoices;
  setChoices: React.Dispatch<React.SetStateAction<UserChoices>>;
  onGenerate: () => void;
  onBack: () => void;
}

const TOOLS = ['가스레인지', '인덕션', '에어프라이어', '전자레인지', '뚝배기', '찜기', '멀티쿠커', '오븐'];
const LEVELS = ['Lv.1 칼질이 서툴러요', 'Lv.2 웬만한 건 해요', 'Lv.3 내가 바로 셰프'];

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
    <div className="space-y-10 animate-fadeIn py-4">
      <section className="space-y-5">
        <h2 className="text-2xl font-black text-slate-900 mb-4">어떤 도구가 있나요?</h2>
        <div className="flex flex-wrap gap-2">
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

      <section className="space-y-5">
        <h2 className="text-2xl font-black text-slate-900 mb-4">나의 요리 레벨</h2>
        <div className="relative">
          <select
            value={choices.level}
            onChange={(e) => setChoices(prev => ({ ...prev, level: e.target.value }))}
            className="w-full p-6 border-4 border-slate-100 rounded-[32px] bg-white text-slate-900 font-black focus:ring-4 focus:ring-amber-200 focus:outline-none transition-all appearance-none shadow-xl text-xl"
            style={{ color: '#0f172a' }}
          >
            {LEVELS.map(lv => <option key={lv} value={lv} className="text-slate-900">{lv}</option>)}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-2xl text-slate-400">
            ▼
          </div>
        </div>
      </section>

      <div className="pt-8 flex flex-col gap-4">
        <button
          onClick={onGenerate}
          className="w-full py-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl font-black rounded-[32px] shadow-2xl hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-3 border-b-8 border-orange-800 active:scale-95"
        >
          <span>✨</span>
          마스터 레시피 생성!
        </button>
        <button onClick={onBack} className="w-full py-3 text-slate-400 text-lg font-black hover:text-slate-600">
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

export default EnvironmentStep;
