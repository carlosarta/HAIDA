/**
 * useChat Hook
 * Hook optimizado para el módulo Chat/IA
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { Message, Conversation, SendMessageParams } from '@/app/types/chat.types';
import { MESSAGE_ROLE, MESSAGE_STATUS, CHAT_MODES } from '@/app/constants/chat.constants';

const MOCK_RESPONSES: Record<string, string> = {
  default: "I'm your QA assistant. I can help you with test cases, automation scripts, code reviews, and more!",
  test: "Here's a sample test case structure:\n\n**Test Case ID:** TC-001\n**Title:** User Login\n**Steps:**\n1. Navigate to login page\n2. Enter valid credentials\n3. Click login button\n**Expected:** User is redirected to dashboard",
  automation: "Here's a basic Selenium WebDriver script:\n\n```python\nfrom selenium import webdriver\n\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\ndriver.find_element_by_id('username').send_keys('test')\n```",
  review: "Code review findings:\n✅ Good practices:\n- Clean code structure\n- Proper error handling\n\n⚠️ Suggestions:\n- Add input validation\n- Consider edge cases",
};

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active conversation (memoizado)
  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  // Create new conversation
  const createConversation = useCallback((mode = CHAT_MODES.COPILOT) => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Conversation',
      messages: [],
      mode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, []);

  // Send message
  const sendMessage = useCallback(async (params: SendMessageParams) => {
    const { content, conversationId, mode = CHAT_MODES.COPILOT } = params;

    if (!content.trim()) return;

    let targetConvId = conversationId || activeConversationId;

    // Create conversation if none exists
    if (!targetConvId) {
      const newConv = createConversation(mode);
      targetConvId = newConv.id;
    }

    // User message
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: MESSAGE_ROLE.USER,
      content: content.trim(),
      timestamp: new Date(),
      status: MESSAGE_STATUS.SENDING,
    };

    // Add user message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === targetConvId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: new Date(),
              title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
            }
          : conv
      )
    );

    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Generate response based on content
      let responseText = MOCK_RESPONSES.default;
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('test case') || lowerContent.includes('test')) {
        responseText = MOCK_RESPONSES.test;
      } else if (lowerContent.includes('automat') || lowerContent.includes('script')) {
        responseText = MOCK_RESPONSES.automation;
      } else if (lowerContent.includes('review') || lowerContent.includes('code')) {
        responseText = MOCK_RESPONSES.review;
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: MESSAGE_ROLE.ASSISTANT,
        content: responseText,
        timestamp: new Date(),
        status: MESSAGE_STATUS.SENT,
        metadata: {
          model: 'gpt-4',
          tokens: Math.floor(responseText.length / 4),
        },
      };

      // Mark user message as sent and add assistant response
      setConversations(prev =>
        prev.map(conv =>
          conv.id === targetConvId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.map(m =>
                    m.id === userMessage.id
                      ? { ...m, status: MESSAGE_STATUS.SENT }
                      : m
                  ),
                  assistantMessage,
                ],
                updatedAt: new Date(),
              }
            : conv
        )
      );
    } catch (error) {
      toast.error('Failed to send message');
      
      // Mark message as error
      setConversations(prev =>
        prev.map(conv =>
          conv.id === targetConvId
            ? {
                ...conv,
                messages: conv.messages.map(m =>
                  m.id === userMessage.id
                    ? { ...m, status: MESSAGE_STATUS.ERROR }
                    : m
                ),
              }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, createConversation]);

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
    toast.success('Conversation deleted');
  }, [activeConversationId]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
    toast.success('All conversations cleared');
  }, []);

  return {
    // Data
    conversations,
    activeConversation,
    isLoading,

    // Actions
    createConversation,
    sendMessage,
    deleteConversation,
    clearAllConversations,
    setActiveConversationId,
  };
}
