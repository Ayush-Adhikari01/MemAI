import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Menu, Plus, Brain, MessageSquare } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export const Layout = ({
  children,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenAuth
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { newChat } = useChat();
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${
      isDark ? 'bg-[#06080f] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    } relative transition-colors duration-300`}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={onOpenSettings}
        onOpenAuth={onOpenAuth}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        {/* Mobile Header Bar */}
        <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${
          isDark ? 'bg-[#080b13] border-white/[0.06]' : 'bg-white border-black/[0.08] shadow-xs'
        }`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.05]'
              }`}
              title="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg running-rgb-bg flex items-center justify-center text-white text-xs">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>MemAI</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                newChat();
                setActiveTab('chat');
              }}
              className="p-2 rounded-xl running-rgb-bg text-white shadow-glow-sm"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
