import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { filterProblems } from '../../utils/selection';
import TopicModal from './TopicModal';
import ConfirmDialog from '../common/ConfirmDialog';
import {
  Search,
  X,
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Layers,
  BookmarkCheck,
  Check,
  ListFilter,
  FolderTree,
} from 'lucide-react';

const CATEGORY_MAP = {
  patterns: 'Foundations',
  arrays: 'Foundations',
  'strings-hashing': 'Foundations',
  'two-pointers': 'Core Algorithms',
  'sliding-window': 'Core Algorithms',
  'binary-search': 'Core Algorithms',
  recursion: 'Core Algorithms',
  'linked-lists': 'Linear Structures',
  'stacks-queues': 'Linear Structures',
  trees: 'Trees & Graphs',
  graphs: 'Trees & Graphs',
  backtracking: 'Advanced Techniques',
  'dynamic-programming': 'Advanced Techniques',
};

const CATEGORY_ORDER = [
  'Foundations',
  'Core Algorithms',
  'Linear Structures',
  'Trees & Graphs',
  'Advanced Techniques',
  'Custom Topics',
];

export default function TopicExplorer() {
  const {
    topics,
    problems,
    selectedTopicIds,
    toggleTopicSelection,
    selectAllTopics,
    clearTopicSelection,
    setSelectedTopicIds,
    difficultyFilter,
    setDifficultyFilter,
    topicStatusFilter,
    setTopicStatusFilter,
    forRevisionOnly,
    setForRevisionOnly,
    addTopic,
    updateTopic,
    deleteTopic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('categorized'); // 'categorized' | 'flat'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopicId, setDeletingTopicId] = useState(null);

  // Problem counts per topic
  const topicCounts = useMemo(() => {
    const counts = {};
    topics.forEach((t) => {
      counts[t.id] = problems.filter((p) => p.topicIds?.includes(t.id)).length;
    });
    return counts;
  }, [topics, problems]);

  // Total eligible problems matching currently active selection criteria
  const eligibleProblemCount = useMemo(() => {
    return filterProblems(problems, {
      selectedTopicIds,
      difficulty: difficultyFilter,
      forRevisionOnly,
    }).length;
  }, [problems, selectedTopicIds, difficultyFilter, forRevisionOnly]);

  // Total revision problems across entire library
  const totalRevisionCount = useMemo(() => {
    return problems.filter((p) => p.forRevision).length;
  }, [problems]);

  // Filter topics by status and search query
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      // Status filter
      if (topicStatusFilter !== 'All' && t.status !== topicStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [topics, topicStatusFilter, searchQuery]);

  // Group filtered topics by category
  const categorizedTopics = useMemo(() => {
    const groups = {};
    CATEGORY_ORDER.forEach((cat) => {
      groups[cat] = [];
    });

    filteredTopics.forEach((t) => {
      const cat = CATEGORY_MAP[t.id] || 'Custom Topics';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });

    // Remove empty categories
    return Object.entries(groups).filter(([, list]) => list.length > 0);
  }, [filteredTopics]);

  const handleEdit = (e, topic) => {
    e.stopPropagation();
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  const handleDelete = (e, topicId) => {
    e.stopPropagation();
    setDeletingTopicId(topicId);
  };

  const confirmDelete = () => {
    if (deletingTopicId) {
      deleteTopic(deletingTopicId);
      setDeletingTopicId(null);
    }
  };

  const handleSaveTopic = (formData) => {
    if (editingTopic) {
      updateTopic(editingTopic.id, formData);
    } else {
      addTopic(formData);
    }
  };

  // Toggle all topics in a given category
  const toggleCategorySelection = (categoryTopicList) => {
    const categoryIds = categoryTopicList.map((t) => t.id);
    const allSelected = categoryIds.every((id) => selectedTopicIds.includes(id));
    if (allSelected) {
      // Deselect category
      setSelectedTopicIds((prev) => prev.filter((id) => !categoryIds.includes(id)));
    } else {
      // Select all in category
      setSelectedTopicIds((prev) => Array.from(new Set([...prev, ...categoryIds])));
    }
  };

  const statusStyles = {
    Completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Learning: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Revision: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            Topic Explorer
          </h2>
          <span className="text-[11px] font-mono text-slate-400 bg-[#1D2740] px-2 py-0.5 rounded-md border border-[#29344D]">
            {selectedTopicIds.length}/{topics.length} active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'categorized' ? 'flat' : 'categorized')}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              viewMode === 'categorized'
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                : 'bg-[#1D2740] text-slate-400 border-[#29344D] hover:text-slate-200'
            }`}
            title={viewMode === 'categorized' ? 'Switch to Flat View' : 'Switch to Grouped View'}
            aria-label="Toggle Topic View Mode"
          >
            {viewMode === 'categorized' ? (
              <FolderTree className="w-3.5 h-3.5" />
            ) : (
              <ListFilter className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => {
              setEditingTopic(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-purple-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics (e.g. Arrays, Trees, Recursion)..."
          className="w-full pl-8 pr-8 py-1.5 bg-[#0B1020]/80 border border-[#29344D] focus:border-purple-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            aria-label="Clear Search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Row 1: Status Tabs & Revision Only */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#29344D] pb-3 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {['All', 'Learning', 'Completed', 'Revision'].map((status) => (
            <button
              key={status}
              onClick={() => setTopicStatusFilter(status)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                topicStatusFilter === status
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1D2740]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Revision Only Filter Toggle */}
        <button
          onClick={() => setForRevisionOnly(!forRevisionOnly)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
            forRevisionOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-[#1D2740]/60 text-slate-400 border-[#29344D] hover:text-slate-200'
          }`}
          title="Only select problems marked for revision"
        >
          <BookmarkCheck className={`w-3 h-3 ${forRevisionOnly ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>Revision Only</span>
          {totalRevisionCount > 0 && (
            <span className="text-[10px] font-mono bg-[#151C30] px-1.5 py-0.2 rounded text-slate-400">
              {totalRevisionCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Row 2: Difficulty Selector & Select/Clear All */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 font-mono mr-1">Diff:</span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2 py-0.5 text-[11px] font-mono uppercase rounded border transition-colors ${
                difficultyFilter === diff
                  ? diff === 'easy'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : diff === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : diff === 'hard'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-purple-600/30 text-purple-200 border-purple-500/40'
                  : 'bg-[#1D2740]/40 text-slate-400 border-[#29344D] hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Select All / Clear Selection */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
          <button
            onClick={selectAllTopics}
            className="hover:text-purple-300 transition-colors text-[11px] font-mono p-1"
            title="Select all topics"
          >
            All
          </button>
          <span>|</span>
          <button
            onClick={clearTopicSelection}
            className="hover:text-purple-300 transition-colors text-[11px] font-mono p-1"
            title="Clear topic selection"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Live Eligible Problem Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0B1020]/70 rounded-xl border border-[#29344D] text-xs">
        <span className="text-slate-400 text-[11px]">Eligible in arena:</span>
        <span className="font-mono font-semibold text-cyan-400 flex items-center gap-1">
          <span>{eligibleProblemCount}</span>
          <span className="text-[11px] font-normal text-slate-400">
            {eligibleProblemCount === 1 ? 'problem' : 'problems'}
          </span>
        </span>
      </div>

      {/* Topics List: Categorized or Flat */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No topics matching your filter criteria.
          </div>
        ) : viewMode === 'categorized' ? (
          categorizedTopics.map(([categoryName, topicList]) => {
            const allSelected = topicList.every((t) => selectedTopicIds.includes(t.id));
            const someSelected =
              !allSelected && topicList.some((t) => selectedTopicIds.includes(t.id));

            return (
              <div key={categoryName} className="space-y-1">
                {/* Category Header */}
                <div className="flex items-center justify-between px-1 py-1 text-[11px] font-mono uppercase text-slate-400 border-b border-[#29344D]/50">
                  <button
                    onClick={() => toggleCategorySelection(topicList)}
                    className="flex items-center gap-1.5 hover:text-purple-300 transition-colors group"
                    title={`Toggle all in ${categoryName}`}
                  >
                    <span className="w-3 h-3 rounded flex items-center justify-center border border-[#29344D] bg-[#1D2740] group-hover:border-purple-400">
                      {allSelected ? (
                        <Check className="w-2.5 h-2.5 text-purple-400" />
                      ) : someSelected ? (
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-sm" />
                      ) : null}
                    </span>
                    <span className="font-bold tracking-wider">{categoryName}</span>
                  </button>
                  <span className="text-slate-500 text-[10px]">
                    {topicList.filter((t) => selectedTopicIds.includes(t.id)).length}/
                    {topicList.length}
                  </span>
                </div>

                {/* Topics in category */}
                <div className="space-y-1 pl-1">
                  {topicList.map((topic) => {
                    const isSelected = selectedTopicIds.includes(topic.id);
                    const count = topicCounts[topic.id] || 0;

                    return (
                      <div
                        key={topic.id}
                        onClick={() => toggleTopicSelection(topic.id)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                          isSelected
                            ? 'bg-purple-950/20 border-purple-500/40 text-slate-100'
                            : 'bg-[#1D2740]/30 border-[#29344D] text-slate-400 hover:bg-[#1D2740]/70 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-purple-400 flex-shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 fill-purple-500/20" />
                            ) : (
                              <Square className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                            )}
                          </span>
                          <span className="truncate text-xs">{topic.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                              statusStyles[topic.status] || 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {topic.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span
                            className={`text-[11px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected
                                ? 'bg-purple-500/20 text-purple-200'
                                : 'bg-[#151C30] text-slate-500'
                            }`}
                            title={`${count} problems in ${topic.name}`}
                          >
                            {count}
                          </span>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-0.5">
                            <button
                              onClick={(e) => handleEdit(e, topic)}
                              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#151C30]"
                              title="Edit Topic"
                              aria-label={`Edit ${topic.name}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, topic.id)}
                              className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-[#151C30]"
                              title="Delete Topic"
                              aria-label={`Delete ${topic.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          /* Flat List View */
          filteredTopics.map((topic) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            const count = topicCounts[topic.id] || 0;

            return (
              <div
                key={topic.id}
                onClick={() => toggleTopicSelection(topic.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                  isSelected
                    ? 'bg-purple-950/20 border-purple-500/40 text-slate-100'
                    : 'bg-[#1D2740]/30 border-[#29344D] text-slate-400 hover:bg-[#1D2740]/70 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-purple-400 flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-purple-500/20" />
                    ) : (
                      <Square className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                    )}
                  </span>
                  <span className="truncate">{topic.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                      statusStyles[topic.status] || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-200'
                        : 'bg-[#151C30] text-slate-500'
                    }`}
                    title={`${count} problems in ${topic.name}`}
                  >
                    {count}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                    <button
                      onClick={(e) => handleEdit(e, topic)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#151C30]"
                      title="Edit Topic"
                      aria-label={`Edit ${topic.name}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, topic.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-[#151C30]"
                      title="Delete Topic"
                      aria-label={`Delete ${topic.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Topic Modal */}
      <TopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTopic}
        initialTopic={editingTopic}
      />

      {/* Delete Topic Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingTopicId)}
        onClose={() => setDeletingTopicId(null)}
        onConfirm={confirmDelete}
        title="Delete Topic"
        message="Deleting this topic will remove it from all associated problems. This cannot be undone."
        confirmLabel="Delete Topic"
      />
    </div>
  );
}
