// Card domain types
import type { CardContent } from '@/features/cards-flow/model/cardContentTypes';

export type StudyMode = 'random' | 'ordered' | 'new_random' | 'new_ordered';
export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';

export interface CardLevel {
  levelindex: number;
  content: CardContent;
}

export interface StudyCard {
  id: string;
  deckId: string;
  title: string;
  type: string;
  levels: CardLevel[];
  activeLevel: number;
}

export type StudyCardsResponse = {
  cards: StudyCard[];
};

// API-specific types
export type ApiLevelIn = {
  level_index: number;
  content: Record<string, unknown>;
};

export type ApiReplaceLevelsRequest = {
  levels: ApiLevelIn[];
};

export type ApiCreateCardRequest = {
  deck_id: string;
  title: string;
  card_type: string;
  levels: ApiLevelIn[];
};

export type ApiCreateCardResponse = {
  card_id: string;
  deck_id: string;
  title: string;
  card_type: string;
  levels: ApiLevelIn[];
};

// Helper functions
export function isMultipleChoice(card: StudyCard | null | undefined): boolean {
  return !!card && card.type === 'multiple_choice';
}
