import React from 'react';

import { createCard } from '@/entities/card';

export type CardsActionsApi = {
  onCreateCardSave: (cardData: any) => Promise<void>;
  onCreateCardSaveMany: (
    cards: any[],
  ) => Promise<{ created: number; failed: number; errors: string[] }>;
  onEditCardDone: () => void;
};

type Props = {
  refreshDecks: () => void;
  refreshStats: () => void;
  closeCreateCard: () => void;
  closeEditCard: () => void;
  children: (api: CardsActionsApi) => React.ReactNode;
};

export function CardsActionsContainer({
  refreshDecks,
  refreshStats,
  closeCreateCard,
  closeEditCard,
  children,
}: Props) {
  const onCreateCardSave = async (cardData: any) => {
    await createCard({
      deck_id: cardData.deckId,
      title: cardData.term,
      card_type: cardData.type,
      levels: cardData.levels,
    });

    refreshDecks();
    refreshStats();
    closeCreateCard();
  };

  const onCreateCardSaveMany = async (cards: any[]) => {
    const errors: string[] = [];
    let created = 0;

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      try {
        await createCard({
          deck_id: c.deckId,
          title: c.term,
          card_type: c.type,
          levels: c.levels,
        });
        created++;
      } catch (e: any) {
        errors.push(`${i}: ${String(e?.message ?? e)}`);
      }
    }

    refreshDecks();
    refreshStats();
    return { created, failed: errors.length, errors };
  };

  const onEditCardDone = () => {
    refreshDecks();
    refreshStats();
    closeEditCard();
  };

  return <>{children({ onCreateCardSave, onCreateCardSaveMany, onEditCardDone })}</>;
}
