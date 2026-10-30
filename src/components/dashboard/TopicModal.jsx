import React, { useState } from 'react';
import Modal from '../common/Modal';

function TopicFormContent({ initialTopic, onClose, onSave }) {
  const [name, setName] = useState(initialTopic?.name || '');
  const [description, setDescription] = useState(initialTopic?.description || '');
  const [status, setStatus] = useState(initialTopic?.status || 'Learning');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required.');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      status,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Topic Name <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Dynamic Programming, Trees, Tries"
          className="w-full px-3.5 py-2 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Key Patterns & Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Key algorithmic patterns, edge cases, formulas or invariants..."
          className="w-full px-3.5 py-2 bg-[#1D202D] border border-[#2C3142] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Learning Status
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Learning', 'Completed', 'Revision'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                status === s
                  ? s === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : s === 'Revision'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-[#1D202D]/60 text-slate-400 border-[#2C3142] hover:bg-[#1D202D]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C3142]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1D202D] rounded-lg transition-colors border border-[#2C3142]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
        >
          {initialTopic ? 'Save Changes' : 'Create Topic'}
        </button>
      </div>
    </form>
  );
}

export default function TopicModal({
  isOpen,
  onClose,
  onSave,
  initialTopic = null,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTopic ? 'Edit Topic' : 'Add New DSA Topic'}
      maxWidth="max-w-md"
    >
      <TopicFormContent
        key={initialTopic?.id || 'new'}
        initialTopic={initialTopic}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}
