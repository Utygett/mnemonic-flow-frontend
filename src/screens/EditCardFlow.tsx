import React, { useEffect, useMemo, useState } from 'react';
import type { PublicDeckSummary } from '../types';
import { ApiClient } from '../api/client';
import { Input } from '../components/Input';
import { Button } from '../components/Button/Button';
import { MarkdownField } from '../components/MarkdownField';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
type LevelQA = { question: string; answer: string };
type CardSummary = {
  card_id: string;
  title: string;
  type: string;
  levels?: Array<{ level_index: number; content: any }>;
};

interface Props {
  decks: PublicDeckSummary[];
  onCancel: () => void;
  onDone: () => void;
  onEditDeck?: (deckId: string) => void;
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function EditCardFlow({ decks, onCancel, onDone, onEditDeck }: Props) {
  const defaultDeckId = useMemo(() => decks?.[0]?.deck_id ?? '', [decks]);
  const [deckId, setDeckId] = useState(defaultDeckId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [cards, setCards] = useState<CardSummary[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  const selectedCard = useMemo(
    () => cards.find(c => c.card_id === selectedCardId) || null,
    [cards, selectedCardId]
  );

  const [activeLevel, setActiveLevel] = useState(0);
  const [levels, setLevels] = useState<LevelQA[]>([{ question: '', answer: '' }]);

  const [titleDraft, setTitleDraft] = useState('');

  const [qPreview, setQPreview] = useState(false);
  const [aPreview, setAPreview] = useState(false);
  const { currentUser } = useAuth();
  // если decks пришли позже и deckId пустой — выставим дефолт
  useEffect(() => {
    if (!deckId && defaultDeckId) setDeckId(defaultDeckId);
  }, [deckId, defaultDeckId]);

  // загрузка карточек выбранной колоды
  useEffect(() => {
    if (!deckId) return;

    (async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const deck = await ApiClient.getDeckWithCards(deckId); // DeckWithCards
        setCards(deck.cards ?? []);;
        setSelectedCardId('');
        setLevels([{ question: '', answer: '' }]);
        setActiveLevel(0);
      } catch (e: any) {
        setErrorText(e?.message ?? 'Ошибка загрузки карточек');
        setCards([]);
        setSelectedCardId('');
      } finally {
        setLoading(false);
      }
    })();
  }, [deckId]);

  // когда выбрали карточку — заполняем уровни (по индексу)
  useEffect(() => {
    if (!selectedCard) return;

    const sorted = [...(selectedCard.levels ?? [])].sort((a, b) => a.level_index - b.level_index);

    const mapped: LevelQA[] =
      sorted.length > 0
        ? sorted.map(l => ({
            question: String(l.content?.question ?? ''),
            answer: String(l.content?.answer ?? ''),
          }))
        : [{ question: '', answer: '' }];

    setLevels(mapped);
    setActiveLevel(0);
  }, [selectedCardId]);

  useEffect(() => {
    const c = cards.find(x => x.card_id === selectedCardId);
    setTitleDraft(c?.title ?? '');
  }, [selectedCardId, cards]);

  const patchLevel = (index: number, patch: Partial<LevelQA>) => {
    setLevels(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addLevel = () => {
    if (levels.length >= 10) return;
    setLevels(prev => [...prev, { question: '', answer: '' }]);
    setActiveLevel(levels.length);
  };

  const removeLevel = (index: number) => {
    if (levels.length <= 1) return;
    setLevels(prev => prev.filter((_, i) => i !== index));
    setActiveLevel(prev => {
      const nextLen = levels.length - 1;
      return Math.min(prev, nextLen - 1);
    });
  };

  // Перемещение уровня с корректной поправкой activeLevel
  const moveLevel = (from: number, to: number) => {
    if (to < 0 || to >= levels.length || from === to) return;

    setLevels(prev => moveItem(prev, from, to));

    setActiveLevel(prev => {
      // если активный — двигаем вместе с ним
      if (prev === from) return to;

      // если активный оказался "перекрыт" перемещением — корректируем
      // from -> to вниз: элементы между (from+1..to) сдвигаются вверх на 1
      if (from < to && prev > from && prev <= to) return prev - 1;

      // from -> to вверх: элементы между (to..from-1) сдвигаются вниз на 1
      if (to < from && prev >= to && prev < from) return prev + 1;

      return prev;
    });
  };

  const cleaned = useMemo(
    () =>
      levels
        .map(l => ({ question: l.question.trim(), answer: l.answer.trim() }))
        .filter(l => l.question && l.answer),
    [levels]
  );

  const canSave = Boolean(selectedCard) && cleaned.length > 0 && !saving;

  const saveCard = async () => {
    if (!selectedCardId) return;

    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No auth token');

    setSaving(true);
    setErrorText(null);

    try {
      // 1) обновляем title
      const t = titleDraft.trim();
      if (!t) throw new Error('Название обязательно');

      const patchRes = await fetch(
        `/api/cards/${selectedCardId}?title=${encodeURIComponent(t)}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!patchRes.ok) throw new Error(await patchRes.text());

      // 2) обновляем уровни (как у тебя уже сделано)
      await ApiClient.replaceCardLevels(selectedCardId, levels);

      // 3) чтобы селект карточек обновил текст — обнови локальный cards
      setCards(prev => prev.map(c => (
        c.card_id === selectedCardId ? { ...c, title: t } : c
      )));
    } catch (e: any) {
      setErrorText(e?.message ?? 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };


  const active = levels[activeLevel];


  const humanizeDeleteError = (e: any, what: 'card' | 'deck') => {
    const status = e?.status;
    if (status === 403) return what === 'card'
      ? 'Нельзя удалить карточку: вы не хозяин.'
      : 'Нельзя удалить колоду: вы не хозяин.';
    if (status === 404) return 'Объект не найден (возможно, уже удалён).';
    return e?.message ?? 'Ошибка удаления';
  };

  const deleteSelectedCard = async () => {
    if (!selectedCard) return;
    if (!window.confirm('Удалить карточку?')) return;

    setSaving(true);
    setErrorText(null);
    try {
      await ApiClient.deleteCard(selectedCard.card_id);

      setCards(prev => prev.filter(c => c.card_id !== selectedCard.card_id));
      setSelectedCardId('');
      setLevels([{ question: '', answer: '' }]);
      setActiveLevel(0);
    } catch (e: any) {
      setErrorText(humanizeDeleteError(e, 'card'));
    } finally {
      setSaving(false);
    }
  };

  const deleteCurrentDeck = async () => {
    if (!deckId) return;
    if (!window.confirm('Удалить колоду и все её карточки?')) return;

    setSaving(true);
    setErrorText(null);
    try {
      await ApiClient.deleteDeck(deckId);

      // Локально очищаем, а список колод пусть перезагрузит родитель
      setCards([]);
      setSelectedCardId('');
      setLevels([{ question: '', answer: '' }]);
      setActiveLevel(0);

      onDone();
    } catch (e: any) {
      setErrorText(humanizeDeleteError(e, 'deck'));
    } finally {
      setSaving(false);
    }
  };




  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page__header-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onCancel} style={{ color: '#9CA3AF', background: 'transparent', border: 0 }}>
              <X size={24} />
            </button>
            <h2 style={{ color: '#E8EAF0' }}>Редактирование уровней</h2>
            <div style={{ width: 24 }} />
          </div>
        </div>
      </div>

      <main className="container-centered max-w-390 space-y-6 py-6">
        {errorText && (
          <div className="card" style={{ border: '1px solid rgba(229,62,62,0.4)' }}>
            <div style={{ color: '#FEB2B2' }}>{errorText}</div>
          </div>
        )}



        {/* Deck */}
        <div className="form-row">
          <label className="form-label">Колода</label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="input"
              disabled={decks.length === 0 || saving}
              style={{ flex: 1 }}
            >
              {decks.length === 0 ? (
                <option value="">Нет доступных колод</option>
              ) : (
                decks.map(d => (
                  <option key={d.deck_id} value={d.deck_id}>{d.title}</option>
                ))
              )}
            </select>

            <button
              onClick={deleteCurrentDeck}
              disabled={!deckId || decks.length === 0 || saving}
              title="Удалить колоду"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: '1px solid rgba(229,62,62,0.35)',
                background: 'transparent',
                color: '#E53E3E',
                opacity: (!deckId || decks.length === 0 || saving) ? 0.4 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>
            {/* Edit deck button (shows only for owner) */}
            {(() => {
              const currentDeck = decks.find(d => d.deck_id === deckId);
              const isOwner = !!(currentDeck && currentUser && currentUser.id === currentDeck.owner_id);
              return isOwner && onEditDeck && deckId ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDeck(deckId);
                  }}
                  title="Редактировать колоду"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid rgba(156,163,175,0.12)',
                    background: 'transparent',
                    color: '#E8EAF0',
                  }}
                >
                  <Pencil size={18} />
                </button>
              ) : null;
            })()}
          </div>
        </div>

        {/* Card */}
        <div className="form-row">
          <label className="form-label">Карточка</label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="input"
              disabled={loading || cards.length === 0 || saving}
              style={{ flex: 1 }}
            >
              <option value="">{loading ? 'Загрузка…' : 'Выбери карточку'}</option>
              {cards.map(c => (
                <option key={c.card_id} value={c.card_id}>{c.title}</option>
              ))}
            </select>

            <button
              onClick={deleteSelectedCard}
              disabled={!selectedCard || saving}
              title="Удалить карточку"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: '1px solid rgba(229,62,62,0.35)',
                background: 'transparent',
                color: '#E53E3E',
                opacity: (!selectedCard || saving) ? 0.4 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        


        {!selectedCard ? null : (
          <>
            {/* Tabs уровней */}
            <div className="form-row">
              <label className="form-label">Название</label>
              <input
              className="input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              disabled={!selectedCardId || saving}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#E8EAF0' }}>
                  Уровни ({levels.length})
                </label>

                {levels.length < 10 && (
                  <button
                    onClick={addLevel}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
                  >
                    <Plus size={16} />
                    Добавить уровень
                  </button>
                )}
              </div>

              {/* Вкладки + перемещение прямо на вкладках */}
              <div className="level-tabs">
                {levels.map((_, index) => {
                  const isActive = activeLevel === index;

                  return (
                    <div
                      key={index}
                      onClick={() => setActiveLevel(index)}
                      className={`level-tab ${isActive ? 'level-tab--active' : 'level-tab--inactive'}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setActiveLevel(index);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>Уровень {index + 1}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          onClick={(e) => { e.stopPropagation(); moveLevel(index, index - 1); }}
                          title="Вверх"
                          style={{
                            display: 'inline-flex',
                            padding: 4,
                            color: '#9CA3AF',
                            opacity: index === 0 ? 0.35 : 1,
                            pointerEvents: index === 0 ? 'none' : 'auto',
                          }}
                        >
                          <ChevronUp size={16} />
                        </span>

                        <span
                          onClick={(e) => { e.stopPropagation(); moveLevel(index, index + 1); }}
                          title="Вниз"
                          style={{
                            display: 'inline-flex',
                            padding: 4,
                            color: '#9CA3AF',
                            opacity: index === levels.length - 1 ? 0.35 : 1,
                            pointerEvents: index === levels.length - 1 ? 'none' : 'auto',
                          }}
                        >
                          <ChevronDown size={16} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Редактор активного уровня */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => moveLevel(activeLevel, activeLevel - 1)}
                      disabled={activeLevel === 0}
                      style={{
                        color: '#9CA3AF',
                        padding: 4,
                        background: 'transparent',
                        border: 0,
                        opacity: activeLevel === 0 ? 0.35 : 1,
                      }}
                      title="Вверх"
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      onClick={() => moveLevel(activeLevel, activeLevel + 1)}
                      disabled={activeLevel === levels.length - 1}
                      style={{
                        color: '#9CA3AF',
                        padding: 4,
                        background: 'transparent',
                        border: 0,
                        opacity: activeLevel === levels.length - 1 ? 0.35 : 1,
                      }}
                      title="Вниз"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {levels.length > 1 && (
                      <button
                        onClick={() => removeLevel(activeLevel)}
                        style={{ color: '#E53E3E', padding: 4, background: 'transparent', border: 0 }}
                        title="Удалить уровень"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <MarkdownField
                  label="Вопрос"
                  value={active.question}
                  onChange={(v) => patchLevel(activeLevel, { question: v })}
                  preview={qPreview}
                  onTogglePreview={() => setQPreview(v => !v)}
                  disabled={saving}
                />

                <MarkdownField
                  label="Ответ"
                  value={active.answer}
                  onChange={(v) => patchLevel(activeLevel, { answer: v })}
                  preview={aPreview}
                  onTogglePreview={() => setAPreview(v => !v)}
                  disabled={saving}
                  className="mt-4"
                />

              </div>

              {/* Подсказка про пустые уровни */}
              {levels.length !== cleaned.length && (
                <div className="card">
                  <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                    Пустые уровни (без вопроса или ответа) не будут сохранены.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
              <Button onClick={onCancel} variant="secondary" size="large" fullWidth disabled={saving}>
                Отмена
              </Button>
              <Button onClick={saveCard} variant="primary" size="large" fullWidth disabled={!canSave}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
