import { describe, it, expect } from 'vitest';
import {
  filterProblems,
  selectRandomProblem,
  selectRandomTopic,
  calculateTargetWheelRotation,
  createPracticeQueue,
  formatProblemForClipboard,
} from '../utils/selection';

const mockProblems = [
  {
    id: 'p-1',
    title: 'Two Sum',
    topicIds: ['arrays', 'hashing'],
    difficulty: 'Easy',
    forRevision: false,
    description: 'Find two indices summing to target',
    notes: 'Use HashMap',
  },
  {
    id: 'p-2',
    title: 'Search in Rotated Sorted Array',
    topicIds: ['binary-search'],
    difficulty: 'Medium',
    forRevision: true,
    description: 'Find pivot then binary search',
    notes: 'Check which half is sorted',
  },
  {
    id: 'p-3',
    title: 'Trapping Rain Water',
    topicIds: ['arrays', 'two-pointers'],
    difficulty: 'Hard',
    forRevision: true,
    description: 'Compute trapped rainwater',
    notes: 'Left and right max pointers',
  },
  {
    id: 'p-4',
    title: 'Binary Search',
    topicIds: ['binary-search'],
    difficulty: 'Easy',
    forRevision: false,
    description: 'Standard O(log n) search',
    notes: 'mid = left + (right - left) / 2',
  },
];

describe('Selection & Filtering Logic', () => {
  it('filters by selected topics', () => {
    const result = filterProblems(mockProblems, { selectedTopicIds: ['binary-search'] });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(['p-2', 'p-4']);
  });

  it('filters by multiple topics (disjunctive match)', () => {
    const result = filterProblems(mockProblems, {
      selectedTopicIds: ['two-pointers', 'hashing'],
    });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(['p-1', 'p-3']);
  });

  it('filters by difficulty level', () => {
    const easyProblems = filterProblems(mockProblems, { difficulty: 'Easy' });
    expect(easyProblems).toHaveLength(2);
    expect(easyProblems.map((p) => p.id)).toEqual(['p-1', 'p-4']);

    const hardProblems = filterProblems(mockProblems, { difficulty: 'hard' });
    expect(hardProblems).toHaveLength(1);
    expect(hardProblems[0].id).toBe('p-3');
  });

  it('filters for revision only', () => {
    const revisionProblems = filterProblems(mockProblems, { forRevisionOnly: true });
    expect(revisionProblems).toHaveLength(2);
    expect(revisionProblems.map((p) => p.id)).toEqual(['p-2', 'p-3']);
  });

  it('filters by search query across title, description, and notes', () => {
    const queryResult1 = filterProblems(mockProblems, { searchQuery: 'water' });
    expect(queryResult1).toHaveLength(1);
    expect(queryResult1[0].id).toBe('p-3');

    const queryResult2 = filterProblems(mockProblems, { searchQuery: 'hashmap' });
    expect(queryResult2).toHaveLength(1);
    expect(queryResult2[0].id).toBe('p-1');
  });

  it('handles empty criteria by returning all problems', () => {
    const result = filterProblems(mockProblems);
    expect(result).toHaveLength(4);
  });
});

describe('Random Selection & Session Avoidance', () => {
  it('selects random topic from topics array', () => {
    const mockTopics = [{ id: 't1', name: 'Arrays' }, { id: 't2', name: 'Patterns' }];
    const { selectedTopic, selectedIndex } = selectRandomTopic(mockTopics);
    expect(selectedTopic).toBeDefined();
    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(selectedIndex).toBeLessThan(2);
    expect(selectRandomTopic([]).selectedTopic).toBeNull();
  });

  it('returns null and index -1 for empty pool', () => {
    const { selectedProblem, selectedIndex } = selectRandomProblem([]);
    expect(selectedProblem).toBeNull();
    expect(selectedIndex).toBe(-1);
  });

  it('selects a valid problem from candidate pool', () => {
    const { selectedProblem, selectedIndex } = selectRandomProblem(mockProblems);
    expect(selectedProblem).toBeDefined();
    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(selectedIndex).toBeLessThan(mockProblems.length);
    expect(mockProblems[selectedIndex].id).toBe(selectedProblem.id);
  });

  it('avoids problems solved in the current session when alternatives exist', () => {
    const sessionSolved = ['p-1', 'p-2', 'p-3'];
    // Only p-4 is unsolved
    for (let i = 0; i < 10; i++) {
      const { selectedProblem } = selectRandomProblem(mockProblems, sessionSolved);
      expect(selectedProblem.id).toBe('p-4');
    }
  });

  it('re-allows session-solved problems if all eligible problems were solved', () => {
    const allSolved = ['p-1', 'p-2', 'p-3', 'p-4'];
    const { selectedProblem, isRecycledFromSession } = selectRandomProblem(
      mockProblems,
      allSolved
    );
    expect(selectedProblem).toBeDefined();
    expect(isRecycledFromSession).toBe(true);
  });
});

describe('Wheel Target Rotation Angle Calculation', () => {
  it('calculates rotation so chosen slice stops under top pointer', () => {
    const totalItems = 4; // 90 deg per slice
    const selectedIndex = 0; // slice 0 center is at 45 deg
    const currentRotation = 0;

    const target = calculateTargetWheelRotation(selectedIndex, totalItems, currentRotation, 5);
    // target should do at least 5 full turns (5 * 360 = 1800)
    expect(target).toBeGreaterThanOrEqual(1800);
  });

  it('accumulates rotation angle monotonically on subsequent spins', () => {
    let rotation = 0;
    for (let spin = 0; spin < 5; spin++) {
      const newRotation = calculateTargetWheelRotation(
        spin % 4,
        4,
        rotation,
        5
      );
      expect(newRotation).toBeGreaterThan(rotation);
      rotation = newRotation;
    }
  });
});

describe('Practice Session Queue Generation', () => {
  it('generates a queue of requested length without duplicate problems', () => {
    const { queue, totalEstimatedMinutes } = createPracticeQueue(mockProblems, {
      count: 3,
    });
    expect(queue).toHaveLength(3);
    const uniqueIds = new Set(queue.map((p) => p.id));
    expect(uniqueIds.size).toBe(3);
    expect(totalEstimatedMinutes).toBeGreaterThan(0);
  });

  it('clamps queue length to pool size if count exceeds available problems', () => {
    const { queue } = createPracticeQueue(mockProblems, {
      count: 10,
    });
    expect(queue).toHaveLength(4); // Only 4 total mockProblems exist
  });

  it('respects topic and difficulty filters in queue generation', () => {
    const { queue } = createPracticeQueue(mockProblems, {
      count: 2,
      selectedTopicIds: ['binary-search'],
      difficulty: 'Easy',
    });
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('p-4');
  });

  it('respects revision-only filter in queue generation', () => {
    const { queue } = createPracticeQueue(mockProblems, {
      count: 5,
      forRevisionOnly: true,
    });
    expect(queue).toHaveLength(2); // p-2 and p-3
    expect(queue.every((p) => p.forRevision)).toBe(true);
  });

  it('deprioritizes session-solved problems in practice queue', () => {
    const sessionSolved = ['p-1', 'p-2', 'p-3'];
    const { queue } = createPracticeQueue(mockProblems, {
      count: 1,
      sessionSolvedIds: sessionSolved,
    });
    expect(queue[0].id).toBe('p-4'); // p-4 is the only unsolved one
  });

  it('handles empty candidate pool by returning empty queue', () => {
    const { queue, totalEstimatedMinutes } = createPracticeQueue([], {
      count: 3,
    });
    expect(queue).toEqual([]);
    expect(totalEstimatedMinutes).toBe(0);
  });
});

describe('Clipboard Plain-Text Problem Formatting', () => {
  const mockTopics = [
    { id: 'arrays', name: 'Arrays' },
    { id: 'hashing', name: 'Hashing' },
  ];

  it('formats problem statement, difficulty, time, and ASCII description', () => {
    const formatted = formatProblemForClipboard(mockProblems[0], mockTopics);
    expect(formatted).toContain('# Two Sum');
    expect(formatted).toContain('Difficulty: Easy');
    expect(formatted).toContain('Topics: Arrays, Hashing');
    expect(formatted).toContain('Find two indices summing to target');
  });

  it('strictly omits internal notes and answer spoilers from clipboard text', () => {
    const formatted = formatProblemForClipboard(mockProblems[0], mockTopics);
    expect(formatted).not.toContain('Use HashMap'); // mockProblems[0].notes
    expect(formatted).not.toContain('notes:');
  });

  it('handles empty problem safely', () => {
    expect(formatProblemForClipboard(null)).toBe('');
  });
});

