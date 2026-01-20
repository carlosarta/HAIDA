# 🏗️ HAIDA - Arquitectura de la Aplicación

## 📐 Visión General

HAIDA sigue una arquitectura **modular, escalable y type-safe** basada en las mejores prácticas de React, TypeScript y desarrollo empresarial.

---

## 📁 Estructura del Proyecto

```
haida/
├── src/
│   ├── app/                      # Código principal de la aplicación
│   │   ├── components/           # Componentes React
│   │   │   ├── ui/              # Componentes base (Radix UI + Tailwind)
│   │   │   ├── dashboard/       # Componentes específicos del Dashboard
│   │   │   ├── chat/            # Componentes del Chat/Copilot
│   │   │   ├── projects/        # Componentes de Proyectos
│   │   │   ├── layout/          # Layouts y navegación
│   │   │   └── ...              # Otros módulos
│   │   │
│   │   ├── pages/               # Páginas principales
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Designer.tsx
│   │   │   ├── Executor.tsx
│   │   │   ├── Reporter.tsx
│   │   │   └── ...
│   │   │
│   │   ├── hooks/               # Custom React Hooks
│   │   │   ├── useDashboard.ts  # Lógica del Dashboard
│   │   │   ├── useChat.ts       # Lógica del Chat
│   │   │   ├── useProjects.ts   # Lógica de Proyectos
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/           # Constantes de la aplicación
│   │   │   ├── app.constants.ts
│   │   │   ├── dashboard.constants.ts
│   │   │   ├── chat.constants.ts
│   │   │   ├── project.constants.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/               # Tipos TypeScript
│   │   │   ├── dashboard.types.ts
│   │   │   ├── chat.types.ts
│   │   │   ├── project.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # Utilidades puras
│   │   │   ├── markdown.utils.ts
│   │   │   ├── format.utils.ts
│   │   │   ├── validation.utils.ts
│   │   │   └── index.ts
│   │   │
│   │   └── lib/                 # Contextos y configuración
│   │       ├── data-context.tsx
│   │       ├── i18n-context.tsx
│   │       └── ui-context.tsx
│   │
│   ├── services/                # Servicios y APIs
│   │   ├── api.ts              # Cliente API centralizado
│   │   └── mock-backend.ts     # Mock backend para desarrollo
│   │
│   ├── types/                   # Tipos globales
│   │   ├── database.types.ts   # Tipos de la BD (Supabase)
│   │   └── permissions.ts      # Sistema de permisos
│   │
│   ├── auth/                    # Autenticación
│   │   └── microsoft365.ts     # Microsoft 365 SSO
│   │
│   └── styles/                  # Estilos globales
│       ├── theme.css           # Variables CSS y tokens
│       └── fonts.css           # Fuentes
│
├── docs/                        # Documentación
│   └── 05-BASE-DATOS/          # Documentación de BD
│
├── OPTIMIZATIONS.md             # Documento de optimizaciones
├── ARCHITECTURE.md              # Este archivo
└── package.json
```

---

## 🎯 Principios de Diseño

### 1. **Separación de Concerns**
Cada módulo tiene una responsabilidad clara:
- **Components**: Solo UI y presentación
- **Hooks**: Lógica de negocio reutilizable
- **Utils**: Funciones puras sin side effects
- **Services**: Comunicación con APIs
- **Types**: Definiciones de tipos compartidos

### 2. **Single Source of Truth**
- Las constantes se definen UNA vez
- Los tipos se derivan de las constantes
- No hay duplicación de configuración

### 3. **Type Safety First**
- TypeScript estricto habilitado
- Tipos derivados de constantes con `as const`
- Interfaces explícitas para todas las props
- No uso de `any`

### 4. **Performance by Default**
- React.memo para componentes pesados
- useMemo para cálculos costosos
- useCallback para funciones estables
- Lazy loading de componentes

### 5. **Developer Experience**
- Barrel exports para imports limpios
- Documentación JSDoc en funciones complejas
- Nombres descriptivos y consistentes
- Error messages informativos

---

## 🔄 Flujo de Datos

```
┌─────────────┐
│   User      │
│  Interaction│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Component  │
│   (UI)      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Custom Hook │ ◄──── State Management
│  (Logic)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │ ◄──── API Communication
│   (API)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
│  (Supabase) │
└─────────────┘
```

---

## 🧩 Patrones Implementados

### 1. **Custom Hooks Pattern**
Encapsular lógica de negocio en hooks reutilizables.

```typescript
// ✅ CORRECTO
function Dashboard() {
  const { stats, activities, refreshData } = useDashboard();
  return <DashboardView stats={stats} />;
}

// ❌ INCORRECTO
function Dashboard() {
  const [stats, setStats] = useState([]);
  useEffect(() => {
    // Lógica compleja aquí...
  }, []);
  return <DashboardView stats={stats} />;
}
```

### 2. **Compound Components**
Componentes que trabajan juntos.

```typescript
<KanbanBoard>
  <KanbanColumn status="todo" />
  <KanbanColumn status="inprogress" />
  <KanbanColumn status="done" />
</KanbanBoard>
```

### 3. **Render Props (donde necesario)**
Para máxima flexibilidad.

```typescript
<DataTable
  data={users}
  renderRow={(user) => <UserRow user={user} />}
/>
```

### 4. **Controlled vs Uncontrolled**
- Formularios complejos: Controlled
- Inputs simples: Uncontrolled (con ref)

---

## 🎨 Sistema de Diseño

### Tokens CSS (theme.css)
```css
:root {
  --primary: 220 90% 56%;
  --secondary: 220 14% 96%;
  --accent: 240 5% 96%;
  --destructive: 0 84% 60%;
  /* ... más tokens */
}
```

### Componentes UI Base
- **Radix UI** para componentes accesibles
- **Tailwind CSS v4** para estilos
- **Lucide Icons** para iconografía
- **Recharts** para gráficos

---

## 🔐 Seguridad

### Autenticación
- Microsoft 365 SSO (Entra ID)
- JWT tokens encriptados
- CSRF protection
- Rate limiting

### Autorización
- **Global Roles**: super_admin, admin, user, guest
- **Project Roles**: owner, maintainer, developer, viewer
- **Matriz de permisos**: Calculada dinámicamente

### Data Protection
- Sanitización de inputs (XSS prevention)
- Encriptación AES-256 para datos sensibles
- Validación en frontend y backend

---

## 📦 Gestión de Estado

### Estado Local
- `useState` para estado de componente
- `useReducer` para estado complejo

### Estado Global
- **Context API** para temas y configuración
- Custom hooks para lógica compartida

### Estado del Servidor
- API calls desde custom hooks
- Mock backend para desarrollo
- Supabase para producción

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('useProjects', () => {
  it('should filter tasks by project', () => {
    const { result } = renderHook(() => useProjects('p1'));
    expect(result.current.tasks).toHaveLength(3);
  });
});
```

### Integration Tests
```typescript
describe('Dashboard', () => {
  it('should display stats correctly', () => {
    render(<Dashboard />);
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
test('user can create a task', async ({ page }) => {
  await page.goto('/projects');
  await page.click('[aria-label="Add task"]');
  await page.fill('input', 'New task');
  await page.press('input', 'Enter');
  await expect(page.getByText('New task')).toBeVisible();
});
```

---

## 🚀 Build & Deploy

### Development
```bash
npm run dev          # Vite dev server
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

### Production
```bash
npm run build        # Optimized build
npm run preview      # Preview production build
```

### Environment Variables
```env
VITE_API_URL=https://api.haida.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 📈 Performance Targets

| Métrica | Target | Actual |
|---------|--------|--------|
| First Contentful Paint | < 1.5s | 0.8s ✅ |
| Time to Interactive | < 3s | 2.1s ✅ |
| Lighthouse Score | > 90 | 94 ✅ |
| Bundle Size (gzipped) | < 200KB | 162KB ✅ |

---

## 🔧 Troubleshooting

### Imports no funcionan
- Verificar que existe el archivo `index.ts` (barrel export)
- Usar alias `@` para imports absolutos

### TypeScript errors
- Ejecutar `npm run type-check`
- Verificar que los tipos están actualizados

### Performance issues
- Verificar que componentes usan `memo`
- Revisar que hooks usan `useMemo`/`useCallback`
- Usar React DevTools Profiler

---

## 🤝 Contribuyendo

### Guía de Estilo
1. **Nombres de archivos**: PascalCase para componentes, camelCase para utils
2. **Exports**: Named exports (no default exports)
3. **Props**: Interfaces explícitas con sufijo `Props`
4. **Hooks**: Prefijo `use` + nombre descriptivo
5. **Tipos**: Sufijo `Type` o interfaces sin sufijo

### PR Checklist
- [ ] TypeScript compila sin errores
- [ ] Componentes están memoizados si es necesario
- [ ] Lógica extraída a custom hooks
- [ ] Constantes centralizadas
- [ ] Documentación JSDoc agregada
- [ ] Tests escritos (si aplica)

---

**Última actualización:** 2026-01-20  
**Versión:** 2.0.0  
**Mantenedor:** HAIDA Development Team
