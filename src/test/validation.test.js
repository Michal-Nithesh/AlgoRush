import { describe, it, expect } from 'vitest';
import {
  validateImportData,
  exportStateAsJSON,
  loadStateFromStorage,
  STORAGE_KEY,
  BACKUP_STORAGE_KEY,
  getDefaultState,
} from '../utils/storage';

describe('Deep Schema Validation & Import/Export Resilience', () => {
  it('rejects import data containing duplicate topic IDs', () => {
    const data = {
      topics: [
        { id: 'arrays', name: 'Arrays' },
        { id: 'arrays', name: 'Duplicate Arrays' },
      ],
      problems: [
        { id: 'p1', title: 'Two Sum', topicIds: ['arrays'], difficulty: 'Easy' },
      ],
    };
    const result = validateImportData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Duplicate topic ID');
  });

  it('rejects import data containing duplicate problem IDs', () => {
    const data = {
      topics: [{ id: 'arrays', name: 'Arrays' }],
      problems: [
        { id: 'dup-id', title: 'Problem 1', topicIds: ['arrays'], difficulty: 'Easy' },
        { id: 'dup-id', title: 'Problem 2', topicIds: ['arrays'], difficulty: 'Medium' },
      ],
    };
    const result = validateImportData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Duplicate problem ID');
  });

  it('rejects import data with invalid difficulty strings', () => {
    const data = {
      topics: [{ id: 'arrays', name: 'Arrays' }],
      problems: [
        { id: 'p1', title: 'Problem 1', topicIds: ['arrays'], difficulty: 'Extreme' },
      ],
    };
    const result = validateImportData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid difficulty');
  });

  it('rejects problems referencing non-existent topic IDs (referential integrity)', () => {
    const data = {
      topics: [{ id: 'arrays', name: 'Arrays' }],
      problems: [
        { id: 'p1', title: 'Problem 1', topicIds: ['ghost-topic'], difficulty: 'Easy' },
      ],
    };
    const result = validateImportData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('references non-existent topic ID');
  });

  it('rejects malformed history entries in import payload', () => {
    const data = {
      topics: [{ id: 'arrays', name: 'Arrays' }],
      problems: [
        { id: 'p1', title: 'Problem 1', topicIds: ['arrays'], difficulty: 'Easy' },
      ],
      history: [
        { id: 'h1' }, // Missing problemId and status
      ],
    };
    const result = validateImportData(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid history entry');
  });

  it('performs clean export and import round-trip', () => {
    const state = getDefaultState();
    const exportedJSON = exportStateAsJSON(state);
    const parsed = JSON.parse(exportedJSON);
    const validation = validateImportData(parsed);

    expect(validation.valid).toBe(true);
    expect(parsed.topics.length).toBe(state.topics.length);
    expect(parsed.problems.length).toBe(state.problems.length);
  });

  it('recovers from backup storage key if primary storage is corrupted', () => {
    const mockState = {
      version: 2,
      topics: [{ id: 'arrays', name: 'Arrays' }],
      problems: [{ id: 'p1', title: 'P1', topicIds: ['arrays'], difficulty: 'Easy' }],
      history: [],
      settings: { soundEnabled: true },
    };

    localStorage.setItem(STORAGE_KEY, 'INVALID_CORRUPT_JSON{{{');
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(mockState));

    const loaded = loadStateFromStorage();
    expect(loaded.topics.some((t) => t.id === 'arrays')).toBe(true);
    expect(loaded.problems.some((p) => p.id === 'p1')).toBe(true);
  });
});
