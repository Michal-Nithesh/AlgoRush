import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import ProblemLibrary from './components/problems/ProblemLibrary';
import ChallengeHistory from './components/history/ChallengeHistory';
import StatisticsView from './components/stats/StatisticsView';

function AppContent() {
  const { activeTab } = useApp();

  return (
    <AppLayout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'problems' && <ProblemLibrary />}
      {activeTab === 'history' && <ChallengeHistory />}
      {activeTab === 'stats' && <StatisticsView />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
