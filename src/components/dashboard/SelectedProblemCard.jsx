import React, { useState } from 'react';
import DifficultyBadge from '../common/DifficultyBadge';
import { useApp } from '../../context/AppContext';
import { formatProblemForClipboard } from '../../utils/selection';
import {
  ExternalLink,
  Clock,
  Tag,
  BookmarkCheck,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function SelectedProblemCard({ problem }) {
  const { topics, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!problem) {
    return (
      <div className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#1D202D] border border-[#2C3142] flex items-center justify-center text-amber-400">
          <HelpCircle className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">
          No Problem Selected
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Pick a random problem or select one from your library to start the challenge.
        </p>
      </div>
    );
  }

  const topicNames = (problem.topicIds || []).map((id) => {
    const found = topics.find((t) => t.id === id);
    return found ? found.name : id;
  });

  const handleCopyStatement = async () => {
    try {
      const textToCopy = formatProblemForClipboard(problem, topics);

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast?.('Problem statement copied to clipboard!', 'success');
    } catch {
      showToast?.('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
      {/* Top Meta Header: Difficulty + Estimated Time + Revision flag */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} size="md" />
          {problem.forRevision && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
              <BookmarkCheck className="w-3 h-3" />
              Revision
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyStatement}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-slate-300 hover:text-white bg-[#1D202D] hover:bg-[#25293A] border border-[#2C3142] rounded-lg transition-colors"
            title="Copy problem statement and diagrams formatted for your IDE"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Statement</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-[#1D202D] px-2.5 py-1 rounded-lg border border-[#2C3142]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Est. {problem.estimatedTime || 20}m</span>
          </div>
        </div>
      </div>

      {/* Title & External Link */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {problem.title}
          </h2>

          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 px-3 py-1.5 rounded-xl transition-all shadow-sm group font-mono"
              title="Open problem in new tab"
            >
              <span>Solve Link</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>

        {/* Topic tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {topicNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-lg"
            >
              <Tag className="w-2.5 h-2.5 text-amber-400" />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Question Statement & Pattern Target (Clean Question Only, No Answer/Code) */}
      {problem.description && (
        <div className="bg-[#0C0D12]/80 border border-[#2C3142] rounded-xl p-4 text-slate-200">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Problem Statement</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">
              No solutions or code spoilers
            </span>
          </div>
          <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-text font-normal overflow-x-auto">
            {problem.description}
          </pre>
        </div>
      )}
    </div>
  );
}
