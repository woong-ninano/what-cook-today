
import React, { useEffect, useState } from 'react';

const LoadingStep: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "재료의 조화를 분석 중입니다",
    "최적의 맛을 설계하고 있어요",
    "셰프의 노하우를 담고 있습니다",
    "거의 다 되었습니다"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[500px] space-y-12 animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="absolute text-3xl animate-bounce">🥗</div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">마스터 셰프가 고민 중...</h2>
        <p className="text-emerald-600 font-bold h-6 transition-all duration-500">
          "{messages[msgIdx]}"
        </p>
      </div>
    </div>
  );
};

export default LoadingStep;
