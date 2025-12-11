export interface Card {
  id: string;
  term: string;
  levels: {
    level0: string; // Простое определение
    level1: string; // Развернутое определение
    level2: string; // Контекстный вопрос
    level3: string; // Сложная задача
  };
  currentLevel: 0 | 1 | 2 | 3;
  nextReview: Date;
  lastReviewed?: Date;
  streak: number;
  deckId: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardsCount: number;
  progress: number; // 0-100
  averageLevel: number; // 0-3
  color: string;
}

export interface StudySession {
  cards: Card[];
  currentIndex: number;
  correctCount: number;
  totalCount: number;
}

export interface Statistics {
  cardsStudiedToday: number;
  timeSpentToday: number; // minutes
  currentStreak: number; // days
  totalCards: number;
  weeklyActivity: number[]; // 7 days
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';
