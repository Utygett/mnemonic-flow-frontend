import React, { useState } from 'react';

import { useStatistics } from '../../hooks';
import { useGroupsDecksController } from '../../hooks/useGroupsDecksController';
import { StudyFlowStateContainer } from '../study/StudyFlowStateContainer';
import { MainTabsView } from './MainTabsView';
import type { MainTab } from './main.types';
import { useIsPWA } from '../../app/pwa/useIsPWA';
import { useRegisterServiceWorker } from '../../app/pwa/useRegisterServiceWorker';
import { MnemonicRootSwitch } from './MnemonicRootSwitch';


export function MainTabsContainer() {
  const {
    groups,
    activeGroupId,
    setActiveGroupId,
    decks,
    decksLoading,
    decksError,
    refreshDecks,
    refreshGroups,
    deleteActiveGroup,
    currentGroupDeckIds,
  } = useGroupsDecksController();

  const { statistics, loading: statsLoading, error: statsError, refresh: refreshStats } = useStatistics();

  const dashboardStats = statistics ?? {
    cardsStudiedToday: 0,
    timeSpentToday: 0,
    currentStreak: 0,
    totalCards: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    achievements: [],
  };

  const [activeTab, setActiveTab] = useState<MainTab>('home');

  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);


  const [isCreatingDeck, setIsCreatingDeck] = useState(false); // пока у тебя нет отдельного экрана — оставлено как было
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);

    useRegisterServiceWorker();
    const isPWA = useIsPWA();
  const openEditDeck = (deckId: string) => {
    setEditingDeckId(deckId);
    setIsEditingDeck(true);
  };

  return (
    <StudyFlowStateContainer onExitToHome={() => setActiveTab('home')} onRated={refreshStats}>
      {(study) => {
        const hideBottomNav =
            study.isStudying ||
            decksLoading ||
            statsLoading ||
            Boolean(statsError) ||
            isCreatingCard ||
            isCreatingDeck ||
            isEditingCard ||
            isEditingDeck;
        
            const content = (
            <MnemonicRootSwitch
                study={study}
                activeTab={activeTab}
                isPWA={isPWA}

                isCreatingCard={isCreatingCard}
                isEditingCard={isEditingCard}
                isCreatingDeck={isCreatingDeck}
                isEditingDeck={isEditingDeck}
                editingDeckId={editingDeckId}

                decks={decks}
                groups={groups}
                activeGroupId={activeGroupId}
                setActiveGroupId={setActiveGroupId}
                currentGroupDeckIds={currentGroupDeckIds}
                statistics={statistics}
                dashboardStats={dashboardStats}

                decksLoading={decksLoading}
                statsLoading={statsLoading}
                decksError={decksError}
                statsError={statsError}

                refreshDecks={refreshDecks}
                refreshGroups={refreshGroups}
                refreshStats={refreshStats}
                deleteActiveGroup={deleteActiveGroup}

                setIsCreatingCard={setIsCreatingCard}
                setIsEditingCard={setIsEditingCard}
                setIsCreatingDeck={setIsCreatingDeck}
                setIsEditingDeck={setIsEditingDeck}
                setEditingDeckId={setEditingDeckId}

                openEditDeck={openEditDeck}
            />
            );

        return (
            <MainTabsView
                content={content}
                hideBottomNav={hideBottomNav}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
        );
      }}
    </StudyFlowStateContainer>
  );
}