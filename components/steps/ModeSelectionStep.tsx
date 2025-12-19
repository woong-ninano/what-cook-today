
import React from 'react';

interface Props {
  onFridge: () => void;
  onSeasonal: () => void;
  onBack: () => void;
}

const ModeSelectionStep: React.FC<Props> = ({ onFridge, onSeasonal, onBack }) => {
  return (
    <div className="space-y-8 pt-12 step-transition">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">어떻게 시작할까요?</h2>
        <p className="text-slate-500 font-medium">원하시는 추천 방식을 선택해 주세요.</p>
      </div>
      
      <div className="grid gap-4">
        <button
          onClick={onFridge}
          className="w-full p-8 text-left toss-card border border-slate-50 hover:border-orange-500 group transition-all"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-4xl">🧊</span>
            <span className="text-slate-300 group-hover:text-orange-500 transition-colors">➔</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800">냉장고 뒤지기</h3>
          <p className="text-slate-400 text-sm mt-1">지금 있는 재료를 입력하면 AI 셰프가 맛의 마법을 부려요.</p>
        </button>

        <button
          onClick={onSeasonal}
          className="w-full p-8 text-left toss-card border border-slate-50 hover:border-orange-500 group transition-all"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-4xl">🌿</span>
            <span className="text-slate-300 group-hover:text-orange-500 transition-colors">➔</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800">제철 재료로 요리</h3>
          <p className="text-slate-400 text-sm mt-1">지금 이 계절에 가장 싱싱한 재료를 추천받아 장을 봐보세요.</p>
        </button>
      </div>

      <button onClick={onBack} className="w-full py-4 text-slate-400 font-bold">뒤로 가기</button>
    </div>
  );
};

export default ModeSelectionStep;
