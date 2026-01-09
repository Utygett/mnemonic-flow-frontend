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
