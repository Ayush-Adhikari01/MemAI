import { db } from '../database/supabaseAdapter.js';
import { generateEmbedding } from '../services/embeddings.js';

export const getMemories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, status, search, limit = 50, offset = 0 } = req.query;

    const result = await db.getMemories(userId, {
      type,
      status: status || 'active',
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    res.json({
      success: true,
      memories: result.memories,
      total: result.total
    });
  } catch (error) {
    next(error);
  }
};

export const createMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content, memoryType, importance = 3, confidence = 1.0 } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Memory content cannot be empty' });
    }

    // Generate vector embedding for manual memory
    const embedding = await generateEmbedding(content.trim());

    const memory = await db.createMemory({
      userId,
      content: content.trim(),
      memoryType: memoryType || 'fact',
      importance: parseInt(importance, 10),
      confidence: parseFloat(confidence),
      status: 'active',
      embedding,
      metadata: { manuallyCreated: true }
    });

    res.status(201).json({ success: true, memory });
  } catch (error) {
    next(error);
  }
};

export const updateMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content, memoryType, importance, confidence, status } = req.body;

    const updates = {};
    if (content !== undefined && content.trim()) {
      updates.content = content.trim();
      // Re-generate vector embedding if content changed
      updates.embedding = await generateEmbedding(content.trim());
    }
    if (memoryType !== undefined) updates.memory_type = memoryType;
    if (importance !== undefined) updates.importance = parseInt(importance, 10);
    if (confidence !== undefined) updates.confidence = parseFloat(confidence);
    if (status !== undefined) updates.status = status;

    const updated = await db.updateMemory(id, userId, updates);
    res.json({ success: true, memory: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMemory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.deleteMemory(id, userId);
    res.json({ success: true, message: 'Memory removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const clearAllMemories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await db.deleteAllMemories(userId);
    res.json({ success: true, message: 'All memories cleared successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMemoryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { memories } = await db.getMemories(userId, { status: 'all', limit: 500 });

    const stats = {
      total: memories.length,
      active: memories.filter(m => m.status === 'active').length,
      outdated: memories.filter(m => m.status === 'outdated').length,
      byType: {
        fact: memories.filter(m => m.memory_type === 'fact' && m.status === 'active').length,
        preference: memories.filter(m => m.memory_type === 'preference' && m.status === 'active').length,
        project: memories.filter(m => m.memory_type === 'project' && m.status === 'active').length,
        relationship: memories.filter(m => m.memory_type === 'relationship' && m.status === 'active').length,
        event: memories.filter(m => m.memory_type === 'event' && m.status === 'active').length,
        skill: memories.filter(m => m.memory_type === 'skill' && m.status === 'active').length,
        instruction: memories.filter(m => m.memory_type === 'instruction' && m.status === 'active').length,
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};
