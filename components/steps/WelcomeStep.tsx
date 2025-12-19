
import React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10 animate-fadeIn py-10">
      <div className="w-44 h-44 bg-amber-50 rounded-full flex items-center justify-center text-8xl shadow-xl border-8 border-white">
        🧑‍🍳
      </div>
      <div className="text-center space-y-4 px-4">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">전설의 AI 요리사</h2>
        <p className="text-gray-600 text-lg leading-relaxed font-medium">
          한식부터 양식, 창의적인 퓨전까지<br/>
          당신의 냉장고에서 미학을 찾아냅니다.
        </p>
      </div>
      <button
        onClick={onNext}
        className="w-full py-5 bg-black text-white text-xl font-black rounded-2xl shadow-2xl hover:bg-gray-800 transform hover:-translate-y-1 transition-all active:scale-95"
      >
        마스터의 제안 받기
      </button>
      <div className="flex items-center gap-3 text-gray-400">
        <span className="w-12 h-px bg-gray-200"></span>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">Culinary Master Engine</p>
        <span className="w-12 h-px bg-gray-200"></span>
      </div>
    </div>
  );
};

export default WelcomeStep;
