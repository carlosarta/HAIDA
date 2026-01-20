# 🗺️ HAIDA - API Reference

**Versión**: 1.0.0  
**Base URL**: `/api/v1`  
**Autenticación**: Bearer Token (Supabase Auth)  

---

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Projects API](#projects-api)
3. [Test Suites API](#test-suites-api)
4. [Test Cases API](#test-cases-api)
5. [Executions API](#executions-api)
6. [Defects API](#defects-api)
7. [Chat IA API](#chat-ia-api)
8. [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

### **Login**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "qa_engineer"
  }
}
```

### **Uso del Token**

```typescript
// Configurar token en headers
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// O por request
const response = await apiClient.get('/projects', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## 🗂️ Projects API

### **GET /projects**
Lista todos los proyectos del tenant

**Query Parameters**:
```typescript
interface GetProjectsParams {
  tenant_id?: string;
  status?: 'active' | 'inactive' | 'archived';
  owner_id?: string;
  page?: number;
  limit?: number;
}
```

**Example**:
```typescript
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "E-commerce App",
    "slug": "ecommerce-app",
    "base_url": "https://example.com",
    "status": "active",
    "owner_id": "uuid",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-20T15:30:00Z"
  }
]
```

---

### **POST /projects**
Crea un nuevo proyecto

**Body**:
```typescript
interface CreateProjectBody {
  name: string;
  slug: string;
  description?: string;
  base_url?: string;
  repository_url?: string;
  settings?: {
    change_detection_enabled?: boolean;
    auto_trigger_tests?: boolean;
  };
}
```

**Example**:
```typescript
const { data: project, error } = await supabase
  .from('projects')
  .insert({
    name: 'New Project',
    slug: 'new-project',
    base_url: 'https://example.com',
    owner_id: userId,
  })
  .select()
  .single();
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "name": "New Project",
  "slug": "new-project",
  ...
}
```

---

### **PUT /projects/:id**
Actualiza un proyecto

**Body**:
```typescript
interface UpdateProjectBody {
  name?: string;
  description?: string;
  base_url?: string;
  status?: 'active' | 'inactive' | 'archived';
  settings?: Record<string, any>;
}
```

**Example**:
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({
    name: 'Updated Name',
    status: 'archived',
  })
  .eq('id', projectId)
  .select()
  .single();
```

---

### **DELETE /projects/:id**
Elimina un proyecto (CASCADE)

**Example**:
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);

// ⚠️ IMPORTANTE: Esto también eliminará:
// - Test Suites del proyecto
// - Test Cases de esas suites
// - Test Executions del proyecto
// - Test Results de esas ejecuciones
```

---

## 🧪 Test Suites API

### **GET /projects/:projectId/suites**

```typescript
const { data: suites } = await supabase
  .from('test_suites')
  .select(`
    *,
    test_cases (count)
  `)
  .eq('project_id', projectId)
  .eq('is_active', true);
```

**Response**:
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "name": "Smoke Tests",
    "suite_type": "smoke",
    "priority": "critical",
    "tags": ["smoke", "critical"],
    "test_cases": [{ "count": 25 }]
  }
]
```

---

### **POST /projects/:projectId/suites**

```typescript
const { data: suite } = await supabase
  .from('test_suites')
  .insert({
    project_id: projectId,
    name: 'Integration Tests',
    suite_type: 'integration',
    priority: 'high',
    tags: ['api', 'backend'],
    created_by: userId,
  })
  .select()
  .single();
```

---

## 📝 Test Cases API

### **GET /suites/:suiteId/cases**

```typescript
const { data: cases } = await supabase
  .from('test_cases')
  .select('*')
  .eq('test_suite_id', suiteId)
  .eq('status', 'active')
  .order('priority', { ascending: false });
```

**Response**:
```json
[
  {
    "id": "uuid",
    "test_suite_id": "uuid",
    "test_id": "TC-001",
    "name": "Login with valid credentials",
    "test_type": "smoke",
    "priority": "critical",
    "is_automated": true,
    "automation_script_path": "/tests/login.spec.ts",
    "test_steps": "1. Navigate to /login\n2. Enter valid credentials\n3. Click submit",
    "expected_result": "User is redirected to dashboard",
    "tags": ["auth", "smoke"]
  }
]
```

---

### **POST /suites/:suiteId/cases**

```typescript
const { data: testCase } = await supabase
  .from('test_cases')
  .insert({
    test_suite_id: suiteId,
    test_id: 'TC-042',
    name: 'Checkout with coupon code',
    test_type: 'e2e',
    priority: 'high',
    test_steps: '1. Add items to cart\n2. Apply coupon\n3. Complete checkout',
    expected_result: 'Order placed with discount',
    is_automated: true,
    automation_script_path: '/tests/checkout-coupon.spec.ts',
    created_by: userId,
  })
  .select()
  .single();
```

---

## 🚀 Executions API

### **POST /executions**
Crea una nueva ejecución de tests

```typescript
const { data: execution } = await supabase
  .from('test_executions')
  .insert({
    project_id: projectId,
    execution_type: 'triggered',
    trigger_source: 'webhook',
    environment: 'staging',
    browser: 'chrome',
    status: 'running',
    triggered_by: userId,
  })
  .select()
  .single();
```

**Response**: `201 Created`

---

### **POST /executions/:id/results**
Agrega resultados de tests a una ejecución

```typescript
const results = [
  {
    test_execution_id: executionId,
    test_case_id: 'case-uuid-1',
    test_name: 'Login test',
    status: 'passed',
    duration_ms: 1250,
    assertions_passed: 5,
  },
  {
    test_execution_id: executionId,
    test_case_id: 'case-uuid-2',
    test_name: 'Checkout test',
    status: 'failed',
    duration_ms: 3400,
    error_message: 'Element not found: #submit-btn',
    screenshot_url: 'https://storage.com/screenshot.png',
    assertions_failed: 1,
  },
];

const { data, error } = await supabase
  .from('test_results')
  .insert(results);
```

---

### **PUT /executions/:id/complete**
Marca ejecución como completada

```typescript
// Calcular totales
const { data: results } = await supabase
  .from('test_results')
  .select('status')
  .eq('test_execution_id', executionId);

const passed = results?.filter(r => r.status === 'passed').length || 0;
const failed = results?.filter(r => r.status === 'failed').length || 0;

// Actualizar execution
const { data: execution } = await supabase
  .from('test_executions')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    total_tests: results?.length || 0,
    passed_tests: passed,
    failed_tests: failed,
  })
  .eq('id', executionId)
  .select()
  .single();
```

---

## 🐛 Defects API

### **GET /defects**
Lista defectos con filtros

**Query Parameters**:
```typescript
interface GetDefectsParams {
  project_id?: string;
  severity?: DefectSeverity;
  status?: DefectStatus;
  assigned_to?: string;
  created_after?: string; // ISO date
  limit?: number;
}
```

**Example**:
```typescript
const { data: criticalDefects } = await supabase
  .from('defects')
  .select(`
    *,
    projects (name),
    test_executions (started_at, environment)
  `)
  .eq('severity', 'critical')
  .in('status', ['open', 'in_progress'])
  .order('created_at', { ascending: false });
```

---

### **POST /defects**
Crea un nuevo defecto

```typescript
const { data: defect } = await supabase
  .from('defects')
  .insert({
    tenant_id: tenantId,
    project_id: projectId,
    test_execution_id: executionId,
    test_result_id: resultId,
    title: 'Payment button not working',
    severity: 'critical',
    priority: 'p0',
    status: 'open',
    steps_to_reproduce: '1. Go to checkout\n2. Click pay\n3. Button does nothing',
    expected_behavior: 'Payment modal should open',
    actual_behavior: 'Nothing happens',
    environment: 'production',
    browser: 'Chrome 120',
    assigned_to: developerId,
    reported_by: userId,
  })
  .select()
  .single();
```

---

### **PUT /defects/:id**
Actualiza un defecto

```typescript
const { data } = await supabase
  .from('defects')
  .update({
    status: 'resolved',
    resolved_at: new Date().toISOString(),
    external_issue_id: 'JIRA-1234',
    external_url: 'https://jira.example.com/JIRA-1234',
  })
  .eq('id', defectId)
  .select()
  .single();
```

---

## 💬 Chat IA API

### **POST /chat/threads**
Crea un nuevo thread de conversación

```typescript
const { data: thread } = await supabase
  .from('chat_threads')
  .insert({
    tenant_id: tenantId,
    project_id: projectId, // Opcional
    user_id: userId,
    title: 'Debug test failures',
    provider: 'copilot-studio',
    status: 'active',
  })
  .select()
  .single();
```

---

### **POST /chat/threads/:threadId/messages**
Envía mensaje en un thread

```typescript
// 1. Agregar mensaje del usuario
const { data: userMsg } = await supabase
  .from('chat_messages')
  .insert({
    thread_id: threadId,
    role: 'user',
    content: '¿Por qué falló el test TC-001?',
    content_type: 'text',
  })
  .select()
  .single();

// 2. Enviar a IA y obtener respuesta
const response = await fetch('/api/chat/completion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    thread_id: threadId,
    message: userMsg.content,
  }),
});

// 3. Guardar respuesta de IA
const { data: aiResponse } = await response.json();

await supabase
  .from('chat_messages')
  .insert({
    thread_id: threadId,
    role: 'assistant',
    content: aiResponse.content,
    content_type: 'markdown',
  });
```

---

### **GET /chat/threads/:threadId/messages**
Obtiene historial de un thread

```typescript
const { data: messages } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('thread_id', threadId)
  .order('created_at', { ascending: true });
```

**Response**:
```json
[
  {
    "id": "uuid",
    "thread_id": "uuid",
    "role": "user",
    "content": "¿Por qué falló el test TC-001?",
    "content_type": "text",
    "created_at": "2025-01-20T10:15:00Z"
  },
  {
    "id": "uuid",
    "thread_id": "uuid",
    "role": "assistant",
    "content": "El test TC-001 falló porque...",
    "content_type": "markdown",
    "created_at": "2025-01-20T10:15:03Z"
  }
]
```

---

## 📊 Analytics & Views

### **GET /projects/:id/health**
Métricas de salud del proyecto

```typescript
const { data: health } = await supabase
  .from('v_project_health')
  .select('*')
  .eq('project_id', projectId)
  .single();
```

**Response**:
```json
{
  "project_id": "uuid",
  "project_name": "E-commerce App",
  "total_executions": 156,
  "completed_executions": 152,
  "failed_executions": 4,
  "avg_duration_ms": 45000,
  "total_assertions_passed": 2340,
  "total_assertions_failed": 12,
  "last_execution_at": "2025-01-20T14:00:00Z"
}
```

---

### **GET /projects/:id/coverage**
Cobertura de automatización

```typescript
const { data: coverage } = await supabase
  .from('v_test_coverage')
  .select('*')
  .eq('project_id', projectId);
```

**Response**:
```json
[
  {
    "test_suite_id": "uuid",
    "suite_name": "Smoke Tests",
    "total_test_cases": 25,
    "automated_test_cases": 25,
    "manual_test_cases": 0,
    "automation_percentage": 100
  }
]
```

---

## ❌ Códigos de Error

### **HTTP Status Codes**

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request exitoso |
| 201 | Created | Recurso creado correctamente |
| 204 | No Content | Delete exitoso |
| 400 | Bad Request | Validación falló |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | No tienes permisos (RLS) |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicate key (slug, email, etc.) |
| 422 | Unprocessable Entity | Validación de negocio falló |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

### **Error Response Format**

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project with ID 'xyz' does not exist",
    "details": {
      "project_id": "xyz",
      "tenant_id": "abc"
    },
    "timestamp": "2025-01-20T15:30:00Z"
  }
}
```

---

### **Common Error Codes**

| Code | HTTP | Descripción | Solución |
|------|------|-------------|----------|
| `AUTH_REQUIRED` | 401 | No autenticado | Hacer login primero |
| `PERMISSION_DENIED` | 403 | Sin permisos | Verificar role/tenant |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiados requests | Esperar 60 segundos |
| `VALIDATION_ERROR` | 400 | Datos inválidos | Verificar schema |
| `DUPLICATE_SLUG` | 409 | Slug ya existe | Usar slug diferente |
| `FOREIGN_KEY_VIOLATION` | 400 | FK no existe | Verificar IDs |
| `RLS_POLICY_VIOLATION` | 403 | RLS bloqueó query | Verificar tenant/user |
| `CSRF_TOKEN_INVALID` | 403 | Token CSRF inválido | Regenerar token |

---

### **Manejo de Errores en Frontend**

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Errores comunes
    switch (error.code) {
      case '23505': // Unique violation
        return { error: 'This item already exists' };
      
      case '23503': // Foreign key violation
        return { error: 'Referenced item does not exist' };
      
      case 'PGRST116': // RLS violation
        return { error: 'You do not have permission to access this resource' };
      
      default:
        return { error: 'An unexpected error occurred' };
    }
  }
}

// Uso
const { data, error } = await handleApiCall(() =>
  supabase.from('projects').insert(newProject).select().single()
);

if (error) {
  toast.error(error);
  return;
}

toast.success('Project created!');
```

---

## 🔄 Webhooks (Change Detection)

### **POST /webhooks/change-detected**
Endpoint para recibir notificaciones de cambios

**Body**:
```json
{
  "project_id": "uuid",
  "url": "https://example.com/api/users",
  "tag": "v2.3.1",
  "change_type": "deployment",
  "previous_md5": "abc123...",
  "current_md5": "def456...",
  "diff_summary": "+10 lines, -5 lines",
  "webhook_payload": {
    "commit": "abc123",
    "branch": "main",
    "author": "john@example.com"
  }
}
```

**Response**:
```json
{
  "change_detection_id": "uuid",
  "status": "pending",
  "test_suite_ids": ["suite-uuid-1", "suite-uuid-2"],
  "estimated_start": "2025-01-20T15:35:00Z"
}
```

---

## 🔑 Feature Flags API

### **GET /feature-flags**
Lista todas las feature flags

```typescript
const { data: flags } = await supabase
  .from('feature_flags')
  .select('*')
  .eq('is_active', true);
```

---

### **POST /feature-flags/:key/enable**
Habilita flag para tenant/usuario

```typescript
// Para tenant
await supabase
  .from('tenant_feature_flags')
  .upsert({
    tenant_id: tenantId,
    flag_key: 'advanced_reporting',
    is_enabled: true,
    value: { max_reports: 100 },
  });

// Para usuario específico
await supabase
  .from('user_feature_flags')
  .upsert({
    user_id: userId,
    flag_key: 'beta_features',
    is_enabled: true,
  });
```

---

## 📈 Rate Limits

| Endpoint | Limit | Window | Autenticado |
|----------|-------|--------|-------------|
| `/auth/login` | 5 requests | 1 min | No |
| `/auth/password-reset` | 3 requests | 5 min | No |
| Global API | 100 requests | 1 min | Sí |
| `/chat/*` | 20 requests | 1 min | Sí |
| `/executions` (POST) | 10 requests | 1 min | Sí |

**Headers de Rate Limit**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642684800
```

---

## 🔒 Security Headers

Todos los responses incluyen:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## 🌐 CORS

**Allowed Origins** (configurar en backend):
```
https://haida.example.com
https://*.haida.example.com
```

**Allowed Methods**:
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers**:
```
Content-Type, Authorization, X-CSRF-Token
```

---

## 📚 SDK Client (TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Inicializar cliente
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// CRUD typesafe
class ProjectsAPI {
  async list() {
    return await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
  }
  
  async get(id: string) {
    return await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
  }
  
  async create(data: InsertProject) {
    return await supabase
      .from('projects')
      .insert(data)
      .select()
      .single();
  }
  
  async update(id: string, updates: UpdateProject) {
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }
  
  async delete(id: string) {
    return await supabase
      .from('projects')
      .delete()
      .eq('id', id);
  }
}

export const projectsAPI = new ProjectsAPI();
```

---

## 🧪 Testing the API

### **Postman Collection**

Importa la colección: [HAIDA.postman_collection.json](./postman/HAIDA.postman_collection.json)

### **cURL Examples**

```bash
# Login
curl -X POST https://api.haida.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get projects
curl -X GET https://api.haida.com/projects \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create test case
curl -X POST https://api.haida.com/suites/SUITE_ID/cases \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-CSRF-Token: CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_id": "TC-042",
    "name": "Login test",
    "priority": "high"
  }'
```

---

**Última actualización**: 2025-01-20  
**Versión API**: v1  
**Changelog**: Ver [SECURITY_CHANGELOG.md](./SECURITY_CHANGELOG.md)
