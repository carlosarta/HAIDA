/**
 * ChatMessage Component
 * Componente optimizado para mensajes de chat
 */

import { memo } from 'react';
import { Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import type { Message } from '@/app/types/chat.types';
import { MESSAGE_ROLE, MESSAGE_STATUS } from '@/app/constants/chat.constants';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === MESSAGE_ROLE.USER;
  const isError = message.status === MESSAGE_STATUS.ERROR;
  const isSending = message.status === MESSAGE_STATUS.SENDING;

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg animate-in fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn('h-8 w-8 shrink-0', isUser && 'bg-primary')}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 space-y-2 max-w-[80%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground',
            isError && 'bg-destructive/10 text-destructive border border-destructive/20'
          )}
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to send message</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          )}
        </div>

        {/* Metadata */}
        {message.metadata && !isSending && !isError && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            {message.metadata.model && (
              <span className="opacity-60">{message.metadata.model}</span>
            )}
            {message.metadata.tokens && (
              <>
                <span>•</span>
                <span className="opacity-60">{message.metadata.tokens} tokens</span>
              </>
            )}
            <span>•</span>
            <span className="opacity-60">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
