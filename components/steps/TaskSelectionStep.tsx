
import React from 'react';

interface TaskSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

const TaskSelectionStep: React.FC<TaskSelectionStepProps> = ({ onNext, onBack }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">무엇을 도와드릴까요?</h2>
      
      <button
        onClick={onNext}
        className="w-full p-6 bg-white border-2 border-blue-100 hover:border-blue-500 text-left rounded-2xl group transition-all"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-blue-600">🧊 냉장고 파먹기</h3>
            <p className="text-sm text-gray-500 mt-1">AI 셰프가 남은 재료로 요리를 만듭니다</p>
          </div>
          <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">➡️</span>
        </div>
      </button>

      <button
        disabled
        className="w-full p-6 bg-gray-50 border-2 border-gray-100 text-left rounded-2xl cursor-not-allowed opacity-60"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-400">🛒 제철 장보기</h3>
            <p className="text-sm text-gray-400 mt-1">(준비 중)</p>
          </div>
        </div>
      </button>

      <button onClick={onBack} className="w-full py-3 text-gray-400 text-sm font-medium">뒤로 가기</button>
    </div>
  );
};

export default TaskSelectionStep;
