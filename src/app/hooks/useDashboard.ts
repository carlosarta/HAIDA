/**
 * useDashboard Hook
 * Hook optimizado para el módulo Dashboard
 */

import { useState, useMemo, useCallback } from 'react';
import type { Activity, DashboardData, DashboardFilters, TaskSummary } from '@/app/types/dashboard.types';
import { TIME_RANGES, ACTIVITY_TYPES } from '@/app/constants/dashboard.constants';

// Mock data generator
const generateMockActivities = (): Activity[] => [
  {
    id: 'a1',
    type: ACTIVITY_TYPES.TASK_COMPLETED,
    title: 'Test case TC-001 completed',
    description: 'Login functionality verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    userName: 'Carlos Martinez',
  },
  {
    id: 'a2',
    type: ACTIVITY_TYPES.PROJECT_CREATED,
    title: 'New project created',
    description: 'Mobile App Testing',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    userName: 'Ana Rodriguez',
  },
  {
    id: 'a3',
    type: ACTIVITY_TYPES.TASK_UPDATED,
    title: 'Test case TC-042 updated',
    description: 'Added new validation steps',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    userName: 'Juan Perez',
  },
];

export function useDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: TIME_RANGES.WEEK,
  });
  const [activities, setActivities] = useState<Activity[]>(generateMockActivities());

  // Task summary (memoizado)
  const taskSummary: TaskSummary = useMemo(() => ({
    total: 45,
    completed: 32,
    inProgress: 8,
    todo: 5,
    overdue: 2,
    completionRate: Math.round((32 / 45) * 100),
  }), []);

  // Stats cards (memoizado)
  const stats = useMemo(() => [
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: taskSummary.total,
      change: 12,
      changeType: 'increase' as const,
      description: 'Active test cases',
    },
    {
      id: 'completion',
      title: 'Completion Rate',
      value: `${taskSummary.completionRate}%`,
      change: 5,
      changeType: 'increase' as const,
      description: 'This week',
    },
    {
      id: 'projects',
      title: 'Active Projects',
      value: 8,
      change: -2,
      changeType: 'decrease' as const,
      description: 'In progress',
    },
    {
      id: 'team',
      title: 'Team Members',
      value: 12,
      change: 2,
      changeType: 'increase' as const,
      description: 'Contributors',
    },
  ], [taskSummary]);

  // Filtered activities (memoizado)
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by time range
    const now = Date.now();
    const ranges = {
      [TIME_RANGES.TODAY]: 24 * 60 * 60 * 1000,
      [TIME_RANGES.WEEK]: 7 * 24 * 60 * 60 * 1000,
      [TIME_RANGES.MONTH]: 30 * 24 * 60 * 60 * 1000,
    };

    const rangeMs = ranges[filters.timeRange as keyof typeof ranges];
    if (rangeMs) {
      filtered = filtered.filter(
        a => now - a.timestamp.getTime() <= rangeMs
      );
    }

    return filtered;
  }, [activities, filters.timeRange]);

  // Update filter
  const updateFilter = useCallback(<K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    setActivities(generateMockActivities());
  }, []);

  return {
    // Data
    stats,
    activities: filteredActivities,
    taskSummary,
    filters,

    // Actions
    updateFilter,
    refreshData,
  };
}
