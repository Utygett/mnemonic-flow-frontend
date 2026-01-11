import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

import { Button } from '../../../shared/ui/Button/Button';
import { ApiClient } from '@/shared/api';
import { useAuth } from '../../../AuthContext';
import { PublicDeckSummary } from '../../../types';

import type { AddDeckProps } from '../model/types';

import './AddDeck.css';

export const AddDeck = ({
  groupId,
  initialGroupDeckIds = [],
  onClose,
  onChanged,
}: AddDeckProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [decks, setDecks] = useState<PublicDeckSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;
  const [hasMore, setHasMore] = useState(true);

  const [groupDeckIds, setGroupDeckIds] = useState<Set<string>>(
    () => new Set(initialGroupDeckIds),
  );

  const { currentUser } = useAuth();

  const filteredDecks = useMemo(
    () => decks.filter((d) => d.owner_id !== currentUser?.id),
    [decks, currentUser],
  );

  // если родитель может менять initialGroupDeckIds (например, после рефреша группы)
  useEffect(() => {
    setGroupDeckIds(new Set(initialGroupDeckIds));
  }, [initialGroupDeckIds]);

  // debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setHasMore(true);
    }, 400);

    return () => clearTimeout(t);
  }, [searchQuery]);

  // загрузка
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await ApiClient.searchPublicDecks({
          q: debouncedQuery,
          limit,
          offset: 0,
        });

        if (cancelled) return;

        setDecks(data);
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'Ошибка загрузки колод');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const currentOffset = decks.length;

      const data = await ApiClient.searchPublicDecks({
        q: debouncedQuery,
        limit,
        offset: currentOffset,
      });

      setDecks((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка загрузки колод');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (deckId: string) => {
    try {
      await ApiClient.addDeckToGroup(groupId, deckId);
      setGroupDeckIds((prev) => new Set(prev).add(deckId));
      onChanged?.(deckId, 'added');
    } catch (e: any) {
      alert(`Ошибка: ${e?.message ?? 'не удалось добавить колоду в группу'}`);
    }
  };

  const handleRemove = async (deckId: string) => {
    try {
      await ApiClient.removeDeckFromGroup(groupId, deckId);
      setGroupDeckIds((prev) => {
        const next = new Set(prev);
        next.delete(deckId);
        return next;
      });
      onChanged?.(deckId, 'removed');
    } catch (e: any) {
      alert(`Ошибка: ${e?.message ?? 'не удалось удалить колоду из группы'}`);
    }
  };

  return (
    <div className="add-deck-container">
      <div className="add-deck-header">
        <h2>Колоды группы</h2>
        <Button onClick={onClose} variant="secondary" size="small">
          Закрыть
        </Button>
      </div>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Поиск публичных колод..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="decks-list">
        {loading && decks.length === 0 ? (
          <div className="loading">Загрузка...</div>
        ) : decks.length === 0 ? (
          <div className="no-results">Колоды не найдены</div>
        ) : (
          <>
            {filteredDecks.map((deck) => {
              const inGroup = groupDeckIds.has(deck.deck_id);

              return (
                <div key={deck.deck_id} className="deck-card">
                  <div className="deck-info">
                    <h3 className="deck-title">{deck.title}</h3>
                    {deck.description ? (
                      <div className="deck-meta">
                        <span className="deck-author">{deck.description}</span>
                      </div>
                    ) : null}
                  </div>

                  {!inGroup ? (
                    <Button
                      onClick={() => handleAdd(deck.deck_id)}
                      variant="primary"
                      size="small"
                    >
                      <Plus size={16} />
                      Добавить
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRemove(deck.deck_id)}
                      variant="secondary"
                      size="small"
                    >
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <Button
                onClick={loadMore}
                variant="secondary"
                size="medium"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Загрузить ещё'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
