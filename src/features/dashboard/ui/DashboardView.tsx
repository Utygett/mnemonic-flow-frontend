import React from 'react';

import { Button } from '../../../shared/ui/Button/Button';
import { ResumeSessionCard } from '../../../components/ResumeSession';

import type { DashboardActions, DashboardModel } from '../model/types';

import { DashboardStats } from './components/DashboardStats';
import { GroupsBar } from './components/GroupsBar';
import { DeckList } from './components/DeckList';
import './Dashboard.css';

export function DashboardView({
  model,
  actions,
}: {
  model: DashboardModel;
  actions: DashboardActions;
}) {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__header-inner">
          <DashboardStats statistics={model.statistics} />
        </div>
      </div>

      {model.resumeSession && <ResumeSessionCard {...model.resumeSession} />}

      <div className="dashboard__action-section">
        <Button onClick={actions.onStartStudy} variant="primary" size="large" fullWidth>
          Начать обучение
        </Button>
      </div>

      <GroupsBar
        groups={model.groups}
        activeGroupId={model.activeGroupId}
        onGroupChange={actions.onGroupChange}
        onCreateGroup={actions.onCreateGroup}
        onDeleteActiveGroup={actions.onDeleteActiveGroup}
      />

      <DeckList
        decks={model.decks}
        onDeckClick={actions.onDeckClick}
        onEditDeck={actions.onEditDeck}
      />

      <div className="dashboard__footer-section">
        <Button onClick={actions.onAddDeck} variant="primary" size="medium" fullWidth>
          Добавить колоду
        </Button>
      </div>
    </div>
  );
}
