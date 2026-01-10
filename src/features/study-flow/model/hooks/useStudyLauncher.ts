import { useCallback } from 'react';

import { ApiClient } from '../../../../api/client';
import { toStudyCards } from '../../../../utils/toStudyCards';
import { clearSession, type PersistedSession } from '../../../../utils/sessionStore';
import type { StudyCard, StudyMode } from '../../../../types';

type Input = {
  setLoadingDeckCards: (v: boolean) => void;
  setDeckCards: (v: StudyCard[]) => void;
  setActiveDeckId: (v: string | null) => void;

  setIsStudying: (v: boolean) => void;

  setSessionMode: (v: 'deck' | 'review') => void;
  setSessionKey: (v: 'review' | `deck:${string}`) => void;
  setSessionIndex: (v: number) => void;
};

export function useStudyLauncher(input: Input) {
  const startDeckStudy = useCallback(
    async (deckId: string, mode: StudyMode, limit?: number) => {
      const key = `deck:${deckId}` as const;

      const seed = mode === 'random' || mode === 'new_random' ? Date.now() % 1_000_000_000 : undefined;

      const limitNormalized =
        mode === 'new_random' || mode === 'new_ordered'
          ? Math.max(1, Math.min(200, Math.trunc(Number.isFinite(Number(limit)) ? Number(limit) : 20)))
          : undefined;

      try {
        input.setLoadingDeckCards(true);

        const res = await ApiClient.getStudyCards(deckId, {
          mode,
          seed,
          limit: limitNormalized,
        });

        input.setDeckCards(res.cards);
        input.setActiveDeckId(deckId);
        input.setSessionMode('deck');
        input.setSessionKey(key);
        input.setSessionIndex(0);

        if (res.cards.length > 0) input.setIsStudying(true);
      } finally {
        input.setLoadingDeckCards(false);
      }
    },
    [input]
  );

  const startReviewStudy = useCallback(async () => {
    try {
      input.setLoadingDeckCards(true);

      const items = await ApiClient.getReviewSession(20);
      input.setDeckCards(toStudyCards(items));
      input.setActiveDeckId(null);

      input.setIsStudying(true);
      input.setSessionMode('review');
      input.setSessionKey('review');
      input.setSessionIndex(0);
    } finally {
      input.setLoadingDeckCards(false);
    }
  }, [input]);

  const resumeDeckSession = useCallback(
    (saved: PersistedSession) => {
      input.setSessionMode(saved.mode);
      input.setSessionKey(saved.key);
      input.setActiveDeckId(saved.activeDeckId);
      input.setSessionIndex(saved.currentIndex ?? 0);
      input.setDeckCards(saved.deckCards ?? []);
      input.setIsStudying(true);
    },
    [input]
  );

  const restartDeckSession = useCallback((deckId: string) => {
    clearSession(`deck:${deckId}` as const);
  }, []);

  return { startDeckStudy, startReviewStudy, resumeDeckSession, restartDeckSession };
}
