/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate current consecutive-day streak of solved challenges
 */
export function calculateStreak(history = []) {
  const solvedDatesSet = new Set();

  history.forEach((entry) => {
    if (entry.status === 'solved' && (entry.completedAt || entry.timestamp)) {
      const dateStr = getLocalDateString(new Date(entry.completedAt || entry.timestamp));
      solvedDatesSet.add(dateStr);
    }
  });

  if (solvedDatesSet.size === 0) return 0;

  const today = new Date();
  const todayStr = getLocalDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If user hasn't solved any today, but did yesterday, the streak is ongoing from yesterday.
  // If neither today nor yesterday has a solve, current streak is 0.
  let checkDate = new Date();
  if (!solvedDatesSet.has(todayStr)) {
    if (!solvedDatesSet.has(yesterdayStr)) {
      return 0;
    }
    // Streak continues from yesterday
    checkDate = yesterday;
  }

  let streak = 0;
  while (true) {
    const dateStr = getLocalDateString(checkDate);
    if (solvedDatesSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Compute 7-day weekly activity overview
 */
export function calculateWeeklyActivity(history = []) {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

    const dayEntries = history.filter((entry) => {
      const entryDate = getLocalDateString(new Date(entry.completedAt || entry.timestamp));
      return entryDate === dateStr;
    });

    const solvedCount = dayEntries.filter((e) => e.status === 'solved').length;
    const failedCount = dayEntries.filter((e) => e.status === 'failed').length;
    const totalCount = dayEntries.length;

    days.push({
      dateStr,
      dayLabel,
      solvedCount,
      failedCount,
      totalCount,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Comprehensive dashboard stats derived from topics, problems, and history
 */
export function calculateDashboardStats(topics = [], problems = [], history = []) {
  const totalTopics = topics.length;
  const totalProblems = problems.length;

  // Set of distinct problems ever marked as solved
  const solvedProblemIds = new Set(
    history
      .filter((entry) => entry.status === 'solved')
      .map((entry) => entry.problemId)
  );
  const totalSolvedProblems = solvedProblemIds.size;

  // Challenges completed today
  const todayStr = getLocalDateString(new Date());
  const todayEntries = history.filter((entry) => {
    const entryDate = getLocalDateString(new Date(entry.completedAt || entry.timestamp));
    return entryDate === todayStr;
  });
  const challengesToday = todayEntries.length;
  const solvedToday = todayEntries.filter((e) => e.status === 'solved').length;

  // Success rate: solved / (solved + failed)
  const completedAttempts = history.filter((e) => e.status === 'solved' || e.status === 'failed');
  const solvedCount = history.filter((e) => e.status === 'solved').length;
  const successRate = completedAttempts.length > 0
    ? Math.round((solvedCount / completedAttempts.length) * 100)
    : 0;

  // Unique problem library completion percentage
  const uniqueSolveRate = totalProblems > 0
    ? Math.round((totalSolvedProblems / totalProblems) * 100)
    : 0;

  // Current streak
  const streak = calculateStreak(history);

  // Weekly activity
  const weeklyActivity = calculateWeeklyActivity(history);

  // Per-difficulty stats
  const difficultyStats = {
    Easy: { total: 0, solved: 0 },
    Medium: { total: 0, solved: 0 },
    Hard: { total: 0, solved: 0 },
  };

  problems.forEach((p) => {
    const diff = p.difficulty || 'Medium';
    if (difficultyStats[diff]) {
      difficultyStats[diff].total += 1;
      if (solvedProblemIds.has(p.id)) {
        difficultyStats[diff].solved += 1;
      }
    }
  });

  return {
    totalTopics,
    totalProblems,
    totalSolvedProblems,
    challengesToday,
    solvedToday,
    successRate,
    uniqueSolveRate,
    streak,
    weeklyActivity,
    difficultyStats,
    totalChallenges: history.length,
  };
}
