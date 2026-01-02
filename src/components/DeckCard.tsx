import React from 'react';
import { DeckSummary } from '../types';
import { ProgressBar } from './ProgressBar';
import { ChevronRight, Pencil } from 'lucide-react';

interface DeckCardProps {
  deck: DeckSummary;
  onClick: () => void;
  onEdit?: () => void;
}

export function DeckCard({ deck, onClick, onEdit }: DeckCardProps) {
  return (
    <button onClick={onClick} className="deck-card">
      <div className="deck-card__row">
        <div style={{ flex: 1 }}>
          <h3 className="deck-card__title">{deck.title}</h3>
          <p className="deck-card__meta">{/*deck.cardsCount*/} N карточек</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="icon-btn"
              aria-label="Редактировать"
            >
              <Pencil size={16} />
            </button>
          )}
          <ChevronRight size={20} className="deck-card__chev" />
        </div>
      </div>

      <div className="deck-card__progress-row">
        <span>Прогресс</span>
        <span style={{ color: '#E8EAF0' }}>xz{/*deck.progress*/}%</span>
      </div>
      <ProgressBar progress={55} color= '#E8EAF0' />

      <div className="deck-card__level">
        <span>Средний уровень:</span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`level-dot ${level <= Math.floor(2) ? 'level-dot--filled' : ''}`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}