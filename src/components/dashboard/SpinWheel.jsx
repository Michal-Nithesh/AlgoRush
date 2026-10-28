import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  filterProblems,
  selectRandomProblem,
  calculateTargetWheelRotation,
} from '../../utils/selection';
import { playTickSound } from '../../utils/audio';
import { Sparkles, RotateCw, AlertCircle, Compass } from 'lucide-react';

export default function SpinWheel({ onProblemSelected, isChallengeActive = false, onRequestAbandon = () => {} }) {
  const {
    problems,
    selectedTopicIds,
    difficultyFilter,
    setDifficultyFilter,
    sessionSolvedIds,
    settings,
  } = useApp();

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pickedProblem, setPickedProblem] = useState(null);
  const lastSpinTimeRef = useRef(0);
  const audioIntervalRef = useRef(null);

  // Eligible problems matching currently selected topics and difficulty
  const eligibleProblems = useMemo(() => {
    return filterProblems(problems, {
      selectedTopicIds,
      difficulty: difficultyFilter,
    });
  }, [problems, selectedTopicIds, difficultyFilter]);

  // Handle spin action
  const handleSpin = () => {
    if (isSpinning) return;
    if (eligibleProblems.length === 0) return;

    if (isChallengeActive) {
      onRequestAbandon(() => {
        // Callback if user confirms abandoning current challenge
        triggerSpin();
      });
      return;
    }

    triggerSpin();
  };

  const triggerSpin = () => {
    setIsSpinning(true);
    setPickedProblem(null);
    lastSpinTimeRef.current = Date.now();

    // Select genuinely random problem respecting session-solved avoidance
    const { selectedProblem, selectedIndex } = selectRandomProblem(
      eligibleProblems,
      sessionSolvedIds
    );

    if (!selectedProblem || selectedIndex === -1) {
      setIsSpinning(false);
      return;
    }

    // Keep reference to picked problem
    setPickedProblem(selectedProblem);

    // Calculate exact target rotation so selectedIndex slice stops at 12 o'clock (0 deg)
    const targetRotation = calculateTargetWheelRotation(
      selectedIndex,
      eligibleProblems.length,
      rotationAngle,
      6 // 6 full rotations
    );

    setRotationAngle(targetRotation);

    // Play subtle ticks during spin if sound enabled
    if (settings?.soundEnabled) {
      let tickCount = 0;
      const maxTicks = 16;
      audioIntervalRef.current = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount >= maxTicks) {
          clearInterval(audioIntervalRef.current);
        }
      }, 250);
    }
  };

  // Clean up audio tick interval on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  const handleTransitionEnd = () => {
    if (!isSpinning) return;
    setIsSpinning(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);

    if (pickedProblem) {
      onProblemSelected(pickedProblem);
    }
  };

  // Slice geometry for SVG wheel
  const wheelSlices = useMemo(() => {
    const total = eligibleProblems.length;
    if (total === 0) return [];

    const sliceAngle = 360 / total;

    return eligibleProblems.map((problem, index) => {
      const startAngle = index * sliceAngle - 90; // Start at 12 o'clock (-90 deg in standard SVG)
      const endAngle = (index + 1) * sliceAngle - 90;

      // Coordinate calculation on circle (radius 140)
      const r = 140;
      const cx = 150;
      const cy = 150;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData = total === 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // Text rotation and position at midpoint of the slice
      const midAngle = (index + 0.5) * sliceAngle - 90;
      const midRad = (midAngle * Math.PI) / 180;
      const textRadius = r * 0.65;
      const tx = cx + textRadius * Math.cos(midRad);
      const ty = cy + textRadius * Math.sin(midRad);
      const textAngle = midAngle + 90; // orient outward

      // Alternating slice background colors
      const isEven = index % 2 === 0;
      const sliceFill = isEven ? '#1D2740' : '#151C30';

      // Truncate long title
      const maxLen = total > 12 ? 10 : 14;
      const displayTitle =
        problem.title.length > maxLen
          ? `${problem.title.substring(0, maxLen)}...`
          : problem.title;

      return {
        id: problem.id,
        index,
        pathData,
        sliceFill,
        tx,
        ty,
        textAngle,
        displayTitle,
        difficulty: problem.difficulty,
      };
    });
  }, [eligibleProblems]);

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header and Difficulty filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Problem Roulette
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({eligibleProblems.length} available)
          </span>
        </div>

        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1 bg-[#1D2740] p-0.5 rounded-lg border border-[#29344D]">
          {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                difficultyFilter.toLowerCase() === diff.toLowerCase()
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff === 'all' ? 'All' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Wheel Container or Empty State */}
      {eligibleProblems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-[#0B1020]/50 border border-dashed border-[#29344D] my-2">
          <div className="p-3 bg-[#1D2740] rounded-2xl text-amber-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            No Eligible Problems
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mb-3">
            No problems match your current topic selection and difficulty filter.
          </p>
          <div className="text-[11px] text-purple-400 font-mono bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-500/20">
            Tip: Select more topics or switch difficulty to &ldquo;All&rdquo;.
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center my-2 select-none">
          {/* Top Pointer Indicator (at 12 o'clock pointing down) */}
          <div className="absolute top-0 z-20 flex flex-col items-center -translate-y-2 pointer-events-none">
            <div className="w-5 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 clip-triangle shadow-glow-cyan filter drop-shadow-[0_2px_6px_rgba(34,211,238,0.8)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-glow-cyan -mt-1" />
          </div>

          {/* Wheel Graphic */}
          <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] flex items-center justify-center">
            {/* Outer Glowing Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 shadow-[0_0_25px_rgba(139,92,246,0.15)] pointer-events-none" />

            <svg
              viewBox="0 0 300 300"
              className="w-full h-full transform will-change-transform"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning
                  ? 'transform 4.5s cubic-bezier(0.12, 0.8, 0.25, 1.0)'
                  : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {/* Outer wheel border */}
              <circle
                cx="150"
                cy="150"
                r="144"
                fill="#0B1020"
                stroke="#29344D"
                strokeWidth="4"
              />

              {/* Slices */}
              {wheelSlices.map((slice) => (
                <g key={slice.id}>
                  <path
                    d={slice.pathData}
                    fill={slice.sliceFill}
                    stroke="#29344D"
                    strokeWidth="1.5"
                  />
                  {/* Problem Title Label */}
                  <text
                    x={slice.tx}
                    y={slice.ty}
                    transform={`rotate(${slice.textAngle}, ${slice.tx}, ${slice.ty})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#E2E8F0"
                    fontSize={eligibleProblems.length > 14 ? '8.5' : '10'}
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none"
                  >
                    {slice.displayTitle}
                  </text>
                </g>
              ))}

              {/* Center Decorative Circle */}
              <circle
                cx="150"
                cy="150"
                r="42"
                fill="#151C30"
                stroke="#29344D"
                strokeWidth="3"
              />
            </svg>

            {/* Interactive Center Hub Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || eligibleProblems.length === 0}
              className={`absolute z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                isSpinning
                  ? 'bg-[#1D2740] text-slate-500 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white hover:scale-105 active:scale-95 shadow-glow-purple cursor-pointer'
              }`}
              aria-label="Spin wheel to select a random DSA problem"
            >
              <RotateCw
                className={`w-5 h-5 mb-0.5 ${
                  isSpinning ? 'animate-spin text-purple-400' : 'text-cyan-300'
                }`}
              />
              <span className="text-[11px] font-extrabold tracking-wider uppercase font-mono">
                {isSpinning ? 'RUSH' : 'SPIN'}
              </span>
            </button>
          </div>

          {/* Quick Spin Action Buttons */}
          <div className="flex items-center gap-2 mt-4 w-full">
            <button
              onClick={handleSpin}
              disabled={isSpinning || eligibleProblems.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md ${
                isSpinning || eligibleProblems.length === 0
                  ? 'bg-[#1D2740] text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isSpinning ? 'Selecting Problem...' : 'Spin Random Problem'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
