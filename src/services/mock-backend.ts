/**
 * Mock Backend Service
 * 
 * Este servicio simula un backend real cuando no está disponible.
 * IMPORTANTE: Este es temporal - reemplázalo con un backend real en producción.
 */

import type {
  LoginCredentials,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  Project,
  TestSuite,
  TestCase,
  Execution,
  Defect,
  Task,
  WikiPage,
  ChatResponse,
} from './api';

import type { User, GlobalRole, ProjectRole, AuditLog } from '@/types/permissions';

// Simular delay de red
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generar token JWT falso (solo para desarrollo)
const generateMockToken = (email: string, rememberMe: boolean): string => {
  const payload = {
    email,
    rememberMe,
    exp: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
  };
  return 'mock_token_' + btoa(JSON.stringify(payload));
};

// Base de datos en memoria (se reinicia al recargar la página)
const mockDB = {
  users: [
    { id: 'usr1', email: 'carlos.admin@haida.com', password: 'admin123', name: 'Carlos Rodríguez', role: 'admin' },
    { id: 'usr2', email: 'ana.manager@haida.com', password: 'manager123', name: 'Ana García', role: 'manager' },
    { id: 'usr3', email: 'luis.qa@haida.com', password: 'qa123', name: 'Luis Torres', role: 'qa_engineer' },
    { id: 'usr4', email: 'maria.tester@haida.com', password: 'tester123', name: 'María González', role: 'tester' },
    { id: 'usr5', email: 'pedro.dev@haida.com', password: 'dev123', name: 'Pedro Martínez', role: 'developer' },
    { id: 'usr6', email: 'sofia.viewer@haida.com', password: 'viewer123', name: 'Sofía López', role: 'viewer' },
  ],
  systemUsers: [
    {
      id: 'usr1',
      email: 'carlos.admin@haida.com',
      name: 'Carlos Rodríguez',
      avatar: 'https://i.pravatar.cc/150?u=carlos',
      globalRole: 'admin' as GlobalRole,
      status: 'active' as const,
      ssoSource: 'microsoft' as const,
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      createdAt: '2024-01-15T10:00:00Z',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Revamp', projectKey: 'ECM', role: 'owner' as ProjectRole, addedAt: '2024-01-15T10:00:00Z' },
        { projectId: 'p2', projectName: 'Mobile App Launch', projectKey: 'MOB', role: 'maintainer' as ProjectRole, addedAt: '2024-02-01T10:00:00Z' },
      ],
    },
    {
      id: 'usr2',
      email: 'ana.manager@haida.com',
      name: 'Ana García',
      avatar: 'https://i.pravatar.cc/150?u=ana',
      globalRole: 'manager' as GlobalRole,
      status: 'active' as const,
      ssoSource: 'microsoft' as const,
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
      createdAt: '2024-01-20T10:00:00Z',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Revamp', projectKey: 'ECM', role: 'maintainer' as ProjectRole, addedAt: '2024-01-20T10:00:00Z' },
        { projectId: 'p3', projectName: 'API Gateway Redesign', projectKey: 'API', role: 'owner' as ProjectRole, addedAt: '2024-02-10T10:00:00Z' },
      ],
    },
    {
      id: 'usr3',
      email: 'luis.qa@haida.com',
      name: 'Luis Torres',
      avatar: 'https://i.pravatar.cc/150?u=luis',
      globalRole: 'qa_engineer' as GlobalRole,
      status: 'active' as const,
      ssoSource: null,
      lastLogin: new Date(Date.now() - 1800000).toISOString(),
      createdAt: '2024-02-01T10:00:00Z',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Revamp', projectKey: 'ECM', role: 'contributor' as ProjectRole, addedAt: '2024-02-01T10:00:00Z' },
        { projectId: 'p2', projectName: 'Mobile App Launch', projectKey: 'MOB', role: 'contributor' as ProjectRole, addedAt: '2024-02-05T10:00:00Z' },
      ],
    },
    {
      id: 'usr4',
      email: 'maria.tester@haida.com',
      name: 'María González',
      avatar: 'https://i.pravatar.cc/150?u=maria',
      globalRole: 'tester' as GlobalRole,
      status: 'active' as const,
      ssoSource: null,
      lastLogin: new Date(Date.now() - 5400000).toISOString(),
      createdAt: '2024-02-10T10:00:00Z',
      projectRoles: [
        { projectId: 'p2', projectName: 'Mobile App Launch', projectKey: 'MOB', role: 'contributor' as ProjectRole, addedAt: '2024-02-10T10:00:00Z' },
      ],
    },
    {
      id: 'usr5',
      email: 'pedro.dev@haida.com',
      name: 'Pedro Martínez',
      avatar: 'https://i.pravatar.cc/150?u=pedro',
      globalRole: 'developer' as GlobalRole,
      status: 'active' as const,
      ssoSource: 'google' as const,
      lastLogin: new Date(Date.now() - 10800000).toISOString(),
      createdAt: '2024-02-15T10:00:00Z',
      projectRoles: [
        { projectId: 'p1', projectName: 'E-commerce Revamp', projectKey: 'ECM', role: 'viewer' as ProjectRole, addedAt: '2024-02-15T10:00:00Z' },
      ],
    },
    {
      id: 'usr6',
      email: 'sofia.viewer@haida.com',
      name: 'Sofía López',
      avatar: 'https://i.pravatar.cc/150?u=sofia',
      globalRole: 'viewer' as GlobalRole,
      status: 'inactive' as const,
      ssoSource: null,
      lastLogin: new Date(Date.now() - 86400000 * 30).toISOString(),
      createdAt: '2024-03-01T10:00:00Z',
      projectRoles: [],
    },
    {
      id: 'usr7',
      email: 'juan.pending@haida.com',
      name: 'Juan Ramírez',
      globalRole: 'tester' as GlobalRole,
      status: 'pending' as const,
      ssoSource: null,
      createdAt: '2025-01-18T10:00:00Z',
      projectRoles: [],
    },
  ] as User[],
  auditLogs: [
    { id: 'audit1', userId: 'usr1', action: 'role_changed', resource: 'users', details: 'Changed role from manager to admin', timestamp: new Date(Date.now() - 86400000).toISOString(), ipAddress: '192.168.1.100' },
    { id: 'audit2', userId: 'usr1', action: 'user_invited', resource: 'users', details: 'Invited juan.pending@haida.com', timestamp: new Date(Date.now() - 172800000).toISOString(), ipAddress: '192.168.1.100' },
    { id: 'audit3', userId: 'usr1', action: 'project_access_granted', resource: 'projects', details: 'Added to project ECM as owner', timestamp: new Date(Date.now() - 259200000).toISOString(), ipAddress: '192.168.1.100' },
    { id: 'audit4', userId: 'usr1', action: 'permission_updated', resource: 'users', details: 'Updated global permissions', timestamp: new Date(Date.now() - 345600000).toISOString(), ipAddress: '192.168.1.100' },
    { id: 'audit5', userId: 'usr1', action: 'login', resource: 'auth', details: 'Successful login via SSO', timestamp: new Date(Date.now() - 432000000).toISOString(), ipAddress: '192.168.1.100' },
  ] as AuditLog[],
  projects: [
    { id: 'p1', key: 'ECM', name: 'E-commerce Revamp', owner: 'Carlos Ruiz', status: 'Active', created_at: '2025-01-10' },
    { id: 'p2', key: 'MOB', name: 'Mobile App Launch', owner: 'Ana García', status: 'Active', created_at: '2025-01-12' },
    { id: 'p3', key: 'API', name: 'API Gateway Redesign', owner: 'Luis Torres', status: 'Planning', created_at: '2025-01-15' },
  ] as Project[],
  suites: [
    { id: 's1', project_id: 'p1', name: 'Checkout E2E', type: 'Web', case_count: 45 },
    { id: 's2', project_id: 'p1', name: 'User Auth Suite', type: 'API', case_count: 23 },
    { id: 's3', project_id: 'p2', name: 'Mobile UI Tests', type: 'Mobile', case_count: 67 },
  ] as TestSuite[],
  cases: [
    { id: 'c1', suite_id: 's1', title: 'Add item to cart', priority: 'High', description: 'Verify user can add items', steps: ['Navigate to product', 'Click Add to Cart', 'Verify cart updates'] },
    { id: 'c2', suite_id: 's1', title: 'Checkout with credit card', priority: 'Critical', description: 'Complete purchase flow', steps: ['Add items to cart', 'Proceed to checkout', 'Enter payment info', 'Confirm order'] },
  ] as TestCase[],
  executions: [
    { id: 'exe1', project_id: 'p1', suite_id: 's1', status: 'passed', started_at: new Date(Date.now() - 86400000).toISOString(), duration_ms: 240000, passed_count: 44, failed_count: 1 },
  ] as Execution[],
  defects: [] as Defect[],
  tasks: [
    { id: 't1', projectId: 'p1', title: 'Setup CI Pipeline', status: 'done' as const, assignee: 'Carlos' },
    { id: 't2', projectId: 'p1', title: 'Write Auth Tests', status: 'inprogress' as const, assignee: 'Ana' },
    { id: 't3', projectId: 'p1', title: 'Review PR #42', status: 'todo' as const, assignee: 'Carlos' },
  ] as Task[],
  wiki: [
    { id: 'w1', projectId: 'p1', title: 'Project Overview', content: '# Project Overview\n\nThis project aims to refactor the legacy monolithic application into microservices.\n\n## Goals\n- Improve scalability\n- Reduce technical debt\n- Enhance developer experience' },
  ] as WikiPage[],
};

/**
 * Mock API - Simula un backend real
 */
export const mockBackend = {
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  auth: {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      await simulateDelay(800);
      
      const user = mockDB.users.find(
        u => u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }
      
      const token = generateMockToken(user.email, credentials.rememberMe || false);
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        expiresIn: credentials.rememberMe ? 2592000 : 86400,
      };
    },
    
    logout: async (): Promise<void> => {
      await simulateDelay(200);
    },
    
    forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      await simulateDelay(1000);
      
      return {
        message: `Se ha enviado un email de recuperación a ${data.email}`,
        success: true,
      };
    },
    
    verifyToken: async (): Promise<{ valid: boolean; user?: any }> => {
      await simulateDelay(200);
      return { valid: true, user: { id: 'u1', email: 'admin@haida.com' } };
    },
  },
  
  // ============================================
  // PROYECTOS
  // ============================================
  projects: {
    getAll: async (): Promise<Project[]> => {
      await simulateDelay(300);
      return [...mockDB.projects];
    },
    
    getById: async (id: string): Promise<Project> => {
      await simulateDelay(200);
      const project = mockDB.projects.find(p => p.id === id);
      if (!project) throw new Error('Proyecto no encontrado');
      return project;
    },
    
    create: async (data: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
      await simulateDelay(400);
      const newProject: Project = {
        ...data,
        id: `p${mockDB.projects.length + 1}`,
        created_at: new Date().toISOString(),
      };
      mockDB.projects.push(newProject);
      console.log('✅ Mock Backend: Proyecto creado', newProject);
      return newProject;
    },
    
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      await simulateDelay(300);
      const index = mockDB.projects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Proyecto no encontrado');
      mockDB.projects[index] = { ...mockDB.projects[index], ...data };
      console.log('✅ Mock Backend: Proyecto actualizado', mockDB.projects[index]);
      return mockDB.projects[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await simulateDelay(300);
      const index = mockDB.projects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Proyecto no encontrado');
      mockDB.projects.splice(index, 1);
      console.log('🗑️ Mock Backend: Proyecto eliminado', id);
    },
  },
  
  // ============================================
  // SUITES
  // ============================================
  suites: {
    getAll: async (): Promise<TestSuite[]> => {
      await simulateDelay(300);
      return [...mockDB.suites];
    },
    
    getByProject: async (projectId: string): Promise<TestSuite[]> => {
      await simulateDelay(300);
      return mockDB.suites.filter(s => s.project_id === projectId);
    },
    
    create: async (data: Omit<TestSuite, 'id'>): Promise<TestSuite> => {
      await simulateDelay(400);
      const newSuite: TestSuite = {
        ...data,
        id: `s${mockDB.suites.length + 1}`,
      };
      mockDB.suites.push(newSuite);
      return newSuite;
    },
    
    update: async (id: string, data: Partial<TestSuite>): Promise<TestSuite> => {
      await simulateDelay(300);
      const index = mockDB.suites.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Suite no encontrada');
      mockDB.suites[index] = { ...mockDB.suites[index], ...data };
      return mockDB.suites[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await simulateDelay(300);
      const index = mockDB.suites.findIndex(s => s.id === id);
      if (index !== -1) mockDB.suites.splice(index, 1);
    },
  },
  
  // ============================================
  // CASOS DE PRUEBA
  // ============================================
  cases: {
    getAll: async (): Promise<TestCase[]> => {
      await simulateDelay(300);
      return [...mockDB.cases];
    },
    
    getBySuite: async (suiteId: string): Promise<TestCase[]> => {
      await simulateDelay(300);
      return mockDB.cases.filter(c => c.suite_id === suiteId);
    },
    
    create: async (data: Omit<TestCase, 'id'>): Promise<TestCase> => {
      await simulateDelay(400);
      const newCase: TestCase = {
        ...data,
        id: `c${mockDB.cases.length + 1}`,
      };
      mockDB.cases.push(newCase);
      return newCase;
    },
    
    update: async (id: string, data: Partial<TestCase>): Promise<TestCase> => {
      await simulateDelay(300);
      const index = mockDB.cases.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Caso no encontrado');
      mockDB.cases[index] = { ...mockDB.cases[index], ...data };
      return mockDB.cases[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await simulateDelay(300);
      const index = mockDB.cases.findIndex(c => c.id === id);
      if (index !== -1) mockDB.cases.splice(index, 1);
    },
  },
  
  // ============================================
  // EJECUCIONES
  // ============================================
  executions: {
    getAll: async (): Promise<Execution[]> => {
      await simulateDelay(300);
      return [...mockDB.executions];
    },
    
    getByProject: async (projectId: string): Promise<Execution[]> => {
      await simulateDelay(300);
      return mockDB.executions.filter(e => e.project_id === projectId);
    },
    
    create: async (data: Omit<Execution, 'id'>): Promise<Execution> => {
      await simulateDelay(400);
      const newExecution: Execution = {
        ...data,
        id: `exe${mockDB.executions.length + 1}`,
      };
      mockDB.executions.push(newExecution);
      return newExecution;
    },
    
    update: async (id: string, data: Partial<Execution>): Promise<Execution> => {
      await simulateDelay(300);
      const index = mockDB.executions.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Ejecución no encontrada');
      mockDB.executions[index] = { ...mockDB.executions[index], ...data };
      return mockDB.executions[index];
    },
  },
  
  // ============================================
  // DEFECTOS
  // ============================================
  defects: {
    getAll: async (): Promise<Defect[]> => {
      await simulateDelay(300);
      return [...mockDB.defects];
    },
    
    getByExecution: async (executionId: string): Promise<Defect[]> => {
      await simulateDelay(300);
      return mockDB.defects.filter(d => d.execution_id === executionId);
    },
    
    create: async (data: Omit<Defect, 'id' | 'created_at'>): Promise<Defect> => {
      await simulateDelay(400);
      const newDefect: Defect = {
        ...data,
        id: `def${mockDB.defects.length + 1}`,
        created_at: new Date().toISOString(),
      };
      mockDB.defects.push(newDefect);
      return newDefect;
    },
    
    update: async (id: string, data: Partial<Defect>): Promise<Defect> => {
      await simulateDelay(300);
      const index = mockDB.defects.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Defecto no encontrado');
      mockDB.defects[index] = { ...mockDB.defects[index], ...data };
      return mockDB.defects[index];
    },
  },
  
  // ============================================
  // TAREAS (KANBAN)
  // ============================================
  tasks: {
    getByProject: async (projectId: string): Promise<Task[]> => {
      await simulateDelay(300);
      return mockDB.tasks.filter(t => t.projectId === projectId);
    },
    
    create: async (data: Omit<Task, 'id'>): Promise<Task> => {
      await simulateDelay(400);
      const newTask: Task = {
        ...data,
        id: `t${mockDB.tasks.length + 1}`,
      };
      mockDB.tasks.push(newTask);
      console.log('✅ Mock Backend: Tarea creada', newTask);
      return newTask;
    },
    
    update: async (id: string, data: Partial<Task>): Promise<Task> => {
      await simulateDelay(300);
      const index = mockDB.tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tarea no encontrada');
      mockDB.tasks[index] = { ...mockDB.tasks[index], ...data };
      console.log('✅ Mock Backend: Tarea actualizada', mockDB.tasks[index]);
      return mockDB.tasks[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await simulateDelay(300);
      const index = mockDB.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        mockDB.tasks.splice(index, 1);
        console.log('🗑️ Mock Backend: Tarea eliminada', id);
      }
    },
  },
  
  // ============================================
  // WIKI
  // ============================================
  wiki: {
    getByProject: async (projectId: string): Promise<WikiPage[]> => {
      await simulateDelay(300);
      return mockDB.wiki.filter(w => w.projectId === projectId);
    },
    
    create: async (data: Omit<WikiPage, 'id'>): Promise<WikiPage> => {
      await simulateDelay(400);
      const newPage: WikiPage = {
        ...data,
        id: `w${mockDB.wiki.length + 1}`,
      };
      mockDB.wiki.push(newPage);
      return newPage;
    },
    
    update: async (id: string, data: Partial<WikiPage>): Promise<WikiPage> => {
      await simulateDelay(300);
      const index = mockDB.wiki.findIndex(w => w.id === id);
      if (index === -1) throw new Error('Página no encontrada');
      mockDB.wiki[index] = { ...mockDB.wiki[index], ...data };
      return mockDB.wiki[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await simulateDelay(300);
      const index = mockDB.wiki.findIndex(w => w.id === id);
      if (index !== -1) mockDB.wiki.splice(index, 1);
    },
  },
  
  // ============================================
  // CHAT IA
  // ============================================
  chat: {
    sendMessage: async (message: string): Promise<ChatResponse> => {
      await simulateDelay(1000);
      return {
        message: `Mock AI Response: Recibí tu mensaje "${message}". Este es un backend simulado.`,
        suggestions: ['¿Cómo crear un proyecto?', '¿Cómo ejecutar tests?', '¿Cómo ver reportes?'],
      };
    },
  },
  
  // ============================================
  // USUARIOS Y PERMISOS
  // ============================================
  users: {
    getAll: async (): Promise<User[]> => {
      await simulateDelay(400);
      return [...mockDB.systemUsers];
    },
    
    getById: async (id: string): Promise<User> => {
      await simulateDelay(200);
      const user = mockDB.systemUsers.find(u => u.id === id);
      if (!user) throw new Error('Usuario no encontrado');
      return user;
    },
    
    create: async (data: Omit<User, 'id' | 'createdAt' | 'projectRoles'>): Promise<User> => {
      await simulateDelay(500);
      const newUser: User = {
        ...data,
        id: `usr${mockDB.systemUsers.length + 1}`,
        createdAt: new Date().toISOString(),
        projectRoles: [],
      };
      mockDB.systemUsers.push(newUser);
      return newUser;
    },
    
    update: async (id: string, data: Partial<User>): Promise<User> => {
      await simulateDelay(300);
      const index = mockDB.systemUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      mockDB.systemUsers[index] = { ...mockDB.systemUsers[index], ...data };
      return mockDB.systemUsers[index];
    },
    
    updateGlobalRole: async (id: string, role: GlobalRole): Promise<User> => {
      await simulateDelay(300);
      const index = mockDB.systemUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      mockDB.systemUsers[index].globalRole = role;
      return mockDB.systemUsers[index];
    },
    
    assignProjectRole: async (userId: string, projectId: string, role: ProjectRole): Promise<User> => {
      await simulateDelay(300);
      const userIndex = mockDB.systemUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('Usuario no encontrado');
      
      const project = mockDB.projects.find(p => p.id === projectId);
      if (!project) throw new Error('Proyecto no encontrado');
      
      const user = mockDB.systemUsers[userIndex];
      const existingRoleIndex = user.projectRoles.findIndex(pr => pr.projectId === projectId);
      
      if (existingRoleIndex !== -1) {
        user.projectRoles[existingRoleIndex].role = role;
      } else {
        user.projectRoles.push({
          projectId,
          projectName: project.name,
          projectKey: project.key,
          role,
          addedAt: new Date().toISOString(),
        });
      }
      
      return user;
    },
    
    removeProjectRole: async (userId: string, projectId: string): Promise<User> => {
      await simulateDelay(300);
      const userIndex = mockDB.systemUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('Usuario no encontrado');
      
      const user = mockDB.systemUsers[userIndex];
      user.projectRoles = user.projectRoles.filter(pr => pr.projectId !== projectId);
      
      return user;
    },
    
    invite: async (email: string, globalRole: GlobalRole): Promise<{ success: boolean; message: string }> => {
      await simulateDelay(600);
      
      // Check if user already exists
      const existingUser = mockDB.systemUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('El usuario ya existe en el sistema');
      }
      
      return {
        success: true,
        message: `Invitación enviada a ${email} con rol ${globalRole}`,
      };
    },
    
    updateStatus: async (id: string, status: 'active' | 'inactive'): Promise<User> => {
      await simulateDelay(300);
      const index = mockDB.systemUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      mockDB.systemUsers[index].status = status;
      return mockDB.systemUsers[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await simulateDelay(400);
      const index = mockDB.systemUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      mockDB.systemUsers.splice(index, 1);
    },
    
    getAuditLog: async (id: string, limit: number = 10): Promise<AuditLog[]> => {
      await simulateDelay(200);
      return mockDB.auditLogs
        .filter(log => log.userId === id)
        .slice(0, limit);
    },
  },
};