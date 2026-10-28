import React from 'react';

export default function DifficultyBadge({ difficulty = 'Medium', size = 'md' }) {
  const diffLower = difficulty.toLowerCase();

  const styles = {
    easy: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    medium: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    hard: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400',
    },
  }[diffLower] || {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {difficulty}
    </span>
  );
}
