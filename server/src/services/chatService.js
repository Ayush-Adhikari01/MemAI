import { db } from '../database/supabaseAdapter.js';
import { generateAIResponse } from './aiProvider.js';
import { retrieveRelevantMemories } from './memoryRetrieval.js';
import { extractMemoriesFromInteraction } from './memoryExtraction.js';
import { config } from '../config/env.js';

/**
 * Process a user chat message with full long-term memory retrieval and extraction
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} [params.conversationId]
 * @param {string} params.message
 * @param {boolean} [params.stream]
 * @param {function} [params.onStreamChunk]
 * @returns {Promise<Object>} Response data with assistant message and memory telemetry
 */
export const processChatMessage = async ({
  userId,
  conversationId,
  message,
  stream = false,
  onStreamChunk = null
}) => {
  if (!message || !message.trim()) {
    throw new Error('Message content cannot be empty');
  }

  // 1. Get or create conversation
  let activeConversationId = conversationId;
  let isNewConversation = false;

  if (!activeConversationId) {
    // Generate initial title from first message
    const initialTitle = message.length > 40 ? `${message.substring(0, 37)}...` : message;
    const newConv = await db.createConversation(userId, initialTitle);
    activeConversationId = newConv.id;
    isNewConversation = true;
  }

  // 2. Fetch User Profile to check memory preferences
  let userProfile = null;
  try {
    userProfile = await db.getUserProfile(userId);
  } catch (err) {
    console.warn('Could not fetch user profile, using defaults:', err.message);
  }

  const memoryEnabled = userProfile ? userProfile.memory_enabled !== false : true;

  // 3. Retrieve relevant long-term memories
  let retrievedMemories = [];
  if (memoryEnabled) {
    retrievedMemories = await retrieveRelevantMemories({
      userId,
      query: message,
      maxResults: config.memory.maxRetrieved,
      threshold: config.memory.similarityThreshold
    });
  }

  // 4. Save user message to database
  const userMessageRecord = await db.createMessage({
    conversationId: activeConversationId,
    userId,
    role: 'user',
    content: message,
    memoriesUsed: retrievedMemories.map(m => ({ id: m.id, content: m.content, score: m.relevanceScore }))
  });

  // 5. Fetch recent conversation messages for short-term context (last 15)
  const conversationHistory = await db.getMessages(activeConversationId, userId, 15);
  // Exclude current message since startChat/sendMessage handles it
  const priorHistory = conversationHistory
    .filter(msg => msg.id !== userMessageRecord.id)
    .map(msg => ({ role: msg.role, content: msg.content }));

  // 6. Construct dynamic System Prompt with retrieved memories
  let memoryPromptSection = 'No prior memories found for this topic.';
  if (retrievedMemories.length > 0) {
    memoryPromptSection = retrievedMemories
      .map((m, idx) => `${idx + 1}. [${m.memory_type?.toUpperCase() || 'FACT'}] ${m.content} (Confidence: ${m.confidence || 1.0})`)
      .join('\n');
  }

  const customInstructions = userProfile?.custom_instructions || '';

  const systemInstruction = `You are a helpful, knowledgeable, and empathetic AI assistant with a persistent long-term memory system.

=== RETRIEVED LONG-TERM USER MEMORIES ===
${memoryPromptSection}
=========================================
${customInstructions ? `\nUSER CUSTOM INSTRUCTIONS:\n${customInstructions}\n` : ''}
CORE GUIDELINES:
1. Naturally weave stored memories into your responses when relevant to provide personalized, accurate assistance.
2. DO NOT awkwardly announce your memories (e.g. avoid robotic phrasing like "Based on my memory database entry..."). Just answer naturally like a thoughtful human companion.
3. DO NOT fabricate or hallucinate memories that were never stored.
4. If the user's latest statement contradicts an older memory, immediately prioritize the user's latest statement.
5. If the user asks what you remember about them or asks you to remember something, respond directly and clearly.
6. Keep your formatting clean, using GitHub-flavored Markdown and code syntax highlighting when writing code.`;

  // 7. Generate AI response (Groq or Gemini)
  let assistantContent = '';
  try {
    assistantContent = await generateAIResponse({
      systemInstruction,
      history: priorHistory,
      userMessage: message,
      stream,
      onChunk: onStreamChunk
    });
  } catch (aiError) {
    console.error('Chat generation error:', aiError);
    throw new Error(`AI generation failed: ${aiError.message}`);
  }

  // 8. Save assistant response to database
  const assistantMessageRecord = await db.createMessage({
    conversationId: activeConversationId,
    userId,
    role: 'assistant',
    content: assistantContent,
    memoriesUsed: retrievedMemories.map(m => ({
      id: m.id,
      content: m.content,
      type: m.memory_type,
      score: m.relevanceScore
    }))
  });

  // 9. Asynchronously extract new memories and resolve conflicts
  if (memoryEnabled && config.memory.autoExtract) {
    // Run in background so chat latency is minimal
    extractMemoriesFromInteraction({
      userId,
      conversationId: activeConversationId,
      messageId: userMessageRecord.id,
      userMessage: message,
      assistantResponse: assistantContent,
      existingMemories: retrievedMemories
    }).catch(err => {
      console.error('Background memory extraction error:', err);
    });
  }

  return {
    conversationId: activeConversationId,
    isNewConversation,
    userMessage: userMessageRecord,
    assistantMessage: assistantMessageRecord,
    memoriesUsed: retrievedMemories.map(m => ({
      id: m.id,
      content: m.content,
      type: m.memory_type,
      importance: m.importance,
      score: m.relevanceScore
    }))
  };
};
