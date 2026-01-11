import React from 'react';
import { PublicDeckSummary } from '../types';
import { ProgressBar } from '../shared/ui/ProgressBar';
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

  const totalCards = deck.cards_count;
  const completedCards = deck.completed_cards_count;
  const repetitionsCount = deck.count_repeat;
  const forRepetition = deck.count_for_repeat;
  const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <button onClick={onClick} className="deck-card">
      <h3 className="deck-card__title">{deck.title}</h3>
      
      <div className="deck-card__description-box">
        {description ? (
          <p className="deck-card__description">{description}</p>
        ) : (
          <p className="deck-card__description">Описание отсутствует</p>
        )}
      </div>

      <div className="deck-card__stats">
        <span className="deck-card__stat">Прогресс: {progress}%</span>
        <span className="deck-card__stat">Количество повторений: {repetitionsCount}</span>
        <span className="deck-card__stat">Для повторения: {forRepetition}</span>
      </div>

      <div className="deck-card__progress-container">
        <div className="deck-card__progress-bar">
          <div 
            className="deck-card__progress-fill" 
            style={{ width: `${progress}%` }}
          />
          <span className="deck-card__progress-text">
            {completedCards} / {totalCards}
          </span>
        </div>
      </div>
    </button>
  );
}
