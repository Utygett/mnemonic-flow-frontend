import React from 'react';
import { ApiClient } from '../../api/client';

export type CardsActionsApi = {
  onCreateCardSave: (cardData: any) => Promise<void>;
  onCreateCardSaveMany: (cards: any[]) => Promise<{ created: number; failed: number; errors: string[] }>;
  onEditCardDone: () => void;
};


export function CardsActionsContainer({
  refreshDecks,
  refreshStats,
  closeCreateCard,
  closeEditCard,
  children,
}) {
  const onCreateCardSave = async (cardData) => {
    await ApiClient.createCard({
      deck_id: cardData.deckId,
      title: cardData.term,
      type: cardData.type,
      levels: cardData.levels,
    });

    refreshDecks();
    refreshStats();
    closeCreateCard();
  };

  const onCreateCardSaveMany = async (cards) => {
    const errors = [];
    let created = 0;

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      try {
        await ApiClient.createCard({
          deck_id: c.deckId,
          title: c.term,
          type: c.type,
          levels: c.levels,
        });
        created++;
      } catch (e) {
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

  return children({ onCreateCardSave, onCreateCardSaveMany, onEditCardDone });
}
