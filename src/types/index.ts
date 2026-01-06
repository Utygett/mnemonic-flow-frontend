export type StudyMode = 'random' | 'ordered' | 'new_random' | 'new_ordered';

export type CardType = "flashcard" | "multiple_choice";

export type FlashcardContent = {
  question: string;
  answer: string;
  // можно хранить, но пока не используем для flashcard
  timerSec?: number;
};

export type McqOption = { id: string; text: string };

export type MultipleChoiceContent = {
  question: string;
  options: McqOption[];
  correctOptionId: string;
  explanation?: string;
  timerSec?: number;
};

export type CardContent = FlashcardContent | MultipleChoiceContent;


export type UserGroupResponse = {
  user_group_id: string;
  kind: string;
  source_group_id: string | null;
  title: string;
  description: string | null;
  parent_id: string | null;
};

export type GroupCreatePayload = {
  title: string;
  description?: string | null;
  parent_id?: string | null;
};

export type Group = {
  id: string;              // user_group_id
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
  is_public: boolean;
  count_repeat: number;
  count_for_repeat: number;
  cards_count: number;
  completed_cards_count: number;
};


export interface CardLevel {
  levelindex: number;
  content: CardContent;
}


// helper’ы (удобно для StudySession/Create/Edit)
export function isMultipleChoice(card: StudyCard | null | undefined): boolean {
  return !!card && card.type === "multiple_choice";
}

export interface StudyCard {
  id: string;
  deckId: string;
  title: string;
  type: string;
  levels: CardLevel[];
  activeLevel: number;
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

export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';