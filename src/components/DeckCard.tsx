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
    <button onClick={onClick} className="deck-card">
      <div className="deck-card__row">
        <div style={{ flex: 1 }}>
          <h3 className="deck-card__title">{deck.name}</h3>
          <p className="deck-card__meta">{deck.cardsCount} карточек</p>
        </div>
        <ChevronRight size={20} className="deck-card__chev" />
      </div>

      <div className="deck-card__progress-row">
        <span>Прогресс</span>
        <span style={{ color: '#E8EAF0' }}>{deck.progress}%</span>
      </div>
      <ProgressBar progress={deck.progress} color={deck.color} />

      <div className="deck-card__level">
        <span>Средний уровень:</span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`level-dot ${level <= Math.floor(deck.averageLevel) ? 'level-dot--filled' : ''}`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}