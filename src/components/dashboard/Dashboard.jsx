import React, { useState, useCallback } from 'react';
import TopicExplorer from './TopicExplorer';
import RandomChallengeReveal from './RandomChallengeReveal';
import SelectedProblemCard from './SelectedProblemCard';
import ChallengeTimer from './ChallengeTimer';
import ChallengeControls from './ChallengeControls';
import ChallengeResultModal from './ChallengeResultModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { useChallengeTimer } from '../../hooks/useChallengeTimer';

export default function Dashboard() {
  const {
    selectedProblem,
    setSelectedProblem,
    activeChallenge,
    persistActiveChallenge,
    recordChallenge,
    settings,
  } = useApp();

  // Result modal state
  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    status: 'solved',
  });

  // Active challenge abandon confirmation state
  const [pendingPickerAction, setPendingPickerAction] = useState(null);

  // Initialize timer with persisted active challenge state if available
  const timer = useChallengeTimer({
    soundEnabled: settings?.soundEnabled ?? true,
    initialActiveState: activeChallenge,
    onStatePersist: persistActiveChallenge,
  });

  const isChallengeActive = timer.status === 'running' || timer.status === 'paused';

  // Problem selected from RandomChallengeReveal or Queue
  const handleProblemSelected = useCallback(
    (problem) => {
      setSelectedProblem(problem);
      // If timer is idle or expired, sync timer duration to problem estimated time
      if (timer.status === 'idle' || timer.status === 'times_up') {
        const minutes = problem.estimatedTime || settings?.defaultTimeMinutes || 20;
        timer.setDuration(minutes);
      }
    },
    [setSelectedProblem, timer, settings]
  );

  // Immediate "Start Challenge" action from the reveal card
  const handleStartChallenge = useCallback(
    (problem) => {
      setSelectedProblem(problem);
      const minutes = problem.estimatedTime || settings?.defaultTimeMinutes || 20;
      timer.setDuration(minutes);
      timer.startTimer();
    },
    [setSelectedProblem, timer, settings]
  );

  // Request abandon during active countdown before executing a new pick
  const handleRequestAbandon = useCallback((onConfirmCallback) => {
    setPendingPickerAction(() => onConfirmCallback);
  }, []);

  const handleConfirmAbandon = useCallback(() => {
    if (pendingPickerAction) {
      timer.resetTimer();
      pendingPickerAction();
      setPendingPickerAction(null);
    }
  }, [pendingPickerAction, timer]);

  // Handle challenge controls action (Mark Solved, Mark Failed, Skip, Abandon)
  const handleFinishChallenge = useCallback(
    (status) => {
      // If abandoned without result modal, reset timer and record
      if (status === 'abandoned') {
        recordChallenge({
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          topicIds: selectedProblem.topicIds,
          difficulty: selectedProblem.difficulty,
          timeAllocatedMinutes: Math.round(timer.allocatedSeconds / 60),
          timeUsedSeconds: timer.timeUsedSeconds,
          status: 'abandoned',
        });
        timer.resetTimer();
        return;
      }

      // Pause timer and open debrief result modal
      timer.pauseTimer();
      setResultModalState({
        isOpen: true,
        status,
      });
    },
    [selectedProblem, timer, recordChallenge]
  );

  // Save result from debrief modal
  const handleSaveChallengeResult = useCallback(
    (payload) => {
      recordChallenge(payload);
      timer.resetTimer();
    },
    [recordChallenge, timer]
  );

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Challenge Picker & Topic Explorer (5 cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <RandomChallengeReveal
            onProblemSelected={handleProblemSelected}
            onStartChallenge={handleStartChallenge}
            isChallengeActive={isChallengeActive}
            onRequestAbandon={handleRequestAbandon}
          />

          <TopicExplorer />
        </div>

        {/* Right Column: Problem Question Card, Timer & Challenge Controls (7 cols on large screens) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SelectedProblemCard
            problem={selectedProblem}
            isChallengeActive={isChallengeActive}
          />

          <ChallengeTimer
            timer={timer}
            isChallengeActive={isChallengeActive}
          />

          <ChallengeControls
            problem={selectedProblem}
            timer={timer}
            onFinishChallenge={handleFinishChallenge}
          />
        </div>
      </div>

      {/* Challenge Result Modal */}
      <ChallengeResultModal
        isOpen={resultModalState.isOpen}
        onClose={() => setResultModalState((prev) => ({ ...prev, isOpen: false }))}
        problem={selectedProblem}
        status={resultModalState.status}
        timeAllocatedMinutes={Math.round(timer.allocatedSeconds / 60)}
        timeUsedSeconds={timer.timeUsedSeconds}
        onSaveResult={handleSaveChallengeResult}
        onSpinAnother={() => {
          timer.resetTimer();
        }}
      />

      {/* Confirm Abandon when picking during active timer */}
      <ConfirmDialog
        isOpen={Boolean(pendingPickerAction)}
        onClose={() => setPendingPickerAction(null)}
        onConfirm={handleConfirmAbandon}
        title="Abandon Active Countdown?"
        message="A challenge countdown is currently active. Picking a new challenge now will abandon this session. Do you wish to proceed?"
        confirmLabel="Abandon & Pick"
      />
    </div>
  );
}
