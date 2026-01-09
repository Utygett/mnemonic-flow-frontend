// src/screens/main/MainShellContainer.tsx
import React, { useState } from 'react';

import { useStatistics } from '../../hooks';
import { useGroupsDecksController } from '../../hooks/useGroupsDecksController';

import { StudyFlowStateContainer } from '../study/StudyFlowStateContainer';
import { MainShellView } from './MainShellView';
import type { MainTab } from './mainShell.types';

import { useIsPWA } from '../../app/pwa/useIsPWA';
import { useRegisterServiceWorker } from '../../app/pwa/useRegisterServiceWorker';

import { MnemonicRootSwitch } from './MnemonicRootSwitch';

import { CardsActionsContainer, CardsFlowContainer } from '../cards';
import { DecksActionsContainer } from '../decks';

export function MainShellContainer() {
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

  const { statistics, loading: statsLoading, error: statsError, refresh: refreshStats } =
    useStatistics();

  const dashboardStats =
    statistics ?? {
      cardsStudiedToday: 0,
      timeSpentToday: 0,
      currentStreak: 0,
      totalCards: 0,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      achievements: [],
    };

  const [activeTab, setActiveTab] = useState<MainTab>('home');

  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
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
      {(study) => (
        <DecksActionsContainer
          refreshDecks={refreshDecks}
          closeCreateDeck={() => setIsCreatingDeck(false)}
          closeEditDeck={() => setIsEditingDeck(false)}
        >
          {(decksApi: any) => (
            <CardsFlowContainer>
              {(cardsFlow: any) => {
                const hideBottomNav =
                  study.isStudying ||
                  decksLoading ||
                  statsLoading ||
                  Boolean(statsError) ||
                  cardsFlow.isCreatingCard ||
                  isCreatingDeck ||
                  cardsFlow.isEditingCard ||
                  isEditingDeck;

                return (
                  <CardsActionsContainer
                    refreshDecks={refreshDecks}
                    refreshStats={refreshStats}
                    closeCreateCard={cardsFlow.closeCreateCard}
                    closeEditCard={cardsFlow.closeEditCard}
                  >
                    {(cardsApi: any) => (
                      <MainShellView
                        hideBottomNav={hideBottomNav}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        content={
                          <MnemonicRootSwitch
                            study={study}
                            activeTab={activeTab}
                            isPWA={isPWA}
                            // cards UI state теперь приходит из CardsFlowContainer
                            isCreatingCard={cardsFlow.isCreatingCard}
                            isEditingCard={cardsFlow.isEditingCard}
                            openCreateCard={cardsFlow.openCreateCard}
                            closeCreateCard={cardsFlow.closeCreateCard}
                            openEditCard={cardsFlow.openEditCard}
                            closeEditCard={cardsFlow.closeEditCard}
                            // decks UI state пока остаётся в main (следующий шаг вынесем аналогично)
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
                            // decks setters пока оставляем как есть
                            setIsCreatingDeck={setIsCreatingDeck}
                            setIsEditingDeck={setIsEditingDeck}
                            setEditingDeckId={setEditingDeckId}
                            openEditDeck={openEditDeck}
                            // actions приходят из контейнеров действий
                            onCreateCardSave={cardsApi.onCreateCardSave}
                            onCreateCardSaveMany={cardsApi.onCreateCardSaveMany}
                            onEditCardDone={cardsApi.onEditCardDone}
                            onDeckCreated={decksApi.onDeckCreated}
                            onDeckSaved={decksApi.onDeckSaved}
                          />
                        }
                      />
                    )}
                  </CardsActionsContainer>
                );
              }}
            </CardsFlowContainer>
          )}
        </DecksActionsContainer>
      )}
    </StudyFlowStateContainer>
  );
}
