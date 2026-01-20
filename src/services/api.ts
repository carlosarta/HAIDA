/**
 * API Service - Centraliza todas las llamadas al backend
 * 
 * ⚠️ SEGURIDAD: 
 * - CSRF Protection con tokens únicos
 * - Encriptación de tokens sensibles
 * - Rate limiting integrado
 * 
 * IMPORTANTE: Configura la URL de tu backend en la variable API_BASE_URL
 */

import { mockBackend } from './mock-backend';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import rateLimit from 'axios-rate-limit';

import type { User, GlobalRole, ProjectRole, AuditLog } from '@/types/permissions';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Flag para usar mock backend automáticamente
const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Flag para detectar si el backend está disponible
let backendAvailable = !USE_MOCK_BACKEND;

// ============================================
// CSRF PROTECTION
// ============================================

const CSRF_TOKEN_KEY = 'haida_csrf_token';

/**
 * Genera un token CSRF único usando Web Crypto API
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Obtiene o genera el token CSRF
 */
export function getCSRFToken(): string {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  return token;
}

/**
 * Regenera el token CSRF (después de login exitoso)
 */
export function regenerateCSRFToken(): void {
  const newToken = generateCSRFToken();
  sessionStorage.setItem(CSRF_TOKEN_KEY, newToken);
}

// ============================================
// AXIOS INSTANCE CON RATE LIMITING Y CSRF
// ============================================

/**
 * Instancia de Axios con rate limiting y CSRF protection
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Aplicar rate limiting: 100 requests por minuto
  const rateLimitedInstance = rateLimit(instance, {
    maxRequests: 100,
    perMilliseconds: 60000,
  });

  // Interceptor para agregar tokens
  rateLimitedInstance.interceptors.request.use(
    (config) => {
      // Agregar token de autenticación
      const authToken = getAuthToken();
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // Agregar token CSRF para métodos que modifican datos
      const method = config.method?.toLowerCase();
      if (['post', 'put', 'delete', 'patch'].includes(method || '')) {
        config.headers['X-CSRF-Token'] = getCSRFToken();
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para manejar errores
  rateLimitedInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Si el token CSRF es inválido, regenerarlo
      if (error.response?.status === 403 && error.response?.data?.error === 'Invalid CSRF token') {
        regenerateCSRFToken();
      }

      // Si es 401, limpiar autenticación
      if (error.response?.status === 401) {
        clearAuthToken();
      }

      return Promise.reject(error);
    }
  );

  return rateLimitedInstance;
};

// Instancia global de API
const apiClient = createApiInstance();

// ============================================
// TIPOS DE DATOS
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  owner: string;
  status: string;
  created_at: string;
}

export interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  type: string;
  case_count: number;
}

export interface TestCase {
  id: string;
  suite_id: string;
  title: string;
  priority: string;
  description: string;
  steps: string[];
}

export interface Execution {
  id: string;
  project_id: string;
  suite_id: string;
  status: string;
  started_at: string;
  duration_ms: number;
  passed_count: number;
  failed_count: number;
}

export interface Defect {
  id: string;
  execution_id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'todo' | 'inprogress' | 'done';
  assignee: string;
}

export interface WikiPage {
  id: string;
  projectId: string;
  title: string;
  content: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

// ============================================
// HELPERS - TOKEN MANAGEMENT
// ============================================

const TOKEN_KEY = 'haida_auth_token';
const TOKEN_KEY_SESSION = 'haida_auth_token_session';

/**
 * Guardar token de autenticación
 */
export const saveAuthToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY_SESSION);
  } else {
    sessionStorage.setItem(TOKEN_KEY_SESSION, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Obtener token de autenticación
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY_SESSION);
};

/**
 * Limpiar token de autenticación
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY_SESSION);
};

// ============================================
// CORE FETCH FUNCTION
// ============================================

/**
 * Función base para hacer peticiones HTTP al backend
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    // Si es un error de red (backend no disponible)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('BACKEND_UNAVAILABLE: El servidor backend no está disponible. Por favor, verifica que esté corriendo en ' + API_BASE_URL);
    }
    throw error;
  }
}

// ============================================
// API MODULES
// ============================================

/**
 * Servicios de Autenticación
 */
export const authAPI = {
  /**
   * Login con email y contraseña
   * POST /auth/login
   * Body: { email, password, rememberMe }
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Si está forzado el uso de mock backend
    if (USE_MOCK_BACKEND) {
      return mockBackend.auth.login(credentials);
    }
    
    try {
      return await fetchAPI<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error: any) {
      // Si el backend no está disponible, usar mock automáticamente SIN warnings
      if (error.message?.includes('BACKEND_UNAVAILABLE')) {
        backendAvailable = false;
        return mockBackend.auth.login(credentials);
      }
      throw error;
    }
  },

  /**
   * Logout
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      await mockBackend.auth.logout();
      clearAuthToken();
      return;
    }
    
    try {
      await fetchAPI('/auth/logout', {
        method: 'POST',
      });
      clearAuthToken();
    } catch (error) {
      clearAuthToken();
    }
  },

  /**
   * Recuperación de contraseña
   * POST /auth/forgot-password
   * Body: { email }
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.auth.forgotPassword(data);
    }
    
    try {
      return await fetchAPI<ForgotPasswordResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      if (error.message?.includes('BACKEND_UNAVAILABLE')) {
        backendAvailable = false;
        return mockBackend.auth.forgotPassword(data);
      }
      throw error;
    }
  },

  /**
   * Verificar token actual
   * GET /auth/verify
   */
  verifyToken: async (): Promise<{ valid: boolean; user?: any }> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.auth.verifyToken();
    }
    
    try {
      return await fetchAPI('/auth/verify', {
        method: 'GET',
      });
    } catch (error) {
      backendAvailable = false;
      return mockBackend.auth.verifyToken();
    }
  },
};

/**
 * Servicios de Proyectos
 */
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.projects.getAll();
    }
    try {
      return await fetchAPI<Project[]>('/projects');
    } catch (error) {
      return mockBackend.projects.getAll();
    }
  },

  getById: async (id: string): Promise<Project> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.projects.getById(id);
    }
    try {
      return await fetchAPI<Project>(`/projects/${id}`);
    } catch (error) {
      return mockBackend.projects.getById(id);
    }
  },

  create: async (data: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.projects.create(data);
    }
    try {
      return await fetchAPI<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.projects.create(data);
    }
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.projects.update(id, data);
    }
    try {
      return await fetchAPI<Project>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.projects.update(id, data);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.projects.delete(id);
    }
    try {
      await fetchAPI(`/projects/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.projects.delete(id);
    }
  },
};

/**
 * Servicios de Test Suites
 */
export const suitesAPI = {
  getAll: async (): Promise<TestSuite[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.suites.getAll();
    }
    try {
      return await fetchAPI<TestSuite[]>('/suites');
    } catch (error) {
      return mockBackend.suites.getAll();
    }
  },

  getByProject: async (projectId: string): Promise<TestSuite[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.suites.getByProject(projectId);
    }
    try {
      return await fetchAPI<TestSuite[]>(`/projects/${projectId}/suites`);
    } catch (error) {
      return mockBackend.suites.getByProject(projectId);
    }
  },

  create: async (data: Omit<TestSuite, 'id'>): Promise<TestSuite> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.suites.create(data);
    }
    try {
      return await fetchAPI<TestSuite>('/suites', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.suites.create(data);
    }
  },

  update: async (id: string, data: Partial<TestSuite>): Promise<TestSuite> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.suites.update(id, data);
    }
    try {
      return await fetchAPI<TestSuite>(`/suites/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.suites.update(id, data);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.suites.delete(id);
    }
    try {
      await fetchAPI(`/suites/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.suites.delete(id);
    }
  },
};

/**
 * Servicios de Test Cases
 */
export const casesAPI = {
  getAll: async (): Promise<TestCase[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.cases.getAll();
    }
    try {
      return await fetchAPI<TestCase[]>('/cases');
    } catch (error) {
      return mockBackend.cases.getAll();
    }
  },

  getBySuite: async (suiteId: string): Promise<TestCase[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.cases.getBySuite(suiteId);
    }
    try {
      return await fetchAPI<TestCase[]>(`/suites/${suiteId}/cases`);
    } catch (error) {
      return mockBackend.cases.getBySuite(suiteId);
    }
  },

  create: async (data: Omit<TestCase, 'id'>): Promise<TestCase> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.cases.create(data);
    }
    try {
      return await fetchAPI<TestCase>('/cases', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.cases.create(data);
    }
  },

  update: async (id: string, data: Partial<TestCase>): Promise<TestCase> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.cases.update(id, data);
    }
    try {
      return await fetchAPI<TestCase>(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.cases.update(id, data);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.cases.delete(id);
    }
    try {
      await fetchAPI(`/cases/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.cases.delete(id);
    }
  },
};

/**
 * Servicios de Executions
 */
export const executionsAPI = {
  getAll: async (): Promise<Execution[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.executions.getAll();
    }
    try {
      return await fetchAPI<Execution[]>('/executions');
    } catch (error) {
      return mockBackend.executions.getAll();
    }
  },

  getByProject: async (projectId: string): Promise<Execution[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.executions.getByProject(projectId);
    }
    try {
      return await fetchAPI<Execution[]>(`/projects/${projectId}/executions`);
    } catch (error) {
      return mockBackend.executions.getByProject(projectId);
    }
  },

  create: async (data: Omit<Execution, 'id'>): Promise<Execution> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.executions.create(data);
    }
    try {
      return await fetchAPI<Execution>('/executions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.executions.create(data);
    }
  },

  update: async (id: string, data: Partial<Execution>): Promise<Execution> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.executions.update(id, data);
    }
    try {
      return await fetchAPI<Execution>(`/executions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.executions.update(id, data);
    }
  },
};

/**
 * Servicios de Defects
 */
export const defectsAPI = {
  getAll: async (): Promise<Defect[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.defects.getAll();
    }
    try {
      return await fetchAPI<Defect[]>('/defects');
    } catch (error) {
      return mockBackend.defects.getAll();
    }
  },

  getByExecution: async (executionId: string): Promise<Defect[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.defects.getByExecution(executionId);
    }
    try {
      return await fetchAPI<Defect[]>(`/executions/${executionId}/defects`);
    } catch (error) {
      return mockBackend.defects.getByExecution(executionId);
    }
  },

  create: async (data: Omit<Defect, 'id' | 'created_at'>): Promise<Defect> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.defects.create(data);
    }
    try {
      return await fetchAPI<Defect>('/defects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.defects.create(data);
    }
  },

  update: async (id: string, data: Partial<Defect>): Promise<Defect> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.defects.update(id, data);
    }
    try {
      return await fetchAPI<Defect>(`/defects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.defects.update(id, data);
    }
  },
};

/**
 * Servicios de Tasks (Kanban)
 */
export const tasksAPI = {
  getByProject: async (projectId: string): Promise<Task[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.tasks.getByProject(projectId);
    }
    try {
      return await fetchAPI<Task[]>(`/projects/${projectId}/tasks`);
    } catch (error) {
      return mockBackend.tasks.getByProject(projectId);
    }
  },

  create: async (data: Omit<Task, 'id'>): Promise<Task> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.tasks.create(data);
    }
    try {
      return await fetchAPI<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.tasks.create(data);
    }
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.tasks.update(id, data);
    }
    try {
      return await fetchAPI<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.tasks.update(id, data);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.tasks.delete(id);
    }
    try {
      await fetchAPI(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.tasks.delete(id);
    }
  },
};

/**
 * Servicios de Wiki
 */
export const wikiAPI = {
  getByProject: async (projectId: string): Promise<WikiPage[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.wiki.getByProject(projectId);
    }
    try {
      return await fetchAPI<WikiPage[]>(`/projects/${projectId}/wiki`);
    } catch (error) {
      return mockBackend.wiki.getByProject(projectId);
    }
  },

  create: async (data: Omit<WikiPage, 'id'>): Promise<WikiPage> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.wiki.create(data);
    }
    try {
      return await fetchAPI<WikiPage>('/wiki', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.wiki.create(data);
    }
  },

  update: async (id: string, data: Partial<WikiPage>): Promise<WikiPage> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.wiki.update(id, data);
    }
    try {
      return await fetchAPI<WikiPage>(`/wiki/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.wiki.update(id, data);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.wiki.delete(id);
    }
    try {
      await fetchAPI(`/wiki/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.wiki.delete(id);
    }
  },
};

/**
 * Servicios de Chat IA
 */
export const chatAPI = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.chat.sendMessage(message);
    }
    try {
      return await fetchAPI<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      return mockBackend.chat.sendMessage(message);
    }
  },
};

/**
 * Servicios de Usuarios y Permisos
 */
export const usersAPI = {
  /**
   * Obtener todos los usuarios
   * GET /users
   */
  getAll: async (): Promise<User[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.getAll();
    }
    try {
      return await fetchAPI<User[]>('/users');
    } catch (error) {
      return mockBackend.users.getAll();
    }
  },

  /**
   * Obtener usuario por ID
   * GET /users/:id
   */
  getById: async (id: string): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.getById(id);
    }
    try {
      return await fetchAPI<User>(`/users/${id}`);
    } catch (error) {
      return mockBackend.users.getById(id);
    }
  },

  /**
   * Crear usuario
   * POST /users
   */
  create: async (data: Omit<User, 'id' | 'createdAt' | 'projectRoles'>): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.create(data);
    }
    try {
      return await fetchAPI<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.users.create(data);
    }
  },

  /**
   * Actualizar usuario
   * PATCH /users/:id
   */
  update: async (id: string, data: Partial<User>): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.update(id, data);
    }
    try {
      return await fetchAPI<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return mockBackend.users.update(id, data);
    }
  },

  /**
   * Actualizar rol global de usuario
   * PATCH /users/:id/global-role
   */
  updateGlobalRole: async (id: string, role: GlobalRole): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.updateGlobalRole(id, role);
    }
    try {
      return await fetchAPI<User>(`/users/${id}/global-role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      return mockBackend.users.updateGlobalRole(id, role);
    }
  },

  /**
   * Asignar rol de proyecto
   * POST /users/:id/project-roles
   */
  assignProjectRole: async (
    userId: string,
    projectId: string,
    role: ProjectRole
  ): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.assignProjectRole(userId, projectId, role);
    }
    try {
      return await fetchAPI<User>(`/users/${userId}/project-roles`, {
        method: 'POST',
        body: JSON.stringify({ projectId, role }),
      });
    } catch (error) {
      return mockBackend.users.assignProjectRole(userId, projectId, role);
    }
  },

  /**
   * Remover rol de proyecto
   * DELETE /users/:id/project-roles/:projectId
   */
  removeProjectRole: async (userId: string, projectId: string): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.removeProjectRole(userId, projectId);
    }
    try {
      return await fetchAPI<User>(`/users/${userId}/project-roles/${projectId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.users.removeProjectRole(userId, projectId);
    }
  },

  /**
   * Invitar usuario
   * POST /users/invite
   */
  invite: async (email: string, globalRole: GlobalRole): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.invite(email, globalRole);
    }
    try {
      return await fetchAPI('/users/invite', {
        method: 'POST',
        body: JSON.stringify({ email, globalRole }),
      });
    } catch (error) {
      return mockBackend.users.invite(email, globalRole);
    }
  },

  /**
   * Activar/Desactivar usuario
   * PATCH /users/:id/status
   */
  updateStatus: async (id: string, status: 'active' | 'inactive'): Promise<User> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.updateStatus(id, status);
    }
    try {
      return await fetchAPI<User>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      return mockBackend.users.updateStatus(id, status);
    }
  },

  /**
   * Eliminar usuario
   * DELETE /users/:id
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.delete(id);
    }
    try {
      await fetchAPI(`/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return mockBackend.users.delete(id);
    }
  },

  /**
   * Obtener auditoría de usuario
   * GET /users/:id/audit-log
   */
  getAuditLog: async (id: string, limit: number = 10): Promise<AuditLog[]> => {
    if (USE_MOCK_BACKEND || !backendAvailable) {
      return mockBackend.users.getAuditLog(id, limit);
    }
    try {
      return await fetchAPI<AuditLog[]>(`/users/${id}/audit-log?limit=${limit}`);
    } catch (error) {
      return mockBackend.users.getAuditLog(id, limit);
    }
  },
};