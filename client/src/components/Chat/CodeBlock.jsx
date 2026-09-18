import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Terminal } from 'lucide-react';

export const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-white/[0.08] bg-[#090d16] shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-mono text-[11px] font-semibold tracking-wider text-violet-300 uppercase flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400" />
            {language || 'code'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] hover:text-white transition-all text-slate-300 text-xs font-medium cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Body */}
      <div className="text-xs sm:text-[13px] font-mono overflow-x-auto leading-relaxed">
        <SyntaxHighlighter
          language={language || 'text'}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1.1rem 1.25rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: '1.65'
          }}
          wrapLongLines={false}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
