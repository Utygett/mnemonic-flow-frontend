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
