/**
 * Select a random topic from the available topics pool.
 */
export function selectRandomTopic(topics = []) {
  if (!topics || topics.length === 0) {
    return { selectedTopic: null, selectedIndex: -1 };
  }
  const randomIndex = Math.floor(Math.random() * topics.length);
  return {
    selectedTopic: topics[randomIndex],
    selectedIndex: randomIndex,
  };
}

/**
 * Filter problems based on selected topics, difficulty, and optional revision/search filters.
 */
export function filterProblems(problems = [], {
  selectedTopicIds = [],
  difficulty = 'all',
  searchQuery = '',
  forRevisionOnly = false,
} = {}) {
  return problems.filter((problem) => {
    // Topic filter: If any topics are selected, the problem must have at least one of them
    if (selectedTopicIds.length > 0) {
      const hasTopic = problem.topicIds.some((tId) => selectedTopicIds.includes(tId));
      if (!hasTopic) return false;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      if (problem.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
        return false;
      }
    }

    // Revision filter
    if (forRevisionOnly && !problem.forRevision) {
      return false;
    }

    // Search query filter (title, description, notes)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = problem.title.toLowerCase().includes(q);
      const matchDesc = problem.description?.toLowerCase().includes(q);
      const matchNotes = problem.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNotes) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Select a random problem from the pool, avoiding problems already solved in the current session
 * if there are alternative candidates available.
 */
export function selectRandomProblem(eligibleProblems = [], sessionSolvedIds = []) {
  if (!eligibleProblems || eligibleProblems.length === 0) {
    return { selectedProblem: null, selectedIndex: -1, pool: [] };
  }

  // Filter out session-solved problems if there are others available
  const unsolvedInSession = eligibleProblems.filter(
    (p) => !sessionSolvedIds.includes(p.id)
  );

  const candidatePool = unsolvedInSession.length > 0 ? unsolvedInSession : eligibleProblems;
  const randomIndex = Math.floor(Math.random() * candidatePool.length);
  const selectedProblem = candidatePool[randomIndex];

  // Find index in the original eligibleProblems array for wheel positioning
  const originalIndex = eligibleProblems.findIndex((p) => p.id === selectedProblem.id);

  return {
    selectedProblem,
    selectedIndex: originalIndex,
    pool: eligibleProblems,
    isRecycledFromSession: unsolvedInSession.length === 0 && sessionSolvedIds.includes(selectedProblem.id),
  };
}

/**
 * Calculate the target rotation angle (in degrees) so that the selected slice
 * lands directly beneath the top indicator (12 o'clock).
 *
 * @param {number} selectedIndex - The 0-based index of the chosen problem in the slice list
 * @param {number} totalItems - Total number of slices on the wheel
 * @param {number} currentRotation - The wheel's current cumulative rotation angle in degrees
 * @param {number} minSpins - Minimum number of full 360-degree spins (default 5)
 * @returns {number} The new cumulative rotation angle
 */
export function calculateTargetWheelRotation(
  selectedIndex,
  totalItems,
  currentRotation = 0,
  minSpins = 6
) {
  if (totalItems <= 0 || selectedIndex < 0 || selectedIndex >= totalItems) {
    return currentRotation + 360 * minSpins;
  }

  const sliceAngle = 360 / totalItems;
  // Center angle of the selected slice relative to the 12 o'clock start (0 deg)
  const sliceCenter = (selectedIndex + 0.5) * sliceAngle;

  // Wheel rotates clockwise: to bring angle `sliceCenter` to 0 (top),
  // the wheel must stop at an orientation of (360 - sliceCenter) mod 360.
  const desiredNormalizedAngle = (360 - sliceCenter) % 360;

  // Current normalized angle of the wheel
  const currentNormalizedAngle = ((currentRotation % 360) + 360) % 360;

  // Degrees needed from current normalized position to desired position (spinning clockwise)
  let deltaToTarget = (desiredNormalizedAngle - currentNormalizedAngle + 360) % 360;

  // If delta is 0 or very small, ensure it does at least a full turn
  if (deltaToTarget < 30) {
    deltaToTarget += 360;
  }

  // Add random subtle jitter within the slice bounds (+/- 25% of slice) so it doesn't look robotic
  const jitterRange = sliceAngle * 0.25;
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;

  const totalDelta = (minSpins * 360) + deltaToTarget + jitter;
  return currentRotation + totalDelta;
}
