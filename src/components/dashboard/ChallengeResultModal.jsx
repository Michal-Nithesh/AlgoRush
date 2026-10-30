import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import DifficultyBadge from '../common/DifficultyBadge';
import { playSuccessChime } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookmarkCheck,
  FileText,
} from 'lucide-react';

function ChallengeResultContent({
  problem,
  status,
  timeAllocatedMinutes,
  timeUsedSeconds,
  onSaveResult,
  onSpinAnother,
  onClose,
}) {
  const [notes, setNotes] = useState(problem?.notes || '');
  const [forRevision, setForRevision] = useState(!!problem?.forRevision);

  useEffect(() => {
    if (status === 'solved') {
      playSuccessChime();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#F43F5E', '#38BDF8'],
        });
      } catch {
        // Ignore if canvas-confetti is unavailable
      }
    }
  }, [status]);

  const usedMinutes = Math.floor(timeUsedSeconds / 60);
  const usedSecs = timeUsedSeconds % 60;
  const formattedUsed = `${usedMinutes}m ${String(usedSecs).padStart(2, '0')}s`;

  const statusConfig = {
    solved: {
      title: 'Problem Solved!',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      subtext: 'Awesome execution! Pattern conquered before the clock ran out.',
    },
    failed: {
      title: 'Challenge Incomplete',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <XCircle className="w-6 h-6 text-rose-400" />,
      subtext: 'Keep at it! Review the edge case or pattern invariants below.',
    },
    skipped: {
      title: 'Problem Skipped',
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
      icon: <Clock className="w-6 h-6 text-slate-400" />,
      subtext: 'Moved on to the next challenge.',
    },
    abandoned: {
      title: 'Challenge Abandoned',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      subtext: 'Session stopped before completion.',
    },
  }[status] || {
    title: 'Challenge Finished',
    badgeColor: 'bg-slate-700 text-slate-300',
    icon: <CheckCircle2 className="w-6 h-6 text-slate-400" />,
    subtext: 'Session ended.',
  };

  const handleSaveAndClose = () => {
    onSaveResult({
      problemId: problem.id,
      problemTitle: problem.title,
      topicIds: problem.topicIds,
      difficulty: problem.difficulty,
      timeAllocatedMinutes,
      timeUsedSeconds,
      status,
      notes: notes.trim(),
      forRevision,
    });
    onClose();
  };

  const handleSaveAndSpin = () => {
    onSaveResult({
      problemId: problem.id,
      problemTitle: problem.title,
      topicIds: problem.topicIds,
      difficulty: problem.difficulty,
      timeAllocatedMinutes,
      timeUsedSeconds,
      status,
      notes: notes.trim(),
      forRevision,
    });
    onSpinAnother();
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#1D202D] border border-[#2C3142]">
        <div className="flex-shrink-0 mt-0.5">{statusConfig.icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-mono">{statusConfig.title}</h3>
            <span
              className={`text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded border ${statusConfig.badgeColor}`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{statusConfig.subtext}</p>
        </div>
      </div>

      {/* Problem Summary & Time Stats */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0C0D12]/80 border border-[#2C3142]">
        <div>
          <span className="text-[11px] text-slate-400 block mb-1">Target Problem</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100 truncate">
              {problem.title}
            </span>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>
        </div>

        <div className="border-l border-[#2C3142] pl-3">
          <span className="text-[11px] text-slate-400 block mb-1">Time Performance</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Used: {formattedUsed} / {timeAllocatedMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Personal Notes Textarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Personal Notes & Pattern Takeaways</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Record time/space complexity, trick edge cases, or java standard library nuances..."
          className="w-full px-3.5 py-2.5 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Mark for Revision Checkbox */}
      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
        <input
          type="checkbox"
          checked={forRevision}
          onChange={(e) => setForRevision(e.target.checked)}
          className="w-4 h-4 rounded border-[#2C3142] bg-[#1D202D] text-amber-500 focus:ring-amber-500 cursor-pointer"
        />
        <BookmarkCheck className="w-4 h-4 text-amber-400" />
        <span>Flag this problem for spaced repetition revision</span>
      </label>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-[#2C3142]">
        <button
          type="button"
          onClick={handleSaveAndClose}
          className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1D202D] hover:bg-[#25293A] rounded-xl border border-[#2C3142] transition-colors"
        >
          Save & Close
        </button>
        <button
          type="button"
          onClick={handleSaveAndSpin}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>Save & Pick Another</span>
        </button>
      </div>
    </div>
  );
}

export default function ChallengeResultModal({
  isOpen,
  onClose,
  problem,
  status,
  timeAllocatedMinutes,
  timeUsedSeconds,
  onSaveResult,
  onSpinAnother,
}) {
  if (!isOpen || !problem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Challenge Debrief" maxWidth="max-w-lg">
      <ChallengeResultContent
        key={`${problem.id}-${status}`}
        problem={problem}
        status={status}
        timeAllocatedMinutes={timeAllocatedMinutes}
        timeUsedSeconds={timeUsedSeconds}
        onSaveResult={onSaveResult}
        onSpinAnother={onSpinAnother}
        onClose={onClose}
      />
    </Modal>
  );
}
