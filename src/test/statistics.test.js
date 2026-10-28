import { describe, it, expect } from 'vitest';
import {
  calculateStreak,
  calculateWeeklyActivity,
  calculateDashboardStats,
} from '../utils/statistics';

describe('Statistics & Streak Calculation', () => {
  it('returns streak of 0 when history is empty', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns streak of 1 if solved today', () => {
    const today = new Date();
    const history = [
      {
        id: '1',
        problemId: 'p1',
        status: 'solved',
        completedAt: today.toISOString(),
      },
    ];
    expect(calculateStreak(history)).toBe(1);
  });

  it('counts consecutive multi-day streak accurately', () => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() - 1);
    const d2 = new Date(today);
    d2.setDate(today.getDate() - 2);

    const history = [
      { id: '1', problemId: 'p1', status: 'solved', completedAt: today.toISOString() },
      { id: '2', problemId: 'p2', status: 'solved', completedAt: d1.toISOString() },
      { id: '3', problemId: 'p3', status: 'solved', completedAt: d2.toISOString() },
    ];

    expect(calculateStreak(history)).toBe(3);
  });

  it('keeps streak alive from yesterday if user has not yet solved one today', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const history = [
      { id: '1', problemId: 'p1', status: 'solved', completedAt: yesterday.toISOString() },
      { id: '2', problemId: 'p2', status: 'solved', completedAt: twoDaysAgo.toISOString() },
    ];

    expect(calculateStreak(history)).toBe(2);
  });

  it('resets streak to 0 if gap is 2 or more days', () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const history = [
      { id: '1', problemId: 'p1', status: 'solved', completedAt: threeDaysAgo.toISOString() },
    ];

    expect(calculateStreak(history)).toBe(0);
  });

  it('computes 7-day weekly activity array with proper totals', () => {
    const today = new Date();
    const history = [
      { id: '1', problemId: 'p1', status: 'solved', completedAt: today.toISOString() },
      { id: '2', problemId: 'p2', status: 'failed', completedAt: today.toISOString() },
    ];

    const weekly = calculateWeeklyActivity(history);
    expect(weekly).toHaveLength(7);
    const todayActivity = weekly[weekly.length - 1];
    expect(todayActivity.isToday).toBe(true);
    expect(todayActivity.solvedCount).toBe(1);
    expect(todayActivity.failedCount).toBe(1);
    expect(todayActivity.totalCount).toBe(2);
  });

  it('calculates full dashboard stats from stored topics, problems and history', () => {
    const mockTopics = [{ id: 'arrays', name: 'Arrays' }, { id: 'trees', name: 'Trees' }];
    const mockProblems = [
      { id: 'p1', title: 'Two Sum', difficulty: 'Easy', topicIds: ['arrays'] },
      { id: 'p2', title: 'Max Subarray', difficulty: 'Medium', topicIds: ['arrays'] },
      { id: 'p3', title: 'Invert Tree', difficulty: 'Easy', topicIds: ['trees'] },
    ];

    const history = [
      {
        id: 'h1',
        problemId: 'p1',
        status: 'solved',
        completedAt: new Date().toISOString(),
      },
      {
        id: 'h2',
        problemId: 'p2',
        status: 'failed',
        completedAt: new Date().toISOString(),
      },
    ];

    const stats = calculateDashboardStats(mockTopics, mockProblems, history);
    expect(stats.totalTopics).toBe(2);
    expect(stats.totalProblems).toBe(3);
    expect(stats.totalSolvedProblems).toBe(1);
    expect(stats.challengesToday).toBe(2);
    expect(stats.solvedToday).toBe(1);
    expect(stats.successRate).toBe(50); // 1 solved out of 2 completed
    expect(stats.streak).toBe(1);
    expect(stats.difficultyStats.Easy.solved).toBe(1);
    expect(stats.difficultyStats.Medium.solved).toBe(0);
  });
});
