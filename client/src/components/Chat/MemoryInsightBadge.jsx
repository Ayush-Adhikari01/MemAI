import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Sparkles, X, Target } from 'lucide-react';

export const MemoryInsightBadge = ({ memories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!memories || memories.length === 0) return null;

  return (
    <div className="mt-3">
      {/* Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/40 text-violet-300 hover:text-violet-200 text-xs transition-all shadow-glow-sm cursor-pointer"
        title="View long-term memories retrieved for this answer"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <Brain className="w-3.5 h-3.5 text-violet-400" />
        <span className="font-medium tracking-tight">
          {memories.length} {memories.length === 1 ? 'cognitive memory' : 'cognitive memories'} applied
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
      </button>

      {/* Expanded Glass Drawer */}
      {isOpen && (
        <div className="mt-2.5 p-4 rounded-2xl glass-panel border border-violet-500/20 text-xs shadow-glow-sm max-w-xl animate-fade-in-up">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-violet-300 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Retrieved Long-Term Context</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {memories.map((mem, index) => (
              <div
                key={mem.id || index}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 transition-colors flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                    {mem.type || 'fact'}
                  </span>
                  {mem.score && (
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Target className="w-3 h-3" />
                      {(mem.score * 100).toFixed(0)}% relevance
                    </span>
                  )}
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-sans">
                  {mem.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
