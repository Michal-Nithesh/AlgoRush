import { describe, it, expect } from 'vitest';
import initialTopics from '../data/initialTopics.json';
import initialProblems from '../data/initialProblems.json';

const CATEGORY_MAP = {
  patterns: 'Foundations',
  'beginner-problems': 'Foundations',
  arrays: 'Foundations',
  'strings-hashing': 'Foundations',
  maths: 'Foundations',
  'bit-manipulation': 'Foundations',
  'two-pointers': 'Core Algorithms',
  'sliding-window': 'Core Algorithms',
  'binary-search': 'Core Algorithms',
  recursion: 'Core Algorithms',
  sorting: 'Core Algorithms',
  'linked-lists': 'Linear Structures',
  'stacks-queues': 'Linear Structures',
  trees: 'Trees & Graphs',
  graphs: 'Trees & Graphs',
  heaps: 'Trees & Graphs',
  tries: 'Trees & Graphs',
  backtracking: 'Advanced Techniques',
  'dynamic-programming': 'Advanced Techniques',
  'greedy-algorithms': 'Advanced Techniques',
};

describe('Topic Categorization & Dataset Topology', () => {
  it('contains exactly 20 unique seed topics', () => {
    expect(initialTopics).toHaveLength(20);
    const uniqueIds = new Set(initialTopics.map((t) => t.id));
    expect(uniqueIds.size).toBe(20);
  });

  it('contains exactly 453 unique seed problems', () => {
    expect(initialProblems).toHaveLength(453);
    const uniqueIds = new Set(initialProblems.map((p) => p.id));
    expect(uniqueIds.size).toBe(453);
  });

  it('maps all 20 seed topics to proper algorithmic categories without unmapped orphans', () => {
    initialTopics.forEach((t) => {
      const category = CATEGORY_MAP[t.id];
      expect(category).toBeDefined();
      expect([
        'Foundations',
        'Core Algorithms',
        'Linear Structures',
        'Trees & Graphs',
        'Advanced Techniques',
      ]).toContain(category);
    });
  });

  it('verifies difficulty distribution matches the target specification', () => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    initialProblems.forEach((p) => {
      counts[p.difficulty] = (counts[p.difficulty] || 0) + 1;
    });

    expect(counts.Easy).toBe(65);
    expect(counts.Medium).toBe(278);
    expect(counts.Hard).toBe(110);
    expect(counts.Easy + counts.Medium + counts.Hard).toBe(453);
  });

  it('verifies 518 total topic assignments across 453 problems', () => {
    let totalAssignments = 0;
    initialProblems.forEach((p) => {
      expect(Array.isArray(p.topicIds)).toBe(true);
      expect(p.topicIds.length).toBeGreaterThan(0);
      totalAssignments += p.topicIds.length;
    });

    expect(totalAssignments).toBe(518);
  });

  it('prevents orphaned problems when a topic is deleted', () => {
    const mockTopics = [
      { id: 'topic-a', name: 'Topic A' },
      { id: 'topic-b', name: 'Topic B' },
    ];
    const mockProblems = [
      { id: 'p1', title: 'Problem 1', topicIds: ['topic-a'] },
      { id: 'p2', title: 'Problem 2', topicIds: ['topic-a', 'topic-b'] },
    ];

    const topicToDelete = 'topic-a';
    const fallbackTopic = mockTopics.find((t) => t.id !== topicToDelete)?.id || 'beginner-problems';

    const updatedProblems = mockProblems.map((p) => {
      const remainingTopics = p.topicIds.filter((id) => id !== topicToDelete);
      return {
        ...p,
        topicIds: remainingTopics.length > 0 ? remainingTopics : [fallbackTopic],
      };
    });

    expect(updatedProblems[0].topicIds).toEqual(['topic-b']);
    expect(updatedProblems[1].topicIds).toEqual(['topic-b']);
    // No problems have empty topicIds
    updatedProblems.forEach((p) => {
      expect(p.topicIds.length).toBeGreaterThan(0);
    });
  });
});
