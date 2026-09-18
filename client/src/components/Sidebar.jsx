import React, { useState } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Plus,
  MessageSquare,
  Brain,
  Settings,
  Trash2,
  Edit2,
  Search,
  User,
  LogIn,
  Check,
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenAuth,
  isOpen,
  onClose
}) => {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    newChat,
    deleteConversation,
    renameConversation
  } = useChat();

  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(c =>
    (c.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || 'New Conversation');
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteConv = (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-midnight-950/80 backdrop-blur-md md:hidden"
        />
      )}

      {/* Sidebar Workspace */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 ${
        isDark ? 'bg-[#080b13] border-white/[0.07]' : 'bg-[#fcfdfe] border-black/[0.08] shadow-lg'
      } border-r transform transition-transform duration-300 ease-in-out`}>
        {/* Brand Header */}
        <div className={`p-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl running-rgb-bg p-[1.5px] shadow-glow-sm">
              <div className={`w-full h-full rounded-[10px] ${isDark ? 'bg-[#0b0f19]' : 'bg-white'} flex items-center justify-center`}>
                <Brain className="w-4 h-4 text-violet-500" />
              </div>
            </div>
            <div>
              <div className="font-bold text-[15px] tracking-tight flex items-center gap-1.5">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>MemAI</span>
              </div>
              <p className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cognitive Memory AI</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'text-amber-400 hover:bg-white/[0.08]'
                  : 'text-violet-600 hover:bg-black/[0.05]'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary "+ New Chat" Action */}
        <div className={`p-3 space-y-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
          <button
            onClick={() => {
              newChat();
              setActiveTab('chat');
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl running-rgb-bg text-white font-semibold text-xs tracking-wide transition-all duration-200 shadow-glow-sm hover:opacity-95 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>

          {/* Navigation Switchers */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => {
                setActiveTab('chat');
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'chat'
                  ? isDark
                    ? 'bg-white/[0.08] text-violet-300 border border-violet-500/30 shadow-glow-sm'
                    : 'bg-violet-50 text-violet-700 border border-violet-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('memories');
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'memories'
                  ? isDark
                    ? 'bg-white/[0.08] text-violet-300 border border-violet-500/30 shadow-glow-sm'
                    : 'bg-violet-50 text-violet-700 border border-violet-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Memories</span>
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                isDark
                  ? 'bg-white/[0.03] border border-white/[0.06] text-slate-200 placeholder-slate-500'
                  : 'bg-slate-100/80 border border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <div className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            History
          </div>

          {filteredConversations.length === 0 ? (
            <div className={`px-3 py-8 text-center text-xs font-sans ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No conversations yet
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeTab === 'chat' && currentConversationId === conv.id;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    selectConversation(conv.id);
                    setActiveTab('chat');
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-white/[0.07] text-white font-medium border border-violet-500/30 shadow-sm'
                        : 'bg-violet-50/80 text-violet-900 font-medium border border-violet-200 shadow-xs'
                      : isDark
                        ? 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-violet-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id, e)}
                          className={`w-full px-1.5 py-0.5 rounded-md border border-violet-500 text-xs focus:outline-none ${
                            isDark ? 'bg-midnight-950 text-slate-100' : 'bg-white text-slate-900'
                          }`}
                          autoFocus
                        />
                        <button onClick={(e) => handleSaveRename(conv.id, e)} className="p-0.5 text-violet-400 hover:text-violet-300">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleCancelRename} className="p-0.5 text-slate-500 hover:text-slate-300">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate">{conv.title || 'New Conversation'}</span>
                    )}
                  </div>

                  {/* Actions on Hover */}
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-slate-400 ml-1 transition-opacity">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className={`p-1 rounded ${isDark ? 'hover:text-slate-200 hover:bg-white/[0.06]' : 'hover:text-slate-800 hover:bg-slate-200'}`}
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConv(conv.id, e)}
                        className="p-1 hover:text-rose-400 rounded hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className={`p-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'} space-y-1.5`}>
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-violet-500" />
            <span>Settings & Instructions</span>
          </button>

          <button
            onClick={onOpenAuth}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-500">
                <User className="w-3 h-3" />
              </div>
              <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {user && !user.isGuest ? user.email : 'Guest / Demo Active'}
              </span>
            </div>
            {user && !user.isGuest ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow-sm" />
            ) : (
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
