import React, { useState } from 'react';
import Header from './Header';
import Toast from '../common/Toast';
import SettingsModal from '../settings/SettingsModal';
import { useApp } from '../../context/AppContext';
import { HardDrive, ShieldCheck } from 'lucide-react';

export default function AppLayout({ children }) {
  const { toast, closeToast } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0C0D12] text-[#F8FAFC] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="border-t border-[#2C3142] bg-[#0C0D12] py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="font-semibold text-slate-400 font-mono">AlgoRush</span>
            <span>—</span>
            <span className="text-amber-400/90 italic">Learn the pattern. Beat the clock.</span>
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              100% Local Storage
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              No Cloud Tracking
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <Toast toast={toast} onClose={closeToast} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
