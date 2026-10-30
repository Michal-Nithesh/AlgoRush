import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  filterProblems,
  selectRandomProblem,
  createPracticeQueue,
} from '../../utils/selection';
import { playTickSound, playSuccessChime } from '../../utils/audio';
import DifficultyBadge from '../common/DifficultyBadge';
import {
  Shuffle,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  Tag,
  ExternalLink,
  Layers,
  CheckCircle2,
  ListOrdered,
  ArrowRight,
  BookmarkCheck,
  AlertCircle,
} from 'lucide-react';

export default function RandomChallengeReveal({
  onProblemSelected,
  onStartChallenge,
  isChallengeActive = false,
  onRequestAbandon = () => {},
}) {
  const {
    topics,
    problems,
    selectedTopicIds,
    difficultyFilter,
    setDifficultyFilter,
    forRevisionOnly,
    setForRevisionOnly,
    sessionSolvedIds,
    settings,
    selectAllTopics,
  } = useApp();

  // Mode: 'single' | 'queue'
  const [activeMode, setActiveMode] = useState('single');

  // Single challenge reveal state: 'idle' | 'shuffling' | 'revealed'
  const [revealState, setRevealState] = useState('idle');
  const [revealedProblem, setRevealedProblem] = useState(null);
  const [isRecycled, setIsRecycled] = useState(false);
  const [shuffleDisplayTitle, setShuffleDisplayTitle] = useState('');

  // Queue state for Practice Session
  const [queueCount, setQueueCount] = useState(3);
  const [queueDifficulty, setQueueDifficulty] = useState('all');
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [queueTotalMinutes, setQueueTotalMinutes] = useState(0);

  const shuffleTimerRef = useRef(null);

  // Eligible problems matching currently selected topics and filters
  const eligibleProblems = useMemo(() => {
    return filterProblems(problems, {
      selectedTopicIds,
      difficulty: difficultyFilter,
      forRevisionOnly,
    });
  }, [problems, selectedTopicIds, difficultyFilter, forRevisionOnly]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) {
        clearInterval(shuffleTimerRef.current);
      }
    };
  }, []);

  // Execute random pick
  const executePick = () => {
    if (eligibleProblems.length === 0) return;

    const { selectedProblem, isRecycledFromSession } = selectRandomProblem(
      eligibleProblems,
      sessionSolvedIds
    );

    if (!selectedProblem) return;

    setRevealState('shuffling');
    setIsRecycled(isRecycledFromSession);

    if (settings?.soundEnabled) {
      playTickSound();
    }

    let ticks = 0;
    const maxTicks = 4;
    const candidateTitles = eligibleProblems.map((p) => p.title);

    shuffleTimerRef.current = setInterval(() => {
      ticks++;
      const randomTitle = candidateTitles[Math.floor(Math.random() * candidateTitles.length)];
      setShuffleDisplayTitle(randomTitle);

      if (settings?.soundEnabled) {
        playTickSound();
      }

      if (ticks >= maxTicks) {
        clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
        setRevealedProblem(selectedProblem);
        setRevealState('revealed');
        onProblemSelected(selectedProblem);

        if (settings?.soundEnabled) {
          playSuccessChime();
        }
      }
    }, 110);
  };

  const handlePickClick = () => {
    if (revealState === 'shuffling') return;
    if (eligibleProblems.length === 0) return;

    if (isChallengeActive) {
      onRequestAbandon(() => {
        executePick();
      });
      return;
    }

    executePick();
  };

  // Generate a practice session queue
  const handleGenerateQueue = () => {
    if (eligibleProblems.length === 0) return;

    const { queue, totalEstimatedMinutes } = createPracticeQueue(problems, {
      count: queueCount,
      difficulty: queueDifficulty === 'all' ? difficultyFilter : queueDifficulty,
      selectedTopicIds,
      forRevisionOnly,
      sessionSolvedIds,
    });

    setPracticeQueue(queue);
    setCurrentQueueIndex(0);
    setQueueTotalMinutes(totalEstimatedMinutes);

    if (queue.length > 0) {
      onProblemSelected(queue[0]);
    }
  };

  const handleQueueNext = () => {
    if (currentQueueIndex + 1 < practiceQueue.length) {
      const nextIdx = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIdx);
      onProblemSelected(practiceQueue[nextIdx]);
    }
  };

  const getTopicNames = (topicIds = []) => {
    return topicIds.map((id) => {
      const found = topics.find((t) => t.id === id);
      return found ? found.name : id;
    });
  };

  return (
    <div className="bg-[#14161F] border border-[#2C3142] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      {/* Top Bar: Mode Switcher */}
      <div className="flex items-center justify-between border-b border-[#2C3142] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            Challenge Picker
          </h2>
        </div>

        {/* Tab Switcher: Single vs Queue */}
        <div className="flex items-center gap-1 bg-[#0C0D12] p-1 rounded-xl border border-[#2C3142]">
          <button
            onClick={() => setActiveMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'single'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Problem</span>
          </button>

          <button
            onClick={() => setActiveMode('queue')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'queue'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Practice Session</span>
          </button>
        </div>
      </div>

      {/* SINGLE CHALLENGE MODE */}
      {activeMode === 'single' && (
        <div className="space-y-4">
          {/* Empty State: No Topics Selected */}
          {selectedTopicIds.length === 0 ? (
            <div className="py-8 px-4 text-center border border-dashed border-[#2C3142] rounded-xl bg-[#0C0D12]/40 flex flex-col items-center gap-2.5">
              <Layers className="w-8 h-8 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-200">No Topics Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Select one or more topics from the Topic Explorer to activate the random challenge pool.
              </p>
              <button
                onClick={selectAllTopics}
                className="mt-1 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                Select All Topics
              </button>
            </div>
          ) : eligibleProblems.length === 0 ? (
            /* Empty State: No Problems Match Current Filters */
            <div className="py-8 px-4 text-center border border-dashed border-[#2C3142] rounded-xl bg-[#0C0D12]/40 flex flex-col items-center gap-2.5">
              <AlertCircle className="w-8 h-8 text-amber-500/80" />
              <h3 className="text-sm font-semibold text-slate-200">No Matching Problems Found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No problems match your current criteria (Difficulty: {difficultyFilter}
                {forRevisionOnly ? ', Revision Only' : ''}).
              </p>
              <div className="flex items-center gap-2 mt-1">
                {difficultyFilter !== 'all' && (
                  <button
                    onClick={() => setDifficultyFilter('all')}
                    className="px-3 py-1.5 bg-[#1D202D] hover:bg-[#25293A] text-slate-300 border border-[#2C3142] rounded-lg text-xs font-medium transition-colors"
                  >
                    Reset Difficulty to All
                  </button>
                )}
                {forRevisionOnly && (
                  <button
                    onClick={() => setForRevisionOnly(false)}
                    className="px-3 py-1.5 bg-[#1D202D] hover:bg-[#25293A] text-slate-300 border border-[#2C3142] rounded-lg text-xs font-medium transition-colors"
                  >
                    Disable Revision Filter
                  </button>
                )}
              </div>
            </div>
          ) : revealState === 'idle' ? (
            /* IDLE STATE: Ready to Pick */
            <div className="flex flex-col items-center text-center py-6 px-4 bg-[#0C0D12]/70 border border-[#2C3142] rounded-xl gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1D202D] border border-[#2C3142] flex items-center justify-center text-amber-400 shadow-sm relative">
                <Shuffle className="w-6 h-6 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  Ready for a challenge?
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Draw a genuinely random problem from your active topics. Solve it in your Java IDE before the clock reaches zero.
                </p>
              </div>

              {/* Selection Summary Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-[#14161F] border border-[#2C3142]">
                  <strong className="text-slate-200">{selectedTopicIds.length}</strong> Topics Active
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#14161F] border border-[#2C3142]">
                  Diff: <strong className="text-slate-200 uppercase">{difficultyFilter}</strong>
                </span>
                {forRevisionOnly && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-1">
                    <BookmarkCheck className="w-3 h-3" />
                    Revision Only
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300">
                  <strong className="text-amber-400 font-bold">{eligibleProblems.length}</strong> Available
                </span>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handlePickClick}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98] mt-1"
              >
                <Shuffle className="w-4 h-4" />
                <span>Pick Random Problem</span>
              </button>
            </div>
          ) : revealState === 'shuffling' ? (
            /* SHUFFLING STATE */
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-[#0C0D12]/70 border border-amber-500/30 rounded-xl gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-spin">
                <Shuffle className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest animate-pulse">
                Selecting Challenge...
              </div>
              <div className="text-sm font-semibold text-slate-100 max-w-sm truncate h-6 font-mono px-4 py-0.5 rounded bg-[#1D202D] border border-[#2C3142]">
                {shuffleDisplayTitle || 'Evaluating candidate problems...'}
              </div>
            </div>
          ) : (
            /* REVEALED STATE */
            revealedProblem && (
              <div className="bg-[#0C0D12]/80 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Challenge Revealed
                    </span>
                    <DifficultyBadge difficulty={revealedProblem.difficulty} size="sm" />
                    {revealedProblem.forRevision && (
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        Revision
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Est. {revealedProblem.estimatedTime || 20}m</span>
                  </div>
                </div>

                {/* Title & Topic tags */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                    {revealedProblem.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {getTopicNames(revealedProblem.topicIds).map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md"
                      >
                        <Tag className="w-2.5 h-2.5 text-amber-400" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Solved In Session Recycled Warning */}
                {isRecycled && (
                  <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg font-mono">
                    Revisiting problem already solved in this session.
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2C3142]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartChallenge(revealedProblem)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                      title="Set timer and start countdown"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Challenge</span>
                    </button>

                    <button
                      onClick={handlePickClick}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#1D202D] hover:bg-[#25293A] text-slate-200 border border-[#2C3142] rounded-xl text-xs font-medium transition-colors"
                      title="Pick another random challenge"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pick Another</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {revealedProblem.url && (
                      <a
                        href={revealedProblem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 px-2.5 py-1.5 rounded-lg hover:bg-sky-950/30 transition-colors font-mono"
                      >
                        <span>External Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => setRevealState('idle')}
                      className="text-xs text-slate-500 hover:text-slate-300 p-1.5"
                      title="Return to challenge overview"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* PRACTICE SESSION (QUEUE) MODE */}
      {activeMode === 'queue' && (
        <div className="space-y-4">
          {/* Controls: Count and Generate */}
          <div className="p-3.5 bg-[#0C0D12]/70 border border-[#2C3142] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono">Count:</span>
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQueueCount(num)}
                    className={`px-2 py-0.5 rounded font-mono border transition-colors ${
                      queueCount === num
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                        : 'bg-[#1D202D] text-slate-400 border-[#2C3142] hover:text-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono">Difficulty:</span>
                <select
                  value={queueDifficulty}
                  onChange={(e) => setQueueDifficulty(e.target.value)}
                  className="bg-[#1D202D] border border-[#2C3142] text-slate-200 rounded px-2 py-0.5 text-xs outline-none font-mono"
                >
                  <option value="all">Any / Filtered</option>
                  <option value="easy">Easy Only</option>
                  <option value="medium">Medium Only</option>
                  <option value="hard">Hard Only</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Generate Session</span>
            </button>
          </div>

          {/* Queue List Preview */}
          {practiceQueue.length === 0 ? (
            <div className="py-8 px-4 text-center border border-dashed border-[#2C3142] rounded-xl bg-[#0C0D12]/40 flex flex-col items-center gap-2">
              <ListOrdered className="w-8 h-8 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-200">No Session Generated</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Generate a randomized queue of problems from your active topics for a focused multi-problem practice session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Queue Summary Header */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>
                  Problem {currentQueueIndex + 1} of {practiceQueue.length}
                </span>
                <span className="text-amber-400">
                  Est. Total: ~{queueTotalMinutes} min
                </span>
              </div>

              {/* Current Active Problem in Queue */}
              {practiceQueue[currentQueueIndex] && (
                <div className="p-4 bg-[#0C0D12]/80 border border-amber-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge
                        difficulty={practiceQueue[currentQueueIndex].difficulty}
                        size="sm"
                      />
                      <span className="text-[11px] font-mono text-slate-400">
                        {practiceQueue[currentQueueIndex].estimatedTime || 20}m
                      </span>
                    </div>

                    <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                      Step {currentQueueIndex + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">
                    {practiceQueue[currentQueueIndex].title}
                  </h3>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2C3142]">
                    <button
                      onClick={() => onStartChallenge(practiceQueue[currentQueueIndex])}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Problem</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {currentQueueIndex + 1 < practiceQueue.length && (
                        <button
                          onClick={handleQueueNext}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#1D202D] hover:bg-[#25293A] text-slate-200 border border-[#2C3142] rounded-lg text-xs font-medium transition-colors"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={handleGenerateQueue}
                        className="text-xs text-slate-400 hover:text-slate-200 p-1"
                        title="Reshuffle Queue"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming problems preview list */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-slate-500 px-1">
                  Queue Roadmap
                </div>
                {practiceQueue.map((prob, idx) => (
                  <div
                    key={prob.id}
                    onClick={() => {
                      setCurrentQueueIndex(idx);
                      onProblemSelected(prob);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                      idx === currentQueueIndex
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                        : idx < currentQueueIndex
                        ? 'bg-[#1D202D]/20 border-[#2C3142]/40 text-slate-500 line-through'
                        : 'bg-[#1D202D]/40 border-[#2C3142] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] w-4 text-slate-500">{idx + 1}.</span>
                      <span className="truncate">{prob.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
