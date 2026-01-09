import React from 'react';

import { CreateCard } from '../CreateCard';
import { CreateDeck } from '../CreateDeck';
import { EditCardFlow } from '../EditCardFlow';
import { EditDeck } from '../EditDeck';
import { Statistics } from '../Statistics';

import { HomeTabContainer } from '../home/HomeTabContainer';
import { ProfileContainer } from '../profile/ProfileContainer';

import { ApiClient } from '../../api/client';

import type { MainTab } from './main.types';

type MnemonicRootSwitchProps = {
  // общие флаги/состояния
  activeTab: MainTab;
  isPWA: boolean;

  isCreatingCard: boolean;
  isEditingCard: boolean;
  isCreatingDeck: boolean;
  isEditingDeck: boolean;
  editingDeckId: string | null;

  // данные
  decks: any[];
  groups: any[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  currentGroupDeckIds: string[];
  statistics: any | null;
  dashboardStats: any;

  // loading/errors
  decksLoading: boolean;
  statsLoading: boolean;
  decksError: string | null;
  statsError: string | null;

  // callbacks верхнего уровня
  refreshDecks: () => void;
  refreshGroups: () => void;
  refreshStats: () => void;
  deleteActiveGroup: () => void;

  setIsCreatingCard: (v: boolean) => void;
  setIsEditingCard: (v: boolean) => void;
  setIsCreatingDeck: (v: boolean) => void;
  setIsEditingDeck: (v: boolean) => void;
  setEditingDeckId: (v: string | null) => void;

  openEditDeck: (deckId: string) => void;

  // из StudyFlow render-prop
  study: any;
};

export function MnemonicRootSwitch(props: MnemonicRootSwitchProps) {
  const {
    decksLoading,
    statsLoading,
    decksError,
    statsError,
    isCreatingCard,
    isCreatingDeck,
    isEditingDeck,
    editingDeckId,
    isEditingCard,
  } = props;

  if (decksLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-[#E8EAF0] mb-2">Ошибка загрузки</h2>
          <p className="text-[#9CA3AF] mb-4">{decksError || statsError}</p>
          <button onClick={() => { props.refreshDecks(); props.refreshStats(); }} className="btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (isCreatingCard) {
    return (
      <CreateCard
        decks={props.decks}
        onSave={async (cardData: { deckId: string; term: string; type: string; levels: Array<{ question: string; answer: string }> }) => {
          await ApiClient.createCard({
            deck_id: cardData.deckId,
            title: cardData.term,
            type: cardData.type,
            levels: cardData.levels,
          });

          props.refreshDecks();
          props.refreshStats();
          props.setIsCreatingCard(false);
        }}
        onSaveMany={async (
          cards: Array<{ deckId: string; term: string; type: 'flashcard'; levels: Array<{ question: string; answer: string }> }>
        ): Promise<{ created: number; failed: number; errors?: string[] }> => {
          const errors: string[] = [];
          let created = 0;

          for (let i = 0; i < cards.length; i++) {
            const c = cards[i];
            try {
              await ApiClient.createCard({
                deck_id: c.deckId,
                title: c.term,
                type: c.type,
                levels: c.levels,
              });
              created++;
            } catch (e: any) {
              errors.push(`${i}: ${String(e?.message ?? e)}`);
            }
          }

          props.refreshDecks();
          props.refreshStats();
          return { created, failed: errors.length, errors };
        }}
        onCancel={() => props.setIsCreatingCard(false)}
      />
    );
  }

  if (props.isCreatingDeck) {
    return (
      <CreateDeck
        onCancel={() => props.setIsCreatingDeck(false)}
        onSave={() => {
          props.refreshDecks();
          props.setIsCreatingDeck(false);
        }}
      />
    );
  }

  if (isEditingDeck && editingDeckId) {
    return (
      <EditDeck
        deckId={editingDeckId}
        onCancel={() => props.setIsEditingDeck(false)}
        onSaved={() => {
          props.refreshDecks();
          props.setIsEditingDeck(false);
        }}
      />
    );
  }

  if (isEditingCard) {
    return (
      <EditCardFlow
        decks={props.decks}
        onCancel={() => props.setIsEditingCard(false)}
        onDone={() => {
          props.refreshDecks();
          props.refreshStats();
          props.setIsEditingCard(false);
        }}
        onEditDeck={(deckId) => {
          props.setEditingDeckId(deckId);
          props.setIsEditingDeck(true);
        }}
      />
    );
  }

  // обычный режим: табы
  return (
    <>
      {props.isPWA && (
        <div className="fixed top-4 left-4 z-30">
          <div className="pwa-badge">PWA</div>
        </div>
      )}

      {props.activeTab === 'home' && (
        <HomeTabContainer
          statistics={props.dashboardStats}
          decks={props.decks}
          groups={props.groups}
          activeGroupId={props.activeGroupId}
          setActiveGroupId={props.setActiveGroupId}
          refreshGroups={props.refreshGroups}
          refreshDecks={props.refreshDecks}
          currentGroupDeckIds={props.currentGroupDeckIds}
          onDeleteActiveGroup={props.deleteActiveGroup}
          resumeCandidate={props.study.resumeCandidate}
          onResume={props.study.onResume}
          onDiscardResume={props.study.onDiscardResume}
          onStartReviewStudy={props.study.onStartReviewStudy}
          onStartDeckStudy={props.study.onStartDeckStudy}
          onResumeDeckSession={props.study.onResumeDeckSession}
          onRestartDeckSession={props.study.onRestartDeckSession}
          onOpenEditDeck={props.openEditDeck}
        />
      )}

      {props.activeTab === 'study' && (
        <div className="min-h-screen bg-dark pb-24">
          <header className="page__header">
            <div className="page__header-inner">
              <h1 className="page__title">Обучение</h1>
            </div>
          </header>

          <main className="container-centered max-w-390 py-6">
            <div className="text-center py-12">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
              <h2 style={{ marginBottom: '1rem', color: '#E8EAF0' }}>Создайте свою первую карточку</h2>
              <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>Начните изучение с создания карточек</p>

              <div className="actionsStack__study">
                <button onClick={() => props.setIsCreatingCard(true)} className="btn-primary">
                  Создать карточку
                </button>

                <button onClick={() => props.setIsCreatingDeck(true)} className="btn-primary">
                  Создать колоду
                </button>

                <button onClick={() => props.setIsEditingCard(true)} className="btn-primary">
                  Редактировать колоду
                </button>
              </div>

              {!props.isPWA && (
                <div className="mt-8 card">
                  <p style={{ color: '#9CA3AF', marginBottom: '0.5rem' }}>💡 Установите приложение для работы офлайн</p>
                  <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>Нажмите "Установить" в меню браузера</p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {props.activeTab === 'stats' && props.statistics && (
        <Statistics statistics={props.statistics} decks={props.decks} />
      )}

      {props.activeTab === 'profile' && <ProfileContainer isPWA={props.isPWA} />}
    </>
  );
}
