import React from 'react';
import type { StudyMode } from '../../types';

export function DeckDetailsScreen({
  deckId,
  onBack,
  onStart,
}: {
  deckId: string;
  onBack: () => void;
  onStart: (mode: StudyMode) => void;
}) {
  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <button className="btn-ghost" onClick={onBack} type="button">Назад</button>
          <h1 className="page__title">Колода</h1>
          <div style={{ color: '#9CA3AF', fontSize: 12 }}>id: {deckId}</div>
        </div>
      </div>

      <div className="container-centered max-w-390">
        <div className="actionsStackstudy">
          <button className="btn btn--primary btn--full" onClick={() => onStart('random')}>Случайно</button>
          <button className="btn btn--secondary btn--full" onClick={() => onStart('ordered')}>По порядку</button>
          <button className="btn btn--secondary btn--full" onClick={() => onStart('new_random')}>Новые случайно (20)</button>
          <button className="btn btn--secondary btn--full" onClick={() => onStart('new_ordered')}>Новые по порядку (20)</button>
        </div>
      </div>
    </div>
  );
}
