import React, { useState } from 'react';
import { StudyCard } from '../types/study';
import { LevelIndicator } from './LevelIndicator';
import { motion } from 'motion/react';

interface FlipCardProps {
  card: StudyCard;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlipCard({ card, isFlipped, onFlip }: FlipCardProps) {
  const getLevelContent = (card: StudyCard, isFront: boolean) => {
    const level = card.levels[card.currentLevel] ?? card.levels[0];

    return isFront
      ? level.content.question
      : level.content.answer;
  };
  
  return (
    <div className="flipcard-container">
      <motion.div className="flipcard" onClick={onFlip} style={{ perspective: 1000 }}>
        <motion.div
          className="flipcard__inner"
          initial={false}
          animate={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Front Side */}
          <div className="flipcard__side flipcard__front">
            <p className="flipcard__text">{getLevelContent(card, true)}</p>
            <div className="flipcard__hint">Нажмите, чтобы увидеть ответ</div>
          </div>

          {/* Back Side */}
          <div className="flipcard__side flipcard__back">
            <p className="flipcard__text">{getLevelContent(card, false)}</p>
            <div className="flipcard__hint">Уровень {card.currentLevel + 1} из {card.levels.length}</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}