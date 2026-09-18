import React, { useState, useEffect } from 'react';
import { X, Brain, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

const MEMORY_TYPES = [
  { value: 'fact', label: 'Fact (Personal Bio, Location, Hardware)' },
  { value: 'preference', label: 'Preference (Style, Tone, Likes, Dislikes)' },
  { value: 'project', label: 'Project (Apps, Repositories, Milestones)' },
  { value: 'relationship', label: 'Relationship (Colleagues, Friends)' },
  { value: 'event', label: 'Event (Milestones, Deadlines)' },
  { value: 'skill', label: 'Skill (Languages, Tools, Proficiencies)' },
  { value: 'instruction', label: 'Instruction (Global System Directives)' },
];

export const MemoryModal = ({ isOpen, onClose, onSave, editingMemory = null }) => {
  const { isDark } = useTheme();
  const [content, setContent] = useState('');
  const [memoryType, setMemoryType] = useState('fact');
  const [importance, setImportance] = useState(3);
  const [confidence, setConfidence] = useState(1.0);
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingMemory) {
      setContent(editingMemory.content || '');
      setMemoryType(editingMemory.memory_type || 'fact');
      setImportance(editingMemory.importance || 3);
      setConfidence(editingMemory.confidence !== undefined ? editingMemory.confidence : 1.0);
      setStatus(editingMemory.status || 'active');
    } else {
      setContent('');
      setMemoryType('fact');
      setImportance(3);
      setConfidence(1.0);
      setStatus('active');
    }
  }, [editingMemory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await onSave({
        content: content.trim(),
        memoryType,
        importance: parseInt(importance, 10),
        confidence: parseFloat(confidence),
        status,
        ...(editingMemory?.id && { id: editingMemory.id })
      });
      onClose();
    } catch (err) {
      console.error('Failed to save memory:', err);
      alert(`Error saving memory: ${err.message}`);
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
              <Brain className="w-4 h-4" />
            </div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {editingMemory ? 'Edit Memory Statement' : 'Add New Cognitive Memory'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Content Field */}
          <div>
            <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Memory Statement <span className="text-violet-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. User prefers writing code in C with comments and user input."
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 shadow-inner ${
                isDark
                  ? 'bg-midnight-900 border-white/[0.08] text-slate-100 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <p className="mt-1 text-[11px] text-slate-400 font-mono">
              Phrased as a clear third-person declarative assertion.
            </p>
          </div>

          {/* Memory Type */}
          <div>
            <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Category
            </label>
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none ${
                isDark
                  ? 'bg-[#060913] border-white/[0.1] text-white focus:border-violet-500/50'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-violet-500/50'
              }`}
            >
              {MEMORY_TYPES.map((t) => (
                <option key={t.value} value={t.value} className={isDark ? 'bg-[#060913] text-white' : 'bg-white text-slate-900'}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Importance Slider (1 to 5) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Importance Level
              </label>
              <span className="text-xs font-mono font-bold text-amber-500">{importance} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="w-full accent-violet-500 h-2 bg-slate-200 dark:bg-midnight-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Confidence Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                AI Confidence
              </label>
              <span className="text-xs font-mono font-bold text-cyan-500">{Math.round(confidence * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full accent-cyan-500 h-2 bg-slate-200 dark:bg-midnight-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className={`pt-4 flex items-center justify-end gap-2.5 border-t ${
            isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                isDark ? 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl running-rgb-bg disabled:opacity-50 text-white transition-all shadow-glow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Vectorizing...' : 'Save & Vectorize'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
