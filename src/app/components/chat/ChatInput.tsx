/**
 * ChatInput Component
 * Componente optimizado para input de chat
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { MAX_MESSAGE_LENGTH } from '@/app/constants/chat.constants';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput = memo(({ onSend, isLoading = false, placeholder = 'Type your message...' }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, isLoading, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none pr-16"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
          />
          {message.length > MAX_MESSAGE_LENGTH * 0.8 && (
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {remainingChars}
            </div>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || isOverLimit}
          size="icon"
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> to send, 
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] ml-1">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
