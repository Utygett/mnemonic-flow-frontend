import { useMemo, useState } from 'react';

import { ApiClient } from '../../../api/client';

import type { CreateGroupProps } from './types';

export type CreateGroupViewModel = {
  title: string;
  setTitle: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  saving: boolean;
  error: string | null;

  canSubmit: boolean;
  submit: () => Promise<void>;
};

export function useCreateGroupModel(props: CreateGroupProps): CreateGroupViewModel {
  const { onSave } = props;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(title.trim()) && !saving, [title, saving]);

  const submit = async () => {
    const t = title.trim();
    if (!t) return;

    try {
      setSaving(true);
      setError(null);

      const created = await ApiClient.createGroup({
        title: t,
        description: description.trim() || null,
        parent_id: null,
      });

      onSave((created as any)?.id);
    } catch (e) {
      console.error(e);
      setError('Не удалось создать группу');
    } finally {
      setSaving(false);
    }
  };

  return {
    title,
    setTitle,

    description,
    setDescription,

    saving,
    error,

    canSubmit,
    submit,
  };
}
