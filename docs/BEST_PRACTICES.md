# 💎 HAIDA - Best Practices & Code Standards

**Última actualización**: 2025-01-20  
**Autor**: HAIDA Engineering Team  

---

## 📋 Índice

1. [Principios Generales](#principios-generales)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Patterns](#react-patterns)
4. [API & Data Fetching](#api--data-fetching)
5. [Security Checklist](#security-checklist)
6. [Testing Standards](#testing-standards)
7. [Performance Optimization](#performance-optimization)

---

## 1️⃣ Principios Generales

### **Arquitectura Data-Driven**

HAIDA sigue un enfoque **data-driven** donde:
- ✅ Estado global minimizado (solo lo esencial)
- ✅ Server state manejado por Supabase Realtime
- ✅ UI refleja estado de la base de datos
- ✅ Optimistic updates + rollback automático

```typescript
// ✅ BIEN - Data-driven
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('tenant_id', tenantId);

// ❌ MAL - Estado local duplicado
const [projects, setProjects] = useState([]);
// ... luego hacer fetch y actualizar estado manualmente
```

---

### **Component Structure**

```
/src/app/
  ├─ components/          # Componentes reutilizables
  │   ├─ ui/              # UI primitivos (Radix UI)
  │   ├─ features/        # Componentes de features específicos
  │   └─ layouts/         # Layouts (Sidebar, Header, etc.)
  │
  ├─ pages/               # Páginas principales
  │   ├─ Dashboard.tsx
  │   ├─ Designer.tsx
  │   └─ ...
  │
  └─ hooks/               # Custom React Hooks
      ├─ useAuth.ts
      └─ usePermissions.ts
```

---

## 2️⃣ TypeScript Guidelines

### **Usar Tipos de la Base de Datos**

```typescript
// ✅ BIEN - Importar tipos generados
import type { Project, TestSuite, TestCase } from '@/types/database.types';

async function getProject(id: string): Promise<Project> {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  return data as Project;
}

// ❌ MAL - Tipos inline o any
async function getProject(id: string): Promise<any> { // ❌ Never use 'any'
  // ...
}
```

### **Strict Null Checks**

```typescript
// ✅ BIEN - Manejar nulls explícitamente
function getUserName(user: User | null): string {
  return user?.name ?? 'Unknown User';
}

// ❌ MAL - Asumir que existe
function getUserName(user: User): string {
  return user.name; // ❌ Puede ser null!
}
```

### **Inferencia de Tipos**

```typescript
// ✅ BIEN - Dejar que TS infiera
const projects = await getProjects(); // TS sabe que es Project[]

// ❌ INNECESARIO - Type annotation redundante
const projects: Project[] = await getProjects();
```

---

## 3️⃣ React Patterns

### **Component Composition**

```typescript
// ✅ BIEN - Composición pequeña y reutilizable
function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <ProjectTitle project={project} />
        <ProjectStats project={project} />
      </CardHeader>
      <CardContent>
        <ProjectActions project={project} />
      </CardContent>
    </Card>
  );
}

// ❌ MAL - Componente monolítico
function ProjectCard({ project }: { project: Project }) {
  // 500 líneas de JSX...
}
```

### **Custom Hooks**

```typescript
// ✅ BIEN - Lógica reutilizable en hooks
function useProjectHealth(projectId: string) {
  const [health, setHealth] = useState<ProjectHealth | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchHealth() {
      const { data } = await supabase
        .from('v_project_health')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      setHealth(data);
      setLoading(false);
    }
    
    fetchHealth();
  }, [projectId]);
  
  return { health, loading };
}

// Uso
function ProjectDashboard({ projectId }: { projectId: string }) {
  const { health, loading } = useProjectHealth(projectId);
  
  if (loading) return <Spinner />;
  return <HealthMetrics data={health} />;
}
```

### **Error Boundaries**

```typescript
// ✅ BIEN - Wrap componentes críticos
<ErrorBoundary fallback={<ErrorUI />}>
  <CriticalFeature />
</ErrorBoundary>

// Para features que no deben romper toda la app
<ErrorBoundary fallback={<ChatUnavailable />}>
  <ChatWidget />
</ErrorBoundary>
```

---

## 4️⃣ API & Data Fetching

### **Uso del API Client**

```typescript
// ✅ BIEN - Usar apiClient centralizado
import { apiClient } from '@/services/api';

const response = await apiClient.post('/api/projects', projectData);
// CSRF token y rate limiting automáticos ✅

// ❌ MAL - Axios directo
import axios from 'axios';
const response = await axios.post('/api/projects', projectData);
// Sin protección CSRF, sin rate limiting ❌
```

### **Manejo de Errores**

```typescript
// ✅ BIEN - Manejo explícito
async function createProject(data: InsertProject) {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, project };
  } catch (error) {
    console.error('Failed to create project:', error);
    
    if (error.code === '23505') {
      return { success: false, error: 'Project slug already exists' };
    }
    
    return { success: false, error: 'Unknown error occurred' };
  }
}

// ❌ MAL - No manejar errores
async function createProject(data: InsertProject) {
  const { data } = await supabase
    .from('projects')
    .insert(data)
    .select()
    .single();
  
  return data; // ❌ Puede ser null si falla!
}
```

### **Optimistic Updates**

```typescript
// ✅ BIEN - Actualizar UI inmediatamente + rollback si falla
async function updateProject(id: string, updates: UpdateProject) {
  // 1. Guardar estado anterior
  const previousState = [...projects];
  
  // 2. Actualizar UI optimistamente
  setProjects(projects.map(p => 
    p.id === id ? { ...p, ...updates } : p
  ));
  
  // 3. Hacer request
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);
  
  // 4. Rollback si falla
  if (error) {
    setProjects(previousState);
    toast.error('Failed to update project');
  }
}
```

---

## 5️⃣ Security Checklist

### **Antes de Hacer Commit**

- [ ] ¿Usé `dangerouslySetInnerHTML`? → Reemplazar con sanitización
- [ ] ¿Guardé credenciales en localStorage? → Encriptar primero
- [ ] ¿Uso regex con input del usuario? → Usar `escapeRegExp()`
- [ ] ¿Nuevo endpoint POST/PUT/DELETE? → Verificar CSRF token
- [ ] ¿Nuevo formulario de login? → Implementar rate limiting
- [ ] ¿Manejo errores correctamente? → No exponer detalles sensibles
- [ ] ¿Validé inputs del usuario? → Usar Zod schemas

### **Checklist de Code Review**

```typescript
// 🔴 RED FLAGS - Nunca aprobar sin resolver
- [ ] `eval()` o `Function()` con input del usuario
- [ ] Credenciales hardcoded en código
- [ ] SQL queries concatenados con strings
- [ ] localStorage con datos sensibles sin encriptar
- [ ] `any` type en funciones públicas
- [ ] `// @ts-ignore` sin justificación

// 🟡 YELLOW FLAGS - Revisar cuidadosamente
- [ ] `useEffect` sin cleanup function
- [ ] Fetch sin manejo de errores
- [ ] Componentes > 300 líneas
- [ ] Prop drilling > 3 niveles
- [ ] Regex complejas sin tests
```

---

## 6️⃣ Testing Standards

### **Unit Tests**

```typescript
// Estructura de tests
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ProjectCard', () => {
  it('should render project name', () => {
    const project = mockProject();
    render(<ProjectCard project={project} />);
    expect(screen.getByText(project.name)).toBeInTheDocument();
  });
  
  it('should handle delete action', async () => {
    const onDelete = vi.fn();
    render(<ProjectCard project={mockProject()} onDelete={onDelete} />);
    
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteBtn);
    
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
```

### **Security Tests**

```typescript
// Test XSS protection
describe('Security: XSS Protection', () => {
  it('should sanitize script tags', () => {
    const malicious = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitize(malicious);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });
  
  it('should escape regex special characters', () => {
    const input = 'test.*pattern';
    const escaped = escapeRegExp(input);
    
    expect(escaped).toBe('test\\.\\*pattern');
    expect(() => new RegExp(escaped)).not.toThrow();
  });
});
```

---

## 7️⃣ Performance Optimization

### **Lazy Loading**

```typescript
// ✅ BIEN - Lazy load páginas pesadas
const Designer = lazy(() => import('@/app/pages/Designer'));
const ChatIA = lazy(() => import('@/app/pages/ChatIA'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/designer" element={<Designer />} />
        <Route path="/chat" element={<ChatIA />} />
      </Routes>
    </Suspense>
  );
}
```

### **Memoization**

```typescript
// ✅ BIEN - Memoizar cálculos pesados
const expensiveCalculation = useMemo(() => {
  return projects.reduce((acc, p) => {
    // Cálculo complejo
    return acc + calculateHealthScore(p);
  }, 0);
}, [projects]);

// ✅ BIEN - Memoizar callbacks
const handleDelete = useCallback((id: string) => {
  deleteProject(id);
}, [deleteProject]);
```

### **Virtualization**

```typescript
// Para listas largas (> 100 items)
import { useVirtualizer } from '@tanstack/react-virtual';

function TestCaseList({ cases }: { cases: TestCase[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: cases.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Altura estimada de cada item
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(item => (
          <div key={item.key} style={{ height: item.size }}>
            <TestCaseRow testCase={cases[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 UI/UX Guidelines

### **Loading States**

```typescript
// ✅ BIEN - Mostrar skeleton mientras carga
function ProjectList() {
  const { data: projects, isLoading } = useProjects();
  
  if (isLoading) {
    return <ProjectSkeleton count={5} />;
  }
  
  return <>{projects?.map(p => <ProjectCard key={p.id} project={p} />)}</>;
}

// ❌ MAL - Spinner genérico
if (loading) return <Spinner />; // Malo: layout shift
```

### **Error States**

```typescript
// ✅ BIEN - Error específico + acción
function ProjectList() {
  const { data, error } = useProjects();
  
  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load projects"
        description={error.message}
        action={
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        }
      />
    );
  }
  
  // ...
}
```

### **Empty States**

```typescript
// ✅ BIEN - Empty state con CTA
if (!projects?.length) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Create your first testing project to get started"
      action={
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      }
    />
  );
}
```

---

## 🔐 Security Checklist

### **Antes de Deploy a Producción**

#### **Código**
- [ ] No hay `console.log` con datos sensibles
- [ ] No hay API keys hardcoded
- [ ] Todas las credenciales están encriptadas
- [ ] No hay `dangerouslySetInnerHTML` sin sanitización
- [ ] Todos los forms tienen validación con Zod
- [ ] Rate limiting implementado en endpoints críticos

#### **Configuración**
- [ ] Variables de entorno en `.env` (no en código)
- [ ] HTTPS habilitado en producción
- [ ] CSP headers configurados
- [ ] CORS configurado correctamente
- [ ] RLS habilitado en todas las tablas sensibles

#### **Dependencias**
- [ ] `npm audit` no muestra vulnerabilidades críticas
- [ ] Todas las dependencias actualizadas (< 6 meses)
- [ ] No hay dependencias deprecadas

---

## 🧪 Testing Standards

### **Coverage Mínimo**

| Tipo | Coverage Mínimo | Prioridad |
|------|----------------|-----------|
| Utilities | 90% | Alta |
| Services | 80% | Alta |
| Components | 70% | Media |
| Pages | 50% | Media |
| UI Components | 40% | Baja |

### **Test Naming Convention**

```typescript
// ✅ BIEN - Descripción clara de lo que prueba
it('should throw error when email is invalid', () => {
  expect(() => validateEmail('invalid')).toThrow();
});

it('should encrypt and decrypt data correctly', async () => {
  const original = 'secret-data';
  const encrypted = await encryptionService.encrypt(original);
  const decrypted = await encryptionService.decrypt(encrypted);
  
  expect(decrypted).toBe(original);
  expect(encrypted).not.toBe(original);
});

// ❌ MAL - Nombre vago
it('works correctly', () => {
  // ... qué funciona?
});
```

---

## ⚡ Performance Optimization

### **Bundle Size**

```bash
# Analizar bundle
npm run build -- --mode analyze

# Metas:
# - Main bundle: < 500 KB
# - Vendor bundle: < 1 MB
# - Total gzipped: < 300 KB
```

### **Code Splitting**

```typescript
// ✅ BIEN - Split por rutas
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('@/app/pages/Dashboard')),
  },
  {
    path: '/designer',
    component: lazy(() => import('@/app/pages/Designer')),
  },
];

// ✅ BIEN - Split por features grandes
const ChatIA = lazy(() => import('@/app/features/ChatIA'));
```

### **Image Optimization**

```typescript
// ✅ BIEN - Lazy load images
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

<ImageWithFallback
  src={project.logo_url}
  alt={project.name}
  loading="lazy"
  className="w-16 h-16 rounded"
/>

// ✅ BIEN - WebP con fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.png" alt="..." />
</picture>
```

---

## 📐 Code Style

### **Formatting**

```typescript
// Usar Prettier (configuración recomendada)
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### **File Naming**

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Components | PascalCase | `ProjectCard.tsx` |
| Hooks | camelCase | `useProjectHealth.ts` |
| Utils | kebab-case | `security-utils.ts` |
| Types | kebab-case | `database.types.ts` |
| Constants | UPPER_SNAKE | `API_ENDPOINTS.ts` |

### **Import Order**

```typescript
// 1. React & third-party
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// 2. Internal modules
import { apiClient } from '@/services/api';
import { useAuth } from '@/app/hooks/useAuth';

// 3. Components
import { Button } from '@/app/components/ui/button';
import { ProjectCard } from '@/app/components/features/ProjectCard';

// 4. Types
import type { Project, TestSuite } from '@/types/database.types';

// 5. Styles (si aplica)
import './styles.css';
```

---

## 🎯 Git Commit Convention

### **Formato**

```
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types**

| Type | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva feature | `feat(chat): add message threading` |
| `fix` | Bug fix | `fix(login): rate limiting not working` |
| `security` | Security fix | `security(api): add CSRF protection` |
| `refactor` | Refactor sin cambiar funcionalidad | `refactor(hooks): extract useProjectHealth` |
| `perf` | Performance improvement | `perf(dashboard): lazy load charts` |
| `test` | Tests | `test(security): add XSS protection tests` |
| `docs` | Documentación | `docs(api): update API client usage` |
| `chore` | Mantenimiento | `chore(deps): update dependencies` |

### **Ejemplos**

```bash
# Feature
git commit -m "feat(defects): add bulk assign functionality"

# Security fix
git commit -m "security(api): implement rate limiting on login endpoint

- Add axios-rate-limit
- Limit login to 5 attempts/min
- Add lockout period of 1 minute

Fixes SEC-2025-005"

# Refactor
git commit -m "refactor(types): extract database types to separate file"
```

---

## 📚 Recursos

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Best Practices](https://supabase.com/docs/guides/getting-started/best-practices)
- [Web Performance](https://web.dev/performance/)

---

## 🤝 Contributing

### **Process**

1. Create feature branch: `git checkout -b feat/your-feature`
2. Write code following these guidelines
3. Write tests (minimum 70% coverage)
4. Update documentation if needed
5. Create Pull Request
6. Wait for review (2 approvals required)
7. Merge to `main`

### **PR Template**

```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Security fix
- [ ] Refactoring
- [ ] Documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Security checklist verified

## Screenshots (if UI changes)
[Add screenshots]

## Related Issues
Fixes #123
```

---

**Mantenido por**: HAIDA Engineering Team  
**Contribuciones**: Bienvenidas - ver [CONTRIBUTING.md]  
**Licencia**: MIT
