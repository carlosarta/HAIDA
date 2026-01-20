/**
 * Chat Types
 * Tipos TypeScript para el módulo Chat/IA
 */

import { MESSAGE_ROLE, MESSAGE_STATUS, CHAT_MODES } from '@/app/constants/chat.constants';

export type MessageRole = typeof MESSAGE_ROLE[keyof typeof MESSAGE_ROLE];
export type MessageStatus = typeof MESSAGE_STATUS[keyof typeof MESSAGE_STATUS];
export type ChatMode = typeof CHAT_MODES[keyof typeof CHAT_MODES];

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  metadata?: {
    tokens?: number;
    model?: string;
    error?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ChatContextData {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageParams {
  content: string;
  conversationId?: string;
  mode?: ChatMode;
}

export interface ChatSuggestion {
  id: string;
  text: string;
  category?: 'test' | 'review' | 'automation' | 'general';
}
