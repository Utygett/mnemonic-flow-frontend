import { useMemo, useState } from 'react';

import { apiRequest } from '@/shared/api';

import type { CreateGroupProps } from './types';

type ApiCreateGroupResponse = {
  id?: string | number;
  group_id?: string | number;
};

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

      const created = await apiRequest<ApiCreateGroupResponse>(`/groups`, {
        method: 'POST',
        body: JSON.stringify({
          title: t,
          description: description.trim() || null,
          parent_id: null,
        }),
      });

      const id = created?.id ?? created?.group_id;
      onSave(id != null ? String(id) : '');
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
