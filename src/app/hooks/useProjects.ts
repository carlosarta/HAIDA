/**
 * useProjects Hook
 * Hook optimizado para gestión de proyectos, tareas y wiki
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { Task, WikiPage, TaskStatus } from '@/app/types/project.types';
import { MOCK_TASKS_DATA, MOCK_WIKI_DATA } from '@/app/constants/project.constants';

export function useProjects(projectId: string | null) {
  // Estado
  const [tasks, setTasks] = useState<Task[]>([...MOCK_TASKS_DATA] as Task[]);
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([...MOCK_WIKI_DATA] as WikiPage[]);

  // Tareas filtradas por proyecto (memoizado)
  const projectTasks = useMemo(
    () => tasks.filter(t => !projectId || t.projectId === projectId),
    [tasks, projectId]
  );

  // Páginas wiki filtradas por proyecto (memoizado)
  const projectWikiPages = useMemo(
    () => wikiPages.filter(p => !projectId || p.projectId === projectId),
    [wikiPages, projectId]
  );

  // Crear tarea (useCallback para evitar re-renders)
  const createTask = useCallback((title: string, status: TaskStatus) => {
    if (!title.trim() || !projectId) return;

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title: title.trim(),
      status,
      assignee: 'Unassigned',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks(prev => [...prev, newTask]);
    toast.success('Task created successfully');
  }, [projectId]);

  // Mover tarea (useCallback para evitar re-renders)
  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date() }
          : t
      )
    );
    toast.success('Task moved');
  }, []);

  // Eliminar tarea
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('Task deleted');
  }, []);

  // Crear página wiki
  const createWikiPage = useCallback(() => {
    if (!projectId) return null;

    const newPage: WikiPage = {
      id: `wiki_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title: 'New Page',
      content: '# New Page\n\nStart writing...',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWikiPages(prev => [...prev, newPage]);
    return newPage;
  }, [projectId]);

  // Actualizar página wiki
  const updateWikiPage = useCallback((pageId: string, updates: Partial<WikiPage>) => {
    setWikiPages(prev =>
      prev.map(p =>
        p.id === pageId
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      )
    );
    toast.success('Wiki page updated');
  }, []);

  // Eliminar página wiki
  const deleteWikiPage = useCallback((pageId: string) => {
    setWikiPages(prev => prev.filter(p => p.id !== pageId));
    toast.success('Wiki page deleted');
  }, []);

  // Estadísticas de tareas (memoizado)
  const taskStats = useMemo(() => ({
    total: projectTasks.length,
    todo: projectTasks.filter(t => t.status === 'todo').length,
    inProgress: projectTasks.filter(t => t.status === 'inprogress').length,
    done: projectTasks.filter(t => t.status === 'done').length,
    completionRate: projectTasks.length > 0
      ? Math.round((projectTasks.filter(t => t.status === 'done').length / projectTasks.length) * 100)
      : 0,
  }), [projectTasks]);

  return {
    // Data
    tasks: projectTasks,
    wikiPages: projectWikiPages,
    taskStats,

    // Task actions
    createTask,
    moveTask,
    deleteTask,

    // Wiki actions
    createWikiPage,
    updateWikiPage,
    deleteWikiPage,
  };
}
