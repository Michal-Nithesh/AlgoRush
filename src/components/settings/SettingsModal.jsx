import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { playTimesUpSound, playSuccessChime } from '../../utils/audio';
import {
  Volume2,
  VolumeX,
  Clock,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetAllData,
  } = useApp();

  const fileInputRef = useRef(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const handleSoundToggle = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleTestSound = () => {
    playTimesUpSound();
  };

  const handleTestSuccess = () => {
    playSuccessChime();
  };

  const handleDurationChange = (e) => {
    updateSettings({ defaultTimeMinutes: parseInt(e.target.value, 10) || 30 });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importData(content);
        if (success) {
          setImportStatus({ type: 'success', message: 'Data imported successfully!' });
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus({ type: 'error', message: 'Invalid backup file format.' });
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings & Data Management" maxWidth="max-w-lg">
        <div className="space-y-6">
          {/* Sound Notification Settings */}
          <div className="space-y-3 pb-5 border-b border-[#29344D]">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Timer Preferences
            </h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1D2740]/60 border border-[#29344D]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#151C30] text-purple-400 border border-[#29344D]">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-100 block">
                    Sound Notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Play chime when challenge countdown reaches zero
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2 py-1 text-[11px] font-mono text-rose-300 hover:text-rose-200 bg-rose-950/40 border border-rose-800/40 rounded-lg transition-colors"
                  title="Test countdown expiration alert"
                >
                  Test Alert
                </button>
                <button
                  type="button"
                  onClick={handleTestSuccess}
                  className="px-2 py-1 text-[11px] font-mono text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 border border-emerald-800/40 rounded-lg transition-colors"
                  title="Test solved victory chime"
                >
                  Test Chime
                </button>
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.soundEnabled ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle sound notifications"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Default Duration */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1D2740]/60 border border-[#29344D]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#151C30] text-cyan-400 border border-[#29344D]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-100 block">
                    Default Challenge Time
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Preselected timer duration for newly spun problems
                  </span>
                </div>
              </div>

              <select
                value={settings.defaultTimeMinutes}
                onChange={handleDurationChange}
                className="px-3 py-1.5 bg-[#151C30] border border-[#29344D] rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          {/* Backup, Export & Import */}
          <div className="space-y-3 pb-5 border-b border-[#29344D]">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Backup & Data Portability
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              AlgoRush operates entirely within your browser using localStorage. Export your data to JSON to transfer between machines or create manual backups.
            </p>

            {importStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                type="button"
                onClick={exportData}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1D2740] hover:bg-[#24304F] text-slate-200 border border-[#29344D] rounded-xl text-xs font-semibold transition-all"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export JSON Backup</span>
              </button>

              {/* Import Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1D2740] hover:bg-[#24304F] text-slate-200 border border-[#29344D] rounded-xl text-xs font-semibold transition-all"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Import JSON Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone: Factory Reset */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
              Danger Zone
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <div>
                <span className="text-xs font-semibold text-slate-100 block">
                  Reset All Data to Initial Seed
                </span>
                <span className="text-[11px] text-slate-400">
                  Clears all custom topics, problems, and challenge logs.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>

          {/* Storage Disclaimer Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0B1020]/60 border border-[#29344D] text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p>
              Note: Data is saved strictly in your local browser profile. It is not synchronized across different devices and may be wiped if you clear site data.
            </p>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllData}
        title="Reset All AlgoRush Data?"
        message="This will wipe all custom added problems, personal notes, and challenge history, restoring only the initial seed dataset. Are you sure you wish to proceed?"
        confirmLabel="Reset Everything"
      />
    </>
  );
}
