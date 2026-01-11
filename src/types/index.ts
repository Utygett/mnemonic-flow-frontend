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

// --- Deprecated shims ---
// Group- and deck-related types were moved into features to avoid a global types dump.
// Prefer importing from:
// - `features/group-create` (Group etc.)
// - `features/decks-flow` (Deck etc.)

export type { UserGroupResponse, GroupCreatePayload, Group } from '../features/group-create/model/groupTypes';
export type { PublicDeckSummary, Deck } from '../features/decks-flow/model/deckTypes';
