
import React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-between h-full py-10 animate-fadeIn">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-48 h-48 bg-emerald-50 rounded-[48px] rotate-3 absolute -z-10"></div>
          <div className="w-48 h-48 bg-white shadow-xl rounded-[48px] flex items-center justify-center text-7xl">
            🍳
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
            내 냉장고 속<br/>숨은 맛 찾기
          </h2>
          <p className="text-slate-500 text-lg font-medium">
            AI 셰프가 당신의 재료로<br/>오늘의 미식을 제안합니다.
          </p>
        </div>
      </div>
      
      <div className="w-full space-y-6">
        <button
          onClick={onNext}
          className="w-full py-6 bg-slate-900 text-white text-xl font-bold rounded-[32px] shadow-xl hover:bg-black transition-all active:scale-95"
        >
          시작하기
        </button>
        <p className="text-center text-[10px] text-slate-300 font-black tracking-widest uppercase">
          Powered by Gemini 3 AI
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;
