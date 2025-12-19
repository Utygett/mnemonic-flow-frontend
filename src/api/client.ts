// src/api/client.ts
import { Deck, Statistics, DifficultyRating} from '../types';
import { DeckSummary } from '../types';


export class ApiClient {
  static API_BASE_URL = 'http://localhost:8000';

  // Получаем колоды пользователя
  static async getUserDecks(token: string): Promise<DeckSummary[]> {
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
  static async getDecks(): Promise<Deck[]> {
    return [
      { id: '1', name: 'Колода 1', cards: [] },
      { id: '2', name: 'Колода 2', cards: [] },
    ];
  }

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

// 1) Получить колоду с карточками+уровнями через /cards/?deck_id=...
static async getDeckWithCards(deckId: string) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${this.API_BASE_URL}/cards/?deck_id=${deckId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch deck: ${text}`);
  }
  return res.json(); // DeckWithCards[]
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

}
