/**
 * Dashboard Types
 * Tipos TypeScript para el módulo Dashboard
 */

import { ACTIVITY_TYPES, PRIORITY_LEVELS, TIME_RANGES } from '@/app/constants/dashboard.constants';

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];
export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];
export type TimeRange = typeof TIME_RANGES[keyof typeof TIME_RANGES];

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  projectId?: string;
  projectName?: string;
  metadata?: Record<string, unknown>;
}

export interface StatCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  description?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue?: number;
  completionRate: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  key: string;
  taskCount: number;
  completionRate: number;
  lastActivity?: Date;
  status: 'active' | 'archived' | 'planning';
}

export interface DashboardData {
  stats: StatCard[];
  activities: Activity[];
  taskSummary: TaskSummary;
  projects: ProjectSummary[];
  chartData?: ChartDataPoint[];
}

export interface DashboardFilters {
  timeRange: TimeRange;
  projectId?: string | null;
  userId?: string | null;
}
