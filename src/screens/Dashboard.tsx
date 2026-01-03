// src/screens/Dashboard.tsx
import React from 'react';
import { Statistics, Deck, Group } from '../types';
import { Button } from '../components/Button/Button';
import { DeckCard } from '../components/DeckCard';
import { Clock, BookOpen, Flame } from 'lucide-react';


type ResumeSessionProps = {
  title: string;
  subtitle: string;
  onResume: () => void;
  onDiscard: () => void;
};

export interface DashboardProps {
  statistics: Statistics;
  decks: Deck[];
  groups: Group[];
  activeGroupId: string | null;
  onGroupChange: (groupId: string) => void;

  onStartStudy: () => void;
  onDeckClick: (deckId: string) => void;
  onEditDeck?: (deckId: string) => void;

  resumeSession?: ResumeSessionProps;
  onCreateDeck: () => void;
  onAddDesk: () => void;
  onCreateGroup: () => void;
  onDeleteActiveGroup: () => void; // <-- добавь
}

export function Dashboard({
  statistics,
  decks,
  groups,
  activeGroupId,
  onGroupChange,
  onStartStudy,
  onDeckClick,
  resumeSession,
  onCreateDeck,
  onAddDesk,
  onEditDeck,
  onCreateGroup,
  onDeleteActiveGroup,
}: DashboardProps) {
  
  const safeGroups = groups ?? [];
  const activeGroup = safeGroups.find((g) => g.id === activeGroupId) ?? null;

  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* Header */}
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <h1 className="page__title mb-6">AdaptiveRecall</h1>

          {/* Today's Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__label">
                <BookOpen size={16} className="text-accent" />
                <span className="stat-card__meta">Изучено</span>
              </div>
              <p className="stat-value">{statistics.cardsStudiedToday}</p>
            </div>

            <div className="stat-card">
              <div className="stat-card__label">
                <Clock size={16} className="text-accent-2" />
                <span className="stat-card__meta">Минут</span>
              </div>
              <p className="stat-value">{statistics.timeSpentToday}</p>
            </div>

            <div className="stat-card">
              <div className="stat-card__label">
                <Flame size={16} className="text-accent-2" />
                <span className="stat-card__meta">Дней</span>
              </div>
              <p className="stat-value">{statistics.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume session */}
      {resumeSession && (
        <div className="container-centered max-w-390 mx-auto mb-4">
          <div className="card text-center">
            <h3 className="text-[#E8EAF0] mb-1">{resumeSession.title}</h3>
            <p className="text-[#9CA3AF] mb-3">{resumeSession.subtitle}</p>
            <div className="flex gap-2 justify-center">
              <button className="btn-primary" onClick={resumeSession.onResume}>
                Продолжить
              </button>
              <button className="btn-ghost" onClick={resumeSession.onDiscard}>
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main CTA */}
      <div className="p-4 py-6 container-centered max-w-390">
        <Button onClick={onStartStudy} variant="primary" size="large" fullWidth>
          Начать обучение
        </Button>
      </div>

      {/* Groups */}
      <div className="p-4 container-centered max-w-390">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[#E8EAF0]">Мои группы</h2>

          <div className="flex gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={onDeleteActiveGroup}
                disabled={!activeGroupId}
                title={!activeGroupId ? 'Нет активной группы' : 'Удалить группу'}
              >
                −
              </Button>

              <Button
                variant="secondary"
                size="small"
                onClick={onCreateGroup}
              >
                +
              </Button>
            </div>
        </div>

        {safeGroups.length === 0 ? (
          <p className="text-[#9CA3AF] text-sm">
            У вас пока нет групп. Создайте первую, чтобы организовать колоды.
          </p>
        ) : (
          <div className="groups-row">
            {safeGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={
                  'group-pill' + (g.id === activeGroupId ? ' group-pill--active' : '')
                }
                onClick={() => onGroupChange(g.id)}
              >
                {g.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decks of active group */}
      <div className="p-4 container-centered max-w-390">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#E8EAF0]">
            {activeGroup ? activeGroup.title : 'Колоды'}
          </h2>
        </div>

        <div className="space-y-3">
          {decks.map((deck) => (
            <DeckCard
              key={deck.deck_id}
              deck={deck}
              onClick={() => onDeckClick(deck.deck_id)}
              onEdit={onEditDeck ? () => onEditDeck(deck.deck_id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Add deck button */}
      <div
        className="p-4 container-centered max-w-390"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Button onClick={onAddDesk} variant="primary" size="medium" fullWidth>
          Добавить колоду
        </Button>
      </div>
    </div>
  );
}
