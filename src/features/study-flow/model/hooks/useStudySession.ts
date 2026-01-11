import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DifficultyRating, StudyCard } from '@/entities/card';
import { reviewCard } from '@/entities/card';

type Result = {
  cards: StudyCard[];
  currentIndex: number;
  isCompleted: boolean;
  rateCard: (rating: DifficultyRating) => Promise<void>;
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
    async (rating: DifficultyRating) => {
      const card = cards[currentIndex];
      if (!card) return;

      // server-side rating (non-blocking for UI)
      try {
        await reviewCard(card.id, rating);
      } catch {
        // ignore: rating is best-effort
      }

      setCurrentIndex((i) => i + 1);
    },
    [cards, currentIndex],
  );

  return { cards, currentIndex, isCompleted, rateCard, skipCard, resetSession };
}
