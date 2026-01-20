# Guía de Migración: Mock Backend → PostgreSQL/Supabase

## 📋 Tabla de Contenidos
- [Visión General](#visión-general)
- [Estado Actual](#estado-actual)
- [Proceso de Migración](#proceso-de-migración)
- [Configuración de Supabase](#configuración-de-supabase)
- [Migración por Módulo](#migración-por-módulo)
- [Testing y Validación](#testing-y-validación)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visión General

Esta guía documenta el proceso completo de migración desde el Mock Backend (`/src/services/mock-backend.ts`) hacia la base de datos real PostgreSQL/Supabase.

### ¿Por qué migrar?

| Aspecto | Mock Backend | Database Real |
|---------|--------------|---------------|
| **Persistencia** | ❌ Datos en memoria (se pierden al recargar) | ✅ Datos persistentes |
| **Concurrencia** | ❌ Solo funciona en un navegador | ✅ Multi-usuario real |
| **Escalabilidad** | ❌ Limitado a localStorage | ✅ Sin límites |
| **Seguridad** | ⚠️ Básica (cliente) | ✅ Row Level Security (RLS) |
| **Relaciones** | ⚠️ Simuladas | ✅ Foreign Keys reales |

---

## 📊 Estado Actual

### Mock Backend Implementado
```typescript
// /src/services/mock-backend.ts
export const mockBackend = {
  // ✅ Implementado y funcionando
  users: { ... },
  roles: { ... },
  permissions: { ... },
  projects: { ... },
  testCases: { ... },
  executions: { ... },
  bugs: { ... },
  integrations: { ... },
  wiki: { ... }
};
```

### Database Schema Mapeado
```
✅ 23 tablas creadas en Supabase
✅ 3 vistas (user_effective_permissions, project_team_members, wiki_page_hierarchy)
✅ Tipos TypeScript generados (/src/types/database.types.ts)
✅ Relaciones documentadas (DATABASE_RELATIONS_GUIDE.md)
```

---

## 🔧 Proceso de Migración

### Fase 1: Configuración Inicial

#### 1.1. Instalar Cliente Supabase
```bash
npm install @supabase/supabase-js
```

#### 1.2. Crear Configuración
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

#### 1.3. Variables de Entorno
```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### Fase 2: Migrar Módulo de Usuarios

#### 2.1. Adapter Pattern
Creamos un adapter que implementa la misma interfaz pero usa Supabase:

```typescript
// /src/services/database/users-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const usersDb = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async create(user: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Query con relaciones
  async getUserWithRoles(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        global_role:roles!users_global_role_id_fkey(*),
        project_roles:project_members(
          *,
          project:projects(*),
          role:roles(*)
        )
      `)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

#### 2.2. Actualizar API Service
```typescript
// /src/services/api.ts
import { mockBackend } from './mock-backend';
import { usersDb } from './database/users-db';

// Feature flag para migración gradual
const USE_REAL_DB = import.meta.env.VITE_USE_REAL_DB === 'true';

export const api = {
  users: {
    getAll: () => USE_REAL_DB ? usersDb.getAll() : mockBackend.users.getAll(),
    getById: (id: string) => USE_REAL_DB ? usersDb.getById(id) : mockBackend.users.getById(id),
    create: (user) => USE_REAL_DB ? usersDb.create(user) : mockBackend.users.create(user),
    update: (id, updates) => USE_REAL_DB ? usersDb.update(id, updates) : mockBackend.users.update(id, updates),
    delete: (id) => USE_REAL_DB ? usersDb.delete(id) : mockBackend.users.delete(id)
  }
  // ... otros módulos
};
```

---

### Fase 3: Migrar Módulo de Roles y Permisos

```typescript
// /src/services/database/roles-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type Role = Database['public']['Tables']['roles']['Row'];

export const rolesDb = {
  async getAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getRoleWithPermissions(roleId: string) {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission:permissions(*)
        )
      `)
      .eq('id', roleId)
      .single();
    
    if (error) throw error;
    
    // Transform a formato más usable
    return {
      ...data,
      permissions: data.role_permissions.map(rp => rp.permission)
    };
  },

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .insert({ role_id: roleId, permission_id: permissionId });
    
    if (error) throw error;
  },

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);
    
    if (error) throw error;
  }
};
```

---

### Fase 4: Migrar Módulo de Proyectos

```typescript
// /src/services/database/projects-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export const projectsDb = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Usar vista para obtener miembros del equipo
  async getProjectTeam(projectId: string) {
    const { data, error } = await supabase
      .from('project_team_members')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data || [];
  },

  async addTeamMember(projectId: string, userId: string, roleId: string) {
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role_id: roleId
      });
    
    if (error) throw error;
  },

  async removeTeamMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};
```

---

### Fase 5: Migrar Módulo de Test Cases

```typescript
// /src/services/database/test-cases-db.ts
import { supabase } from '../supabase-client';
import type { Database } from '@/types/database.types';

type TestCase = Database['public']['Tables']['test_cases']['Row'];

export const testCasesDb = {
  async getByProject(projectId: string): Promise<TestCase[]> {
    const { data, error } = await supabase
      .from('test_cases')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getWithSteps(testCaseId: string) {
    const { data, error } = await supabase
      .from('test_cases')
      .select(`
        *,
        steps:test_case_steps(*)
      `)
      .eq('id', testCaseId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(testCase: any): Promise<TestCase> {
    const { data, error } = await supabase
      .from('test_cases')
      .insert(testCase)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addStep(testCaseId: string, step: any) {
    const { error } = await supabase
      .from('test_case_steps')
      .insert({
        test_case_id: testCaseId,
        ...step
      });
    
    if (error) throw error;
  }
};
```

---

## 🧪 Testing y Validación

### 1. Tests Unitarios
```typescript
// /src/services/database/__tests__/users-db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { usersDb } from '../users-db';

describe('usersDb', () => {
  it('should fetch all users', async () => {
    const users = await usersDb.getAll();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should create a user', async () => {
    const newUser = {
      email: 'test@example.com',
      full_name: 'Test User',
      global_role_id: 'role-id'
    };
    
    const created = await usersDb.create(newUser);
    expect(created.email).toBe(newUser.email);
  });
});
```

### 2. Validación Manual
```typescript
// Script de validación
async function validateMigration() {
  console.log('🔍 Validando migración...');
  
  // 1. Verificar conexión
  const { data, error } = await supabase.from('users').select('count');
  if (error) throw new Error('No se puede conectar a Supabase');
  
  // 2. Comparar conteos
  const mockCount = mockBackend.users.getAll().length;
  const dbCount = data[0].count;
  console.log(`Mock: ${mockCount} usuarios, DB: ${dbCount} usuarios`);
  
  // 3. Verificar relaciones
  const user = await usersDb.getUserWithRoles('user-id');
  console.log('✅ Relaciones funcionando:', user);
  
  console.log('✅ Migración validada');
}
```

---

## 🔄 Migración por Módulo

### Checklist de Migración

- [ ] **Usuarios**
  - [ ] Crear `/src/services/database/users-db.ts`
  - [ ] Implementar CRUD básico
  - [ ] Agregar queries con relaciones (global_role, project_roles)
  - [ ] Actualizar `/src/services/api.ts`
  - [ ] Testing

- [ ] **Roles y Permisos**
  - [ ] Crear `/src/services/database/roles-db.ts`
  - [ ] Implementar gestión de role_permissions
  - [ ] Usar vista `user_effective_permissions`
  - [ ] Testing

- [ ] **Proyectos**
  - [ ] Crear `/src/services/database/projects-db.ts`
  - [ ] Implementar gestión de project_members
  - [ ] Usar vista `project_team_members`
  - [ ] Testing

- [ ] **Test Cases**
  - [ ] Crear `/src/services/database/test-cases-db.ts`
  - [ ] Implementar gestión de test_case_steps
  - [ ] Testing

- [ ] **Executions**
  - [ ] Crear `/src/services/database/executions-db.ts`
  - [ ] Implementar gestión de execution_results
  - [ ] Testing

- [ ] **Bugs**
  - [ ] Crear `/src/services/database/bugs-db.ts`
  - [ ] Implementar gestión de bug_attachments
  - [ ] Testing

- [ ] **Wiki**
  - [ ] Crear `/src/services/database/wiki-db.ts`
  - [ ] Usar vista `wiki_page_hierarchy`
  - [ ] Implementar versioning
  - [ ] Testing

- [ ] **Integraciones**
  - [ ] Crear `/src/services/database/integrations-db.ts`
  - [ ] Implementar encriptación de credentials
  - [ ] Testing

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solución:** Verifica que `.env.local` tiene las variables correctas.

### Error: "JWT expired"
**Solución:** El token de Supabase expiró. Implementa refresh automático:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

### Error: "Row Level Security policy violation"
**Solución:** Verifica las políticas RLS en Supabase Dashboard.

### Performance: Queries lentas
**Solución:** Agrega índices:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_test_cases_project ON test_cases(project_id);
```

---

## 📚 Recursos

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- Ver: `/docs/05-BASE-DATOS/02-TIPOS-TYPESCRIPT.md`
- Ver: `/docs/05-BASE-DATOS/03-CONSULTAS-SQL.md`

---

**Última actualización:** Enero 2026  
**Mantenido por:** Equipo HAIDA
