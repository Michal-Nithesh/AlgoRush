import { describe, it, expect } from 'vitest';
import {
  validateImportData,
  migrateState,
  getDefaultState,
  CURRENT_SCHEMA_VERSION,
} from '../utils/storage';

describe('Storage & Data Integrity', () => {
  it('returns valid default state matching schema', () => {
    const defaultState = getDefaultState();
    expect(defaultState.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(Array.isArray(defaultState.topics)).toBe(true);
    expect(defaultState.topics.length).toBeGreaterThan(0);
    expect(Array.isArray(defaultState.problems)).toBe(true);
    expect(defaultState.problems.length).toBeGreaterThan(0);
    expect(Array.isArray(defaultState.history)).toBe(true);
    expect(defaultState.settings.soundEnabled).toBe(true);
  });

  it('validates correct import payload', () => {
    const validData = {
      version: 1,
      topics: [{ id: 'arrays', name: 'Arrays' }],
      problems: [
        {
          id: 'two-sum',
          title: 'Two Sum',
          topicIds: ['arrays'],
          difficulty: 'Easy',
        },
      ],
      history: [],
      settings: { soundEnabled: true },
    };

    const res = validateImportData(validData);
    expect(res.valid).toBe(true);
  });

  it('rejects invalid import payload without topics or problems', () => {
    expect(validateImportData(null).valid).toBe(false);
    expect(validateImportData({ topics: [] }).valid).toBe(false);
    expect(validateImportData({ problems: [] }).valid).toBe(false);
  });

  it('rejects import with malformed problem entries', () => {
    const badProblemData = {
      topics: [{ id: 't1', name: 'Topic 1' }],
      problems: [
        {
          id: 'p1',
          // missing title
          topicIds: ['t1'],
        },
      ],
    };
    const res = validateImportData(badProblemData);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid problem');
  });

  it('migrates raw state and preserves user data safely', () => {
    const legacyRaw = {
      topics: [{ id: 'custom-topic', name: 'Custom Topic' }],
      problems: [
        {
          id: 'custom-p',
          title: 'Custom Problem',
          topicIds: ['custom-topic'],
        },
      ],
      history: [{ id: 'h1', problemId: 'custom-p', status: 'solved' }],
    };

    const migrated = migrateState(legacyRaw);
    expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.topics).toHaveLength(1);
    expect(migrated.topics[0].id).toBe('custom-topic');
    expect(migrated.problems).toHaveLength(1);
    expect(migrated.history).toHaveLength(1);
    expect(migrated.settings).toBeDefined();
    expect(migrated.sessionSolvedProblemIds).toEqual([]);
  });
});
