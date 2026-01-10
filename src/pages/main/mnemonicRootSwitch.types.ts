import type { MainTab } from './mainShell.types';
import type { CardsFlowApi, CardsActionsApi } from '../cards';
import type { DecksFlowApi, DecksActionsApi } from '../decks';

export type MnemonicRootSwitchProps = {
  study: any; // оставь как у тебя тип study
  activeTab: MainTab;
  isPWA: boolean;

  cards: {
    flow: CardsFlowApi;
    actions: CardsActionsApi;
  };

  decks: {
    flow: DecksFlowApi;
    actions: DecksActionsApi;
  };

  data: {
    decks: any[];
    groups: any[];
    activeGroupId: string | null;
    currentGroupDeckIds: string[];
    statistics: any;
    dashboardStats: any;
  };

  status: {
    decksLoading: boolean;
    statsLoading: boolean;
    decksError: any;
    statsError: any;
  };

  refresh: {
    refreshGroups: () => Promise<void>;
    refreshDecks: () => Promise<void>;
    refreshStats: () => Promise<void>;
  };

  groupsActions: {
    setActiveGroupId: (id: string | null) => void;
    deleteActiveGroup: () => Promise<void>;
  };
};
