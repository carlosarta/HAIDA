# 🚀 HAIDA - Quick Start Guide

**¡Bienvenido a HAIDA!** Esta guía te ayudará a empezar en **menos de 10 minutos**.

---

## 📦 Prerequisitos

- Node.js 18+
- npm/pnpm/yarn
- Cuenta de Supabase (opcional, hay mock backend)
- Editor: VS Code recomendado

---

## ⚡ Instalación Rápida

### **1. Clonar e Instalar**

```bash
# Clonar repositorio
git clone https://github.com/tu-org/haida.git
cd haida

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

### **2. Configurar Variables de Entorno**

Crea `.env.local`:

```env
# Supabase (opcional - hay mock backend)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Microsoft SSO (opcional)
VITE_AZURE_CLIENT_ID=tu-client-id
VITE_AZURE_TENANT_ID=tu-tenant-id

# Feature Flags
VITE_ENABLE_CHAT_IA=true
VITE_ENABLE_TELEGRAM_BOT=true
```

---

### **3. Primer Login**

**Usuarios Demo** (Mock Backend):

| Email | Password | Role |
|-------|----------|------|
| `admin@haida.com` | `admin123` | Admin |
| `qa@haida.com` | `qa123` | QA Engineer |
| `tester@haida.com` | `tester123` | Tester |

---

## 🎯 Tour Rápido

### **Dashboard Principal**

1. **Proyectos** (`/dashboard`)
   - Ver lista de proyectos
   - Métricas de salud en tiempo real
   - Crear nuevo proyecto

2. **Test Designer** (`/designer`)
   - Crear test suites y casos
   - Importar desde Postman/Jira
   - Visualizar cobertura

3. **Executions** (`/executions`)
   - Ver ejecuciones recientes
   - Analizar resultados
   - Ver reportes Allure/Playwright

4. **Chat IA** (`/chat`)
   - Copilot-style assistant
   - Contexto de proyecto automático
   - Sugerencias de tests

---

## 📝 Casos de Uso Comunes

### **Crear Tu Primer Proyecto**

```typescript
// 1. Navegar a Dashboard
// 2. Click "Nuevo Proyecto"
// 3. Llenar formulario:
const project = {
  name: 'Mi App E-commerce',
  slug: 'mi-app-ecommerce', // URL-friendly
  base_url: 'https://mi-app.com',
  repository_url: 'https://github.com/org/repo',
};

// 4. Click "Crear" ✅
```

**Resultado**: Proyecto creado con suite "Smoke Tests" automática

---

### **Crear Test Suite**

```typescript
// 1. Ir a proyecto → Tab "Test Suites"
// 2. Click "Nueva Suite"
// 3. Configurar:
const suite = {
  name: 'Regression Tests',
  suite_type: 'regression',
  priority: 'high',
  tags: ['api', 'backend', 'critical'],
};

// 4. Agregar test cases manualmente o importar desde Postman
```

---

### **Ejecutar Tests**

#### **Opción A: Manual**
```bash
# En tu proyecto de Playwright
npx playwright test --grep "smoke"

# Los resultados se pueden importar:
# Dashboard → Upload Results → Seleccionar JSON
```

#### **Opción B: Webhook (Automático)**
```bash
# Configurar webhook en tu CI/CD
POST https://api.haida.com/webhooks/change-detected
{
  "project_id": "uuid",
  "url": "https://mi-app.com",
  "tag": "v1.2.3",
  "change_type": "deployment"
}

# HAIDA ejecutará automáticamente los tests configurados
```

---

### **Trackear Defectos**

```typescript
// 1. Test falla → HAIDA crea defecto automáticamente
// 2. O crear manualmente:
//    - Dashboard → Defects → "New Defect"

const defect = {
  title: 'Login button not working',
  severity: 'high',
  priority: 'p1',
  steps_to_reproduce: '1. Go to /login\n2. Click button',
  expected_behavior: 'User logs in',
  actual_behavior: 'Nothing happens',
  browser: 'Chrome 120',
  environment: 'staging',
};

// 3. Asignar a developer
// 4. Vincular con Jira: "Link to Jira"
// 5. HAIDA sincroniza estado automáticamente
```

---

### **Usar Chat IA**

```typescript
// 1. Click en ícono Chat (bottom-right)
// 2. Seleccionar contexto: "Current Project"
// 3. Hacer preguntas:

Tú: "¿Cuántos tests fallaron hoy?"
IA: "Hoy han fallado 3 tests:
     - TC-001: Login validation (high)
     - TC-015: Checkout flow (medium)
     - TC-032: Search filters (low)"

Tú: "¿Qué salió mal en TC-001?"
IA: "El test TC-001 falló porque el botón de login
     no responde. El error dice: 'Element not found: #login-btn'.
     Esto sucedió en Chrome 120, staging environment."

Tú: "¿Cómo lo arreglo?"
IA: "Posibles soluciones:
     1. Verificar que el selector CSS sea correcto
     2. Agregar wait/timeout antes de click
     3. Verificar que el botón no esté disabled"
```

---

## 🔧 Configuración Avanzada

### **Habilitar SSO con Microsoft 365**

```typescript
// 1. Ir a Settings → SSO
// 2. Click "Configure Microsoft SSO"
// 3. Seguir wizard:
//    - Azure Portal → App Registrations → New
//    - Copiar Client ID y Tenant ID
//    - Configurar redirect URI: https://tu-app.com/auth/callback
// 4. Pegar credenciales en HAIDA
// 5. ✅ SSO habilitado
```

---

### **Configurar Bot de Telegram**

```bash
# 1. Hablar con @BotFather en Telegram
/newbot
# Nombre: HAIDA Bot
# Username: haida_qa_bot

# 2. Copiar token
# 3. Ir a HAIDA → Settings → Integrations → Telegram
# 4. Pegar token (se encripta automáticamente)
# 5. Click "Activate"

# 6. Comandos disponibles:
/start - Iniciar bot
/projects - Ver proyectos
/status <project> - Ver estado
/last_execution <project> - Última ejecución
/defects - Defectos abiertos
```

---

### **Integración con Jira**

```typescript
// 1. Settings → Integrations → Jira
// 2. Configurar:
{
  "jira_url": "https://tu-org.atlassian.net",
  "email": "tu-email@example.com",
  "api_token": "tu-api-token" // Se encripta automáticamente
}

// 3. Vincular proyecto HAIDA con proyecto Jira
// 4. Ahora puedes:
//    - Crear issues desde defects
//    - Sincronizar estados automáticamente
//    - Ver issues vinculados en HAIDA
```

---

## 🎨 Personalización

### **Tema Dark/Light**

```typescript
// Se guarda en user_profiles.preferences
{
  "theme": "dark", // "light" | "dark" | "system"
  "notifications": {
    "push": true,
    "email": true
  }
}

// Cambiar: Settings → Appearance → Theme
```

---

### **Dashboard Widgets**

```typescript
// Personalizar widgets visibles
// Settings → Dashboard → Customize

const widgets = [
  'project_health',       // Salud de proyectos
  'recent_executions',    // Últimas ejecuciones
  'defects_summary',      // Defectos por severidad
  'test_coverage',        // % automatización
  'team_activity',        // Actividad del equipo
];
```

---

## 🐛 Troubleshooting

### **"Cannot connect to Supabase"**

```typescript
// Verificar:
// 1. .env.local tiene las keys correctas
// 2. Supabase project está activo
// 3. Network no está bloqueando supabase.co

// Solución temporal: Usar Mock Backend
// Settings → Advanced → Enable Mock Backend
```

### **"RLS Policy Violation"**

```sql
-- Verificar que el usuario es miembro del tenant
SELECT * FROM tenant_members
WHERE user_id = auth.uid()
  AND tenant_id = 'tu-tenant-uuid';

-- Si no existe, agregar:
INSERT INTO tenant_members (tenant_id, user_id, role)
VALUES ('tenant-uuid', 'user-uuid', 'editor');
```

### **"Rate Limit Exceeded"**

```typescript
// Esperar 60 segundos o:
// Settings → Advanced → Clear Rate Limit Cache
localStorage.removeItem('rate-limit-cache');
```

---

## 📖 Próximos Pasos

1. ✅ **Familiarízate con la UI** - Explora todas las secciones
2. 📚 **Lee la documentación completa**:
   - [Database Guide](./DATABASE_GUIDE.md)
   - [Security Architecture](./SECURITY_ARCHITECTURE.md)
   - [API Reference](./API_REFERENCE.md)
   - [Best Practices](./BEST_PRACTICES.md)
3. 🧪 **Crea tu primer test suite** - Usa el Designer
4. 🤖 **Configura integraciones** - Jira/Telegram/Postman
5. 💬 **Prueba el Chat IA** - Haz preguntas sobre tus tests
6. 👥 **Invita a tu equipo** - Settings → Team → Invite

---

## 📞 Ayuda y Soporte

- **Documentación**: `/docs/`
- **Issues**: GitHub Issues
- **Discord**: [Link al servidor] *(crear)*
- **Email**: support@haida.com *(configurar)*

---

## 🎉 ¡Listo!

Ya estás listo para usar HAIDA. Si tienes problemas, revisa [Troubleshooting](#troubleshooting) o abre un issue.

**¡Happy Testing!** 🚀

---

**Última actualización**: 2025-01-20  
**Versión**: 1.0.0
