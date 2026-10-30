import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import DifficultyBadge from '../common/DifficultyBadge';
import {
  Clock,
  CheckCircle2,
  XCircle,
  SkipForward,
  Flag,
  Calendar,
  Search,
} from 'lucide-react';

export default function ChallengeHistory() {
  const { history } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.problemTitle?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes) return false;
      }
      return true;
    });
  }, [history, statusFilter, searchQuery]);

  const statusIcons = {
    solved: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    failed: <XCircle className="w-4 h-4 text-rose-400" />,
    skipped: <SkipForward className="w-4 h-4 text-slate-400" />,
    abandoned: <Flag className="w-4 h-4 text-amber-400" />,
  };

  const statusBadges = {
    solved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    skipped: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    abandoned: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  };

  const formatSeconds = (totalSec) => {
    if (!totalSec && totalSec !== 0) return '0s';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Challenge History
            </h1>
            <span className="text-xs text-slate-400 font-mono bg-[#1D202D] px-2 py-0.5 rounded-full border border-[#2C3142]">
              {history.length} sessions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review past timer sessions, completion statuses, and pattern notes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history by problem or notes..."
            className="w-full pl-9 pr-4 py-2 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto bg-[#1D202D] p-1 rounded-xl border border-[#2C3142]">
          {['all', 'solved', 'failed', 'skipped', 'abandoned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-12 text-center shadow-sm">
          <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            No Challenge Sessions Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {history.length === 0
              ? 'Complete a timed challenge in the Arena to start recording your personal journey.'
              : 'No entries match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#14161F] border border-[#2C3142] hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
            >
              {/* Left Column: Status Icon + Title + Difficulty + Date */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-[#1D202D] border border-[#2C3142] flex-shrink-0 mt-0.5">
                  {statusIcons[item.status] || <Clock className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {item.problemTitle}
                    </h3>
                    {item.difficulty && (
                      <DifficultyBadge difficulty={item.difficulty} size="sm" />
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded border ${
                        statusBadges[item.status] || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 italic line-clamp-2 bg-[#0C0D12]/60 p-2 rounded-lg border border-[#2C3142]/60 mt-1">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Time Breakdown + Timestamp */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 text-xs font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-[#2C3142]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Used: {formatSeconds(item.timeUsedSeconds)} / {item.timeAllocatedMinutes}m
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.completedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
