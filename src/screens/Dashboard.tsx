// src/screens/Dashboard.tsx
import React from 'react';
import { Statistics, Deck, Group } from '../types';
import { Button } from '../components/Button/Button';
import { DeckCard } from '../components/DeckCard';
import { Clock, BookOpen, Flame } from 'lucide-react';
import { useRef } from 'react';
import './Dashboard.css';

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
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const onWheelCarousel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    // horizontal scroll by vertical wheel movement
    carouselRef.current.scrollBy({ left: e.deltaY, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDownRef.current = true;
    carouselRef.current.classList.add('dragging');
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDownRef.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1; // drag speed
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const onMouseUpOrLeave = () => {
    if (!carouselRef.current) return;
    isDownRef.current = false;
    carouselRef.current.classList.remove('dragging');
  };

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
            🗑️
          </button>
        </div>
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
