import React from 'react';

import type { StudyMode } from '../../../types';
import type { PersistedSession } from '../../../utils/sessionStore';

type Props = {
  deckId: string;
  limit: number;
  setLimit: (v: number) => void;

  saved: PersistedSession | null;
  hasSaved: boolean;

  limitClamped: number;

  onBack: () => void;
  onResume: () => void;
  onStart: (mode: StudyMode) => void;
};

export function DeckDetailsView(props: Props) {
  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <button className="btn-ghost" onClick={props.onBack} type="button">
            Назад
          </button>
          <h1 className="page__title">Колода</h1>
          <div style={{ color: '#9CA3AF', fontSize: 12 }}>id: {props.deckId}</div>
        </div>
      </div>

      <div className="container-centered max-w-390">
        <div className="actionsStackstudy" style={{ display: 'grid', gap: 20 }}>
          {props.hasSaved && props.saved && (
            <div className="card">
              <p className="text-[#E8EAF0]">Есть незавершённая сессия</p>
              <p className="text-[#9CA3AF]">
                Карточка {((props.saved.currentIndex ?? 0) + 1)} из {props.saved.deckCards.length}
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={props.onResume}>
                  Продолжить
                </button>
              </div>
            </div>
          )}

          <button className="btn btn--primary btn--full" onClick={() => props.onStart('random')}>
            Случайно
          </button>

          <button className="btn btn--secondary btn--full" onClick={() => props.onStart('ordered')}>
            По порядку
          </button>

          <button className="btn btn--secondary btn--full" onClick={() => props.onStart('new_random')}>
            Новые случайно
          </button>

          <button className="btn btn--secondary btn--full" onClick={() => props.onStart('new_ordered')}>
            Новые по порядку
          </button>

          <div className="card" style={{ marginTop: 8 }}>
            <div style={{ color: '#E8EAF0', fontSize: 14, marginBottom: 6 }}>
              Кол-во карточек для “Новые …”
            </div>

            <input
              className="input"
              type="number"
              min={1}
              max={200}
              value={String(props.limit)}
              onChange={(e) => props.setLimit(Number(e.target.value))}
              placeholder="Напр. 20"
            />

            <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 6 }}>
              Будет использовано: {props.limitClamped}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
