/**
 * Abstract Database Adapter Interface
 * Enables swapping database implementations (Supabase, PostgreSQL/Prisma, MongoDB, etc.)
 */
export class DatabaseAdapter {
  async getUserProfile(userId) { throw new Error('Not implemented'); }
  async updateUserProfile(userId, data) { throw new Error('Not implemented'); }
  
  async getConversations(userId) { throw new Error('Not implemented'); }
  async getConversationById(conversationId, userId) { throw new Error('Not implemented'); }
  async createConversation(userId, title) { throw new Error('Not implemented'); }
  async updateConversation(conversationId, userId, data) { throw new Error('Not implemented'); }
  async deleteConversation(conversationId, userId) { throw new Error('Not implemented'); }
  
  async getMessages(conversationId, userId, limit = 50) { throw new Error('Not implemented'); }
  async createMessage(data) { throw new Error('Not implemented'); }
  
  async getMemories(userId, filters = {}) { throw new Error('Not implemented'); }
  async getMemoryById(memoryId, userId) { throw new Error('Not implemented'); }
  async createMemory(data) { throw new Error('Not implemented'); }
  async updateMemory(memoryId, userId, data) { throw new Error('Not implemented'); }
  async deleteMemory(memoryId, userId) { throw new Error('Not implemented'); }
  async deleteAllMemories(userId) { throw new Error('Not implemented'); }
  
  async searchMemoriesByVector(queryEmbedding, threshold = 0.5, limit = 10, userId = null) { throw new Error('Not implemented'); }
  async recordMemoryUsage(memoryIds) { throw new Error('Not implemented'); }
}
