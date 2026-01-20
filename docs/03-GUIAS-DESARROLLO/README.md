# 🛠️ 03 - Guías de Desarrollo

**Cómo desarrollar nuevas features en HAIDA**

---

## **📚 Tabla de Contenidos**

1. [Setup del Entorno](#setup-del-entorno)
2. [Crear un Feature Nuevo](#crear-un-feature-nuevo)
3. [Componentes UI](#componentes-ui)
4. [API Integration](#api-integration)
5. [Base de Datos](#base-de-datos)
6. [Testing](#testing)
7. [Code Review Checklist](#code-review-checklist)

---

## **Setup del Entorno**

### **Prerequisitos**
- Node.js 18+ o 20+
- npm o pnpm
- Git
- VS Code (recomendado)

### **VS Code Extensions Recomendadas**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "Prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### **Instalación**

```bash
# 1. Clonar repo
git clone https://github.com/your-org/haida.git
cd haida

# 2. Instalar dependencias
npm install

# 3. Copiar .env
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales
# (Supabase, Azure AD, etc.)

# 5. Iniciar dev server
npm run dev
```

### **Estructura de .env.local**

```bash
# Supabase
VITE_SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Microsoft 365 SSO
VITE_MSAL_CLIENT_ID=your-client-id
VITE_MSAL_TENANT_ID=your-tenant-id
VITE_MSAL_REDIRECT_URI=http://localhost:5173

# Encriptación (generar con: openssl rand -hex 32)
VITE_ENCRYPTION_KEY=abc123...

# Telegram Bot (opcional)
VITE_TELEGRAM_BOT_TOKEN=bot123456:ABC-DEF...

# Jira (opcional)
VITE_JIRA_BASE_URL=https://your-org.atlassian.net
VITE_JIRA_EMAIL=your-email@company.com
VITE_JIRA_API_TOKEN=ATATT3xFf...

# Copilot Studio (opcional)
VITE_COPILOT_STUDIO_ENDPOINT=https://...
```

---

## **Crear un Feature Nuevo**

### **Paso 1: Crear Estructura de Archivos**

Ejemplo: Feature "Test Templates"

```bash
src/app/
├── components/
│   └── test-templates/
│       ├── TestTemplatesList.tsx
│       ├── TestTemplateCard.tsx
│       ├── TestTemplateDialog.tsx
│       ├── useTestTemplates.ts
│       └── test-templates.types.ts
│
├── pages/
│   └── TestTemplates.tsx
│
└── services/
    └── test-templates-api.ts
```

### **Paso 2: Definir Tipos**

```typescript
// src/app/components/test-templates/test-templates.types.ts
export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'api' | 'integration' | 'performance';
  steps: TestStep[];
  created_by: string;
  created_at: string;
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  expected_result: string;
}

export type InsertTestTemplate = Omit<TestTemplate, 'id' | 'created_at'>;
```

### **Paso 3: Crear API Service**

```typescript
// src/services/test-templates-api.ts
import { axiosInstance } from './api';
import type { TestTemplate, InsertTestTemplate } from '@/app/components/test-templates/test-templates.types';

export const testTemplatesApi = {
  getAll: async (): Promise<TestTemplate[]> => {
    const response = await axiosInstance.get('/api/test-templates');
    return response.data;
  },
  
  getById: async (id: string): Promise<TestTemplate> => {
    const response = await axiosInstance.get(`/api/test-templates/${id}`);
    return response.data;
  },
  
  create: async (data: InsertTestTemplate): Promise<TestTemplate> => {
    const response = await axiosInstance.post('/api/test-templates', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<TestTemplate>): Promise<TestTemplate> => {
    const response = await axiosInstance.put(`/api/test-templates/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/test-templates/${id}`);
  },
};

// Agregar al API central
// src/services/api.ts
export const api = {
  // ... otros módulos
  testTemplates: testTemplatesApi,
};
```

### **Paso 4: Crear Custom Hook**

```typescript
// src/app/components/test-templates/useTestTemplates.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { TestTemplate } from './test-templates.types';

export function useTestTemplates() {
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.testTemplates.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const createTemplate = async (data: InsertTestTemplate) => {
    const newTemplate = await api.testTemplates.create(data);
    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  };
  
  const deleteTemplate = async (id: string) => {
    await api.testTemplates.delete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };
  
  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    deleteTemplate,
  };
}
```

### **Paso 5: Crear Componentes**

```typescript
// src/app/pages/TestTemplates.tsx
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { TestTemplatesList } from '@/app/components/test-templates/TestTemplatesList';
import { TestTemplateDialog } from '@/app/components/test-templates/TestTemplateDialog';
import { useTestTemplates } from '@/app/components/test-templates/useTestTemplates';

export default function TestTemplates() {
  const { templates, loading, createTemplate, deleteTemplate } = useTestTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sora">Test Templates</h1>
          <p className="text-muted-foreground">
            Plantillas reutilizables para test cases
          </p>
        </div>
        
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Template
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Lista */}
      <TestTemplatesList
        templates={filteredTemplates}
        loading={loading}
        onDelete={deleteTemplate}
      />
      
      {/* Dialog */}
      <TestTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={async (data) => {
          await createTemplate(data);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
```

### **Paso 6: Agregar al Router**

```typescript
// src/app/App.tsx
import TestTemplates from '@/app/pages/TestTemplates';

<Route path="/test-templates" element={<TestTemplates />} />
```

### **Paso 7: Agregar al Sidebar**

```typescript
// src/app/components/Sidebar.tsx
import { FileTemplate } from 'lucide-react';

const navItems = [
  // ... otros items
  {
    label: 'Test Templates',
    href: '/test-templates',
    icon: FileTemplate,
  },
];
```

---

## **Componentes UI**

### **Crear un Componente Nuevo**

```bash
# Ubicación
src/app/components/ui/my-component.tsx
```

### **Template Base**

```typescript
// src/app/components/ui/my-component.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/components/ui/utils';

const myComponentVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {
  // Props adicionales
}

export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(myComponentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

MyComponent.displayName = 'MyComponent';
```

---

## **API Integration**

### **Agregar un Nuevo Módulo al API Central**

```typescript
// 1. Crear archivo del módulo
// src/services/notifications-api.ts
export const notificationsApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/notifications');
    return response.data;
  },
  
  markAsRead: async (id: string) => {
    await axiosInstance.post(`/api/notifications/${id}/read`);
  },
};

// 2. Agregar al API central
// src/services/api.ts
import { notificationsApi } from './notifications-api';

export const api = {
  // ... módulos existentes
  notifications: notificationsApi,
};

// 3. Usar en componentes
const notifications = await api.notifications.getAll();
```

---

## **Base de Datos**

### **Crear una Nueva Tabla**

```sql
-- 1. Crear migración
-- supabase/migrations/20250120_add_notifications.sql

BEGIN;

-- Crear tabla
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Foreign keys
ALTER TABLE notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users (id)
ON DELETE CASCADE;

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications
FOR SELECT TO authenticated
USING (user_id = (auth.uid()));

CREATE POLICY notifications_insert ON notifications
FOR INSERT TO authenticated
WITH CHECK (user_id = (auth.uid()));

CREATE POLICY notifications_update ON notifications
FOR UPDATE TO authenticated
USING (user_id = (auth.uid()));

COMMIT;
```

### **Agregar Tipos TypeScript**

```typescript
// src/types/database.types.ts
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export type InsertNotification = Omit<Notification, 'id' | 'created_at'>;
```

---

## **Testing**

### **Unit Tests con Vitest**

```typescript
// src/app/components/test-templates/__tests__/useTestTemplates.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTestTemplates } from '../useTestTemplates';
import * as api from '@/services/api';

describe('useTestTemplates', () => {
  it('should fetch templates on mount', async () => {
    const mockTemplates = [
      { id: '1', name: 'Login Test', category: 'ui' },
    ];
    
    vi.spyOn(api.api.testTemplates, 'getAll').mockResolvedValue(mockTemplates);
    
    const { result } = renderHook(() => useTestTemplates());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.templates).toEqual(mockTemplates);
  });
});
```

### **Component Tests**

```typescript
// src/app/components/test-templates/__tests__/TestTemplateCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestTemplateCard } from '../TestTemplateCard';

describe('TestTemplateCard', () => {
  const mockTemplate = {
    id: '1',
    name: 'Login Test',
    description: 'Tests login functionality',
    category: 'ui' as const,
  };
  
  it('should render template info', () => {
    render(<TestTemplateCard template={mockTemplate} />);
    
    expect(screen.getByText('Login Test')).toBeInTheDocument();
    expect(screen.getByText('Tests login functionality')).toBeInTheDocument();
  });
  
  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<TestTemplateCard template={mockTemplate} onDelete={onDelete} />);
    
    fireEvent.click(screen.getByLabelText('Eliminar'));
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

### **E2E Tests con Playwright**

```typescript
// tests/e2e/test-templates.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Test Templates', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@haida.com');
    await page.click('button:has-text("Login with Microsoft")');
    
    // Ir a Test Templates
    await page.goto('/test-templates');
  });
  
  test('should create new template', async ({ page }) => {
    await page.click('button:has-text("Nuevo Template")');
    
    await page.fill('input[name="name"]', 'API Health Check');
    await page.fill('textarea[name="description"]', 'Verifica que la API responda');
    await page.selectOption('select[name="category"]', 'api');
    
    await page.click('button:has-text("Guardar")');
    
    await expect(page.locator('text=API Health Check')).toBeVisible();
  });
  
  test('should filter templates by search', async ({ page }) => {
    await page.fill('input[placeholder*="Buscar"]', 'login');
    
    await expect(page.locator('text=Login Test')).toBeVisible();
    await expect(page.locator('text=Checkout Test')).not.toBeVisible();
  });
});
```

---

## **Code Review Checklist**

### **✅ General**
- [ ] Código sigue el style guide del proyecto
- [ ] No hay console.logs en código de producción
- [ ] Variables de entorno usadas correctamente
- [ ] Imports organizados (orden: external, internal, types)
- [ ] No hay código comentado sin razón

### **✅ TypeScript**
- [ ] Todos los tipos están definidos (no `any`)
- [ ] Interfaces exportadas desde archivos `.types.ts`
- [ ] Props tienen tipos explícitos
- [ ] Funciones tienen return type explícito

### **✅ React**
- [ ] Componentes usan `forwardRef` si reciben ref
- [ ] Keys únicas en listas
- [ ] useEffect tiene array de dependencias correcto
- [ ] useCallback/useMemo usados apropiadamente
- [ ] No hay re-renders innecesarios

### **✅ Estilos**
- [ ] Usa Tailwind CSS (no CSS inline)
- [ ] Respeta el design system (colores, tipografías)
- [ ] Componente es responsive
- [ ] Dark mode soportado (si aplica)

### **✅ API**
- [ ] Manejo de errores implementado
- [ ] Loading states mostrados
- [ ] Credenciales encriptadas (si aplica)
- [ ] Rate limiting considerado
- [ ] Timeout configurado

### **✅ Seguridad**
- [ ] Input sanitization implementada
- [ ] No usa `dangerouslySetInnerHTML` sin DOMPurify
- [ ] No expone credenciales en logs
- [ ] CSRF protection (si es mutación)
- [ ] RLS verificado (si es query de DB)

### **✅ Testing**
- [ ] Unit tests escritos (coverage > 80%)
- [ ] E2E tests para flujos críticos
- [ ] Casos edge considerados
- [ ] Mock data realista

### **✅ Documentación**
- [ ] JSDoc comments en funciones públicas
- [ ] README actualizado (si aplica)
- [ ] Tipos documentados con examples
- [ ] Changelog actualizado

---

## **Ejemplo Completo: Feature "Notificaciones"**

### **1. Migración de DB**
```sql
-- supabase/migrations/20250120_add_notifications.sql
(ver arriba)
```

### **2. Tipos**
```typescript
// src/types/database.types.ts
export interface Notification { ... }
```

### **3. API Service**
```typescript
// src/services/notifications-api.ts
export const notificationsApi = { ... }
```

### **4. Custom Hook**
```typescript
// src/hooks/useNotifications.ts
export function useNotifications() { ... }
```

### **5. Componentes UI**
```typescript
// src/app/components/notifications/NotificationBell.tsx
// src/app/components/notifications/NotificationsList.tsx
// src/app/components/notifications/NotificationItem.tsx
```

### **6. Integración en Sidebar**
```typescript
// src/app/components/Sidebar.tsx
<NotificationBell unreadCount={notifications.filter(n => !n.is_read).length} />
```

### **7. Tests**
```typescript
// src/app/components/notifications/__tests__/NotificationBell.test.tsx
// tests/e2e/notifications.spec.ts
```

---

## **Git Workflow**

### **Branching Strategy**

```bash
main              # Producción (protegida)
├── develop       # Desarrollo (base para features)
    ├── feature/test-templates
    ├── feature/notifications
    ├── fix/xss-designer
    └── hotfix/rate-limiting
```

### **Crear Feature Branch**

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear feature branch
git checkout -b feature/test-templates

# 3. Desarrollar...
# (commits frecuentes)

# 4. Push
git push origin feature/test-templates

# 5. Crear Pull Request en GitHub
# develop ← feature/test-templates
```

### **Commit Convention**

```bash
# Formato: <type>(<scope>): <message>

feat(templates): add test templates feature
fix(designer): fix XSS vulnerability with dangerouslySetInnerHTML
docs(security): update security documentation
refactor(api): simplify error handling
test(templates): add unit tests for useTestTemplates hook
chore(deps): update dependencies

# Types:
# feat     - Nueva feature
# fix      - Bug fix
# docs     - Documentación
# style    - Formateo, no afecta lógica
# refactor - Refactoring sin cambio de funcionalidad
# test     - Tests
# chore    - Mantenimiento (deps, config)
```

---

## **Debugging**

### **React DevTools**
```bash
# Instalar extensión en Chrome/Firefox
https://react.dev/learn/react-developer-tools
```

### **Console Tricks**

```typescript
// Debug condicional
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('🔍 Projects:', projects);
  console.log('🔍 User:', currentUser);
}

// Measure performance
console.time('fetchProjects');
await api.projects.getAll();
console.timeEnd('fetchProjects');
// Output: fetchProjects: 234.56ms
```

### **Network Debugging**

```typescript
// Ver todas las requests en consola
axiosInstance.interceptors.request.use((config) => {
  console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.url} - ${error.response?.status}`);
    return Promise.reject(error);
  }
);
```

---

**Anterior**: [← 02 - Arquitectura](../02-ARQUITECTURA/README.md)  
**Siguiente**: [04 - APIs →](../04-APIS/README.md)

---

**Última actualización**: 2025-01-20  
**Versión HAIDA**: 1.0.0
