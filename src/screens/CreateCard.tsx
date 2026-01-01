// src/screens/CreateCard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button/Button';
import { MarkdownField } from '../components/MarkdownField';
import { LevelIndicator } from '../components/LevelIndicator';
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import type { DeckSummary } from '../types';
import MDEditor from '@uiw/react-md-editor';
import { MarkdownView } from '../components/MarkdownView';


type LevelQA = { question: string; answer: string };

interface CreateCardProps {
  decks: DeckSummary[];
  onSave: (cardData: { deckId: string; term: string; levels: LevelQA[] }) => void;
  onCancel: () => void;
}

const LAST_DECK_KEY = 'mnemonicFlow:lastDeckId';

export function CreateCard({ decks, onSave, onCancel }: CreateCardProps) {
  const [term, setTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState(0);

  const [deckId, setDeckId] = useState<string>(() => {
    const saved = localStorage.getItem(LAST_DECK_KEY);
    return saved ?? '';
  });

  const [levels, setLevels] = useState<LevelQA[]>([{ question: '', answer: '' }]);
  const [qPreview, setQPreview] = useState(false);
  const [aPreview, setAPreview] = useState(false);


  const handleAddLevel = () => {
    if (levels.length < 10) {
      setLevels(prev => [...prev, { question: '', answer: '' }]);
      setActiveLevel(levels.length);
    }
  };

  const handleRemoveLevel = (index: number) => {
    if (levels.length <= 1) return;
    const next = levels.filter((_, i) => i !== index);
    setLevels(next);
    if (activeLevel >= next.length) setActiveLevel(next.length - 1);
  };

  const patchLevel = (index: number, patch: Partial<LevelQA>) => {
    const next = [...levels];
    next[index] = { ...next[index], ...patch };
    setLevels(next);
  };

  const cleanedLevels = useMemo(
    () =>
      levels
        .map(l => ({ question: l.question.trim(), answer: l.answer.trim() }))
        .filter(l => l.question && l.answer),
    [levels]
  );

  const canSave = term.trim() && deckId && cleanedLevels.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ deckId, term: term.trim(), levels: cleanedLevels });
  };

  const active = levels[activeLevel];

  
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
              Уровни сложности ({levels.length})
            </label>

            {levels.length < 10 && (
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
            {levels.map((_, index) => (
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
                {levels.length > 1 && (
                  <button
                    onClick={() => handleRemoveLevel(activeLevel)}
                    style={{ color: '#E53E3E', padding: 4, background: 'transparent', border: 0 }}
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
            />

            <MarkdownField
              label="Ответ"
              value={active.answer}
              onChange={(v) => patchLevel(activeLevel, { answer: v })}
              preview={aPreview}
              onTogglePreview={() => setAPreview(v => !v)}
              className="mt-4"
            />
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
