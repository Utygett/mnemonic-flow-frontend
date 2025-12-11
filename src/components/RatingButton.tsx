import React from 'react';
import { DifficultyRating } from '../types';

interface RatingButtonProps {
  rating: DifficultyRating;
  label: string;
  onClick: () => void;
}

export function RatingButton({ rating, label, onClick }: RatingButtonProps) {
  const colors = {
    again: 'bg-[#E53E3E] active:bg-[#c53030]',
    hard: 'bg-[#F6AD55] active:bg-[#ed8936]',
    good: 'bg-[#4A6FA5] active:bg-[#3a5a8a]',
    easy: 'bg-[#38A169] active:bg-[#2f855a]',
  };
  
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-full ${colors[rating]} text-white transition-all duration-200 active:scale-95 shadow-md`}
    >
      <span className="text-xs">{label}</span>
    </button>
  );
}
