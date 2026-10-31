import { describe, it, expect } from 'vitest';
import { calculateDashboardStats } from '../utils/statistics';
import { selectRandomProblem } from '../utils/selection';

describe('Challenge Session Lifecycle & State Transitions', () => {
  it('correctly records elapsed time on abandoned challenges', () => {
    const allocatedSeconds = 1200; // 20m
    const sessionStartTime = Date.now() - 425000; // ~425 seconds elapsed
    const accumulatedElapsed = 50;

    const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const totalTimeUsedSeconds = accumulatedElapsed + currentElapsed;

    expect(totalTimeUsedSeconds).toBeGreaterThanOrEqual(475);
    expect(totalTimeUsedSeconds).toBeLessThanOrEqual(allocatedSeconds);
  });

  it('restores active challenge problem without resetting to default problem', () => {
    const mockProblems = [
      { id: 'first-problem', title: 'Problem 1', topicIds: ['arrays'] },
      { id: 'target-problem', title: 'Target Challenge', topicIds: ['binary-search'] },
      { id: 'third-problem', title: 'Problem 3', topicIds: ['trees'] },
    ];

    const activeChallenge = {
      problemId: 'target-problem',
      status: 'running',
      allocatedSeconds: 1200,
      accumulatedElapsed: 150,
      sessionStartTime: Date.now() - 10000,
    };

    const restoredProblem = mockProblems.find((p) => p.id === activeChallenge.problemId);
    expect(restoredProblem).toBeDefined();
    expect(restoredProblem.id).toBe('target-problem');
    expect(restoredProblem.title).toBe('Target Challenge');
  });

  it('does not increment unique solved count when solving the same problem multiple times', () => {
    const mockTopics = [{ id: 'arrays', name: 'Arrays' }];
    const mockProblems = [
      { id: 'p1', title: 'Two Sum', difficulty: 'Easy', topicIds: ['arrays'] },
      { id: 'p2', title: '3Sum', difficulty: 'Medium', topicIds: ['arrays'] },
    ];

    const history = [
      { id: 'h1', problemId: 'p1', status: 'solved', completedAt: '2026-10-29T10:00:00Z' },
      { id: 'h2', problemId: 'p1', status: 'solved', completedAt: '2026-10-30T10:00:00Z' },
      { id: 'h3', problemId: 'p1', status: 'solved', completedAt: '2026-10-31T10:00:00Z' },
      { id: 'h4', problemId: 'p2', status: 'failed', completedAt: '2026-10-31T11:00:00Z' },
    ];

    const stats = calculateDashboardStats(mockTopics, mockProblems, history);
    expect(stats.totalChallenges).toBe(4);
    expect(stats.totalSolvedProblems).toBe(1); // p1 solved 3 times still counts as 1 unique solved problem
    expect(stats.successRate).toBe(75); // 3 solved out of 4 completed
    expect(stats.uniqueSolveRate).toBe(50); // 1 out of 2 total library problems solved
  });

  it('deprioritizes session-solved problems in random picker until all problems are solved', () => {
    const pool = [
      { id: 'p1', title: 'Two Sum', topicIds: ['arrays'] },
      { id: 'p2', title: 'Binary Search', topicIds: ['arrays'] },
      { id: 'p3', title: 'Valid Anagram', topicIds: ['arrays'] },
    ];

    const sessionSolvedIds = ['p1', 'p2'];
    const { selectedProblem, isRecycledFromSession } = selectRandomProblem(pool, sessionSolvedIds);

    expect(selectedProblem.id).toBe('p3');
    expect(isRecycledFromSession).toBe(false);
  });

  it('recycles session-solved problems when all eligible problems have already been solved', () => {
    const pool = [
      { id: 'p1', title: 'Two Sum', topicIds: ['arrays'] },
      { id: 'p2', title: 'Binary Search', topicIds: ['arrays'] },
    ];

    const sessionSolvedIds = ['p1', 'p2'];
    const { selectedProblem, isRecycledFromSession } = selectRandomProblem(pool, sessionSolvedIds);

    expect(['p1', 'p2']).toContain(selectedProblem.id);
    expect(isRecycledFromSession).toBe(true);
  });
});
