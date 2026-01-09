import type { CardContent, PublicDeckSummary } from './index';

export type ApiCardLevelContent = {
  level_index: number;
  content: CardContent;
};

export type ApiCardSummary = {
  card_id: string;
  title: string;
  type: string;
  levels?: ApiCardLevelContent[];
};

export type ApiDeckWithCards = {
  deck: PublicDeckSummary;
  cards: ApiCardSummary[];
};

export type ApiLevelIn = {
  level_index: number;
  content: CardContent;
};

export type ApiReplaceLevelsRequest = {
  levels: ApiLevelIn[];
};


export type ApiCreateCardLevelOption = { id: string; text: string };

export type ApiCreateCardLevelRequest = {
  question: string;

  // flashcard
  answer?: string | null;

  // multiple_choice
  options?: ApiCreateCardLevelOption[] | null;
  correctOptionId?: string | null;
  explanation?: string | null;

  // ВАЖНО: на create у тебя timerSec >= 1, поэтому 0 не шлём (оставляем undefined)
  timerSec?: number;
};

export type ApiCreateCardRequest = {
  deck_id: string;
  title: string;
  type: string;
  levels: ApiCreateCardLevelRequest[];
};

export type ApiCreateCardResponse = {
  card_id: string;
  deck_id: string;
};
