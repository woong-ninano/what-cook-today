
import React, { useEffect, useState } from 'react';

const LoadingStep: React.FC = () => {
  const [dots, setDots] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "재료의 본연의 맛을 분석 중입니다",
    "동서양의 조화를 고민하고 있어요",
    "최적의 조리 온도를 계산하는 중",
    "풍미의 마법을 부리고 있습니다"
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    const msgInterval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => {
      clearInterval(dotInterval);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[500px] space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="w-36 h-36 border-[16px] border-amber-50 border-t-amber-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-6xl">🔥</div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">영감을 떠올리는 중{dots}</h2>
        <p className="text-amber-700 font-bold h-6 transition-all duration-500">
          "{messages[msgIdx]}"
        </p>
        <div className="mt-16 space-y-3">
          <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Global Recipe Database Matching...</p>
          <div className="w-56 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-auto">
            <div className="w-full h-full bg-amber-500 rounded-full animate-shimmer origin-left"></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingStep;
