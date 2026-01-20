/**
 * TaskCard Component
 * Componente optimizado para mostrar una tarjeta de tarea
 */

import { memo } from 'react';
import { MoreVertical, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import type { Task, TaskStatus } from '@/app/types/project.types';
import { TASK_STATUS } from '@/app/constants/project.constants';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard = memo(({ task, onMove }: TaskCardProps) => {
  const getNextStatus = (): TaskStatus => {
    if (task.status === TASK_STATUS.TODO) return TASK_STATUS.IN_PROGRESS;
    if (task.status === TASK_STATUS.IN_PROGRESS) return TASK_STATUS.DONE;
    return task.status;
  };

  const handleMoveNext = () => {
    const nextStatus = getNextStatus();
    onMove(task.id, nextStatus);
  };

  return (
    <div
      className="group p-2.5 sm:p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative"
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <p className="text-xs sm:text-sm font-medium line-clamp-2 flex-1">
          {task.title}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
              aria-label="Task options"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onMove(task.id, TASK_STATUS.TODO)}>
              Move to Todo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, TASK_STATUS.IN_PROGRESS)}>
              Move to In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, TASK_STATUS.DONE)}>
              Move to Done
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between mt-2 sm:mt-3">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
              {task.assignee?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
            {task.assignee || 'Unassigned'}
          </span>
        </div>

        {task.status !== TASK_STATUS.DONE && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-green-100 text-muted-foreground hover:text-green-600 shrink-0"
            onClick={handleMoveNext}
            aria-label={`Move task to ${getNextStatus()}`}
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
