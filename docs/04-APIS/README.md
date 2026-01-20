# 🔌 04 - APIs

**Documentación completa de APIs y servicios externos**

---

## **📚 Tabla de Contenidos**

1. [API Central](#api-central)
2. [Telegram Bot API](#telegram-bot-api)
3. [Jira Cloud API](#jira-cloud-api)
4. [Confluence API](#confluence-api)
5. [Copilot Studio / OpenAI](#copilot-studio--openai)
6. [Webhooks](#webhooks)
7. [Rate Limiting](#rate-limiting)

---

## **API Central**

### **Base URL**
```
Production:  https://api.haida.example.com
Staging:     https://api-staging.haida.example.com
Development: http://localhost:3000
```

### **Authentication**
```http
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <tenant-uuid>
X-CSRF-Token: <csrf-token>
```

---

### **Endpoints**

#### **🔐 Auth**

**POST /api/auth/login**
```typescript
// Request
{
  email: string;
  provider: 'microsoft' | 'google' | 'email';
}

// Response
{
  user: User;
  token: string;
  tenant: Tenant;
}
```

**POST /api/auth/logout**
```typescript
// No body
// Response: 204 No Content
```

---

#### **📁 Projects**

**GET /api/projects**
```typescript
// Query params
?tenant_id=uuid
?status=active|inactive|archived
?limit=50
?offset=0

// Response
{
  data: Project[];
  total: number;
  page: number;
}
```

**GET /api/projects/:id**
```typescript
// Response
{
  id: string;
  name: string;
  slug: string;
  base_url: string;
  status: string;
  owner_id: string;
  created_at: string;
  // Stats incluidas
  total_suites: number;
  total_cases: number;
  automation_percentage: number;
}
```

**POST /api/projects**
```typescript
// Request
{
  name: string;
  slug: string;
  base_url: string;
  description?: string;
  repository_url?: string;
  owner_id: string;
}

// Response: 201 Created
{
  id: string;
  ...
}
```

**PUT /api/projects/:id**
```typescript
// Request (partial update)
{
  name?: string;
  base_url?: string;
  status?: 'active' | 'inactive';
}

// Response: 200 OK
{
  id: string;
  ...
}
```

**DELETE /api/projects/:id**
```typescript
// Response: 204 No Content
```

---

#### **🧪 Test Suites**

**GET /api/test-suites?project_id=uuid**
```typescript
// Response
{
  data: TestSuite[];
}
```

**POST /api/test-suites**
```typescript
// Request
{
  project_id: string;
  name: string;
  suite_type: 'smoke' | 'regression' | 'integration' | 'e2e';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

// Response: 201 Created
```

---

#### **📝 Test Cases**

**GET /api/test-cases?suite_id=uuid**
```typescript
// Response
{
  data: TestCase[];
}
```

**POST /api/test-cases**
```typescript
// Request
{
  test_suite_id: string;
  test_id: string;  // Custom ID (ej: "TC-001")
  name: string;
  preconditions: string;
  test_steps: string;
  expected_result: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  is_automated: boolean;
  automation_framework?: 'playwright' | 'cypress' | 'selenium';
}

// Response: 201 Created
```

---

#### **🚀 Test Executions**

**GET /api/executions?project_id=uuid**
```typescript
// Query params
?limit=50
?offset=0
?status=pending|running|completed|failed

// Response
{
  data: TestExecution[];
  total: number;
}
```

**POST /api/executions/trigger**
```typescript
// Request
{
  project_id: string;
  suite_ids: string[];  // UUIDs de suites a ejecutar
  environment: 'development' | 'staging' | 'production';
  browser?: 'chromium' | 'firefox' | 'webkit';
}

// Response: 202 Accepted
{
  execution_id: string;
  status: 'pending';
  estimated_duration_ms: number;
}
```

**GET /api/executions/:id**
```typescript
// Response
{
  id: string;
  project_id: string;
  status: 'running' | 'completed' | 'failed';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  duration_ms: number;
  started_at: string;
  completed_at: string;
  allure_report_url: string;
  playwright_report_url: string;
}
```

**GET /api/executions/:id/results**
```typescript
// Response
{
  data: TestResult[];
}
```

---

#### **🐛 Defects**

**GET /api/defects?project_id=uuid**
```typescript
// Query params
?status=open|in_progress|resolved|closed
?severity=critical|high|medium|low
?assigned_to=user-uuid

// Response
{
  data: Defect[];
}
```

**POST /api/defects**
```typescript
// Request
{
  test_execution_id?: string;
  test_result_id?: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'p0' | 'p1' | 'p2' | 'p3' | 'p4';
  steps_to_reproduce: string;
  expected_behavior: string;
  actual_behavior: string;
  environment: string;
  browser?: string;
}

// Response: 201 Created
```

**POST /api/defects/:id/link-jira**
```typescript
// Request
{
  jira_project_key: string;  // ej: "HAIDA"
  issue_type: 'Bug' | 'Task';
}

// Response
{
  jira_issue_key: string;  // ej: "HAIDA-123"
  jira_url: string;
}
```

---

#### **💬 Chat IA**

**POST /api/chat/threads**
```typescript
// Request
{
  project_id?: string;
  title?: string;
  provider: 'copilot-studio' | 'openai' | 'anthropic';
}

// Response: 201 Created
{
  id: string;
  thread_id: string;  // External provider ID
}
```

**POST /api/chat/threads/:id/messages**
```typescript
// Request
{
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

// Response: 201 Created
{
  id: string;
  role: 'user';
  content: string;
  created_at: string;
}

// Response seguido (assistant message)
{
  id: string;
  role: 'assistant';
  content: string;
  created_at: string;
}
```

**GET /api/chat/threads/:id/messages**
```typescript
// Response
{
  data: ChatMessage[];
}
```

---

## **Telegram Bot API**

### **Configuración**

```typescript
// /src/services/telegram-api.ts
import { encryptionService } from './encryption-service';

export const telegramApi = {
  baseUrl: 'https://api.telegram.org',
  
  getBotToken: () => {
    const encrypted = localStorage.getItem('telegram_bot_token');
    if (!encrypted) throw new Error('Token not configured');
    return encryptionService.decrypt(encrypted);
  },
  
  sendMessage: async (chatId: string, text: string) => {
    const token = telegramApi.getBotToken();
    const url = `${telegramApi.baseUrl}/bot${token}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    });
    
    return response.data;
  },
  
  setWebhook: async (webhookUrl: string) => {
    const token = telegramApi.getBotToken();
    const url = `${telegramApi.baseUrl}/bot${token}/setWebhook`;
    
    await axios.post(url, { url: webhookUrl });
  },
};
```

### **Comandos del Bot (22)**

| Comando | Descripción |
|---------|-------------|
| `/start` | Bienvenida y QR de vinculación |
| `/help` | Lista de comandos |
| `/status` | Estado general de proyectos |
| `/projects` | Lista de proyectos activos |
| `/last_execution` | Última ejecución de tests |
| `/defects` | Defectos abiertos |
| `/report` | Reporte semanal |
| `/link` | Vincular cuenta |
| `/unlink` | Desvincular cuenta |
| `/settings` | Configuración de notificaciones |
| ... | (22 comandos totales) |

### **Notificaciones Automáticas**

```typescript
// Enviar notificación cuando un test falla
export async function notifyTestFailure(execution: TestExecution) {
  const config = await api.telegram.getConfig();
  
  if (!config.notifications_enabled) return;
  
  const message = `
🔴 *Test Failed*

Project: ${execution.project_name}
Tests: ${execution.failed_tests}/${execution.total_tests} failed
Duration: ${execution.duration_ms}ms

[View Details](${window.location.origin}/executions/${execution.id})
  `;
  
  await telegramApi.sendMessage(config.chat_id, message);
}
```

---

## **Jira Cloud API**

### **Authentication**

HAIDA usa **API Token** de Jira (no OAuth por simplicidad).

```typescript
// Configuración
const jiraConfig = {
  baseUrl: 'https://your-org.atlassian.net',
  email: 'your-email@company.com',
  apiToken: encryptionService.decrypt(stored_encrypted_token),
};

// Basic Auth header
const authHeader = `Basic ${btoa(`${jiraConfig.email}:${jiraConfig.apiToken}`)}`;
```

### **Endpoints Usados**

#### **Crear Issue**
```typescript
// POST /rest/api/3/issue
{
  fields: {
    project: { key: 'HAIDA' },
    summary: 'Test failed: Login validation',
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test case TC-045 failed...' }]
        }
      ]
    },
    issuetype: { name: 'Bug' },
    priority: { name: 'High' },
    labels: ['automated-test', 'haida'],
  }
}

// Response
{
  id: '10001',
  key: 'HAIDA-123',
  self: 'https://your-org.atlassian.net/rest/api/3/issue/10001'
}
```

#### **Buscar Issues**
```typescript
// GET /rest/api/3/search
?jql=project=HAIDA AND status=Open AND labels=haida
&fields=key,summary,status,priority,assignee
&maxResults=50

// Response
{
  issues: Array<{
    key: string;
    fields: {
      summary: string;
      status: { name: string };
      priority: { name: string };
      assignee: { displayName: string };
    }
  }>;
  total: number;
}
```

### **Service Implementation**

```typescript
// /src/services/jira-api.ts
export const jiraApi = {
  createIssue: async (defect: Defect) => {
    const response = await axios.post(
      `${jiraConfig.baseUrl}/rest/api/3/issue`,
      {
        fields: {
          project: { key: 'HAIDA' },
          summary: defect.title,
          description: formatDescription(defect),
          issuetype: { name: 'Bug' },
          priority: { name: mapPriorityToJira(defect.priority) },
          labels: ['haida', 'automated-test'],
        },
      },
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      key: response.data.key,
      url: `${jiraConfig.baseUrl}/browse/${response.data.key}`,
    };
  },
  
  searchIssues: async (jql: string) => {
    const response = await axios.get(
      `${jiraConfig.baseUrl}/rest/api/3/search`,
      {
        params: { jql, fields: 'key,summary,status,priority' },
        headers: { 'Authorization': authHeader },
      }
    );
    
    return response.data.issues;
  },
};

// Helper: Mapear prioridades
function mapPriorityToJira(priority: DefectPriority): string {
  const map = {
    'p0': 'Highest',
    'p1': 'High',
    'p2': 'Medium',
    'p3': 'Low',
    'p4': 'Lowest',
  };
  return map[priority] || 'Medium';
}
```

---

## **Confluence API**

### **Uso en HAIDA**
Confluence se usa para:
- **Buscar documentación** relacionada con tests
- **Generar reportes** en páginas de Confluence
- **Vincular test cases** con páginas de requisitos

### **Endpoints Usados**

#### **Buscar Contenido**
```typescript
// GET /wiki/rest/api/content/search
?cql=type=page AND space=HAIDA AND text~"test automation"
&limit=10

// Response
{
  results: Array<{
    id: string;
    title: string;
    _links: {
      webui: string;  // URL de la página
    }
  }>;
}
```

#### **Crear Página**
```typescript
// POST /wiki/rest/api/content
{
  type: 'page',
  title: 'Test Execution Report - 2025-01-20',
  space: { key: 'HAIDA' },
  body: {
    storage: {
      value: '<h1>Test Results</h1><p>...</p>',
      representation: 'storage'
    }
  },
  ancestors: [{ id: 'parent-page-id' }]
}

// Response
{
  id: string;
  title: string;
  _links: {
    webui: string;
  }
}
```

### **Service Implementation**

```typescript
// /src/services/confluence-api.ts
export const confluenceApi = {
  searchPages: async (query: string) => {
    const cql = `type=page AND space=HAIDA AND text~"${query}"`;
    
    const response = await axios.get(
      `${confluenceConfig.baseUrl}/wiki/rest/api/content/search`,
      {
        params: { cql, limit: 20 },
        headers: { 'Authorization': authHeader },
      }
    );
    
    return response.data.results;
  },
  
  createTestReport: async (execution: TestExecution) => {
    const html = generateReportHTML(execution);
    
    const response = await axios.post(
      `${confluenceConfig.baseUrl}/wiki/rest/api/content`,
      {
        type: 'page',
        title: `Test Report - ${execution.project_name} - ${new Date().toISOString()}`,
        space: { key: 'HAIDA' },
        body: {
          storage: {
            value: html,
            representation: 'storage',
          },
        },
      },
      {
        headers: { 'Authorization': authHeader },
      }
    );
    
    return response.data._links.webui;
  },
};
```

---

## **Copilot Studio / OpenAI**

### **Microsoft Copilot Studio**

```typescript
// /src/services/chat-api.ts
export const chatApi = {
  sendMessage: async (threadId: string, content: string) => {
    const response = await axios.post(
      import.meta.env.VITE_COPILOT_STUDIO_ENDPOINT,
      {
        thread_id: threadId,
        message: content,
        user_id: currentUser.id,
        context: {
          project_id: currentProject?.id,
          tenant_id: currentTenant.id,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${copilotToken}`,
        },
      }
    );
    
    return response.data;
  },
};
```

### **OpenAI (alternativa)**

```typescript
// OpenAI API
const openaiApi = {
  createChatCompletion: async (messages: ChatMessage[]) => {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.choices[0].message.content;
  },
};
```

---

## **Webhooks**

### **Incoming Webhooks (Change Detection)**

HAIDA recibe webhooks de sistemas de deployment para ejecutar tests automáticamente.

#### **Endpoint**
```http
POST /api/webhooks/change-detection
Content-Type: application/json
X-Webhook-Secret: <secret-token>
```

#### **Payload**
```json
{
  "project_slug": "ecommerce",
  "url": "https://shop.example.com",
  "tag": "v1.2.3",
  "change_type": "deployment",
  "environment": "staging",
  "commit_sha": "abc123def",
  "deployed_by": "carlos@company.com",
  "metadata": {
    "git_branch": "main",
    "ci_job_id": "12345"
  }
}
```

#### **Response**
```json
{
  "change_detection_id": "cd-uuid",
  "status": "pending",
  "test_suites_selected": ["smoke", "regression"],
  "estimated_execution_time_ms": 120000
}
```

### **Configurar Webhook en CI/CD**

#### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
- name: Notify HAIDA
  run: |
    curl -X POST https://api.haida.example.com/webhooks/change-detection \
      -H "Content-Type: application/json" \
      -H "X-Webhook-Secret: ${{ secrets.HAIDA_WEBHOOK_SECRET }}" \
      -d '{
        "project_slug": "ecommerce",
        "url": "https://shop.example.com",
        "tag": "${{ github.ref_name }}",
        "change_type": "deployment",
        "environment": "staging"
      }'
```

#### **GitLab CI**
```yaml
# .gitlab-ci.yml
notify_haida:
  stage: deploy
  script:
    - |
      curl -X POST https://api.haida.example.com/webhooks/change-detection \
        -H "Content-Type: application/json" \
        -H "X-Webhook-Secret: $HAIDA_WEBHOOK_SECRET" \
        -d "{
          \"project_slug\": \"ecommerce\",
          \"url\": \"https://shop.example.com\",
          \"tag\": \"$CI_COMMIT_TAG\",
          \"change_type\": \"deployment\"
        }"
```

---

## **Rate Limiting**

### **Límites por Endpoint**

| Endpoint | Límite/min | Límite/hora | Código Error |
|----------|------------|-------------|--------------|
| `/api/auth/login` | 5 | 20 | 429 |
| `/api/*` (global) | 100 | 3000 | 429 |
| `/api/chat/*` | 20 | 200 | 429 |
| `/api/executions/trigger` | 10 | 100 | 429 |

### **Headers de Rate Limit**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705750800
```

### **Manejo en Frontend**

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const waitSeconds = resetTime 
        ? Math.ceil((resetTime * 1000 - Date.now()) / 1000)
        : 60;
      
      toast.error(
        `Rate limit excedido. Intenta de nuevo en ${waitSeconds} segundos.`,
        { duration: waitSeconds * 1000 }
      );
    }
    
    return Promise.reject(error);
  }
);
```

---

## **Error Handling**

### **Códigos de Error Estándar**

| Código | Significado | Acción Frontend |
|--------|-------------|-----------------|
| 200 | OK | Mostrar datos |
| 201 | Created | Toast success + refetch |
| 204 | No Content | Toast success |
| 400 | Bad Request | Mostrar error de validación |
| 401 | Unauthorized | Redirect a /login |
| 403 | Forbidden | Mostrar "Sin permisos" |
| 404 | Not Found | Mostrar "No encontrado" |
| 429 | Too Many Requests | Esperar y reintentar |
| 500 | Internal Server Error | Toast error genérico |
| 503 | Service Unavailable | Activar Mock Backend |

### **Response Error Structure**

```typescript
// Error response estándar
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid project slug',
    details: {
      field: 'slug',
      reason: 'already_exists'
    }
  }
}
```

---

## **Postman Collection**

### **Importar Collection**

```bash
# Descargar collection
curl https://api.haida.example.com/postman/collection.json > haida.postman_collection.json

# Importar en Postman
# File → Import → haida.postman_collection.json
```

### **Variables de Entorno**

```json
{
  "base_url": "https://api.haida.example.com",
  "jwt_token": "{{auth_token}}",
  "tenant_id": "{{tenant_id}}",
  "project_id": "{{current_project_id}}"
}
```

### **Ejemplos de Requests**

```http
### 1. Login
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@haida.com",
  "provider": "microsoft"
}

### 2. Get Projects
GET {{base_url}}/projects
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}

### 3. Trigger Tests
POST {{base_url}}/executions/trigger
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "project_id": "{{project_id}}",
  "suite_ids": ["suite-1-uuid", "suite-2-uuid"],
  "environment": "staging"
}
```

---

## **Mock Responses**

Para desarrollo sin backend:

```typescript
// /src/services/mock-backend.ts
export const mockBackend = {
  projects: {
    getAll: () => Promise.resolve([
      {
        id: 'proj-1',
        name: 'E-Commerce Platform',
        slug: 'ecommerce',
        base_url: 'https://shop.example.com',
        status: 'active',
        total_suites: 5,
        total_cases: 67,
        automation_percentage: 82,
      },
    ]),
  },
  
  executions: {
    trigger: (data) => Promise.resolve({
      id: 'exec-mock-' + Date.now(),
      status: 'pending',
      estimated_duration_ms: 120000,
    }),
  },
};
```

---

**Anterior**: [← 03 - Guías de Desarrollo](../03-GUIAS-DESARROLLO/README.md)  
**Siguiente**: [05 - Base de Datos →](../05-BASE-DATOS/README.md)

---

**Última actualización**: 2025-01-20  
**Versión HAIDA**: 1.0.0
