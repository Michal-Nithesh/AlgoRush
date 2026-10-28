import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import Modal from '../common/Modal';

export default function ChallengeTimer({ timer }) {
  const {
    allocatedSeconds,
    remainingSeconds,
    status,
    isWarning,
    isCritical,
    isTimesUp,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setDuration,
  } = timer;

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [customError, setCustomError] = useState('');

  // Format MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Circular progress SVG geometry
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  // Progress fraction represents how much time has passed (0 -> 1)
  // or remaining fraction: 1 - progressFraction
  const remainingFraction = allocatedSeconds > 0 ? remainingSeconds / allocatedSeconds : 0;
  const strokeDashoffset = circumference * (1 - remainingFraction);

  // Dynamic colors based on time warning thresholds
  let ringColor = 'stroke-cyan-400';
  let glowColor = 'drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]';
  let textColor = 'text-white';
  let statusBanner = null;

  if (isTimesUp) {
    ringColor = 'stroke-rose-500';
    glowColor = 'drop-shadow-[0_0_16px_rgba(251,113,133,0.6)]';
    textColor = 'text-rose-400 animate-pulse';
    statusBanner = (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-xs font-semibold animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Time&rsquo;s Up! Make your call.</span>
      </div>
    );
  } else if (isCritical) {
    ringColor = 'stroke-rose-400';
    glowColor = 'drop-shadow-[0_0_14px_rgba(251,113,133,0.5)]';
    textColor = 'text-rose-300';
    statusBanner = (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded-full text-xs font-medium animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Final 60 seconds — wrap up logic!</span>
      </div>
    );
  } else if (isWarning) {
    ringColor = 'stroke-amber-400';
    glowColor = 'drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]';
    textColor = 'text-amber-300';
    statusBanner = (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium">
        <Clock className="w-3.5 h-3.5" />
        <span>5 minutes remaining</span>
      </div>
    );
  }

  const presets = [15, 30, 45, 60];
  const currentMinutes = allocatedSeconds / 60;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customMinutesInput, 10);
    if (isNaN(val) || val < 1 || val > 180) {
      setCustomError('Please enter a duration between 1 and 180 minutes.');
      return;
    }
    setDuration(val);
    setIsCustomModalOpen(false);
    setCustomMinutesInput('');
    setCustomError('');
  };

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-6 shadow-lg flex flex-col items-center gap-5">
      {/* Timer Header & Preset Duration Selector */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Challenge Timer
          </span>
        </div>

        {/* Preset Duration Buttons */}
        <div className="flex items-center gap-1 bg-[#1D2740] p-1 rounded-xl border border-[#29344D]">
          {presets.map((mins) => (
            <button
              key={mins}
              onClick={() => setDuration(mins)}
              disabled={status === 'running'}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
                currentMinutes === mins
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#24304F] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {mins}m
            </button>
          ))}
          <button
            onClick={() => {
              setCustomMinutesInput(String(currentMinutes));
              setIsCustomModalOpen(true);
            }}
            disabled={status === 'running'}
            className={`p-1.5 text-xs rounded-lg transition-all text-slate-400 hover:text-slate-200 hover:bg-[#24304F] disabled:opacity-50 disabled:cursor-not-allowed ${
              !presets.includes(currentMinutes) ? 'bg-purple-600 text-white' : ''
            }`}
            title="Custom Duration"
            aria-label="Set custom duration"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Circular Progress Display */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#1D2740"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active Countdown Ring */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            className={`transition-all duration-300 ${ringColor} ${glowColor}`}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Timer Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`text-4xl font-extrabold font-mono tracking-tight ${textColor}`}
          >
            {formattedTime}
          </span>
          <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono mt-1">
            {status === 'running'
              ? 'ACTIVE'
              : status === 'paused'
              ? 'PAUSED'
              : status === 'times_up'
              ? 'TIME EXPIRED'
              : 'READY'}
          </span>
        </div>
      </div>

      {/* Warning Status Banner */}
      {statusBanner && <div className="animate-in fade-in">{statusBanner}</div>}

      {/* Timer Controls */}
      <div className="flex items-center gap-3">
        {status === 'idle' && (
          <button
            onClick={() => startTimer()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-glow-purple transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Challenge</span>
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1D2740] hover:bg-[#24304F] text-slate-200 border border-[#29344D] font-semibold text-sm rounded-xl transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            <button
              onClick={() => resetTimer()}
              className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-[#1D2740] border border-[#29344D] rounded-xl transition-colors"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={resumeTimer}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-glow-purple transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume</span>
            </button>
            <button
              onClick={() => resetTimer()}
              className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-[#1D2740] border border-[#29344D] rounded-xl transition-colors"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}

        {status === 'times_up' && (
          <button
            onClick={() => resetTimer()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D2740] hover:bg-[#24304F] text-slate-200 border border-[#29344D] font-semibold text-sm rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Timer</span>
          </button>
        )}
      </div>

      {/* Custom Duration Modal */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Custom Challenge Duration"
        maxWidth="max-w-xs"
      >
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          {customError && (
            <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {customError}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Duration in minutes (1 - 180)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutesInput}
              onChange={(e) => {
                setCustomMinutesInput(e.target.value);
                setCustomError('');
              }}
              placeholder="e.g. 25"
              className="w-full px-3 py-2 bg-[#1D2740] border border-[#29344D] rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#29344D]">
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#1D2740] rounded-lg border border-[#29344D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-glow-purple"
            >
              Set Duration
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
