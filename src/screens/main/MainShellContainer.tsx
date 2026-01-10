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
import { DecksActionsContainer, DecksFlowContainer } from '../decks';
import { DecksFlowApi } from '../decks/DecksFlowContainer';
import { DecksActionsApi } from '../decks/DecksActionsContainer';
import { CardsFlowApi } from '../cards/CardsFlowContainer';
import { CardsActionsApi } from '../cards/CardsActionsContainer';

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

  useRegisterServiceWorker();
  const isPWA = useIsPWA();

  return (
    <StudyFlowStateContainer onExitToHome={() => setActiveTab('home')} onRated={refreshStats}>
      {(study) => (
        <DecksFlowContainer>
          {(decksFlow: DecksFlowApi) => (
            <DecksActionsContainer
              refreshDecks={refreshDecks}
              closeCreateDeck={decksFlow.closeCreateDeck}
              closeEditDeck={decksFlow.closeEditDeck}
            >
              {(decksApi: DecksActionsApi) => (
                <CardsFlowContainer>
                  {(cardsFlow: CardsFlowApi) => {
                    const hideBottomNav =
                      study.isStudying ||
                      decksLoading ||
                      statsLoading ||
                      Boolean(statsError) ||
                      cardsFlow.isCreatingCard ||
                      cardsFlow.isEditingCard ||
                      decksFlow.isCreatingDeck ||
                      decksFlow.isEditingDeck;

                    return (
                      <CardsActionsContainer
                        refreshDecks={refreshDecks}
                        refreshStats={refreshStats}
                        closeCreateCard={cardsFlow.closeCreateCard}
                        closeEditCard={cardsFlow.closeEditCard}
                      >
                        {(cardsApi: CardsActionsApi) => (
                          <MainShellView
                            hideBottomNav={hideBottomNav}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            content={
                              <MnemonicRootSwitch
                                study={study}
                                activeTab={activeTab}
                                isPWA={isPWA}

                                // cards flow (только команды, без setState)
                                isCreatingCard={cardsFlow.isCreatingCard}
                                isEditingCard={cardsFlow.isEditingCard}
                                openCreateCard={cardsFlow.openCreateCard}
                                closeCreateCard={cardsFlow.closeCreateCard}
                                openEditCard={cardsFlow.openEditCard}
                                closeEditCard={cardsFlow.closeEditCard}

                                // decks flow (только команды, без setState)
                                isCreatingDeck={decksFlow.isCreatingDeck}
                                isEditingDeck={decksFlow.isEditingDeck}
                                editingDeckId={decksFlow.editingDeckId}
                                openCreateDeck={decksFlow.openCreateDeck}
                                closeCreateDeck={decksFlow.closeCreateDeck}
                                openEditDeck={decksFlow.openEditDeck}
                                closeEditDeck={decksFlow.closeEditDeck}

                                // data
                                decks={decks}
                                groups={groups}
                                activeGroupId={activeGroupId}
                                setActiveGroupId={setActiveGroupId}
                                currentGroupDeckIds={currentGroupDeckIds}
                                statistics={statistics}
                                dashboardStats={dashboardStats}

                                // loading/errors
                                decksLoading={decksLoading}
                                statsLoading={statsLoading}
                                decksError={decksError}
                                statsError={statsError}

                                // refresh actions
                                refreshDecks={refreshDecks}
                                refreshGroups={refreshGroups}
                                refreshStats={refreshStats}
                                deleteActiveGroup={deleteActiveGroup}

                                // feature actions
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
        </DecksFlowContainer>
      )}
    </StudyFlowStateContainer>
  );
}
