// src/screens/CreateCard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button/Button';
import { MarkdownField } from '../components/MarkdownField';
import { X, Plus, Trash2 } from 'lucide-react';
import type { PublicDeckSummary } from '../types';
import { MarkdownView } from '../components/MarkdownView';

type CardType = 'flashcard' | 'multiple_choice';

type LevelQA = { question: string; answer: string };

type McqOption = { id: string; text: string };
type LevelMCQ = {
  question: string;
  options: McqOption[];
  correctOptionId: string;
  explanation?: string;
  timerSec?: number;
};

interface CreateCardProps {
  decks: PublicDeckSummary[];
  onSave: (cardData: { deckId: string; term: string; type: CardType; levels: any[] }) => void;
  onCancel: () => void;
}

const LAST_DECK_KEY = 'mnemonicFlow:lastDeckId';

function newId() {
  return Math.random().toString(16).slice(2);
}

function makeDefaultMcqLevel(): LevelMCQ {
  const a = newId();
  const b = newId();
  return {
    question: '',
    options: [
      { id: a, text: '' },
      { id: b, text: '' },
    ],
    correctOptionId: a,
    explanation: '',
    timerSec: undefined,
  };
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function CreateCard({ decks, onSave, onCancel }: CreateCardProps) {
  const [term, setTerm] = useState('');
  const [cardType, setCardType] = useState<CardType>('flashcard');

  const [activeLevel, setActiveLevel] = useState(0);

  const [deckId, setDeckId] = useState<string>(() => {
    const saved = localStorage.getItem(LAST_DECK_KEY);
    return saved ?? '';
  });

  // FLASHCARD levels
  const [levelsQA, setLevelsQA] = useState<LevelQA[]>([{ question: '', answer: '' }]);
  const [qPreview, setQPreview] = useState(false);
  const [aPreview, setAPreview] = useState(false);

  // MCQ levels
  const [levelsMCQ, setLevelsMCQ] = useState<LevelMCQ[]>([makeDefaultMcqLevel()]);
  const [mcqQPreview, setMcqQPreview] = useState(false);
  const [mcqOptionsPreview, setMcqOptionsPreview] = useState(false);
  const [mcqExplanationPreview, setMcqExplanationPreview] = useState(false);

  const levelsCount = cardType === 'flashcard' ? levelsQA.length : levelsMCQ.length;

  const handleAddLevel = () => {
    if (levelsCount >= 10) return;

    if (cardType === 'flashcard') {
      setLevelsQA(prev => [...prev, { question: '', answer: '' }]);
      setActiveLevel(levelsQA.length);
    } else {
      setLevelsMCQ(prev => [...prev, makeDefaultMcqLevel()]);
      setActiveLevel(levelsMCQ.length);
    }
  };

  const handleRemoveLevel = (index: number) => {
    if (levelsCount <= 1) return;

    if (cardType === 'flashcard') {
      const next = levelsQA.filter((_, i) => i !== index);
      setLevelsQA(next);
      if (activeLevel >= next.length) setActiveLevel(next.length - 1);
    } else {
      const next = levelsMCQ.filter((_, i) => i !== index);
      setLevelsMCQ(next);
      if (activeLevel >= next.length) setActiveLevel(next.length - 1);
    }
  };

  const patchLevelQA = (index: number, patch: Partial<LevelQA>) => {
    const next = [...levelsQA];
    next[index] = { ...next[index], ...patch };
    setLevelsQA(next);
  };

  const patchLevelMCQ = (index: number, patch: Partial<LevelMCQ>) => {
    const next = [...levelsMCQ];
    next[index] = { ...next[index], ...patch };
    setLevelsMCQ(next);
  };

  const patchMcqOption = (levelIndex: number, optionId: string, patch: Partial<McqOption>) => {
    const next = [...levelsMCQ];
    const lvl = next[levelIndex];
    const options = (lvl.options ?? []).map(o => (o.id === optionId ? { ...o, ...patch } : o));
    next[levelIndex] = { ...lvl, options };
    setLevelsMCQ(next);
  };

  const addMcqOption = (levelIndex: number) => {
    const next = [...levelsMCQ];
    const lvl = next[levelIndex];
    const optId = newId();
    const options = [...(lvl.options ?? []), { id: optId, text: '' }];
    next[levelIndex] = {
      ...lvl,
      options,
      correctOptionId: lvl.correctOptionId || optId,
    };
    setLevelsMCQ(next);
  };

  const removeMcqOption = (levelIndex: number, optionId: string) => {
    const next = [...levelsMCQ];
    const lvl = next[levelIndex];
    const options = (lvl.options ?? []).filter(o => o.id !== optionId);
    if (options.length < 2) return;

    let correctOptionId = lvl.correctOptionId;
    if (!options.some(o => o.id === correctOptionId)) {
      correctOptionId = options[0]?.id ?? '';
    }

    next[levelIndex] = { ...lvl, options, correctOptionId };
    setLevelsMCQ(next);
  };

  const cleanedLevelsQA = useMemo(
    () =>
      levelsQA
        .map(l => ({ question: l.question.trim(), answer: l.answer.trim() }))
        .filter(l => l.question && l.answer),
    [levelsQA]
  );

  const cleanedLevelsMCQ = useMemo(() => {
    return levelsMCQ
      .map(l => {
        const question = (l.question ?? '').trim();
        const options = (l.options ?? [])
          .map(o => ({ id: String(o.id), text: (o.text ?? '').trim() }))
          .filter(o => o.id);

        const correctOptionId = String(l.correctOptionId ?? '');
        const explanation = (l.explanation ?? '').trim();
        const timerSec =
          typeof l.timerSec === 'number' && l.timerSec > 0 ? clampInt(l.timerSec, 1, 3600) : undefined;

        return { question, options, correctOptionId, explanation, timerSec };
      })
      .filter(l => {
        if (!l.question) return false;
        if (l.options.length < 2) return false;
        // Требуем, чтобы у минимум 2 опций был текст
        const nonEmpty = l.options.filter(o => o.text);
        if (nonEmpty.length < 2) return false;
        if (!l.correctOptionId) return false;
        const correct = l.options.find(o => o.id === l.correctOptionId);
        if (!correct || !correct.text) return false;
        return true;
      });
  }, [levelsMCQ]);

  const canSave =
    term.trim() &&
    deckId &&
    (cardType === 'flashcard' ? cleanedLevelsQA.length > 0 : cleanedLevelsMCQ.length > 0);

  const handleSave = () => {
    if (!canSave) return;

    if (cardType === 'flashcard') {
      onSave({ deckId, term: term.trim(), type: 'flashcard', levels: cleanedLevelsQA });
    } else {
      onSave({ deckId, term: term.trim(), type: 'multiple_choice', levels: cleanedLevelsMCQ });
    }
  };

  const activeQA = levelsQA[activeLevel];
  const activeMCQ = levelsMCQ[activeLevel];

  useEffect(() => {
    if (!decks || decks.length === 0) return;
    // если сохранённая колода есть в списке — оставляем
    if (deckId && decks.some(d => d.deck_id === deckId)) return;
    // иначе ставим первую доступную
    setDeckId(decks[0].deck_id);
  }, [decks, deckId]);

  useEffect(() => {
    if (!deckId) return;
    localStorage.setItem(LAST_DECK_KEY, deckId);
  }, [deckId]);

  // при смене типа — не смешиваем индексы/редакторы
  useEffect(() => {
    setActiveLevel(0);
    setQPreview(false);
    setAPreview(false);
    setMcqQPreview(false);
    setMcqOptionsPreview(false);
    setMcqExplanationPreview(false);
  }, [cardType]);

  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page__header-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onCancel} style={{ color: '#9CA3AF', background: 'transparent', border: 0 }}>
              <X size={24} />
            </button>
            <h2 style={{ color: '#E8EAF0' }}>Новая карточка</h2>
            <div style={{ width: 24 }} />
          </div>
        </div>
      </div>

      <main className="container-centered w-full max-w-4xl space-y-6 py-6">
        {/* Deck select */}
        <div className="form-row">
          <label className="form-label">Колода</label>
          <select
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
            className="input"
            disabled={decks.length === 0}
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
        </div>

        {/* Card type */}
        <div className="form-row">
          <label className="form-label">Тип карточки</label>
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value as CardType)}
            className="input"
          >
            <option value="flashcard">Flashcard</option>
            <option value="multiple_choice">Multiple choice</option>
          </select>
        </div>

        {/* Card title/topic */}
        <Input
          value={term}
          onChange={setTerm}
          label="Название / Тема карточки"
          placeholder="Например: Фотосинтез"
        />

        {/* Level tabs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#E8EAF0' }}>
              Уровни сложности ({levelsCount})
            </label>

            {levelsCount < 10 && (
              <button
                onClick={handleAddLevel}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
              >
                <Plus size={16} />
                Добавить уровень
              </button>
            )}
          </div>

          <div className="level-tabs">
            {Array.from({ length: levelsCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveLevel(index)}
                className={`level-tab ${activeLevel === index ? 'level-tab--active' : 'level-tab--inactive'}`}
              >
                <span style={{ fontSize: '0.875rem' }}>Уровень {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Active level editor */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {levelsCount > 1 && (
                  <button
                    onClick={() => handleRemoveLevel(activeLevel)}
                    style={{ color: '#E53E3E', padding: 4, background: 'transparent', border: 0 }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {cardType === 'flashcard' ? (
              <>
                <MarkdownField
                  label="Вопрос"
                  value={activeQA?.question ?? ''}
                  onChange={(v) => patchLevelQA(activeLevel, { question: v })}
                  preview={qPreview}
                  onTogglePreview={() => setQPreview(v => !v)}
                />

                <MarkdownField
                  label="Ответ"
                  value={activeQA?.answer ?? ''}
                  onChange={(v) => patchLevelQA(activeLevel, { answer: v })}
                  preview={aPreview}
                  onTogglePreview={() => setAPreview(v => !v)}
                  className="mt-4"
                />
              </>
            ) : (
              <>
                <MarkdownField
                  label="Вопрос"
                  value={activeMCQ?.question ?? ''}
                  onChange={(v) => patchLevelMCQ(activeLevel, { question: v })}
                  preview={mcqQPreview}
                  onTogglePreview={() => setMcqQPreview(v => !v)}
                />

                {/* Timer */}
                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Таймер (сек) — опционально</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={3600}
                    value={typeof activeMCQ?.timerSec === 'number' ? String(activeMCQ.timerSec) : ''}
                    onChange={(e) => {
                      const vRaw = e.target.value;
                      const v = vRaw === '' ? undefined : clampInt(Number(vRaw), 0, 3600);
                      patchLevelMCQ(activeLevel, { timerSec: v });
                    }}
                    placeholder="Напр. 15"
                  />
                </div>

                {/* Options */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Варианты (выбери правильный)
                    </label>

                    <button
                      onClick={() => addMcqOption(activeLevel)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
                      type="button"
                    >
                      <Plus size={16} />
                      Добавить вариант
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {(activeMCQ?.options ?? []).map((opt, idx) => (
                      <div key={opt.id} className="card" style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E8EAF0' }}>
                            <input
                              type="radio"
                              name={`mcq-correct-${activeLevel}`}
                              checked={String(activeMCQ?.correctOptionId) === String(opt.id)}
                              onChange={() => patchLevelMCQ(activeLevel, { correctOptionId: String(opt.id) })}
                            />
                            Правильный
                          </label>

                          <div style={{ flex: 1 }} />

                          <button
                            type="button"
                            onClick={() => removeMcqOption(activeLevel, opt.id)}
                            disabled={(activeMCQ?.options?.length ?? 0) <= 2}
                            style={{
                              color: (activeMCQ?.options?.length ?? 0) <= 2 ? '#6B7280' : '#E53E3E',
                              padding: 4,
                              background: 'transparent',
                              border: 0,
                            }}
                            title="Удалить вариант"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <MarkdownField
                          label={`Вариант ${idx + 1}`}
                          value={opt.text}
                          onChange={(v) => patchMcqOption(activeLevel, opt.id, { text: v })}
                          preview={mcqOptionsPreview}
                          onTogglePreview={() => setMcqOptionsPreview(v => !v)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Быстрый предпросмотр правильного ответа */}
                  {(() => {
                    const correct = (activeMCQ?.options ?? []).find(o => o.id === activeMCQ?.correctOptionId);
                    const text = correct?.text?.trim();
                    if (!text) return null;
                    return (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          Предпросмотр правильного ответа
                        </div>
                        <div className="card" style={{ padding: '0.75rem' }}>
                          <MarkdownView value={text} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Explanation */}
                <MarkdownField
                  label="Пояснение (опционально)"
                  value={activeMCQ?.explanation ?? ''}
                  onChange={(v) => patchLevelMCQ(activeLevel, { explanation: v })}
                  preview={mcqExplanationPreview}
                  onTogglePreview={() => setMcqExplanationPreview(v => !v)}
                  className="mt-4"
                />
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
          <Button onClick={onCancel} variant="secondary" size="large" fullWidth>
            Отмена
          </Button>
          <Button onClick={handleSave} variant="primary" size="large" fullWidth disabled={!canSave}>
            Сохранить
          </Button>
        </div>
      </main>
    </div>
  );
}
