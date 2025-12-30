// src/screens/StudySession.tsx
import React, { useState } from 'react';
import { StudyCard, DifficultyRating } from '../types';
import { FlipCard } from '../components/FlipCard';
import { RatingButton } from '../components/RatingButton';
import { Button } from '../components/Button/Button';
import { ProgressBar } from '../components/ProgressBar';
import { X, SkipForward, Trash2 } from 'lucide-react';

interface StudySessionProps {
  cards: StudyCard[];
  currentIndex: number;
  onRate: (rating: DifficultyRating) => void;
  onClose: () => void;
  onLevelUp: () => void;
  onLevelDown: () => void;

  onSkip: () => void;              
  onRemoveFromProgress: () => void;
}

export function StudySession({
  cards,
  currentIndex,
  onRate,
  onClose,
  onLevelUp,
  onLevelDown,
  onSkip,
  onRemoveFromProgress,
}: StudySessionProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];
  if (!currentCard) {
    return (
      <div className="study-page flex items-center justify-center">
        <div className="text-muted">Карточки закончились</div>
      </div>
    );
  }

  const progress = (currentIndex / cards.length) * 100;

  const handleRate = (rating: DifficultyRating) => {
    setIsFlipped(false);
    setTimeout(() => onRate(rating), 300);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleSkip = () => {
    setIsFlipped(false);
    onSkip();
  };

  const handleRemoveFromProgress = () => {
    const ok = window.confirm(
      'Удалить карточку из прогресса?\n\n' +
      'Она больше не будет отображаться в повторении. ' +
      'Вернуть её можно будет, начав изучение снова (прогресс начнётся заново).'
    );

    if (!ok) return;

    setIsFlipped(false);
    onRemoveFromProgress();
  };

  return (
    <div className="study-page">
      <div className="page__header py-4">
        <div className="page__header-inner">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="icon-btn" aria-label="Закрыть сессию" type="button">
              <X size={18} />
            </button>

            <span className="text-sm text-muted">
              {currentIndex + 1} / {cards.length}
            </span>

            <div className="flex items-center" style={{ columnGap: 32 }}>
              <button
                onClick={() => { setIsFlipped(false); handleSkip(); }}
                className="icon-btn"
                aria-label="Пропустить карточку"
                type="button"
              >
                <SkipForward size={18} />
              </button>

              <button
                onClick={() => { setIsFlipped(false); handleRemoveFromProgress(); }}
                className="icon-btn"
                aria-label="Удалить прогресс карточки"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <ProgressBar progress={progress} color="#FF9A76" />
        </div>
      </div>

      <div className="study__card-area">
        <FlipCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onLevelUp={onLevelUp}
          onLevelDown={onLevelDown}
        />
      </div>

      <div className="study__actions">
        {!isFlipped ? (
          <Button onClick={handleFlip} variant="primary" size="large" fullWidth>
            Показать ответ
          </Button>
        ) : (
          <div className="study__actions-inner">
            <div className="rating-row">
              <RatingButton rating="again" label="Снова" onClick={() => handleRate('again')} />
              <RatingButton rating="hard" label="Трудно" onClick={() => handleRate('hard')} />
              <RatingButton rating="good" label="Хорошо" onClick={() => handleRate('good')} />
              <RatingButton rating="easy" label="Легко" onClick={() => handleRate('easy')} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
