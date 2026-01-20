/**
 * Chat Constants
 * Constantes específicas del módulo Chat/IA
 */

export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  ERROR: 'error',
} as const;

export const CHAT_MODES = {
  COPILOT: 'copilot',
  QA_ASSISTANT: 'qa_assistant',
  CODE_REVIEW: 'code_review',
  TEST_GENERATION: 'test_generation',
} as const;

export const CHAT_MODE_CONFIG = {
  [CHAT_MODES.COPILOT]: {
    label: 'Copilot',
    description: 'General assistant for QA tasks',
    icon: 'MessageSquare',
    placeholder: 'Ask me anything about QA...',
  },
  [CHAT_MODES.QA_ASSISTANT]: {
    label: 'QA Assistant',
    description: 'Specialized in test cases and scenarios',
    icon: 'FileCheck',
    placeholder: 'Help me create test cases...',
  },
  [CHAT_MODES.CODE_REVIEW]: {
    label: 'Code Review',
    description: 'Analyze code for quality issues',
    icon: 'Code',
    placeholder: 'Review this code...',
  },
  [CHAT_MODES.TEST_GENERATION]: {
    label: 'Test Generation',
    description: 'Generate automated tests',
    icon: 'Sparkles',
    placeholder: 'Generate tests for...',
  },
} as const;

export const SUGGESTED_PROMPTS = [
  'Generate test cases for login flow',
  'Review API endpoints for security',
  'Create automation script for regression',
  'Suggest test scenarios for payment',
] as const;

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_CONVERSATION_HISTORY = 50;
export const TYPING_INDICATOR_DELAY = 300;
