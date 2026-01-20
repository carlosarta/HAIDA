# 📊 HAIDA - Guía de Base de Datos

**Última actualización**: 2025-01-20  
**PostgreSQL Version**: 15+  
**Supabase**: Yes  

---

## 📋 Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Arquitectura Multi-Tenant](#arquitectura-multi-tenant)
3. [Módulos Principales](#módulos-principales)
4. [Queries Comunes](#queries-comunes)
5. [Migraciones](#migraciones)
6. [Performance Tips](#performance-tips)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Inicio Rápido

### **Conexión a la Base de Datos**

```typescript
// Usando Supabase Client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabase = createClient<Database>(
  'https://tu-proyecto.supabase.co',
  'tu-anon-key'
);
```

### **Query Básico**

```typescript
// SELECT con tipos
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active');

// TypeScript infiere el tipo correcto
projects?.forEach((p: Project) => {
  console.log(p.name); // ✅ Type-safe
});
```

---

## 🏢 Arquitectura Multi-Tenant

### **Jerarquía de Entidades**

```
Tenant (Organización)
  │
  ├─ Tenant Members (Usuarios + Roles)
  │   └─ owner, admin, editor, viewer
  │
  ├─ Projects (Proyectos de Testing)
  │   │
  │   ├─ Test Suites (Colecciones de tests)
  │   │   │
  │   │   └─ Test Cases (Tests individuales)
  │   │       └─ test_id, preconditions, steps, expected_result
  │   │
  │   ├─ Change Detections (Webhook events)
  │   │   │
  │   │   └─ Test Executions (Runs)
  │   │       │
  │   │       └─ Test Results
  │   │           └─ Defects
  │   │
  │   └─ Chat Threads (Conversaciones IA)
  │       └─ Chat Messages
  │
  ├─ Feature Flags (Configuración por tenant)
  └─ Rate Limits (Límites de uso)
```

---

## 📦 Módulos Principales

### **1. Multi-Tenancy & Users**

#### **Crear un Tenant**

```sql
-- Crear organización
INSERT INTO tenants (name, slug, subscription_plan)
VALUES ('Acme Corp', 'acme-corp', 'professional')
RETURNING *;

-- Agregar miembro owner
INSERT INTO tenant_members (tenant_id, user_id, role)
VALUES (
  'tenant-uuid',
  'user-uuid',
  'owner'
);
```

#### **Obtener tenants del usuario**

```typescript
const { data: memberships } = await supabase
  .from('tenant_members')
  .select(`
    tenant_id,
    role,
    tenants (
      id,
      name,
      slug,
      subscription_plan
    )
  `)
  .eq('user_id', userId);
```

---

### **2. Projects & Testing**

#### **Crear Proyecto con Suite**

```typescript
// 1. Crear proyecto
const { data: project } = await supabase
  .from('projects')
  .insert({
    name: 'E-commerce App',
    slug: 'ecommerce-app',
    base_url: 'https://example.com',
    owner_id: userId,
  })
  .select()
  .single();

// 2. Crear test suite
const { data: suite } = await supabase
  .from('test_suites')
  .insert({
    project_id: project.id,
    name: 'Smoke Tests',
    suite_type: 'smoke',
    priority: 'critical',
    tags: ['smoke', 'regression'],
  })
  .select()
  .single();

// 3. Crear test cases
const testCases = [
  {
    test_suite_id: suite.id,
    test_id: 'TC-001',
    name: 'Login with valid credentials',
    test_type: 'smoke',
    priority: 'critical',
    test_steps: '1. Navigate to login\n2. Enter credentials\n3. Click login',
    expected_result: 'User is redirected to dashboard',
  },
  // ... más casos
];

await supabase
  .from('test_cases')
  .insert(testCases);
```

---

### **3. Test Executions**

#### **Crear Ejecución y Resultados**

```typescript
// 1. Crear ejecución
const { data: execution } = await supabase
  .from('test_executions')
  .insert({
    project_id: projectId,
    execution_type: 'manual',
    environment: 'staging',
    status: 'running',
    triggered_by: userId,
  })
  .select()
  .single();

// 2. Ejecutar tests y guardar resultados
for (const testCase of testCases) {
  const result = await runTest(testCase);
  
  await supabase
    .from('test_results')
    .insert({
      test_execution_id: execution.id,
      test_case_id: testCase.id,
      status: result.passed ? 'passed' : 'failed',
      duration_ms: result.duration,
      error_message: result.error,
      screenshot_url: result.screenshot,
    });
}

// 3. Actualizar execution con totales
const { data: results } = await supabase
  .from('test_results')
  .select('status')
  .eq('test_execution_id', execution.id);

await supabase
  .from('test_executions')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    total_tests: results.length,
    passed_tests: results.filter(r => r.status === 'passed').length,
    failed_tests: results.filter(r => r.status === 'failed').length,
  })
  .eq('id', execution.id);
```

---

### **4. Defect Tracking**

#### **Crear Defecto desde Test Result**

```typescript
const { data: defect } = await supabase
  .from('defects')
  .insert({
    tenant_id: tenantId,
    project_id: projectId,
    test_execution_id: executionId,
    test_result_id: resultId,
    title: 'Login button not responding',
    severity: 'high',
    priority: 'p1',
    status: 'open',
    steps_to_reproduce: '1. Click login\n2. Button freezes',
    expected_behavior: 'Button should submit form',
    actual_behavior: 'Button does nothing',
    environment: 'staging',
    browser: 'Chrome 120',
    assigned_to: developerId,
    reported_by: testerId,
  })
  .select()
  .single();
```

#### **Dashboard de Defectos**

```typescript
// Obtener defectos agrupados por severidad
const { data: defectStats } = await supabase
  .from('defects')
  .select('severity, status')
  .eq('project_id', projectId)
  .gte('created_at', thirtyDaysAgo);

// Agrupar en frontend
const grouped = defectStats?.reduce((acc, d) => {
  if (!acc[d.severity]) acc[d.severity] = { open: 0, closed: 0 };
  acc[d.severity][d.status === 'closed' ? 'closed' : 'open']++;
  return acc;
}, {} as Record<string, { open: number; closed: number }>);
```

---

### **5. Chat IA**

#### **Crear Thread con Contexto de Proyecto**

```typescript
// 1. Crear thread
const { data: thread } = await supabase
  .from('chat_threads')
  .insert({
    tenant_id: tenantId,
    project_id: projectId, // Contexto importante!
    user_id: userId,
    title: 'Questions about test failures',
    provider: 'copilot-studio',
    status: 'active',
  })
  .select()
  .single();

// 2. Agregar mensaje del usuario
await supabase
  .from('chat_messages')
  .insert({
    thread_id: thread.id,
    role: 'user',
    content: '¿Por qué falló el test TC-001?',
    content_type: 'text',
  });

// 3. IA obtiene contexto del proyecto
const { data: context } = await supabase
  .from('test_results')
  .select(`
    *,
    test_cases (name, test_steps, expected_result),
    test_executions (environment, browser)
  `)
  .eq('test_execution_id', executionId)
  .eq('status', 'failed');

// 4. IA responde con contexto
const response = await aiService.chat(userMessage, context);

await supabase
  .from('chat_messages')
  .insert({
    thread_id: thread.id,
    role: 'assistant',
    content: response,
    content_type: 'markdown',
  });
```

---

### **6. Feature Flags**

#### **Verificar Feature con Herencia**

```typescript
/**
 * Prioridad: User Override > Tenant Override > Global Default
 */
async function isFeatureEnabled(
  featureKey: string,
  userId: string,
  tenantId: string
): Promise<boolean> {
  // 1. User override
  const { data: userFlag } = await supabase
    .from('user_feature_flags')
    .select('is_enabled, value')
    .eq('user_id', userId)
    .eq('flag_key', featureKey)
    .single();
  
  if (userFlag) return userFlag.is_enabled;
  
  // 2. Tenant override
  const { data: tenantFlag } = await supabase
    .from('tenant_feature_flags')
    .select('is_enabled, value')
    .eq('tenant_id', tenantId)
    .eq('flag_key', featureKey)
    .single();
  
  if (tenantFlag) return tenantFlag.is_enabled;
  
  // 3. Global default
  const { data: globalFlag } = await supabase
    .from('feature_flags')
    .select('is_active, default_value')
    .eq('key', featureKey)
    .single();
  
  return globalFlag?.is_active && globalFlag?.default_value === true;
}
```

---

## 🔍 Queries Comunes

### **Dashboard de Proyecto**

```typescript
// Métricas completas del proyecto
const { data: projectHealth } = await supabase
  .from('v_project_health')
  .select('*')
  .eq('project_id', projectId)
  .single();

/*
Resultado:
{
  project_id: "uuid",
  project_name: "E-commerce App",
  total_executions: 156,
  completed_executions: 152,
  failed_executions: 4,
  avg_duration_ms: 45000,
  total_assertions_passed: 2340,
  total_assertions_failed: 12,
  last_execution_at: "2025-01-20T10:30:00Z"
}
*/
```

### **Test Coverage**

```typescript
// % de tests automatizados por suite
const { data: coverage } = await supabase
  .from('v_test_coverage')
  .select('*')
  .eq('project_id', projectId)
  .order('automation_percentage', { ascending: false });

/*
Resultado:
[
  {
    test_suite_id: "uuid",
    suite_name: "Smoke Tests",
    total_test_cases: 25,
    automated_test_cases: 25,
    manual_test_cases: 0,
    automation_percentage: 100
  },
  {
    test_suite_id: "uuid",
    suite_name: "Regression Tests",
    total_test_cases: 120,
    automated_test_cases: 90,
    manual_test_cases: 30,
    automation_percentage: 75
  }
]
*/
```

### **Últimas Ejecuciones**

```typescript
const { data: recentExecutions } = await supabase
  .from('v_recent_executions')
  .select('*')
  .limit(10);
```

### **Defectos por Prioridad**

```sql
-- Query SQL directo (usar en Supabase Dashboard)
SELECT 
  priority,
  status,
  COUNT(*) as count,
  ARRAY_AGG(title ORDER BY created_at DESC) 
    FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') 
    as recent_titles
FROM defects
WHERE project_id = 'your-project-uuid'
GROUP BY priority, status
ORDER BY 
  CASE priority
    WHEN 'p0' THEN 1
    WHEN 'p1' THEN 2
    WHEN 'p2' THEN 3
    WHEN 'p3' THEN 4
    WHEN 'p4' THEN 5
  END;
```

### **Tendencias de Calidad (últimos 30 días)**

```typescript
const { data: qualityTrend } = await supabase
  .from('test_executions')
  .select('started_at, passed_tests, failed_tests, total_tests')
  .eq('project_id', projectId)
  .gte('started_at', thirtyDaysAgo)
  .order('started_at');

// Calcular tasa de éxito por día
const dailyStats = qualityTrend?.reduce((acc, exec) => {
  const date = exec.started_at.split('T')[0];
  if (!acc[date]) {
    acc[date] = { passed: 0, failed: 0, total: 0 };
  }
  acc[date].passed += exec.passed_tests;
  acc[date].failed += exec.failed_tests;
  acc[date].total += exec.total_tests;
  return acc;
}, {} as Record<string, { passed: number; failed: number; total: number }>);
```

---

## 🔄 Migraciones

### **Estructura de Migraciones**

```
/supabase/migrations/
  ├─ 20250120000001_initial_schema.sql
  ├─ 20250120000002_add_feature_flags.sql
  ├─ 20250120000003_add_rls_policies.sql
  └─ 20250120000004_add_indexes.sql
```

### **Template de Migración**

```sql
-- Migration: [Descripción]
-- Date: 2025-01-20
-- Author: [Tu nombre]

BEGIN;

-- ============================================
-- SCHEMA CHANGES
-- ============================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS example_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna
ALTER TABLE existing_table 
  ADD COLUMN IF NOT EXISTS new_column TEXT;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_example_name 
  ON example_table(name);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY example_select ON example_table
  FOR SELECT TO authenticated
  USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON example_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### **Aplicar Migración**

```bash
# Localmente
supabase db push

# Producción
supabase db push --linked
```

---

## ⚡ Performance Tips

### **1. Usar Índices Apropiados**

```sql
-- Índices recomendados (si no existen)
CREATE INDEX CONCURRENTLY idx_test_results_execution_id 
  ON test_results(test_execution_id);

CREATE INDEX CONCURRENTLY idx_test_results_status 
  ON test_results(test_execution_id, status);

CREATE INDEX CONCURRENTLY idx_defects_project_status 
  ON defects(project_id, status) 
  WHERE status IN ('open', 'in_progress');

-- Índice para búsqueda de texto
CREATE INDEX CONCURRENTLY idx_test_cases_name_gin 
  ON test_cases USING gin(to_tsvector('english', name));
```

### **2. Usar SELECT Específico**

```typescript
// ❌ MAL - Trae todo
const { data } = await supabase
  .from('test_executions')
  .select('*');

// ✅ BIEN - Solo lo necesario
const { data } = await supabase
  .from('test_executions')
  .select('id, started_at, status, total_tests, passed_tests');
```

### **3. Paginar Resultados Grandes**

```typescript
const PAGE_SIZE = 50;

async function getExecutionsPaginated(page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  
  const { data, count, error } = await supabase
    .from('test_executions')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('started_at', { ascending: false });
  
  return {
    data,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    currentPage: page,
  };
}
```

### **4. Usar Vistas para Queries Complejas**

```typescript
// ✅ BIEN - Usar vista pre-calculada
const { data } = await supabase
  .from('v_project_health')
  .select('*')
  .eq('project_id', projectId);

// ❌ MAL - Query compleja cada vez
const { data: project } = await supabase
  .from('projects')
  .select(`
    *,
    test_executions (
      count,
      avg(duration_ms),
      test_results (count, status)
    )
  `)
  .eq('id', projectId);
```

---

## 🐛 Troubleshooting

### **Problema: RLS Blocking Queries**

**Síntoma**: Queries que funcionaban dejan de retornar datos

**Solución**:
```typescript
// Verificar políticas RLS
const { data, error } = await supabase
  .from('projects')
  .select('*');

if (error?.code === 'PGRST116') {
  console.error('RLS Policy blocking access');
  // Usuario no tiene permisos para ver estos datos
}

// Solución temporal (solo dev): Deshabilitar RLS
// ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

### **Problema: Foreign Key Violations**

**Síntoma**: `foreign key violation` al insertar

**Solución**:
```typescript
// Verificar que las FKs existan primero
const { data: project } = await supabase
  .from('projects')
  .select('id')
  .eq('id', projectId)
  .single();

if (!project) {
  throw new Error('Project not found');
}

// Ahora insertar
await supabase
  .from('test_suites')
  .insert({ project_id: projectId, ... });
```

### **Problema: Queries Lentas**

**Diagnóstico**:
```sql
-- Ver queries lentas
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Ver índices faltantes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 1000
  AND correlation < 0.1;
```

---

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema (Mermaid)](./HAIDA_DATABASE_DIAGRAM.md)

---

**Mantenido por**: HAIDA Engineering Team  
**Feedback**: Abre un issue en el repo
