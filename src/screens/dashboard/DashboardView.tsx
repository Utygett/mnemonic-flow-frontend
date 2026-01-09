import React from 'react';
import { Button } from '../../components/Button/Button';
import { ResumeSessionCard } from '../../components/ResumeSession';
import type { DashboardActions, DashboardModel } from './dashboard.types';
import { DashboardStats } from './components/DashboardStats';
import { GroupsBar } from './components/GroupsBar';
import { DeckList } from './components/DeckList';
import './Dashboard.css';

export function DashboardView({ model, actions }: { model: DashboardModel; actions: DashboardActions }) {
  return (
    <div className="min-h-screen bg-dark pb-24">
      <div className="page__header px-4 pt-12 pb-6">
        <div className="page__header-inner">
          <DashboardStats statistics={model.statistics} />
        </div>
      </div>

      {model.resumeSession && <ResumeSessionCard {...model.resumeSession} />}

      <div className="p-4 py-6 container-centered max-w-390">
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

      <DeckList decks={model.decks} onDeckClick={actions.onDeckClick} onEditDeck={actions.onEditDeck} />

      <div className="p-4 container-centered max-w-390" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button onClick={actions.onAddDesk} variant="primary" size="medium" fullWidth>
          Добавить колоду
        </Button>
      </div>
    </div>
  );
}
