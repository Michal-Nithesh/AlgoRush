import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateDashboardStats } from '../../utils/statistics';
import {
  Flame,
  CheckCircle2,
  Settings,
  Code2,
  Clock,
  BarChart3,
  BookOpen,
} from 'lucide-react';

function AlgoRushLogo({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Monogram A + forward algorithm rush chevron */}
      <path
        d="M3.5 18L10 5.5L16.5 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 13H13.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M14.5 9L19.5 13L14.5 17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="5.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function Header({ onOpenSettings }) {
  const { topics, problems, history, activeTab, setActiveTab } = useApp();
  const stats = calculateDashboardStats(topics, problems, history);

  const navItems = [
    { id: 'dashboard', label: 'Arena', icon: Code2 },
    { id: 'problems', label: 'Problem Library', icon: BookOpen, count: problems.length },
    { id: 'history', label: 'History', icon: Clock, count: history.length },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2C3142] bg-[#0C0D12]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D202D] border border-[#2C3142] flex items-center justify-center text-amber-400 shadow-sm">
              <AlgoRushLogo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  ALGO<span className="text-amber-400 font-extrabold">RUSH</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personal DSA Challenge Arena
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#14161F] p-1 rounded-xl border border-[#2C3142]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1D202D]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-200'
                          : 'bg-[#1D202D] text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stats Badges and Settings Button */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14161F] border border-[#2C3142] text-amber-400 shadow-sm"
              title={`${stats.streak} day streak of solved problems`}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse-slow" />
              <span className="font-mono text-sm font-bold text-slate-100">{stats.streak}</span>
              <span className="text-xs text-slate-400 hidden sm:inline font-mono">streak</span>
            </div>

            {/* Total Solved Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14161F] border border-[#2C3142] text-emerald-400 shadow-sm"
              title={`${stats.totalSolvedProblems} unique problems solved out of ${problems.length}`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-sm font-bold text-slate-100">
                {stats.totalSolvedProblems}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                / {problems.length}
              </span>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-100 bg-[#14161F] hover:bg-[#1D202D] border border-[#2C3142] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Settings and Backup"
              title="Settings & Data Management"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-[#2C3142] py-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[10px] px-1 rounded-full bg-[#1D202D]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
