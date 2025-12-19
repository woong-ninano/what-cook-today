
import React, { useEffect, useState } from 'react';

interface Props {
  customMessage?: string;
}

const LoadingStep: React.FC<Props> = ({ customMessage }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "재료의 신선함을 체크하고 있어요",
    "최고의 조리법을 설계 중입니다",
    "셰프의 비밀 레시피를 가져오고 있어요",
    "플레이팅까지 고민하고 있습니다"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-12 animate-fadeIn">
      <div className="relative">
        <div className="w-32 h-32 border-8 border-slate-50 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-5xl">🍳</div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">잠시만 기다려주세요</h2>
        <p className="text-emerald-600 font-bold text-lg px-6 h-8 transition-all">
          {customMessage || `"${messages[msgIdx]}"`}
        </p>
      </div>
    </div>
  );
};

export default LoadingStep;
