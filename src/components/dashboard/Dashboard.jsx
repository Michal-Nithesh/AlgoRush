import React, { useState, useCallback } from 'react';
import TopicSelector from './TopicSelector';
import SpinWheel from './SpinWheel';
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
  const [pendingSpinAction, setPendingSpinAction] = useState(null);

  // Initialize timer with persisted active challenge state if available
  const timer = useChallengeTimer({
    soundEnabled: settings?.soundEnabled ?? true,
    initialActiveState: activeChallenge,
    onStatePersist: persistActiveChallenge,
  });

  const isChallengeActive = timer.status === 'running' || timer.status === 'paused';

  // Spin wheel problem chosen
  const handleProblemSelected = useCallback((problem) => {
    setSelectedProblem(problem);
    // If timer was idle or expired, reset it to problem estimated time or default
    if (timer.status === 'idle' || timer.status === 'times_up') {
      const minutes = problem.estimatedTime || settings?.defaultTimeMinutes || 30;
      timer.setDuration(minutes);
    }
  }, [setSelectedProblem, timer, settings]);

  // Request abandon during active countdown
  const handleRequestAbandon = useCallback((onConfirmCallback) => {
    setPendingSpinAction(() => onConfirmCallback);
  }, []);

  const handleConfirmAbandon = useCallback(() => {
    if (pendingSpinAction) {
      timer.resetTimer();
      pendingSpinAction();
      setPendingSpinAction(null);
    }
  }, [pendingSpinAction, timer]);

  // Handle challenge controls action (Mark Solved, Mark Failed, Skip, Abandon)
  const handleFinishChallenge = useCallback((status) => {
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

    // Pause timer and open result modal
    timer.pauseTimer();
    setResultModalState({
      isOpen: true,
      status,
    });
  }, [selectedProblem, timer, recordChallenge]);

  // Save result from debrief modal
  const handleSaveChallengeResult = useCallback((payload) => {
    recordChallenge(payload);
    timer.resetTimer();
  }, [recordChallenge, timer]);

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Topics Selector & Spin Wheel (5 cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TopicSelector />
          <SpinWheel
            onProblemSelected={handleProblemSelected}
            isChallengeActive={isChallengeActive}
            onRequestAbandon={handleRequestAbandon}
          />
        </div>

        {/* Right Column: Problem Card, Timer & Controls (7 cols on large screens) */}
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
          // Reset timer and leave user ready for next spin
          timer.resetTimer();
        }}
      />

      {/* Confirm Abandon when spinning wheel during active timer */}
      <ConfirmDialog
        isOpen={Boolean(pendingSpinAction)}
        onClose={() => setPendingSpinAction(null)}
        onConfirm={handleConfirmAbandon}
        title="Abandon Active Countdown?"
        message="A challenge countdown is currently active. Spinning the wheel now will abandon this session. Do you wish to proceed?"
        confirmLabel="Abandon & Spin"
      />
    </div>
  );
}
