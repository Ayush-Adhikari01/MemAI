import React from 'react';
import { Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export const MemoryStats = ({ stats }) => {
  const { isDark } = useTheme();
  if (!stats) return null;

  const typeLabels = [
    { key: 'fact', label: 'Facts', dot: 'bg-blue-500' },
    { key: 'preference', label: 'Preferences', dot: 'bg-purple-500' },
    { key: 'project', label: 'Projects', dot: 'bg-amber-500' },
    { key: 'skill', label: 'Skills', dot: 'bg-cyan-500' },
    { key: 'instruction', label: 'Directives', dot: 'bg-rose-500' },
    { key: 'event', label: 'Events', dot: 'bg-emerald-500' },
    { key: 'relationship', label: 'Relations', dot: 'bg-pink-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* Total Card */}
      <div className="p-4 rounded-2xl glass-panel flex items-center gap-4 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-500 flex items-center justify-center shadow-glow-sm">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <span className={`text-[11px] font-mono uppercase tracking-wider font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Stored
          </span>
          <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {stats.total || 0}
          </div>
        </div>
      </div>

      {/* Active Memories */}
      <div className="p-4 rounded-2xl glass-panel flex items-center gap-4 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className={`text-[11px] font-mono uppercase tracking-wider font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Active Memories
          </span>
          <div className="text-2xl font-bold text-emerald-500 tracking-tight">
            {stats.active || 0}
          </div>
        </div>
      </div>

      {/* Superseded */}
      <div className="p-4 rounded-2xl glass-panel flex items-center gap-4 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <span className={`text-[11px] font-mono uppercase tracking-wider font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Superseded / Outdated
          </span>
          <div className="text-2xl font-bold text-amber-500 tracking-tight">
            {stats.outdated || 0}
          </div>
        </div>
      </div>

      {/* Breakdown Badges */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col justify-center">
        <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Category Breakdown
        </span>
        <div className="flex flex-wrap gap-1.5">
          {typeLabels.map((t) => {
            const count = stats.byType?.[t.key] || 0;
            if (count === 0) return null;
            return (
              <span
                key={t.key}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono flex items-center gap-1.5 border ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.06] text-slate-300'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                <span>{t.label}: <b className={isDark ? 'text-white' : 'text-slate-900'}>{count}</b></span>
              </span>
            );
          })}
          {(!stats.active || stats.active === 0) && (
            <span className={`text-xs font-sans ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No active memories yet</span>
          )}
        </div>
      </div>
    </div>
  );
};
