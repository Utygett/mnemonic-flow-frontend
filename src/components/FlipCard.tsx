import React, { useState } from 'react';
import { Card } from '../types';
import { LevelIndicator } from './LevelIndicator';
import { motion } from 'motion/react';

interface FlipCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlipCard({ card, isFlipped, onFlip }: FlipCardProps) {
  const getLevelContent = (card: Card, isFront: boolean) => {
    if (isFront) {
      return card.term;
    }
    
    // Возвращаем контент текущего уровня из массива
    return card.levels[card.currentLevel] || card.levels[0];
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
            <div className="flipcard__mb-4">
              <LevelIndicator currentLevel={card.currentLevel as 0 | 1 | 2 | 3} size="large" />
            </div>
            <p className="flipcard__text">{getLevelContent(card, true)}</p>
            <div className="flipcard__hint">Нажмите, чтобы увидеть ответ</div>
          </div>

          {/* Back Side */}
          <div className="flipcard__side flipcard__back">
            <div className="flipcard__mb-4">
              <LevelIndicator currentLevel={card.currentLevel as 0 | 1 | 2 | 3} size="large" />
            </div>
            <p className="flipcard__text">{getLevelContent(card, false)}</p>
            <div className="flipcard__hint">Уровень {card.currentLevel + 1} из {card.levels.length}</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}