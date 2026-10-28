import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateDashboardStats } from '../../utils/statistics';
import {
  Flame,
  CheckCircle2,
  Settings,
  Zap,
  Clock,
  BarChart3,
  BookOpen
} from 'lucide-react';

export default function Header({ onOpenSettings }) {
  const { topics, problems, history, activeTab, setActiveTab } = useApp();
  const stats = calculateDashboardStats(topics, problems, history);

  const navItems = [
    { id: 'dashboard', label: 'Arena', icon: Zap },
    { id: 'problems', label: 'Problem Library', icon: BookOpen, count: problems.length },
    { id: 'history', label: 'History', icon: Clock, count: history.length },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#29344D] bg-[#0B1020]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-700 p-0.5 shadow-glow-purple flex items-center justify-center">
              <div className="w-full h-full bg-[#151C30] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  ALGO<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">RUSH</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-purple-300 bg-purple-900/40 border border-purple-500/30 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personal DSA Training Arena
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#151C30]/80 p-1 rounded-xl border border-[#29344D]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1D2740]/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-200'
                          : 'bg-[#1D2740] text-slate-400'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151C30] border border-[#29344D] text-amber-400 shadow-sm"
              title={`${stats.streak} day streak of solved problems`}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse-slow" />
              <span className="font-mono text-sm font-bold text-slate-100">{stats.streak}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">streak</span>
            </div>

            {/* Total Solved Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151C30] border border-[#29344D] text-emerald-400 shadow-sm"
              title={`${stats.totalSolvedProblems} unique problems solved out of ${problems.length}`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-sm font-bold text-slate-100">
                {stats.totalSolvedProblems}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                / {problems.length}
              </span>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-100 bg-[#151C30] hover:bg-[#1D2740] border border-[#29344D] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Settings and Backup"
              title="Settings & Data Management"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-[#29344D] py-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[10px] px-1 rounded-full bg-[#1D2740]">
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
