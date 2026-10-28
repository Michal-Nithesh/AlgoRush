import initialTopics from '../data/initialTopics.json';
import initialProblems from '../data/initialProblems.json';

export const STORAGE_KEY = 'algorush_state_v2';
export const LEGACY_STORAGE_KEY = 'algorush_state_v1';
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Default empty state structure
 */
export function getDefaultState() {
  return {
    version: CURRENT_SCHEMA_VERSION,
    topics: initialTopics || [],
    problems: initialProblems || [],
    history: [],
    settings: {
      soundEnabled: true,
      defaultTimeMinutes: 30,
      autoOpenProblemUrl: false,
      theme: 'dark',
    },
    activeChallenge: null,
    sessionSolvedProblemIds: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Validate imported data structure
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File content is not a valid JSON object.' };
  }

  if (!Array.isArray(data.topics)) {
    return { valid: false, error: 'Missing or invalid "topics" array.' };
  }

  if (!Array.isArray(data.problems)) {
    return { valid: false, error: 'Missing or invalid "problems" array.' };
  }

  for (const topic of data.topics) {
    if (!topic.id || !topic.name) {
      return { valid: false, error: `Invalid topic: id and name are required (${JSON.stringify(topic)})` };
    }
  }

  for (const prob of data.problems) {
    if (!prob.id || !prob.title || !Array.isArray(prob.topicIds)) {
      return { valid: false, error: `Invalid problem: id, title, and topicIds array are required (${prob.title || prob.id})` };
    }
  }

  return { valid: true };
}

/**
 * Migrate older schemas if necessary
 */
export function migrateState(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return getDefaultState();
  }

  let state = { ...rawState };

  // Ensure mandatory fields exist
  if (!Array.isArray(state.topics)) state.topics = initialTopics;
  if (!Array.isArray(state.problems)) state.problems = initialProblems;
  if (!Array.isArray(state.history)) state.history = [];
  if (!Array.isArray(state.sessionSolvedProblemIds)) state.sessionSolvedProblemIds = [];
  if (!state.settings || typeof state.settings !== 'object') {
    state.settings = {
      soundEnabled: true,
      defaultTimeMinutes: 30,
      autoOpenProblemUrl: false,
      theme: 'dark',
    };
  }

  state.version = CURRENT_SCHEMA_VERSION;
  return state;
}

/**
 * Merge any newly introduced seed topics or problems into state
 */
export function syncSeedData(state) {
  if (!state || typeof state !== 'object') return getDefaultState();

  const existingTopicIds = new Set((state.topics || []).map((t) => t.id));
  const missingTopics = (initialTopics || []).filter((t) => !existingTopicIds.has(t.id));

  const existingProblemIds = new Set((state.problems || []).map((p) => p.id));
  const missingProblems = (initialProblems || []).filter((p) => !existingProblemIds.has(p.id));

  return {
    ...state,
    topics: missingTopics.length > 0 ? [...state.topics, ...missingTopics] : state.topics,
    problems: missingProblems.length > 0 ? [...state.problems, ...missingProblems] : state.problems,
  };
}

/**
 * Load state from localStorage with fallback and migration
 */
export function loadStateFromStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultState();
  }

  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!raw) {
      const defaultState = getDefaultState();
      saveStateToStorage(defaultState);
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    const migrated = syncSeedData(migrateState(parsed));
    saveStateToStorage(migrated);
    return migrated;
  } catch (err) {
    console.error('Failed to parse AlgoRush data from localStorage. Restoring default.', err);
    const defaultState = getDefaultState();
    return defaultState;
  }
}

/**
 * Save state to localStorage safely
 */
export function saveStateToStorage(state) {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const serialized = JSON.stringify({
      ...state,
      updatedAt: new Date().toISOString(),
    });
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save AlgoRush state to localStorage', err);
  }
}

/**
 * Clear and reset all data back to seed state
 */
export function resetStorageToDefaults() {
  const defaultState = getDefaultState();
  saveStateToStorage(defaultState);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
  return defaultState;
}

/**
 * Export state as formatted JSON string
 */
export function exportStateAsJSON(state) {
  const exportPayload = {
    version: state.version || CURRENT_SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    topics: state.topics,
    problems: state.problems,
    history: state.history,
    settings: state.settings,
  };
  return JSON.stringify(exportPayload, null, 2);
}
