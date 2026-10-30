import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Flag,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ChallengeControls({
  problem,
  timer,
  onFinishChallenge, // (status: 'solved' | 'failed' | 'skipped' | 'abandoned')
}) {
  const {
    status,
    resetTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
  } = timer;

  const [isAbandonConfirmOpen, setIsAbandonConfirmOpen] = useState(false);

  const isChallengeActive =
    status === 'running' || status === 'paused' || status === 'times_up';

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (document.querySelector('[role="dialog"]') || isAbandonConfirmOpen) {
        return;
      }

      if (e.repeat) return;

      // Space: Start, Pause, or Resume countdown
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'idle') {
          startTimer();
        } else if (status === 'running') {
          pauseTimer();
        } else if (status === 'paused') {
          resumeTimer();
        }
        return;
      }

      // S key: Mark Solved
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (isChallengeActive) {
          e.preventDefault();
          onFinishChallenge('solved');
        }
        return;
      }

      // F key: Mark Failed
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (isChallengeActive) {
          e.preventDefault();
          onFinishChallenge('failed');
        }
        return;
      }

      // R key: Reset Timer / Abandon
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (isChallengeActive) {
          setIsAbandonConfirmOpen(true);
        } else if (status === 'idle') {
          resetTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    status,
    isChallengeActive,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    onFinishChallenge,
    isAbandonConfirmOpen,
  ]);

  if (!problem) return null;

  const handleAbandonConfirm = () => {
    resetTimer();
    onFinishChallenge('abandoned');
  };

  return (
    <div className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Challenge Controls</span>
          <span className="hidden sm:inline-flex items-center text-[10px] text-slate-400 font-mono bg-[#1D202D] px-1.5 py-0.5 rounded border border-[#2C3142]">
            Hotkeys Active
          </span>
        </div>
        {isChallengeActive ? (
          <span className="text-[11px] font-mono text-amber-400 font-medium">
            ● Timer in progress
          </span>
        ) : (
          <span className="text-[11px] font-mono text-slate-400">
            Press [Space] to start
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Mark as Solved */}
        <button
          onClick={() => onFinishChallenge('solved')}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm group"
          title="Mark this problem as Solved (Hotkey: S)"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark Solved</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 group-hover:text-emerald-300">
            [S]
          </span>
        </button>

        {/* Mark as Failed */}
        <button
          onClick={() => onFinishChallenge('failed')}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] group"
          title="Mark this challenge as Failed (Hotkey: F)"
        >
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Mark Failed</span>
          </div>
          <span className="text-[10px] font-mono text-rose-400/80 group-hover:text-rose-300">
            [F]
          </span>
        </button>

        {/* Space Play/Pause/Resume shortcut action */}
        <button
          onClick={() => {
            if (status === 'idle') startTimer();
            else if (status === 'running') pauseTimer();
            else if (status === 'paused') resumeTimer();
          }}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 bg-[#1D202D] hover:bg-[#25293A] text-slate-200 border border-[#2C3142] rounded-xl text-xs font-medium transition-all group"
          title={
            status === 'running'
              ? 'Pause Countdown (Hotkey: Space)'
              : 'Start / Resume Countdown (Hotkey: Space)'
          }
        >
          <div className="flex items-center gap-1.5">
            {status === 'running' ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>{status === 'paused' ? 'Resume' : 'Start'}</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">
            [Space]
          </span>
        </button>

        {/* Abandon / Reset Challenge */}
        <button
          onClick={() => {
            if (isChallengeActive) {
              setIsAbandonConfirmOpen(true);
            } else {
              resetTimer();
            }
          }}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 bg-[#1D202D]/60 hover:bg-rose-950/20 text-slate-400 hover:text-rose-300 border border-[#2C3142] hover:border-rose-500/30 rounded-xl text-xs font-medium transition-all group"
          title="Reset timer or abandon current attempt (Hotkey: R)"
        >
          <div className="flex items-center gap-1.5">
            {isChallengeActive ? (
              <>
                <Flag className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
                <span>Abandon</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
                <span>Reset</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400 group-hover:text-rose-300">
            [R]
          </span>
        </button>
      </div>

      {/* External Link action if problem has URL */}
      {problem.url && (
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-800/30 rounded-xl transition-colors mt-1 font-mono"
        >
          <span>Open on LeetCode / Coding Platform</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Abandon Challenge Dialog */}
      <ConfirmDialog
        isOpen={isAbandonConfirmOpen}
        onClose={() => setIsAbandonConfirmOpen(false)}
        onConfirm={handleAbandonConfirm}
        title="Abandon Active Challenge?"
        message="Are you sure you want to abandon the current countdown? Your timer progress will be discarded."
        confirmLabel="Abandon Challenge"
      />
    </div>
  );
}
