import React from 'react';

import {
  Trophy,
  Target,
  Zap,
  Flame,
  Timer,
  Brain,
  TrendingUp,
  Sparkles,
  Layers,
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

function safeNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function rotateToToday(values: number[]): number[] {
  // values are expected as [Mon..Sun]. Rotate so last element is today.
  const todayJs = new Date().getDay(); // 0=Sun..6=Sat
  const todayMon0 = (todayJs + 6) % 7; // 0=Mon..6=Sun
  const shift = (todayMon0 + 1) % 7; // move today to index 6
  const a = values.slice(0, 7);
  while (a.length < 7) a.push(0);
  return [...a.slice(shift), ...a.slice(0, shift)];
}

const DOW_RU_MON0 = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

function buildSparkPath(series: number[], width: number, height: number) {
  const values = series.map(safeNumber);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function Statistics({ statistics, decks }: StatisticsProps) {
  const [period, setPeriod] = React.useState<Period>('week');

  const totalProgressRaw = decks.length
    ? decks.reduce((acc, deck) => acc + safeNumber(deck.progress), 0) / decks.length
    : 0;
  const totalProgress = safeNumber(totalProgressRaw);

  const cardsTotal = decks.reduce((acc, d) => acc + safeNumber(d.cardsCount ?? 0), 0);
  const cardsLearned = Math.round((cardsTotal * totalProgress) / 100);

  const streakDays = 6;
  const focusedMinutes = period === 'week' ? 24 : 310;
  const recallRate = period === 'week' ? 82 : 76;
  const avgPerDay = period === 'week' ? 18 : 21;

  // Weekly activity: show last 7 days ending today.
  // Source array is assumed to be [Mon..Sun].
  const weeklyRaw = Array.isArray(statistics.weeklyActivity)
    ? statistics.weeklyActivity.map(safeNumber)
    : [];
  const weekly = rotateToToday(weeklyRaw);
  const weeklyMax = Math.max(...weekly, 1);
  const weeklySum = weekly.reduce((a, b) => a + safeNumber(b), 0);

  const todayJs = new Date().getDay(); // 0=Sun..6=Sat
  const todayMon0 = (todayJs + 6) % 7;
  const labels = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayMon0 - 6 + i + 7 * 10) % 7;
    return DOW_RU_MON0[idx];
  });

  // New chart metric: "Нагрузка" = карточки/минуту за период (заглушка), with sparkline.
  const paceSeries = React.useMemo(() => {
    // values: cards per minute
    return period === 'week'
      ? [0.2, 0.35, 0.28, 0.42, 0.55, 0.48, 0.6]
      : [0.18, 0.22, 0.2, 0.25, 0.29, 0.33, 0.31, 0.37, 0.42, 0.4, 0.46, 0.52];
  }, [period]);

  const paceAvg =
    paceSeries.length > 0
      ? paceSeries.reduce((a, b) => a + safeNumber(b), 0) / Math.max(paceSeries.length, 1)
      : 0;
  const paceCaption =
    period === 'week'
      ? 'Карточки/мин за последние 7 дней (заглушка)'
      : 'Карточки/мин за последние 4 недели (12 точек = 3 точки на неделю, заглушка)';

  const statCards: StatCard[] = [
    {
      label: 'Период',
      value: period === 'week' ? 'Неделя' : 'Месяц',
      hint: 'Переключатель влияет на заглушки и график.',
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
      label: 'Изучено',
      value: `${Number.isFinite(cardsLearned) ? cardsLearned : 0}/${cardsTotal}`,
      hint: 'Оценка на основе прогресса колод (заглушка).',
      icon: <Target size={18} />,
    },
  ];

  const sparkW = 320;
  const sparkH = 90;
  const sparkPath = buildSparkPath(paceSeries, sparkW, sparkH);

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
        {/* Chart: Pace */}
        <div className="card statsBlock">
          <div className="statsBlock__head">
            <h3 className="statsBlock__title">Нагрузка</h3>
            <span className="statsBlock__chip">{paceAvg.toFixed(2)} кард/мин</span>
          </div>

          <div className="spark" aria-label="График нагрузки (заглушка)">
            <svg className="spark__svg" viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none">
              <path d={sparkPath} className="spark__line" fill="none" />
            </svg>
          </div>
          <div className="spark__caption">{paceCaption}</div>
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

          <div className="card statCard" title="Сколько колод находится в активной работе (заглушка).">
            <div className="statCard__top">
              <div className="statCard__icon">
                <Layers size={18} />
              </div>
              <div className="statCard__label">Активные темы</div>
            </div>
            <div className="statCard__value">{Math.max(0, decks.filter((d) => safeNumber(d.progress) < 100).length)}</div>
            <div className="statCard__hint">Колод с прогрессом &lt; 100% (заглушка).</div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card statsBlock">
          <div className="statsBlock__head">
            <h3 className="statsBlock__title">Активность за 7 дней</h3>
            <span className="statsBlock__chip">{weeklySum} действий</span>
          </div>

          <div className="statsBars">
            {labels.map((day, index) => {
              const value = safeNumber(weekly[index]);
              const height = (value / weeklyMax) * 100;

              return (
                <div key={`${day}-${index}`} className="statsBars__col">
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
                    <div className="statsDeck__meta">{safeNumber(deck.cardsCount)} карточек</div>
                  </div>

                  <div className="statsDeck__right">
                    <div className="statsDeck__percent">{Math.round(safeNumber(deck.progress))}%</div>
                  </div>
                </div>

                <ProgressBar progress={safeNumber(deck.progress)} color={deck.color} />

                <div className="statsDeck__levels">
                  <span className="statsDeck__levelsLabel">Уровни (заглушка):</span>
                  <div className="statsDeck__levelsList">
                    <span>0: {Math.round(safeNumber(deck.cardsCount) * 0.3)}</span>
                    <span>1: {Math.round(safeNumber(deck.cardsCount) * 0.3)}</span>
                    <span>2: {Math.round(safeNumber(deck.cardsCount) * 0.2)}</span>
                    <span>3: {Math.round(safeNumber(deck.cardsCount) * 0.2)}</span>
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
