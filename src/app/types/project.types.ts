/**
 * Project Types
 * Tipos TypeScript estrictos para el módulo de proyectos
 */

import { TASK_STATUS, PROJECT_TABS } from '@/app/constants/project.constants';

// Tipos derivados de constantes para type safety
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type ProjectTab = typeof PROJECT_TABS[keyof typeof PROJECT_TABS];

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee?: string;
  dueDate?: string;
  status: TaskStatus;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WikiPage {
  id: string;
  projectId: string;
  title: string;
  content: string;
  parentId?: string | null;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Props interfaces para componentes
export interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onCreateTask: (title: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export interface WikiSidebarProps {
  pages: WikiPage[];
  activePage: WikiPage | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface WikiEditorProps {
  page: WikiPage;
  content: string;
  isEditing: boolean;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onToggleEdit: () => void;
}
