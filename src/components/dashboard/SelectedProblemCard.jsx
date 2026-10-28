import React from 'react';
import DifficultyBadge from '../common/DifficultyBadge';
import { useApp } from '../../context/AppContext';
import { ExternalLink, Clock, Tag, BookmarkCheck, HelpCircle } from 'lucide-react';

export default function SelectedProblemCard({ problem }) {
  const { topics } = useApp();

  if (!problem) {
    return (
      <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-6 text-center shadow-lg">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#1D2740] flex items-center justify-center text-purple-400">
          <HelpCircle className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">
          No Problem Selected
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Spin the wheel or pick a problem from your library to start the challenge.
        </p>
      </div>
    );
  }

  // Map topicIds to topic names
  const topicNames = (problem.topicIds || []).map((id) => {
    const found = topics.find((t) => t.id === id);
    return found ? found.name : id;
  });

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
      {/* Background soft glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Meta Header: Difficulty + Estimated Time + Revision flag */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} size="md" />
          {problem.forRevision && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <BookmarkCheck className="w-3 h-3" />
              Revision
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-[#1D2740] px-2.5 py-1 rounded-lg border border-[#29344D]">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Est. {problem.estimatedTime || 20}m</span>
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
              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 px-3 py-1.5 rounded-xl transition-all shadow-sm group"
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
              className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2.5 py-0.5 rounded-lg"
            >
              <Tag className="w-2.5 h-2.5 text-purple-400" />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Question Statement & Pattern Target (Clean Question Only, No Answer/Code) */}
      {problem.description && (
        <div className="bg-[#0B1020]/70 border border-[#29344D] rounded-xl p-4 text-slate-200">
          <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Problem Statement</span>
          </div>
          <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-text">
            {problem.description}
          </pre>
        </div>
      )}
    </div>
  );
}
