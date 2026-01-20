# Guía de Tipos TypeScript de la Base de Datos

## 📋 Tabla de Contenidos
- [Visión General](#visión-general)
- [Estructura de Tipos](#estructura-de-tipos)
- [Uso de Tipos](#uso-de-tipos)
- [Tipos por Tabla](#tipos-por-tabla)
- [Helpers y Utilities](#helpers-y-utilities)
- [Best Practices](#best-practices)

---

## 🎯 Visión General

Los tipos TypeScript para la base de datos están completamente generados y sincronizados con el schema de PostgreSQL/Supabase en `/src/types/database.types.ts`.

### Ventajas
✅ **Type Safety:** Errores de tipo detectados en compile-time  
✅ **Autocomplete:** IntelliSense completo en VSCode  
✅ **Refactoring:** Renombrado seguro de propiedades  
✅ **Documentación:** Los tipos sirven como documentación viva  

---

## 📦 Estructura de Tipos

### Jerarquía de Tipos

```typescript
// /src/types/database.types.ts

export interface Database {
  public: {
    Tables: { ... }      // Tablas de la base de datos
    Views: { ... }       // Vistas SQL
    Functions: { ... }   // Funciones PostgreSQL
    Enums: { ... }       // Tipos ENUM
  }
}
```

### Tipos por Tabla

Cada tabla tiene 4 tipos automáticos:

```typescript
type TableName = Database['public']['Tables']['nombre_tabla']

// 1. Row - Fila completa (lectura desde DB)
type Row = TableName['Row']

// 2. Insert - Datos para INSERT (campos opcionales con defaults)
type Insert = TableName['Insert']

// 3. Update - Datos para UPDATE (todos campos opcionales)
type Update = TableName['Update']

// 4. Relationships - Relaciones con otras tablas
type Relationships = TableName['Relationships']
```

---

## 🔧 Uso de Tipos

### Ejemplo 1: CRUD Básico

```typescript
import type { Database } from '@/types/database.types';

// Extraer tipos
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// Función con tipo de retorno
async function getUser(id: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  return data;
}

// Función para crear
async function createUser(user: UserInsert): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Función para actualizar
async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### Ejemplo 2: Queries con Relaciones

```typescript
// Query con JOIN
async function getUserWithRole(userId: string) {
  const { data } = await supabase
    .from('users')
    .select(`
      *,
      global_role:roles!users_global_role_id_fkey(*)
    `)
    .eq('id', userId)
    .single();
  
  return data;
}

// Tipo de retorno inferido automáticamente:
type UserWithRole = {
  id: string;
  email: string;
  full_name: string;
  // ... otros campos de User
  global_role: {
    id: string;
    name: string;
    description: string | null;
    // ... otros campos de Role
  }
}
```

### Ejemplo 3: Componentes React

```typescript
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  return (
    <div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <span>Status: {project.status}</span>
      <button onClick={() => onEdit(project.id)}>Edit</button>
    </div>
  );
}
```

---

## 📊 Tipos por Tabla

### 1. Users

```typescript
type User = {
  id: string;                           // UUID, PK
  email: string;                        // UNIQUE, NOT NULL
  full_name: string;                    // NOT NULL
  avatar_url: string | null;
  global_role_id: string;               // FK → roles
  status: 'active' | 'inactive' | 'pending';
  created_at: string;                   // timestamp
  updated_at: string;                   // timestamp
};

type UserInsert = {
  id?: string;                          // Opcional (generado auto)
  email: string;                        // Requerido
  full_name: string;                    // Requerido
  avatar_url?: string | null;
  global_role_id: string;               // Requerido
  status?: 'active' | 'inactive' | 'pending'; // Default: 'pending'
  created_at?: string;                  // Default: now()
  updated_at?: string;                  // Default: now()
};

type UserUpdate = {
  email?: string;
  full_name?: string;
  avatar_url?: string | null;
  global_role_id?: string;
  status?: 'active' | 'inactive' | 'pending';
  updated_at?: string;
};
```

### 2. Roles

```typescript
type Role = {
  id: string;                           // UUID, PK
  name: string;                         // UNIQUE, NOT NULL
  description: string | null;
  is_global: boolean;                   // true = Global, false = Project
  created_at: string;
};

type RoleInsert = {
  id?: string;
  name: string;
  description?: string | null;
  is_global?: boolean;                  // Default: true
  created_at?: string;
};
```

### 3. Permissions

```typescript
type Permission = {
  id: string;                           // UUID, PK
  name: string;                         // UNIQUE, NOT NULL
  description: string | null;
  resource: string;                     // ej: 'projects', 'test_cases'
  action: string;                       // ej: 'create', 'read', 'update', 'delete'
  created_at: string;
};
```

### 4. Projects

```typescript
type Project = {
  id: string;                           // UUID, PK
  name: string;                         // NOT NULL
  description: string | null;
  status: 'active' | 'archived' | 'planning';
  start_date: string | null;            // date
  end_date: string | null;              // date
  created_by: string;                   // FK → users
  created_at: string;
  updated_at: string;
};

type ProjectInsert = {
  id?: string;
  name: string;
  description?: string | null;
  status?: 'active' | 'archived' | 'planning'; // Default: 'planning'
  start_date?: string | null;
  end_date?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
};
```

### 5. Test Cases

```typescript
type TestCase = {
  id: string;                           // UUID, PK
  project_id: string;                   // FK → projects
  title: string;                        // NOT NULL
  description: string | null;
  preconditions: string | null;
  expected_result: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'manual' | 'automated';
  status: 'draft' | 'ready' | 'deprecated';
  created_by: string;                   // FK → users
  created_at: string;
  updated_at: string;
};
```

### 6. Test Case Steps

```typescript
type TestCaseStep = {
  id: string;                           // UUID, PK
  test_case_id: string;                 // FK → test_cases
  step_number: number;                  // NOT NULL
  description: string;                  // NOT NULL
  expected_result: string | null;
  created_at: string;
};
```

### 7. Executions

```typescript
type Execution = {
  id: string;                           // UUID, PK
  project_id: string;                   // FK → projects
  name: string;                         // NOT NULL
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  executed_by: string;                  // FK → users
  started_at: string | null;            // timestamp
  completed_at: string | null;          // timestamp
  created_at: string;
};
```

### 8. Execution Results

```typescript
type ExecutionResult = {
  id: string;                           // UUID, PK
  execution_id: string;                 // FK → executions
  test_case_id: string;                 // FK → test_cases
  status: 'passed' | 'failed' | 'blocked' | 'skipped';
  notes: string | null;
  executed_by: string;                  // FK → users
  executed_at: string;                  // timestamp
  duration_seconds: number | null;
  created_at: string;
};
```

### 9. Bugs

```typescript
type Bug = {
  id: string;                           // UUID, PK
  project_id: string;                   // FK → projects
  title: string;                        // NOT NULL
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  reported_by: string;                  // FK → users
  assigned_to: string | null;           // FK → users
  execution_result_id: string | null;   // FK → execution_results
  created_at: string;
  updated_at: string;
};
```

### 10. Wiki Pages

```typescript
type WikiPage = {
  id: string;                           // UUID, PK
  project_id: string;                   // FK → projects
  title: string;                        // NOT NULL
  content: string;                      // NOT NULL
  parent_page_id: string | null;        // FK → wiki_pages (auto-referencia)
  layer: 'strategic' | 'tactical' | 'operational' | 'technical';
  created_by: string;                   // FK → users
  created_at: string;
  updated_at: string;
};
```

### 11. Integrations

```typescript
type Integration = {
  id: string;                           // UUID, PK
  project_id: string;                   // FK → projects
  name: string;                         // NOT NULL
  type: 'jira' | 'confluence' | 'postman' | 'telegram' | 'teams' | 'slack';
  config: any;                          // JSONB
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
```

---

## 🔨 Helpers y Utilities

### Type Aliases Útiles

```typescript
// /src/types/aliases.ts
import type { Database } from './database.types';

// Alias cortos para tipos comunes
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Role = Database['public']['Tables']['roles']['Row'];
export type Permission = Database['public']['Tables']['permissions']['Row'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export type TestCase = Database['public']['Tables']['test_cases']['Row'];
export type TestCaseStep = Database['public']['Tables']['test_case_steps']['Row'];

export type Execution = Database['public']['Tables']['executions']['Row'];
export type ExecutionResult = Database['public']['Tables']['execution_results']['Row'];

export type Bug = Database['public']['Tables']['bugs']['Row'];
export type WikiPage = Database['public']['Tables']['wiki_pages']['Row'];
export type Integration = Database['public']['Tables']['integrations']['Row'];

// Tipos de Vistas
export type UserEffectivePermissions = Database['public']['Views']['user_effective_permissions']['Row'];
export type ProjectTeamMember = Database['public']['Views']['project_team_members']['Row'];
export type WikiPageHierarchy = Database['public']['Views']['wiki_page_hierarchy']['Row'];
```

### Generic CRUD Types

```typescript
// /src/types/crud.ts
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Generic para cualquier tabla
export type TableRow<T extends keyof Tables> = Tables[T]['Row'];
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'];

// Uso:
type User = TableRow<'users'>;
type ProjectInsert = TableInsert<'projects'>;
type BugUpdate = TableUpdate<'bugs'>;
```

### Enum Types

```typescript
// /src/types/enums.ts

// Estados de Usuario
export type UserStatus = 'active' | 'inactive' | 'pending';

// Estados de Proyecto
export type ProjectStatus = 'active' | 'archived' | 'planning';

// Prioridades
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Tipos de Test
export type TestType = 'manual' | 'automated';

// Estados de Test Case
export type TestCaseStatus = 'draft' | 'ready' | 'deprecated';

// Estados de Ejecución
export type ExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Resultados de Ejecución
export type ExecutionResultStatus = 'passed' | 'failed' | 'blocked' | 'skipped';

// Severidad de Bug
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

// Estados de Bug
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';

// Capas de Wiki
export type WikiLayer = 'strategic' | 'tactical' | 'operational' | 'technical';

// Tipos de Integración
export type IntegrationType = 'jira' | 'confluence' | 'postman' | 'telegram' | 'teams' | 'slack';
```

---

## 💡 Best Practices

### 1. Siempre usar tipos generados

❌ **Malo:**
```typescript
interface User {
  id: string;
  email: string;
  // ... manualmente escrito
}
```

✅ **Bueno:**
```typescript
import type { Database } from '@/types/database.types';
type User = Database['public']['Tables']['users']['Row'];
```

### 2. Usar Insert/Update apropiadamente

❌ **Malo:**
```typescript
async function createUser(user: User) { // User tiene campos opcionales
  await supabase.from('users').insert(user);
}
```

✅ **Bueno:**
```typescript
async function createUser(user: UserInsert) { // Solo campos requeridos
  await supabase.from('users').insert(user);
}
```

### 3. Type Guards para runtime

```typescript
function isValidUserStatus(status: string): status is UserStatus {
  return ['active', 'inactive', 'pending'].includes(status);
}

// Uso
const status = userInput.status;
if (isValidUserStatus(status)) {
  // TypeScript sabe que status es UserStatus
  await updateUser(id, { status });
}
```

### 4. Partial para actualizaciones opcionales

```typescript
function updateUserPartial(id: string, updates: Partial<User>) {
  // Solo actualiza los campos proporcionados
  return supabase
    .from('users')
    .update(updates)
    .eq('id', id);
}
```

### 5. Pick/Omit para subconjuntos

```typescript
// Solo campos públicos de User
type PublicUser = Pick<User, 'id' | 'full_name' | 'avatar_url'>;

// User sin campos de timestamp
type UserForm = Omit<User, 'created_at' | 'updated_at'>;
```

### 6. Union Types para queries

```typescript
type UserWithRole = User & {
  global_role: Role;
};

type UserWithProjects = User & {
  project_members: Array<{
    project: Project;
    role: Role;
  }>;
};
```

---

## 🔄 Regenerar Tipos

Si cambias el schema de la base de datos:

### Opción 1: Supabase CLI

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Generar tipos
supabase gen types typescript --project-id <project-id> --schema public > src/types/database.types.ts
```

### Opción 2: Script NPM

```json
{
  "scripts": {
    "types:generate": "supabase gen types typescript --project-id $PROJECT_ID > src/types/database.types.ts"
  }
}
```

```bash
npm run types:generate
```

### Opción 3: Supabase Dashboard

1. Ve a Project Settings → API
2. Copia "TypeScript Types"
3. Pega en `/src/types/database.types.ts`

---

## 📚 Recursos

- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/rest/generating-types)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- Ver: `/src/types/database.types.ts`
- Ver: `/docs/05-BASE-DATOS/01-MIGRACION-MOCK-A-DATABASE.md`

---

**Última actualización:** Enero 2026  
**Mantenido por:** Equipo HAIDA
