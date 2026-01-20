# 🔍 HAIDA - SQL Queries & Recipes

**Colección de queries útiles para operaciones comunes**

---

## 📋 Índice

1. [Dashboard Queries](#dashboard-queries)
2. [Reporting Queries](#reporting-queries)
3. [Analytics Queries](#analytics-queries)
4. [Maintenance Queries](#maintenance-queries)
5. [Performance Queries](#performance-queries)

---

## 📊 Dashboard Queries

### **Project Health Summary**

```sql
-- Salud completa de todos los proyectos del tenant
SELECT 
  p.id,
  p.name,
  p.slug,
  p.status,
  
  -- Test Suites
  COUNT(DISTINCT ts.id) AS total_suites,
  COUNT(DISTINCT tc.id) AS total_cases,
  COUNT(DISTINCT tc.id) FILTER (WHERE tc.is_automated = true) AS automated_cases,
  
  -- Executions (últimos 30 días)
  COUNT(DISTINCT te.id) FILTER (WHERE te.started_at >= NOW() - INTERVAL '30 days') AS executions_30d,
  COUNT(DISTINCT te.id) FILTER (WHERE te.status = 'failed' AND te.started_at >= NOW() - INTERVAL '30 days') AS failed_30d,
  
  -- Defects abiertos
  COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('open', 'in_progress')) AS open_defects,
  
  -- Última ejecución
  MAX(te.started_at) AS last_execution_at,
  
  -- Tasa de éxito
  ROUND(
    100.0 * SUM(te.passed_tests) / NULLIF(SUM(te.total_tests), 0),
    2
  ) FILTER (WHERE te.completed_at >= NOW() - INTERVAL '30 days') AS success_rate_30d

FROM projects p
LEFT JOIN test_suites ts ON ts.project_id = p.id
LEFT JOIN test_cases tc ON tc.test_suite_id = ts.id
LEFT JOIN test_executions te ON te.project_id = p.id
LEFT JOIN defects d ON d.project_id = p.id

WHERE p.status = 'active'
GROUP BY p.id, p.name, p.slug, p.status
ORDER BY last_execution_at DESC NULLS LAST;
```

---

### **Top 5 Failing Tests**

```sql
-- Tests que más fallan en los últimos 30 días
SELECT 
  tc.test_id,
  tc.name,
  COUNT(*) AS total_runs,
  COUNT(*) FILTER (WHERE tr.status = 'failed') AS failures,
  ROUND(100.0 * COUNT(*) FILTER (WHERE tr.status = 'failed') / COUNT(*), 2) AS failure_rate,
  ARRAY_AGG(DISTINCT te.environment) AS environments,
  MAX(tr.created_at) AS last_failure

FROM test_results tr
JOIN test_executions te ON tr.test_execution_id = te.id
JOIN test_cases tc ON tr.test_case_id = tc.id

WHERE te.started_at >= NOW() - INTERVAL '30 days'
  AND te.project_id = :project_id

GROUP BY tc.id, tc.test_id, tc.name
HAVING COUNT(*) FILTER (WHERE tr.status = 'failed') > 0
ORDER BY failure_rate DESC, failures DESC
LIMIT 5;
```

---

### **Defects by Severity & Status**

```sql
-- Heatmap de defectos
SELECT 
  severity,
  status,
  COUNT(*) AS count,
  ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at)) / 86400), 1) AS avg_resolution_days,
  ARRAY_AGG(title ORDER BY created_at DESC) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_titles

FROM defects
WHERE project_id = :project_id

GROUP BY severity, status
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  CASE status
    WHEN 'open' THEN 1
    WHEN 'in_progress' THEN 2
    WHEN 'resolved' THEN 3
    WHEN 'closed' THEN 4
  END;
```

---

## 📈 Reporting Queries

### **Monthly Test Execution Report**

```sql
-- Reporte mensual de ejecuciones
WITH daily_stats AS (
  SELECT 
    DATE_TRUNC('day', started_at) AS day,
    COUNT(*) AS total_runs,
    SUM(total_tests) AS total_tests,
    SUM(passed_tests) AS passed_tests,
    SUM(failed_tests) AS failed_tests,
    AVG(duration_ms) AS avg_duration_ms
  FROM test_executions
  WHERE project_id = :project_id
    AND started_at >= DATE_TRUNC('month', NOW())
    AND status = 'completed'
  GROUP BY DATE_TRUNC('day', started_at)
)
SELECT 
  day,
  total_runs,
  total_tests,
  passed_tests,
  failed_tests,
  ROUND(100.0 * passed_tests / NULLIF(total_tests, 0), 2) AS pass_rate,
  ROUND(avg_duration_ms / 1000, 2) AS avg_duration_sec
FROM daily_stats
ORDER BY day;
```

---

### **Test Coverage Evolution**

```sql
-- Evolución de cobertura de automatización
WITH monthly_coverage AS (
  SELECT 
    DATE_TRUNC('month', tc.created_at) AS month,
    COUNT(*) AS total_cases,
    COUNT(*) FILTER (WHERE tc.is_automated = true) AS automated_cases
  FROM test_cases tc
  JOIN test_suites ts ON tc.test_suite_id = ts.id
  WHERE ts.project_id = :project_id
  GROUP BY DATE_TRUNC('month', tc.created_at)
)
SELECT 
  month,
  total_cases,
  automated_cases,
  ROUND(100.0 * automated_cases / total_cases, 2) AS automation_percentage,
  total_cases - LAG(total_cases) OVER (ORDER BY month) AS cases_added,
  automated_cases - LAG(automated_cases) OVER (ORDER BY month) AS automation_added
FROM monthly_coverage
ORDER BY month DESC
LIMIT 12;
```

---

### **Defect Resolution Time by Assignee**

```sql
-- Performance de resolución de defectos por persona
SELECT 
  u.name AS assignee_name,
  COUNT(*) AS total_defects,
  COUNT(*) FILTER (WHERE d.status = 'resolved') AS resolved,
  COUNT(*) FILTER (WHERE d.status IN ('open', 'in_progress')) AS pending,
  
  -- Tiempo promedio de resolución
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (d.resolved_at - d.created_at)) / 86400
    ) FILTER (WHERE d.resolved_at IS NOT NULL),
    1
  ) AS avg_resolution_days,
  
  -- Tiempo más rápido
  ROUND(
    MIN(
      EXTRACT(EPOCH FROM (d.resolved_at - d.created_at)) / 3600
    ) FILTER (WHERE d.resolved_at IS NOT NULL),
    1
  ) AS fastest_resolution_hours

FROM defects d
LEFT JOIN users u ON d.assigned_to = u.id

WHERE d.project_id = :project_id
  AND d.created_at >= NOW() - INTERVAL '90 days'

GROUP BY u.id, u.name
HAVING COUNT(*) > 0
ORDER BY avg_resolution_days NULLS LAST;
```

---

## 🔬 Analytics Queries

### **Test Flakiness Detection**

```sql
-- Tests que son "flaky" (pasan y fallan intermitentemente)
WITH test_stability AS (
  SELECT 
    tc.test_id,
    tc.name,
    COUNT(*) AS total_runs,
    COUNT(DISTINCT tr.status) AS distinct_statuses,
    COUNT(*) FILTER (WHERE tr.status = 'passed') AS passes,
    COUNT(*) FILTER (WHERE tr.status = 'failed') AS failures
  FROM test_results tr
  JOIN test_cases tc ON tr.test_case_id = tc.id
  JOIN test_executions te ON tr.test_execution_id = te.id
  WHERE te.started_at >= NOW() - INTERVAL '30 days'
    AND te.project_id = :project_id
  GROUP BY tc.id, tc.test_id, tc.name
)
SELECT 
  test_id,
  name,
  total_runs,
  passes,
  failures,
  ROUND(100.0 * failures / total_runs, 2) AS failure_rate,
  -- Flaky si tiene ambos estados y no es 100% fail/pass
  CASE 
    WHEN distinct_statuses > 1 
      AND failure_rate BETWEEN 5 AND 95 
    THEN 'FLAKY ⚠️'
    ELSE 'STABLE ✅'
  END AS stability
FROM test_stability
WHERE total_runs >= 5 -- Mínimo 5 ejecuciones
ORDER BY 
  CASE 
    WHEN distinct_statuses > 1 AND failure_rate BETWEEN 5 AND 95 THEN 1 
    ELSE 2 
  END,
  failure_rate DESC;
```

---

### **Most Time-Consuming Tests**

```sql
-- Tests más lentos (candidatos a optimización)
SELECT 
  tc.test_id,
  tc.name,
  tc.automation_framework,
  COUNT(*) AS executions,
  ROUND(AVG(tr.duration_ms) / 1000, 2) AS avg_duration_sec,
  ROUND(MAX(tr.duration_ms) / 1000, 2) AS max_duration_sec,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY tr.duration_ms) / 1000, 2) AS p95_duration_sec

FROM test_results tr
JOIN test_cases tc ON tr.test_case_id = tc.id
JOIN test_executions te ON tr.test_execution_id = te.id

WHERE te.started_at >= NOW() - INTERVAL '30 days'
  AND te.project_id = :project_id
  AND tr.duration_ms IS NOT NULL

GROUP BY tc.id, tc.test_id, tc.name, tc.automation_framework
HAVING AVG(tr.duration_ms) > 5000 -- Más de 5 segundos

ORDER BY avg_duration_sec DESC
LIMIT 20;
```

---

### **Change Detection Impact**

```sql
-- Impacto de cambios en calidad de tests
SELECT 
  cd.change_type,
  cd.tag AS version,
  cd.detected_at,
  
  -- Tests ejecutados
  COUNT(DISTINCT te.id) AS executions_triggered,
  SUM(te.total_tests) AS total_tests_run,
  SUM(te.failed_tests) AS total_failures,
  
  -- Tasa de éxito
  ROUND(
    100.0 * SUM(te.passed_tests) / NULLIF(SUM(te.total_tests), 0),
    2
  ) AS success_rate,
  
  -- Defectos creados
  COUNT(DISTINCT d.id) AS defects_created

FROM change_detections cd
LEFT JOIN test_executions te ON te.change_detection_id = cd.id
LEFT JOIN defects d ON d.test_execution_id = te.id

WHERE cd.project_id = :project_id
  AND cd.detected_at >= NOW() - INTERVAL '90 days'

GROUP BY cd.id, cd.change_type, cd.tag, cd.detected_at
ORDER BY cd.detected_at DESC
LIMIT 50;
```

---

## 🧹 Maintenance Queries

### **Clean Up Old Executions**

```sql
-- Archivar ejecuciones antiguas (> 180 días)
-- ⚠️ IMPORTANTE: Hacer backup antes!

-- 1. Verificar cuántas serían eliminadas
SELECT COUNT(*) 
FROM test_executions
WHERE completed_at < NOW() - INTERVAL '180 days';

-- 2. Archivar en tabla histórica (crear primero)
INSERT INTO test_executions_archive
SELECT * FROM test_executions
WHERE completed_at < NOW() - INTERVAL '180 days';

-- 3. Eliminar de tabla principal
DELETE FROM test_executions
WHERE completed_at < NOW() - INTERVAL '180 days';

-- 4. Vacuum para recuperar espacio
VACUUM FULL test_executions;
```

---

### **Rebuild Test Case Statistics**

```sql
-- Recalcular estadísticas de casos de prueba
UPDATE test_cases tc
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{stats}',
  jsonb_build_object(
    'total_runs', (
      SELECT COUNT(*) 
      FROM test_results tr
      JOIN test_executions te ON tr.test_execution_id = te.id
      WHERE tr.test_case_id = tc.id
        AND te.started_at >= NOW() - INTERVAL '90 days'
    ),
    'failures', (
      SELECT COUNT(*) 
      FROM test_results tr
      JOIN test_executions te ON tr.test_execution_id = te.id
      WHERE tr.test_case_id = tc.id
        AND tr.status = 'failed'
        AND te.started_at >= NOW() - INTERVAL '90 days'
    ),
    'avg_duration_ms', (
      SELECT ROUND(AVG(tr.duration_ms))
      FROM test_results tr
      JOIN test_executions te ON tr.test_execution_id = te.id
      WHERE tr.test_case_id = tc.id
        AND te.started_at >= NOW() - INTERVAL '90 days'
    )
  )
)
WHERE EXISTS (
  SELECT 1 FROM test_results tr
  WHERE tr.test_case_id = tc.id
);
```

---

### **Find Orphaned Test Cases**

```sql
-- Test cases sin resultados en los últimos 90 días
SELECT 
  tc.id,
  tc.test_id,
  tc.name,
  tc.created_at,
  ts.name AS suite_name,
  p.name AS project_name,
  EXTRACT(DAY FROM NOW() - tc.created_at) AS days_since_created

FROM test_cases tc
JOIN test_suites ts ON tc.test_suite_id = ts.id
JOIN projects p ON ts.project_id = p.id

WHERE tc.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM test_results tr
    JOIN test_executions te ON tr.test_execution_id = te.id
    WHERE tr.test_case_id = tc.id
      AND te.started_at >= NOW() - INTERVAL '90 days'
  )

ORDER BY tc.created_at
LIMIT 100;
```

---

## 📊 Reporting Queries

### **Executive Summary Report**

```sql
-- Resumen ejecutivo para management
WITH project_stats AS (
  SELECT 
    p.id,
    p.name,
    COUNT(DISTINCT ts.id) AS suites,
    COUNT(DISTINCT tc.id) AS total_cases,
    COUNT(DISTINCT tc.id) FILTER (WHERE tc.is_automated) AS automated,
    COUNT(DISTINCT te.id) AS executions,
    SUM(te.total_tests) AS tests_run,
    SUM(te.passed_tests) AS tests_passed
  FROM projects p
  LEFT JOIN test_suites ts ON ts.project_id = p.id
  LEFT JOIN test_cases tc ON tc.test_suite_id = ts.id
  LEFT JOIN test_executions te ON te.project_id = p.id
    AND te.started_at >= DATE_TRUNC('month', NOW())
  WHERE p.status = 'active'
  GROUP BY p.id, p.name
)
SELECT 
  name AS "Project",
  suites AS "Test Suites",
  total_cases AS "Total Cases",
  automated AS "Automated",
  ROUND(100.0 * automated / NULLIF(total_cases, 0), 1) || '%' AS "Automation %",
  executions AS "Runs (MTD)",
  tests_run AS "Tests Run",
  ROUND(100.0 * tests_passed / NULLIF(tests_run, 0), 1) || '%' AS "Pass Rate"
FROM project_stats
ORDER BY tests_run DESC;
```

---

### **Test ROI Calculation**

```sql
-- Calcular ROI de automatización
WITH manual_vs_automated AS (
  SELECT 
    tc.is_automated,
    COUNT(*) AS test_count,
    -- Estimación de tiempo manual: 10 min/test
    COUNT(*) * 10 AS manual_time_minutes,
    -- Estimación de tiempo automatizado: 30 seg/test
    COUNT(*) * 0.5 AS automated_time_minutes,
    -- Ejecuciones en el último mes
    (
      SELECT COUNT(*) 
      FROM test_executions 
      WHERE project_id = :project_id
        AND started_at >= DATE_TRUNC('month', NOW())
    ) AS monthly_runs
  FROM test_cases tc
  JOIN test_suites ts ON tc.test_suite_id = ts.id
  WHERE ts.project_id = :project_id
    AND tc.status = 'active'
  GROUP BY tc.is_automated
)
SELECT 
  test_count,
  is_automated,
  manual_time_minutes AS time_per_run_manual,
  automated_time_minutes AS time_per_run_automated,
  monthly_runs,
  
  -- Tiempo ahorrado por mes
  (manual_time_minutes - automated_time_minutes) * monthly_runs AS time_saved_monthly_minutes,
  
  -- Convertir a horas
  ROUND(
    ((manual_time_minutes - automated_time_minutes) * monthly_runs) / 60,
    1
  ) AS time_saved_monthly_hours,
  
  -- Ahorro anual (asumiendo $50/hora QA)
  ROUND(
    (((manual_time_minutes - automated_time_minutes) * monthly_runs) / 60) * 12 * 50,
    2
  ) AS annual_savings_usd

FROM manual_vs_automated
WHERE is_automated = true;
```

---

## 🔍 Analytics Queries

### **Test Case Clustering (Similar Failures)**

```sql
-- Encontrar patrones en fallos (tests que fallan juntos)
WITH failing_tests AS (
  SELECT 
    te.id AS execution_id,
    ARRAY_AGG(tc.test_id ORDER BY tc.test_id) AS failed_test_ids
  FROM test_executions te
  JOIN test_results tr ON tr.test_execution_id = te.id
  JOIN test_cases tc ON tr.test_case_id = tc.id
  WHERE te.project_id = :project_id
    AND te.started_at >= NOW() - INTERVAL '30 days'
    AND tr.status = 'failed'
  GROUP BY te.id
  HAVING COUNT(*) > 1 -- Solo ejecuciones con múltiples fallos
)
SELECT 
  failed_test_ids,
  COUNT(*) AS occurrences,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM test_executions WHERE project_id = :project_id), 2) AS percentage
FROM failing_tests
GROUP BY failed_test_ids
HAVING COUNT(*) >= 3 -- Al menos 3 veces el mismo patrón
ORDER BY occurrences DESC
LIMIT 10;
```

---

### **Browser/Environment Analysis**

```sql
-- Distribución de fallos por browser/environment
SELECT 
  te.environment,
  te.browser,
  COUNT(DISTINCT te.id) AS executions,
  SUM(te.total_tests) AS total_tests,
  SUM(te.failed_tests) AS failures,
  ROUND(100.0 * SUM(te.failed_tests) / NULLIF(SUM(te.total_tests), 0), 2) AS failure_rate,
  
  -- Top error
  (
    SELECT error_message
    FROM test_results tr
    WHERE tr.test_execution_id = te.id
      AND tr.status = 'failed'
      AND tr.error_message IS NOT NULL
    GROUP BY error_message
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) AS most_common_error

FROM test_executions te
WHERE te.project_id = :project_id
  AND te.started_at >= NOW() - INTERVAL '30 days'
  AND te.status = 'completed'

GROUP BY te.environment, te.browser
ORDER BY failure_rate DESC, executions DESC;
```

---

### **Test Execution Trends (7 days rolling average)**

```sql
-- Tendencia de éxito con media móvil de 7 días
WITH daily_success AS (
  SELECT 
    DATE_TRUNC('day', started_at) AS day,
    ROUND(100.0 * SUM(passed_tests) / NULLIF(SUM(total_tests), 0), 2) AS success_rate
  FROM test_executions
  WHERE project_id = :project_id
    AND started_at >= NOW() - INTERVAL '60 days'
    AND status = 'completed'
  GROUP BY DATE_TRUNC('day', started_at)
)
SELECT 
  day,
  success_rate,
  -- Media móvil de 7 días
  ROUND(
    AVG(success_rate) OVER (
      ORDER BY day
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ),
    2
  ) AS rolling_avg_7d
FROM daily_success
ORDER BY day;
```

---

## ⚡ Performance Queries

### **Slow Query Detection**

```sql
-- Queries lentas (usar en Supabase Dashboard)
SELECT 
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(max_exec_time::numeric, 2) AS max_ms,
  ROUND(total_exec_time::numeric, 2) AS total_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND mean_exec_time > 100 -- Más de 100ms promedio
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

### **Missing Indexes**

```sql
-- Índices recomendados
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.5
  AND tablename IN (
    'test_results',
    'test_executions',
    'defects',
    'test_cases'
  )
ORDER BY n_distinct DESC;

-- Si aparece, crear índice:
-- CREATE INDEX CONCURRENTLY idx_table_column ON table(column);
```

---

### **Table Sizes & Growth**

```sql
-- Tamaños de tablas y crecimiento
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size,
  
  -- Estimación de crecimiento (basado en tuplas)
  n_live_tup AS rows,
  n_dead_tup AS dead_rows,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup, 0), 2) AS bloat_pct

FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

---

## 🛠️ Utility Queries

### **Duplicate Test IDs**

```sql
-- Encontrar test_ids duplicados
SELECT 
  test_id,
  COUNT(*) AS occurrences,
  ARRAY_AGG(name) AS test_names,
  ARRAY_AGG(id::text) AS ids
FROM test_cases
WHERE test_id IS NOT NULL
GROUP BY test_id
HAVING COUNT(*) > 1;
```

---

### **Audit User Activity**

```sql
-- Actividad de usuarios en los últimos 7 días
SELECT 
  u.name,
  u.email,
  COUNT(DISTINCT el.id) AS events,
  ARRAY_AGG(DISTINCT el.event_type ORDER BY el.event_type) AS event_types,
  MAX(el.created_at) AS last_activity
FROM users u
LEFT JOIN event_logs el ON el.user_id = u.id
  AND el.created_at >= NOW() - INTERVAL '7 days'
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email
ORDER BY events DESC, last_activity DESC NULLS LAST;
```

---

### **RLS Policy Checker**

```sql
-- Verificar que RLS esté habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tenants',
    'tenant_members',
    'defects',
    'chat_threads',
    'chat_messages',
    'user_feature_flags',
    'tenant_feature_flags'
  )
ORDER BY rls_enabled, tablename;

-- Si rls_enabled = false, habilitar:
-- ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;
```

---

## 📦 Backup & Restore

### **Backup Completo**

```bash
# Backup usando pg_dump
pg_dump \
  --format=custom \
  --file=haida_backup_$(date +%Y%m%d).dump \
  --verbose \
  "postgresql://user:pass@host:5432/haida"

# Backup solo schema (sin datos)
pg_dump \
  --schema-only \
  --file=haida_schema.sql \
  "postgresql://user:pass@host:5432/haida"
```

---

### **Backup Selectivo**

```sql
-- Export de un proyecto específico (con dependencias)
COPY (
  SELECT row_to_json(t) FROM (
    SELECT 
      p.*,
      (SELECT ARRAY_AGG(ts.* ORDER BY ts.created_at) 
       FROM test_suites ts WHERE ts.project_id = p.id) AS test_suites,
      (SELECT ARRAY_AGG(te.* ORDER BY te.started_at DESC) 
       FROM test_executions te WHERE te.project_id = p.id) AS executions
    FROM projects p
    WHERE p.id = :project_id
  ) t
) TO '/tmp/project_backup.json';
```

---

### **Restore**

```bash
# Restore completo
pg_restore \
  --clean \
  --if-exists \
  --verbose \
  --dbname="postgresql://user:pass@host:5432/haida" \
  haida_backup_20250120.dump

# Restore solo tablas específicas
pg_restore \
  --table=projects \
  --table=test_suites \
  --table=test_cases \
  --dbname="postgresql://user:pass@host:5432/haida" \
  backup.dump
```

---

## 🎯 Use Case Recipes

### **"¿Qué tests debo automatizar primero?"**

```sql
-- Priorización de automatización basada en:
-- 1. Tests que se ejecutan frecuentemente
-- 2. Tests que fallan seguido
-- 3. Tests críticos
SELECT 
  tc.test_id,
  tc.name,
  tc.priority,
  COUNT(tr.id) AS executions_30d,
  COUNT(tr.id) FILTER (WHERE tr.status = 'failed') AS failures,
  ROUND(100.0 * COUNT(tr.id) FILTER (WHERE tr.status = 'failed') / COUNT(tr.id), 2) AS failure_rate,
  
  -- Score de priorización
  (
    CASE tc.priority
      WHEN 'critical' THEN 100
      WHEN 'high' THEN 75
      WHEN 'medium' THEN 50
      WHEN 'low' THEN 25
    END
    + COUNT(tr.id) * 2 -- Frecuencia
    + COUNT(tr.id) FILTER (WHERE tr.status = 'failed') * 10 -- Fallos
  ) AS automation_priority_score

FROM test_cases tc
LEFT JOIN test_results tr ON tr.test_case_id = tc.id
LEFT JOIN test_executions te ON tr.test_execution_id = te.id
  AND te.started_at >= NOW() - INTERVAL '30 days'

WHERE tc.is_automated = false
  AND tc.status = 'active'
  AND tc.test_suite_id IN (
    SELECT id FROM test_suites WHERE project_id = :project_id
  )

GROUP BY tc.id, tc.test_id, tc.name, tc.priority
HAVING COUNT(tr.id) > 5 -- Al menos 5 ejecuciones

ORDER BY automation_priority_score DESC
LIMIT 20;
```

---

### **"¿Qué defectos tienen mayor impacto?"**

```sql
-- Defectos con mayor impacto (bloquean más tests)
SELECT 
  d.id,
  d.title,
  d.severity,
  d.status,
  
  -- Tests bloqueados
  COUNT(DISTINCT tr.test_case_id) AS tests_blocked,
  
  -- Ejecuciones afectadas
  COUNT(DISTINCT te.id) AS executions_affected,
  
  -- Días abierto
  EXTRACT(DAY FROM NOW() - d.created_at) AS days_open,
  
  -- Asignado a
  u.name AS assigned_to,
  
  -- External tracking
  d.external_url

FROM defects d
LEFT JOIN test_results tr ON tr.test_result_id = d.test_result_id
  OR tr.test_execution_id = d.test_execution_id
LEFT JOIN test_executions te ON te.id = d.test_execution_id
LEFT JOIN users u ON u.id = d.assigned_to

WHERE d.status IN ('open', 'in_progress')
  AND d.project_id = :project_id

GROUP BY d.id, d.title, d.severity, d.status, d.created_at, u.name, d.external_url
ORDER BY 
  CASE d.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  tests_blocked DESC
LIMIT 20;
```

---

## 🔧 Database Functions

### **Calculate Test Health Score**

```sql
CREATE OR REPLACE FUNCTION calculate_test_health_score(p_test_case_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_runs INTEGER;
  v_failures INTEGER;
  v_avg_duration_ms NUMERIC;
  v_score NUMERIC;
BEGIN
  -- Obtener stats de últimos 30 días
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'failed'),
    AVG(duration_ms)
  INTO v_total_runs, v_failures, v_avg_duration_ms
  FROM test_results tr
  JOIN test_executions te ON tr.test_execution_id = te.id
  WHERE tr.test_case_id = p_test_case_id
    AND te.started_at >= NOW() - INTERVAL '30 days';
  
  -- No hay ejecuciones
  IF v_total_runs = 0 THEN
    RETURN 0;
  END IF;
  
  -- Calcular score (0-100)
  -- 100 = Perfecto (siempre pasa, rápido)
  -- 0 = Malo (siempre falla, lento)
  v_score := 100;
  
  -- Penalización por fallos (max -50 puntos)
  v_score := v_score - (50.0 * v_failures / v_total_runs);
  
  -- Penalización por duración (max -20 puntos)
  IF v_avg_duration_ms > 30000 THEN -- Más de 30 segundos
    v_score := v_score - 20;
  ELSIF v_avg_duration_ms > 10000 THEN
    v_score := v_score - 10;
  END IF;
  
  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql STABLE;

-- Uso:
SELECT 
  test_id,
  name,
  calculate_test_health_score(id) AS health_score
FROM test_cases
WHERE test_suite_id = :suite_id
ORDER BY health_score ASC;
```

---

### **Auto-Create Defect from Failed Test**

```sql
CREATE OR REPLACE FUNCTION auto_create_defect_from_failure()
RETURNS TRIGGER AS $$
DECLARE
  v_test_case test_cases%ROWTYPE;
  v_execution test_executions%ROWTYPE;
BEGIN
  -- Solo si el test falló
  IF NEW.status != 'failed' THEN
    RETURN NEW;
  END IF;
  
  -- Obtener info del test case
  SELECT * INTO v_test_case
  FROM test_cases
  WHERE id = NEW.test_case_id;
  
  -- Obtener info de la ejecución
  SELECT * INTO v_execution
  FROM test_executions
  WHERE id = NEW.test_execution_id;
  
  -- Crear defecto automáticamente
  INSERT INTO defects (
    tenant_id,
    project_id,
    test_execution_id,
    test_result_id,
    title,
    severity,
    priority,
    status,
    steps_to_reproduce,
    expected_behavior,
    actual_behavior,
    environment,
    browser,
    reported_by
  ) VALUES (
    (SELECT tenant_id FROM projects WHERE id = v_execution.project_id),
    v_execution.project_id,
    NEW.test_execution_id,
    NEW.id,
    'Test Failed: ' || COALESCE(v_test_case.name, NEW.test_name),
    CASE v_test_case.priority
      WHEN 'critical' THEN 'critical'
      WHEN 'high' THEN 'high'
      ELSE 'medium'
    END,
    CASE v_test_case.priority
      WHEN 'critical' THEN 'p0'
      WHEN 'high' THEN 'p1'
      WHEN 'medium' THEN 'p2'
      ELSE 'p3'
    END,
    'open',
    COALESCE(v_test_case.test_steps, 'N/A'),
    COALESCE(v_test_case.expected_result, 'Test should pass'),
    COALESCE(NEW.error_message, 'Test failed'),
    v_execution.environment,
    v_execution.browser,
    v_execution.triggered_by
  )
  ON CONFLICT DO NOTHING; -- Evitar duplicados
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Activar trigger
DROP TRIGGER IF EXISTS trigger_auto_create_defect ON test_results;
CREATE TRIGGER trigger_auto_create_defect
  AFTER INSERT ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_defect_from_failure();
```

---

## 🎓 Advanced Recipes

### **Materialize Project Stats (Performance)**

```sql
-- Crear tabla materializada para stats pesadas
CREATE MATERIALIZED VIEW mv_project_stats AS
SELECT 
  p.id AS project_id,
  p.name,
  COUNT(DISTINCT ts.id) AS total_suites,
  COUNT(DISTINCT tc.id) AS total_cases,
  COUNT(DISTINCT tc.id) FILTER (WHERE tc.is_automated) AS automated_cases,
  COUNT(DISTINCT te.id) AS total_executions,
  ROUND(
    100.0 * SUM(te.passed_tests) / NULLIF(SUM(te.total_tests), 0),
    2
  ) AS overall_success_rate
FROM projects p
LEFT JOIN test_suites ts ON ts.project_id = p.id
LEFT JOIN test_cases tc ON tc.test_suite_id = ts.id
LEFT JOIN test_executions te ON te.project_id = p.id
  AND te.started_at >= NOW() - INTERVAL '90 days'
GROUP BY p.id, p.name;

-- Crear índice
CREATE UNIQUE INDEX idx_mv_project_stats_project_id 
  ON mv_project_stats(project_id);

-- Refrescar (ejecutar cada 6 horas con pg_cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_stats;

-- Query súper rápido
SELECT * FROM mv_project_stats WHERE project_id = :project_id;
```

---

### **Partition Large Tables**

```sql
-- Particionar test_results por mes (si crece mucho)
-- NOTA: Requiere recrear tabla

-- 1. Crear tabla particionada
CREATE TABLE test_results_partitioned (
  LIKE test_results INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 2. Crear particiones mensuales
CREATE TABLE test_results_2025_01 PARTITION OF test_results_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE test_results_2025_02 PARTITION OF test_results_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 3. Migrar datos
INSERT INTO test_results_partitioned SELECT * FROM test_results;

-- 4. Renombrar tablas (después de verificar)
ALTER TABLE test_results RENAME TO test_results_old;
ALTER TABLE test_results_partitioned RENAME TO test_results;

-- 5. Auto-create partitions (función)
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  v_partition_name TEXT;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  v_start_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  v_end_date := v_start_date + INTERVAL '1 month';
  v_partition_name := 'test_results_' || TO_CHAR(v_start_date, 'YYYY_MM');
  
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF test_results FOR VALUES FROM (%L) TO (%L)',
    v_partition_name,
    v_start_date,
    v_end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Programar con pg_cron (ejecutar el día 25 de cada mes)
SELECT cron.schedule('create-partitions', '0 0 25 * *', 'SELECT create_monthly_partition()');
```

---

## 📚 Más Recursos

- [Database Guide](./DATABASE_GUIDE.md) - Guía completa de uso
- [API Reference](./API_REFERENCE.md) - Endpoints REST
- [Security Best Practices](./SECURITY_ARCHITECTURE.md) - Seguridad

---

**¿Falta alguna query que necesites?**  
Abre un [GitHub Issue](https://github.com/tu-org/haida/issues/new) con tag `documentation`.

---

**Última actualización**: 2025-01-20  
**Mantenido por**: HAIDA Engineering Team
