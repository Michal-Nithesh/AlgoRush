import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Check, ExternalLink } from 'lucide-react';

function ProblemFormContent({
  initialProblem,
  onClose,
  onSave,
  topics,
}) {
  const [title, setTitle] = useState(initialProblem?.title || '');
  const [topicIds, setTopicIds] = useState(
    initialProblem?.topicIds || (topics.length > 0 ? [topics[0].id] : [])
  );
  const [difficulty, setDifficulty] = useState(initialProblem?.difficulty || 'Medium');
  const [url, setUrl] = useState(initialProblem?.url || '');
  const [estimatedTime, setEstimatedTime] = useState(initialProblem?.estimatedTime || 25);
  const [description, setDescription] = useState(initialProblem?.description || '');
  const [notes, setNotes] = useState(initialProblem?.notes || '');
  const [forRevision, setForRevision] = useState(!!initialProblem?.forRevision);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Problem title is required.';
    }
    if (topicIds.length === 0) {
      errs.topicIds = 'Please assign at least one topic.';
    }
    if (url.trim()) {
      try {
        new URL(url.trim());
      } catch {
        errs.url = 'Please enter a valid URL (e.g. https://leetcode.com/problems/...)';
      }
    }
    if (Number(estimatedTime) <= 0) {
      errs.estimatedTime = 'Estimated time must be at least 1 minute.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleToggleTopic = (tId) => {
    setTopicIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
    if (errors.topicIds) {
      setErrors((prev) => ({ ...prev, topicIds: null }));
    }
  };

  const handleSubmit = (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      title: title.trim(),
      topicIds,
      difficulty,
      url: url.trim(),
      estimatedTime: Number(estimatedTime) || 20,
      description: description.trim(),
      notes: notes.trim(),
      forRevision,
    });

    if (addAnother) {
      setTitle('');
      setUrl('');
      setDescription('');
      setNotes('');
      setForRevision(false);
      setErrors({});
    } else {
      onClose();
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Problem Title <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
          placeholder="e.g. Longest Palindromic Substring"
          className={`w-full px-3.5 py-2 bg-[#1D202D] border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
            errors.title ? 'border-rose-500/50' : 'border-[#2C3142]'
          }`}
          autoFocus
        />
        {errors.title && (
          <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Topic Multi-select */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Assign Topics <span className="text-rose-400">*</span> (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#0C0D12]/60 rounded-xl border border-[#2C3142]">
          {topics.map((t) => {
            const isSelected = topicIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToggleTopic(t.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-[#1D202D] text-slate-400 hover:text-slate-200 border border-[#2C3142]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-slate-950" />}
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
        {errors.topicIds && (
          <p className="text-[11px] text-rose-400 mt-1">{errors.topicIds}</p>
        )}
      </div>

      {/* Difficulty and Estimated Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  difficulty === diff
                    ? diff === 'Easy'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : diff === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-[#1D202D] text-slate-400 border-[#2C3142] hover:bg-[#25293A]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Expected Solving Time (Minutes)
          </label>
          <input
            type="number"
            min="1"
            max="180"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Problem URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>Problem URL (Optional)</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (errors.url) setErrors((prev) => ({ ...prev, url: null }));
          }}
          placeholder="https://leetcode.com/problems/..."
          className={`w-full px-3.5 py-2 bg-[#1D202D] border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors font-mono ${
            errors.url ? 'border-rose-500/50' : 'border-[#2C3142]'
          }`}
        />
        {errors.url && <p className="text-[11px] text-rose-400 mt-1">{errors.url}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Problem Description / Prompt Summary
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Summary of input constraints, expected output, and edge conditions..."
          className="w-full px-3.5 py-2 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-mono"
        />
      </div>

      {/* Personal Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Personal Solution Notes & Invariants
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Key pattern, two-pointer bounds, Kadane formula, stack invariant..."
          className="w-full px-3.5 py-2 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
        />
      </div>

      {/* Revision Flag */}
      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none pt-1">
        <input
          type="checkbox"
          checked={forRevision}
          onChange={(e) => setForRevision(e.target.checked)}
          className="w-4 h-4 rounded border-[#2C3142] bg-[#1D202D] text-amber-500 focus:ring-amber-500"
        />
        <span>Mark for spaced repetition revision</span>
      </label>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[#2C3142]">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1D202D] rounded-xl border border-[#2C3142]"
        >
          Cancel
        </button>

        <div className="w-full sm:w-auto flex items-center gap-2">
          {!initialProblem && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-colors"
            >
              Save & Add Another
            </button>
          )}
          <button
            type="submit"
            className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-colors"
          >
            {initialProblem ? 'Save Changes' : 'Add Problem'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ProblemFormModal({
  isOpen,
  onClose,
  onSave,
  initialProblem = null,
}) {
  const { topics } = useApp();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProblem ? 'Edit DSA Problem' : 'Add New Problem'}
      maxWidth="max-w-xl"
    >
      <ProblemFormContent
        key={initialProblem?.id || 'new'}
        initialProblem={initialProblem}
        onClose={onClose}
        onSave={onSave}
        topics={topics}
      />
    </Modal>
  );
}
