import React from 'react';
import { Button } from '../components/Button/Button';
import { DeckCard } from '../components/DeckCard';
import { Clock, BookOpen, Flame, Trash2 } from 'lucide-react';
import './Dashboard.css';
import { ResumeSessionCard } from '../components/ResumeSession';
import { useGroupsCarousel } from './dashboard/useGroupsCarousel';
import type { DashboardModel, DashboardActions } from './dashboard/dashboard.types';

// Новый API
type DashboardViewProps = {
  model: DashboardModel;
  actions: DashboardActions;
};

function DashboardView({ model, actions }: DashboardViewProps) {
  const { carouselRef, onWheelCarousel, onMouseDown, onMouseMove, onMouseUpOrLeave } =
    useGroupsCarousel();

  const safeGroups = model.groups ?? [];
  const activeGroup = safeGroups.find((g) => g.id === model.activeGroupId) ?? null;

  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* stats */}
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__label">
                <BookOpen size={16} className="text-accent" />
                <span className="stat-card__meta">Изучено</span>
              </div>
              <p className="stat-value">{model.statistics.cardsStudiedToday}</p>
            </div>

            <div className="stat-card">
              <div className="stat-card__label">
                <Clock size={16} className="text-accent-2" />
                <span className="stat-card__meta">Минут</span>
              </div>
              <p className="stat-value">{model.statistics.timeSpentToday}</p>
            </div>

            <div className="stat-card">
              <div className="stat-card__label">
                <Flame size={16} className="text-accent-2" />
                <span className="stat-card__meta">Дней</span>
              </div>
              <p className="stat-value">{model.statistics.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* resume */}
      {model.resumeSession && (
        <ResumeSessionCard {...model.resumeSession} />
      )}

      {/* main CTA */}
      <div className="p-4 py-6 container-centered max-w-390">
        <Button onClick={actions.onStartStudy} variant="primary" size="large" fullWidth>
          Начать обучение
        </Button>
      </div>

      {/* groups */}
      <div className="groups-section">
        <div className="groups-container">
          <button className="groups-button groups-button-add" onClick={actions.onCreateGroup}>
            +
          </button>

          <div className="groups-carousel-wrapper">
            {safeGroups.length === 0 ? (
              <p className="groups-empty-message">Создайте первую группу</p>
            ) : (
              <div
                ref={carouselRef}
                className="groups-carousel"
                onWheel={onWheelCarousel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUpOrLeave}
                onMouseLeave={onMouseUpOrLeave}
              >
                {safeGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={'group-pill' + (g.id === model.activeGroupId ? ' group-pill--active' : '')}
                    onClick={() => actions.onGroupChange(g.id)}
                  >
                    {g.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="groups-button groups-button-delete"
            onClick={actions.onDeleteActiveGroup}
            disabled={!model.activeGroupId}
            title={!model.activeGroupId ? 'Нет активной группы' : 'Удалить группу'}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* decks */}
      <div className="p-4 container-centered max-w-390">
        <div className="space-y-3">
          {model.decks.map((deck) => (
            <DeckCard
              key={deck.deck_id}
              deck={deck}
              onClick={() => actions.onDeckClick(deck.deck_id)}
              onEdit={actions.onEditDeck ? () => actions.onEditDeck!(deck.deck_id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* add deck */}
      <div className="p-4 container-centered max-w-390" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button onClick={actions.onAddDeck} variant="primary" size="medium" fullWidth>
          Добавить колоду
        </Button>
      </div>
    </div>
  );
}

// Старый API (чтобы App пока не менять)
export type DashboardProps = DashboardModel & DashboardActions;

export function Dashboard(props: DashboardProps) {
  const { statistics, decks, groups, activeGroupId, resumeSession, ...rest } = props;

  return (
    <DashboardView
      model={{ statistics, decks, groups, activeGroupId, resumeSession }}
      actions={rest}
    />
  );
}
