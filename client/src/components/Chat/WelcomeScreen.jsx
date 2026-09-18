import React from 'react';
import { AIAvatar } from './AIAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Brain, Sparkles } from 'lucide-react';

export const WelcomeScreen = () => {
  const { profile, user } = useAuth();
  const { isDark } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const name = profile?.full_name?.split(' ')[0] || (user?.email && user.email !== 'guest@example.com' ? user.email.split('@')[0] : '');

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in-up">
      {/* Central Luminous Intelligence Core */}
      <div className="relative mb-6">
        <AIAvatar size="lg" />
        <div className="absolute -inset-8 rounded-full running-rgb-bg opacity-20 blur-3xl -z-10 animate-pulse" />
      </div>

      {/* Greeting Title */}
      <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        {getGreeting()}{name ? `, ${name}` : ''}.
      </h1>
      <p className={`text-sm sm:text-base max-w-md leading-relaxed font-normal mb-2 ${
        isDark ? 'text-slate-400' : 'text-slate-600'
      }`}>
        How can I help you today?
      </p>

      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono mt-4 ${
        isDark
          ? 'bg-white/[0.03] border border-white/[0.06] text-slate-400'
          : 'bg-white border border-slate-200 text-slate-600 shadow-xs'
      }`}>
        <span className="w-2 h-2 rounded-full running-rgb-bg animate-ping" />
        <span className="running-rgb-text font-bold">Continuous Cognitive Memory Active</span>
      </div>
    </div>
  );
};
