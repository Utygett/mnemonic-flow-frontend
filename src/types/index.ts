export type UserGroupResponse = {
  user_group_id: string;
  kind: string;
  source_group_id: string | null;
  title: string;
  description: string | null;
  parent_id: string | null;
};

export type Group = {
  id: string; // это user_group_id
  title: string;
  description: string | null;
  parent_id: string | null;
  kind: string;
  source_group_id: string | null;
};

export type PublicDeckSummary = {
  deck_id: string;
  title: string;
  description: string | null;
  color: string | null;
  owner_id: string;
};


export interface CardLevel {
  level_index: number;
  content: { question: string; answer: string };
}

export interface StudyCard {
  id: string;
  deckId: string;
  title: string;
  type: string;
  levels: CardLevel[];     // все уровни
  activeLevel: number;     // текущий уровень пользователя (CardProgress.active_level)
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

export interface DeckSummary {
  deck_id: string;
  title: string;
}

export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';