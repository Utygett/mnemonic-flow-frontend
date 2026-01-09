import React from 'react';
import type { PersistedSession } from '../../utils/sessionStore';
import type { Deck, Group, StudyMode, Statistics } from '../../types';

import { HomeTab } from './HomeTab';
import { CreateGroup } from '../group/CreateGroup';
import AddDeck from '../AddDeck/AddDeck';
import { DeckDetailsScreen } from '../deck/DeckDetailsScreen';

type Props = {
  // данные home
  statistics: Statistics;
  decks: Deck[];
  groups: Group[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;

  // из твоего useGroupsDecksController
  refreshGroups: () => Promise<void>;
  refreshDecks: () => void;
  currentGroupDeckIds: string[];
  onDeleteActiveGroup: () => void;

  // resume
  resumeCandidate: PersistedSession | null;
  onResume: () => void;
  onDiscardResume: () => void;

  // действия, которые запускают study (остаются в App)
  onStartReviewStudy: () => void;
  onStartDeckStudy: (deckId: string, mode: StudyMode, limit?: number) => Promise<void>;

  // пока оставляем редактирование колоды глобальным
  onOpenEditDeck: (deckId: string) => void;
};

type HomeView =
  | { kind: 'dashboard' }
  | { kind: 'createGroup' }
  | { kind: 'addDeck' }
  | { kind: 'deckDetails'; deckId: string };

export function HomeTabContainer(props: Props) {
  const [view, setView] = React.useState<HomeView>({ kind: 'dashboard' });

  // --- экраны home ---
  if (view.kind === 'createGroup') {
    return (
      <CreateGroup
        onCancel={() => setView({ kind: 'dashboard' })}
        onSave={async (createdGroupId) => {
          await props.refreshGroups();
          if (createdGroupId) props.setActiveGroupId(createdGroupId);
          setView({ kind: 'dashboard' });
        }}
      />
    );
  }

  if (view.kind === 'addDeck') {
    if (!props.activeGroupId) return null;

    return (
      <AddDeck
        groupId={props.activeGroupId}
        initialGroupDeckIds={props.currentGroupDeckIds}
        onClose={() => setView({ kind: 'dashboard' })}
        onChanged={() => props.refreshDecks()}
      />
    );
  }

  if (view.kind === 'deckDetails') {
    const deckId = view.deckId;

    return (
      <DeckDetailsScreen
        deckId={deckId}
        onBack={() => setView({ kind: 'dashboard' })}
        onStart={async (mode, limit) => {
          // закрываем details, дальше App сам переключит UI в study
          setView({ kind: 'dashboard' });
          await props.onStartDeckStudy(deckId, mode, limit);
        }}
      />
    );
  }

  // --- обычный home (dashboard) ---
  return (
    <HomeTab
      statistics={props.statistics}
      decks={props.decks}
      groups={props.groups}
      activeGroupId={props.activeGroupId}
      resumeCandidate={props.resumeCandidate}
      onResume={props.onResume}
      onDiscardResume={props.onDiscardResume}
      onGroupChange={props.setActiveGroupId}
      onCreateGroup={() => setView({ kind: 'createGroup' })}
      onDeleteActiveGroup={props.onDeleteActiveGroup}
      onStartStudy={props.onStartReviewStudy}
      onDeckClick={(deckId) => setView({ kind: 'deckDetails', deckId })}
      onOpenEditDeck={props.onOpenEditDeck}
      onAddDeck={() => setView({ kind: 'addDeck' })}
    />
  );
}
