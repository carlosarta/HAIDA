# Ejemplos Prácticos de Integración con la Database

## 📋 Tabla de Contenidos
- [Setup Inicial](#setup-inicial)
- [Ejemplo 1: Gestión de Usuarios](#ejemplo-1-gestión-de-usuarios)
- [Ejemplo 2: Sistema de Proyectos](#ejemplo-2-sistema-de-proyectos)
- [Ejemplo 3: Test Cases con Steps](#ejemplo-3-test-cases-con-steps)
- [Ejemplo 4: Ejecuciones y Resultados](#ejemplo-4-ejecuciones-y-resultados)
- [Ejemplo 5: Sistema de Permisos](#ejemplo-5-sistema-de-permisos)
- [Ejemplo 6: Wiki con Jerarquía](#ejemplo-6-wiki-con-jerarquía)
- [Ejemplo 7: React Hooks](#ejemplo-7-react-hooks)
- [Ejemplo 8: Error Handling](#ejemplo-8-error-handling)

---

## 🛠️ Setup Inicial

### 1. Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Cliente Supabase

```typescript
// /src/services/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionUrl: true
  }
});
```

### 3. Variables de Entorno

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_REAL_DB=true
```

---

## 📝 Ejemplo 1: Gestión de Usuarios

### Service Layer

```typescript
// /src/services/database/users-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const usersDb = {
  /**
   * Obtener todos los usuarios
   */
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener usuario por ID con su rol global
   */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        global_role:roles!users_global_role_id_fkey(
          id,
          name,
          description,
          is_global
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Obtener usuario completo con todos sus roles y proyectos
   */
  async getUserComplete(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        global_role:roles!users_global_role_id_fkey(*),
        project_memberships:project_members(
          id,
          project:projects(
            id,
            name,
            status,
            description
          ),
          role:roles(
            id,
            name,
            description
          )
        ),
        created_projects:projects!projects_created_by_fkey(
          id,
          name,
          status,
          created_at
        )
      `)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Crear usuario
   */
  async create(user: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Actualizar usuario
   */
  async update(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Cambiar rol global
   */
  async changeGlobalRole(userId: string, roleId: string): Promise<User> {
    return this.update(userId, { global_role_id: roleId });
  },

  /**
   * Cambiar estado
   */
  async updateStatus(
    userId: string, 
    status: 'active' | 'inactive' | 'pending'
  ): Promise<User> {
    return this.update(userId, { status });
  },

  /**
   * Buscar usuarios
   */
  async search(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Eliminar usuario
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
```

### React Component

```typescript
// /src/app/components/users/UserManagement.tsx
import { useState, useEffect } from 'react';
import { usersDb } from '@/services/database/users-db';
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await usersDb.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(userId: string, status: 'active' | 'inactive' | 'pending') {
    try {
      await usersDb.updateStatus(userId, status);
      await loadUsers(); // Reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td>
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(
                    user.id, 
                    e.target.value as any
                  )}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🏗️ Ejemplo 2: Sistema de Proyectos

### Service Layer

```typescript
// /src/services/database/projects-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export const projectsDb = {
  /**
   * Obtener todos los proyectos
   */
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener proyecto completo con equipo
   */
  async getProjectWithTeam(projectId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_user:users!projects_created_by_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        team:project_members(
          id,
          user:users(
            id,
            full_name,
            email,
            avatar_url,
            status
          ),
          role:roles(
            id,
            name,
            description
          )
        )
      `)
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Crear proyecto y agregar creador como miembro
   */
  async createWithMember(
    project: Omit<ProjectInsert, 'id'>,
    creatorRoleId: string
  ): Promise<Project> {
    // 1. Crear proyecto
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (projectError) throw projectError;

    // 2. Agregar creador como miembro
    const { error: memberError } = await supabase
      .from('project_members')
      .insert({
        project_id: newProject.id,
        user_id: project.created_by,
        role_id: creatorRoleId
      });
    
    if (memberError) throw memberError;

    return newProject;
  },

  /**
   * Agregar miembro al equipo
   */
  async addTeamMember(
    projectId: string,
    userId: string,
    roleId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role_id: roleId
      });
    
    if (error) throw error;
  },

  /**
   * Cambiar rol de miembro
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    newRoleId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .update({ role_id: newRoleId })
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  /**
   * Remover miembro del equipo
   */
  async removeTeamMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  /**
   * Obtener estadísticas del proyecto
   */
  async getProjectStats(projectId: string) {
    // Test Cases count
    const { count: testCasesCount } = await supabase
      .from('test_cases')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    // Bugs abiertos
    const { count: openBugsCount } = await supabase
      .from('bugs')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .in('status', ['open', 'in_progress']);

    // Última ejecución
    const { data: lastExecution } = await supabase
      .from('executions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      testCases: testCasesCount || 0,
      openBugs: openBugsCount || 0,
      lastExecution
    };
  }
};
```

---

## ✅ Ejemplo 3: Test Cases con Steps

### Service Layer

```typescript
// /src/services/database/test-cases-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type TestCase = Database['public']['Tables']['test_cases']['Row'];
type TestCaseStep = Database['public']['Tables']['test_case_steps']['Row'];

export const testCasesDb = {
  /**
   * Crear test case con steps
   */
  async createWithSteps(
    testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>,
    steps: Array<Omit<TestCaseStep, 'id' | 'test_case_id' | 'created_at'>>
  ): Promise<TestCase> {
    // 1. Crear test case
    const { data: newTestCase, error: tcError } = await supabase
      .from('test_cases')
      .insert(testCase)
      .select()
      .single();
    
    if (tcError) throw tcError;

    // 2. Crear steps
    if (steps.length > 0) {
      const stepsToInsert = steps.map(step => ({
        ...step,
        test_case_id: newTestCase.id
      }));

      const { error: stepsError } = await supabase
        .from('test_case_steps')
        .insert(stepsToInsert);
      
      if (stepsError) throw stepsError;
    }

    return newTestCase;
  },

  /**
   * Obtener test case con steps
   */
  async getWithSteps(testCaseId: string) {
    const { data, error } = await supabase
      .from('test_cases')
      .select(`
        *,
        project:projects(id, name),
        created_by_user:users!test_cases_created_by_fkey(
          id,
          full_name,
          email
        ),
        steps:test_case_steps(*)
      `)
      .eq('id', testCaseId)
      .single();
    
    if (error) throw error;

    // Ordenar steps
    data.steps.sort((a, b) => a.step_number - b.step_number);

    return data;
  },

  /**
   * Actualizar steps de test case
   */
  async updateSteps(
    testCaseId: string,
    steps: Array<Omit<TestCaseStep, 'id' | 'test_case_id' | 'created_at'>>
  ): Promise<void> {
    // 1. Eliminar steps existentes
    const { error: deleteError } = await supabase
      .from('test_case_steps')
      .delete()
      .eq('test_case_id', testCaseId);
    
    if (deleteError) throw deleteError;

    // 2. Insertar nuevos steps
    if (steps.length > 0) {
      const stepsToInsert = steps.map(step => ({
        ...step,
        test_case_id: testCaseId
      }));

      const { error: insertError } = await supabase
        .from('test_case_steps')
        .insert(stepsToInsert);
      
      if (insertError) throw insertError;
    }
  }
};
```

---

## 🎯 Ejemplo 4: Ejecuciones y Resultados

### Service Layer

```typescript
// /src/services/database/executions-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type Execution = Database['public']['Tables']['executions']['Row'];
type ExecutionResult = Database['public']['Tables']['execution_results']['Row'];

export const executionsDb = {
  /**
   * Crear ejecución con resultados
   */
  async createWithResults(
    execution: Omit<Execution, 'id' | 'created_at'>,
    testCaseIds: string[]
  ): Promise<Execution> {
    // 1. Crear ejecución
    const { data: newExecution, error: execError } = await supabase
      .from('executions')
      .insert(execution)
      .select()
      .single();
    
    if (execError) throw execError;

    // 2. Crear resultados (pending) para cada test case
    const results = testCaseIds.map(testCaseId => ({
      execution_id: newExecution.id,
      test_case_id: testCaseId,
      status: 'pending' as const,
      executed_by: execution.executed_by,
      executed_at: new Date().toISOString()
    }));

    const { error: resultsError } = await supabase
      .from('execution_results')
      .insert(results);
    
    if (resultsError) throw resultsError;

    return newExecution;
  },

  /**
   * Actualizar resultado de test case
   */
  async updateResult(
    resultId: string,
    status: 'passed' | 'failed' | 'blocked' | 'skipped',
    notes?: string,
    durationSeconds?: number
  ): Promise<ExecutionResult> {
    const { data, error } = await supabase
      .from('execution_results')
      .update({
        status,
        notes: notes || null,
        duration_seconds: durationSeconds || null,
        executed_at: new Date().toISOString()
      })
      .eq('id', resultId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Completar ejecución (calcular estadísticas)
   */
  async complete(executionId: string): Promise<Execution> {
    // 1. Obtener resultados
    const { data: results, error: resultsError } = await supabase
      .from('execution_results')
      .select('status')
      .eq('execution_id', executionId);
    
    if (resultsError) throw resultsError;

    // 2. Calcular stats
    const stats = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Actualizar ejecución
    const { data: execution, error: execError } = await supabase
      .from('executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)
      .select()
      .single();
    
    if (execError) throw execError;
    return execution;
  },

  /**
   * Obtener ejecución completa con resultados
   */
  async getWithResults(executionId: string) {
    const { data, error } = await supabase
      .from('executions')
      .select(`
        *,
        project:projects(id, name),
        executed_by_user:users!executions_executed_by_fkey(
          id,
          full_name,
          email
        ),
        results:execution_results(
          id,
          status,
          notes,
          duration_seconds,
          executed_at,
          test_case:test_cases(
            id,
            title,
            priority
          )
        )
      `)
      .eq('id', executionId)
      .single();
    
    if (error) throw error;

    // Calcular estadísticas
    const stats = data.results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...data,
      stats: {
        total: data.results.length,
        passed: stats.passed || 0,
        failed: stats.failed || 0,
        blocked: stats.blocked || 0,
        skipped: stats.skipped || 0
      }
    };
  }
};
```

---

## 🔐 Ejemplo 5: Sistema de Permisos

### Service Layer

```typescript
// /src/services/database/permissions-db.ts
import { supabase } from '../supabase-client';

export const permissionsDb = {
  /**
   * Verificar si usuario tiene permiso
   */
  async userHasPermission(
    userId: string,
    permissionName: string,
    projectId?: string
  ): Promise<boolean> {
    const query = supabase
      .from('user_effective_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('permission_name', permissionName);
    
    if (projectId) {
      // Permiso global O permiso específico del proyecto
      query.or(`source.eq.global,project_id.eq.${projectId}`);
    }
    
    const { data } = await query.maybeSingle();
    return !!data;
  },

  /**
   * Obtener todos los permisos de un usuario
   */
  async getUserPermissions(userId: string, projectId?: string) {
    const query = supabase
      .from('user_effective_permissions')
      .select('*')
      .eq('user_id', userId);
    
    if (projectId) {
      query.or(`source.eq.global,project_id.eq.${projectId}`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Asignar permiso a rol
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission_id: permissionId
      });
    
    if (error) throw error;
  },

  /**
   * Remover permiso de rol
   */
  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);
    
    if (error) throw error;
  },

  /**
   * Obtener matriz de permisos de usuario
   */
  async getPermissionMatrix(userId: string) {
    const permissions = await this.getUserPermissions(userId);
    
    // Agrupar por recurso
    const matrix = permissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push({
        action: perm.action,
        source: perm.source,
        role: perm.role_name,
        project: perm.project_id
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    return matrix;
  }
};
```

### React Hook

```typescript
// /src/hooks/usePermissions.ts
import { useState, useEffect } from 'react';
import { permissionsDb } from '@/services/database/permissions-db';
import { useAuth } from '@/app/context/auth-context';

export function usePermissions(projectId?: string) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPermissions();
    }
  }, [user, projectId]);

  async function loadPermissions() {
    try {
      setLoading(true);
      const perms = await permissionsDb.getUserPermissions(user.id, projectId);
      setPermissions(perms.map(p => p.permission_name));
    } finally {
      setLoading(false);
    }
  }

  function hasPermission(permissionName: string): boolean {
    return permissions.includes(permissionName);
  }

  function canCreate(resource: string): boolean {
    return hasPermission(`${resource}.create`);
  }

  function canEdit(resource: string): boolean {
    return hasPermission(`${resource}.update`);
  }

  function canDelete(resource: string): boolean {
    return hasPermission(`${resource}.delete`);
  }

  return {
    permissions,
    loading,
    hasPermission,
    canCreate,
    canEdit,
    canDelete
  };
}
```

---

## 📚 Ejemplo 6: Wiki con Jerarquía

### Service Layer

```typescript
// /src/services/database/wiki-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type WikiPage = Database['public']['Tables']['wiki_pages']['Row'];

export const wikiDb = {
  /**
   * Obtener jerarquía completa usando vista
   */
  async getProjectWikiTree(projectId: string) {
    const { data, error } = await supabase
      .from('wiki_page_hierarchy')
      .select('*')
      .eq('project_id', projectId)
      .order('path');
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener páginas raíz (nivel 0)
   */
  async getRootPages(projectId: string) {
    const { data, error } = await supabase
      .from('wiki_page_hierarchy')
      .select('*')
      .eq('project_id', projectId)
      .eq('level', 0)
      .order('page_title');
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener hijos de una página
   */
  async getChildPages(parentPageId: string) {
    const { data, error } = await supabase
      .from('wiki_page_hierarchy')
      .select('*')
      .eq('parent_page_id', parentPageId)
      .order('page_title');
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Crear página con versión
   */
  async createPage(
    page: Omit<WikiPage, 'id' | 'created_at' | 'updated_at'>
  ): Promise<WikiPage> {
    // 1. Crear página
    const { data: newPage, error: pageError } = await supabase
      .from('wiki_pages')
      .insert(page)
      .select()
      .single();
    
    if (pageError) throw pageError;

    // 2. Crear primera versión
    const { error: versionError } = await supabase
      .from('wiki_page_versions')
      .insert({
        wiki_page_id: newPage.id,
        content: page.content,
        version_number: 1,
        created_by: page.created_by
      });
    
    if (versionError) throw versionError;

    return newPage;
  },

  /**
   * Actualizar página (crear nueva versión)
   */
  async updatePage(
    pageId: string,
    content: string,
    userId: string
  ): Promise<WikiPage> {
    // 1. Obtener última versión
    const { data: versions } = await supabase
      .from('wiki_page_versions')
      .select('version_number')
      .eq('wiki_page_id', pageId)
      .order('version_number', { ascending: false })
      .limit(1);
    
    const lastVersion = versions?.[0]?.version_number || 0;

    // 2. Actualizar página
    const { data: updatedPage, error: updateError } = await supabase
      .from('wiki_pages')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', pageId)
      .select()
      .single();
    
    if (updateError) throw updateError;

    // 3. Crear nueva versión
    const { error: versionError } = await supabase
      .from('wiki_page_versions')
      .insert({
        wiki_page_id: pageId,
        content,
        version_number: lastVersion + 1,
        created_by: userId
      });
    
    if (versionError) throw versionError;

    return updatedPage;
  }
};
```

---

## ⚛️ Ejemplo 7: React Hooks

### Custom Hook para Entidades

```typescript
// /src/hooks/useEntity.ts
import { useState, useEffect } from 'react';

interface UseEntityOptions<T> {
  fetch: () => Promise<T[]>;
  create?: (data: any) => Promise<T>;
  update?: (id: string, data: any) => Promise<T>;
  delete?: (id: string) => Promise<void>;
}

export function useEntity<T extends { id: string }>(
  options: UseEntityOptions<T>
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await options.fetch();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }

  async function create(data: any): Promise<T | null> {
    if (!options.create) return null;
    try {
      const item = await options.create(data);
      setItems(prev => [item, ...prev]);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating');
      return null;
    }
  }

  async function update(id: string, data: any): Promise<T | null> {
    if (!options.update) return null;
    try {
      const item = await options.update(id, data);
      setItems(prev => prev.map(i => i.id === id ? item : i));
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating');
      return null;
    }
  }

  async function remove(id: string): Promise<boolean> {
    if (!options.delete) return false;
    try {
      await options.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting');
      return false;
    }
  }

  return {
    items,
    loading,
    error,
    reload: load,
    create,
    update,
    remove
  };
}
```

### Uso del Hook

```typescript
// En un componente
import { useEntity } from '@/hooks/useEntity';
import { projectsDb } from '@/services/database/projects-db';

export function ProjectsList() {
  const {
    items: projects,
    loading,
    error,
    reload,
    create,
    remove
  } = useEntity({
    fetch: () => projectsDb.getAll(),
    create: (data) => projectsDb.create(data),
    delete: (id) => projectsDb.delete(id)
  });

  // Usar projects, loading, error, etc...
}
```

---

## ❌ Ejemplo 8: Error Handling

### Error Handler Centralizado

```typescript
// /src/services/database/error-handler.ts
import { PostgrestError } from '@supabase/supabase-js';

export class DatabaseError extends Error {
  code: string;
  details: string;
  hint: string;

  constructor(error: PostgrestError) {
    super(error.message);
    this.name = 'DatabaseError';
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

export function handleDatabaseError(error: unknown): never {
  if (isPostgrestError(error)) {
    throw new DatabaseError(error);
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('Unknown database error');
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case '23505': // Unique violation
        return 'Este registro ya existe';
      case '23503': // Foreign key violation
        return 'No se puede eliminar porque está siendo usado';
      case 'PGRST116': // Not found
        return 'Registro no encontrado';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Error desconocido';
}
```

### Uso

```typescript
import { handleDatabaseError, getFriendlyErrorMessage } from './error-handler';

async function createUser(userData: any) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) handleDatabaseError(error);
    return data;
  } catch (err) {
    const message = getFriendlyErrorMessage(err);
    console.error('Error creating user:', message);
    throw err;
  }
}
```

---

## 📚 Recursos

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [React Query con Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- Ver: [01-MIGRACION-MOCK-A-DATABASE.md](./01-MIGRACION-MOCK-A-DATABASE.md)
- Ver: [02-TIPOS-TYPESCRIPT.md](./02-TIPOS-TYPESCRIPT.md)
- Ver: [03-CONSULTAS-SQL.md](./03-CONSULTAS-SQL.md)

---

**Última actualización:** Enero 2026  
**Mantenido por:** Equipo HAIDA
