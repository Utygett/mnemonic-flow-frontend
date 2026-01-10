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
                                cards={{ flow: cardsFlow, actions: cardsApi }}
                                decks={{ flow: decksFlow, actions: decksApi }}
                                data={{
                                  decks,
                                  groups,
                                  activeGroupId,
                                  currentGroupDeckIds,
                                  statistics,
                                  dashboardStats,
                                }}
                                status={{
                                  decksLoading,
                                  statsLoading,
                                  decksError,
                                  statsError,
                                }}
                                refresh={{
                                  refreshDecks,
                                  refreshGroups,
                                  refreshStats,
                                }}
                                groupsActions={{
                                  setActiveGroupId,
                                  deleteActiveGroup,
                                }}
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
