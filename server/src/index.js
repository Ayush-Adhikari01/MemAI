import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

import chatRoutes from './routes/chatRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Security & Middleware
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api/', apiRateLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!config.gemini.apiKey,
    supabaseConfigured: !!(config.supabase.url && config.supabase.serviceRoleKey)
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
=====================================================
🚀 AI Long-Term Memory Server running on port ${PORT}
🌍 Environment: ${config.nodeEnv}
🤖 Gemini Model: ${config.gemini.model}
🧠 Embedding Model: ${config.gemini.embeddingModel}
📡 Client Origin: ${config.clientUrl}
=====================================================
  `);
});
