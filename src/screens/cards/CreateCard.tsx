// src/screens/CreateCard.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button/Button';
import { MarkdownField } from '../../components/MarkdownField';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import type { PublicDeckSummary } from '../../types';
import { MarkdownView } from '../../components/MarkdownView';

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

type CsvRow = { name: string; front: string; back: string };

interface CreateCardProps {
  decks: PublicDeckSummary[];
  onSave: (cardData: { deckId: string; term: string; type: CardType; levels: any[] }) => void;

  onSaveMany: (
    cards: Array<{ deckId: string; term: string; type: 'flashcard'; levels: Array<{ question: string; answer: string }> }>
  ) => Promise<{ created: number; failed: number; errors?: string[] }>;

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

/** Очень простой CSV: кавычки + запятая, без переносов строк внутри кавычек */
function splitCsvLine(line: string): string[] {
  const res: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // "" -> "
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      res.push(cur);
      cur = '';
      continue;
    }

    cur += ch;
  }

  res.push(cur);
  return res;
}

function parseCsvNameFrontBack(text: string): { rows: CsvRow[]; errors: string[]; total: number } {
  const errors: string[] = [];

  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.filter(l => l.length > 0);

  if (lines.length === 0) return { rows: [], errors: ['CSV пустой'], total: 0 };

  const first = splitCsvLine(lines[0]).map(s => String(s).toLowerCase());
  const hasHeader = first.includes('name') && first.includes('front') && first.includes('back');

  let nameIdx = 0;
  let frontIdx = 1;
  let backIdx = 2;
  let start = 0;

  if (hasHeader) {
    nameIdx = first.indexOf('name');
    frontIdx = first.indexOf('front');
    backIdx = first.indexOf('back');
    start = 1;
  } else {
    if (first.length < 3) {
      return {
        rows: [],
        errors: ['Нет заголовка, но в первой строке меньше 3 колонок (нужно name,front,back).'],
        total: 0,
      };
    }
  }

  const total = Math.max(0, lines.length - start);
  const rows: CsvRow[] = [];

  for (let i = start; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);

    const name = (cols[nameIdx] ?? '').trim();
    const front = (cols[frontIdx] ?? '').trim();
    const back = (cols[backIdx] ?? '').trim();

    if (!name || !front || !back) {
      errors.push(`Строка ${i + 1}: нужно заполнить name/front/back`);
      continue;
    }

    rows.push({ name, front, back });
  }

  return { rows, errors, total };
}

export function CreateCard({ decks, onSave, onSaveMany, onCancel }: CreateCardProps) {
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

  // CSV import
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [importBusy, setImportBusy] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);

  const scrollToReport = () => {
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

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

    const handleImportCsv = async (file: File) => {
    if (!deckId) return;

    setImportReport(null);
    setImportBusy(true);

    try {
      const text = await file.text();
      const { rows, errors, total } = parseCsvNameFrontBack(text);

      // 1) Если ошибки парсинга — ОТВЕРГАЕМ импорт полностью
      if (errors.length > 0) {
        const head = `Импорт отменён: ошибок парсинга ${errors.length} из ${total} строк.\nИсправь CSV и попробуй снова.`;
        const body =
          `\n\nОшибки:\n- ${errors.slice(0, 20).join('\n- ')}${errors.length > 20 ? '\n- ...' : ''}`;

        const msg = head + body;
        setImportReport(msg);
        alert(msg);
        return;
      }

      // 2) Парсинг ок → формируем payload и шлём
      const cards = rows.map((r) => ({
        deckId,
        term: r.name,
        type: 'flashcard' as const,
        levels: [{ question: r.front, answer: r.back }],
      }));

      const result = await onSaveMany(cards);

      const sent = cards.length;
      const created = result.created ?? 0;
      const failed = result.failed ?? 0;
      const apiErrors = result.errors ?? [];

      const tail =
        apiErrors.length > 0
          ? `\n\nОшибки API (index: message):\n- ${apiErrors.slice(0, 20).join('\n- ')}${
              apiErrors.length > 20 ? '\n- ...' : ''
            }`
          : '';

      const msg = `Импорт завершён: отправлено ${sent}, создано в базе ${created}, ошибок API ${failed}.${tail}`;
      setImportReport(msg);
      alert(msg);
    } catch (e: any) {
      const msg = `Импорт не удался: ${String(e?.message ?? e)}`;
      setImportReport(msg);
      alert(msg);
    } finally {
      setImportBusy(false);
    }
  };


  const activeQA = levelsQA[activeLevel];
  const activeMCQ = levelsMCQ[activeLevel];

  useEffect(() => {
    if (!decks || decks.length === 0) return;
    if (deckId && decks.some(d => d.deck_id === deckId)) return;
    setDeckId(decks[0].deck_id);
  }, [decks, deckId]);

  useEffect(() => {
    if (!deckId) return;
    localStorage.setItem(LAST_DECK_KEY, deckId);
  }, [deckId]);

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

        <div className="form-row">
          <label className="form-label">Тип карточки</label>
          <select value={cardType} onChange={(e) => setCardType(e.target.value as CardType)} className="input">
            <option value="flashcard">Flashcard</option>
            <option value="multiple_choice">Multiple choice</option>
          </select>
        </div>

        <Input
          value={term}
          onChange={setTerm}
          label="Название / Тема карточки"
          placeholder="Например: Фотосинтез"
        />

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

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            size="large"
            fullWidth
            disabled={!deckId || importBusy}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Upload size={16} />
              Импорт CSV
            </span>
          </Button>

          <Button onClick={onCancel} variant="secondary" size="large" fullWidth disabled={importBusy}>
            Отмена
          </Button>

          <Button onClick={handleSave} variant="primary" size="large" fullWidth disabled={!canSave || importBusy}>
            Сохранить
          </Button>
        </div>

        {importReport && (
          <div
            ref={reportRef}
            style={{
              color: '#9CA3AF',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {importReport}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={async () => {
            const input = fileInputRef.current;
            const file = input?.files?.[0];
            if (!file) return;

            try {
              await handleImportCsv(file);
            } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          }}
        />
      </main>
    </div>
  );
}
