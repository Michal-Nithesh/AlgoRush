import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import DifficultyBadge from '../common/DifficultyBadge';
import ProblemFormModal from './ProblemFormModal';
import ConfirmDialog from '../common/ConfirmDialog';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  BookmarkCheck,
  Bookmark,
  Play,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function ProblemLibrary() {
  const {
    problems,
    topics,
    addProblem,
    updateProblem,
    deleteProblem,
    toggleRevision,
    setSelectedProblem,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('all');
  const [revisionOnlyFilter, setRevisionOnlyFilter] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [deletingProblemId, setDeletingProblemId] = useState(null);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchNotes = p.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchNotes) return false;
      }

      // Topic filter
      if (selectedTopicFilter !== 'all') {
        if (!p.topicIds?.includes(selectedTopicFilter)) return false;
      }

      // Difficulty filter
      if (selectedDifficultyFilter !== 'all') {
        if (p.difficulty.toLowerCase() !== selectedDifficultyFilter.toLowerCase()) {
          return false;
        }
      }

      // Revision filter
      if (revisionOnlyFilter && !p.forRevision) {
        return false;
      }

      return true;
    });
  }, [problems, searchQuery, selectedTopicFilter, selectedDifficultyFilter, revisionOnlyFilter]);

  const handleEdit = (p) => {
    setEditingProblem(p);
    setIsFormOpen(true);
  };

  const handleDelete = (pId) => {
    setDeletingProblemId(pId);
  };

  const confirmDelete = () => {
    if (deletingProblemId) {
      deleteProblem(deletingProblemId);
      setDeletingProblemId(null);
    }
  };

  const handleSaveProblem = (formData) => {
    if (editingProblem) {
      updateProblem(editingProblem.id, formData);
    } else {
      addProblem(formData);
    }
  };

  const handleAttemptNow = (problem) => {
    setSelectedProblem(problem);
    setActiveTab('dashboard');
  };

  // Helper to get topic names
  const getTopicNames = (topicIds = []) => {
    return topicIds.map((id) => {
      const found = topics.find((t) => t.id === id);
      return found ? found.name : id;
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Title & Add Problem Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Problem Library
            </h1>
            <span className="text-xs text-slate-400 font-mono bg-[#1D2740] px-2 py-0.5 rounded-full border border-[#29344D]">
              {problems.length} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal DSA problem bank, assign topics, and flag problems for revision.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProblem(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-glow-purple transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Problem</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, keywords, or notes..."
            className="w-full pl-9 pr-4 py-2 bg-[#1D2740] border border-[#29344D] rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Topic filter */}
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="px-3 py-2 bg-[#1D2740] border border-[#29344D] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDifficultyFilter}
            onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
            className="px-3 py-2 bg-[#1D2740] border border-[#29344D] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Revision filter button */}
          <button
            onClick={() => setRevisionOnlyFilter((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              revisionOnlyFilter
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#1D2740] text-slate-400 border-[#29344D] hover:text-slate-200'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Revision Only</span>
          </button>
        </div>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-12 text-center shadow-lg">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            No problems match your criteria
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query or reset the filters to view your problem collection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTopicFilter('all');
              setSelectedDifficultyFilter('all');
              setRevisionOnlyFilter(false);
            }}
            className="px-4 py-2 bg-[#1D2740] hover:bg-[#24304F] text-slate-200 text-xs rounded-xl border border-[#29344D] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => {
            const topicNames = getTopicNames(problem.topicIds);

            return (
              <div
                key={problem.id}
                className="bg-[#151C30] border border-[#29344D] hover:border-purple-500/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4 transition-all hover:shadow-glow-purple/20 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Difficulty, Estimated time & Revision toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {problem.estimatedTime || 20}m
                      </span>

                      <button
                        onClick={() => toggleRevision(problem.id)}
                        className={`p-1 rounded-md transition-colors ${
                          problem.forRevision
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={
                          problem.forRevision
                            ? 'Flagged for revision (click to unflag)'
                            : 'Click to flag for revision'
                        }
                      >
                        {problem.forRevision ? (
                          <BookmarkCheck className="w-4 h-4 fill-amber-400/20" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Problem Title & URL link */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {problem.title}
                    </h3>

                    {/* Topics badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topicNames.map((tName) => (
                        <span
                          key={tName}
                          className="text-[10px] text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded-md"
                        >
                          {tName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description / Notes snippet */}
                  {problem.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {problem.description}
                    </p>
                  )}
                  {problem.notes && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-1 border-l-2 border-purple-500/40 pl-2">
                      {problem.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Actions: Attempt Now, External Link, Edit, Delete */}
                <div className="pt-3 border-t border-[#29344D] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAttemptNow(problem)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all"
                    title="Load into Arena countdown"
                  >
                    <Play className="w-3 h-3 fill-purple-300" />
                    <span>Attempt</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {problem.url && (
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-[#1D2740] transition-colors"
                        title="Open external problem link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(problem)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1D2740] transition-colors"
                      title="Edit Problem"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(problem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-[#1D2740] transition-colors"
                      title="Delete Problem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Problem Add / Edit Modal */}
      <ProblemFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProblem}
        initialProblem={editingProblem}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProblemId)}
        onClose={() => setDeletingProblemId(null)}
        onConfirm={confirmDelete}
        title="Delete Problem"
        message="Are you sure you want to delete this problem? This action cannot be undone."
        confirmLabel="Delete Problem"
      />
    </div>
  );
}
