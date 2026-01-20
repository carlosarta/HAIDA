# 🚀 HAIDA - Quick Start Guide

**Configura HAIDA en 5 minutos**

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- ✅ **npm** o **pnpm** (incluido con Node.js)
- ✅ **Git** ([Descargar](https://git-scm.com/))
- ✅ **Cuenta de Microsoft 365** (corporativa de Hiberus)
- ✅ **Editor de código** (VS Code recomendado)

---

## 🎯 Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/hiberus/haida.git

# Navegar al directorio
cd haida

# Instalar dependencias
npm install
# o si usas pnpm:
pnpm install
```

---

## ⚙️ Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo `.env.local`

```bash
# Copiar el template
cp .env.example .env.local
```

### 2.2 Configurar Microsoft Entra ID (Azure AD)

1. Ve a [Azure Portal](https://portal.azure.com) → **App Registrations**
2. Busca la aplicación **HAIDA** (o pide acceso al equipo de DevOps)
3. Copia el **Application (client) ID**
4. Pega el valor en `.env.local`:

```bash
VITE_AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AZURE_TENANT_ID=common
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

### 2.3 Habilitar Mock Backend (Opcional)

Para desarrollo local sin backend real:

```bash
VITE_ENABLE_MOCK_BACKEND=true
```

---

## 🚀 Paso 3: Iniciar el Servidor de Desarrollo

```bash
# Iniciar frontend
npm run dev

# Acceder a la aplicación
# Abre tu navegador en: http://localhost:5173
```

Deberías ver la pantalla de login de HAIDA.

---

## 🔐 Paso 4: Login con Microsoft 365

1. Haz clic en **"Continue with Microsoft"**
2. Ingresa tus **credenciales corporativas de Hiberus** (ej: `tu-usuario@hiberus.com`)
3. Acepta los permisos solicitados:
   - ✅ Ver tu perfil básico
   - ✅ Leer tu email
   - ✅ Mantener acceso a los datos

4. Serás redirigido al **Dashboard de HAIDA**

---

## ✅ Paso 5: Verificar la Instalación

### 5.1 Crear tu primer proyecto

1. Ve a **Projects** en el menú lateral
2. Haz clic en **"+ New Project"**
3. Completa el formulario:
   - **Nombre**: `Mi Primer Proyecto`
   - **Clave**: `TEST` (3-5 caracteres mayúsculas)
   - **Descripción**: `Proyecto de prueba`
4. Haz clic en **"Create"**

### 5.2 Explorar módulos disponibles

- **Projects**: Gestión de proyectos y Kanban board
- **Designer**: Generador de casos de prueba con IA
- **Executor**: Ejecutar pruebas manuales y automáticas
- **Analyzer**: Análisis de defectos (próximamente)
- **Chat IA**: Asistente estilo Microsoft 365 Copilot
- **Settings**: Configuración de integraciones

---

## 🔧 Configuración Avanzada (Opcional)

### Integración con Postman

1. Ve a [Postman API Keys](https://web.postman.co/settings/me/api-keys)
2. Genera un nuevo **API Key**
3. Copia el key y pégalo en `.env.local`:

```bash
VITE_POSTMAN_API_KEY=PMAK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. En HAIDA, ve a **Settings** → **Integraciones** → **Postman**
5. Pega el API Key y guarda

### Integración con Jira

1. Ve a [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Crea un nuevo **API Token**
3. Configura en `.env.local`:

```bash
VITE_JIRA_BASE_URL=https://your-org.atlassian.net
VITE_JIRA_API_TOKEN=ATATTxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_JIRA_EMAIL=tu-email@hiberus.com
```

### Bot de Telegram (Notificaciones)

1. Abre Telegram y habla con [@BotFather](https://t.me/BotFather)
2. Envía `/newbot` y sigue las instrucciones
3. Copia el **Bot Token**
4. En HAIDA, ve a **Settings** → **Bot de Telegram**
5. Pega el token y escanea el QR code

---

## 🐛 Troubleshooting

### Problema: "Cannot find module 'react'"

```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Microsoft login no funciona"

1. Verifica que `VITE_AZURE_CLIENT_ID` esté configurado correctamente
2. Asegúrate de estar usando una cuenta corporativa de Hiberus
3. Limpia las cookies del navegador: `Ctrl+Shift+Delete`
4. Intenta en modo incógnito

### Problema: "Puerto 5173 ya está en uso"

```bash
# Solución: Cambiar el puerto en vite.config.ts
export default defineConfig({
  server: {
    port: 3000, // Cambia a otro puerto
  },
});
```

---

## 📚 Próximos Pasos

Ahora que HAIDA está funcionando, explora:

1. **[Arquitectura del Sistema](../01-FRONTEND/ARCHITECTURE.md)** - Entender la estructura del código
2. **[API Reference](../02-BACKEND/API-REFERENCE.md)** - Documentación de servicios
3. **[Testing Guide](../06-TESTING/TESTING-STRATEGY.md)** - Estrategia de pruebas
4. **[Troubleshooting](./02-TROUBLESHOOTING.md)** - Soluciones a problemas comunes

---

## 🆘 ¿Necesitas Ayuda?

- **Documentación completa**: [00-README.md](./00-README.md)
- **Troubleshooting**: [02-TROUBLESHOOTING.md](./02-TROUBLESHOOTING.md)
- **Equipo de Hiberus**: Contacta en Microsoft Teams

---

**¡Felicidades! 🎉 Ya tienes HAIDA funcionando localmente.**

---

**Última actualización**: Enero 2026 | **Tiempo estimado**: 5-10 minutos
