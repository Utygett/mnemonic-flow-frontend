import React from 'react';

import type { EditDeckViewModel } from '../model/useEditDeckModel';

type Props = EditDeckViewModel & {
  onCancel: () => void;
};

export function EditDeckView(props: Props) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    loading,
    saving,
    error,
    canSubmit,
    submit,
    onCancel,
  } = props;

  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center">Загрузка…</div>;
  }

  return (
    <div className="min-h-screen bg-dark p-4">
      <div className="container-centered max-w-390">
        <div className="card">
          <h2 className="page__title">Редактировать колоду</h2>

          <label className="field">
            <div className="field__label">Название</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название колоды"
              maxLength={60}
              disabled={saving}
            />
          </label>

          <label className="form-row">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={saving}
            />
            <span style={{ marginLeft: 8 }}>Сделать колоду публичной</span>
          </label>

          <label className="field">
            <div className="field__label">Описание</div>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание (опционально)"
              disabled={saving}
            />
          </label>

          {error && <div className="text-error">{error}</div>}

          <div className="actions">
            <button className="btn-ghost" onClick={onCancel} disabled={saving}>
              Отмена
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving || !canSubmit}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
