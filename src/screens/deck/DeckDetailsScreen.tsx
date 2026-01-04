import React, { useMemo, useState } from 'react';
import type { StudyMode } from '../../types';

export function DeckDetailsScreen({
  deckId,
  onBack,
  onStart,
}: {
  deckId: string;
  onBack: () => void;
  onStart: (mode: StudyMode, limit?: number) => void; // <-- добавили limit
}) {
  const [limit, setLimit] = useState<number>(20);

  const limitClamped = useMemo(() => {
    const n = Number(limit);
    if (!Number.isFinite(n)) return 20;
    return Math.max(1, Math.min(200, Math.trunc(n)));
  }, [limit]);

  const start = (mode: StudyMode) => {
    if (mode === 'new_random' || mode === 'new_ordered') {
      onStart(mode, limitClamped);
    } else {
      onStart(mode);
    }
  };

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <button className="btn-ghost" onClick={onBack} type="button">
            Назад
          </button>
          <h1 className="page__title">Колода</h1>
          <div style={{ color: '#9CA3AF', fontSize: 12 }}>id: {deckId}</div>
        </div>
      </div>

      <div className="container-centered max-w-390">
        <div className="actionsStackstudy" style={{ display: 'grid', gap: 20 }}>
          <button className="btn btn--primary btn--full" onClick={() => start('random')}>
            Случайно
          </button>

          <button className="btn btn--secondary btn--full" onClick={() => start('ordered')}>
            По порядку
          </button>

          <button className="btn btn--secondary btn--full" onClick={() => start('new_random')}>
            Новые случайно
          </button>

          <button className="btn btn--secondary btn--full" onClick={() => start('new_ordered')}>
            Новые по порядку
          </button>

          {/* limit field */}
          <div className="card" style={{ marginTop: 8 }}>
            <div style={{ color: '#E8EAF0', fontSize: 14, marginBottom: 6 }}>
              Кол-во карточек для “Новые …”
            </div>

            <input
              className="input"
              type="number"
              min={1}
              max={200}
              value={String(limit)}
              onChange={(e) => setLimit(Number(e.target.value))}
              placeholder="Напр. 20"
            />

            <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 6 }}>
              Будет использовано: {limitClamped}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
