import Groq from 'groq-sdk';
import { config } from '../config/env.js';

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    if (!config.groq.apiKey) {
      throw new Error('GROQ_API_KEY is not configured in .env');
    }
    groqClient = new Groq({ apiKey: config.groq.apiKey });
  }
  return groqClient;
};

/**
 * Generate chat response using Groq ultra-fast LLM
 */
export const generateGroqResponse = async ({
  systemInstruction,
  history = [],
  userMessage,
  stream = false,
  onChunk = null
}) => {
  const groq = getGroqClient();
  const model = config.groq.model || 'openai/gpt-oss-120b';

  const messages = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  for (const turn of history) {
    messages.push({
      role: turn.role === 'user' ? 'user' : 'assistant',
      content: turn.content
    });
  }

  messages.push({ role: 'user', content: userMessage });

  if (stream && onChunk) {
    const streamCompletion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true
    });

    let fullText = '';
    for await (const chunk of streamCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }
    return fullText;
  } else {
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content || '';
  }
};

/**
 * Perform structured JSON extraction with Groq
 */
export const generateStructuredJsonWithGroq = async ({ systemInstruction, prompt }) => {
  const groq = getGroqClient();
  const model = config.groq.fastModel || 'qwen/qwen3.8-27b';

  const messages = [
    { role: 'system', content: `${systemInstruction}\nReturn output ONLY in valid JSON format without markdown code fences.` },
    { role: 'user', content: prompt }
  ];

  try {
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (err) {
    // Fallback parsing
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.1
    });
    const text = completion.choices[0]?.message?.content || '{}';
    const clean = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  }
};
