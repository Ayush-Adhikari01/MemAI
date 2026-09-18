import React, { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem.jsx';
import { MessageInput } from './MessageInput.jsx';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { Sparkles, Brain } from 'lucide-react';
import { AIAvatar } from './AIAvatar.jsx';

export const ChatArea = () => {
  const {
    messages,
    isGenerating,
    sendMessage,
    regenerateLastResponse,
    editAndResend
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Scrollable Message List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={sendMessage} />
        ) : (
          <div className="py-6 space-y-1">
            {messages.map((msg, idx) => (
              <MessageItem
                key={msg.id || idx}
                message={msg}
                index={idx}
                isLast={idx === messages.length - 1}
                isGenerating={isGenerating}
                onEdit={editAndResend}
                onRegenerate={regenerateLastResponse}
              />
            ))}

            {/* AI Synthesizing / Thinking Indicator */}
            {isGenerating && (
              <div className="py-6 px-4 sm:px-8 bg-white/[0.015]">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                  <AIAvatar size="md" isThinking={true} />
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-2 font-mono text-xs text-violet-300/80">
                      Accessing cognitive memory & synthesizing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        isGenerating={isGenerating}
        onStop={() => {}}
      />
    </div>
  );
};
