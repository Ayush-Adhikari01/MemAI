import React from 'react';
import {
  Brain,
  Star,
  Trash2,
  Edit3,
  Calendar,
  Activity,
  AlertTriangle,
  Info,
  Heart,
  FolderGit2,
  Code2,
  Sliders,
  Users
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

const TYPE_CONFIG = {
  fact: { label: 'Fact', icon: Info, bg: 'bg-blue-500/10 text-blue-500 border-blue-500/25' },
  preference: { label: 'Preference', icon: Heart, bg: 'bg-purple-500/10 text-purple-500 border-purple-500/25' },
  project: { label: 'Project', icon: FolderGit2, bg: 'bg-amber-500/10 text-amber-500 border-amber-500/25' },
  relationship: { label: 'Relationship', icon: Users, bg: 'bg-pink-500/10 text-pink-500 border-pink-500/25' },
  event: { label: 'Event', icon: Calendar, bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' },
  skill: { label: 'Skill', icon: Code2, bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25' },
  instruction: { label: 'Instruction', icon: Sliders, bg: 'bg-rose-500/10 text-rose-500 border-rose-500/25' },
};

export const MemoryCard = ({ memory, onEdit, onDelete }) => {
  const { isDark } = useTheme();
  const typeInfo = TYPE_CONFIG[memory.memory_type] || TYPE_CONFIG.fact;
  const Icon = typeInfo.icon;
  const isOutdated = memory.status === 'outdated';

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group ${
      isOutdated
        ? isDark
          ? 'bg-midnight-900/40 border-white/[0.04] text-slate-500 opacity-60'
          : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60'
        : isDark
          ? 'glass-panel border-white/[0.07] hover:border-violet-500/40 hover:shadow-glow-sm hover:-translate-y-0.5'
          : 'glass-panel border-slate-200/80 hover:border-violet-400 hover:shadow-md hover:-translate-y-0.5'
    }`}>
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold uppercase tracking-wider border ${typeInfo.bg}`}>
            <Icon className="w-3 h-3" />
            {typeInfo.label}
          </span>

          <div className="flex items-center gap-2">
            {isOutdated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" /> Superseded
              </span>
            )}

            {/* Importance Stars */}
            <div className="flex items-center gap-0.5" title={`Importance: ${memory.importance || 3}/5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= (memory.importance || 3)
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                      : isDark ? 'text-slate-700' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Statement */}
        <p className={`text-[14.5px] font-normal leading-relaxed mb-4 ${
          isDark ? 'text-slate-100' : 'text-slate-800'
        }`}>
          {memory.content}
        </p>

        {/* Update note if replaced */}
        {memory.metadata?.replacedByNewContent && (
          <div className="text-xs text-amber-500 mb-3 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Updated to: <span className="italic font-medium">"{memory.metadata.replacedByNewContent}"</span></span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={`pt-3.5 mt-1 border-t flex items-center justify-between text-[11px] ${
        isDark ? 'border-white/[0.05] text-slate-400' : 'border-black/[0.06] text-slate-500'
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-violet-500" title="AI confidence score">
            <Brain className="w-3.5 h-3.5 text-cyan-500" />
            <span>{Math.round((memory.confidence || 1.0) * 100)}%</span>
          </span>

          <span className="flex items-center gap-1 font-mono text-slate-400" title="Times accessed in conversation">
            <Activity className="w-3.5 h-3.5" />
            <span>{memory.access_count || 0} recalls</span>
          </span>

          <span className="hidden sm:flex items-center gap-1 font-mono text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(memory.created_at).toLocaleDateString()}</span>
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(memory)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/[0.08] text-slate-400 hover:text-cyan-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            title="Edit memory"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            title="Delete memory"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
