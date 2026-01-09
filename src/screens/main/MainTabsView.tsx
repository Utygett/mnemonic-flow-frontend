import React from 'react';

import { BottomNav } from '../../components/BottomNav';
import { InstallPrompt } from '../../components/InstallPrompt';
import { OfflineStatus } from '../../app/overlays/OfflineStatus';
import { PWAUpdatePrompt } from '../../app/overlays/PWAUpdatePrompt';

import type { MainTabsViewProps } from './main.types';

export function MainTabsView(props: MainTabsViewProps) {
  return (
    <div className="relative">
      <PWAUpdatePrompt />
      <OfflineStatus />

      {props.content}

      {!props.hideBottomNav && (
        <BottomNav activeTab={props.activeTab} onTabChange={props.onTabChange} />
      )}
      <InstallPrompt />
    </div>
  );
}
