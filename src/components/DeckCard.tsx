import React from 'react';
import { Deck } from '../types';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onClick: () => void;
}

export function DeckCard({ deck, onClick }: DeckCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="mb-1">{deck.name}</h3>
          <p className="text-sm text-[#718096]">{deck.cardsCount} карточек</p>
        </div>
        <ChevronRight size={20} className="text-[#718096] mt-1" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#718096]">Прогресс</span>
          <span className="text-[#2D3748]">{deck.progress}%</span>
        </div>
        <ProgressBar progress={deck.progress} color={deck.color} />
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-sm text-[#718096]">
        <span>Средний уровень:</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full ${
                level <= Math.floor(deck.averageLevel)
                  ? 'bg-[#4A6FA5]'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
