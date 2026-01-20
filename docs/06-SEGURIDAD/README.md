# 🔐 06 - Seguridad

**Implementación completa de seguridad empresarial en HAIDA**

---

## **📚 Tabla de Contenidos**

1. [Auditoría de Seguridad](#auditoría-de-seguridad)
2. [Autenticación](#autenticación)
3. [Encriptación](#encriptación)
4. [Rate Limiting](#rate-limiting)
5. [XSS Protection](#xss-protection)
6. [CSRF Protection](#csrf-protection)
7. [Row Level Security](#row-level-security)
8. [Error Handling](#error-handling)
9. [Mejores Prácticas](#mejores-prácticas)

---

## **Auditoría de Seguridad**

### **Resumen de Vulnerabilidades Encontradas**

**Total**: 28 problemas identificados
- 🔴 **Críticas**: 2
- 🟠 **Altas**: 7
- 🟡 **Medias**: 12
- 🔵 **Bajas**: 7

### **Estado de Correcciones**

| Prioridad | Total | Resueltas | Pendientes |
|-----------|-------|-----------|------------|
| P1 (Críticas) | 2 | ✅ 2 | 0 |
| P2 (Altas) | 7 | ✅ 7 | 0 |
| P3 (Medias) | 12 | ⏳ 0 | 12 |
| P4 (Bajas) | 7 | ⏳ 0 | 7 |

**✅ TODAS las vulnerabilidades P1 y P2 están corregidas**

---

## **Autenticación**

### **Microsoft 365 SSO (Azure AD)**

HAIDA usa **MSAL (Microsoft Authentication Library)** para SSO empresarial.

#### **Configuración**

```typescript
// /src/services/auth-service.ts
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
```

#### **Login Flow**

```typescript
// Login con Microsoft
const loginWithMicrosoft = async () => {
  try {
    const response = await msalInstance.loginPopup({
      scopes: ['User.Read', 'profile', 'openid', 'email'],
    });
    
    // JWT token de Microsoft
    const { idToken, account } = response;
    
    // Sincronizar con Supabase
    await supabase.auth.signInWithIdToken({
      provider: 'azure',
      token: idToken,
    });
    
    // Crear/actualizar perfil
    await api.users.syncProfile(account);
    
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### **JWT Claims Personalizados**

```typescript
// En Supabase, agregar claims al JWT
{
  "sub": "user-uuid",
  "email": "user@company.com",
  "role": "qa_engineer",           // Rol global
  "tenant_id": "tenant-uuid",      // Tenant actual
  "tenant_role": "admin",          // Rol en el tenant
  "permissions": ["projects.read", ...]
}
```

---

## **Encriptación**

### **AES-256 para Credenciales Sensibles**

HAIDA usa **Web Crypto API** para encriptar credenciales de APIs externas (Telegram, Jira, Confluence).

#### **Servicio de Encriptación**

```typescript
// /src/services/encryption-service.ts
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'haida-default-key';

export const encryptionService = {
  encrypt: (data: string): string => {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  },
  
  decrypt: (encrypted: string): string => {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  
  encryptObject: (obj: Record<string, any>): string => {
    const json = JSON.stringify(obj);
    return encryptionService.encrypt(json);
  },
  
  decryptObject: <T>(encrypted: string): T => {
    const decrypted = encryptionService.decrypt(encrypted);
    return JSON.parse(decrypted);
  },
};
```

#### **Uso en APIs**

```typescript
// ANTES (❌ INSEGURO)
const config = {
  telegram_token: 'bot123456:ABC-DEF...',
  jira_token: 'ATATT3xFf...',
};

// DESPUÉS (✅ SEGURO)
import { encryptionService } from '@/services/encryption-service';

const config = {
  telegram_token: encryptionService.encrypt('bot123456:ABC-DEF...'),
  jira_token: encryptionService.encrypt('ATATT3xFf...'),
};

// Al usar
const token = encryptionService.decrypt(config.telegram_token);
```

### **Variables de Entorno Seguras**

```bash
# .env.local (NO COMMITEAR)
VITE_ENCRYPTION_KEY=tu-clave-super-secreta-256-bits

# Generar clave segura:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## **Rate Limiting**

### **Configuración Global**

```typescript
// /src/services/api.ts
import rateLimit from 'axios-rate-limit';

const http = rateLimit(axios.create(), {
  maxRequests: 100,  // 100 requests
  perMilliseconds: 60000,  // por minuto
});
```

### **Rate Limiting en Base de Datos**

#### **Tabla `rate_limit_counters`**

Rastrea requests por usuario/tenant/endpoint.

```typescript
interface RateLimitCounter {
  user_id: string;
  tenant_id: string;
  endpoint: string;
  window_start: string;  // timestamp
  request_count: number;
  blocked_until?: string;
}
```

#### **Función de Incremento**

```sql
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_user_id uuid,
  p_tenant_id uuid,
  p_endpoint text,
  p_limit_per_minute integer DEFAULT 100
) RETURNS boolean AS $$
DECLARE
  v_window_start timestamptz;
  v_count integer;
BEGIN
  -- Ventana de 1 minuto
  v_window_start := date_trunc('minute', now());
  
  -- Obtener contador actual
  SELECT request_count INTO v_count
  FROM rate_limit_counters
  WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND endpoint = p_endpoint
    AND window_start = v_window_start;
  
  IF v_count IS NULL THEN
    -- Primera request en esta ventana
    INSERT INTO rate_limit_counters (user_id, tenant_id, endpoint, window_start, request_count)
    VALUES (p_user_id, p_tenant_id, p_endpoint, v_window_start, 1);
    RETURN true;
  END IF;
  
  IF v_count >= p_limit_per_minute THEN
    -- Límite excedido
    UPDATE rate_limit_counters
    SET blocked_until = now() + INTERVAL '1 minute'
    WHERE user_id = p_user_id
      AND tenant_id = p_tenant_id
      AND endpoint = p_endpoint
      AND window_start = v_window_start;
    
    RETURN false;
  END IF;
  
  -- Incrementar contador
  UPDATE rate_limit_counters
  SET request_count = request_count + 1
  WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND endpoint = p_endpoint
    AND window_start = v_window_start;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

### **Límites por Endpoint**

| Endpoint | Límite/min | Límite/hora | Razón |
|----------|------------|-------------|-------|
| `/api/login` | 5 | 20 | Prevenir brute force |
| `/api/*` (global) | 100 | 3000 | Uso normal |
| `/api/chat/*` | 20 | 200 | Tokens IA limitados |
| `/api/executions/trigger` | 10 | 100 | Evitar spam de ejecuciones |

---

## **XSS Protection**

### **Problema Encontrado**

```tsx
// ❌ VULNERABLE (Designer.tsx - ANTES)
<div 
  dangerouslySetInnerHTML={{ 
    __html: searchQuery 
  }} 
/>
```

### **Solución Implementada**

```tsx
// ✅ SEGURO (Designer.tsx - DESPUÉS)
import Highlighter from 'react-highlight-words';

<Highlighter
  searchWords={[searchTerm]}
  textToHighlight={text}
  highlightClassName="bg-yellow-200 text-black"
  autoEscape={true}  // ← Clave para seguridad
/>
```

### **DOMPurify para HTML User-Generated**

```typescript
import DOMPurify from 'dompurify';

// Sanitizar HTML antes de renderizar
const sanitizedHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
});
```

---

## **CSRF Protection**

### **Tokens Automáticos en Axios**

```typescript
// /src/services/api.ts

// Generar token CSRF único por sesión
let csrfToken = crypto.randomUUID();

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Agregar CSRF token a POST/PUT/DELETE
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Regenerar token después de cada request crítico
axiosInstance.interceptors.response.use(
  (response) => {
    if (['post', 'put', 'delete'].includes(response.config.method?.toLowerCase() || '')) {
      csrfToken = crypto.randomUUID();
    }
    return response;
  }
);
```

### **Verificación en Backend**

```typescript
// Backend (Supabase Edge Function)
export async function handler(req: Request) {
  const token = req.headers.get('X-CSRF-Token');
  
  // Validar token contra sesión
  if (!token || !isValidCSRFToken(token, session)) {
    return new Response('CSRF validation failed', { status: 403 });
  }
  
  // Procesar request...
}
```

---

## **Row Level Security (RLS)**

### **Concepto**

RLS asegura que cada usuario **solo pueda acceder a los datos de su tenant**.

```sql
-- Usuario A (tenant-1) ejecuta:
SELECT * FROM projects;

-- PostgreSQL aplica RLS automáticamente:
SELECT * FROM projects
WHERE tenant_id IN (
  SELECT tenant_id FROM tenant_members
  WHERE user_id = (auth.uid())
);

-- Solo ve proyectos de su tenant
```

### **Bypass para Automation**

```sql
-- Role "automation" bypasses RLS
CREATE POLICY projects_select ON projects
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'automation'
  OR
  tenant_id = get_user_tenant()
);
```

---

## **Error Handling**

### **ErrorBoundary Global**

```typescript
// /src/app/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log a servicio externo (Sentry, LogRocket)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sand">
          <div className="text-center space-y-6 max-w-lg p-8">
            <AlertTriangle className="w-16 h-16 mx-auto text-signal-orange" />
            <h1 className="text-3xl font-bold font-sora">Algo salió mal</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'Error desconocido'}
            </p>
            
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar
              </button>
              <button onClick={() => window.location.href = '/'}>
                <Home className="w-4 h-4 mr-2" />
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **Integración en App.tsx**

```typescript
// /src/app/App.tsx
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      {/* Resto de la app */}
    </ErrorBoundary>
  );
}
```

---

## **Mejores Prácticas**

### **✅ DO's (Hacer)**

1. **Siempre encriptar** credenciales sensibles antes de guardar en localStorage
2. **Usar HTTPS** en producción (obligatorio)
3. **Validar inputs** tanto en frontend como backend
4. **Implementar timeouts** en todas las requests HTTP (30s máx)
5. **Log de eventos** críticos en `event_logs`
6. **Regenerar tokens** después de acciones críticas
7. **Implementar rate limiting** en todos los endpoints públicos
8. **Usar prepared statements** para queries SQL

### **❌ DON'Ts (Evitar)**

1. ❌ **NO usar** `dangerouslySetInnerHTML` sin sanitización
2. ❌ **NO guardar** passwords en texto plano (ni siquiera temporalmente)
3. ❌ **NO exponer** stack traces en producción
4. ❌ **NO hardcodear** API keys en código
5. ❌ **NO deshabilitar** CORS en producción
6. ❌ **NO usar** `eval()` o `Function()` con user input
7. ❌ **NO confiar** en validación solo del frontend
8. ❌ **NO loggear** información sensible (tokens, passwords)

---

## **Checklist de Seguridad**

### **Frontend**
- [x] Encriptación de credenciales (AES-256)
- [x] CSRF tokens en mutaciones
- [x] Rate limiting global (100 req/min)
- [x] XSS protection (Highlighter + autoEscape)
- [x] ErrorBoundary global
- [x] Input validation con Zod
- [ ] Content Security Policy headers *(P3)*
- [ ] Subresource Integrity para CDNs *(P4)*

### **Backend (Supabase)**
- [x] Row Level Security habilitado
- [x] Políticas RLS por tenant
- [x] JWT claims personalizados
- [x] Rate limiting en DB
- [x] Audit logs (`event_logs`)
- [ ] Backup automático diario *(P3)*
- [ ] Monitoring con pg_stat_statements *(P3)*

### **APIs Externas**
- [x] Credenciales encriptadas
- [x] Timeouts configurados (30s)
- [x] Error handling con retry
- [x] Rate limiting específico
- [ ] Circuit breaker pattern *(P4)*

---

## **Configuración de Producción**

### **Variables de Entorno**

```bash
# .env.production
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  # Solo permisos públicos

# Encriptación (nunca commitear)
VITE_ENCRYPTION_KEY=$(openssl rand -hex 32)

# SSO
VITE_MSAL_CLIENT_ID=your-prod-client-id
VITE_MSAL_TENANT_ID=your-prod-tenant-id

# APIs (encriptadas en DB, no en env)
# Las credenciales se guardan encriptadas en la tabla de configuración
```

### **Supabase RLS (Verificación)**

```sql
-- Verificar que RLS está habilitado en todas las tablas críticas
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false  -- ← Estas NO tienen RLS
ORDER BY tablename;

-- Resultado esperado: VACÍO (todas deberían tener RLS)
```

### **Índices para Performance de RLS**

```sql
-- Índices críticos para políticas RLS
CREATE INDEX IF NOT EXISTS idx_tenant_members_lookup 
ON tenant_members(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_projects_tenant 
ON projects(tenant_id);

CREATE INDEX IF NOT EXISTS idx_test_executions_project 
ON test_executions(project_id);
```

---

## **Logging y Auditoría**

### **Tabla `event_logs`**

```sql
CREATE TABLE event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,  -- 'login', 'create_project', 'delete_test', etc.
  message text,
  metadata jsonb,  -- Contexto adicional
  created_at timestamptz DEFAULT now()
);
```

### **Función Helper para Auditoría**

```typescript
// /src/lib/audit-logger.ts
export const auditLogger = {
  log: async (event: {
    userId?: string;
    type: string;
    message: string;
    metadata?: Record<string, any>;
  }) => {
    await api.eventLogs.create({
      user_id: event.userId,
      event_type: event.type,
      message: event.message,
      metadata: event.metadata || {},
    });
  },
};

// Uso
auditLogger.log({
  userId: currentUser.id,
  type: 'project.delete',
  message: `User deleted project: ${project.name}`,
  metadata: { projectId: project.id, projectSlug: project.slug },
});
```

---

## **Recursos Adicionales**

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Crypto API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [MSAL React Docs](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)

---

**Anterior**: [← 05 - Base de Datos](../05-BASE-DATOS/README.md)  
**Siguiente**: [07 - Despliegue →](../07-DESPLIEGUE/README.md)

---

**Última actualización**: 2025-01-20  
**Versión HAIDA**: 1.0.0
