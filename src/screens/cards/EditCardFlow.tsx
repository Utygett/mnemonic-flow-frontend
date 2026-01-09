import React, { useEffect, useMemo, useState } from 'react';
import type { PublicDeckSummary } from '../../types';
import { ApiClient } from '../../api/client';
import { Button } from '../../components/Button/Button';
import { MarkdownField } from '../../components/MarkdownField';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';

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

type QaLevelDraft = { kind: 'qa'; question: string; answer: string };
type McqOptionDraft = { id: string; text: string };
type McqLevelDraft = {
  kind: 'mcq';
  question: string;
  options: McqOptionDraft[];
  correctOptionId: string;
  explanation: string;
  timerSec: number; // 0 = без таймера
};
type LevelDraft = QaLevelDraft | McqLevelDraft;

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function genId(): string {
  // crypto.randomUUID() не всегда доступен (в зависимости от окружения/браузера)
  // поэтому делаем безопасный fallback
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const isMcqType = (t?: string) => {
  const s = (t ?? '').toLowerCase();
  return s === 'mcq' || s.includes('multiple_choice') || s.includes('multiple-choice') || s.includes('choice');
};

const getLevelIndex = (l: any) => {
  if (typeof l?.level_index === 'number') return l.level_index;
  if (typeof l?.levelIndex === 'number') return l.levelIndex;
  if (typeof l?.level_index === 'string') return Number(l.level_index) || 0;
  return 0;
};

function defaultQaLevel(): QaLevelDraft {
  return { kind: 'qa', question: '', answer: '' };
}

function defaultMcqLevel(): McqLevelDraft {
  const a = genId();
  const b = genId();
  return {
    kind: 'mcq',
    question: '',
    options: [
      { id: a, text: '' },
      { id: b, text: '' },
    ],
    correctOptionId: '',
    explanation: '',
    timerSec: 0,
  };
}

function isLevelEmpty(level: LevelDraft): boolean {
  if (level.kind === 'qa') {
    const q = level.question.trim();
    const a = level.answer.trim();
    return !q || !a;
  }

  const q = level.question.trim();
  const opts = level.options.map(o => ({ ...o, text: o.text.trim() })).filter(o => o.text);
  const correctOk = opts.some(o => o.id === level.correctOptionId);
  return !q || opts.length < 2 || !correctOk;
}

function normalizeMcqLevel(rawContent: any): McqLevelDraft {
  const c = rawContent ?? {};
  const rawOptions = Array.isArray(c.options) ? c.options : [];

  const options: McqOptionDraft[] =
    rawOptions.length > 0
      ? rawOptions.map((o: any) => ({
          id: String(o?.id ?? genId()),
          text: String(o?.text ?? o?.label ?? ''),
        }))
      : [
          { id: genId(), text: '' },
          { id: genId(), text: '' },
        ];

  const correctOptionId = String(c.correctOptionId ?? c.correct_option_id ?? '');

  return {
    kind: 'mcq',
    question: String(c.question ?? ''),
    options,
    correctOptionId,
    explanation: String(c.explanation ?? ''),
    timerSec: Number(c.timerSec ?? c.timer_sec ?? 0) || 0,
  };
}

function normalizeQaLevel(rawContent: any): QaLevelDraft {
  const c = rawContent ?? {};
  return {
    kind: 'qa',
    question: String(c.question ?? ''),
    answer: String(c.answer ?? ''),
  };
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
  const [levels, setLevels] = useState<LevelDraft[]>([defaultQaLevel()]);
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
        const deck = await ApiClient.getDeckWithCards(deckId);
        setCards(deck.cards);
        setSelectedCardId('');
        setLevels([defaultQaLevel()]);
        setActiveLevel(0);
      } catch (e: unknown) {
        setErrorText(getErrorMessage(e) || 'Ошибка загрузки карточек');
        setCards([]);
        setSelectedCardId('');
      } finally {
        setLoading(false);
      }
    })();
  }, [deckId]);

  // когда выбрали карточку — заполняем уровни (по индексу) и типу карточки
  useEffect(() => {
    if (!selectedCard) return;

    const sorted = [...(selectedCard.levels ?? [])].sort((a, b) => getLevelIndex(a) - getLevelIndex(b));

    if (isMcqType(selectedCard.type)) {
      const mapped: LevelDraft[] =
        sorted.length > 0 ? sorted.map(l => normalizeMcqLevel(l.content)) : [defaultMcqLevel()];
      setLevels(mapped);
    } else {
      const mapped: LevelDraft[] =
        sorted.length > 0 ? sorted.map(l => normalizeQaLevel(l.content)) : [defaultQaLevel()];
      setLevels(mapped);
    }

    setActiveLevel(0);
    setQPreview(false);
    setAPreview(false);
  }, [selectedCardId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = cards.find(x => x.card_id === selectedCardId);
    setTitleDraft(c?.title ?? '');
  }, [selectedCardId, cards]);

  const patchLevel = (index: number, patch: Partial<LevelDraft>) => {
    setLevels(prev => {
      const next = [...prev];
      next[index] = { ...(next[index] as any), ...(patch as any) };
      return next;
    });
  };

  const addLevel = () => {
    if (levels.length >= 10) return;

    const nextLevel: LevelDraft = isMcqType(selectedCard?.type) ? defaultMcqLevel() : defaultQaLevel();
    setLevels(prev => [...prev, nextLevel]);
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
      if (prev === from) return to;
      if (from < to && prev > from && prev <= to) return prev - 1;
      if (to < from && prev >= to && prev < from) return prev + 1;
      return prev;
    });
  };

  // ---- MCQ helpers ----
  const addOption = () => {
    setLevels(prev => {
      const next = [...prev];
      const lvl = next[activeLevel];
      if (!lvl || lvl.kind !== 'mcq') return prev;
      if (lvl.options.length >= 8) return prev;

      next[activeLevel] = {
        ...lvl,
        options: [...lvl.options, { id: genId(), text: '' }],
      };
      return next;
    });
  };

  const removeOption = (optIndex: number) => {
    setLevels(prev => {
      const next = [...prev];
      const lvl = next[activeLevel];
      if (!lvl || lvl.kind !== 'mcq') return prev;
      if (lvl.options.length <= 2) return prev;

      const removed = lvl.options[optIndex];
      const options = lvl.options.filter((_, i) => i !== optIndex);

      next[activeLevel] = {
        ...lvl,
        options,
        correctOptionId: removed?.id === lvl.correctOptionId ? '' : lvl.correctOptionId,
      };
      return next;
    });
  };

  const patchOptionText = (optIndex: number, text: string) => {
    setLevels(prev => {
      const next = [...prev];
      const lvl = next[activeLevel];
      if (!lvl || lvl.kind !== 'mcq') return prev;

      const options = [...lvl.options];
      options[optIndex] = { ...options[optIndex], text };

      next[activeLevel] = { ...lvl, options };
      return next;
    });
  };

  const moveOption = (from: number, to: number) => {
    setLevels(prev => {
      const next = [...prev];
      const lvl = next[activeLevel];
      if (!lvl || lvl.kind !== 'mcq') return prev;
      if (to < 0 || to >= lvl.options.length || from === to) return prev;

      next[activeLevel] = { ...lvl, options: moveItem(lvl.options, from, to) };
      return next;
    });
  };

  // ---- validation / cleaned ----
  const cleaned = useMemo(() => {
    const nonEmpty = levels.filter(l => !isLevelEmpty(l));
    return nonEmpty;
  }, [levels]);

  const canSave = Boolean(selectedCard) && cleaned.length > 0 && !saving;

  const buildApiLevels = () => {
    // сохраняем только “непустые” уровни, как было раньше (пустые не сохраняем)
    const usable = levels.filter(l => !isLevelEmpty(l));

    return usable.map((lvl, level_index) => {
      const content =
        lvl.kind === 'qa'
          ? {
              question: lvl.question.trim(),
              answer: lvl.answer.trim(),
            }
          : {
              question: lvl.question.trim(),
              options: lvl.options.map(o => ({ id: o.id, text: o.text.trim() })).filter(o => o.text),
              correctOptionId: lvl.correctOptionId,
              explanation: lvl.explanation,
              timerSec: lvl.timerSec,
            };

      return { level_index, content };
    });
  };

  const saveCard = async () => {
    if (!selectedCardId) return;

    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No auth token');

    setSaving(true);
    setErrorText(null);

    try {
      const t = titleDraft.trim();
      if (!t) throw new Error('Название обязательно');

      const patchRes = await fetch(`/api/cards/${selectedCardId}?title=${encodeURIComponent(t)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!patchRes.ok) throw new Error(await patchRes.text());

      const apiLevels = buildApiLevels();

      await ApiClient.replaceCardLevels(selectedCardId, apiLevels);

      setCards(prev => prev.map(c => (c.card_id === selectedCardId ? { ...c, title: t } : c)));
    } catch (e: any) {
      setErrorText(e?.message ?? 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const humanizeDeleteError = (e: any, what: 'card' | 'deck') => {
    const status = e?.status;
    if (status === 403)
      return what === 'card' ? 'Нельзя удалить карточку: вы не хозяин.' : 'Нельзя удалить колоду: вы не хозяин.';
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
      setLevels([defaultQaLevel()]);
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

      setCards([]);
      setSelectedCardId('');
      setLevels([defaultQaLevel()]);
      setActiveLevel(0);

      onDone();
    } catch (e: any) {
      setErrorText(humanizeDeleteError(e, 'deck'));
    } finally {
      setSaving(false);
    }
  };

  const active = levels[activeLevel];

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
              onChange={e => setDeckId(e.target.value)}
              className="input"
              disabled={decks.length === 0 || saving}
              style={{ flex: 1 }}
            >
              {decks.length === 0 ? (
                <option value="">Нет доступных колод</option>
              ) : (
                decks.map(d => (
                  <option key={d.deck_id} value={d.deck_id}>
                    {d.title}
                  </option>
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
                opacity: !deckId || decks.length === 0 || saving ? 0.4 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>

            {/* Edit deck button (shows only for owner) */}
            {(() => {
              const currentDeck = decks.find(d => d.deck_id === deckId);
              const isOwner = !!(currentDeck && currentUser && currentUser.id === (currentDeck as any).owner_id);
              return isOwner && onEditDeck && deckId ? (
                <button
                  onClick={e => {
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
              onChange={e => setSelectedCardId(e.target.value)}
              className="input"
              disabled={loading || cards.length === 0 || saving}
              style={{ flex: 1 }}
            >
              <option value="">{loading ? 'Загрузка…' : 'Выбери карточку'}</option>
              {cards.map(c => (
                <option key={c.card_id} value={c.card_id}>
                  {c.title}
                </option>
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
                opacity: !selectedCard || saving ? 0.4 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {!selectedCard ? null : (
          <>
            <div className="form-row">
              <label className="form-label">Название</label>
              <input
                className="input"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                disabled={!selectedCardId || saving}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <label style={{ fontSize: '0.875rem', color: '#E8EAF0' }}>Уровни ({levels.length})</label>

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

              {/* Вкладки уровней + перемещение */}
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
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') setActiveLevel(index);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>Уровень {index + 1}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            moveLevel(index, index - 1);
                          }}
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
                          onClick={e => {
                            e.stopPropagation();
                            moveLevel(index, index + 1);
                          }}
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

                {/* --- QA --- */}
                {active.kind === 'qa' ? (
                  <>
                    <MarkdownField
                      label="Вопрос"
                      value={active.question}
                      onChange={v => patchLevel(activeLevel, { question: v } as any)}
                      preview={qPreview}
                      onTogglePreview={() => setQPreview(v => !v)}
                      disabled={saving}
                    />

                    <MarkdownField
                      label="Ответ"
                      value={active.answer}
                      onChange={v => patchLevel(activeLevel, { answer: v } as any)}
                      preview={aPreview}
                      onTogglePreview={() => setAPreview(v => !v)}
                      disabled={saving}
                      className="mt-4"
                    />
                  </>
                ) : (
                  /* --- MCQ --- */
                  <>
                    <MarkdownField
                      label="Вопрос"
                      value={active.question}
                      onChange={v => patchLevel(activeLevel, { question: v } as any)}
                      preview={qPreview}
                      onTogglePreview={() => setQPreview(v => !v)}
                      disabled={saving}
                    />

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label">Варианты</label>

                      {active.options.map((o, i) => (
                        <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <input
                            className="input"
                            value={o.text}
                            onChange={e => patchOptionText(i, e.target.value)}
                            disabled={saving}
                            placeholder={`Вариант ${i + 1}`}
                            style={{ flex: 1 }}
                          />

                          <button
                            onClick={() => moveOption(i, i - 1)}
                            disabled={i === 0 || saving}
                            title="Вверх"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: '1px solid rgba(156,163,175,0.12)',
                              background: 'transparent',
                              color: '#9CA3AF',
                              opacity: i === 0 || saving ? 0.35 : 1,
                            }}
                          >
                            <ChevronUp size={16} />
                          </button>

                          <button
                            onClick={() => moveOption(i, i + 1)}
                            disabled={i === active.options.length - 1 || saving}
                            title="Вниз"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: '1px solid rgba(156,163,175,0.12)',
                              background: 'transparent',
                              color: '#9CA3AF',
                              opacity: i === active.options.length - 1 || saving ? 0.35 : 1,
                            }}
                          >
                            <ChevronDown size={16} />
                          </button>

                          <button
                            onClick={() => removeOption(i)}
                            disabled={active.options.length <= 2 || saving}
                            title="Удалить вариант"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: '1px solid rgba(229,62,62,0.35)',
                              background: 'transparent',
                              color: '#E53E3E',
                              opacity: active.options.length <= 2 || saving ? 0.35 : 1,
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addOption}
                        disabled={saving || active.options.length >= 8}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
                      >
                        <Plus size={16} />
                        Добавить вариант
                      </button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label">Правильный вариант</label>
                      <select
                        className="input"
                        value={active.correctOptionId}
                        onChange={e => patchLevel(activeLevel, { correctOptionId: e.target.value } as any)}
                        disabled={saving}
                      >
                        <option value="">— выбери —</option>
                        {active.options.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.text || o.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label className="form-label">Таймер (сек)</label>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        value={active.timerSec}
                        onChange={e => patchLevel(activeLevel, { timerSec: Number(e.target.value) || 0 } as any)}
                        disabled={saving}
                      />
                      <div style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: 6 }}>
                        0 = без таймера (карточка не будет автопереворачиваться по времени).
                      </div>
                    </div>

                    <MarkdownField
                      label="Пояснение (показывать на обороте)"
                      value={active.explanation}
                      onChange={v => patchLevel(activeLevel, { explanation: v } as any)}
                      preview={aPreview}
                      onTogglePreview={() => setAPreview(v => !v)}
                      disabled={saving}
                      className="mt-4"
                    />
                  </>
                )}
              </div>

              {/* Подсказка про пустые уровни */}
              {levels.length !== cleaned.length && (
                <div className="card">
                  <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                    Пустые уровни (недозаполненные) не будут сохранены.
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
