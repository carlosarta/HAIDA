# 🛡️ HAIDA - Arquitectura de Seguridad

**Fecha**: 2025-01-20  
**Versión**: 1.0.0  
**Estado**: Implementado  

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Modelo de Amenazas](#modelo-de-amenazas)
3. [Capas de Seguridad](#capas-de-seguridad)
4. [Implementaciones Específicas](#implementaciones-específicas)
5. [Guía de Uso](#guía-de-uso)
6. [Auditoría y Monitoreo](#auditoría-y-monitoreo)

---

## 1️⃣ Resumen Ejecutivo

HAIDA implementa un **modelo de seguridad de defensa en profundidad** con múltiples capas:

| Capa | Tecnología | Estado |
|------|-----------|--------|
| **Encriptación de Datos** | AES-256-GCM + Web Crypto API | ✅ Implementado |
| **Protección CSRF** | Tokens únicos por request | ✅ Implementado |
| **Rate Limiting** | Axios Interceptor + Counter | ✅ Implementado |
| **Sanitización XSS** | DOMPurify + React Highlighter | ✅ Implementado |
| **Error Handling** | React ErrorBoundary | ✅ Implementado |
| **RLS (Row Level Security)** | Supabase Policies | ✅ Implementado |

---

## 2️⃣ Modelo de Amenazas

### **Amenazas Identificadas y Mitigadas**

#### **A. Inyección de Código (XSS)**

**Riesgo**: Alto  
**Impacto**: Robo de credenciales, sesiones hijacking  

**Solución Implementada**:
```typescript
// ❌ ANTES (Vulnerable)
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ DESPUÉS (Seguro)
import Highlighter from 'react-highlight-words';
<Highlighter
  searchWords={[searchTerm]}
  textToHighlight={sanitize(userInput)}
/>
```

**Archivos Afectados**:
- `/src/app/pages/Designer.tsx`
- `/src/lib/security-utils.ts`

---

#### **B. Cross-Site Request Forgery (CSRF)**

**Riesgo**: Medio  
**Impacto**: Acciones no autorizadas en nombre del usuario  

**Solución Implementada**:
```typescript
// Generación automática de tokens CSRF
const csrfToken = generateCSRFToken();
localStorage.setItem('csrf-token', csrfToken);

// Inyección automática en headers
axios.interceptors.request.use((config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method!)) {
    config.headers['X-CSRF-Token'] = getCSRFToken();
  }
  return config;
});
```

**Archivos Implementados**:
- `/src/services/api.ts`
- `/src/lib/security-utils.ts`

---

#### **C. Exposición de Credenciales**

**Riesgo**: Crítico  
**Impacto**: Acceso no autorizado a APIs externas  

**Solución Implementada**:

```typescript
// Servicio de encriptación AES-256-GCM
import { encryptionService } from '@/services/encryption-service';

// Encriptar
const encrypted = await encryptionService.encrypt('mi-secreto');

// Desencriptar
const decrypted = await encryptionService.decrypt(encrypted);
```

**Características**:
- ✅ AES-256-GCM (autenticado)
- ✅ IV único por encriptación
- ✅ Web Crypto API (nativo del navegador)
- ✅ Derivación de claves con PBKDF2

**Archivos Implementados**:
- `/src/services/encryption-service.ts`
- `/src/services/telegram-api.ts`
- `/src/services/jira-api.ts`
- `/src/services/confluence-api.ts`

---

#### **D. ReDoS (Regular Expression Denial of Service)**

**Riesgo**: Medio  
**Impacto**: Bloqueo del navegador con regex maliciosas  

**Solución Implementada**:

```typescript
// Escape de caracteres especiales en regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Uso seguro
const safePattern = escapeRegExp(userInput);
const regex = new RegExp(safePattern, 'gi');
```

**Archivos Implementados**:
- `/src/lib/security-utils.ts`

---

#### **E. Rate Limiting & DDoS**

**Riesgo**: Alto  
**Impacto**: Sobrecarga del servidor, brute force attacks  

**Solución Implementada**:

```typescript
// Rate limiting global (100 requests/min)
import rateLimit from 'axios-rate-limit';
const apiClient = rateLimit(axios.create(), {
  maxRequests: 100,
  perMilliseconds: 60000,
});

// Rate limiting específico (Login: 5 intentos/min)
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000; // 1 minuto
```

**Archivos Implementados**:
- `/src/services/api.ts`
- `/src/app/pages/Login.tsx`

---

#### **F. Error Information Disclosure**

**Riesgo**: Medio  
**Impacto**: Exposición de stack traces y estructura interna  

**Solución Implementada**:

```typescript
// ErrorBoundary global
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Manejo seguro de errores
if (error.isProduction) {
  logError(error); // Enviar a sistema de logging
  return <GenericErrorUI />; // Mostrar mensaje genérico
}
```

**Archivos Implementados**:
- `/src/app/components/ErrorBoundary.tsx`
- `/src/app/App.tsx`

---

## 3️⃣ Capas de Seguridad

### **Capa 1: Frontend (Navegador)**

```
┌─────────────────────────────────────┐
│  React Application                  │
│  ├─ ErrorBoundary                   │
│  ├─ XSS Protection (DOMPurify)      │
│  └─ CSP Headers                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  API Client (Axios)                 │
│  ├─ CSRF Tokens                     │
│  ├─ Rate Limiting                   │
│  └─ Request Sanitization            │
└─────────────────────────────────────┘
```

### **Capa 2: Transporte**

```
┌─────────────────────────────────────┐
│  HTTPS/TLS 1.3                      │
│  ├─ Certificate Pinning             │
│  └─ Encrypted Payloads              │
└─────────────────────────────────────┘
```

### **Capa 3: Backend (Supabase)**

```
┌─────────────────────────────────────┐
│  Supabase Auth                      │
│  ├─ JWT Tokens                      │
│  ├─ Row Level Security (RLS)        │
│  └─ MFA Support                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│  ├─ Encrypted at Rest               │
│  ├─ RLS Policies                    │
│  └─ Audit Logs                      │
└─────────────────────────────────────┘
```

---

## 4️⃣ Implementaciones Específicas

### **A. Servicio de Encriptación**

**Ubicación**: `/src/services/encryption-service.ts`

#### **Uso Básico**

```typescript
import { encryptionService } from '@/services/encryption-service';

// 1. Encriptar API Keys
const jiraToken = await encryptionService.encrypt('my-jira-token');
localStorage.setItem('jira_token_enc', jiraToken);

// 2. Desencriptar cuando se necesita
const decrypted = await encryptionService.decrypt(jiraToken);
apiClient.defaults.headers.common['Authorization'] = `Bearer ${decrypted}`;

// 3. Limpiar de memoria (importante!)
decrypted = null;
```

#### **Características Técnicas**

| Parámetro | Valor |
|-----------|-------|
| Algoritmo | AES-256-GCM |
| Modo | Galois/Counter Mode (autenticado) |
| IV Length | 12 bytes (único por operación) |
| Key Derivation | PBKDF2 (100,000 iteraciones) |
| Salt | Único por encriptación |

---

### **B. Protección CSRF**

**Ubicación**: `/src/services/api.ts`, `/src/lib/security-utils.ts`

#### **Flujo de Trabajo**

```
1. Usuario carga la aplicación
   ↓
2. generateCSRFToken() → UUID v4
   ↓
3. Token guardado en localStorage
   ↓
4. Axios Interceptor inyecta token en headers
   ↓
5. Backend valida token (Supabase)
```

#### **Implementación Manual (si necesario)**

```typescript
import { generateCSRFToken, getCSRFToken } from '@/lib/security-utils';

// Generar y guardar (una sola vez al login)
const token = generateCSRFToken();
localStorage.setItem('csrf-token', token);

// Uso en requests manuales
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCSRFToken(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

### **C. Rate Limiting**

**Ubicación**: `/src/services/api.ts`, `/src/app/pages/Login.tsx`

#### **Configuración por Endpoint**

| Endpoint/Acción | Límite | Ventana | Lockout |
|----------------|--------|---------|---------|
| API Global | 100 req | 1 min | No |
| Login | 5 intentos | 1 min | 1 min |
| Password Reset | 3 intentos | 5 min | 5 min |
| API Keys Storage | 10 req | 1 min | No |

#### **Implementación Custom**

```typescript
// Rate limiter manual
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  check(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar intentos dentro de la ventana
    const recentAttempts = attempts.filter(t => now - t < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limit excedido
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}
```

---

### **D. Sanitización de Inputs**

**Ubicación**: `/src/lib/security-utils.ts`

#### **API Disponible**

```typescript
import { sanitize, escapeRegExp, validateEmail } from '@/lib/security-utils';

// 1. Sanitizar HTML (prevenir XSS)
const clean = sanitize('<script>alert("xss")</script>');
// Output: '' (script removido)

// 2. Escape de regex (prevenir ReDoS)
const safe = escapeRegExp('user.*input');
// Output: 'user\\.\\*input'

// 3. Validación de email
const isValid = validateEmail('test@example.com');
// Output: true
```

#### **Configuración DOMPurify**

```typescript
// Permitir solo tags seguros
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br'],
  ALLOWED_ATTR: ['class', 'style'],
  ALLOW_DATA_ATTR: false,
};

const clean = DOMPurify.sanitize(dirty, config);
```

---

## 5️⃣ Guía de Uso

### **Para Desarrolladores**

#### **✅ Buenas Prácticas**

1. **Siempre encriptar credenciales antes de guardar**
   ```typescript
   // ✅ CORRECTO
   const encrypted = await encryptionService.encrypt(apiKey);
   localStorage.setItem('api_key', encrypted);
   
   // ❌ INCORRECTO
   localStorage.setItem('api_key', apiKey); // Plain text!
   ```

2. **Sanitizar inputs del usuario antes de renderizar**
   ```typescript
   // ✅ CORRECTO
   <div>{sanitize(userInput)}</div>
   
   // ❌ INCORRECTO
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   ```

3. **Validar y escapar regex patterns**
   ```typescript
   // ✅ CORRECTO
   const pattern = escapeRegExp(userInput);
   const regex = new RegExp(pattern, 'gi');
   
   // ❌ INCORRECTO
   const regex = new RegExp(userInput, 'gi'); // ReDoS vulnerable!
   ```

4. **Usar ErrorBoundary para componentes críticos**
   ```typescript
   // ✅ CORRECTO
   <ErrorBoundary fallback={<ErrorUI />}>
     <CriticalComponent />
   </ErrorBoundary>
   ```

---

### **Para QA/Testers**

#### **Test de Seguridad Recomendados**

1. **XSS Testing**
   ```javascript
   // Payloads de prueba
   const xssPayloads = [
     '<script>alert("XSS")</script>',
     '<img src=x onerror=alert("XSS")>',
     '"><script>alert(String.fromCharCode(88,83,83))</script>',
   ];
   
   xssPayloads.forEach(payload => {
     // Verificar que se sanitice correctamente
     expect(sanitize(payload)).not.toContain('<script>');
   });
   ```

2. **CSRF Testing**
   ```javascript
   // Verificar que requests sin token fallen
   const response = await fetch('/api/data', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(data),
     // Sin X-CSRF-Token header
   });
   
   expect(response.status).toBe(403); // Forbidden
   ```

3. **Rate Limiting Testing**
   ```javascript
   // Verificar límite de login
   for (let i = 0; i < 6; i++) {
     await login('user', 'wrong-password');
   }
   
   // El 6º intento debe fallar
   const result = await login('user', 'correct-password');
   expect(result.error).toContain('Too many attempts');
   ```

---

## 6️⃣ Auditoría y Monitoreo

### **Logs de Seguridad**

#### **Eventos que se Loguean**

| Evento | Nivel | Destino |
|--------|-------|---------|
| Login fallido | WARNING | Console + Backend |
| Rate limit excedido | WARNING | Console + Backend |
| Token CSRF inválido | ERROR | Backend |
| Encriptación fallida | ERROR | Console |
| XSS attempt detectado | CRITICAL | Backend + Alert |

#### **Implementación de Logging**

```typescript
// En production, enviar a servicio externo
if (import.meta.env.PROD) {
  console.error = (error) => {
    // Enviar a Sentry, LogRocket, etc.
    sentryClient.captureException(error);
  };
}
```

---

### **Métricas de Seguridad**

#### **KPIs Recomendados**

1. **Tasa de Bloqueo por Rate Limiting**
   - Target: < 1% de requests totales
   - Alert: > 5%

2. **Intentos de XSS Detectados**
   - Target: 0 por día
   - Alert: > 1 por día

3. **Tokens CSRF Inválidos**
   - Target: < 0.1% de requests
   - Alert: > 1%

4. **Errores de Desencriptación**
   - Target: 0
   - Alert: > 0

---

### **Auditoría Periódica**

#### **Checklist Trimestral**

- [ ] Revisar dependencias con `npm audit`
- [ ] Actualizar DOMPurify a última versión
- [ ] Rotar master encryption key
- [ ] Revisar políticas RLS en Supabase
- [ ] Probar payloads XSS nuevos (OWASP Top 10)
- [ ] Verificar que CSP headers estén activos
- [ ] Revisar logs de seguridad de últimos 90 días

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**Última actualización**: 2025-01-20  
**Revisado por**: HAIDA Security Team  
**Próxima revisión**: 2025-04-20
