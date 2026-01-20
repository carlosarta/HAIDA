# 🔐 HAIDA - Master URLs & Configurations

**Matriz Completa de URLs, Variables de Entorno y Credenciales**

---

## 📋 Tabla de Contenidos

1. [Entornos Disponibles](#entornos-disponibles)
2. [URLs del Sistema](#urls-del-sistema)
3. [Variables de Entorno](#variables-de-entorno)
4. [Credenciales y API Keys](#credenciales-y-api-keys)
5. [Integraciones Externas](#integraciones-externas)

---

## 🌍 Entornos Disponibles

| Entorno | URL Base | Estado | Descripción |
|---------|----------|--------|-------------|
| **Local** | `http://localhost:5173` | 🟢 Activo | Desarrollo local |
| **Staging** | `https://haida-staging.railway.app` | 🟡 Disponible | Pre-producción |
| **Production** | `https://haida.hiberus.com` | 🟢 Activo | Producción |

---

## 🔗 URLs del Sistema

### Frontend

```bash
# Local Development
VITE_APP_URL=http://localhost:5173

# Staging
VITE_APP_URL=https://haida-staging.railway.app

# Production
VITE_APP_URL=https://haida.hiberus.com
```

### Backend API

```bash
# Local Development
VITE_API_URL=http://localhost:3000/api

# Staging (Supabase)
VITE_API_URL=https://your-project.supabase.co

# Production (Supabase)
VITE_API_URL=https://your-project.supabase.co
```

---

## ⚙️ Variables de Entorno

### Archivo `.env.local` (Desarrollo Local)

```bash
# ============================================
# HAIDA - Configuración Local
# ============================================

# ---- Microsoft 365 / Entra ID ----
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=common
VITE_AZURE_REDIRECT_URI=http://localhost:5173

# ---- Supabase (Mock Backend) ----
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ---- Postman API ----
VITE_POSTMAN_API_KEY=PMAK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTMAN_WORKSPACE_ID=3584d84a-1bb2-4f6f-a5f0-0d6dcae7f5d5

# ---- Jira Cloud ----
VITE_JIRA_BASE_URL=https://your-org.atlassian.net
VITE_JIRA_API_TOKEN=your-jira-api-token
VITE_JIRA_EMAIL=your-email@hiberus.com

# ---- Confluence Cloud ----
VITE_CONFLUENCE_BASE_URL=https://your-org.atlassian.net/wiki
VITE_CONFLUENCE_API_TOKEN=your-confluence-api-token

# ---- Telegram Bot ----
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
VITE_TELEGRAM_CHAT_ID=your-chat-id

# ---- App Configuration ----
VITE_APP_NAME=HAIDA
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK_BACKEND=true
```

### Archivo `.env.production` (Producción)

```bash
# ============================================
# HAIDA - Configuración Producción
# ============================================

# ---- Microsoft 365 / Entra ID ----
VITE_AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
VITE_AZURE_TENANT_ID=${AZURE_TENANT_ID}
VITE_AZURE_REDIRECT_URI=https://haida.hiberus.com

# ---- Supabase ----
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# ---- Postman API ----
VITE_POSTMAN_API_KEY=${POSTMAN_API_KEY}
VITE_POSTMAN_WORKSPACE_ID=${POSTMAN_WORKSPACE_ID}

# ---- Jira Cloud ----
VITE_JIRA_BASE_URL=${JIRA_BASE_URL}
VITE_JIRA_API_TOKEN=${JIRA_API_TOKEN}
VITE_JIRA_EMAIL=${JIRA_EMAIL}

# ---- Confluence Cloud ----
VITE_CONFLUENCE_BASE_URL=${CONFLUENCE_BASE_URL}
VITE_CONFLUENCE_API_TOKEN=${CONFLUENCE_API_TOKEN}

# ---- Telegram Bot ----
VITE_TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}

# ---- App Configuration ----
VITE_APP_NAME=HAIDA
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK_BACKEND=false
```

---

## 🔑 Credenciales y API Keys

### Microsoft Entra ID (Azure AD)

**Ubicación**: Azure Portal > App Registrations > HAIDA

| Campo | Valor | Dónde obtenerlo |
|-------|-------|-----------------|
| **Client ID** | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Overview → Application (client) ID |
| **Tenant ID** | `common` o específico | Overview → Directory (tenant) ID |
| **Redirect URI** | `http://localhost:5173` (local) | Authentication → Redirect URIs |
| **Permisos** | User.Read, email, openid, profile | API permissions |

**Configurar en**:
```bash
Azure Portal > App Registrations > HAIDA > Authentication
- Platform: Single-page application
- Redirect URIs: http://localhost:5173, https://haida.hiberus.com
- Logout URL: http://localhost:5173/logout
```

---

### Postman API

**Ubicación**: [Postman Settings](https://web.postman.co/settings/me/api-keys)

| Campo | Valor | Dónde obtenerlo |
|-------|-------|-----------------|
| **API Key** | `PMAK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Settings → API Keys → Generate API Key |
| **Workspace ID** | `3584d84a-1bb2-4f6f-a5f0-0d6dcae7f5d5` | Workspace Settings → Workspace ID |

**Workspace**: HAIDA Global Team

**Colecciones Configuradas**:
- PRIVALIA API Collection
- CTB API Tests
- HAIDA System Tests

---

### Jira Cloud

**Ubicación**: [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)

| Campo | Valor | Dónde obtenerlo |
|-------|-------|-----------------|
| **Base URL** | `https://your-org.atlassian.net` | Tu dominio de Jira |
| **API Token** | `ATATTxxxxxxxxxxxxxxxxxxxxxxxxxx` | Security → API Tokens → Create API token |
| **Email** | `your-email@hiberus.com` | Tu email de Atlassian |

**Proyectos Configurados**:
- PRIVALIA (PRIV)
- CTB (CTB)
- HAIDA (HAIDA)

---

### Confluence Cloud

**Ubicación**: Mismo token de Jira

| Campo | Valor | Dónde obtenerlo |
|-------|-------|-----------------|
| **Base URL** | `https://your-org.atlassian.net/wiki` | Tu dominio de Confluence |
| **API Token** | Mismo que Jira | Reutiliza el token de Jira |

**Espacios Configurados**:
- Privalia QA (PRIV)
- CTB Testing (CTB)
- HAIDA Docs (HAIDA)

---

### Telegram Bot

**Ubicación**: [BotFather en Telegram](https://t.me/BotFather)

| Campo | Valor | Dónde obtenerlo |
|-------|-------|-----------------|
| **Bot Token** | `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789` | /newbot en @BotFather |
| **Chat ID** | `123456789` | Escanea QR en HAIDA → Settings → Telegram |

**Comandos Configurados**:
```bash
/start - Iniciar bot
/help - Ayuda
/status - Estado del sistema
/projects - Listar proyectos
/suites - Listar suites
/run - Ejecutar pruebas
/results - Ver resultados
/defects - Listar defectos
/stats - Estadísticas
/export - Exportar datos
/config - Configuración
```

---

## 🔌 Integraciones Externas

### Microsoft Graph API

```bash
# Endpoints usados
https://graph.microsoft.com/v1.0/me
https://graph.microsoft.com/v1.0/me/photo/$value
https://graph.microsoft.com/v1.0/users
```

**Permisos necesarios**:
- `User.Read` - Leer perfil del usuario
- `email` - Email del usuario
- `openid` - OpenID Connect
- `profile` - Información básica del perfil

---

### Supabase (PostgreSQL)

```bash
# Connection String (Local)
postgresql://postgres:postgres@localhost:5432/haida

# Connection String (Production)
postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres
```

**Tablas principales**:
- `projects` - Proyectos de QA
- `test_suites` - Suites de pruebas
- `test_cases` - Casos de prueba
- `executions` - Ejecuciones
- `defects` - Defectos/Bugs
- `users` - Usuarios del sistema
- `permissions` - Permisos por proyecto

---

## 🛡️ Seguridad

### Buenas Prácticas

✅ **HACER**:
- Usar variables de entorno para credenciales
- Rotar API keys cada 90 días
- Nunca commitear `.env` al repositorio
- Usar HTTPS en producción
- Implementar Rate Limiting

❌ **NO HACER**:
- Hardcodear credenciales en el código
- Compartir API keys en mensajes de Slack/Teams
- Usar el mismo token para todos los entornos
- Guardar credenciales en el navegador sin encriptación

### Rotación de Credenciales

| Servicio | Frecuencia | Responsable |
|----------|------------|-------------|
| Microsoft Entra ID | 1 año | DevOps |
| Postman API Key | 90 días | QA Lead |
| Jira/Confluence Token | 90 días | QA Lead |
| Telegram Bot Token | 180 días | DevOps |
| Supabase Keys | 1 año | DevOps |

---

## 📞 Contacto

**¿Necesitas acceso a credenciales?**

Contacta a:
- **DevOps Lead**: devops@hiberus.com
- **QA Manager**: qa-manager@hiberus.com
- **IT Security**: security@hiberus.com

---

**Última actualización**: Enero 2026 | **Clasificación**: Confidencial - Solo equipo Hiberus
