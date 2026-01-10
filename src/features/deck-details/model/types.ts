import type { StudyMode } from '../../../types';
import type { PersistedSession } from '../../../utils/sessionStore';

export type DeckDetailsProps = {
  deckId: string;
  onBack: () => void;
  onStart: (mode: StudyMode, limit?: number) => void;
  onResume: (saved: PersistedSession) => void;
  clearSavedSession: () => void; // без deckId
};
