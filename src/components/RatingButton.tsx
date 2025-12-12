import React from 'react';
import { DifficultyRating } from '../types';

interface RatingButtonProps {
  rating: DifficultyRating;
  label: string;
  onClick: () => void;
}

export function RatingButton({ rating, label, onClick }: RatingButtonProps) {
  const colors = {
    again: { bg: '#E53E3E', active: '#c53030' },
    hard: { bg: '#F6AD55', active: '#ed8936' },
    good: { bg: '#4A6FA5', active: '#3a5a8a' },
    easy: { bg: '#38A169', active: '#2f855a' },
  };
  
  return (
    <button
      onClick={onClick}
      data-rating={rating}
      style={{ background: colors[rating].bg }}
      className={`rating-button rating-button--circle text-white transition-all duration-200 shadow-md`}
    >
      <span className="text-xs">{label}</span>
    </button>
  );
}
