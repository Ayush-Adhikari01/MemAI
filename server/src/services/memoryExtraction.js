import { db } from '../database/supabaseAdapter.js';
import { generateEmbedding } from './embeddings.js';
import { extractStructuredAIJson } from './aiProvider.js';

const EXTRACTION_SYSTEM_INSTRUCTION = `You are an expert cognitive memory manager for an intelligent AI assistant.
Your job is to analyze user-AI conversation turns and extract meaningful, long-term personal user information, preferences, projects, relationships, events, skills, or explicit instructions.

CRITICAL RULES FOR EXTRACTION:
1. Do NOT save temporary conversation chatter (e.g., "I'm hungry right now", "thanks", "hello", "what is 2+2?").
2. DO save enduring facts, preferences, technical stacks, project details, personal background, habits, or explicit user requests.
3. CONFLICT DETECTION: Check if any newly mentioned fact updates, replaces, or contradicts any existing active memory provided in the context (e.g., changing favorite language from Python to C).
4. CONFIDENCE ESTIMATION:
   - 0.90 to 1.0: Explicit statements or clear facts ("My name is Rahul", "Remember that I use Linux", "I am a CS student at VIT").
   - 0.50 to 0.75: Implicit or habitual preferences inferred from context.
   - Below 0.50: Tentative thoughts or passing musings ("I think I might try Vim someday") -> Do not store or set confidence < 0.5.
5. MEMORY TYPES:
   - "fact": Personal information, bio, name, location, school, job, hardware/OS.
   - "preference": Likes/dislikes, response styles, coding styles, food/music tastes.
   - "project": Apps, research, assignments, products being built by user.
   - "relationship": Family, friends, pets, colleagues mentioned.
   - "event": Meaningful milestones, exams, deadlines, achievements with dates/contexts.
   - "skill": Languages, frameworks, tools, topics the user is proficient in or learning.
   - "instruction": Specific directives on how the user likes the AI to behave (e.g., "Always provide C examples", "Be concise").

OUTPUT JSON FORMAT:
{
  "shouldExtract": boolean,
  "memories": [
    {
      "content": "Clear, concise, third-person declarative statement (e.g. 'User prefers C programming examples')",
      "memoryType": "fact" | "preference" | "project" | "relationship" | "event" | "skill" | "instruction",
      "importance": integer (1 to 5),
      "confidence": float (0.0 to 1.0),
      "isUpdateToExisting": boolean,
      "conflictsWithMemoryId": "UUID string if replacing an existing memory, otherwise null",
      "updateReason": "Why this replaces the older memory (or null)"
    }
  ]
}`;

/**
 * Analyze a conversation turn and extract new or updated memories
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.conversationId
 * @param {string} params.messageId
 * @param {string} params.userMessage
 * @param {string} params.assistantResponse
 * @param {Array<Object>} [params.existingMemories] Recently retrieved or active memories for conflict checking
 * @returns {Promise<Array<Object>>} Extracted memory records
 */
export const extractMemoriesFromInteraction = async ({
  userId,
  conversationId,
  messageId,
  userMessage,
  assistantResponse,
  existingMemories = []
}) => {
  if (!userId || !userMessage || userMessage.trim().length < 4) {
    return [];
  }

  try {
    const existingMemoriesSummary = existingMemories.length > 0
      ? existingMemories.map(m => `[ID: ${m.id}] (${m.memory_type || m.memoryType}) ${m.content}`).join('\n')
      : 'None';

    const prompt = `CONVERSATION TURN:
User: "${userMessage}"
AI: "${assistantResponse || ''}"

CURRENT ACTIVE MEMORIES IN SYSTEM:
${existingMemoriesSummary}

Extract any long-term memories, resolve any conflicts, and respond strictly in JSON matching the schema.`;

    const extractionResult = await extractStructuredAIJson({
      systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
      prompt
    });

    if (!extractionResult || !extractionResult.shouldExtract || !Array.isArray(extractionResult.memories)) {
      return [];
    }

    const savedMemories = [];

    for (const item of extractionResult.memories) {
      if (!item.content || item.confidence < 0.5) continue;

      // 1. Handle conflict/replacement
      if (item.isUpdateToExisting && item.conflictsWithMemoryId) {
        try {
          await db.updateMemory(item.conflictsWithMemoryId, userId, {
            status: 'outdated',
            metadata: {
              replacedByNewContent: item.content,
              reason: item.updateReason || 'Superseded by newer user statement',
              outdatedAt: new Date().toISOString()
            }
          });
        } catch (updateErr) {
          console.warn('Failed to mark existing memory outdated:', updateErr.message);
        }
      }

      // 2. Generate vector embedding for the new memory statement
      const embedding = await generateEmbedding(item.content);

      // 3. Save memory to database
      const createdMemory = await db.createMemory({
        userId,
        content: item.content,
        memoryType: item.memoryType || 'fact',
        importance: Math.min(5, Math.max(1, item.importance || 3)),
        confidence: Math.min(1.0, Math.max(0.0, item.confidence || 1.0)),
        status: 'active',
        embedding,
        sourceConversationId: conversationId,
        sourceMessageId: messageId,
        metadata: {
          extractedFrom: userMessage.substring(0, 150),
          updateReason: item.updateReason || null
        }
      });

      savedMemories.push(createdMemory);
    }

    return savedMemories;
  } catch (error) {
    console.error('Error during memory extraction:', error.message);
    return [];
  }
};
