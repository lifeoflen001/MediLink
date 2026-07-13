import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch } from 'expo/fetch';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const SYSTEM_NOTE: ChatMessage = {
  id: 'system-note',
  role: 'assistant',
  content:
    'Hello! I am MediConnect AI, your personal healthcare assistant. I can help you:\n\n• Understand medicines and dosages\n• Explain symptoms and when to seek care\n• Guide you to nearby healthcare services\n\nPlease note: I provide general health information only. Always consult a qualified healthcare professional for medical advice.',
  timestamp: new Date().toISOString(),
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([SYSTEM_NOTE]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('chatHistory').then(data => {
      if (data) {
        try {
          const saved = JSON.parse(data) as ChatMessage[];
          if (saved.length > 0) setMessages(saved);
        } catch {}
      }
    });
  }, []);

  const persistMessages = useCallback((msgs: ChatMessage[]) => {
    AsyncStorage.setItem('chatHistory', JSON.stringify(msgs.slice(0, 50)));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const assistantId = Date.now().toString() + '_assistant';
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => {
      const updated = [assistantMsg, userMsg, ...prev];
      return updated;
    });
    setIsStreaming(true);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const url = `https://${domain}/api/ai/chat`;

      // Build message history for the API (chronological order)
      const historyForAPI = [...messages]
        .reverse()
        .filter(m => m.id !== 'system-note')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForAPI }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Network error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              );
            }
            if (parsed.done || parsed.error) break;
          } catch {}
        }
      }

      setMessages(prev => {
        persistMessages(prev);
        return prev;
      });
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I could not connect to the AI service. Please check your connection and try again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, persistMessages]);

  const clearChat = useCallback(() => {
    setMessages([SYSTEM_NOTE]);
    AsyncStorage.removeItem('chatHistory');
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isStreaming, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
