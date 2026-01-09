import { ApiError } from '../api/client';

export function getErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.detail ?? e.message;
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Неизвестная ошибка';
}
