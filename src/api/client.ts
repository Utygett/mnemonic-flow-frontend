// src/api/client.ts
import {
  Statistics,
  DifficultyRating,
  UserGroupResponse,
  Group,
  GroupCreatePayload,
} from '../types';
import { PublicDeckSummary, StudyCard, StudyMode } from '../types';
import type { ApiDeckWithCards } from '../types/api';


export type StudyCardsResponse = {
  cards: StudyCard[];
};

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}


async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new ApiError(401, 'No refresh token');

  const res = await fetch(`/api/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refresh}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const j = await res.json();
      detail = typeof j?.detail === 'string' ? j.detail : undefined;
    } catch {
      // ignore
    }

    // refresh протух/невалидный — чистим токены
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    throw new ApiError(res.status, detail || `HTTP ${res.status}`, detail);
  }

  const data = await res.json();
  const newAccess = String(data?.access_token ?? '');
  const newRefresh = String(data?.refresh_token ?? refresh);

  if (!newAccess) throw new ApiError(500, 'Refresh returned empty access_token');

  localStorage.setItem('access_token', newAccess);
  localStorage.setItem('refresh_token', newRefresh);

  return newAccess;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = async () => {
    const token = localStorage.getItem('access_token');

    return fetch(`/api${path}`, {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  };

  // 1) первая попытка
  let res = await doFetch();

  // 2) если access протух — пробуем refresh ОДИН раз и повторяем запрос
  if (res.status === 401) {
    try {
      await refreshAccessToken();
      res = await doFetch();
    } catch (e) {
      throw e;
    }
  }

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const j = await res.json();
      detail = typeof j?.detail === 'string' ? j.detail : undefined;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail || `HTTP ${res.status}`, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiClient {
  // ============================
  // Decks
  // ============================
  static async getUserDecks(): Promise<PublicDeckSummary[]> {
    return apiRequest<PublicDeckSummary[]>(`/decks/`);
  }

  // static async getDeckCards(deckId: string): Promise<unknown> {
  //   return apiRequest<unknown>(`/decks/${deckId}/cards`);
  // }

  static async getDeckWithCards(deckId: string): Promise<ApiDeckWithCards> {
    return apiRequest<ApiDeckWithCards>(`/decks/${deckId}/with_cards`);
  }
  
  // static async getDeckSession(deckId: string): Promise<unknown> {
  //   return apiRequest<unknown>(`/decks/${deckId}/session`);
  // }


  static async createDeck(payload: {
    title: string;
    description?: string | null;
    color?: string | null;
  }): Promise<PublicDeckSummary> {
    return apiRequest<PublicDeckSummary>(`/decks/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

static async updateDeck(
  deckId: string,
  payload: {
    title?: string;
    description?: string | null;
    color?: string | null;
    is_public?: boolean;
  }
): Promise<PublicDeckSummary> {
  return apiRequest<PublicDeckSummary>(`/decks/${deckId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}


  static async deleteDeck(deckId: string): Promise<void> {
    return apiRequest<void>(`/decks/${deckId}`, { method: 'DELETE' });
  }

  static async searchPublicDecks(params: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<PublicDeckSummary[]> {
    const usp = new URLSearchParams();
    const q = params.q?.trim();
    if (q) usp.set('q', q);

    usp.set('limit', String(params.limit ?? 20));
    usp.set('offset', String(params.offset ?? 0));

    return apiRequest<PublicDeckSummary[]>(`/decks/public?${usp.toString()}`);
  }

  static async getStudyCards(
    deckId: string,
    params: { mode: StudyMode; limit?: number; seed?: number }
  ): Promise<StudyCardsResponse> {
    const qs = new URLSearchParams();
    qs.set('mode', params.mode);
    qs.set('include', 'full');
    if (params.limit != null) qs.set('limit', String(params.limit));
    if (params.seed != null) qs.set('seed', String(params.seed));

    return apiRequest<StudyCardsResponse>(`/decks/${deckId}/study-cards?${qs.toString()}`);
  }

  // ============================
  // Cards
  // ============================
  static async reviewCard(cardId: string, rating: DifficultyRating) {
    return apiRequest(`/cards/${cardId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  static async createCard(payload: {
    deck_id: string;
    title: string;
    type: string;
    levels: Array<{ question: string; answer: string }>;
  }) {
    return apiRequest(`/cards/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async replaceCardLevels(
    cardId: string,
    levels: Array<{ question: string; answer: string }>
  ) {
    return apiRequest(`/cards/${cardId}/levels`, {
      method: 'PUT',
      body: JSON.stringify({ levels }),
    });
  }

  static async levelUp(cardId: string) {
    return apiRequest(`/cards/${cardId}/level_up`, { method: 'POST' });
  }

  static async levelDown(cardId: string) {
    return apiRequest(`/cards/${cardId}/level_down`, { method: 'POST' });
  }

  static async getReviewSession(limit = 20) {
    return apiRequest(`/cards/review_with_levels?limit=${limit}`);
  }

  static async deleteCardProgress(cardId: string) {
    return apiRequest<void>(`/cards/${cardId}/progress`, { method: 'DELETE' });
  }

  static async deleteCard(cardId: string): Promise<void> {
    return apiRequest<void>(`/cards/${cardId}`, { method: 'DELETE' });
  }

  // ============================
  // Groups
  // ============================
  static async getUserGroups(): Promise<Group[]> {
    const data = await apiRequest<UserGroupResponse[]>(`/groups/`);
    return data.map((g) => ({
      id: g.user_group_id,
      title: g.title,
      description: g.description,
      parent_id: g.parent_id,
      kind: g.kind,
      source_group_id: g.source_group_id,
    }));
  }

  static async getGroupDecksSummary(groupId: string): Promise<PublicDeckSummary[]> {
    return apiRequest<PublicDeckSummary[]>(`/groups/${groupId}/decks/summary`);
  }

  static async createGroup(payload: GroupCreatePayload): Promise<Group> {
    return apiRequest<Group>(`/groups/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteGroup(groupId: string): Promise<void> {
    return apiRequest<void>(`/groups/${groupId}`, { method: 'DELETE' });
  }

  static async addDeckToGroup(groupId: string, deckId: string): Promise<void> {
    return apiRequest<void>(`/groups/${groupId}/decks/${deckId}`, {
      method: 'PUT',
    });
  }

  static async removeDeckFromGroup(groupId: string, deckId: string): Promise<void> {
    return apiRequest<void>(`/groups/${groupId}/decks/${deckId}`, {
      method: 'DELETE',
    });
  }

  // ============================
  // Mock / Statistics (если нужно, тоже можешь перевести на apiRequest)
  // ============================
  static async getStatistics(): Promise<Statistics> {
    return {
      cardsStudiedToday: 6,
      timeSpentToday: 15,
      currentStreak: 4,
      totalCards: 20,
      weeklyActivity: [2, 4, 3, 5, 1, 0, 50],
      achievements: [
        {
          id: 'first',
          title: 'Первый успех',
          description: 'Первое достижение',
          icon: '⭐',
          unlocked: true,
        },
        {
          id: 'ten',
          title: '10 карточек',
          description: 'Изучено 10 карточек',
          icon: '🔟',
          unlocked: true,
        },
      ],
    };
  }
}
