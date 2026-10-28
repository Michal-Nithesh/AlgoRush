import { useState, useEffect, useRef, useCallback } from 'react';
import { playTimesUpSound } from '../utils/audio';

/**
 * Custom hook managing the challenge countdown timer with timestamp-based precision.
 */
export function useChallengeTimer({
  soundEnabled = true,
  onExpire = () => {},
  initialActiveState = null,
  onStatePersist = () => {},
} = {}) {
  // Preset default duration: 30 mins
  const [allocatedSeconds, setAllocatedSeconds] = useState(() => {
    return initialActiveState?.allocatedSeconds || 30 * 60;
  });

  const [status, setStatus] = useState(() => {
    return initialActiveState?.status || 'idle';
  });

  // Seconds used so far before the latest resume
  const [accumulatedElapsed, setAccumulatedElapsed] = useState(() => {
    return initialActiveState?.accumulatedElapsed || 0;
  });

  // Timestamp when currently running interval started
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    return initialActiveState?.sessionStartTime || null;
  });

  // Display remaining seconds
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!initialActiveState) return 30 * 60;

    const {
      status: initStatus,
      allocatedSeconds: initAlloc,
      accumulatedElapsed: initAcc,
      sessionStartTime: initStart,
    } = initialActiveState;

    if (initStatus === 'running' && initStart) {
      const now = Date.now();
      const elapsedSinceStart = Math.floor((now - initStart) / 1000);
      const totalElapsed = initAcc + elapsedSinceStart;
      return Math.max(0, initAlloc - totalElapsed);
    } else if (initStatus === 'paused') {
      return Math.max(0, initAlloc - initAcc);
    } else if (initStatus === 'times_up') {
      return 0;
    }
    return initAlloc;
  });

  const timerRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Persist timer state whenever state elements change
  const persist = useCallback(
    (nextState) => {
      onStatePersist(nextState);
    },
    [onStatePersist]
  );

  // Calculate current exact remaining seconds based on timestamps
  const calculateExactRemaining = useCallback(() => {
    if (status !== 'running' || !sessionStartTime) {
      return remainingSeconds;
    }
    const now = Date.now();
    const currentRunElapsed = Math.floor((now - sessionStartTime) / 1000);
    const totalElapsed = accumulatedElapsed + currentRunElapsed;
    const remaining = Math.max(0, allocatedSeconds - totalElapsed);
    return remaining;
  }, [status, sessionStartTime, accumulatedElapsed, allocatedSeconds, remainingSeconds]);

  // Main tick loop
  useEffect(() => {
    if (status === 'running') {
      const tick = () => {
        const remaining = calculateExactRemaining();
        setRemainingSeconds(remaining);

        if (remaining <= 0) {
          setStatus('times_up');
          setRemainingSeconds(0);
          if (soundEnabled) {
            playTimesUpSound();
          }
          onExpireRef.current?.();
          persist({
            status: 'times_up',
            allocatedSeconds,
            accumulatedElapsed: allocatedSeconds,
            sessionStartTime: null,
          });
        }
      };

      // Run immediate tick and schedule interval
      tick();
      timerRef.current = setInterval(tick, 250);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [status, calculateExactRemaining, allocatedSeconds, soundEnabled, persist]);

  // Handle visibility change (tab switching) to recalculate immediately
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        const remaining = calculateExactRemaining();
        setRemainingSeconds(remaining);
        if (remaining <= 0) {
          setStatus('times_up');
          setRemainingSeconds(0);
          if (soundEnabled) playTimesUpSound();
          onExpireRef.current?.();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status, calculateExactRemaining, soundEnabled]);

  // Timer controls
  const startTimer = useCallback((durationInMinutes = null) => {
    const totalSec = durationInMinutes ? durationInMinutes * 60 : allocatedSeconds;
    const now = Date.now();

    setAllocatedSeconds(totalSec);
    setRemainingSeconds(totalSec);
    setAccumulatedElapsed(0);
    setSessionStartTime(now);
    setStatus('running');

    persist({
      status: 'running',
      allocatedSeconds: totalSec,
      accumulatedElapsed: 0,
      sessionStartTime: now,
    });
  }, [allocatedSeconds, persist]);

  const pauseTimer = useCallback(() => {
    if (status !== 'running') return;

    const now = Date.now();
    const sessionElapsed = sessionStartTime ? Math.floor((now - sessionStartTime) / 1000) : 0;
    const totalElapsed = accumulatedElapsed + sessionElapsed;
    const newRemaining = Math.max(0, allocatedSeconds - totalElapsed);

    setAccumulatedElapsed(totalElapsed);
    setSessionStartTime(null);
    setRemainingSeconds(newRemaining);
    setStatus('paused');

    persist({
      status: 'paused',
      allocatedSeconds,
      accumulatedElapsed: totalElapsed,
      sessionStartTime: null,
    });
  }, [status, sessionStartTime, accumulatedElapsed, allocatedSeconds, persist]);

  const resumeTimer = useCallback(() => {
    if (status !== 'paused') return;

    const now = Date.now();
    setSessionStartTime(now);
    setStatus('running');

    persist({
      status: 'running',
      allocatedSeconds,
      accumulatedElapsed,
      sessionStartTime: now,
    });
  }, [status, allocatedSeconds, accumulatedElapsed, persist]);

  const resetTimer = useCallback((customMinutes = null) => {
    const totalSec = customMinutes ? customMinutes * 60 : allocatedSeconds;

    setAllocatedSeconds(totalSec);
    setRemainingSeconds(totalSec);
    setAccumulatedElapsed(0);
    setSessionStartTime(null);
    setStatus('idle');

    persist({
      status: 'idle',
      allocatedSeconds: totalSec,
      accumulatedElapsed: 0,
      sessionStartTime: null,
    });
  }, [allocatedSeconds, persist]);

  const setDuration = useCallback((minutes) => {
    const totalSec = minutes * 60;
    setAllocatedSeconds(totalSec);
    setRemainingSeconds(totalSec);
    setAccumulatedElapsed(0);
    setSessionStartTime(null);
    setStatus('idle');

    persist({
      status: 'idle',
      allocatedSeconds: totalSec,
      accumulatedElapsed: 0,
      sessionStartTime: null,
    });
  }, [persist]);

  // Derived values (purely derived from allocatedSeconds and remainingSeconds)
  const timeUsedSeconds = Math.max(0, Math.min(allocatedSeconds, allocatedSeconds - remainingSeconds));

  const progressFraction = allocatedSeconds > 0
    ? Math.max(0, Math.min(1, (allocatedSeconds - remainingSeconds) / allocatedSeconds))
    : 0;

  // Warning thresholds
  const isWarning = remainingSeconds <= 300 && remainingSeconds > 60 && status === 'running'; // <= 5 mins
  const isCritical = remainingSeconds <= 60 && remainingSeconds > 0 && status === 'running'; // <= 1 min
  const isTimesUp = status === 'times_up' || remainingSeconds === 0;

  return {
    allocatedSeconds,
    remainingSeconds,
    timeUsedSeconds,
    progressFraction,
    status,
    isWarning,
    isCritical,
    isTimesUp,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setDuration,
  };
}
