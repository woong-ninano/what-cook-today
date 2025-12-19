
import React from 'react';

interface TagButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const TagButton: React.FC<TagButtonProps> = ({ label, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3.5 rounded-2xl text-[17px] font-bold transition-all duration-200 shadow-sm border ${
        selected
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100 ring-4 ring-emerald-50'
          : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-200'
      } active:scale-95`}
    >
      {label}
    </button>
  );
};

export default TagButton;
