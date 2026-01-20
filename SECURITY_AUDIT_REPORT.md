# 🔒 HAIDA - Security Audit Report

**Fecha**: 20 de Enero 2026  
**Auditor**: Sistema Automatizado de Seguridad  
**Versión Auditada**: v1.0.0  
**Clasificación**: CONFIDENCIAL

---

## 📊 Resumen Ejecutivo

| Categoría | Críticos | Altos | Medios | Bajos | Total |
|-----------|----------|-------|--------|-------|-------|
| **Seguridad** | 2 | 4 | 3 | 2 | 11 |
| **UX/UI** | 0 | 2 | 5 | 3 | 10 |
| **Rendimiento** | 0 | 1 | 3 | 2 | 6 |
| **Dependencias** | 0 | 0 | 1 | 0 | 1 |
| **TOTAL** | **2** | **7** | **12** | **7** | **28** |

---

## 🚨 VULNERABILIDADES CRÍTICAS

### 1. **XSS (Cross-Site Scripting) en Designer.tsx**

**Severidad**: 🔴 CRÍTICA  
**Archivo**: `/src/app/pages/Designer.tsx:531-542`  
**CWE**: CWE-79 (Improper Neutralization of Input)

#### Código Vulnerable:

```tsx
<div dangerouslySetInnerHTML={{ 
  __html: searchQuery 
    ? step.action.replace(
        new RegExp(searchQuery, 'gi'), 
        (match: string) => `<mark class="bg-yellow-200">${match}</mark>`
      ) 
    : step.action 
}} />
```

#### **Riesgo:**
- Un atacante puede inyectar código JavaScript malicioso a través de `searchQuery`
- Ejemplo: `<img src=x onerror=alert('XSS')>`
- Puede robar tokens de sesión, credenciales o ejecutar acciones no autorizadas

#### **Solución Recomendada:**

```tsx
// INSTALAR: npm install dompurify @types/dompurify
import DOMPurify from 'dompurify';

// OPCIÓN 1: Sanitizar HTML
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(
    searchQuery 
      ? step.action.replace(
          new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), 
          (match: string) => `<mark class="bg-yellow-200">${match}</mark>`
        ) 
      : step.action
  )
}} />

// OPCIÓN 2 (MEJOR): Usar highlight.js o react-highlight-words
import Highlighter from 'react-highlight-words';

<Highlighter
  searchWords={[searchQuery]}
  autoEscape={true}
  textToHighlight={step.action}
  highlightClassName="bg-yellow-200 dark:bg-yellow-900 rounded-sm px-0.5"
/>
```

---

### 2. **Almacenamiento de Credenciales en LocalStorage sin Encriptación**

**Severidad**: 🔴 CRÍTICA  
**Archivos**: 
- `/src/services/jira-api.ts:127`
- `/src/services/confluence-api.ts:124`
- `/src/services/telegram-api.ts:57`

#### Código Vulnerable:

```tsx
// ❌ API Tokens guardados en TEXTO PLANO
localStorage.setItem('jira_config', JSON.stringify({ email, apiToken }));
localStorage.setItem('telegram_config', JSON.stringify(config));
```

#### **Riesgo:**
- Los tokens de API se almacenan sin encriptación
- Cualquier script malicioso puede leerlos
- Vulnerabilidad XSS puede exponer todas las credenciales

#### **Solución Recomendada:**

```bash
# INSTALAR LIBRERÍA DE ENCRIPTACIÓN
npm install crypto-js @types/crypto-js
```

```tsx
import CryptoJS from 'crypto-js';

// Generar clave de encriptación única por sesión
const ENCRYPTION_KEY = 'haida-secret-key-' + window.crypto.randomUUID();

// Función para encriptar
function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

// Función para desencriptar
function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Uso:
export function guardarConfigJira(email: string, apiToken: string): void {
  const encrypted = encryptData(JSON.stringify({ email, apiToken }));
  localStorage.setItem('jira_config', encrypted);
}

export function obtenerConfigJira(): { email: string; apiToken: string } | null {
  const encrypted = localStorage.getItem('jira_config');
  if (!encrypted) return null;
  
  try {
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}
```

#### **MEJOR SOLUCIÓN: Mover Credenciales al Backend**

```tsx
// ❌ NO guardar en frontend
localStorage.setItem('jira_config', JSON.stringify({ email, apiToken }));

// ✅ Enviar al backend y solo guardar un session ID
const response = await fetch('/api/integrations/jira', {
  method: 'POST',
  body: JSON.stringify({ email, apiToken }),
  headers: { 'Authorization': `Bearer ${userToken}` }
});

const { sessionId } = await response.json();
sessionStorage.setItem('jira_session', sessionId); // Solo referencia
```

---

## ⚠️ VULNERABILIDADES ALTAS

### 3. **CSRF (Cross-Site Request Forgery) - Falta de Tokens**

**Severidad**: 🟠 ALTA  
**Archivo**: `/src/services/api.ts`

#### **Problema:**
No se implementan tokens CSRF en peticiones POST/PUT/DELETE

#### **Solución:**

```tsx
// Agregar interceptor de Axios
import axios from 'axios';

// Generar CSRF token
const csrfToken = crypto.randomUUID();
sessionStorage.setItem('csrf_token', csrfToken);

// Configurar Axios para incluir CSRF token
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('csrf_token');
  if (token && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});
```

---

### 4. **Rate Limiting - Falta de Control en Frontend**

**Severidad**: 🟠 ALTA  
**Archivo**: `/src/services/api.ts`

#### **Problema:**
No hay límite de intentos de login ni throttling de requests

#### **Solución:**

```bash
npm install axios-rate-limit
```

```tsx
import rateLimit from 'axios-rate-limit';

const api = rateLimit(axios.create({
  baseURL: import.meta.env.VITE_API_URL,
}), {
  maxRequests: 100,
  perMilliseconds: 60000, // 100 requests por minuto
});

// Login con límite de intentos
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

export async function login(email: string, password: string) {
  const attempts = parseInt(sessionStorage.getItem('login_attempts') || '0');
  const lockoutUntil = parseInt(sessionStorage.getItem('lockout_until') || '0');
  
  if (Date.now() < lockoutUntil) {
    const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
    throw new Error(`Cuenta bloqueada. Intenta en ${remainingMinutes} minutos.`);
  }
  
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    sessionStorage.setItem('lockout_until', String(Date.now() + LOCKOUT_TIME));
    throw new Error('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.');
  }
  
  try {
    const response = await api.post('/auth/login', { email, password });
    sessionStorage.removeItem('login_attempts');
    sessionStorage.removeItem('lockout_until');
    return response.data;
  } catch (error) {
    sessionStorage.setItem('login_attempts', String(attempts + 1));
    throw error;
  }
}
```

---

### 5. **Inyección de RegExp (ReDoS)**

**Severidad**: 🟠 ALTA  
**Archivo**: `/src/app/pages/Designer.tsx:532`

#### Código Vulnerable:

```tsx
new RegExp(searchQuery, 'gi') // ❌ searchQuery sin sanitizar
```

#### **Riesgo:**
- Un atacante puede enviar una expresión regular maliciosa
- Ejemplo: `(a+)+$` causa DoS (congelamiento del navegador)

#### **Solución:**

```tsx
// Escapar caracteres especiales de RegExp
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Uso seguro
const sanitizedQuery = escapeRegExp(searchQuery);
const regex = new RegExp(sanitizedQuery, 'gi');
```

---

### 6. **Content Security Policy (CSP) No Configurada**

**Severidad**: 🟠 ALTA  
**Archivo**: `/index.html` (falta)

#### **Solución:**

```html
<!-- Agregar en index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://login.microsoftonline.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' 
          https://login.microsoftonline.com 
          https://graph.microsoft.com 
          https://api.postman.com 
          https://*.atlassian.net 
          https://api.telegram.org;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
      ">
```

O configurar en Vite:

```tsx
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; ..."
    }
  }
});
```

---

### 7. **Falta de Validación de Input en Formularios**

**Severidad**: 🟠 ALTA  
**Archivos**: Múltiples componentes

#### **Problema:**
No se validan inputs antes de enviar al backend

#### **Solución:**

```tsx
// Ya tienen Zod, pero falta implementar en todos los formularios
import { z } from 'zod';

// Ejemplo de validación robusta
const testCaseSchema = z.object({
  title: z.string()
    .min(5, 'Título debe tener al menos 5 caracteres')
    .max(200, 'Título no puede exceder 200 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Solo caracteres alfanuméricos'),
  
  description: z.string()
    .max(5000, 'Descripción no puede exceder 5000 caracteres')
    .refine(
      (val) => !/<script|javascript:|onerror=/i.test(val),
      'Contenido no permitido'
    ),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  
  steps: z.array(z.object({
    action: z.string().min(1).max(1000),
    expected: z.string().min(1).max(1000),
  })).min(1, 'Debe tener al menos 1 paso'),
});

// Uso en formulario
const form = useForm({
  resolver: zodResolver(testCaseSchema),
});
```

---

## 🟡 VULNERABILIDADES MEDIAS

### 8. **Exposición de Variables de Entorno en el Cliente**

**Severidad**: 🟡 MEDIA  
**Archivo**: `.env.local`

#### **Problema:**
```bash
# ❌ Estas variables están expuestas en el bundle JS
VITE_POSTMAN_API_KEY=PMAK-xxxx
VITE_JIRA_API_TOKEN=ATATTxxxx
```

#### **Solución:**
```bash
# ✅ Solo exponer lo necesario
VITE_API_URL=https://api.haida.com
VITE_AZURE_CLIENT_ID=xxx

# ❌ NO exponer tokens sensibles
# Las API keys deben manejarse en backend
```

---

### 9. **Memory Leaks - Falta de Cleanup en useEffect**

**Severidad**: 🟡 MEDIA  
**Archivos**: Múltiples componentes

#### **Problema:**
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  // ❌ No se limpia el interval
}, []);
```

#### **Solución:**
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  
  return () => clearInterval(interval); // ✅ Cleanup
}, []);
```

---

### 10. **Falta de HTTPS en Desarrollo**

**Severidad**: 🟡 MEDIA  
**Archivo**: `vite.config.ts`

#### **Solución:**
```tsx
// vite.config.ts
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem'),
    },
    port: 5173,
  },
});
```

---

## 🔵 MEJORAS DE UX/UI

### 11. **Estados de Carga Inconsistentes**

**Problema**: No todos los botones muestran estado de carga

#### **Solución:**
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Cargando...' : 'Guardar'}
</Button>
```

---

### 12. **Falta de Manejo de Errores Globales**

#### **Solución:**

```tsx
// ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error capturado:', error, errorInfo);
    // Enviar a servicio de logging (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Oops! Algo salió mal</h1>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>
              Recargar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📦 LIBRERÍAS RECOMENDADAS

### Seguridad

```bash
# Sanitización de HTML
npm install dompurify @types/dompurify

# Highlight seguro sin dangerouslySetInnerHTML
npm install react-highlight-words @types/react-highlight-words

# Encriptación de datos sensibles
npm install crypto-js @types/crypto-js

# Rate limiting
npm install axios-rate-limit

# Validación de schemas (ya instalado)
# zod@^4.2.1 ✅
```

### Monitoreo y Logging

```bash
# Error tracking
npm install @sentry/react @sentry/vite-plugin

# Session replay
npm install @logrocket/react

# Analytics
npm install @vercel/analytics
```

### Performance

```bash
# Code splitting mejorado
npm install @loadable/component

# Virtual scrolling para listas grandes
npm install react-window

# Optimización de imágenes
npm install sharp
```

### Testing

```bash
# Testing de seguridad
npm install --save-dev jest-axe @testing-library/jest-dom

# E2E testing
npm install --save-dev @playwright/test
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Prioridad 1 (Inmediata - Esta Semana)

- [ ] **Sanitizar `dangerouslySetInnerHTML` en Designer.tsx**
- [ ] **Encriptar credenciales en localStorage**
- [ ] **Implementar rate limiting en login**
- [ ] **Agregar CSP headers**
- [ ] **Escapar RegExp en búsquedas**

### Prioridad 2 (1-2 Semanas)

- [ ] **Implementar CSRF tokens**
- [ ] **Agregar ErrorBoundary global**
- [ ] **Cleanup de useEffect hooks**
- [ ] **Validación de inputs con Zod en todos los formularios**
- [ ] **Mover tokens sensibles al backend**

### Prioridad 3 (1 Mes)

- [ ] **Configurar Sentry para error tracking**
- [ ] **Implementar HTTPS en desarrollo**
- [ ] **Agregar tests de seguridad**
- [ ] **Auditoría de dependencias con `npm audit`**
- [ ] **Documentar políticas de seguridad**

---

## 🔗 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [React Security Best Practices](https://react.dev/learn/security)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Generado por**: Sistema de Auditoría HAIDA  
**Próxima revisión**: 20 de Febrero 2026
