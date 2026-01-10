import React from 'react';

import type { CreateDeckViewModel } from '../model/useCreateDeckModel';

type Props = CreateDeckViewModel & {
  onCancel: () => void;
};

export function CreateDeckView(props: Props) {
  const { title, setTitle, saving, error, canSubmit, submit, onCancel } = props;

  return (
    <div className="min-h-screen bg-dark p-4">
      <div className="container-centered max-w-390">
        <div className="card">
          <h2 className="page__title">Новая колода</h2>

          <label className="field">
            <div className="field__label">Название</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Английские слова"
              maxLength={60}
              disabled={saving}
            />
          </label>

          {error && <div className="text-error">{error}</div>}

          <div className="actions">
            <button className="btn-ghost" onClick={onCancel} disabled={saving}>
              Отмена
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving || !canSubmit}>
              {saving ? 'Сохранение…' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
