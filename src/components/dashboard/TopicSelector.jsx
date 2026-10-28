import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import TopicModal from './TopicModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { Plus, Edit2, Trash2, CheckSquare, Square, Layers } from 'lucide-react';

export default function TopicSelector() {
  const {
    topics,
    problems,
    selectedTopicIds,
    toggleTopicSelection,
    selectAllTopics,
    clearTopicSelection,
    addTopic,
    updateTopic,
    deleteTopic,
    topicStatusFilter,
    setTopicStatusFilter,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopicId, setDeletingTopicId] = useState(null);

  // Calculate problem count for each topic
  const topicCounts = useMemo(() => {
    const counts = {};
    topics.forEach((t) => {
      counts[t.id] = problems.filter((p) => p.topicIds?.includes(t.id)).length;
    });
    return counts;
  }, [topics, problems]);

  // Filter topics by status (All, Learning, Completed, Revision)
  const filteredTopics = useMemo(() => {
    if (topicStatusFilter === 'All') return topics;
    return topics.filter((t) => t.status === topicStatusFilter);
  }, [topics, topicStatusFilter]);

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

  const statusColors = {
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Learning: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Revision: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="bg-[#151C30] border border-[#29344D] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            DSA Topics
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({selectedTopicIds.length}/{topics.length} selected)
          </span>
        </div>
        <button
          onClick={() => {
            setEditingTopic(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-300 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Topic</span>
        </button>
      </div>

      {/* Filter by Learning Status */}
      <div className="flex items-center justify-between gap-2 border-b border-[#29344D] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
          {['All', 'Learning', 'Completed', 'Revision'].map((st) => (
            <button
              key={st}
              onClick={() => setTopicStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                topicStatusFilter === st
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1D2740]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Selection actions: All / Clear */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
          <button
            onClick={selectAllTopics}
            className="hover:text-purple-300 transition-colors p-1"
            title="Select all topics"
          >
            All
          </button>
          <span>|</span>
          <button
            onClick={clearTopicSelection}
            className="hover:text-purple-300 transition-colors p-1"
            title="Clear topic selection"
          >
            None
          </button>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No topics in &ldquo;{topicStatusFilter}&rdquo; status.
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            const count = topicCounts[topic.id] || 0;

            return (
              <div
                key={topic.id}
                onClick={() => toggleTopicSelection(topic.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-purple-900/20 border-purple-500/40 text-slate-100 shadow-sm'
                    : 'bg-[#1D2740]/40 border-[#29344D] text-slate-400 hover:bg-[#1D2740] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-purple-400 flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-purple-500/20" />
                    ) : (
                      <Square className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    )}
                  </span>
                  <span className="truncate">{topic.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border ${
                      statusColors[topic.status] || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'bg-[#151C30] text-slate-400'
                    }`}
                    title={`${count} problems tagged with ${topic.name}`}
                  >
                    {count}
                  </span>

                  {/* Actions for editing and deleting */}
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
