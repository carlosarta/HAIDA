/**
 * Project Constants
 * Centraliza todas las constantes relacionadas con proyectos
 */

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inprogress',
  DONE: 'done',
} as const;

export const PROJECT_TABS = {
  BOARD: 'board',
  WIKI: 'wiki',
  HAIDA_DOCS: 'haida-docs',
} as const;

export const TASK_STATUS_CONFIG = {
  [TASK_STATUS.TODO]: {
    label: 'To Do',
    color: 'slate-400',
    borderClass: 'border-l-4 border-l-slate-400',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'blue-500',
    borderClass: 'border-l-4 border-l-blue-500',
  },
  [TASK_STATUS.DONE]: {
    label: 'Done',
    color: 'green-500',
    borderClass: 'border-l-4 border-l-green-500',
  },
} as const;

export const MOCK_TASKS_DATA = [
  { id: 't1', projectId: 'p1', title: 'Setup CI Pipeline', status: TASK_STATUS.DONE, assignee: 'Carlos' },
  { id: 't2', projectId: 'p1', title: 'Write Auth Tests', status: TASK_STATUS.IN_PROGRESS, assignee: 'Ana' },
  { id: 't3', projectId: 'p1', title: 'Review PR #42', status: TASK_STATUS.TODO, assignee: 'Carlos' },
] as const;

export const MOCK_WIKI_DATA = [
  {
    id: 'w1',
    projectId: 'p1',
    title: 'Project Overview',
    content: '# Project Overview\n\nThis project aims to refactor the legacy monolithic application into microservices.\n\n## Goals\n- Improve scalability\n- Reduce technical debt\n- Enhance developer experience'
  },
  {
    id: 'w2',
    projectId: 'p1',
    title: 'Onboarding Guide',
    content: '# Developer Onboarding\n\nWelcome to the team! Here are the steps to set up your environment:\n\n1. Install Node.js v18+\n2. Clone the repo\n3. Run `npm install`'
  },
  {
    id: 'w3',
    projectId: 'p1',
    title: 'API Documentation',
    content: '# API Reference\n\nAll endpoints are prefixed with `/api/v1`.\n\nAuthentication is done via Bearer tokens.'
  },
] as const;

export const WIKI_TOOLBAR_ITEMS = [
  { icon: 'Hash', tooltip: 'Heading' },
  { icon: 'ListIcon', tooltip: 'List' },
  { icon: 'LinkIcon', tooltip: 'Link' },
  { icon: 'Image', tooltip: 'Image' },
] as const;
