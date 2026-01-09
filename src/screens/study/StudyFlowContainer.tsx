import React from 'react';
import type { DifficultyRating, StudyCard } from '../../types';
import { StudySession } from '../StudySession';


type Props = {
  isStudying: boolean;
  loadingDeckCards: boolean;
  deckCards: StudyCard[];

  cards: StudyCard[];
  currentIndex: number;
  isCompleted: boolean;

  onRate: (r: DifficultyRating) => void;
  onLevelUp: () => void;
  onLevelDown: () => void;
  onSkip: () => void;
  onRemoveFromProgress: () => void;
  onClose: () => void;

  onBackToHome: () => void; // когда нет карточек / completed
};

export function StudyFlowContainer(props: Props) {
  if (!props.isStudying) return null;

  if (props.loadingDeckCards) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-[#9CA3AF]">Загрузка карточек…</div>
      </div>
    );
  }

  if (props.deckCards.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card text-center max-w-390">
          <h2 className="text-[#E8EAF0] mb-2">Нет карточек</h2>
          <p className="text-[#9CA3AF] mb-6">В этой сессии нет карточек для изучения.</p>
          <button className="btn-primary w-full" onClick={props.onBackToHome}>
            Вернуться
          </button>
        </div>
      </div>
    );
  }

  if (props.isCompleted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card text-center max-w-390">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="text-[#E8EAF0] mb-2">Сессия завершена</h2>
          <p className="text-[#9CA3AF] mb-6">Отличная работа! Ты прошёл все карточки.</p>
          <button className="btn-primary w-full" onClick={props.onBackToHome}>
            Вернуться в меню
          </button>
        </div>
      </div>
    );
  }

  if (props.cards.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-[#9CA3AF]">Нет карточек для изучения</div>
      </div>
    );
  }

  // тут импортируешь StudySession как сейчас
  

    return (
        <StudySession
            cards={props.cards}
            currentIndex={props.currentIndex}
            onRate={props.onRate}
            onLevelUp={props.onLevelUp}
            onLevelDown={props.onLevelDown}
            onClose={props.onClose}
            onSkip={props.onSkip}
            onRemoveFromProgress={props.onRemoveFromProgress}
        />
    );
}
