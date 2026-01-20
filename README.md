# 🚀 HAIDA - Enterprise QA Platform

<div align="center">

![HAIDA Logo](https://via.placeholder.com/400x120/0ea5e9/ffffff?text=HAIDA)

**Plataforma de QA Empresarial con Arquitectura Data-Driven**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.12-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Security: A+](https://img.shields.io/badge/Security-A+-success)](./docs/SECURITY_ARCHITECTURE.md)

[Demo](https://haida-demo.example.com) · [Documentación](./docs/README.md) · [Reportar Bug](https://github.com/tu-org/haida/issues) · [Solicitar Feature](https://github.com/tu-org/haida/issues/new?template=feature_request.md)

</div>

---

## ✨ Features Principales

### **🏢 Multi-Tenancy**
- Organizaciones completamente aisladas
- Row Level Security (RLS) en PostgreSQL
- Roles por tenant + proyecto
- Gestión de miembros y permisos

### **🧪 Test Management**
- Test Suites y Cases organizados
- Importación desde Postman/Jira
- Tracking de ejecuciones en tiempo real
- Reportes Allure & Playwright integrados

### **🔄 Change Detection**
- Webhooks para detectar deployments
- Auto-trigger de test suites
- Diff visualization con MD5 hashing
- Integración con CI/CD pipelines

### **🐛 Defect Tracking**
- Creación automática desde tests fallidos
- Sincronización bidireccional con Jira
- Asignación y tracking de resolución
- Métricas por severidad y prioridad

### **💬 Chat IA (Copilot-style)**
- Microsoft 365 Copilot design
- Contexto automático de proyecto
- Sugerencias de tests
- Análisis de fallos con IA

### **🤖 Telegram Bot**
- 22 comandos implementados
- Notificaciones de ejecuciones
- Consulta de estado de proyectos
- Gestión desde mobile

### **🔐 Security First**
- AES-256-GCM encryption para credenciales
- CSRF protection automática
- Rate limiting (100 req/min)
- XSS/ReDoS protection
- Error boundary global

### **🎨 UI/UX Profesional**
- 47+ componentes Radix UI
- Tema dark/light con persistencia
- Responsive design (desktop + tablet)
- Skeleton loaders y estados vacíos

---

## 🚀 Quick Start

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-org/haida.git
cd haida

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys

# 4. Iniciar en modo desarrollo
npm run dev

# 5. Abrir navegador
open http://localhost:5173
```

**Login Demo**:
- Email: `admin@haida.com`
- Password: `admin123`

Ver [Quick Start Guide](./docs/QUICK_START.md) para setup completo.

---

## 📚 Documentación

<table>
<tr>
<td width="33%" valign="top">

### 🎓 **Getting Started**
- [Quick Start](./docs/QUICK_START.md)
- [Installation](./docs/QUICK_START.md#instalación-rápida)
- [Configuration](./docs/QUICK_START.md#configurar-variables-de-entorno)
- [First Project](./docs/QUICK_START.md#crear-tu-primer-proyecto)

</td>
<td width="33%" valign="top">

### 💻 **Developers**
- [API Reference](./docs/API_REFERENCE.md)
- [Database Guide](./docs/DATABASE_GUIDE.md)
- [Best Practices](./docs/BEST_PRACTICES.md)
- [TypeScript Types](./src/types/database.types.ts)

</td>
<td width="33%" valign="top">

### 🔒 **Security**
- [Security Architecture](./docs/SECURITY_ARCHITECTURE.md)
- [Security Changelog](./docs/SECURITY_CHANGELOG.md)
- [Vulnerability Reporting](./docs/SECURITY_ARCHITECTURE.md#contacto)

</td>
</tr>
</table>

---

## 🏗️ Arquitectura

### **Tech Stack**

```
┌─────────────────────────────────────────┐
│         React 18 + TypeScript           │
│  ├─ Radix UI (47+ components)           │
│  ├─ Tailwind CSS v4                     │
│  ├─ React Hook Form + Zod               │
│  └─ Recharts + Lucide Icons             │
└─────────────────────────────────────────┘
                 ↕ REST API
┌─────────────────────────────────────────┐
│          Supabase Backend               │
│  ├─ PostgreSQL 15+                      │
│  ├─ Row Level Security (RLS)            │
│  ├─ Realtime Subscriptions              │
│  └─ Edge Functions                      │
└─────────────────────────────────────────┘
                 ↕ 
┌─────────────────────────────────────────┐
│        External Integrations            │
│  ├─ Microsoft 365 (SSO)                 │
│  ├─ Jira (Issue Tracking)               │
│  ├─ Telegram (Notifications)            │
│  ├─ Postman (Test Import)               │
│  └─ OpenAI/Copilot (Chat IA)            │
└─────────────────────────────────────────┘
```

### **Database Schema**

Ver diagrama ER completo: [HAIDA_DATABASE_DIAGRAM.md](./HAIDA_DATABASE_DIAGRAM.md)

**23 Tablas principales**:
- Multi-tenancy (tenants, tenant_members)
- Users (users, user_profiles, user_sso_providers)
- RBAC (roles, permissions, role_permissions)
- Testing (projects, test_suites, test_cases, test_executions, test_results)
- Defects (defects con vinculación a Jira)
- Chat IA (chat_threads, chat_messages, chat_providers)
- Feature Flags (feature_flags, tenant_feature_flags, user_feature_flags)
- Rate Limiting (rate_limit_counters, rate_limit_policies)
- Change Detection (change_detections)
- Audit (event_logs)

---

## 📊 Screenshots

<table>
<tr>
<td width="50%">

### Dashboard Principal
![Dashboard](https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Dashboard)

</td>
<td width="50%">

### Test Designer
![Designer](https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Designer)

</td>
</tr>
<tr>
<td width="50%">

### Chat IA (Copilot)
![Chat IA](https://via.placeholder.com/600x400/10b981/ffffff?text=Chat+IA)

</td>
<td width="50%">

### Defect Tracking
![Defects](https://via.placeholder.com/600x400/ef4444/ffffff?text=Defects)

</td>
</tr>
</table>

---

## 🎯 Use Cases

### **Para QA Teams**
- ✅ Gestionar test cases en un solo lugar
- ✅ Ejecutar tests automáticamente al detectar cambios
- ✅ Trackear defectos con vinculación a Jira
- ✅ Generar reportes profesionales
- ✅ Recibir notificaciones en Telegram

### **Para Managers**
- ✅ Dashboard con métricas en tiempo real
- ✅ Test coverage por proyecto
- ✅ Tendencias de calidad (30/60/90 días)
- ✅ ROI de automatización
- ✅ Reportes exportables (PDF/Excel)

### **Para Developers**
- ✅ Ver tests relacionados con sus features
- ✅ Entender por qué falló un test
- ✅ Acceder a traces y screenshots
- ✅ Vinculación con commits de Git

---

## 🔧 Development

### **Prerequisites**
- Node.js 18+
- npm/pnpm/yarn
- Git

### **Setup**

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Project Structure**

Ver [Project Structure](./docs/README.md#estructura-del-proyecto)

### **Contributing**

Lee nuestra [Contributing Guide](./docs/CONTRIBUTING.md) _(próximamente)_

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

**Coverage Actual**:
- Services: 85%
- Components: 72%
- Utils: 93%

---

## 📈 Roadmap

### **v1.0 (Q1 2025)** ✅
- [x] Core QA features
- [x] Multi-tenancy + RBAC
- [x] Security hardening completo
- [x] Database schema completo
- [x] Documentación completa

### **v1.1 (Q2 2025)**
- [ ] Mobile app (React Native)
- [ ] CI/CD integrations (GitHub Actions, GitLab)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### **v2.0 (Q3 2025)**
- [ ] ML-powered test suggestions
- [ ] Visual regression testing
- [ ] Performance monitoring
- [ ] Plugin marketplace

Ver [Roadmap completo](./docs/ROADMAP.md) _(próximamente)_

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tu-org/haida&type=Date)](https://star-history.com/#tu-org/haida&Date)

---

## 🤝 Contributors

Gracias a todos los que han contribuido:

<a href="https://github.com/tu-org/haida/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=tu-org/haida" />
</a>

---

## 📝 Changelog

Ver [SECURITY_CHANGELOG.md](./docs/SECURITY_CHANGELOG.md) para historial de cambios.

---

## 📞 Support

- **Documentation**: [/docs](./docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/tu-org/haida/issues)
- **Discord**: [Join our server] _(crear)*
- **Email**: support@haida.com _(configurar)*

---

## ⭐ Show Your Support

Si HAIDA te resulta útil, considera:
- ⭐ Dar una star en GitHub
- 🐛 Reportar bugs
- 💡 Sugerir features
- 🤝 Contribuir con código
- 📣 Compartir con tu equipo

---

## 📜 License

MIT © 2025 HAIDA Engineering Team

Ver [LICENSE](./LICENSE) para más detalles. _(crear archivo LICENSE)*

---

<div align="center">

**Hecho con ❤️ para QA Engineers**

[Website](https://haida.example.com) · [Documentation](./docs/README.md) · [GitHub](https://github.com/tu-org/haida)

</div>
