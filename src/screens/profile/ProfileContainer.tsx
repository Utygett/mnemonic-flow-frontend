import React, { useEffect, useState } from 'react';

import { ApiClient } from '../../api/client';
import { ProfileView } from './ProfileView';
import type { ApiHealth } from './profile.types';

type ProfileContainerProps = {
  isPWA: boolean;
};

export function ProfileContainer(props: ProfileContainerProps) {
  const [apiHealth, setApiHealth] = useState<ApiHealth>('checking');

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await ApiClient.healthCheck();
        setApiHealth('healthy');
      } catch (error) {
        setApiHealth('unhealthy');
        console.warn('API is unavailable, using fallback data');
      }
    };

    checkApiHealth();
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
