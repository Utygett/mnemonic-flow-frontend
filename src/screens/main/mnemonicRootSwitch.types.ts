import type { MainTab } from './main.types';
import type { Group, Statistics as AppStatistics, Deck, PublicDeckSummary } from '../../types';
import type { StudyController } from '../study/StudyFlowStateContainer';

export type MnemonicRootSwitchProps = {
  activeTab: MainTab;
  isPWA: boolean;

  isCreatingCard: boolean;
  isEditingCard: boolean;
  isCreatingDeck: boolean;
  isEditingDeck: boolean;
  editingDeckId: string | null;

  decks: PublicDeckSummary[];
  groups: Group[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  currentGroupDeckIds: string[];

  statistics: AppStatistics | null;
  dashboardStats: AppStatistics;

  decksLoading: boolean;
  statsLoading: boolean;
  decksError: string | null;
  statsError: string | null;

  refreshDecks: () => void;
  refreshGroups: () => void;
  refreshStats: () => void;
  deleteActiveGroup: () => void;

  setIsCreatingCard: (v: boolean) => void;
  setIsEditingCard: (v: boolean) => void;
  setIsCreatingDeck: (v: boolean) => void;
  setIsEditingDeck: (v: boolean) => void;
  setEditingDeckId: (v: string | null) => void;

  openEditDeck: (deckId: string) => void;

  study: StudyController;

    onCreateCardSave: (cardData: any) => Promise<void>;
    onCreateCardSaveMany: (cards: any[]) => Promise<{ created: number; failed: number; errors?: string[] }>;

    onDeckCreated: () => void;
    onDeckSaved: () => void;

    onEditCardDone: () => void;
};
