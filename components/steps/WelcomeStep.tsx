
import React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-between h-full py-12 animate-fadeIn">
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 w-full">
        <div className="relative">
          <div className="w-40 h-40 bg-[#FFF3ED] rounded-[40px] absolute -z-10 rotate-6 scale-110"></div>
          <div className="w-40 h-40 bg-white shadow-2xl rounded-[40px] flex items-center justify-center text-7xl">
            🥘
          </div>
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-snug">
            웅아!<br/><span className="brand-orange-text">오늘 뭐 해먹지?</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            세상의 모든 재료를 조합하여<br/>당신만을 위한 퓨전 미식을 제안합니다.
          </p>
        </div>
      </div>
      
      <div className="w-full space-y-6">
        <button
          onClick={onNext}
          className="w-full py-6 bg-[#ff5d01] text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-[#e04d01] transition-all active:scale-95"
        >
          메뉴 추천 받기
        </button>
        <p className="text-center text-[11px] text-slate-300 font-bold tracking-[0.2em] uppercase">
          AI Global Fusion Recipe Service
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;
