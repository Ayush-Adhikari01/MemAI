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

// Fallback model cascade for resilience against 503 / high demand spikes
const FALLBACK_MODELS = [
  config.gemini.model || 'gemini-2.5-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

/**
 * Sleep helper for retry delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a conversational response using Gemini with automatic retries and model fallbacks
 * @param {Object} params
 * @param {string} params.systemInstruction Dynamic system prompt with memory
 * @param {Array<{role: string, content: string}>} params.history Conversation turns
 * @param {string} params.userMessage Latest user message
 * @param {boolean} params.stream Whether to stream chunks
 * @param {function} params.onChunk Callback for streaming
 * @returns {Promise<string>} Full response text
 */
export const generateGeminiResponse = async ({
  systemInstruction,
  history = [],
  userMessage,
  stream = false,
  onChunk = null
}) => {
  const ai = getGenAI();

  // Convert history to Gemini format (user / model)
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  let lastError = null;

  // Try configured model, then fallback models
  for (const modelName of FALLBACK_MODELS) {
    // Retry up to 2 times per model if hitting temporary 503 or 429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = ai.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction || undefined,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });

        const chat = model.startChat({
          history: formattedHistory
        });

        if (stream && onChunk) {
          const result = await chat.sendMessageStream(userMessage);
          let fullText = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(chunkText);
          }
          return fullText;
        } else {
          const result = await chat.sendMessage(userMessage);
          return result.response.text();
        }
      } catch (err) {
        lastError = err;
        const isTemporary = err.message?.includes('503') ||
                            err.message?.includes('429') ||
                            err.message?.includes('high demand') ||
                            err.message?.includes('overloaded');

        if (isTemporary) {
          console.warn(`⚠️ Model ${modelName} attempt ${attempt + 1} hit temporary rate limit / 503. Retrying/Switching fallback...`);
          await sleep(600 * (attempt + 1));
          continue; // Try next attempt or next model
        } else {
          // If not temporary 503, break out to try next fallback model
          break;
        }
      }
    }
  }

  throw lastError || new Error('All AI model attempts failed.');
};

/**
 * Perform structured JSON extraction using Gemini with fallbacks
 * @param {Object} params
 * @param {string} params.systemInstruction
 * @param {string} params.prompt
 * @returns {Promise<any>} Parsed JSON object
 */
export const generateStructuredJson = async ({ systemInstruction, prompt }) => {
  const ai = getGenAI();

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || 'You are an accurate semantic information extractor. Always respond in valid JSON.',
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        }
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        return JSON.parse(responseText);
      } catch (err) {
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      }
    } catch (err) {
      const isTemporary = err.message?.includes('503') ||
                          err.message?.includes('429') ||
                          err.message?.includes('high demand');
      if (isTemporary) {
        await sleep(500);
        continue;
      }
      console.warn(`Extraction failed on ${modelName}:`, err.message);
    }
  }

  return { shouldExtract: false, memories: [] };
};
