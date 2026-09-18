import { processChatMessage } from '../services/chatService.js';

/**
 * Handle chat message processing
 * POST /api/chat
 * Body: { message: string, conversationId?: string, stream?: boolean }
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message, conversationId, stream } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    if (stream) {
      // Set SSE headers for streaming responses
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let firstChunk = true;

      const result = await processChatMessage({
        userId,
        conversationId,
        message: message.trim(),
        stream: true,
        onStreamChunk: (chunk) => {
          if (firstChunk) {
            firstChunk = false;
            // Send initial metadata
            res.write(`data: ${JSON.stringify({ type: 'start', conversationId })}\n\n`);
          }
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        }
      });

      // Send completion payload
      res.write(`data: ${JSON.stringify({
        type: 'done',
        conversationId: result.conversationId,
        isNewConversation: result.isNewConversation,
        assistantMessage: result.assistantMessage,
        memoriesUsed: result.memoriesUsed
      })}\n\n`);

      return res.end();
    } else {
      // Standard JSON response
      const result = await processChatMessage({
        userId,
        conversationId,
        message: message.trim(),
        stream: false
      });

      return res.status(200).json({
        success: true,
        conversationId: result.conversationId,
        isNewConversation: result.isNewConversation,
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage,
        memoriesUsed: result.memoriesUsed
      });
    }
  } catch (error) {
    next(error);
  }
};
