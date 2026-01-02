// src/hooks/useDecks.ts
import { useState, useEffect, useCallback} from 'react';
import { DeckSummary } from '../types';
import { ApiClient } from '../api/client';

export default function useDecks(groupId: string | null) {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
      if (!groupId) return;          // ключевой guard
      setLoading(true);
      setError(null);
      try {
        const data = await ApiClient.getGroupDecksSummary(groupId);
        setDecks(data);
      } finally {
        setLoading(false);
      }
    }, [groupId]);

    useEffect(() => {
      if (!groupId) return;          // guard и здесь тоже можно
      refresh();
    }, [groupId, refresh]);

    return { decks, loading, error, refresh };
}
