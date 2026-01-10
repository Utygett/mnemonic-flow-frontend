import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../api/client';
import { Statistics } from '../types';

export function useApiData<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fetchFn: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
}

export function useCards(deckId?: string) {
  const { data, loading, error, fetchData } = useApiData<Card[]>();

  const fetchCards = useCallback(async () => {
    const cards = await ApiClient.getCards(deckId);
    return cards.map(parseDatesInCard);
  }, [deckId]);

  useEffect(() => {
    fetchData(fetchCards);
  }, [deckId, fetchData, fetchCards]);

  const refresh = useCallback((): Promise<void> => {
    return fetchData(fetchCards);
  }, [fetchData, fetchCards]);

  return { cards: data || [], loading, error, refresh };
}


// export function useDecks() {
//   const { data, loading, error, fetchData } = useApiData<Deck[]>();

//   useEffect(() => {
//     fetchData(() => ApiClient.getDecks());
//   }, [fetchData]);

//   const refresh = useCallback(() => {
//     fetchData(() => ApiClient.getDecks());
//   }, [fetchData]);

//   return { decks: data || [], loading, error, refresh };
// }

export function useStatistics() {
  const { data, loading, error, fetchData } = useApiData<Statistics>();

  useEffect(() => {
    fetchData(() => ApiClient.getStatistics());
  }, [fetchData]);

  const refresh = useCallback((): Promise<void> => {
    return fetchData(() => ApiClient.getStatistics());
  }, [fetchData]);

  return { statistics: data, loading, error, refresh };
}


const parseDatesInCard = (card: any): Card => ({
  ...card,
  nextReview: new Date(card.nextReview),
  lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
});

