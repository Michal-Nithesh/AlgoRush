import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  SkipForward,
  Flag,
  ExternalLink,
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ChallengeControls({
  problem,
  timer,
  onFinishChallenge, // (status: 'solved' | 'failed' | 'skipped' | 'abandoned')
}) {
  const { status, resetTimer } = timer;
  const [isAbandonConfirmOpen, setIsAbandonConfirmOpen] = useState(false);

  if (!problem) return null;

  const isChallengeActive = status === 'running' || status === 'paused' || status === 'times_up';

  const handleAbandonConfirm = () => {
    resetTimer();
    onFinishChallenge('abandoned');
  };

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-5 shadow-lg flex flex-col gap-3">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
        <span>Challenge Controls</span>
        {isChallengeActive && (
          <span className="text-[11px] font-mono text-cyan-400 font-normal">
            Session in progress
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Mark as Solved */}
        <button
          onClick={() => onFinishChallenge('solved')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          title="Mark this problem as Solved"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Mark Solved</span>
        </button>

        {/* Mark as Failed */}
        <button
          onClick={() => onFinishChallenge('failed')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Mark this challenge as Failed"
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Mark Failed</span>
        </button>

        {/* Skip Problem */}
        <button
          onClick={() => onFinishChallenge('skipped')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1D2740] hover:bg-[#24304F] text-slate-300 border border-[#29344D] rounded-xl text-xs font-medium transition-all"
          title="Skip to another problem"
        >
          <SkipForward className="w-4 h-4 text-slate-400" />
          <span>Skip</span>
        </button>

        {/* Abandon Challenge */}
        <button
          onClick={() => {
            if (isChallengeActive) {
              setIsAbandonConfirmOpen(true);
            } else {
              onFinishChallenge('abandoned');
            }
          }}
          disabled={!isChallengeActive}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1D2740]/60 hover:bg-rose-900/20 text-slate-400 hover:text-rose-300 border border-[#29344D] hover:border-rose-500/30 rounded-xl text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Abandon active challenge"
        >
          <Flag className="w-4 h-4 text-slate-400" />
          <span>Abandon</span>
        </button>
      </div>

      {/* External Link action if problem has URL */}
      {problem.url && (
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-800/30 rounded-xl transition-colors mt-1"
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
