import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppContext } from './AppContext';
import {
  loadStateFromStorage,
  saveStateToStorage,
  resetStorageToDefaults,
  validateImportData,
  exportStateAsJSON,
} from '../utils/storage';

export function AppProvider({ children }) {
  // Initialize full app state from localStorage
  const [appState, setAppState] = useState(() => loadStateFromStorage());

  // Navigation tab: 'dashboard' | 'problems' | 'history' | 'stats'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filters for wheel and dashboard
  const [selectedTopicIds, setSelectedTopicIds] = useState(() => {
    // Default to all topic IDs so wheel is ready to spin right away
    return (appState.topics || []).map((t) => t.id);
  });
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicStatusFilter, setTopicStatusFilter] = useState('All');
  const [forRevisionOnly, setForRevisionOnly] = useState(false);

  // Active chosen problem for the challenge card / timer
  const [selectedProblem, setSelectedProblem] = useState(() => {
    // Pick the first problem if available
    return appState.problems?.[0] || null;
  });

  // Session-level solved problems (avoid re-picking during same session)
  const [sessionSolvedIds, setSessionSolvedIds] = useState(() => {
    return appState.sessionSolvedProblemIds || [];
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Save changes to localStorage whenever core data changes
  useEffect(() => {
    saveStateToStorage({
      ...appState,
      sessionSolvedProblemIds: sessionSolvedIds,
    });
  }, [appState, sessionSolvedIds]);

  // Topic management
  const addTopic = useCallback((topicData) => {
    const id = topicData.id || topicData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTopic = {
      id,
      name: topicData.name.trim(),
      description: topicData.description?.trim() || '',
      status: topicData.status || 'Learning',
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => {
      // Prevent duplicates
      if (prev.topics.some((t) => t.id === newTopic.id)) {
        showToast(`Topic with ID "${newTopic.id}" already exists.`, 'error');
        return prev;
      }
      return {
        ...prev,
        topics: [...prev.topics, newTopic],
      };
    });

    // Auto-select newly created topic
    setSelectedTopicIds((prev) => [...prev, id]);
    showToast(`Topic "${newTopic.name}" created successfully!`, 'success');
    return newTopic;
  }, [showToast]);

  const updateTopic = useCallback((topicId, updates) => {
    setAppState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
    }));
    showToast('Topic updated successfully.', 'success');
  }, [showToast]);

  const deleteTopic = useCallback((topicId) => {
    setAppState((prev) => {
      // Also remove topicId from any problems referencing it
      const updatedProblems = prev.problems.map((p) => ({
        ...p,
        topicIds: p.topicIds.filter((id) => id !== topicId),
      }));

      return {
        ...prev,
        topics: prev.topics.filter((t) => t.id !== topicId),
        problems: updatedProblems,
      };
    });

    setSelectedTopicIds((prev) => prev.filter((id) => id !== topicId));
    showToast('Topic deleted.', 'info');
  }, [showToast]);

  // Topic selection helpers
  const toggleTopicSelection = useCallback((topicId) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  }, []);

  const selectAllTopics = useCallback(() => {
    setSelectedTopicIds(appState.topics.map((t) => t.id));
  }, [appState.topics]);

  const clearTopicSelection = useCallback(() => {
    setSelectedTopicIds([]);
  }, []);

  // Problem management
  const addProblem = useCallback((problemData) => {
    const id = problemData.id || problemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProblem = {
      id: `${id}-${Date.now().toString().slice(-4)}`,
      title: problemData.title.trim(),
      topicIds: problemData.topicIds || [],
      difficulty: problemData.difficulty || 'Medium',
      url: problemData.url?.trim() || '',
      estimatedTime: Number(problemData.estimatedTime) || 20,
      description: problemData.description?.trim() || '',
      notes: problemData.notes?.trim() || '',
      forRevision: !!problemData.forRevision,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      problems: [newProblem, ...prev.problems],
    }));

    showToast(`Problem "${newProblem.title}" added to library!`, 'success');
    return newProblem;
  }, [showToast]);

  const updateProblem = useCallback((problemId, updates) => {
    setAppState((prev) => {
      const nextProblems = prev.problems.map((p) =>
        p.id === problemId ? { ...p, ...updates } : p
      );
      return { ...prev, problems: nextProblems };
    });

    // If currently selected problem is being updated, sync it
    setSelectedProblem((curr) => {
      if (curr && curr.id === problemId) {
        return { ...curr, ...updates };
      }
      return curr;
    });

    showToast('Problem updated.', 'success');
  }, [showToast]);

  const deleteProblem = useCallback((problemId) => {
    setAppState((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.id !== problemId),
    }));

    setSelectedProblem((curr) => {
      if (curr && curr.id === problemId) {
        return null;
      }
      return curr;
    });

    showToast('Problem deleted.', 'info');
  }, [showToast]);

  const toggleRevision = useCallback((problemId) => {
    setAppState((prev) => {
      const target = prev.problems.find((p) => p.id === problemId);
      const newStatus = !target?.forRevision;
      return {
        ...prev,
        problems: prev.problems.map((p) =>
          p.id === problemId ? { ...p, forRevision: newStatus } : p
        ),
      };
    });
  }, []);

  // Challenge history recording
  const recordChallenge = useCallback((challengeResult) => {
    const entry = {
      id: `ch-${Date.now()}`,
      problemId: challengeResult.problemId,
      problemTitle: challengeResult.problemTitle,
      topicIds: challengeResult.topicIds || [],
      difficulty: challengeResult.difficulty,
      timeAllocatedMinutes: challengeResult.timeAllocatedMinutes,
      timeUsedSeconds: challengeResult.timeUsedSeconds,
      status: challengeResult.status, // 'solved' | 'failed' | 'skipped' | 'abandoned'
      notes: challengeResult.notes || '',
      completedAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      history: [entry, ...prev.history],
      activeChallenge: null, // clear active challenge on completion
    }));

    if (challengeResult.status === 'solved') {
      setSessionSolvedIds((prev) =>
        prev.includes(challengeResult.problemId) ? prev : [...prev, challengeResult.problemId]
      );
    }

    // Also update personal notes on the problem if provided
    if (challengeResult.notes) {
      updateProblem(challengeResult.problemId, { notes: challengeResult.notes });
    }

    // Update revision flag if requested
    if (challengeResult.forRevision !== undefined) {
      updateProblem(challengeResult.problemId, { forRevision: challengeResult.forRevision });
    }
  }, [updateProblem]);

  // Persist active running/paused challenge state
  const persistActiveChallenge = useCallback((challengeTimerState) => {
    setAppState((prev) => ({
      ...prev,
      activeChallenge: challengeTimerState ? {
        ...challengeTimerState,
        problemId: selectedProblem?.id || null,
      } : null,
    }));
  }, [selectedProblem]);

  // Settings update
  const updateSettings = useCallback((newSettings) => {
    setAppState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
    showToast('Settings saved.', 'success');
  }, [showToast]);

  // Reset all data back to factory defaults
  const resetAllData = useCallback(() => {
    const defaults = resetStorageToDefaults();
    setAppState(defaults);
    setSelectedTopicIds(defaults.topics.map((t) => t.id));
    setSelectedProblem(defaults.problems[0] || null);
    setSessionSolvedIds([]);
    showToast('All data has been reset to defaults.', 'info');
  }, [showToast]);

  // Export data as JSON
  const exportData = useCallback(() => {
    const jsonStr = exportStateAsJSON(appState);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `algorush-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully.', 'success');
  }, [appState, showToast]);

  // Import data from JSON
  const importData = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateImportData(parsed);
      if (!validation.valid) {
        showToast(`Import failed: ${validation.error}`, 'error');
        return false;
      }

      setAppState((prev) => ({
        ...prev,
        topics: parsed.topics,
        problems: parsed.problems,
        history: Array.isArray(parsed.history) ? parsed.history : prev.history,
        settings: parsed.settings ? { ...prev.settings, ...parsed.settings } : prev.settings,
        activeChallenge: null,
      }));

      setSelectedTopicIds(parsed.topics.map((t) => t.id));
      setSelectedProblem(parsed.problems[0] || null);
      showToast('Data imported successfully!', 'success');
      return true;
    } catch {
      showToast('Import failed: Invalid JSON file format.', 'error');
      return false;
    }
  }, [showToast]);

  const value = useMemo(
    () => ({
      topics: appState.topics,
      problems: appState.problems,
      history: appState.history,
      settings: appState.settings,
      activeChallenge: appState.activeChallenge,
      activeTab,
      setActiveTab,
      selectedTopicIds,
      setSelectedTopicIds,
      toggleTopicSelection,
      selectAllTopics,
      clearTopicSelection,
      difficultyFilter,
      setDifficultyFilter,
      topicStatusFilter,
      setTopicStatusFilter,
      forRevisionOnly,
      setForRevisionOnly,
      selectedProblem,
      setSelectedProblem,
      sessionSolvedIds,
      toast,
      showToast,
      closeToast,
      addTopic,
      updateTopic,
      deleteTopic,
      addProblem,
      updateProblem,
      deleteProblem,
      toggleRevision,
      recordChallenge,
      persistActiveChallenge,
      updateSettings,
      resetAllData,
      exportData,
      importData,
    }),
    [
      appState,
      activeTab,
      selectedTopicIds,
      toggleTopicSelection,
      selectAllTopics,
      clearTopicSelection,
      difficultyFilter,
      topicStatusFilter,
      forRevisionOnly,
      selectedProblem,
      sessionSolvedIds,
      toast,
      showToast,
      closeToast,
      addTopic,
      updateTopic,
      deleteTopic,
      addProblem,
      updateProblem,
      deleteProblem,
      toggleRevision,
      recordChallenge,
      persistActiveChallenge,
      updateSettings,
      resetAllData,
      exportData,
      importData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
