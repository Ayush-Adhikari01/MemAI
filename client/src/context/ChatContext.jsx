import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [recentMemoriesUsed, setRecentMemoriesUsed] = useState([]);

  // Load conversations when user changes
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getConversations();
      if (res && res.conversations) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err.message);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when currentConversationId changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.getConversation(currentConversationId);
        if (res && res.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error('Failed to load conversation messages:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadMessages();
  }, [currentConversationId]);

  // Select a conversation
  const selectConversation = (id) => {
    setCurrentConversationId(id);
    setError(null);
  };

  // Start a new chat
  const newChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
    setRecentMemoriesUsed([]);
  };

  // Send a message
  const sendMessage = async (text) => {
    if (!text || !text.trim() || isGenerating) return;

    const trimmed = text.trim();
    setError(null);

    // Optimistic user message preview
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsGenerating(true);

    try {
      const res = await api.sendMessage({
        message: trimmed,
        conversationId: currentConversationId || undefined
      });

      if (res && res.success) {
        // If it was a new conversation, update state and URL/list
        if (res.isNewConversation || !currentConversationId) {
          setCurrentConversationId(res.conversationId);
          await loadConversations();
        }

        // Replace temp message with server record & append assistant response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, res.userMessage, res.assistantMessage];
        });

        if (res.memoriesUsed && res.memoriesUsed.length > 0) {
          setRecentMemoriesUsed(res.memoriesUsed);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      // Rollback optimistic message or mark with error
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Unable to generate response. Please check your Gemini API key.'}`,
          isError: true,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate last assistant response
  const regenerateLastResponse = async () => {
    if (messages.length === 0 || isGenerating) return;

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserMessage = messages[lastUserIndex].content;
    // Trim back to the user message
    setMessages(prev => prev.slice(0, lastUserIndex + 1));
    setIsGenerating(true);

    try {
      const res = await api.sendMessage({
        message: lastUserMessage,
        conversationId: currentConversationId || undefined
      });

      if (res && res.success) {
        setMessages(prev => [...prev.slice(0, lastUserIndex), res.userMessage, res.assistantMessage]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit user message and resend
  const editAndResend = async (messageIndex, newText) => {
    if (isGenerating || !newText.trim()) return;

    // Slice messages up to the edited message
    setMessages(prev => prev.slice(0, messageIndex));
    await sendMessage(newText);
  };

  // Delete conversation
  const deleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        newChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Rename conversation
  const renameConversation = async (id, newTitle) => {
    try {
      const res = await api.updateConversation(id, { title: newTitle });
      if (res?.conversation) {
        setConversations(prev => prev.map(c => c.id === id ? res.conversation : c));
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      messages,
      loadingHistory,
      isGenerating,
      error,
      recentMemoriesUsed,
      sendMessage,
      selectConversation,
      newChat,
      deleteConversation,
      renameConversation,
      regenerateLastResponse,
      editAndResend,
      loadConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
