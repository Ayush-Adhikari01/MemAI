import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { X, Settings, Brain, Check, Sun, Moon } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { profile, updateProfileSettings, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setMemoryEnabled(profile.memory_enabled !== false);
      setCustomInstructions(profile.custom_instructions || '');
      setFullName(profile.full_name || '');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfileSettings({
        memory_enabled: memoryEnabled,
        custom_instructions: customInstructions,
        full_name: fullName
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in-up">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${
        isDark ? 'bg-[#0c101d] border-white/[0.1]' : 'bg-white border-black/[0.08]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg running-rgb-bg text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              User Preferences & Theme
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-black/[0.05]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings updated and active across all models!</span>
            </div>
          )}

          {/* Theme Switcher in Settings */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isDark ? 'bg-midnight-900 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-0.5">
              <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {isDark ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Appearance Theme</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Currently in {isDark ? 'Dark Cosmic' : 'Light Frosted'} mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-amber-400 border-white/[0.08]'
                  : 'bg-white hover:bg-slate-100 text-violet-700 border-slate-200 shadow-xs'
              }`}
            >
              Toggle {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Toggle Long-Term Memory */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isDark ? 'bg-midnight-900 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-0.5">
              <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Brain className="w-4 h-4 text-cyan-500" />
                <span>Persistent Long-Term Memory</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Allow MemAI to automatically index facts and recall them across future sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMemoryEnabled(!memoryEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                memoryEnabled ? 'running-rgb-bg shadow-glow-sm' : isDark ? 'bg-slate-800' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  memoryEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* User Display Name */}
          <div>
            <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                isDark
                  ? 'bg-midnight-900 border-white/[0.08] text-slate-100'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Custom Instructions */}
          <div>
            <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              System Directives & Behavior
            </label>
            <textarea
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Always provide concise answers. Prefer C code with user input."
              className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                isDark
                  ? 'bg-midnight-900 border-white/[0.08] text-slate-100 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Footer */}
          <div className={`pt-4 flex items-center justify-between border-t ${
            isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}>
            {user && !user.isGuest ? (
              <button
                type="button"
                onClick={logout}
                className="text-xs text-rose-500 hover:text-rose-600 font-mono underline cursor-pointer"
              >
                Sign Out ({user.email})
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono">Guest Mode</span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl running-rgb-bg text-white transition-all shadow-glow-sm cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
