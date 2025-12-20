// src/components/FlipCard.tsx
import React from 'react';
import { StudyCard } from '../types';
import { motion } from 'motion/react';
import { MarkdownView } from './MarkdownView';


interface FlipCardProps {
  card: StudyCard;
  isFlipped: boolean;
  onFlip: () => void;

  onLevelUp?: () => void;
  onLevelDown?: () => void;
}


export function FlipCard({ card, isFlipped, onFlip, onLevelUp, onLevelDown }: FlipCardProps) 
{
  const level =
    card.levels.find(l => l.level_index === card.activeLevel) ??
    card.levels[0];

  const frontText = level?.content?.question || card.title || '…';
  const backText = level?.content?.answer || '…';

  const hasPrev = card.levels.some(l => l.level_index === card.activeLevel - 1);
  const hasNext = card.levels.some(l => l.level_index === card.activeLevel + 1);

  const canDown = hasPrev;
  const canUp = hasNext;


  return (
    <div className="flipcard-container">
      <motion.div className="flipcard" onClick={onFlip} style={{ perspective: 1000 }}>
        <motion.div
          className="flipcard__inner"
          initial={false}
          animate={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="flipcard__side flipcard__front">
            <div className="flipcard__text">
              <MarkdownView value={frontText} />
            </div>
            <div className="flipcard__hint">Нажмите, чтобы увидеть ответ</div>
          </div>
          {/* Back Side */}
          <div className="flipcard__side flipcard__back">
            {(canDown || canUp) && (
              <div className="flipcard__level-controls" onClick={(e) => e.stopPropagation()}>
                {canDown ? (
                  <button className="flipcard__level-btn flipcard__level-btn--left" onClick={onLevelDown}>
                    &lt; проще
                  </button>
                ) : (
                  <div />
                )}

                {canUp ? (
                  <button className="flipcard__level-btn flipcard__level-btn--right" onClick={onLevelUp}>
                    сложнее &gt;
                  </button>
                ) : (
                  <div />
                )}
              </div>
            )}
            <div className="flipcard__text">
              <MarkdownView value={backText} />
            </div>
            <div className="flipcard__hint">
              Уровень {card.activeLevel + 1} из {card.levels.length}
            </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}
