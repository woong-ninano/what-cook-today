
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-12 pb-8 flex flex-col items-center gap-3">
      <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100">
        🧑‍🍳
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">
        웅이의 퓨전요리연구소
      </h1>
      <div className="w-12 h-1 bg-emerald-500 rounded-full opacity-30"></div>
    </header>
  );
};

export default Header;
