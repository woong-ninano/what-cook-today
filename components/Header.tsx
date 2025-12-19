
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-10 pb-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">👨‍🍳</span>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">
          오늘 뭐 해먹지?
        </h1>
        <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
