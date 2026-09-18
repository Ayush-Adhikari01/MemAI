import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // AI Provider config
  aiProvider: process.env.AI_PROVIDER || 'groq', // 'groq' or 'gemini'
  
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    fastModel: process.env.GROQ_FAST_MODEL || 'qwen/qwen3.8-27b',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  },
  
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  },
  
  memory: {
    similarityThreshold: parseFloat(process.env.MEMORY_SIMILARITY_THRESHOLD || '0.45'),
    maxRetrieved: parseInt(process.env.MEMORY_MAX_RETRIEVED || '5', 10),
    autoExtract: process.env.MEMORY_AUTO_EXTRACT !== 'false',
  }
};
