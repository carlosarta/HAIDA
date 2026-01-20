# 📚 HAIDA - Documentación Maestra

**Plataforma Empresarial de QA con Arquitectura Data-Driven**

---

## 🚀 Hub de Navegación Central

Bienvenido a la documentación completa de HAIDA. Esta es tu **Fuente Única de Verdad** para todo lo relacionado con la plataforma.

### 📖 Documentos Críticos (Lectura Obligatoria)

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [QUICK START](./00-QUICK-START.md) | Guía de 5 minutos para setup local | **Todos** |
| [MASTER URLS & CONFIGS](./00-MASTER-URLS-CONFIGS.md) | Matriz completa de URLs, variables de entorno | **DevOps, Backend** |
| [TROUBLESHOOTING](./02-TROUBLESHOOTING.md) | Soluciones a problemas comunes | **Todos** |
| [MASTER CHECKLIST](./03-MASTER-CHECKLIST.md) | Lista de validación pre-deployment | **QA, DevOps** |

---

## 🗂️ Navegación por Capas de Documentación

### **Layer 1: Configuración y Referencias Maestras**
- 📁 [00-MASTER-REFERENCE](../00-MASTER-REFERENCE/) - **ESTÁS AQUÍ**
  - Punto de entrada principal
  - Configuración global del sistema
  - URLs y credenciales de todos los entornos

### **Layer 2: Componentes Técnicos**
- 📁 [01-FRONTEND](../01-FRONTEND/) - Arquitectura React/Vite, Radix UI, Estado
- 📁 [02-BACKEND](../02-BACKEND/) - API Reference, Servicios, Autenticación
- 📁 [03-DATABASE](../03-DATABASE/) - Esquema PostgreSQL, RLS, Backups
- 📁 [04-INTEGRATIONS](../04-INTEGRATIONS/) - Postman, Jira, Confluence, Telegram, Microsoft 365

### **Layer 3: Requisitos y Diseño**
- 📁 [05-REQUIREMENTS](../05-REQUIREMENTS/) - BRDs, Especificaciones Funcionales, User Stories

### **Layer 4: QA y Testing**
- 📁 [06-TESTING](../06-TESTING/) - Estrategia de Testing, Cobertura, Automatización
- 📁 [07-POSTMAN](../07-POSTMAN/) - Colecciones, Entornos, Newman

### **Layer 5: Infraestructura**
- 📁 [08-REPOSITORIES](../08-REPOSITORIES/) - CI/CD, GitHub Actions, Git Flow
- 📁 [09-CONFIGURATION](../09-CONFIGURATION/) - Deployment, Docker, Variables de Entorno

---

## 👥 Rutas de Lectura Recomendadas por Rol

### **🆕 Nuevos Desarrolladores**
1. [QUICK START](./00-QUICK-START.md)
2. [01-FRONTEND/ARCHITECTURE.md](../01-FRONTEND/ARCHITECTURE.md)
3. [02-BACKEND/API-REFERENCE.md](../02-BACKEND/API-REFERENCE.md)

### **🔧 Backend Engineers**
1. [02-BACKEND/](../02-BACKEND/)
2. [03-DATABASE/](../03-DATABASE/)
3. [04-INTEGRATIONS/](../04-INTEGRATIONS/)

### **🎨 Frontend Engineers**
1. [01-FRONTEND/](../01-FRONTEND/)
2. [02-BACKEND/API-REFERENCE.md](../02-BACKEND/API-REFERENCE.md)
3. [06-TESTING/](../06-TESTING/)

### **🚀 DevOps**
1. [00-MASTER-URLS-CONFIGS.md](./00-MASTER-URLS-CONFIGS.md)
2. [03-MASTER-CHECKLIST.md](./03-MASTER-CHECKLIST.md)
3. [09-CONFIGURATION/](../09-CONFIGURATION/)

### **✅ QA Engineers**
1. [QUICK START](./00-QUICK-START.md)
2. [06-TESTING/](../06-TESTING/)
3. [07-POSTMAN/](../07-POSTMAN/)

---

## 🔍 Búsqueda Rápida

**¿Buscas algo específico?**

- **Variables de entorno**: [00-MASTER-URLS-CONFIGS.md](./00-MASTER-URLS-CONFIGS.md)
- **Configurar Microsoft 365**: [04-INTEGRATIONS/MICROSOFT-365.md](../04-INTEGRATIONS/MICROSOFT-365.md)
- **Crear caso de prueba**: [06-TESTING/TEST-CASE-CREATION.md](../06-TESTING/TEST-CASE-CREATION.md)
- **Configurar Jira**: [04-INTEGRATIONS/JIRA-CONFLUENCE.md](../04-INTEGRATIONS/JIRA-CONFLUENCE.md)
- **Desplegar en producción**: [09-CONFIGURATION/DEPLOYMENT.md](../09-CONFIGURATION/DEPLOYMENT.md)
- **Problemas con login**: [02-TROUBLESHOOTING.md](./02-TROUBLESHOOTING.md#microsoft-365-login)

---

## 📊 Información del Sistema

| Atributo | Valor |
|----------|-------|
| **Versión** | 1.0.0 |
| **Stack** | React 18 + TypeScript + Vite + Radix UI + Tailwind CSS v4 |
| **Backend** | Node.js + Supabase (PostgreSQL) |
| **Auth** | Microsoft Entra ID (OAuth 2.0) |
| **Integraciones** | Postman, Jira, Confluence, Telegram |
| **Testing** | Playwright + Jest + ISTQB Methodology |

---

## 🆘 Soporte

¿Tienes preguntas? Consulta:
1. [TROUBLESHOOTING.md](./02-TROUBLESHOOTING.md) para problemas comunes
2. El equipo de Hiberus Tecnología
3. Issues en el repositorio del proyecto

---

**Última actualización**: Enero 2026 | **Mantenido por**: Hiberus Tecnología
