import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, Sparkles, Brain, ArrowUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const MessageInput = ({ onSendMessage, isGenerating, onStop }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const { profile } = useAuth();
  const { isDark } = useTheme();

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isGenerating) return;

    onSendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 pb-5 pt-1">
      <div className="relative group">
        {/* Soft Ambient RGB Glow around chat box */}
        <div className="absolute -inset-1 rounded-[26px] running-rgb-bg opacity-30 group-hover:opacity-50 group-focus-within:opacity-75 blur-md transition-opacity duration-500 pointer-events-none" />

        {/* Running RGB Animated Border Frame */}
        <div className="relative rounded-[26px] p-[1.5px] running-rgb-bg shadow-xl transition-all duration-300">
          <form
            onSubmit={handleSubmit}
            className={`relative flex flex-col rounded-[24.5px] transition-all duration-300 overflow-hidden ${
              isDark
                ? 'bg-[#0b0f19]/95 backdrop-blur-2xl'
                : 'bg-white/95 backdrop-blur-2xl'
            }`}
          >
            {/* Top Header Pill Info */}
            <div className={`flex items-center justify-between px-4 pt-2.5 pb-1 text-[11px] ${
              isDark ? 'text-slate-400 border-b border-white/[0.04]' : 'text-slate-500 border-b border-black/[0.05]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${profile?.memory_enabled !== false ? 'bg-cyan-400' : 'bg-slate-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${profile?.memory_enabled !== false ? 'bg-cyan-400' : 'bg-slate-400'}`} />
                </span>
                <span className={`font-mono font-medium ${profile?.memory_enabled !== false ? isDark ? 'text-violet-300' : 'text-violet-700' : 'text-slate-400'}`}>
                  {profile?.memory_enabled !== false ? 'Cognitive Memory Active' : 'Memory Vault Paused'}
                </span>
              </div>
              <span className="hidden sm:inline text-slate-400 font-mono text-[10px]">
                Return ↵ to send • Shift + ↵ for newline
              </span>
            </div>

            {/* Text Area Field */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, share project goals, or teach me a new preference..."
              disabled={isGenerating}
              rows={1}
              className={`w-full max-h-56 px-5 py-3.5 bg-transparent text-[15px] resize-none focus:outline-none disabled:opacity-50 leading-relaxed font-sans ${
                isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />

            {/* Action Controls Bar */}
            <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
              {/* File Attachment & Quick Helpers */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDark ? 'hover:bg-white/[0.06] hover:text-white text-slate-400' : 'hover:bg-black/[0.05] hover:text-slate-900 text-slate-500'
                  }`}
                  title="Attach context document or code file"
                  onClick={() => alert('Document analysis engine ready for text & code attachments.')}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              {/* Send / Stop Generation Button */}
              <div>
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={onStop}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold border border-rose-500/40 transition-all shadow-glow-sm cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className={`p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                      text.trim()
                        ? 'running-rgb-bg text-white shadow-glow-md hover:scale-105 active:scale-95'
                        : isDark
                          ? 'bg-white/[0.04] text-slate-600 border border-white/[0.05] cursor-not-allowed'
                          : 'bg-black/[0.04] text-slate-400 border border-black/[0.05] cursor-not-allowed'
                    }`}
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className={`text-center mt-2.5 text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        MemAI learns continuously across conversations. View or curate facts in your Memory Vault.
      </div>
    </div>
  );
};
