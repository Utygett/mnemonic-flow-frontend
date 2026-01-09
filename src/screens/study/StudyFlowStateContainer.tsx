// src/screens/study/StudyFlowStateContainer.tsx
import React from 'react';
import type { DifficultyRating, StudyCard, StudyMode } from '../../types';
import type { PersistedSession } from '../../utils/sessionStore';
import { ApiClient } from '../../api/client';
import { saveSession, clearSession } from '../../utils/sessionStore';

import { useStudySession } from '../../hooks/useStudySession';
import { useResumeCandidate } from './hooks/useResumeCandidate';
import { useStudyLauncher } from './hooks/useStudyLauncher';
import { StudyFlowView } from './StudyFlowView';

export type StudyController = {
  // resume card on dashboard
  resumeCandidate: PersistedSession | null;
  onResume: () => void;
  onDiscardResume: () => void;

  // запуск study (то, что ждёт HomeTabContainer / DeckDetailsScreen)
  onStartReviewStudy: () => Promise<void>;
  onStartDeckStudy: (deckId: string, mode: StudyMode, limit?: number) => Promise<void>;
  onResumeDeckSession: (saved: PersistedSession) => void;
  onRestartDeckSession: (deckId: string) => void;

  // чтобы App мог скрывать BottomNav при активном study
  isStudying: boolean;
};

type Props = {
  onExitToHome: () => void;   // например: () => setActiveTab('home')
  onRated: () => void;        // сюда передадим refreshStats из App
  children: (api: StudyController) => React.ReactNode;
};

export function StudyFlowStateContainer({ onExitToHome, onRated, children }: Props) {
  const [isStudying, setIsStudying] = React.useState(false);
  const [loadingDeckCards, setLoadingDeckCards] = React.useState(false);

  const [sessionMode, setSessionMode] = React.useState<'deck' | 'review'>('review');
  const [sessionKey, setSessionKey] = React.useState<'review' | `deck:${string}`>('review');
  const [activeDeckId, setActiveDeckId] = React.useState<string | null>(null);

  const [deckCards, setDeckCards] = React.useState<StudyCard[]>([]);
  const [sessionIndex, setSessionIndex] = React.useState(0);

  const { cards, currentIndex, isCompleted, rateCard, skipCard, resetSession } =
    useStudySession(deckCards, sessionIndex);

  const {
    resumeCandidate,
    setResumeCandidate,
    resumeLastSession: onResume,
    discardResume: onDiscardResume,
  } = useResumeCandidate({
    isStudying,
    loadingDeckCards,
    sessionKey,
    sessionMode,
    activeDeckId,
    deckCards,
    currentIndex,
    setIsStudying,
    setSessionMode,
    setSessionKey,
    setActiveDeckId,
    setSessionIndex,
    setDeckCards,
  });

  const launcherInput = React.useMemo(() => ({
    setLoadingDeckCards,
    setDeckCards,
    setActiveDeckId,
    setIsStudying,
    setSessionMode,
    setSessionKey,
    setSessionIndex,
  }), []);

  const {
    startDeckStudy: onStartDeckStudy,
    startReviewStudy: onStartReviewStudy,
    resumeDeckSession: onResumeDeckSession,
    restartDeckSession: onRestartDeckSession,
  } = useStudyLauncher(launcherInput);

  React.useEffect(() => {
    if (!isStudying) return;
    setSessionIndex(currentIndex);
  }, [currentIndex, isStudying]);

  React.useEffect(() => {
    if (!isStudying) return;
    if (!isCompleted) return;

    clearSession(sessionKey);
    setResumeCandidate(null);

    setIsStudying(false);
    setDeckCards([]);
    setSessionIndex(0);
    resetSession();
    onExitToHome();
  }, [isCompleted, isStudying, sessionKey, resetSession, onExitToHome, setResumeCandidate]);

  const handleLevelUp = async () => {
    const card = cards[currentIndex];
    if (!card) return;
    const r = await ApiClient.levelUp(card.id);
    setDeckCards(prev => prev.map(c => (c.id === card.id ? { ...c, activeLevel: r.active_level } : c)));
  };

  const handleLevelDown = async () => {
    const card = cards[currentIndex];
    if (!card) return;
    const r = await ApiClient.levelDown(card.id);
    setDeckCards(prev => prev.map(c => (c.id === card.id ? { ...c, activeLevel: r.active_level } : c)));
  };

  const handleRemoveFromProgress = async () => {
    const card = cards[currentIndex];
    if (!card) return;
    await ApiClient.deleteCardProgress(card.id);
    skipCard();
  };

  const handleRate = async (rating: DifficultyRating) => {
    await rateCard(rating);
    onRated(); // = refreshStats()
  };

  const handleCloseStudy = () => {
    if (deckCards.length > 0) {
      const snap: PersistedSession = {
        key: sessionKey,
        mode: sessionMode,
        activeDeckId,
        deckCards,
        currentIndex,
        isStudying: true,
        savedAt: Date.now(),
      };
      saveSession(snap);
      setResumeCandidate(snap);
    }

    setIsStudying(false);
    setDeckCards([]);
    setSessionIndex(0);
    resetSession();
    onExitToHome();
  };

    return (
    <>
        {isStudying ? (
        <StudyFlowView
            isStudying={isStudying}
            loadingDeckCards={loadingDeckCards}
            deckCards={deckCards}
            cards={cards}
            currentIndex={currentIndex}
            isCompleted={isCompleted}
            onRate={handleRate}
            onLevelUp={handleLevelUp}
            onLevelDown={handleLevelDown}
            onSkip={skipCard}
            onRemoveFromProgress={handleRemoveFromProgress}
            onClose={handleCloseStudy}
            onBackToHome={handleCloseStudy}
        />
        ) : (
        children({
            resumeCandidate,
            onResume,
            onDiscardResume,
            onStartReviewStudy,
            onStartDeckStudy,
            onResumeDeckSession,
            onRestartDeckSession,
            isStudying,
        })
        )}
    </>
    );
}
