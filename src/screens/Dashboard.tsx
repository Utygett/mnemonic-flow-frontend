// src/screens/Dashboard.tsx
import React from 'react';
import { Statistics, Deck, Group } from '../types';
import { Button } from '../components/Button/Button';
import { DeckCard } from '../components/DeckCard';
import { Clock, BookOpen, Flame, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import './Dashboard.css';
import { ResumeSessionCard } from '../components/ResumeSession';
import { useGroupsCarousel } from './dashboard/useGroupsCarousel';

type ResumeSessionProps = {
  title: string;
  subtitle: string;
  cardInfo: string;
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

  const { carouselRef, onWheelCarousel, onMouseDown, onMouseMove, onMouseUpOrLeave } = useGroupsCarousel();
  const safeGroups = groups ?? [];
  
  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* Header */}
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">

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
        <ResumeSessionCard
          title={resumeSession.title}
          subtitle={resumeSession.subtitle}
          cardInfo={resumeSession.cardInfo}
          onResume={resumeSession.onResume}
          onDiscard={resumeSession.onDiscard}
        />
      )}


      {/* Main CTA */}
      <div className="p-4 py-6 container-centered max-w-390">
        <Button onClick={onStartStudy} variant="primary" size="large" fullWidth>
          Начать обучение
        </Button>
      </div>

      {/* Groups */}
      <div className="groups-section">
        <div className="groups-container">
          {/* Кнопка добавления слева */}
          <button
            className="groups-button groups-button-add"
            onClick={onCreateGroup}
          >
            +
          </button>

          {/* Карусель групп по центру */}
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

          {/* Кнопка удаления справа */}
          <button
            className="groups-button groups-button-delete"
            onClick={onDeleteActiveGroup}
            disabled={!activeGroupId}
            title={!activeGroupId ? 'Нет активной группы' : 'Удалить группу'}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>





      {/* Decks of active group */}
      <div className="p-4 container-centered max-w-390">
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
