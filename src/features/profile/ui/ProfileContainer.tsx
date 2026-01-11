import React, { useEffect, useState } from 'react';

import { apiRequest } from '@/shared/api';

import { ProfileView } from './ProfileView';
import type { ApiHealth } from '../model/types';

type ProfileContainerProps = {
  isPWA: boolean;
};

export function ProfileContainer(props: ProfileContainerProps) {
  const [apiHealth, setApiHealth] = useState<ApiHealth>('checking');

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Expected to return 200 when backend is up
        await apiRequest<void>(`/health`);
        setApiHealth('healthy');
      } catch (error) {
        setApiHealth('unhealthy');
        console.warn('API is unavailable, using fallback data');
      }
    };

    void checkApiHealth();
  }, []);

  return (
    <ProfileView
      apiHealth={apiHealth}
      isPWA={props.isPWA}
      initials="У"
      name="АБД"
      email="user@example.com"
      version="1.0.0"
    />
  );
}
