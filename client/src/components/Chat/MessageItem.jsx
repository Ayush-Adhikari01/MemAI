import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Copy, Check, Edit2, RotateCw, Sparkles } from 'lucide-react';
import { CodeBlock } from './CodeBlock.jsx';
import { MemoryInsightBadge } from './MemoryInsightBadge.jsx';
import { AIAvatar } from './AIAvatar.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const MessageItem = ({
  message,
  index,
  isLast,
  isGenerating,
  onEdit,
  onRegenerate
}) => {
  const isUser = message.role === 'user';
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(index, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`group relative py-6 px-4 sm:px-8 transition-colors duration-200 ${
      isUser
        ? 'bg-transparent'
        : isDark
          ? 'bg-white/[0.015] border-y border-white/[0.04]'
          : 'bg-black/[0.015] border-y border-black/[0.04]'
    }`}>
      <div className="max-w-4xl mx-auto flex gap-4 sm:gap-6 items-start">
        {/* Avatar */}
        {isUser ? (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl running-rgb-bg flex items-center justify-center text-white shadow-glow-sm flex-shrink-0 font-semibold text-xs mt-0.5">
            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
        ) : (
          <AIAvatar size="md" />
        )}

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header Metadata */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold tracking-tight ${
                isUser
                  ? isDark ? 'text-violet-300' : 'text-violet-700'
                  : 'running-rgb-text font-bold'
              }`}>
                {isUser ? 'You' : 'MemAI Intelligence'}
              </span>
              {!isUser && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                  isDark
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    : 'bg-violet-100 text-violet-700 border-violet-200'
                }`}>
                  Dual-Engine
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>

          {/* Edit Mode for User */}
          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 shadow-glow-sm ${
                  isDark
                    ? 'bg-midnight-800 border-violet-500/50 text-slate-100 focus:ring-violet-500/40'
                    : 'bg-white border-violet-400 text-slate-900 focus:ring-violet-400/30'
                }`}
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 text-xs rounded-xl running-rgb-bg text-white font-semibold shadow-glow-sm transition-all cursor-pointer"
                >
                  Save & Resend
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-3.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Content */
            <div className={`text-[15px] sm:text-[15.5px] leading-relaxed break-words ${
              isUser
                ? isDark
                  ? 'text-slate-100 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 shadow-sm inline-block max-w-full'
                  : 'text-slate-900 bg-violet-50/90 border border-violet-200/80 rounded-2xl p-4 shadow-xs inline-block max-w-full'
                : 'markdown-body'
            }`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeText = String(children).replace(/\n$/, '');

                    if (!inline && match) {
                      return <CodeBlock language={match[1]} value={codeText} />;
                    }
                    if (!inline && codeText.includes('\n')) {
                      return <CodeBlock language="text" value={codeText} />;
                    }
                    return (
                      <code className={`px-1.5 py-0.5 rounded-md text-xs sm:text-[13px] font-mono border ${
                        isDark
                          ? 'bg-white/[0.07] text-violet-300 border-white/[0.08]'
                          : 'bg-violet-100/70 text-violet-800 border-violet-200'
                      }`} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Memory Insight Badge for Assistant */}
          {!isUser && message.memories_used && (
            <MemoryInsightBadge memories={message.memories_used} />
          )}

          {/* Action Toolbar */}
          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3.5 flex items-center gap-1.5 text-slate-400 text-xs">
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'hover:bg-white/[0.06] hover:text-slate-200' : 'hover:bg-slate-200 hover:text-slate-800'
                }`}
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {isUser && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'hover:bg-white/[0.06] hover:text-slate-200' : 'hover:bg-slate-200 hover:text-slate-800'
                  }`}
                  title="Edit prompt"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              {!isUser && isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  disabled={isGenerating}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                    isDark ? 'hover:bg-white/[0.06] hover:text-slate-200' : 'hover:bg-slate-200 hover:text-slate-800'
                  }`}
                  title="Regenerate answer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
