import React from 'react';

import { BottomNav } from '../../components/BottomNav';
import { InstallPrompt } from '../../components/InstallPrompt';
import { OfflineStatus } from '../overlays/OfflineStatus';
import { PWAUpdatePrompt } from '../overlays/PWAUpdatePrompt';

import type { MainShellViewProps } from './mainShell.types';

export function MainShellView(props: MainShellViewProps) {
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
