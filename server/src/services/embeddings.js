import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return genAI;
};

/**
 * Generate a 768-dimensional vector embedding for text using Google Gemini
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error('Text is required to generate embedding');
  }

  try {
    const ai = getGenAI();
    const modelName = config.gemini.embeddingModel || 'gemini-embedding-001';
    const model = ai.getGenerativeModel({ model: modelName });
    
    // Request 768 dimensions to match PostgreSQL vector(768)
    const result = await model.embedContent({
      content: { parts: [{ text: text.trim() }] },
      outputDimensionality: 768
    });
    
    if (!result || !result.embedding || !result.embedding.values) {
      throw new Error('Failed to retrieve vector values from Gemini Embedding API');
    }

    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error.message);
    throw error;
  }
};

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts 
 * @returns {Promise<number[][]>}
 */
export const generateBatchEmbeddings = async (texts) => {
  const cleanTexts = texts.filter(t => t && t.trim());
  if (cleanTexts.length === 0) return [];

  const embeddings = [];
  for (const text of cleanTexts) {
    const emb = await generateEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
};
