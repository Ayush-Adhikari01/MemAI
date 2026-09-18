import { config } from '../config/env.js';
import { generateGroqResponse, generateStructuredJsonWithGroq } from './groq.js';
import { generateGeminiResponse, generateStructuredJson } from './gemini.js';

/**
 * Generate chat response using configured primary AI provider with automatic fallback
 */
export const generateAIResponse = async (params) => {
  const preferGroq = config.aiProvider === 'groq' && Boolean(config.groq.apiKey);

  if (preferGroq) {
    try {
      return await generateGroqResponse(params);
    } catch (groqErr) {
      console.warn('⚠️ Groq generation failed, falling back to Gemini:', groqErr.message);
      return await generateGeminiResponse(params);
    }
  } else {
    try {
      return await generateGeminiResponse(params);
    } catch (geminiErr) {
      if (config.groq.apiKey) {
        console.warn('⚠️ Gemini generation failed, falling back to Groq:', geminiErr.message);
        return await generateGroqResponse(params);
      }
      throw geminiErr;
    }
  }
};

/**
 * Extract structured JSON using primary provider with automatic fallback
 */
export const extractStructuredAIJson = async (params) => {
  const preferGroq = config.aiProvider === 'groq' && Boolean(config.groq.apiKey);

  if (preferGroq) {
    try {
      return await generateStructuredJsonWithGroq(params);
    } catch (groqErr) {
      console.warn('⚠️ Groq extraction failed, falling back to Gemini:', groqErr.message);
      return await generateStructuredJson(params);
    }
  } else {
    try {
      return await generateStructuredJson(params);
    } catch (geminiErr) {
      if (config.groq.apiKey) {
        console.warn('⚠️ Gemini extraction failed, falling back to Groq:', geminiErr.message);
        return await generateStructuredJsonWithGroq(params);
      }
      return { shouldExtract: false, memories: [] };
    }
  }
};
