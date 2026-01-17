export interface StatsOverview {
  meta: {
    generatedAt: string; // ISO
    timezone: string;
    period: 'week' | 'month';
    range: {
      from: string; // ISO
      to: string; // ISO
    };
  };

  overall: {
    totalCards: number;
    learnedCards: number;
    activeCards: number;
    learnedRatePct: number; // 0..100
  };

  activity: {
    streakDays: number;
    last7Days: Array<{
      date: string; // YYYY-MM-DD
      reviews: number;
      newCards: number;
    }>;
  };

  time: {
    today: {
      thinkMs: number;
      gradeMs: number;
      totalMs: number;
    };
    range: {
      thinkMs: number;
      gradeMs: number;
      totalMs: number;
    };
    avgPerReviewMs: {
      thinkMs: number;
      gradeMs: number;
      totalMs: number;
    };
  };

  pace?: {
    cardsPerMin: number;
    series: Array<{
      date: string; // YYYY-MM-DD
      cardsPerMin: number;
    }>;
  };
}

export type StatsPeriod = 'week' | 'month';

export interface CardReviewEventPayload {
  cardId: string;

  // timestamps in ISO format for reliable backend computation
  shownAt: string; // ISO
  revealedAt?: string; // ISO (optional if no explicit reveal)
  ratedAt: string; // ISO

  // the chosen difficulty/rating button
  rating: 'again' | 'hard' | 'good' | 'easy';

  // optional client metadata
  timezone?: string;
}
