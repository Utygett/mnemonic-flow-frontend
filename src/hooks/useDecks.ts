import { useState, useEffect, useCallback } from 'react';
import type { PublicDeckSummary } from '../types';
import { ApiClient, ApiError } from '../api/client';

export type UseDecksResult = {
  decks: PublicDeckSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export default function useDecks(groupId: string | null): UseDecksResult {
  const [decks, setDecks] = useState<PublicDeckSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ApiClient.getGroupDecksSummary(groupId);
      setDecks(data);
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.detail ?? e.message);
      else setError('Не удалось загрузить колоды');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      setDecks([]);
      setError(null);
      setLoading(false);
      return;
    }
    refresh();
  }, [groupId, refresh]);

  return { decks, loading, error, refresh };
}
