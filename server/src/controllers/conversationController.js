import { db } from '../database/supabaseAdapter.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await db.getConversations(userId);
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await db.getConversationById(id, userId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db.getMessages(id, userId, 100);
    res.json({ success: true, conversation, messages });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    const conversation = await db.createConversation(userId, title || 'New Conversation');
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, is_pinned } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (is_pinned !== undefined) updates.is_pinned = is_pinned;

    const updated = await db.updateConversation(id, userId, updates);
    res.json({ success: true, conversation: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.deleteConversation(id, userId);
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
};
