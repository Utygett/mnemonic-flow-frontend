import React, { useMemo, useState } from 'react';
import type { StudyMode } from '../../types';
import { loadSession, type PersistedSession } from '../../utils/sessionStore';

type Props = {
  deckId: string;
  onBack: () => void;
  onStart: (mode: StudyMode, limit?: number) => void;
  onResume: (saved: PersistedSession) => void;
  clearSavedSession: () => void; // без deckId
};

export function DeckDetailsScreen(props: Props) {
  const [limit, setLimit] = useState<number>(20);
  const [sessionVersion, setSessionVersion] = useState(0);

  const key = `deck:${props.deckId}` as const;

  const saved = useMemo(() => loadSession(key), [key, sessionVersion]);
  const hasSaved = !!saved && (saved.deckCards?.length ?? 0) > 0;

  const limitClamped = useMemo(() => {
    const n = Number(limit);
    if (!Number.isFinite(n)) return 20;
    return Math.max(1, Math.min(200, Math.trunc(n)));
  }, [limit]);

  const start = (mode: StudyMode) => {
    if (hasSaved) {
      props.clearSavedSession();
      setSessionVersion((v) => v + 1);          // чтобы UI перестал показывать saved
    }

    if (mode === 'new_random' || mode === 'new_ordered') props.onStart(mode, limitClamped);
    else props.onStart(mode);
  };


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
          {hasSaved && (
            <div className="card">
              <p className="text-[#E8EAF0]">Есть незавершённая сессия</p>
              <p className="text-[#9CA3AF]">
                Карточка {((saved!.currentIndex ?? 0) + 1)} из {saved!.deckCards.length}
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={() => props.onResume(saved!)}>
                  Продолжить
                </button>
              </div>
            </div>
          )}
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
