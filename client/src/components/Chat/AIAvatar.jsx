import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIAvatar = ({ size = 'md', isThinking = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 sm:w-9 sm:h-9 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }[size] || 'w-8 h-8 sm:w-9 sm:h-9 text-sm';

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${sizeClasses} group`}>
      {/* Running RGB Animated Glow Halo */}
      <div className={`absolute -inset-1.5 rounded-2xl running-rgb-bg blur-md transition-all duration-700 ${
        isThinking ? 'opacity-100 scale-105' : 'opacity-60 group-hover:opacity-100'
      }`} />

      {/* Luminous Inner Body */}
      <div className="relative w-full h-full rounded-xl sm:rounded-2xl running-rgb-bg p-[1.5px] shadow-glow-sm">
        <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#090d16] dark:bg-[#090d16] flex items-center justify-center overflow-hidden">
          {/* Subtle Radial Light Center */}
          <div className="absolute inset-0 bg-radial from-violet-500/30 via-pink-500/10 to-transparent opacity-80" />

          {/* Abstract Intelligence Symbol */}
          {size === 'lg' || size === 'xl' ? (
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
              <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-cyan-300 animate-pulse relative z-10" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full running-rgb-bg shadow-glow-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
