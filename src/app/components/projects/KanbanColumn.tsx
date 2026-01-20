/**
 * KanbanColumn Component
 * Componente optimizado para una columna del tablero Kanban
 */

import { memo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { TaskCard } from './TaskCard';
import { cn } from '@/app/components/ui/utils';
import type { Task, TaskStatus } from '@/app/types/project.types';
import { TASK_STATUS_CONFIG } from '@/app/constants/project.constants';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onCreateTask: (title: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanColumn = memo(({
  status,
  tasks,
  onCreateTask,
  onMoveTask,
}: KanbanColumnProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const config = TASK_STATUS_CONFIG[status];

  const handleCreateTask = useCallback(() => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  }, [newTaskTitle, onCreateTask]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle('');
    }
  }, [handleCreateTask]);

  return (
    <div
      className="flex-1 min-w-[280px] sm:min-w-[300px] flex flex-col h-full bg-muted/20 rounded-xl border border-border/50 overflow-hidden"
      role="region"
      aria-label={`${config.label} column`}
    >
      {/* Column Header */}
      <div className={cn('p-2.5 sm:p-3 border-b flex items-center justify-between bg-muted/30', config.borderClass)}>
        <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm">
          <div className={cn('h-2 w-2 rounded-full', `bg-${config.color}`)} />
          <span className="truncate">{config.label}</span>
          <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] h-5 px-1.5">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => setIsAdding(true)}
          aria-label={`Add task to ${config.label}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1 p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onMove={onMoveTask} />
          ))}

          {/* Quick Add Input */}
          {isAdding && (
            <div className="p-2 bg-background/50 border border-dashed rounded-lg animate-in fade-in">
              <Input
                placeholder="Type task title..."
                className="h-8 text-xs border-none shadow-none focus-visible:ring-0 px-1 bg-transparent"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newTaskTitle.trim()) {
                    setIsAdding(false);
                  }
                }}
                autoFocus
                aria-label="New task title"
              />
              <div className="flex justify-end gap-1 mt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px]"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px]"
                  onClick={handleCreateTask}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';
