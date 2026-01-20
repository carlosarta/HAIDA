/**
 * Chat Page - Optimized
 * Microsoft 365 Copilot style chat interface
 */

import { useCallback, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Mail, 
  Calendar, 
  FileText, 
  Users, 
  Home,
  Trash2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/app/components/ui/utils';
import { ChatMessage } from '@/app/components/chat/ChatMessage';
import { ChatInput } from '@/app/components/chat/ChatInput';
import { useChat } from '@/app/hooks/useChat';
import { CHAT_MODE_CONFIG, SUGGESTED_PROMPTS } from '@/app/constants/chat.constants';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';

const M365_APPS = [
  { id: 'home', name: 'Home', icon: Home, color: 'text-slate-600' },
  { id: 'copilot', name: 'Copilot', icon: Sparkles, color: 'text-purple-600' },
  { id: 'mail', name: 'Mail', icon: Mail, color: 'text-blue-600' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'text-green-600' },
  { id: 'teams', name: 'Teams', icon: Users, color: 'text-purple-700' },
  { id: 'files', name: 'Files', icon: FileText, color: 'text-orange-600' },
] as const;

export function Chat() {
  const {
    conversations,
    activeConversation,
    isLoading,
    createConversation,
    sendMessage,
    deleteConversation,
    setActiveConversationId,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const handleSendMessage = useCallback((content: string) => {
    sendMessage({ content });
  }, [sendMessage]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    sendMessage({ content: suggestion });
  }, [sendMessage]);

  const handleNewChat = useCallback(() => {
    createConversation();
  }, [createConversation]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Sidebar - Microsoft 365 Navigation */}
      <div className="w-12 bg-muted/30 border-r flex flex-col items-center py-4 gap-4">
        {M365_APPS.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                'hover:bg-background',
                app.id === 'copilot' && 'bg-background shadow-sm'
              )}
              title={app.name}
            >
              <Icon className={cn('h-5 w-5', app.color)} />
            </button>
          );
        })}
      </div>

      {/* Conversations Sidebar */}
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Copilot</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No conversations yet
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer group hover:bg-muted/50 transition-colors',
                    activeConversation?.id === conv.id && 'bg-muted'
                  )}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {conv.messages[conv.messages.length - 1]?.content || 'No messages'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {CHAT_MODE_CONFIG[conv.mode].label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {conv.messages.length} messages
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{activeConversation.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {CHAT_MODE_CONFIG[activeConversation.mode].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="max-w-4xl mx-auto space-y-4">
                {activeConversation.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Suggestions (only show after first assistant message) */}
                {activeConversation.messages.length === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
                    {SUGGESTED_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        className="p-3 text-left text-sm border rounded-lg hover:bg-muted/50 transition-colors"
                        onClick={() => handleSuggestionClick(prompt)}
                      >
                        <Sparkles className="h-4 w-4 inline mr-2 text-purple-600" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder={CHAT_MODE_CONFIG[activeConversation.mode].placeholder}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to HAIDA Copilot</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your AI-powered assistant for QA testing, automation, and documentation.
              Start a new conversation to get help with your tasks.
            </p>
            <Button onClick={handleNewChat} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 max-w-2xl w-full">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  className="p-4 text-left text-sm border rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    createConversation();
                    setTimeout(() => handleSuggestionClick(prompt), 100);
                  }}
                >
                  <Sparkles className="h-4 w-4 inline mr-2 text-purple-600" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
