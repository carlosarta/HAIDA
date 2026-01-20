/**
 * App Constants
 * Constantes globales de la aplicación
 */

export const APP_NAME = 'HAIDA' as const;
export const APP_VERSION = '2.0.0' as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  DESIGNER: '/designer',
  EXECUTOR: '/executor',
  REPORTER: '/reporter',
  CHAT: '/chat',
  DOCUMENTATION: '/documentation',
  PROFILE: '/profile',
  INBOX: '/inbox',
  LOGIN: '/login',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'haida_auth_token',
  USER_PREFERENCES: 'haida_user_preferences',
  THEME: 'haida_theme',
  LANGUAGE: 'haida_language',
  SIDEBAR_STATE: 'haida_sidebar_state',
} as const;

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  WIKI: '/wiki',
  CHAT: '/chat',
  TELEGRAM: '/telegram',
  INTEGRATIONS: '/integrations',
} as const;

export const PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  ADMIN: 'admin',
} as const;

export const GLOBAL_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;
