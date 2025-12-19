
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-8 pb-4 text-center bg-white">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex flex-row items-center justify-center gap-2 px-4">
        <span className="text-4xl drop-shadow-md">🥘</span>
        <span className="tracking-tighter whitespace-nowrap">웅아! 오늘 뭐 해먹지?</span>
      </h1>
      <div className="mt-3 inline-block px-4 py-1 bg-amber-500 rounded-full shadow-md">
        <p className="text-[10px] text-white font-black tracking-widest uppercase">Culinary Master</p>
      </div>
    </header>
  );
};

export default Header;
