import React, { useState } from 'react';
import { Card, DifficultyRating } from '../types';
import { FlipCard } from '../components/FlipCard';
import { RatingButton } from '../components/RatingButton';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { X, ArrowUp } from 'lucide-react';

interface StudySessionProps {
  cards: Card[];
  currentIndex: number;
  onRate: (rating: DifficultyRating) => void;
  onLevelUp: () => void;
  onClose: () => void;
}

export function StudySession({ cards, currentIndex, onRate, onLevelUp, onClose }: StudySessionProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;
  const canLevelUp = currentCard.currentLevel < 3;
  
  const handleRate = (rating: DifficultyRating) => {
    setIsFlipped(false);
    setTimeout(() => {
      onRate(rating);
    }, 300);
  };
  
  const handleLevelUp = () => {
    setIsFlipped(false);
    setTimeout(() => {
      onLevelUp();
    }, 300);
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  if (!currentCard) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="max-w-[390px] mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="text-[#718096]">
              <X size={24} />
            </button>
            <span className="text-sm text-[#718096]">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <ProgressBar progress={progress} color="#FF9A76" />
        </div>
      </div>
      
      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center py-8">
        <FlipCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />
      </div>
      
      {/* Actions */}
      <div className="px-4 pb-8 max-w-[390px] mx-auto w-full">
        {!isFlipped ? (
          <Button onClick={handleFlip} variant="primary" size="large" fullWidth>
            Показать ответ
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Level Up Button */}
            {canLevelUp && (
              <Button
                onClick={handleLevelUp}
                variant="warning"
                size="medium"
                fullWidth
                className="flex items-center justify-center gap-2"
              >
                <ArrowUp size={20} />
                Попробовать сложнее
              </Button>
            )}
            
            {/* Rating Buttons */}
            <div className="flex justify-between items-center gap-3">
              <RatingButton
                rating="again"
                label="Снова"
                onClick={() => handleRate('again')}
              />
              <RatingButton
                rating="hard"
                label="Трудно"
                onClick={() => handleRate('hard')}
              />
              <RatingButton
                rating="good"
                label="Хорошо"
                onClick={() => handleRate('good')}
              />
              <RatingButton
                rating="easy"
                label="Легко"
                onClick={() => handleRate('easy')}
              />
            </div>
            
            {/* Next Review Info */}
            <div className="text-center text-sm text-[#718096]">
              Следующее повторение через 3 дня
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
