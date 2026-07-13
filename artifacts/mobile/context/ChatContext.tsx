import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch } from 'expo/fetch';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
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

function friendlyError(message: string): string {
  if (message.includes('insufficient_quota') || message.includes('quota')) {
    return 'The AI service is temporarily unavailable — the API key has exceeded its usage quota. Please check OpenAI billing at platform.openai.com.';
  }
  if (message.includes('invalid_api_key') || message.includes('Incorrect API key')) {
    return 'The AI service is not configured correctly. Please check the OpenAI API key in the environment secrets.';
  }
  if (message.includes('rate_limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (message.includes('timeout') || message.includes('network') || message.includes('NETWORK')) {
    return 'Could not reach the AI service. Please check your internet connection and try again.';
  }
  return message || 'Something went wrong. Please try again.';
}

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

    // Capture current messages snapshot for API history BEFORE state update
    setMessages(prev => {
      const updated = [assistantMsg, userMsg, ...prev];
      return updated;
    });
    setIsStreaming(true);

    const setAssistantContent = (content: string, isError = false) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, content, isError } : m
        )
      );
    };

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!domain) {
        setAssistantContent('AI service is not configured. EXPO_PUBLIC_DOMAIN is missing.', true);
        return;
      }

      const url = `https://${domain}/api/ai/chat`;

      // Build chronological history for the API (oldest first)
      const historyForAPI = [...messages]
        .reverse()
        .filter(m => m.id !== 'system-note' && !m.isError)
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyForAPI }),
        });
      } catch (networkErr) {
        setAssistantContent(
          'Could not connect to the AI service. Make sure the API server is running and try again.',
          true
        );
        return;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        setAssistantContent(friendlyError(text), true);
        return;
      }

      if (!response.body) {
        setAssistantContent('No response from the AI service.', true);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let receivedError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as {
              content?: string;
              done?: boolean;
              error?: string;
            };

            if (parsed.error) {
              receivedError = parsed.error;
              break;
            }
            if (parsed.content) {
              fullContent += parsed.content;
              setAssistantContent(fullContent);
            }
            if (parsed.done) break;
          } catch {}
        }

        if (receivedError) break;
      }

      if (receivedError) {
        setAssistantContent(friendlyError(receivedError), true);
      } else if (!fullContent) {
        setAssistantContent('The AI returned an empty response. Please try again.', true);
      }

      // Persist after streaming completes
      setMessages(prev => {
        persistMessages(prev);
        return prev;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setAssistantContent(friendlyError(message), true);
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
