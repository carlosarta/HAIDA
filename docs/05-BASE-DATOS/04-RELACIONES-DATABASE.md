# Guía Completa de Relaciones de Base de Datos

## 📋 Tabla de Contenidos
- [Mapa de Relaciones](#mapa-de-relaciones)
- [Relaciones por Entidad](#relaciones-por-entidad)
- [Patrones de Relación](#patrones-de-relación)
- [Ejemplos de Código](#ejemplos-de-código)
- [Constraints y Reglas](#constraints-y-reglas)
- [Best Practices](#best-practices)

---

## 🗺️ Mapa de Relaciones

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIOS Y PERMISOS                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌─────────┐    ┌─────────┐    ┌──────────────┐
              │  Users  │───▶│  Roles  │───▶│ Permissions  │
              └─────────┘    └─────────┘    └──────────────┘
                    │              │
                    │              │
                    ▼              ▼
              ┌──────────────────────────┐
              │    project_members       │
              └──────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           PROYECTOS                                 │
└─────────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┬──────────┐
        │           │           │           │          │
        ▼           ▼           ▼           ▼          ▼
   ┌─────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────────────┐
   │Test     │ │Executions│ │Bugs  │ │Wiki Pages│ │Integrations│
   │Cases    │ └──────────┘ └──────┘ └──────────┘ └────────────┘
   └─────────┘      │
        │           │
        ▼           ▼
   ┌─────────┐ ┌──────────────────┐
   │Test Case│ │Execution Results │
   │Steps    │ └──────────────────┘
   └─────────┘
```

---

## 🔗 Relaciones por Entidad

### 1. Users (Usuarios)

#### Relaciones Salientes (users → otras tablas)

| Tabla Relacionada | Tipo | FK en users | Descripción |
|-------------------|------|-------------|-------------|
| `roles` | Many-to-One | `global_role_id` | Rol global del usuario |
| `project_members` | One-to-Many | - | Proyectos en los que participa |
| `projects` | One-to-Many (created_by) | - | Proyectos creados |
| `test_cases` | One-to-Many (created_by) | - | Test cases creados |
| `executions` | One-to-Many (executed_by) | - | Ejecuciones realizadas |
| `execution_results` | One-to-Many (executed_by) | - | Resultados de ejecución |
| `bugs` | One-to-Many (reported_by) | - | Bugs reportados |
| `bugs` | One-to-Many (assigned_to) | - | Bugs asignados |
| `wiki_pages` | One-to-Many (created_by) | - | Páginas wiki creadas |

#### Query Ejemplo: Usuario Completo

```typescript
const { data: userComplete } = await supabase
  .from('users')
  .select(`
    *,
    
    -- Rol Global
    global_role:roles!users_global_role_id_fkey(
      id,
      name,
      description,
      is_global
    ),
    
    -- Proyectos en los que participa
    project_memberships:project_members(
      id,
      project:projects(
        id,
        name,
        status
      ),
      role:roles(
        id,
        name
      )
    ),
    
    -- Proyectos creados
    created_projects:projects!projects_created_by_fkey(
      id,
      name,
      status,
      created_at
    ),
    
    -- Test cases creados
    created_test_cases:test_cases!test_cases_created_by_fkey(
      id,
      title,
      status,
      priority
    ),
    
    -- Bugs reportados
    reported_bugs:bugs!bugs_reported_by_fkey(
      id,
      title,
      status,
      severity
    ),
    
    -- Bugs asignados
    assigned_bugs:bugs!bugs_assigned_to_fkey(
      id,
      title,
      status,
      severity
    )
  `)
  .eq('id', userId)
  .single();
```

---

### 2. Roles

#### Relaciones

| Tabla Relacionada | Tipo | Descripción |
|-------------------|------|-------------|
| `role_permissions` | One-to-Many | Permisos asignados al rol |
| `users` | One-to-Many | Usuarios con este rol global |
| `project_members` | One-to-Many | Miembros de proyecto con este rol |

#### Query Ejemplo: Rol con Permisos

```typescript
const { data: roleComplete } = await supabase
  .from('roles')
  .select(`
    *,
    
    -- Permisos del rol
    role_permissions(
      permission:permissions(
        id,
        name,
        description,
        resource,
        action
      )
    ),
    
    -- Usuarios con este rol global
    users_with_role:users!users_global_role_id_fkey(
      id,
      full_name,
      email,
      status
    ),
    
    -- Miembros de proyecto con este rol
    project_members_with_role:project_members(
      id,
      user:users(id, full_name),
      project:projects(id, name)
    )
  `)
  .eq('id', roleId)
  .single();
```

---

### 3. Permissions

#### Relaciones

| Tabla Relacionada | Tipo | Descripción |
|-------------------|------|-------------|
| `role_permissions` | One-to-Many | Roles que tienen este permiso |

#### Query Ejemplo: Permiso con Roles

```typescript
const { data: permissionComplete } = await supabase
  .from('permissions')
  .select(`
    *,
    role_permissions(
      role:roles(
        id,
        name,
        is_global
      )
    )
  `)
  .eq('id', permissionId)
  .single();
```

---

### 4. Projects

#### Relaciones Salientes

| Tabla Relacionada | Tipo | FK en projects | Descripción |
|-------------------|------|----------------|-------------|
| `users` | Many-to-One | `created_by` | Creador del proyecto |
| `project_members` | One-to-Many | - | Miembros del equipo |
| `test_cases` | One-to-Many | - | Test cases del proyecto |
| `executions` | One-to-Many | - | Ejecuciones del proyecto |
| `bugs` | One-to-Many | - | Bugs del proyecto |
| `wiki_pages` | One-to-Many | - | Páginas wiki del proyecto |
| `integrations` | One-to-Many | - | Integraciones configuradas |

#### Query Ejemplo: Proyecto Completo

```typescript
const { data: projectComplete } = await supabase
  .from('projects')
  .select(`
    *,
    
    -- Creador
    created_by_user:users!projects_created_by_fkey(
      id,
      full_name,
      email,
      avatar_url
    ),
    
    -- Equipo
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
        name
      )
    ),
    
    -- Test Cases (solo contador)
    test_cases(count),
    
    -- Bugs abiertos (solo contador)
    open_bugs:bugs!inner(count)
  `)
  .eq('id', projectId)
  .eq('bugs.status', 'open')
  .single();
```

---

### 5. Project Members (Tabla de Unión)

#### Relaciones

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `projects` | Many-to-One | `project_id` | Proyecto |
| `users` | Many-to-One | `user_id` | Usuario |
| `roles` | Many-to-One | `role_id` | Rol en el proyecto |

#### Constraint Importante

```sql
-- Un usuario solo puede tener UN rol por proyecto
UNIQUE(project_id, user_id)
```

#### Query Ejemplo: Agregar/Actualizar Miembro

```typescript
// Agregar miembro
const { error } = await supabase
  .from('project_members')
  .insert({
    project_id: projectId,
    user_id: userId,
    role_id: roleId
  });

// Cambiar rol (UPDATE porque UNIQUE constraint)
const { error: updateError } = await supabase
  .from('project_members')
  .update({ role_id: newRoleId })
  .eq('project_id', projectId)
  .eq('user_id', userId);

// O usar UPSERT
const { error: upsertError } = await supabase
  .from('project_members')
  .upsert(
    {
      project_id: projectId,
      user_id: userId,
      role_id: roleId
    },
    {
      onConflict: 'project_id,user_id'
    }
  );
```

---

### 6. Test Cases

#### Relaciones Salientes

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `projects` | Many-to-One | `project_id` | Proyecto al que pertenece |
| `users` | Many-to-One | `created_by` | Creador |
| `test_case_steps` | One-to-Many | - | Steps del test case |
| `execution_results` | One-to-Many | - | Resultados de ejecución |

#### Query Ejemplo: Test Case con Steps

```typescript
const { data: testCaseComplete } = await supabase
  .from('test_cases')
  .select(`
    *,
    project:projects(id, name),
    created_by_user:users!test_cases_created_by_fkey(
      id,
      full_name,
      email
    ),
    steps:test_case_steps(
      id,
      step_number,
      description,
      expected_result
    )
  `)
  .eq('id', testCaseId)
  .single();

// Steps ordenados
testCaseComplete.steps.sort((a, b) => a.step_number - b.step_number);
```

---

### 7. Test Case Steps

#### Relaciones

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `test_cases` | Many-to-One | `test_case_id` | Test case padre |

#### Cascade Delete

```sql
-- Si se elimina test_case, se eliminan sus steps
ON DELETE CASCADE
```

---

### 8. Executions

#### Relaciones Salientes

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `projects` | Many-to-One | `project_id` | Proyecto |
| `users` | Many-to-One | `executed_by` | Ejecutor |
| `execution_results` | One-to-Many | - | Resultados individuales |

#### Query Ejemplo: Ejecución con Resultados

```typescript
const { data: executionComplete } = await supabase
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
      test_case:test_cases(
        id,
        title,
        priority
      )
    )
  `)
  .eq('id', executionId)
  .single();

// Calcular estadísticas
const stats = executionComplete.results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] || 0) + 1;
  return acc;
}, {});
// { passed: 45, failed: 3, blocked: 1, skipped: 2 }
```

---

### 9. Execution Results

#### Relaciones Salientes

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `executions` | Many-to-One | `execution_id` | Ejecución padre |
| `test_cases` | Many-to-One | `test_case_id` | Test case ejecutado |
| `users` | Many-to-One | `executed_by` | Ejecutor |
| `bugs` | One-to-Many | - | Bugs reportados desde este resultado |

#### Query Ejemplo: Resultado con Bug

```typescript
const { data: resultWithBug } = await supabase
  .from('execution_results')
  .select(`
    *,
    execution:executions(id, name),
    test_case:test_cases(
      id,
      title,
      priority
    ),
    executed_by_user:users!execution_results_executed_by_fkey(
      id,
      full_name
    ),
    bugs:bugs(
      id,
      title,
      severity,
      status
    )
  `)
  .eq('id', resultId)
  .single();
```

---

### 10. Bugs

#### Relaciones Salientes

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `projects` | Many-to-One | `project_id` | Proyecto |
| `users` (reported_by) | Many-to-One | `reported_by` | Reportador |
| `users` (assigned_to) | Many-to-One | `assigned_to` | Asignado |
| `execution_results` | Many-to-One | `execution_result_id` | Resultado que generó el bug |
| `bug_attachments` | One-to-Many | - | Adjuntos del bug |

#### Query Ejemplo: Bug Completo

```typescript
const { data: bugComplete } = await supabase
  .from('bugs')
  .select(`
    *,
    project:projects(id, name),
    reported_by_user:users!bugs_reported_by_fkey(
      id,
      full_name,
      email,
      avatar_url
    ),
    assigned_to_user:users!bugs_assigned_to_fkey(
      id,
      full_name,
      email,
      avatar_url
    ),
    execution_result:execution_results(
      id,
      status,
      test_case:test_cases(
        id,
        title
      ),
      execution:executions(
        id,
        name
      )
    ),
    attachments:bug_attachments(
      id,
      file_name,
      file_url,
      uploaded_at
    )
  `)
  .eq('id', bugId)
  .single();
```

---

### 11. Wiki Pages (Auto-Referencia)

#### Relaciones Salientes

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `projects` | Many-to-One | `project_id` | Proyecto |
| `users` | Many-to-One | `created_by` | Creador |
| `wiki_pages` | Many-to-One | `parent_page_id` | Página padre (auto-referencia) |
| `wiki_pages` | One-to-Many | - | Páginas hijas |
| `wiki_page_versions` | One-to-Many | - | Historial de versiones |

#### Query Ejemplo: Jerarquía de Wiki

```typescript
// Obtener página con padre e hijos
const { data: pageWithHierarchy } = await supabase
  .from('wiki_pages')
  .select(`
    *,
    parent:wiki_pages!wiki_pages_parent_page_id_fkey(
      id,
      title,
      layer
    ),
    children:wiki_pages!wiki_pages_parent_page_id_fkey(
      id,
      title,
      layer,
      created_at
    ),
    created_by_user:users!wiki_pages_created_by_fkey(
      id,
      full_name
    )
  `)
  .eq('id', pageId)
  .single();

// Usar vista para obtener path completo
const { data: pageWithPath } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('page_id', pageId)
  .single();

// pageWithPath.path = "Documentation > API Guide > Authentication"
```

---

### 12. Integrations

#### Relaciones

| Tabla Relacionada | Tipo | FK | Descripción |
|-------------------|------|----|-------------|
| `projects` | Many-to-One | `project_id` | Proyecto |

#### Nota Importante: Encriptación

El campo `config` (JSONB) contiene credenciales que DEBEN ser encriptadas:

```typescript
import { encryptionService } from '@/services/encryption-service';

// Guardar integración
const encryptedConfig = await encryptionService.encrypt(
  JSON.stringify(config)
);

await supabase.from('integrations').insert({
  project_id: projectId,
  name: 'Jira',
  type: 'jira',
  config: { encrypted: encryptedConfig },
  is_active: true
});

// Leer integración
const { data: integration } = await supabase
  .from('integrations')
  .select('*')
  .eq('id', integrationId)
  .single();

const decryptedConfig = JSON.parse(
  await encryptionService.decrypt(integration.config.encrypted)
);
```

---

## 🎯 Patrones de Relación

### Patrón 1: Many-to-Many (via tabla de unión)

**Ejemplo: Users ↔ Projects**

```
users ←──┐
         │
         ├─→ project_members ←──┐
         │                      │
roles ←──┘                      ├─→ projects
```

```typescript
// Agregar usuario a proyecto con rol
await supabase.from('project_members').insert({
  project_id,
  user_id,
  role_id
});
```

### Patrón 2: Many-to-Many con Atributos (via tabla de unión enriquecida)

**Ejemplo: Roles ↔ Permissions**

```
roles ←──┐
         │
         ├─→ role_permissions
         │
permissions ←──┘
```

La tabla `role_permissions` solo tiene FKs, sin atributos adicionales.

### Patrón 3: Herencia/Polimorfismo

**Ejemplo: Roles Globales vs Roles de Proyecto**

```typescript
// Un rol puede ser:
// - Global (is_global = true) → Asignado en users.global_role_id
// - De Proyecto (is_global = false) → Asignado en project_members.role_id

// Obtener todos los roles globales
const { data: globalRoles } = await supabase
  .from('roles')
  .select('*')
  .eq('is_global', true);

// Obtener todos los roles de proyecto
const { data: projectRoles } = await supabase
  .from('roles')
  .select('*')
  .eq('is_global', false);
```

### Patrón 4: Auto-Referencia (Árbol)

**Ejemplo: Wiki Pages**

```
wiki_pages
  ├─ parent_page_id → wiki_pages.id
  └─ children ← wiki_pages.parent_page_id
```

```typescript
// Obtener árbol completo (recursivo en PostgreSQL)
// Ver vista: wiki_page_hierarchy
const { data: tree } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('project_id', projectId)
  .order('path');
```

### Patrón 5: Soft Delete

**No implementado actualmente**, pero podría ser:

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP;
```

```typescript
// "Eliminar" proyecto (soft delete)
await supabase
  .from('projects')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', projectId);

// Queries excluyen soft-deleted
const { data } = await supabase
  .from('projects')
  .select('*')
  .is('deleted_at', null);
```

---

## ⚠️ Constraints y Reglas

### Foreign Keys con CASCADE

| Tabla | FK | ON DELETE |
|-------|----|-----------| 
| `users` | `global_role_id` | `RESTRICT` (no se puede eliminar rol en uso) |
| `project_members` | `project_id` | `CASCADE` (eliminar proyecto → elimina membresías) |
| `project_members` | `user_id` | `CASCADE` (eliminar usuario → elimina membresías) |
| `project_members` | `role_id` | `RESTRICT` (no se puede eliminar rol en uso) |
| `test_case_steps` | `test_case_id` | `CASCADE` (eliminar test case → elimina steps) |
| `execution_results` | `execution_id` | `CASCADE` (eliminar ejecución → elimina resultados) |
| `bug_attachments` | `bug_id` | `CASCADE` (eliminar bug → elimina adjuntos) |
| `wiki_page_versions` | `wiki_page_id` | `CASCADE` (eliminar página → elimina versiones) |

### UNIQUE Constraints

| Tabla | Columnas | Propósito |
|-------|----------|-----------|
| `users` | `email` | Un email = un usuario |
| `roles` | `name` | Nombres únicos de rol |
| `permissions` | `name` | Nombres únicos de permiso |
| `project_members` | `project_id, user_id` | Un usuario = un rol por proyecto |
| `role_permissions` | `role_id, permission_id` | Un permiso solo una vez por rol |

---

## 💡 Best Practices

### 1. Cargar solo lo necesario

❌ **Evitar:**
```typescript
// Carga TODA la jerarquía (miles de registros)
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    test_cases(*),
    executions(*),
    bugs(*),
    wiki_pages(*)
  `);
```

✅ **Mejor:**
```typescript
// Solo metadata del proyecto
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .single();

// Cargar relacionados según necesidad
const { data: testCases } = await supabase
  .from('test_cases')
  .select('*')
  .eq('project_id', projectId)
  .limit(20);
```

### 2. Usar vistas para queries complejas

✅ **Bueno:**
```typescript
// Vista pre-calculada
const { data: permissions } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId);
```

vs.

❌ **Evitar:**
```typescript
// Múltiples queries manuales
const user = await getUser(userId);
const globalRole = await getRole(user.global_role_id);
const globalPerms = await getRolePermissions(globalRole.id);
const projectMemberships = await getProjectMemberships(userId);
// ... etc
```

### 3. Validar relaciones antes de insertar

```typescript
async function addTeamMember(
  projectId: string,
  userId: string,
  roleId: string
) {
  // Validar que el proyecto existe
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();
  
  if (!project) throw new Error('Project not found');
  
  // Validar que el usuario existe
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (!user) throw new Error('User not found');
  
  // Validar que el rol es de proyecto
  const { data: role } = await supabase
    .from('roles')
    .select('is_global')
    .eq('id', roleId)
    .single();
  
  if (!role || role.is_global) {
    throw new Error('Invalid project role');
  }
  
  // Insertar
  return supabase.from('project_members').insert({
    project_id: projectId,
    user_id: userId,
    role_id: roleId
  });
}
```

### 4. Usar transacciones para operaciones complejas

```sql
-- Función PostgreSQL con transacción
CREATE OR REPLACE FUNCTION execute_test_suite(
  p_execution_id UUID,
  p_test_case_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar estado de ejecución
  UPDATE executions
  SET status = 'in_progress', started_at = NOW()
  WHERE id = p_execution_id;
  
  -- Crear resultados para cada test case
  INSERT INTO execution_results (execution_id, test_case_id, status)
  SELECT p_execution_id, unnest(p_test_case_ids), 'pending';
  
  COMMIT;
END;
$$;
```

---

## 📚 Recursos

- Ver: `HAIDA_DATABASE_DIAGRAM.md` para diagramas visuales
- Ver: `DATABASE_RELATIONS_GUIDE.md` para documentación original
- Ver: `/src/types/database.types.ts` para tipos TypeScript
- Ver: `/docs/05-BASE-DATOS/03-CONSULTAS-SQL.md` para ejemplos de queries

---

**Última actualización:** Enero 2026  
**Mantenido por:** Equipo HAIDA
