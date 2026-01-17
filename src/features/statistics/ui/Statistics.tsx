import React from 'react';

import {
  Trophy,
  Target,
  Zap,
  Flame,
  Timer,
  Brain,
  TrendingUp,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

import type { Deck, Statistics as StatsType } from '../../../types';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

export interface StatisticsProps {
  statistics: StatsType;
  decks: Deck[];
}

type StatCard = {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
};

type Period = 'week' | 'month';

export function Statistics({ statistics, decks }: StatisticsProps) {
  const [period, setPeriod] = React.useState<Period>('week');

  const totalProgress = decks.length
    ? decks.reduce((acc, deck) => acc + deck.progress, 0) / decks.length
    : 0;

  // Stub metrics (UI-first). Later can be wired to real backend stats.
  const cardsTotal = decks.reduce((acc, d) => acc + (d.cardsCount ?? 0), 0);
  const cardsLearned = Math.round((cardsTotal * totalProgress) / 100);
  const streakDays = 6;
  const focusedMinutes = period === 'week' ? 24 : 310;
  const recallRate = period === 'week' ? 82 : 76;
  const avgPerDay = period === 'week' ? 18 : 21;
  const bestDayLabel = 'Ср';

  // Mini progress chart (stub). Later can be derived from real history.
  const progressSeries = React.useMemo(() => {
    return period === 'week'
      ? [12, 18, 26, 33, 41, 47, 53]
      : [8, 12, 17, 22, 26, 31, 35, 39, 42, 46, 50, 53];
  }, [period]);

  const seriesMax = Math.max(...progressSeries, 1);

  const statCards: StatCard[] = [
    {
      label: 'Период',
      value: period === 'week' ? 'Неделя' : 'Месяц',
      hint: 'Переключатель влияет на заглушки и мини-график.',
      icon: <Sparkles size={18} />,
    },
    {
      label: 'Серия',
      value: `${streakDays} дн.`,
      hint: 'Сколько дней подряд были занятия (заглушка).',
      icon: <Flame size={18} />,
    },
    {
      label: 'Фокус',
      value: period === 'week' ? `${focusedMinutes} мин` : `${focusedMinutes} мин/мес`,
      hint: 'Время активной работы за период (заглушка).',
      icon: <Timer size={18} />,
    },
    {
      label: 'Повторение',
      value: `${recallRate}%`,
      hint: 'Условный процент правильных ответов (заглушка).',
      icon: <Brain size={18} />,
    },
    {
      label: 'Темп',
      value: `${avgPerDay}/день`,
      hint: 'Среднее число карточек в день (заглушка).',
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Лучший день',
      value: bestDayLabel,
      hint: 'День недели с максимумом активности (заглушка).',
      icon: <CalendarDays size={18} />,
    },
    {
      label: 'Изучено',
      value: `${cardsLearned}/${cardsTotal}`,
      hint: 'Оценка на основе прогресса колод (заглушка).',
      icon: <Target size={18} />,
    },
  ];

  const weeklyMax = Math.max(...statistics.weeklyActivity, 1);

  return (
    <div className="stats-page">
      <div className="page__header">
        <div className="page__header-inner statsHeader">
          <div>
            <h1 className="page__title">Статистика</h1>
            <div className="statsHeader__sub">Заглушки метрик — можно подключить API позже</div>
          </div>

          <div className="statsHeader__right">
            <div className="segmented" role="tablist" aria-label="Период">
              <button
                type="button"
                role="tab"
                aria-selected={period === 'week'}
                className={`segmented__btn ${period === 'week' ? 'segmented__btn--active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                Неделя
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={period === 'month'}
                className={`segmented__btn ${period === 'month' ? 'segmented__btn--active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                Месяц
              </button>
            </div>

            <div className="statsRing" aria-label="Общий прогресс">
              <svg className="statsRing__svg" width="76" height="76" viewBox="0 0 76 76">
                <circle
                  cx="38"
                  cy="38"
                  r="32"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="38"
                  cy="38"
                  r="32"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - totalProgress / 100)}`}
                  strokeLinecap="round"
                  className="statsRing__bar"
                />
              </svg>
              <div className="statsRing__center">
                <div className="statsRing__value">{Math.round(totalProgress)}%</div>
                <div className="statsRing__label">Общий</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 py-6 container-centered stats__content">
        {/* Mini chart */}
        <div className="card statsBlock">
          <div className="statsBlock__head">
            <h3 className="statsBlock__title">Прогресс</h3>
            <span className="statsBlock__chip">{period === 'week' ? '7 дней' : '12 точек'}</span>
          </div>

          <div className="miniChart" aria-label="Мини-график прогресса (заглушка)">
            {progressSeries.map((v, idx) => {
              const h = (v / seriesMax) * 100;
              return (
                <div key={idx} className="miniChart__col" aria-hidden="true">
                  <div className="miniChart__track">
                    <div className="miniChart__fill" style={{ height: `${h}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="miniChart__caption">Тренд прогресса за период (заглушка)</div>
        </div>

        {/* Quick metrics */}
        <div className="statsGrid">
          {statCards.map((c) => (
            <div key={c.label} className="card statCard" title={c.hint}>
              <div className="statCard__top">
                <div className="statCard__icon">{c.icon}</div>
                <div className="statCard__label">{c.label}</div>
              </div>
              <div className="statCard__value">{c.value}</div>
              <div className="statCard__hint">{c.hint}</div>
            </div>
          ))}
        </div>

        {/* Weekly Activity */}
        <div className="card statsBlock">
          <div className="statsBlock__head">
            <h3 className="statsBlock__title">Активность за неделю</h3>
            <span className="statsBlock__chip">{statistics.weeklyActivity.reduce((a, b) => a + b, 0)} действий</span>
          </div>

          <div className="statsBars">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
              const value = statistics.weeklyActivity[index] || 0;
              const height = (value / weeklyMax) * 100;

              return (
                <div key={day} className="statsBars__col">
                  <div className="statsBars__track" aria-hidden="true">
                    <div className="statsBars__fill" style={{ height: `${height}%` }} />
                  </div>
                  <div className="statsBars__meta">
                    <span className="statsBars__day">{day}</span>
                    <span className="statsBars__val">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decks Progress */}
        <div>
          <div className="statsSectionHead">
            <h3 className="statsSectionHead__title">Прогресс по темам</h3>
            <span className="statsSectionHead__sub">{decks.length} тем</span>
          </div>

          <div className="statsDecks">
            {decks.map((deck) => (
              <div key={deck.id} className="card statsDeck">
                <div className="statsDeck__row">
                  <div className="statsDeck__left">
                    <div className="statsDeck__title">{deck.name}</div>
                    <div className="statsDeck__meta">{deck.cardsCount} карточек</div>
                  </div>

                  <div className="statsDeck__right">
                    <div className="statsDeck__percent">{deck.progress}%</div>
                  </div>
                </div>

                <ProgressBar progress={deck.progress} color={deck.color} />

                <div className="statsDeck__levels">
                  <span className="statsDeck__levelsLabel">Уровни (заглушка):</span>
                  <div className="statsDeck__levelsList">
                    <span>0: {Math.round(deck.cardsCount * 0.3)}</span>
                    <span>1: {Math.round(deck.cardsCount * 0.3)}</span>
                    <span>2: {Math.round(deck.cardsCount * 0.2)}</span>
                    <span>3: {Math.round(deck.cardsCount * 0.2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="statsSectionHead">
            <h3 className="statsSectionHead__title">Достижения</h3>
            <span className="statsSectionHead__sub">Заглушки</span>
          </div>

          <div className="achievementsGrid">
            {statistics.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement ${achievement.unlocked ? '' : 'achievement--locked'}`}
              >
                <div className="achievement__icon">
                  {achievement.icon === 'trophy' && <Trophy size={22} className="text-white" />}
                  {achievement.icon === 'target' && <Target size={22} className="text-white" />}
                  {achievement.icon === 'zap' && <Zap size={22} className="text-white" />}
                </div>
                <div className="achievement__title">{achievement.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
