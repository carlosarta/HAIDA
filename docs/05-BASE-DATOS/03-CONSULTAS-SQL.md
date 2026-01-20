# Guía de Consultas SQL - HAIDA Database

## 📋 Tabla de Contenidos
- [Queries Básicas](#queries-básicas)
- [Queries con Relaciones (JOINs)](#queries-con-relaciones-joins)
- [Queries con Vistas](#queries-con-vistas)
- [Queries de Permisos](#queries-de-permisos)
- [Queries Avanzadas](#queries-avanzadas)
- [Queries de Estadísticas](#queries-de-estadísticas)
- [Optimización](#optimización)

---

## 🔍 Queries Básicas

### Usuarios

```typescript
// Obtener todos los usuarios activos
const { data: activeUsers } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Buscar usuario por email
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'user@example.com')
  .single();

// Obtener usuarios por rol
const { data: admins } = await supabase
  .from('users')
  .select(`
    *,
    global_role:roles!users_global_role_id_fkey(name)
  `)
  .eq('roles.name', 'Admin');

// Buscar usuarios por nombre (case-insensitive)
const { data: searchResults } = await supabase
  .from('users')
  .select('*')
  .ilike('full_name', '%john%');

// Actualizar estado de usuario
const { data: updated } = await supabase
  .from('users')
  .update({ status: 'active' })
  .eq('id', userId)
  .select()
  .single();
```

### Proyectos

```typescript
// Obtener proyectos activos
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Obtener proyecto con creador
const { data: projectWithCreator } = await supabase
  .from('projects')
  .select(`
    *,
    created_by_user:users!projects_created_by_fkey(
      id,
      full_name,
      email,
      avatar_url
    )
  `)
  .eq('id', projectId)
  .single();

// Filtrar proyectos por fecha
const { data: recentProjects } = await supabase
  .from('projects')
  .select('*')
  .gte('created_at', '2026-01-01')
  .order('created_at', { ascending: false });

// Buscar proyectos
const { data: searchResults } = await supabase
  .from('projects')
  .select('*')
  .or('name.ilike.%test%,description.ilike.%test%');
```

### Test Cases

```typescript
// Obtener test cases de un proyecto
const { data: testCases } = await supabase
  .from('test_cases')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });

// Filtrar por prioridad
const { data: criticalTests } = await supabase
  .from('test_cases')
  .select('*')
  .eq('project_id', projectId)
  .eq('priority', 'critical')
  .eq('status', 'ready');

// Obtener test case con steps
const { data: testCaseWithSteps } = await supabase
  .from('test_cases')
  .select(`
    *,
    steps:test_case_steps(*)
  `)
  .eq('id', testCaseId)
  .single();

// Contar test cases por estado
const { data: statusCounts } = await supabase
  .from('test_cases')
  .select('status', { count: 'exact' })
  .eq('project_id', projectId);
```

---

## 🔗 Queries con Relaciones (JOINs)

### Usuario con Todos sus Roles

```typescript
// Usuario con rol global + roles de proyectos
const { data: userComplete } = await supabase
  .from('users')
  .select(`
    *,
    global_role:roles!users_global_role_id_fkey(
      id,
      name,
      description
    ),
    project_roles:project_members(
      id,
      project:projects(
        id,
        name,
        status
      ),
      role:roles(
        id,
        name,
        description
      )
    )
  `)
  .eq('id', userId)
  .single();

// Resultado:
// {
//   id: "user-123",
//   email: "john@example.com",
//   full_name: "John Doe",
//   global_role: {
//     id: "role-admin",
//     name: "Admin",
//     description: "..."
//   },
//   project_roles: [
//     {
//       id: "pm-1",
//       project: { id: "proj-1", name: "Project Alpha", status: "active" },
//       role: { id: "role-qa-lead", name: "QA Lead", description: "..." }
//     }
//   ]
// }
```

### Proyecto con Equipo Completo

```typescript
// Proyecto con todos sus miembros
const { data: projectWithTeam } = await supabase
  .from('projects')
  .select(`
    *,
    created_by_user:users!projects_created_by_fkey(
      id,
      full_name,
      email
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
        name
      )
    )
  `)
  .eq('id', projectId)
  .single();
```

### Rol con Permisos

```typescript
// Rol con todos sus permisos
const { data: roleWithPermissions } = await supabase
  .from('roles')
  .select(`
    *,
    role_permissions(
      permission:permissions(
        id,
        name,
        description,
        resource,
        action
      )
    )
  `)
  .eq('id', roleId)
  .single();

// Transformar a formato más limpio
const role = {
  ...roleWithPermissions,
  permissions: roleWithPermissions.role_permissions.map(
    rp => rp.permission
  )
};
```

### Test Case Completo

```typescript
// Test case con steps, creador y ejecuciones
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
    steps:test_case_steps(*),
    executions:execution_results(
      id,
      status,
      executed_at,
      executed_by_user:users!execution_results_executed_by_fkey(
        id,
        full_name
      )
    )
  `)
  .eq('id', testCaseId)
  .single();
```

### Ejecución Completa

```typescript
// Ejecución con todos sus resultados
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
    )
  `)
  .eq('id', executionId)
  .single();
```

### Bug Completo

```typescript
// Bug con toda su información
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
      test_case:test_cases(
        id,
        title
      ),
      execution:executions(
        id,
        name
      )
    ),
    attachments:bug_attachments(*)
  `)
  .eq('id', bugId)
  .single();
```

---

## 📊 Queries con Vistas

### Vista: user_effective_permissions

```typescript
// Obtener TODOS los permisos efectivos de un usuario
const { data: permissions } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId);

// Resultado:
// [
//   {
//     user_id: "user-123",
//     permission_id: "perm-1",
//     permission_name: "projects.create",
//     resource: "projects",
//     action: "create",
//     source: "global",
//     role_id: "role-admin",
//     role_name: "Admin",
//     project_id: null
//   },
//   {
//     user_id: "user-123",
//     permission_id: "perm-2",
//     permission_name: "test_cases.execute",
//     resource: "test_cases",
//     action: "execute",
//     source: "project",
//     role_id: "role-qa-lead",
//     role_name: "QA Lead",
//     project_id: "proj-1"
//   }
// ]

// Verificar si usuario tiene permiso específico
const { data: hasPermission } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId)
  .eq('permission_name', 'projects.create')
  .maybeSingle();

const canCreateProjects = !!hasPermission;

// Verificar permiso en proyecto específico
const { data: hasProjectPermission } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId)
  .eq('project_id', projectId)
  .eq('permission_name', 'test_cases.execute')
  .maybeSingle();

// Obtener todos los permisos de un proyecto
const { data: projectPermissions } = await supabase
  .from('user_effective_permissions')
  .select('*')
  .eq('user_id', userId)
  .eq('project_id', projectId);
```

### Vista: project_team_members

```typescript
// Obtener todos los miembros de un proyecto
const { data: teamMembers } = await supabase
  .from('project_team_members')
  .select('*')
  .eq('project_id', projectId);

// Resultado:
// [
//   {
//     project_id: "proj-1",
//     project_name: "Project Alpha",
//     user_id: "user-123",
//     user_name: "John Doe",
//     user_email: "john@example.com",
//     user_avatar: "...",
//     role_id: "role-qa-lead",
//     role_name: "QA Lead"
//   }
// ]

// Buscar miembro específico en proyecto
const { data: member } = await supabase
  .from('project_team_members')
  .select('*')
  .eq('project_id', projectId)
  .eq('user_id', userId)
  .maybeSingle();

// Contar miembros por proyecto
const { count } = await supabase
  .from('project_team_members')
  .select('*', { count: 'exact', head: true })
  .eq('project_id', projectId);

// Obtener proyectos de un usuario
const { data: userProjects } = await supabase
  .from('project_team_members')
  .select('*')
  .eq('user_id', userId);
```

### Vista: wiki_page_hierarchy

```typescript
// Obtener jerarquía completa de wiki de un proyecto
const { data: wikiPages } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('project_id', projectId)
  .order('path');

// Resultado:
// [
//   {
//     page_id: "page-1",
//     page_title: "Documentation",
//     project_id: "proj-1",
//     parent_page_id: null,
//     layer: "strategic",
//     level: 0,
//     path: "Documentation"
//   },
//   {
//     page_id: "page-2",
//     page_title: "API Guide",
//     project_id: "proj-1",
//     parent_page_id: "page-1",
//     layer: "technical",
//     level: 1,
//     path: "Documentation > API Guide"
//   }
// ]

// Obtener páginas de nivel superior (sin padre)
const { data: rootPages } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('project_id', projectId)
  .is('parent_page_id', null);

// Obtener páginas por capa
const { data: strategicPages } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('project_id', projectId)
  .eq('layer', 'strategic');

// Obtener hijos de una página
const { data: childPages } = await supabase
  .from('wiki_page_hierarchy')
  .select('*')
  .eq('parent_page_id', parentPageId);
```

---

## 🔐 Queries de Permisos

### Asignar Permiso a Rol

```typescript
// Crear relación role_permission
const { error } = await supabase
  .from('role_permissions')
  .insert({
    role_id: roleId,
    permission_id: permissionId
  });
```

### Remover Permiso de Rol

```typescript
const { error } = await supabase
  .from('role_permissions')
  .delete()
  .eq('role_id', roleId)
  .eq('permission_id', permissionId);
```

### Agregar Usuario a Proyecto

```typescript
const { error } = await supabase
  .from('project_members')
  .insert({
    project_id: projectId,
    user_id: userId,
    role_id: roleId
  });
```

### Cambiar Rol de Usuario en Proyecto

```typescript
const { error } = await supabase
  .from('project_members')
  .update({ role_id: newRoleId })
  .eq('project_id', projectId)
  .eq('user_id', userId);
```

### Verificar Permiso (Función Helper)

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
    query.or(`project_id.eq.${projectId},source.eq.global`);
  }
  
  const { data } = await query.maybeSingle();
  return !!data;
}

// Uso
const canCreate = await userHasPermission(userId, 'projects.create');
const canExecute = await userHasPermission(userId, 'test_cases.execute', projectId);
```

---

## 🚀 Queries Avanzadas

### Búsqueda Full-Text

```typescript
// Buscar en múltiples campos
const { data: results } = await supabase
  .from('test_cases')
  .select('*')
  .or(`
    title.ilike.%${searchTerm}%,
    description.ilike.%${searchTerm}%,
    preconditions.ilike.%${searchTerm}%
  `);
```

### Filtros Complejos

```typescript
// Test cases de alta prioridad, ready, en proyectos activos
const { data: testCases } = await supabase
  .from('test_cases')
  .select(`
    *,
    project:projects!inner(*)
  `)
  .in('priority', ['high', 'critical'])
  .eq('status', 'ready')
  .eq('projects.status', 'active');
```

### Agregaciones

```typescript
// Contar bugs por severidad
const { data: bugStats } = await supabase
  .from('bugs')
  .select('severity')
  .eq('project_id', projectId)
  .eq('status', 'open');

const stats = bugStats.reduce((acc, bug) => {
  acc[bug.severity] = (acc[bug.severity] || 0) + 1;
  return acc;
}, {});

// Resultado: { low: 5, medium: 12, high: 8, critical: 2 }
```

### Paginación

```typescript
const PAGE_SIZE = 20;
const page = 2;

const { data: paginatedData, count } = await supabase
  .from('test_cases')
  .select('*', { count: 'exact' })
  .eq('project_id', projectId)
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  .order('created_at', { ascending: false });

const totalPages = Math.ceil(count / PAGE_SIZE);
```

### Transacciones (usando RPC)

```sql
-- Crear función en Supabase
CREATE OR REPLACE FUNCTION create_project_with_member(
  p_name TEXT,
  p_description TEXT,
  p_created_by UUID,
  p_role_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  -- Crear proyecto
  INSERT INTO projects (name, description, created_by)
  VALUES (p_name, p_description, p_created_by)
  RETURNING id INTO v_project_id;
  
  -- Agregar creador como miembro
  INSERT INTO project_members (project_id, user_id, role_id)
  VALUES (v_project_id, p_created_by, p_role_id);
  
  RETURN v_project_id;
END;
$$;
```

```typescript
// Llamar desde TypeScript
const { data: projectId } = await supabase
  .rpc('create_project_with_member', {
    p_name: 'New Project',
    p_description: 'Description',
    p_created_by: userId,
    p_role_id: roleId
  });
```

---

## 📈 Queries de Estadísticas

### Dashboard de Proyecto

```typescript
async function getProjectDashboard(projectId: string) {
  // Test Cases por estado
  const { data: testCaseStats } = await supabase
    .from('test_cases')
    .select('status')
    .eq('project_id', projectId);
  
  const testCasesByStatus = testCaseStats.reduce((acc, tc) => {
    acc[tc.status] = (acc[tc.status] || 0) + 1;
    return acc;
  }, {});
  
  // Bugs abiertos por severidad
  const { data: openBugs } = await supabase
    .from('bugs')
    .select('severity')
    .eq('project_id', projectId)
    .in('status', ['open', 'in_progress']);
  
  const bugsBySeverity = openBugs.reduce((acc, bug) => {
    acc[bug.severity] = (acc[bug.severity] || 0) + 1;
    return acc;
  }, {});
  
  // Últimas ejecuciones
  const { data: recentExecutions } = await supabase
    .from('executions')
    .select(`
      *,
      executed_by_user:users!executions_executed_by_fkey(full_name),
      results:execution_results(status)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  return {
    testCases: testCasesByStatus,
    openBugs: bugsBySeverity,
    recentExecutions
  };
}
```

### Estadísticas de Usuario

```typescript
async function getUserStats(userId: string) {
  // Proyectos en los que participa
  const { count: projectCount } = await supabase
    .from('project_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  // Test cases creados
  const { count: testCaseCount } = await supabase
    .from('test_cases')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId);
  
  // Ejecuciones realizadas
  const { count: executionCount } = await supabase
    .from('execution_results')
    .select('*', { count: 'exact', head: true })
    .eq('executed_by', userId);
  
  // Bugs reportados
  const { count: bugCount } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true })
    .eq('reported_by', userId);
  
  return {
    projects: projectCount,
    testCasesCreated: testCaseCount,
    executionsPerformed: executionCount,
    bugsReported: bugCount
  };
}
```

---

## ⚡ Optimización

### Índices Recomendados

```sql
-- Ya existen estos índices básicos
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_global_role ON users(global_role_id);
CREATE INDEX idx_test_cases_project ON test_cases(project_id);
CREATE INDEX idx_execution_results_execution ON execution_results(execution_id);
CREATE INDEX idx_bugs_project ON bugs(project_id);

-- Índices adicionales útiles
CREATE INDEX idx_test_cases_status ON test_cases(project_id, status);
CREATE INDEX idx_bugs_status ON bugs(project_id, status);
CREATE INDEX idx_execution_results_status ON execution_results(execution_id, status);
CREATE INDEX idx_wiki_pages_parent ON wiki_pages(parent_page_id);
```

### Select Específico vs *

❌ **Evitar:**
```typescript
const { data } = await supabase.from('users').select('*');
```

✅ **Mejor:**
```typescript
const { data } = await supabase
  .from('users')
  .select('id, full_name, email, avatar_url');
```

### Limitar Resultados

```typescript
// Solo necesitas 10 resultados más recientes
const { data } = await supabase
  .from('test_cases')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Usar `.maybeSingle()` vs `.single()`

```typescript
// Si el registro puede no existir
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .maybeSingle(); // Retorna null si no existe, no lanza error
```

---

## 📚 Recursos

- [Supabase Query Docs](https://supabase.com/docs/reference/javascript/select)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- Ver: `DATABASE_RELATIONS_GUIDE.md`
- Ver: `/docs/05-BASE-DATOS/02-TIPOS-TYPESCRIPT.md`

---

**Última actualización:** Enero 2026  
**Mantenido por:** Equipo HAIDA
