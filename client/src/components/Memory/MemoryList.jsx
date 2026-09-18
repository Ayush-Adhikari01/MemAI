import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { MemoryCard } from './MemoryCard.jsx';
import { MemoryModal } from './MemoryModal.jsx';
import { MemoryStats } from './MemoryStats.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Plus, Search, Trash2, Brain, Filter, RefreshCw, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Types' },
  { id: 'fact', label: 'Facts' },
  { id: 'preference', label: 'Preferences' },
  { id: 'project', label: 'Projects' },
  { id: 'skill', label: 'Skills' },
  { id: 'instruction', label: 'Directives' },
  { id: 'event', label: 'Events' },
  { id: 'relationship', label: 'Relations' },
];

export const MemoryList = () => {
  const { isDark } = useTheme();
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const [memRes, statsRes] = await Promise.all([
        api.getMemories({
          type: selectedType,
          status: selectedStatus,
          search: search.trim() || undefined
        }),
        api.getMemoryStats()
      ]);

      if (memRes?.memories) setMemories(memRes.memories);
      if (statsRes?.stats) setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMemories();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchMemories]);

  const handleCreateOrUpdate = async (formData) => {
    if (formData.id) {
      const res = await api.updateMemory(formData.id, {
        content: formData.content,
        memoryType: formData.memoryType,
        importance: formData.importance,
        confidence: formData.confidence,
        status: formData.status
      });
      if (res?.memory) {
        setMemories(prev => prev.map(m => m.id === formData.id ? res.memory : m));
      }
    } else {
      const res = await api.createMemory({
        content: formData.content,
        memoryType: formData.memoryType,
        importance: formData.importance,
        confidence: formData.confidence
      });
      if (res?.memory) {
        setMemories(prev => [res.memory, ...prev]);
      }
    }
    api.getMemoryStats().then(s => s?.stats && setStats(s.stats));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
      api.getMemoryStats().then(s => s?.stats && setStats(s.stats));
    } catch (err) {
      console.error('Failed to delete memory:', err);
      alert('Error deleting memory');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('CAUTION: This will permanently wipe ALL memories stored for your profile. Continue?')) return;
    try {
      await api.clearAllMemories();
      setMemories([]);
      fetchMemories();
    } catch (err) {
      console.error('Failed to clear memories:', err);
    }
  };

  const openAddModal = () => {
    setEditingMemory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (memory) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl running-rgb-bg text-white shadow-glow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Long-Term Memory Vault
              </h1>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                Inspect, curate, or edit all facts and preferences MemAI has learned about you.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl running-rgb-bg text-white font-semibold text-xs tracking-wide transition-all shadow-glow-sm hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Memory</span>
          </button>

          <button
            onClick={handleClearAll}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-white/[0.04] hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 border-white/[0.06] hover:border-rose-800/40'
                : 'bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 border-slate-200 hover:border-rose-200'
            }`}
            title="Clear all stored memories"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Purge All</span>
          </button>
        </div>
      </div>

      {/* Memory Stats */}
      <MemoryStats stats={stats} />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel mb-7 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories by keyword, entity, or topic..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30 ${
                isDark
                  ? 'bg-midnight-950/80 border border-white/[0.07] text-slate-100 placeholder-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-mono focus:outline-none ${
                isDark
                  ? 'bg-midnight-950/80 border border-white/[0.07] text-slate-200'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="active">Active Only</option>
              <option value="outdated">Superseded Only</option>
              <option value="all">All Records</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium text-xs transition-all duration-200 cursor-pointer ${
                selectedType === cat.id
                  ? 'running-rgb-bg text-white shadow-glow-sm font-semibold'
                  : isDark
                    ? 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.07]'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
          <span className="text-xs font-mono">Scanning vector memory space...</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-dashed p-8 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl running-rgb-bg p-[1.5px] mx-auto mb-3 shadow-glow-sm">
            <div className={`w-full h-full rounded-[14px] ${isDark ? 'bg-midnight-900' : 'bg-white'} flex items-center justify-center text-violet-500`}>
              <Brain className="w-7 h-7" />
            </div>
          </div>
          <h3 className={`text-base font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>No memories found</h3>
          <p className={`text-xs leading-relaxed mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {search || selectedType !== 'all'
              ? 'No memory records match your current query or category filter.'
              : 'As you converse with MemAI, it will automatically distill and index memories here.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl running-rgb-bg text-white text-xs font-semibold shadow-glow-sm transition-all cursor-pointer"
          >
            Create Manual Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <MemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        editingMemory={editingMemory}
      />
    </div>
  );
};
