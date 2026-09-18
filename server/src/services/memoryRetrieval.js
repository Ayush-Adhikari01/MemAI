import { db } from '../database/supabaseAdapter.js';
import { generateEmbedding } from './embeddings.js';
import { config } from '../config/env.js';

/**
 * Calculate multi-factor hybrid relevance score for a retrieved memory
 * Formula:
 * Score = (0.45 * similarity) + (0.20 * normalizedImportance) + (0.15 * recencyScore) + (0.10 * confidence) + (0.10 * usageFrequencyScore)
 */
function calculateRelevanceScore(memory) {
  const similarity = memory.similarity || 0.5;
  const normalizedImportance = ((memory.importance || 3) - 1) / 4; // 1..5 -> 0..1
  const confidence = memory.confidence !== undefined ? memory.confidence : 1.0;

  // Recency score (decays gently over 30 days)
  const now = new Date().getTime();
  const createdDate = new Date(memory.created_at || now).getTime();
  const daysOld = Math.max(0, (now - createdDate) / (1000 * 60 * 60 * 24));
  const recencyScore = Math.exp(-daysOld / 60); // Half-life ~42 days

  // Usage frequency score (logarithmic boost)
  const accessCount = memory.access_count || 0;
  const usageFrequencyScore = Math.min(1.0, Math.log10(accessCount + 1) / 2);

  const finalScore = (
    (0.45 * similarity) +
    (0.20 * normalizedImportance) +
    (0.15 * recencyScore) +
    (0.10 * confidence) +
    (0.10 * usageFrequencyScore)
  );

  return Math.round(finalScore * 1000) / 1000;
}

/**
 * Retrieve the most relevant long-term memories for a given user query
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.query Latest user message
 * @param {number} [params.maxResults] Maximum memories to return
 * @param {number} [params.threshold] Minimum similarity threshold
 * @returns {Promise<Array<Object>>} Ranked list of memories
 */
export const retrieveRelevantMemories = async ({
  userId,
  query,
  maxResults = config.memory.maxRetrieved,
  threshold = config.memory.similarityThreshold
}) => {
  if (!userId || !query || !query.trim()) {
    return [];
  }

  try {
    // 1. Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // 2. Perform vector search in database using pgvector
    const matchedMemories = await db.searchMemoriesByVector(
      queryEmbedding,
      threshold,
      maxResults * 2, // Fetch double to re-rank with metadata
      userId
    );

    if (!matchedMemories || matchedMemories.length === 0) {
      return [];
    }

    // 3. Compute hybrid scores & rank
    const scoredMemories = matchedMemories
      .map(mem => ({
        ...mem,
        relevanceScore: calculateRelevanceScore(mem)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    // 4. Record usage in background
    const memoryIds = scoredMemories.map(m => m.id);
    db.recordMemoryUsage(memoryIds).catch(err => {
      console.warn('Failed to record memory usage stats:', err.message);
    });

    return scoredMemories;
  } catch (error) {
    console.error('Error during memory retrieval:', error.message);
    // Graceful degradation: return empty array so chat continues even if retrieval fails
    return [];
  }
};
