/**
 * Dashboard Constants
 * Constantes específicas del módulo Dashboard
 */

export const DASHBOARD_WIDGETS = {
  OVERVIEW: 'overview',
  TASKS: 'tasks',
  ACTIVITY: 'activity',
  CHAT: 'chat',
  INTEGRATIONS: 'integrations',
} as const;

export const ACTIVITY_TYPES = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  PROJECT_CREATED: 'project_created',
  USER_JOINED: 'user_joined',
  COMMENT_ADDED: 'comment_added',
  FILE_UPLOADED: 'file_uploaded',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const PRIORITY_CONFIG = {
  [PRIORITY_LEVELS.LOW]: {
    label: 'Low',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    dotColor: 'bg-slate-500',
  },
  [PRIORITY_LEVELS.MEDIUM]: {
    label: 'Medium',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    dotColor: 'bg-blue-500',
  },
  [PRIORITY_LEVELS.HIGH]: {
    label: 'High',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    dotColor: 'bg-orange-500',
  },
  [PRIORITY_LEVELS.CRITICAL]: {
    label: 'Critical',
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900',
    dotColor: 'bg-red-500',
  },
} as const;

export const TIME_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
} as const;

export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
] as const;
