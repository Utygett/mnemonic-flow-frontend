import React from 'react';

import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';

import { AppRouter } from './app/AppRouter';
import { MainTabsContainer } from './screens/main/MainTabsContainer';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter
        renderMain={() => (
          <AuthGate>
            <MainTabsContainer />
          </AuthGate>
        )}
      />
    </AuthProvider>
  );
}
