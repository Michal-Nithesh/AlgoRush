import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  selectRandomTopic,
  selectRandomProblem,
  calculateTargetWheelRotation,
} from '../../utils/selection';
import { playTickSound, playSuccessChime } from '../../utils/audio';
import {
  RotateCw,
  AlertCircle,
  Compass,
  Layers,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function SpinWheel({
  onProblemSelected,
  isChallengeActive = false,
  onRequestAbandon = () => {},
}) {
  const {
    topics,
    problems,
    selectedTopicIds,
    difficultyFilter,
    setDifficultyFilter,
    sessionSolvedIds,
    settings,
    showToast,
  } = useApp();

  // Strict 2-stage workflow: Must complete 1st spin (topic) before 2nd spin (question) unlocks
  const [stage, setStage] = useState('topic');
  const [hasCompletedTopicSpin, setHasCompletedTopicSpin] = useState(false);
  const [chosenTopic, setChosenTopic] = useState(null);

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);

  const audioIntervalRef = useRef(null);

  // Eligible topics for 1st spin
  const eligibleTopics = useMemo(() => {
    if (selectedTopicIds.length > 0) {
      return topics.filter((t) => selectedTopicIds.includes(t.id));
    }
    return topics;
  }, [topics, selectedTopicIds]);

  // Eligible problems for 2nd spin (from the topic chosen in 1st spin)
  const eligibleProblems = useMemo(() => {
    if (!chosenTopic) return [];
    const topicProblems = problems.filter((p) => p.topicIds?.includes(chosenTopic.id));
    if (difficultyFilter === 'all') {
      return topicProblems;
    }
    const filtered = topicProblems.filter(
      (p) => p.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
    );
    // If difficulty filter leaves 0 questions, return all topic problems so user is never blocked
    return filtered.length > 0 ? filtered : topicProblems;
  }, [problems, chosenTopic, difficultyFilter]);

  // Active items currently placed on the wheel slices
  const currentWheelItems = stage === 'topic' ? eligibleTopics : eligibleProblems;

  // Handle spin button click
  const handleSpinClick = () => {
    if (isSpinning) return;
    if (currentWheelItems.length === 0) return;

    if (isChallengeActive) {
      onRequestAbandon(() => {
        executeSpin();
      });
      return;
    }

    executeSpin();
  };

  const executeSpin = () => {
    setIsSpinning(true);
    setPendingSelection(null);

    let selectedItem = null;
    let selectedIndex = -1;

    if (stage === 'topic') {
      const result = selectRandomTopic(eligibleTopics);
      selectedItem = result.selectedTopic;
      selectedIndex = result.selectedIndex;
    } else {
      const result = selectRandomProblem(eligibleProblems, sessionSolvedIds);
      selectedItem = result.selectedProblem;
      selectedIndex = result.selectedIndex;
    }

    if (!selectedItem || selectedIndex === -1) {
      setIsSpinning(false);
      return;
    }

    setPendingSelection({
      stage,
      item: selectedItem,
    });

    const targetRotation = calculateTargetWheelRotation(
      selectedIndex,
      currentWheelItems.length,
      rotationAngle,
      6
    );

    setRotationAngle(targetRotation);

    // Audio clicks during spin
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

  // Clean up audio interval
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  const handleTransitionEnd = () => {
    if (!isSpinning) return;
    setIsSpinning(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);

    if (pendingSelection) {
      if (pendingSelection.stage === 'topic') {
        const topic = pendingSelection.item;
        setChosenTopic(topic);
        setHasCompletedTopicSpin(true);
        // Reset difficulty to 'all' so no problems in this topic are hidden
        setDifficultyFilter('all');
        playSuccessChime();
        showToast(`1st Spin Complete: Topic is "${topic.name}"! Now spin for your question.`, 'success');

        // Automatically advance to 2nd spin
        setStage('question');
      } else {
        const problem = pendingSelection.item;
        playSuccessChime();
        onProblemSelected(problem);
        showToast(`2nd Spin Complete: "${problem.title}" selected!`, 'success');
      }
    }
  };

  // Reset back to Step 1 (re-lock Step 2 until Step 1 is spun again)
  const handleResetToTopicSpin = () => {
    if (isSpinning) return;
    setStage('topic');
    setHasCompletedTopicSpin(false);
    setChosenTopic(null);
    setDifficultyFilter('all');
  };

  // Wheel slice geometry calculations
  const wheelSlices = useMemo(() => {
    const total = currentWheelItems.length;
    if (total === 0) return [];

    const sliceAngle = 360 / total;

    return currentWheelItems.map((item, index) => {
      const startAngle = index * sliceAngle - 90;
      const endAngle = (index + 1) * sliceAngle - 90;

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

      const midAngle = (index + 0.5) * sliceAngle - 90;
      const midRad = (midAngle * Math.PI) / 180;
      const textRadius = r * 0.65;
      const tx = cx + textRadius * Math.cos(midRad);
      const ty = cy + textRadius * Math.sin(midRad);
      const textAngle = midAngle + 90;

      const isEven = index % 2 === 0;
      const sliceFill = stage === 'topic'
        ? (isEven ? '#1D2740' : '#151C30')
        : (isEven ? '#1F2942' : '#141A2E');

      const rawLabel = item.name || item.title || '';
      const maxLen = total > 14 ? 10 : 13;
      const displayLabel = rawLabel.length > maxLen ? `${rawLabel.substring(0, maxLen)}...` : rawLabel;

      return {
        id: item.id,
        index,
        pathData,
        sliceFill,
        tx,
        ty,
        textAngle,
        displayLabel,
      };
    });
  }, [currentWheelItems, stage]);

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      {/* 2-Step Progress Stepper */}
      <div className="flex items-center justify-between border-b border-[#29344D] pb-3">
        <div className="flex items-center gap-1.5 bg-[#1D2740] p-1 rounded-xl border border-[#29344D] text-xs">
          {/* Step 1 Tab Button */}
          <button
            type="button"
            onClick={() => {
              if (!isSpinning) setStage('topic');
            }}
            disabled={isSpinning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              stage === 'topic'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1st Spin: Topic</span>
            {hasCompletedTopicSpin && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />

          {/* Step 2 Tab Button (Locked until 1st spin completes) */}
          <button
            type="button"
            onClick={() => {
              if (!isSpinning && hasCompletedTopicSpin) setStage('question');
            }}
            disabled={isSpinning || !hasCompletedTopicSpin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              stage === 'question'
                ? 'bg-cyan-600 text-white shadow-sm'
                : hasCompletedTopicSpin
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 cursor-not-allowed opacity-60'
            }`}
            title={
              hasCompletedTopicSpin
                ? 'Spin question from selected topic'
                : 'Complete the 1st spin (Topic) first to unlock question spin'
            }
          >
            {hasCompletedTopicSpin ? (
              <HelpCircle className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>2nd Spin: Question</span>
          </button>
        </div>

        {/* Difficulty Filter Chips */}
        {stage === 'question' && (
          <div className="hidden sm:flex items-center gap-1 bg-[#1D2740] p-0.5 rounded-lg border border-[#29344D]">
            {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all ${
                  difficultyFilter.toLowerCase() === diff.toLowerCase()
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stage Context Banner */}
      <div className="flex items-center justify-between text-xs px-1">
        {stage === 'topic' ? (
          <div className="flex items-center gap-1.5 text-purple-300 font-medium">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>1st Spin: Spin the wheel to pick your random topic</span>
            <span className="text-[11px] font-mono text-slate-400">
              ({eligibleTopics.length} topics)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-cyan-300 font-medium">
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 text-xs font-mono font-bold shadow-sm">
                Topic: {chosenTopic?.name}
              </span>
              <span>&rarr; 2nd Spin: Choose question</span>
              <span className="text-[11px] font-mono text-slate-400">
                ({eligibleProblems.length} available)
              </span>
            </div>

            <button
              onClick={handleResetToTopicSpin}
              disabled={isSpinning}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors p-1 rounded hover:bg-[#1D2740]"
              title="Return to Step 1 and choose a different topic"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Spin New Topic</span>
            </button>
          </div>
        )}
      </div>

      {/* Wheel Container or Empty State */}
      {currentWheelItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-[#0B1020]/50 border border-dashed border-[#29344D] my-2">
          <div className="p-3 bg-[#1D2740] rounded-2xl text-amber-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            {stage === 'topic' ? 'No Topics Selected' : 'No Questions Found'}
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mb-3">
            {stage === 'topic'
              ? 'Please select at least one topic in the topic list above.'
              : `No questions found in "${chosenTopic?.name}".`}
          </p>
          {stage === 'question' && difficultyFilter !== 'all' && (
            <button
              onClick={() => setDifficultyFilter('all')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
            >
              Reset difficulty to &ldquo;All&rdquo;
            </button>
          )}
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center my-2 select-none">
          {/* Top Pointer Indicator */}
          <div className="absolute top-0 z-20 flex flex-col items-center -translate-y-2 pointer-events-none">
            <div
              className={`w-5 h-6 clip-triangle filter ${
                stage === 'topic'
                  ? 'bg-gradient-to-b from-purple-400 to-indigo-600 shadow-glow-purple drop-shadow-[0_2px_6px_rgba(139,92,246,0.8)]'
                  : 'bg-gradient-to-b from-cyan-400 to-blue-600 shadow-glow-cyan drop-shadow-[0_2px_6px_rgba(34,211,238,0.8)]'
              }`}
            />
            <div
              className={`w-1.5 h-1.5 rounded-full -mt-1 ${
                stage === 'topic' ? 'bg-purple-300' : 'bg-cyan-300'
              }`}
            />
          </div>

          {/* Wheel Graphic */}
          <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] flex items-center justify-center">
            {/* Outer Glowing Ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-300 ${
                stage === 'topic'
                  ? 'border-purple-500/30 shadow-[0_0_25px_rgba(139,92,246,0.15)]'
                  : 'border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.15)]'
              }`}
            />

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
                  {/* Label */}
                  <text
                    x={slice.tx}
                    y={slice.ty}
                    transform={`rotate(${slice.textAngle}, ${slice.tx}, ${slice.ty})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#E2E8F0"
                    fontSize={currentWheelItems.length > 14 ? '8.5' : '10'}
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none"
                  >
                    {slice.displayLabel}
                  </text>
                </g>
              ))}

              {/* Center Decorative Ring */}
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
              onClick={handleSpinClick}
              disabled={isSpinning || currentWheelItems.length === 0}
              className={`absolute z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                isSpinning
                  ? 'bg-[#1D2740] text-slate-500 cursor-not-allowed scale-95'
                  : stage === 'topic'
                  ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white hover:scale-105 active:scale-95 shadow-glow-purple cursor-pointer'
                  : 'bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white hover:scale-105 active:scale-95 shadow-glow-cyan cursor-pointer'
              }`}
              aria-label={stage === 'topic' ? '1st Spin: Select a topic' : '2nd Spin: Select a question'}
            >
              <RotateCw
                className={`w-5 h-5 mb-0.5 ${
                  isSpinning
                    ? 'animate-spin text-purple-400'
                    : stage === 'topic'
                    ? 'text-purple-200'
                    : 'text-cyan-200'
                }`}
              />
              <span className="text-[10px] font-extrabold tracking-wider uppercase font-mono text-center leading-tight">
                {isSpinning
                  ? 'SPINNING'
                  : stage === 'topic'
                  ? 'SPIN\nTOPIC'
                  : 'SPIN\nQSTN'}
              </span>
            </button>
          </div>

          {/* Quick Spin Action Buttons */}
          <div className="flex items-center gap-2 mt-4 w-full">
            <button
              onClick={handleSpinClick}
              disabled={isSpinning || currentWheelItems.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md ${
                isSpinning || currentWheelItems.length === 0
                  ? 'bg-[#1D2740] text-slate-500 cursor-not-allowed'
                  : stage === 'topic'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
              }`}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>
                {isSpinning
                  ? stage === 'topic'
                    ? '1st Spin: Selecting Topic...'
                    : '2nd Spin: Selecting Question...'
                  : stage === 'topic'
                  ? '1st Spin: Spin for Random Topic'
                  : `2nd Spin: Pick Random Question from ${chosenTopic?.name || 'Topic'}`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
