// src/api/client.ts
import { Statistics, DifficultyRating, UserGroupResponse, Group, GroupCreatePayload} from '../types';
import { PublicDeckSummary } from '../types';



export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token'); // как у тебя в других методах
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
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
    throw new ApiError(res.status, detail || `HTTP ${res.status}`, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}



export class ApiClient {
  static API_BASE_URL = '/api';

  // Получаем колоды пользователя
  static async getUserDecks(token: string): Promise<PublicDeckSummary[]> {
    const res = await fetch(`${this.API_BASE_URL}/decks/`, { // ✅ добавлен слеш
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch user decks: ${text}`);
    }

    return res.json();
  }
  // ------------------------
  // MOCK API для теста (Decks/Statistics/ReviewCards)
  // ------------------------

  static async getStatistics(): Promise<Statistics> {
    return {
      cardsStudiedToday: 5,
      timeSpentToday: 10,
      currentStreak: 2,
      totalCards: 20,
      weeklyActivity: [2, 4, 3, 5, 1, 0, 6],
      achievements: ['Первый успех', '10 карточек'],
    };
  }


  static async getDeckCards(deckId: string, token: string) {
    const res = await fetch(
      `${this.API_BASE_URL}/decks/${deckId}/cards`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch deck cards: ${text}`);
    }

    return res.json();  
  }
  static async reviewCard(cardId: string, rating: DifficultyRating) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No auth token');

    const res = await fetch(
      `${this.API_BASE_URL}/cards/${cardId}/review`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return res.json();
  }

  static async createCard(payload: {
  deck_id: string;
  title: string;
  type: string;
  levels: Array<{ question: string; answer: string }>;
}) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/cards/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create card: ${text}`);
  }

  return res.json();
}

// 1) Получить колоду с карточками+уровнями
static async getDeckWithCards(deckId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/decks/${deckId}/with_cards`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


static async replaceCardLevels(cardId: string, levels: Array<{ question: string; answer: string }>) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/cards/${cardId}/levels`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ levels }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to replace levels: ${text}`);
  }

  return res.json();
}

// deck mode: вся колода по created_at + все levels + active_level
static async getDeckSession(deckId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/decks/${deckId}/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

static async levelUp(cardId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/cards/${cardId}/level_up`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { active_level: number }
}

static async levelDown(cardId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/cards/${cardId}/level_down`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { active_level: number }
}

static async getReviewSession(limit = 20) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/cards/review_with_levels?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

  static async createDeck(payload: {
    title: string;
    description?: string | null;
    color?: string | null;
  }): Promise<PublicDeckSummary> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No auth token');

    const res = await fetch(`${this.API_BASE_URL}/decks/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to create deck: ${text}`);
    } 

    return res.json();
  }

  static async updateDeck(deckId: string, payload: { title?: string; description?: string | null; color?: string | null ; is_public?: boolean }): Promise<any> {
    return apiRequest<any>(`/decks/${deckId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }


  static async deleteCardProgress(cardId: string) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No auth token');

    const res = await fetch(`${this.API_BASE_URL}/cards/${cardId}/progress`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(await res.text());
  }


  static async deleteCard(cardId: string): Promise<void> {
    await apiRequest<void>(`/cards/${cardId}`, { method: 'DELETE' });
  }

  static async deleteDeck(deckId: string): Promise<void> {
    await apiRequest<void>(`/decks/${deckId}`, { method: 'DELETE' });
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

      // apiRequest сам добавит Bearer access_token и префикс /api
      return apiRequest<PublicDeckSummary[]>(`/decks/public?${usp.toString()}`);
    }

    static async addDeckToGroup(groupId: string, deckId: string): Promise<void> {
      await apiRequest<void>(`/groups/${groupId}/decks/${deckId}`, {
        method: 'PUT',
      });
    }

    static async removeDeckFromGroup(groupId: string, deckId: string): Promise<void> {
      await apiRequest<void>(`/groups/${groupId}/decks/${deckId}`, {
        method: 'DELETE',
      });
    }

  static async getUserGroups(): Promise<Group[]> {
    const data = await apiRequest<UserGroupResponse[]>(`/groups/`);
    return data.map(g => ({
      id: g.user_group_id,
      title: g.title,
      description: g.description,
      parent_id: g.parent_id,
      kind: g.kind,
      source_group_id: g.source_group_id,
    }));
  }

  static async getGroupDecksSummary(groupId: string): Promise<PublicDeckSummary[]> {
    // groupId здесь = user_group_id
    return apiRequest<PublicDeckSummary[]>(`/groups/${groupId}/decks/summary`);
  }

   static async createGroup(payload: GroupCreatePayload): Promise<Group> {
    return apiRequest<Group>(`/groups/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteGroup(groupId: string): Promise<void> {
    await apiRequest<void>(`/groups/${groupId}`, { method: 'DELETE' });
  }
}
