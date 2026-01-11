import { ApiClient } from '@/shared/api';
import type { ApiLevelIn } from '../../../types/api';

export async function loadDeckWithCards(deckId: string) {
  return ApiClient.getDeckWithCards(deckId);
}

export async function replaceCardLevels(cardId: string, levels: ApiLevelIn[]) {
  return ApiClient.replaceCardLevels(cardId, levels);
}

export async function deleteCard(cardId: string) {
  return ApiClient.deleteCard(cardId);
}

export async function deleteDeck(deckId: string) {
  return ApiClient.deleteDeck(deckId);
}

export async function updateCardTitle(cardId: string, title: string) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`/api/cards/${cardId}?title=${encodeURIComponent(title)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}
