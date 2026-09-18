import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { X, Lock, Mail, User, Sparkles, Check } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const { isDark } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, fullName);
        setSuccessMsg('Account created successfully! You can now log in.');
        setIsSignUp(false);
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in-up">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${
        isDark ? 'bg-[#0c101d] border-white/[0.1]' : 'bg-white border-black/[0.08]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg running-rgb-bg text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isSignUp ? 'Create MemAI Account' : 'Sign In to MemAI'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                    isDark
                      ? 'bg-midnight-900 border-white/[0.08] text-slate-100'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                  isDark
                    ? 'bg-midnight-900 border-white/[0.08] text-slate-100'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                  isDark
                    ? 'bg-midnight-900 border-white/[0.08] text-slate-100'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-3 rounded-xl running-rgb-bg text-white font-semibold text-xs tracking-wide transition-all shadow-glow-sm cursor-pointer"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create MemAI Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-xs text-violet-500 hover:text-violet-600 font-medium transition-colors cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
