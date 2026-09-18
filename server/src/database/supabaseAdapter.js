import { DatabaseAdapter } from './dbAdapter.js';
import { getSupabaseAdmin } from '../config/supabase.js';

export class SupabaseAdapter extends DatabaseAdapter {
  constructor() {
    super();
  }

  get client() {
    const admin = getSupabaseAdmin();
    if (!admin) {
      throw new Error('Supabase client is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    return admin;
  }

  // --- USER PROFILES ---
  async getUserProfile(userId) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId, updates) {
    const { data, error } = await this.client
      .from('user_profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // --- CONVERSATIONS ---
  async getConversations(userId) {
    const { data, error } = await this.client
      .from('conversations')
      .select('*, messages(count)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConversationById(conversationId, userId) {
    const { data, error } = await this.client
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createConversation(userId, title = 'New Conversation') {
    const { data, error } = await this.client
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConversation(conversationId, userId, updates) {
    const { data, error } = await this.client
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteConversation(conversationId, userId) {
    const { data, error } = await this.client
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  // --- MESSAGES ---
  async getMessages(conversationId, userId, limit = 50) {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async createMessage({ conversationId, userId, role, content, memoriesUsed = [], memoriesExtracted = [] }) {
    const { data, error } = await this.client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        memories_used: memoriesUsed,
        memories_extracted: memoriesExtracted
      })
      .select()
      .single();

    if (error) throw error;

    // Bump conversation updated_at
    await this.client
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('user_id', userId);

    return data;
  }

  // --- MEMORIES ---
  async getMemories(userId, { type, status = 'active', search, limit = 100, offset = 0 } = {}) {
    let query = this.client
      .from('memories')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('memory_type', type);
    }

    if (search && search.trim()) {
      query = query.ilike('content', `%${search.trim()}%`);
    }

    query = query
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { memories: data || [], total: count || 0 };
  }

  async getMemoryById(memoryId, userId) {
    const { data, error } = await this.client
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createMemory({
    userId,
    content,
    memoryType,
    importance = 3,
    confidence = 1.0,
    status = 'active',
    embedding = null,
    sourceConversationId = null,
    sourceMessageId = null,
    metadata = {}
  }) {
    const { data, error } = await this.client
      .from('memories')
      .insert({
        user_id: userId,
        content,
        memory_type: memoryType,
        importance,
        confidence,
        status,
        embedding,
        source_conversation_id: sourceConversationId,
        source_message_id: sourceMessageId,
        metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMemory(memoryId, userId, updates) {
    const { data, error } = await this.client
      .from('memories')
      .update(updates)
      .eq('id', memoryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMemory(memoryId, userId) {
    const { data, error } = await this.client
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  async deleteAllMemories(userId) {
    const { data, error } = await this.client
      .from('memories')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  // --- VECTOR MEMORY SEARCH VIA PGVECTOR RPC ---
  async searchMemoriesByVector(queryEmbedding, threshold = 0.45, limit = 10, userId = null) {
    const { data, error } = await this.client.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      p_user_id: userId
    });

    if (error) {
      console.error('Vector search RPC error:', error);
      throw error;
    }
    return data || [];
  }

  async recordMemoryUsage(memoryIds) {
    if (!memoryIds || memoryIds.length === 0) return;

    try {
      // Increment access_count and update last_used_at for each memory
      for (const id of memoryIds) {
        await this.client
          .from('memories')
          .update({
            access_count: this.client.rpc ? undefined : 1, // Fallback if rpc is not used
            last_used_at: new Date().toISOString()
          })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Non-fatal: Failed to record memory usage timestamp:', err.message);
    }
  }
}

// Export singleton instance
export const db = new SupabaseAdapter();
