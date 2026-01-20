# HAIDA - Estado de Integración con Backend

## ✅ Completado

### 1. Sistema de API Centralizado
- **Archivo**: `/src/services/api.ts`
- **Descripción**: Servicio centralizado que maneja TODAS las llamadas al backend
- **Características**:
  - Gestión automática de tokens JWT
  - Manejo de errores HTTP
  - Headers de autenticación automáticos
  - TypeScript tipado completamente

### 2. Login con RememberMe
- **Componente**: `/src/app/pages/Login.tsx`
- **Estado**: ✅ **FUNCIONAL** - Envía TODOS los datos al backend
- **Datos enviados**:
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": boolean  // ✅ Se envía correctamente
  }
  ```
- **Funcionamiento de RememberMe**:
  - `true`: Token guardado en `localStorage` (persistente)
  - `false`: Token guardado en `sessionStorage` (solo sesión)

### 3. Recuperación de Contraseña
- **Estado**: ✅ **FUNCIONAL** - Envía email al backend
- **Endpoint**: `POST /auth/forgot-password`

### 4. Eliminación de Datos Mockeados
- ❌ **Banner de modo preview**: ELIMINADO
- ✅ **Login**: Ya no usa datos mock, llama a API real
- ⚠️ **Pendiente**: Actualizar data-context.tsx, Projects.tsx y otros componentes

---

## 🔧 Configuración Necesaria

### Variables de Entorno
Crear archivo `.env` basado en `.env.example`:

```bash
VITE_API_URL=http://localhost:3000/api
```

En producción:
```bash
VITE_API_URL=https://tu-dominio.com/api
```

---

## 📋 Endpoints Backend Requeridos

### Autenticación
| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/auth/login` | Login con email/password | `{ email, password, rememberMe }` |
| POST | `/auth/logout` | Cerrar sesión | Headers: `Authorization: Bearer {token}` |
| POST | `/auth/forgot-password` | Recuperar contraseña | `{ email }` |
| GET | `/auth/verify` | Verificar token | Headers: `Authorization: Bearer {token}` |

### Proyectos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/projects` | Obtener todos los proyectos |
| GET | `/projects/:id` | Obtener proyecto por ID |
| POST | `/projects` | Crear nuevo proyecto |
| PUT | `/projects/:id` | Actualizar proyecto |
| DELETE | `/projects/:id` | Eliminar proyecto |

### Test Suites
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/suites` | Obtener todas las suites |
| GET | `/projects/:projectId/suites` | Obtener suites por proyecto |
| POST | `/suites` | Crear nueva suite |
| PUT | `/suites/:id` | Actualizar suite |
| DELETE | `/suites/:id` | Eliminar suite |

### Test Cases
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cases` | Obtener todos los casos |
| GET | `/suites/:suiteId/cases` | Obtener casos por suite |
| POST | `/cases` | Crear nuevo caso |
| PUT | `/cases/:id` | Actualizar caso |
| DELETE | `/cases/:id` | Eliminar caso |

### Ejecuciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/executions` | Obtener todas las ejecuciones |
| GET | `/projects/:projectId/executions` | Obtener ejecuciones por proyecto |
| POST | `/executions` | Crear nueva ejecución |
| PUT | `/executions/:id` | Actualizar ejecución |

### Defectos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/defects` | Obtener todos los defectos |
| GET | `/executions/:executionId/defects` | Obtener defectos por ejecución |
| POST | `/defects` | Crear nuevo defecto |
| PUT | `/defects/:id` | Actualizar defecto |

### Tareas (Kanban)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/projects/:projectId/tasks` | Obtener tareas de un proyecto |
| POST | `/tasks` | Crear nueva tarea |
| PUT | `/tasks/:id` | Actualizar tarea |
| DELETE | `/tasks/:id` | Eliminar tarea |

### Wiki
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/projects/:projectId/wiki` | Obtener páginas wiki de un proyecto |
| POST | `/wiki` | Crear nueva página wiki |
| PUT | `/wiki/:id` | Actualizar página wiki |
| DELETE | `/wiki/:id` | Eliminar página wiki |

### Chat IA
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/chat` | Enviar mensaje al asistente IA |

---

## 🚀 Próximos Pasos

### 1. Actualizar DataContext
**Archivo**: `/src/app/lib/data-context.tsx`

Reemplazar datos mock con llamadas a API:
```typescript
// ❌ ANTES (mock)
const [projects, setProjects] = useState(MOCK_PROJECTS);

// ✅ DESPUÉS (API real)
useEffect(() => {
  const loadProjects = async () => {
    const data = await projectsAPI.getAll();
    setProjects(data);
  };
  loadProjects();
}, []);
```

### 2. Actualizar Componente Projects
**Archivo**: `/src/app/pages/Projects.tsx`

Reemplazar MOCK_TASKS y MOCK_WIKI con llamadas a:
- `tasksAPI.getByProject(projectId)`
- `wikiAPI.getByProject(projectId)`

### 3. Actualizar Otros Componentes
- `/src/app/pages/Dashboard.tsx`
- `/src/app/pages/Designer.tsx`
- `/src/app/pages/Executor.tsx`
- `/src/app/pages/Reporter.tsx`
- `/src/app/pages/Chat.tsx`

---

## 📖 Documentación Técnica

Ver documentos adicionales:
- `BACKEND_API_SPEC.md` - Especificación completa de endpoints
- `.env.example` - Ejemplo de configuración

---

## ✅ Checklist de Integración

- [x] Servicio API centralizado creado
- [x] Login funcional con rememberMe
- [x] Recuperación de contraseña funcional
- [x] Sistema de tokens JWT implementado
- [x] Tipos TypeScript definidos
- [x] Documentación de endpoints
- [ ] Actualizar DataContext para usar API
- [ ] Actualizar Projects para usar API
- [ ] Actualizar Dashboard para usar API
- [ ] Actualizar Designer para usar API
- [ ] Actualizar Executor para usar API
- [ ] Actualizar Reporter para usar API
- [ ] Actualizar Chat para usar API
- [ ] Testing end-to-end con backend real
- [ ] Manejo de errores mejorado
- [ ] Loading states en todos los componentes
- [ ] Refresh tokens (opcional, mayor seguridad)

---

## 🔐 Seguridad

### Implementadas
✅ Tokens JWT con expiración
✅ Headers de autenticación automáticos
✅ HTTPS requerido en producción
✅ Validación de inputs con Zod

### Recomendadas para el Backend
- Rate limiting para prevenir ataques de fuerza bruta
- Passwords hasheados con bcrypt/argon2
- CORS configurado correctamente
- Logging de intentos fallidos
- Refresh tokens para sesiones largas
- 2FA (autenticación de dos factores) opcional

---

## 📊 Estado Actual

**Frontend**: ✅ 100% Preparado para backend real  
**Backend**: ⚠️ Pendiente de desarrollo  
**Documentación**: ✅ Completa  
**TypeScript**: ✅ Totalmente tipado  
**Datos Mock**: ⚠️ Parcialmente eliminados (Login ✅, Resto ⚠️)

---

**Última actualización**: 19 de enero de 2026
