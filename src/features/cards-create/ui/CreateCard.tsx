// src\features\cards-create\ui\CreateCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { MarkdownField } from '../../../components/MarkdownField';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { MarkdownView } from '../../../components/MarkdownView';
import { parseCsvNameFrontBack } from '../lib/csv';
import { LAST_DECK_KEY } from '../model/utils';
import { useCreateCardModel } from '../model/useCreateCardModel';
import { useCreateCardLevelsModel } from '../model/useCreateCardLevelsModel';
import type { CardType, CreateCardProps } from '../model/types';
import { Button } from '../../../shared/ui/Button/Button';



export function CreateCard({ decks, onSave, onSaveMany, onCancel }: CreateCardProps) {
  const { term, setTerm, cardType, setCardType, deckId, setDeckId } = useCreateCardModel(decks);

  const {
    activeLevel,
    setActiveLevel,

    // preview toggles
    qPreview,
    setQPreview,
    aPreview,
    setAPreview,
    mcqQPreview,
    setMcqQPreview,
    mcqOptionsPreview,
    setMcqOptionsPreview,
    mcqExplanationPreview,
    setMcqExplanationPreview,

    // derived
    levelsCount,
    activeQA,
    activeMCQ,

    // actions
    addLevel,
    removeLevel,
    patchLevelQA,
    patchLevelMCQ,
    patchMcqOption,
    addMcqOption,
    removeMcqOption,

    // cleaned (готово для onSave)
    cleanedLevelsQA,
    cleanedLevelsMCQ,
  } = useCreateCardLevelsModel(cardType);

  // CSV import
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [importBusy, setImportBusy] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);

  const scrollToReport = () => {
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

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
        const body = `\n\nОшибки:\n- ${errors.slice(0, 20).join('\n- ')}${errors.length > 20 ? '\n- ...' : ''}`;

        const msg = head + body;
        setImportReport(msg);
        scrollToReport();
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
      scrollToReport();
      alert(msg);
    } catch (e: any) {
      const msg = `Импорт не удался: ${String(e?.message ?? e)}`;
      setImportReport(msg);
      scrollToReport();
      alert(msg);
    } finally {
      setImportBusy(false);
    }
  };

  // default deck selection
  useEffect(() => {
    if (!decks || decks.length === 0) return;
    if (deckId && decks.some((d) => d.deck_id === deckId)) return;
    setDeckId(decks[0].deck_id);
  }, [decks, deckId, setDeckId]);

  // persist last deck
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
              decks.map((d) => (
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

        <Input value={term} onChange={setTerm} label="Название / Тема карточки" placeholder="Например: Фотосинтез" />

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#E8EAF0' }}>Уровни сложности ({levelsCount})</label>

            {levelsCount < 10 && (
              <button
                onClick={addLevel}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A6FA5', background: 'transparent', border: 0 }}
                type="button"
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
                type="button"
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
                    onClick={() => removeLevel(activeLevel)}
                    style={{ color: '#E53E3E', padding: 4, background: 'transparent', border: 0 }}
                    type="button"
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
                  onTogglePreview={() => setQPreview(!qPreview)}
                />

                <MarkdownField
                  label="Ответ"
                  value={activeQA?.answer ?? ''}
                  onChange={(v) => patchLevelQA(activeLevel, { answer: v })}
                  preview={aPreview}
                  onTogglePreview={() => setAPreview(!aPreview)}
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
                  onTogglePreview={() => setMcqQPreview(!mcqQPreview)}
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
                      const raw = e.target.value;
                      if (raw === '') {
                        patchLevelMCQ(activeLevel, { timerSec: undefined });
                        return;
                      }
                      const n = Number(raw);
                      const v = Number.isFinite(n) ? Math.max(0, Math.min(3600, Math.trunc(n))) : 0;
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
                          onTogglePreview={() => setMcqOptionsPreview(!mcqOptionsPreview)}
                        />
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const correct = (activeMCQ?.options ?? []).find((o) => o.id === activeMCQ?.correctOptionId);
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
                  onTogglePreview={() => setMcqExplanationPreview(!mcqExplanationPreview)}
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
