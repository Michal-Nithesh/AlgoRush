import { describe, it, expect } from 'vitest';

describe('Timer Logic and Precision Calculations', () => {
  it('calculates remaining seconds accurately using timestamp difference', () => {
    const allocatedSeconds = 1800; // 30 mins
    const accumulatedElapsed = 120; // 2 mins used previously
    const sessionStartTime = Date.now() - 30000; // 30 seconds ago

    const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const totalElapsed = accumulatedElapsed + currentElapsed;
    const remaining = Math.max(0, allocatedSeconds - totalElapsed);

    expect(remaining).toBeLessThanOrEqual(1800 - 150);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('prevents remaining timer from ever dropping below zero', () => {
    const allocatedSeconds = 60;
    const accumulatedElapsed = 50;
    // Pretend 100 seconds elapsed in background tab
    const sessionStartTime = Date.now() - 100000;

    const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const totalElapsed = accumulatedElapsed + currentElapsed;
    const remaining = Math.max(0, allocatedSeconds - totalElapsed);

    expect(remaining).toBe(0);
  });

  it('accurately restores paused timer remaining seconds', () => {
    const allocatedSeconds = 1800;
    const accumulatedElapsed = 450; // paused after 450s (7.5 mins)

    const remaining = Math.max(0, allocatedSeconds - accumulatedElapsed);
    expect(remaining).toBe(1350);
  });

  it('triggers times_up status when remaining drops to zero', () => {
    const allocatedSeconds = 300;
    const totalElapsed = 305;
    const remaining = Math.max(0, allocatedSeconds - totalElapsed);
    const status = remaining === 0 ? 'times_up' : 'running';

    expect(remaining).toBe(0);
    expect(status).toBe('times_up');
  });
});
