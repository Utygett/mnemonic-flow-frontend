import React from 'react';
import { PublicDeckSummary } from '../types';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './DeckCard.css';

interface DeckCardProps {
  deck: PublicDeckSummary;
  onClick: () => void;
  onEdit?: () => void;
}

export function DeckCard({ deck, onClick, onEdit }: DeckCardProps) {
  const { currentUser } = useAuth();
  const isOwner = currentUser?.id === deck.owner_id;
  const description = deck.description?.trim();

  return (
    <button onClick={onClick} className="deck-card">
      <div className="deck-card__row">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* edit button moved to EditCardFlow (study) */}
          <ChevronRight size={20} className="deck-card__chev" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="deck-card__title">{deck.title}</h3>
           {description ? (
            <p className="deck-card__description">{description}</p>
          ) : null}
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