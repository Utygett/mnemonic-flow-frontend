import React from 'react';

import { CreateCard, EditCardFlow } from '../cards';
import { CreateDeck, EditDeck } from '../decks';
import { Statistics } from '../stats';

import { HomeTabContainer } from '../home/HomeTabContainer';
import { ProfileContainer } from '../profile/ProfileContainer';

import type { MnemonicRootSwitchProps } from './mnemonicRootSwitch.types';


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

  if (decksError || statsError) {
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
        onSave={props.onCreateCardSave}
        onSaveMany={props.onCreateCardSaveMany}
        onCancel={() => props.setIsCreatingCard(false)}
      />
    );
  }

  if (props.isCreatingDeck) {
    return (
      <CreateDeck
        onCancel={() => props.setIsCreatingDeck(false)}
        onSave={props.onDeckCreated}
      />
    );
  }

  if (isEditingDeck && editingDeckId) {
    return (
      <EditDeck
        deckId={editingDeckId}
        onCancel={() => props.setIsEditingDeck(false)}
        onSaved={props.onDeckSaved}
      />
    );
  }

  if (isEditingCard) {
    return (
      <EditCardFlow
        decks={props.decks}
        onCancel={() => props.setIsEditingCard(false)}
        onDone={props.onEditCardDone}

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
