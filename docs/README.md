# 📚 HAIDA - Documentación

**Plataforma de QA Empresarial con React, Radix UI y Supabase**

---

## 🎯 Inicio Rápido

¿Primera vez usando HAIDA? Empieza aquí:

**→ [Quick Start Guide](./QUICK_START.md)** ⚡  
_10 minutos para tu primer proyecto y test suite_

---

## 📖 Documentación Principal

### **🏗️ Arquitectura y Diseño**

| Documento | Descripción | Nivel |
|-----------|-------------|-------|
| [Database Diagram](../HAIDA_DATABASE_DIAGRAM.md) | Diagrama ER en Mermaid + resumen de relaciones | 🟢 Beginner |
| [Database Relations Guide](../DATABASE_RELATIONS_GUIDE.md) | Guía detallada de relaciones y flujos | 🟡 Intermediate |
| [Database Guide](./DATABASE_GUIDE.md) | Queries comunes, migraciones, troubleshooting | 🟡 Intermediate |
| [Security Architecture](./SECURITY_ARCHITECTURE.md) | Capas de seguridad, amenazas mitigadas | 🔴 Advanced |

---

### **💻 Para Desarrolladores**

| Documento | Descripción | Nivel |
|-----------|-------------|-------|
| [Best Practices](./BEST_PRACTICES.md) | Code standards, patterns, guidelines | 🟡 Intermediate |
| [API Reference](./API_REFERENCE.md) | REST API endpoints, types, ejemplos | 🟢 Beginner |
| [TypeScript Types](../src/types/database.types.ts) | Tipos generados desde PostgreSQL | 🟡 Intermediate |

---

### **🔒 Seguridad**

| Documento | Descripción | Nivel |
|-----------|-------------|-------|
| [Security Changelog](./SECURITY_CHANGELOG.md) | Log de vulnerabilidades y fixes | 🟢 Beginner |
| [Security Architecture](./SECURITY_ARCHITECTURE.md) | Implementaciones detalladas | 🔴 Advanced |

---

## 🗂️ Estructura del Proyecto

```
haida/
├─ docs/                              # 📚 Esta carpeta
│   ├─ README.md                      # Índice de documentación
│   ├─ QUICK_START.md                 # Guía de inicio rápido
│   ├─ DATABASE_GUIDE.md              # Guía de base de datos
│   ├─ SECURITY_ARCHITECTURE.md       # Arquitectura de seguridad
│   ├─ SECURITY_CHANGELOG.md          # Changelog de seguridad
│   ├─ API_REFERENCE.md               # Referencia de API
│   └─ BEST_PRACTICES.md              # Best practices
│
├─ src/
│   ├─ app/
│   │   ├─ components/                # Componentes React
│   │   │   ├─ ui/                    # Radix UI components (47+)
│   │   │   ├─ features/              # Feature-specific components
│   │   │   ├─ layouts/               # Layouts (Sidebar, etc.)
│   │   │   └─ ErrorBoundary.tsx      # Global error handling
│   │   │
│   │   ├─ pages/                     # Páginas principales
│   │   │   ├─ Dashboard.tsx
│   │   │   ├─ Designer.tsx
│   │   │   ├─ ChatIA.tsx
│   │   │   ├─ Login.tsx
│   │   │   └─ ...
│   │   │
│   │   ├─ hooks/                     # Custom hooks
│   │   └─ App.tsx                    # Root component
│   │
│   ├─ services/                      # API Clients
│   │   ├─ api.ts                     # Main API client (CSRF + Rate Limiting)
│   │   ├─ encryption-service.ts      # AES-256 encryption
│   │   ├─ telegram-api.ts            # Telegram bot API
│   │   ├─ jira-api.ts                # Jira integration
│   │   └─ confluence-api.ts          # Confluence integration
│   │
│   ├─ lib/                           # Utilities
│   │   └─ security-utils.ts          # XSS, CSRF, ReDoS protection
│   │
│   ├─ types/                         # TypeScript types
│   │   ├─ database.types.ts          # Generated from PostgreSQL
│   │   └─ permissions.ts             # RBAC types
│   │
│   └─ styles/                        # CSS
│       ├─ theme.css                  # Tailwind v4 theme
│       └─ fonts.css                  # Font imports
│
├─ HAIDA_DATABASE_DIAGRAM.md          # Diagrama ER visual
├─ DATABASE_RELATIONS_GUIDE.md        # Guía de relaciones
├─ haida_schema.sql                   # DDL completo exportado
├─ remediation.sql                    # Script de RLS policies
├─ INVENTORY.md                       # Inventario de objetos DB
└─ Guidelines.md                      # Guidelines del proyecto
```

---

## 🔑 Conceptos Clave

### **1. Multi-Tenancy**

HAIDA es **multi-tenant** por diseño:
- Cada **Tenant** = Una organización
- Usuarios pueden pertenecer a múltiples tenants
- Datos aislados con **Row Level Security (RLS)**

```typescript
// Usuario en múltiples tenants
{
  user_id: "uuid",
  tenants: [
    { tenant_id: "tenant-1", role: "admin" },
    { tenant_id: "tenant-2", role: "viewer" },
  ]
}
```

---

### **2. Sistema de Permisos Híbrido**

```
Permisos Efectivos = 
  Global Role (admin, qa_engineer, tester, etc.)
  + Tenant Role (owner, admin, editor, viewer)
  + Project Role (owner, maintainer, contributor, viewer)
```

**Ejemplos**:
- `admin` global + `viewer` en proyecto = Puede editar (admin prevalece)
- `tester` global + `owner` en proyecto = Puede gestionar ese proyecto
- `viewer` global + ningún role en proyecto = Solo lectura

Ver: [Permissions System](../src/types/permissions.ts)

---

### **3. Data-Driven Architecture**

- **NO hay estado global masivo** (Redux, Zustand, etc.)
- **Server state** manejado por Supabase Realtime
- **Optimistic updates** con rollback automático
- **UI = Reflejo del estado de la DB**

```typescript
// ✅ CORRECTO - Data-driven
const { data: projects } = await supabase
  .from('projects')
  .select('*');

// ❌ INCORRECTO - Estado local duplicado
const [projects, setProjects] = useState([]);
useEffect(() => {
  fetch('/api/projects').then(setProjects);
}, []);
```

---

## 🧰 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React | 18.3.1 |
| **UI Library** | Radix UI | Latest |
| **Styling** | Tailwind CSS | 4.1.12 |
| **Forms** | React Hook Form + Zod | 7.55.0 |
| **Icons** | Lucide React | 0.487.0 |
| **Charts** | Recharts | 2.15.2 |
| **Backend** | Supabase | Latest |
| **Database** | PostgreSQL | 15+ |
| **Auth** | Supabase Auth + Azure SSO | - |
| **Deployment** | Figma Make | - |

**Componentes Radix UI** (47+):
- Accordion, AlertDialog, Avatar, Button, Card, Checkbox, Collapsible, ContextMenu, Dialog, DropdownMenu, HoverCard, Label, Menubar, NavigationMenu, Popover, Progress, RadioGroup, ScrollArea, Select, Separator, Slider, Switch, Tabs, Toggle, Tooltip

---

## 🔐 Seguridad

HAIDA implementa **defensa en profundidad** con:

✅ **Encriptación**: AES-256-GCM para credenciales  
✅ **CSRF Protection**: Tokens automáticos en POST/PUT/DELETE  
✅ **XSS Prevention**: DOMPurify + safe components  
✅ **Rate Limiting**: 100 req/min global, 5 login attempts/min  
✅ **ReDoS Protection**: Escape de regex patterns  
✅ **Error Handling**: ErrorBoundary global  
✅ **RLS**: Row Level Security en PostgreSQL  

Ver: [Security Architecture](./SECURITY_ARCHITECTURE.md)

---

## 📊 Features Principales

### **✅ Implementado**

- [x] **Multi-tenancy** con RLS
- [x] **RBAC** (Global + Tenant + Project roles)
- [x] **SSO Microsoft 365** con Azure AD
- [x] **Test Designer** con Postman/Jira import
- [x] **Change Detection** con webhooks
- [x] **Test Execution** tracking
- [x] **Defect Management** con Jira sync
- [x] **Chat IA** (Copilot-style) con contexto
- [x] **Telegram Bot** (22 comandos)
- [x] **Wiki** con jerarquía de documentación
- [x] **Reportes** con Allure/Playwright
- [x] **Feature Flags** (Global + Tenant + User)
- [x] **Rate Limiting** + Security hardening
- [x] **47+ UI Components** con Radix UI

### **🚧 En Desarrollo**

- [ ] Mobile app (React Native)
- [ ] CI/CD integration (GitHub Actions, GitLab CI)
- [ ] Advanced analytics con ML
- [ ] Multi-language support (i18n)
- [ ] Plugin system para extensiones

---

## 🎓 Tutoriales

### **Para QA Engineers**

1. [Crear tu primer proyecto](./tutorials/CREATE_PROJECT.md) _(próximamente)_
2. [Importar tests desde Postman](./tutorials/IMPORT_POSTMAN.md) _(próximamente)_
3. [Configurar Change Detection](./tutorials/CHANGE_DETECTION.md) _(próximamente)_
4. [Trackear defectos eficientemente](./tutorials/DEFECT_TRACKING.md) _(próximamente)_

### **Para Developers**

1. [Extender la API](./tutorials/EXTEND_API.md) _(próximamente)_
2. [Crear componentes UI custom](./tutorials/CREATE_COMPONENTS.md) _(próximamente)_
3. [Implementar nuevas integraciones](./tutorials/NEW_INTEGRATIONS.md) _(próximamente)_
4. [Testing & CI/CD](./tutorials/TESTING_CICD.md) _(próximamente)_

---

## 🤝 Contributing

¿Quieres contribuir? ¡Genial! Lee:

1. [Code of Conduct](./CODE_OF_CONDUCT.md) _(próximamente)_
2. [Contributing Guide](./CONTRIBUTING.md) _(próximamente)_
3. [Development Setup](./DEV_SETUP.md) _(próximamente)_

---

## 📜 Licencia

MIT License - Ver [LICENSE](../LICENSE) _(próximamente)_

---

## 📈 Roadmap

### **Q1 2025** (Enero - Marzo)
- [x] ✅ Auditoría de seguridad completa
- [x] ✅ Mapeo completo de base de datos
- [ ] 🚧 Tests E2E con Playwright
- [ ] 🚧 CI/CD pipeline

### **Q2 2025** (Abril - Junio)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Performance monitoring

### **Q3 2025** (Julio - Septiembre)
- [ ] Plugin system
- [ ] Marketplace de integraciones
- [ ] Enterprise SSO (SAML, Okta)
- [ ] Advanced reporting con ML

---

## 🏆 Créditos

**Desarrollado por**: HAIDA Engineering Team  
**Contribuidores**: [Ver lista completa](./CONTRIBUTORS.md) _(próximamente)_  
**Patrocinadores**: [Become a sponsor](https://github.com/sponsors/haida) _(próximamente)_

---

## 📞 Contacto

- **Website**: https://haida.example.com _(placeholder)*
- **GitHub**: https://github.com/tu-org/haida
- **Email**: hello@haida.com *(configurar)*
- **Discord**: [Join our community] *(crear)*
- **Twitter**: @haida_qa *(crear)*

---

**Última actualización**: 2025-01-20  
**Versión de Documentación**: 1.0.0  
**Mantenido por**: HAIDA Engineering Team
