import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CardReview, DifficultyRating, StudyCard } from '@/entities/card';
import { reviewCardWithMeta } from '@/entities/card';

type Result = {
  cards: StudyCard[];
  currentIndex: number;
  isCompleted: boolean;
  rateCard: (
    rating: DifficultyRating,
    timing?: { shownAt: string; revealedAt?: string; ratedAt: string }
  ) => Promise<void>;
  skipCard: () => void;
  resetSession: () => void;
};

export function useStudySession(deckCards: StudyCard[], initialIndex: number): Result {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex ?? 0);

  useEffect(() => {
    setCurrentIndex(initialIndex ?? 0);
  }, [initialIndex]);

  const cards = useMemo(() => deckCards ?? [], [deckCards]);

  const isCompleted = cards.length > 0 ? currentIndex >= cards.length : false;

  const skipCard = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const rateCard = useCallback(
    async (rating: DifficultyRating, timing?: { shownAt: string; revealedAt?: string; ratedAt: string }) => {
      const card = cards[currentIndex];
      if (!card) return;

      const nowIso = new Date().toISOString();

      const payload: CardReview = {
        rating,
        shownAt: timing?.shownAt ?? nowIso,
        revealedAt: timing?.revealedAt,
        ratedAt: timing?.ratedAt ?? nowIso,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // server-side rating (non-blocking for UI)
      try {
        await reviewCardWithMeta(card.id, payload);
      } catch {
        // ignore: rating is best-effort
      }

      setCurrentIndex((i) => i + 1);
    },
    [cards, currentIndex],
  );

  return { cards, currentIndex, isCompleted, rateCard, skipCard, resetSession };
}
