import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateDashboardStats } from '../../utils/statistics';
import {
  BarChart3,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  TrendingUp,
} from 'lucide-react';

export default function StatisticsView() {
  const { topics, problems, history } = useApp();
  const stats = calculateDashboardStats(topics, problems, history);

  const statCards = [
    {
      label: 'Total Challenges Attempted',
      value: stats.totalChallenges,
      subtext: `${stats.solvedToday} solved today`,
      icon: Award,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Unique Problems Solved',
      value: `${stats.totalSolvedProblems} / ${stats.totalProblems}`,
      subtext: `${Math.round((stats.totalSolvedProblems / (stats.totalProblems || 1)) * 100)}% of problem library solved`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      subtext: `${stats.solvedToday} solved out of ${stats.challengesToday} attempts today`,
      icon: TrendingUp,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Total Topics Covered',
      value: stats.totalTopics,
      subtext: 'Core algorithmic patterns organized',
      icon: Layers,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  const maxWeeklyCount = Math.max(
    1,
    ...stats.weeklyActivity.map((d) => d.totalCount)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Performance Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics and weekly consistency breakdown calculated directly from your local challenge logs.
        </p>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400">
                    {card.label}
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-white mt-1">
                    {card.value}
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl border ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">{card.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Weekly Activity Bar Chart + Difficulty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity 7-Day Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#14161F] border border-[#2C3142] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Past 7 Days Consistency
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Today: {stats.challengesToday} challenges
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-[#2C3142]">
            {stats.weeklyActivity.map((day, i) => {
              const solvedHeightPercent = (day.solvedCount / maxWeeklyCount) * 100;
              const failedHeightPercent = (day.failedCount / maxWeeklyCount) * 100;
              const isEmpty = day.totalCount === 0;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-[#1D202D] border border-[#2C3142] text-slate-200 px-2 py-1 rounded-md pointer-events-none whitespace-nowrap mb-1 font-mono">
                    {day.solvedCount} solved / {day.totalCount} tried
                  </div>

                  {/* Stacked bar representation */}
                  <div className="w-full max-w-[36px] bg-[#1D202D] rounded-t-lg overflow-hidden flex flex-col justify-end h-32 relative">
                    {isEmpty ? (
                      <div className="w-full h-1 bg-[#2C3142] rounded-full self-center mb-1" />
                    ) : (
                      <>
                        {day.failedCount > 0 && (
                          <div
                            style={{ height: `${failedHeightPercent}%` }}
                            className="w-full bg-rose-500/70 hover:bg-rose-500 transition-colors"
                            title={`${day.failedCount} failed attempts`}
                          />
                        )}
                        {day.solvedCount > 0 && (
                          <div
                            style={{ height: `${solvedHeightPercent}%` }}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
                            title={`${day.solvedCount} solved challenges`}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-xs font-mono font-medium ${
                      day.isToday ? 'text-amber-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Solved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500/80" />
              <span>Failed / Expired</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#1D202D]" />
              <span>No Activity</span>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-[#14161F] border border-[#2C3142] rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Difficulty Mastery
            </h3>
          </div>

          <div className="space-y-4">
            {['Easy', 'Medium', 'Hard'].map((diff) => {
              const diffStat = stats.difficultyStats[diff] || { solved: 0, total: 0 };
              const percent = diffStat.total > 0
                ? Math.round((diffStat.solved / diffStat.total) * 100)
                : 0;

              const colors = {
                Easy: 'bg-emerald-500 text-emerald-400',
                Medium: 'bg-amber-500 text-amber-400',
                Hard: 'bg-rose-500 text-rose-400',
              }[diff];

              return (
                <div key={diff} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{diff}</span>
                    <span className="font-mono text-slate-400">
                      {diffStat.solved} / {diffStat.total} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#1D202D] rounded-full overflow-hidden border border-[#2C3142]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.split(' ')[0]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#2C3142] flex items-center justify-between text-xs text-slate-400">
            <span>Overall completion rate:</span>
            <span className="font-mono font-bold text-amber-400">
              {Math.round((stats.totalSolvedProblems / (stats.totalProblems || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
