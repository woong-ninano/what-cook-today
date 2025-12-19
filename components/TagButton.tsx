
import React from 'react';

interface TagButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: 'single' | 'multi';
}

const TagButton: React.FC<TagButtonProps> = ({ label, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-2xl text-lg font-bold transition-all duration-300 border-2 shadow-sm ${
        selected
          ? 'bg-slate-900 text-white border-slate-900 scale-105 z-10'
          : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
};

export default TagButton;
