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
    
    switch (card.currentLevel) {
      case 0:
        return card.levels.level0;
      case 1:
        return card.levels.level1;
      case 2:
        return card.levels.level2;
      case 3:
        return card.levels.level3;
      default:
        return card.levels.level0;
    }
  };
  
  return (
    <div className="w-full px-4">
      <motion.div
        className="relative w-full h-[400px] cursor-pointer"
        onClick={onFlip}
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="mb-4">
              <LevelIndicator currentLevel={card.currentLevel} size="large" />
            </div>
            <p className="text-center text-xl">{getLevelContent(card, true)}</p>
            <div className="mt-6 text-sm text-[#718096]">
              Нажмите, чтобы увидеть ответ
            </div>
          </div>
          
          {/* Back Side */}
          <div
            className="absolute inset-0 w-full h-full bg-[#4A6FA5] rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center text-white"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="mb-4">
              <LevelIndicator currentLevel={card.currentLevel} size="large" />
            </div>
            <p className="text-center text-xl">{getLevelContent(card, false)}</p>
            <div className="mt-6 text-sm opacity-80">
              Уровень {card.currentLevel + 1} из 4
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
