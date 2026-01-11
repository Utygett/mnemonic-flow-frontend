import { apiRequest } from '@/shared/api/request';

import { getDeckWithCards, deleteDeck } from '@/entities/deck';
import { replaceCardLevels as replaceCardLevelsApi, deleteCard as deleteCardApi } from '@/entities/card';
import type { ApiLevelIn } from '@/entities/card';

export async function loadDeckWithCards(deckId: string) {
  return getDeckWithCards(deckId);
}

export async function replaceCardLevels(cardId: string, levels: ApiLevelIn[]) {
  return replaceCardLevelsApi(cardId, levels);
}

export async function deleteCard(cardId: string) {
  return deleteCardApi(cardId);
}

export async function deleteDeckById(deckId: string) {
  return deleteDeck(deckId);
}

export async function updateCardTitle(cardId: string, title: string) {
  // Backend supports PATCH with title in query
  const qs = new URLSearchParams({ title });
  await apiRequest<void>(`/cards/${cardId}?${qs.toString()}`, {
    method: 'PATCH',
  });
}
