
import React from 'react';

interface TagButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  subLabel?: string;
}

const TagButton: React.FC<TagButtonProps> = ({ label, selected, onClick, subLabel }) => {
  return (
    <button
      onClick={onClick}
      className={`group w-full p-5 rounded-2xl transition-all duration-300 border text-left flex flex-col gap-1 ${
        selected
          ? 'bg-[#ff5d01] border-[#ff5d01] shadow-lg shadow-orange-100'
          : 'bg-[#F9FAFB] border-[#F2F4F6] hover:bg-white hover:border-[#ff5d01]'
      } active:scale-95`}
    >
      <span className={`text-[17px] font-bold ${selected ? 'text-white' : 'text-slate-800'}`}>
        {label}
      </span>
      {subLabel && (
        <span className={`text-xs ${selected ? 'text-orange-100' : 'text-slate-400'}`}>
          {subLabel}
        </span>
      )}
    </button>
  );
};

export default TagButton;
