# Database Cheat Sheet - HAIDA

Referencia rápida para trabajar con la base de datos de HAIDA.

---

## 🚀 Setup Rápido

```typescript
// 1. Instalar
npm install @supabase/supabase-js

// 2. Configurar cliente
// /src/services/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 3. .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 📊 Tablas Principales

| Tabla | Propósito | FK Principal |
|-------|-----------|--------------|
| `users` | Usuarios | `global_role_id` → roles |
| `roles` | Roles | - |
| `permissions` | Permisos | - |
| `role_permissions` | Roles ↔ Permisos | `role_id`, `permission_id` |
| `projects` | Proyectos | `created_by` → users |
| `project_members` | Users ↔ Projects | `project_id`, `user_id`, `role_id` |
| `test_cases` | Test cases | `project_id` → projects |
| `test_case_steps` | Steps de tests | `test_case_id` → test_cases |
| `executions` | Ejecuciones | `project_id` → projects |
| `execution_results` | Resultados | `execution_id`, `test_case_id` |
| `bugs` | Bugs | `project_id`, `reported_by`, `assigned_to` |
| `wiki_pages` | Wiki | `project_id`, `parent_page_id` (self) |
| `integrations` | Integraciones | `project_id` → projects |

---

## 🔍 Queries Comunes

### SELECT básico
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active');
```

### SELECT con JOIN
```typescript
const { data } = await supabase
  .from('users')
  .select(`
    *,
    global_role:roles!users_global_role_id_fkey(*)
  `)
  .eq('id', userId)
  .single();
```

### INSERT
```typescript
const { data, error } = await supabase
  .from('users')
  .insert({ email: 'user@example.com', full_name: 'John' })
  .select()
  .single();
```

### UPDATE
```typescript
const { data, error } = await supabase
  .from('users')
  .update({ status: 'active' })
  .eq('id', userId)
  .select()
  .single();
```

### DELETE
```typescript
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);
```

### BÚSQUEDA
```typescript
// Case-insensitive
const { data } = await supabase
  .from('users')
  .select('*')
  .ilike('full_name', '%john%');

// Múltiples campos
const { data } = await supabase
  .from('test_cases')
  .select('*')
  .or('title.ilike.%test%,description.ilike.%test%');
```

### PAGINACIÓN
```typescript
const PAGE_SIZE = 20;
const page = 2;

const { data, count } = await supabase
  .from('test_cases')
  .select('*', { count: 'exact' })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  .order('created_at', { ascending: false });
```

### CONTAR
```typescript
const { count } = await supabase
  .from('test_cases')
  .select('*', { count: 'exact', head: true })
  .eq('project_id', projectId);
```

---

## 🔗 Vistas SQL

### user_effective_permissions
```typescript
// Obtener todos los permisos de un usuario
const { data: permissions } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId);

// Verificar permiso específico
const { data: hasPermission } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId)
  .eq('permission_name', 'projects.create')
  .maybeSingle();

const canCreate = !!hasPermission;
```

### project_team_members
```typescript
// Obtener equipo del proyecto
const { data: team } = await supabase
  .from('project_team_members')
  .select('*')
  .eq('project_id', projectId);
```

### wiki_page_hierarchy
```typescript
// Obtener jerarquía completa
const { data: wikiTree } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('project_id', projectId)
  .order('path');
```

---

## 📝 Tipos TypeScript

### Extraer tipos
```typescript
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type Project = Database['public']['Tables']['projects']['Row'];
type TestCase = Database['public']['Tables']['test_cases']['Row'];
```

### Enums
```typescript
type UserStatus = 'active' | 'inactive' | 'pending';
type ProjectStatus = 'active' | 'archived' | 'planning';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type ExecutionResultStatus = 'passed' | 'failed' | 'blocked' | 'skipped';
type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
```

---

## 🔐 Permisos

### Verificar permiso
```typescript
async function userHasPermission(
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
    query.or(`source.eq.global,project_id.eq.${projectId}`);
  }
  
  const { data } = await query.maybeSingle();
  return !!data;
}
```

### Agregar usuario a proyecto
```typescript
await supabase
  .from('project_members')
  .insert({
    project_id: projectId,
    user_id: userId,
    role_id: roleId
  });
```

### Asignar permiso a rol
```typescript
await supabase
  .from('role_permissions')
  .insert({
    role_id: roleId,
    permission_id: permissionId
  });
```

---

## 🏗️ Relaciones Comunes

### Usuario completo
```typescript
const { data } = await supabase
  .from('users')
  .select(`
    *,
    global_role:roles!users_global_role_id_fkey(*),
    project_memberships:project_members(
      *,
      project:projects(*),
      role:roles(*)
    )
  `)
  .eq('id', userId)
  .single();
```

### Proyecto con equipo
```typescript
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    created_by_user:users!projects_created_by_fkey(*),
    team:project_members(
      *,
      user:users(*),
      role:roles(*)
    )
  `)
  .eq('id', projectId)
  .single();
```

### Test case con steps
```typescript
const { data } = await supabase
  .from('test_cases')
  .select(`
    *,
    steps:test_case_steps(*)
  `)
  .eq('id', testCaseId)
  .single();
```

### Ejecución con resultados
```typescript
const { data } = await supabase
  .from('executions')
  .select(`
    *,
    results:execution_results(
      *,
      test_case:test_cases(*)
    )
  `)
  .eq('id', executionId)
  .single();
```

---

## ❌ Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
} catch (err) {
  if (err.code === '23505') {
    console.error('Duplicate record');
  } else if (err.code === '23503') {
    console.error('Foreign key violation');
  } else if (err.code === 'PGRST116') {
    console.error('Not found');
  } else {
    console.error('Unknown error:', err);
  }
  throw err;
}
```

---

## 🎣 React Hook Ejemplo

```typescript
function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
    } finally {
      setLoading(false);
    }
  }

  return { users, loading, reload: loadUsers };
}
```

---

## 🔧 Service Layer Pattern

```typescript
// /src/services/database/users-db.ts
import { supabase } from '../supabase-client';

export const usersDb = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(user: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
```

---

## 📚 Recursos

- **Guía completa:** [README.md](./README.md)
- **Migración:** [01-MIGRACION-MOCK-A-DATABASE.md](./01-MIGRACION-MOCK-A-DATABASE.md)
- **Tipos:** [02-TIPOS-TYPESCRIPT.md](./02-TIPOS-TYPESCRIPT.md)
- **Queries:** [03-CONSULTAS-SQL.md](./03-CONSULTAS-SQL.md)
- **Relaciones:** [04-RELACIONES-DATABASE.md](./04-RELACIONES-DATABASE.md)
- **Ejemplos:** [05-EJEMPLOS-INTEGRACION.md](./05-EJEMPLOS-INTEGRACION.md)

---

## 🔗 Links Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Última actualización:** Enero 2026  
**Versión:** HAIDA 1.0
