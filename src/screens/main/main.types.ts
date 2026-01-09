import React from 'react';

export type MainTab = 'home' | 'study' | 'stats' | 'profile';

export type MainTabsViewProps = {
  content: React.ReactNode;
  hideBottomNav: boolean;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};
