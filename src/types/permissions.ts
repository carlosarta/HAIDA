/**
 * 🔐 HAIDA - Sistema de Permisos
 * 
 * Sistema híbrido de permisos multi-tenant con RBAC:
 * - Roles Globales (nivel aplicación)
 * - Roles por Tenant (nivel organización)
 * - Roles por Proyecto (nivel proyecto)
 * - Permisos granulares (acciones específicas)
 * 
 * ARQUITECTURA:
 * TenantRole (owner/admin/editor/viewer) 
 *   + GlobalRole (admin/qa_engineer/tester/etc)
 *   + ProjectRole (owner/maintainer/contributor/viewer)
 *   = Permisos Efectivos
 * 
 * @module permissions
 * @see /src/types/database.types.ts para tipos de DB
 */

// ============================================
// ROLES GLOBALES (Application-level)
// ============================================

export type GlobalRole = 
  | 'admin' 
  | 'manager' 
  | 'tester' 
  | 'qa_engineer' 
  | 'developer' 
  | 'viewer';

export const GLOBAL_ROLES: Record<GlobalRole, { label: string; description: string; level: number }> = {
  admin: {
    label: 'Administrador',
    description: 'Acceso total al sistema. Puede gestionar usuarios, configuraciones y todos los proyectos.',
    level: 100,
  },
  manager: {
    label: 'Manager',
    description: 'Puede gestionar proyectos y equipos. No puede modificar configuraciones globales.',
    level: 80,
  },
  qa_engineer: {
    label: 'QA Engineer',
    description: 'Puede crear y ejecutar tests, gestionar casos de prueba y reportar defectos.',
    level: 60,
  },
  tester: {
    label: 'Tester',
    description: 'Puede ejecutar tests y reportar defectos. No puede modificar test suites.',
    level: 40,
  },
  developer: {
    label: 'Developer',
    description: 'Puede ver tests y reportes relacionados con sus proyectos.',
    level: 30,
  },
  viewer: {
    label: 'Viewer',
    description: 'Solo lectura. Puede ver proyectos y reportes asignados.',
    level: 10,
  },
};

// ============================================
// ROLES POR PROYECTO
// ============================================

export type ProjectRole = 'owner' | 'maintainer' | 'contributor' | 'viewer';

export const PROJECT_ROLES: Record<ProjectRole, { label: string; description: string; level: number }> = {
  owner: {
    label: 'Owner',
    description: 'Control total del proyecto. Puede gestionar miembros y eliminar el proyecto.',
    level: 100,
  },
  maintainer: {
    label: 'Maintainer',
    description: 'Puede gestionar test suites, casos y ejecuciones. Puede agregar miembros.',
    level: 70,
  },
  contributor: {
    label: 'Contributor',
    description: 'Puede crear y editar tests. Puede ejecutar test suites.',
    level: 50,
  },
  viewer: {
    label: 'Viewer',
    description: 'Solo lectura del proyecto. Puede ver tests y reportes.',
    level: 20,
  },
};

// ============================================
// PERMISOS
// ============================================

export type Permission = 
  // Projects
  | 'projects.create'
  | 'projects.read'
  | 'projects.update'
  | 'projects.delete'
  | 'projects.manage'
  // Test Suites
  | 'test_suites.create'
  | 'test_suites.read'
  | 'test_suites.update'
  | 'test_suites.delete'
  | 'test_suites.execute'
  // Test Cases
  | 'test_cases.create'
  | 'test_cases.read'
  | 'test_cases.update'
  | 'test_cases.delete'
  // Executions
  | 'executions.read'
  | 'executions.delete'
  // Reports
  | 'reports.read'
  | 'reports.export'
  | 'reports.create'
  // Users
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.manage_permissions'
  // Settings
  | 'settings.read'
  | 'settings.update';

// Estructura de permisos por recurso
export const PERMISSIONS_BY_RESOURCE = {
  projects: ['create', 'read', 'update', 'delete', 'manage'],
  test_suites: ['create', 'read', 'update', 'delete', 'execute'],
  test_cases: ['create', 'read', 'update', 'delete'],
  executions: ['read', 'delete'],
  reports: ['read', 'export', 'create'],
  users: ['create', 'read', 'update', 'delete', 'manage_permissions'],
  settings: ['read', 'update'],
} as const;

// Mapa de permisos por rol global
export const GLOBAL_ROLE_PERMISSIONS: Record<GlobalRole, Permission[]> = {
  admin: [
    'projects.create', 'projects.read', 'projects.update', 'projects.delete', 'projects.manage',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.delete', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read', 'executions.delete',
    'reports.read', 'reports.export', 'reports.create',
    'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage_permissions',
    'settings.read', 'settings.update',
  ],
  manager: [
    'projects.create', 'projects.read', 'projects.update', 'projects.manage',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.delete', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read',
    'reports.read', 'reports.export', 'reports.create',
    'users.read',
    'settings.read',
  ],
  qa_engineer: [
    'projects.read',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read',
    'reports.read', 'reports.export', 'reports.create',
  ],
  tester: [
    'projects.read',
    'test_suites.read', 'test_suites.execute',
    'test_cases.read',
    'executions.read',
    'reports.read',
  ],
  developer: [
    'projects.read',
    'test_suites.read',
    'test_cases.read',
    'executions.read',
    'reports.read',
  ],
  viewer: [
    'projects.read',
    'test_suites.read',
    'test_cases.read',
    'executions.read',
    'reports.read',
  ],
};

// Mapa de permisos por rol de proyecto
export const PROJECT_ROLE_PERMISSIONS: Record<ProjectRole, Permission[]> = {
  owner: [
    'projects.update', 'projects.delete', 'projects.manage',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.delete', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read', 'executions.delete',
    'reports.read', 'reports.export', 'reports.create',
  ],
  maintainer: [
    'projects.update',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.delete', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read',
    'reports.read', 'reports.export', 'reports.create',
  ],
  contributor: [
    'test_suites.read', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update',
    'executions.read',
    'reports.read', 'reports.export',
  ],
  viewer: [
    'test_suites.read',
    'test_cases.read',
    'executions.read',
    'reports.read',
  ],
};

// ============================================
// TIPOS DE USUARIO
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  globalRole: GlobalRole;
  status: 'active' | 'inactive' | 'pending';
  ssoSource?: 'microsoft' | 'google' | 'okta' | null;
  lastLogin?: string;
  createdAt: string;
  projectRoles: ProjectMembership[];
}

export interface ProjectMembership {
  projectId: string;
  projectName: string;
  projectKey: string;
  role: ProjectRole;
  addedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcula permisos efectivos combinando rol global + rol por proyecto
 */
export function calculateEffectivePermissions(
  globalRole: GlobalRole,
  projectRole?: ProjectRole
): Permission[] {
  const globalPerms = GLOBAL_ROLE_PERMISSIONS[globalRole] || [];
  
  if (!projectRole) {
    return globalPerms;
  }
  
  const projectPerms = PROJECT_ROLE_PERMISSIONS[projectRole] || [];
  
  // Combinar permisos únicos
  return Array.from(new Set([...globalPerms, ...projectPerms]));
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(
  globalRole: GlobalRole,
  permission: Permission,
  projectRole?: ProjectRole
): boolean {
  const effectivePerms = calculateEffectivePermissions(globalRole, projectRole);
  return effectivePerms.includes(permission);
}

/**
 * Obtiene el nivel de acceso más alto entre rol global y proyecto
 */
export function getHighestRoleLevel(
  globalRole: GlobalRole,
  projectRole?: ProjectRole
): number {
  const globalLevel = GLOBAL_ROLES[globalRole].level;
  const projectLevel = projectRole ? PROJECT_ROLES[projectRole].level : 0;
  return Math.max(globalLevel, projectLevel);
}

/**
 * Verifica si puede gestionar usuarios
 */
export function canManageUsers(globalRole: GlobalRole): boolean {
  return hasPermission(globalRole, 'users.manage_permissions');
}

/**
 * Verifica si puede editar roles globales
 */
export function canEditGlobalRoles(globalRole: GlobalRole): boolean {
  return globalRole === 'admin';
}

/**
 * Verifica si puede editar roles por proyecto
 */
export function canEditProjectRoles(
  globalRole: GlobalRole,
  userProjectRole?: ProjectRole
): boolean {
  // Admin siempre puede
  if (globalRole === 'admin') return true;
  
  // Owner o Maintainer del proyecto pueden
  if (userProjectRole === 'owner' || userProjectRole === 'maintainer') return true;
  
  // Manager puede si tiene permiso global
  return globalRole === 'manager';
}