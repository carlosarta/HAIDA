# 🎨 Arquitectura Frontend HAIDA

**React 18 + TypeScript + Vite + Radix UI + Tailwind CSS v4**

---

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Arquitectura de Componentes](#arquitectura-de-componentes)
5. [Gestión de Estado](#gestión-de-estado)
6. [Enrutamiento](#enrutamiento)
7. [Patrones de Diseño](#patrones-de-diseño)

---

## 🏗️ Overview

HAIDA utiliza una arquitectura frontend moderna basada en:

- **React 18**: Framework principal con soporte para Server Components (futuro)
- **TypeScript**: Type-safety completo en toda la aplicación
- **Vite**: Build tool ultra-rápido con HMR instantáneo
- **Radix UI**: Componentes accesibles y sin estilos (headless UI)
- **Tailwind CSS v4**: Utility-first CSS con diseño responsive

### Principios Arquitecturales

1. **Component-Driven Development**: Todo es un componente reutilizable
2. **Data-Driven Configuration**: Configuración dinámica desde JSON/Context
3. **Single Source of Truth**: Estado centralizado en Context API
4. **Responsive by Default**: Mobile-first design
5. **Accessibility First**: WCAG 2.1 Level AA compliance

---

## 🛠️ Stack Tecnológico

### Core

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "typescript": "latest",
  "vite": "6.3.5"
}
```

### UI Library

```json
{
  "@radix-ui/*": "1.x",
  "tailwindcss": "4.1.12",
  "lucide-react": "0.487.0",
  "motion": "12.23.24"
}
```

### State Management

```json
{
  "react-hook-form": "7.55.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.2.1"
}
```

### Data Visualization

```json
{
  "recharts": "2.15.2",
  "react-qr-code": "^2.0.18"
}
```

### Authentication

```json
{
  "@azure/msal-browser": "^5.0.2",
  "@azure/msal-react": "^5.0.2"
}
```

---

## 📁 Estructura de Carpetas

```
/src
├── app/
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Radix UI wrappers (47+ componentes)
│   │   ├── layout/          # Header, Footer, Sidebar
│   │   ├── users/           # UserManagement, Permissions
│   │   ├── documents/       # GestorDocumentos
│   │   ├── integrations/    # IntegracionesDisenador
│   │   ├── telegram/        # ConfiguracionBotTelegram
│   │   └── documentation/   # HaidaDocs (nuevo)
│   │
│   ├── pages/               # Páginas principales
│   │   ├── Login.tsx        # Microsoft 365 SSO
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── Projects.tsx     # Project Hub (Kanban + Wiki)
│   │   ├── Designer.tsx     # AI Test Generator
│   │   ├── Executor.tsx     # Test Execution
│   │   ├── Reporter.tsx     # Análisis y reportes
│   │   ├── Chat.tsx         # Microsoft 365 Copilot style
│   │   └── Profile.tsx      # Perfil de usuario
│   │
│   ├── lib/                 # Utilidades y contexts
│   │   ├── data-context.tsx # Estado global (projects, suites, cases)
│   │   ├── i18n-context.tsx # Internacionalización
│   │   └── ui-context.tsx   # UI state (theme, sidebar)
│   │
│   ├── context/             # Contexts adicionales
│   │   └── auth-context.tsx # Autenticación Microsoft 365
│   │
│   └── App.tsx              # Componente raíz
│
├── services/                # Servicios y APIs
│   ├── api.ts               # API centralizada
│   ├── mock-backend.ts      # Fallback automático
│   ├── postman-api.ts       # Integración Postman
│   ├── jira-api.ts          # Integración Jira
│   ├── confluence-api.ts    # Integración Confluence
│   ├── telegram-api.ts      # Bot de Telegram
│   ├── sync-service.ts      # Sincronización bidireccional
│   ├── export-service.ts    # Exportación de archivos (nuevo)
│   └── graph.service.ts     # Microsoft Graph API
│
├── auth/                    # Configuración de autenticación
│   └── msal-config.ts       # MSAL configuration
│
├── hooks/                   # Custom hooks
│   └── useGraph.ts          # Hook para Microsoft Graph
│
├── types/                   # TypeScript types
│   └── permissions.ts       # Tipos de permisos
│
└── styles/                  # Estilos globales
    ├── index.css            # Entry point
    ├── tailwind.css         # Tailwind base
    ├── theme.css            # Tokens de diseño
    └── fonts.css            # Tipografías (Sora, IBM Plex Mono)
```

---

## 🧩 Arquitectura de Componentes

### Tipos de Componentes

#### 1. **Páginas** (`/src/app/pages/`)

Componentes de nivel superior que representan rutas completas:

```tsx
// Ejemplo: Projects.tsx
export function Projects() {
  const { projects } = useData();
  const [activeTab, setActiveTab] = useState('board');
  
  return (
    <div className="container">
      {/* Layout de la página */}
    </div>
  );
}
```

**Características**:
- Manejan rutas completas
- Usan Context API para datos globales
- Orquestan componentes hijos
- Manejan lógica de negocio

#### 2. **Componentes de UI** (`/src/app/components/ui/`)

Wrappers alrededor de Radix UI con estilos de Tailwind:

```tsx
// Ejemplo: button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Características**:
- Headless UI (Radix)
- Type-safe props
- Variants con CVA (class-variance-authority)
- Completamente accesibles (ARIA)

#### 3. **Componentes de Dominio** (`/src/app/components/`)

Componentes específicos de la lógica de negocio:

```tsx
// Ejemplo: UserManagement.tsx
export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  
  return (
    <div>
      {/* Gestión específica de usuarios */}
    </div>
  );
}
```

**Características**:
- Encapsulan lógica de dominio
- Usan hooks personalizados
- Componen múltiples componentes UI
- Manejan estado local

---

## 🔄 Gestión de Estado

HAIDA utiliza un enfoque híbrido de gestión de estado:

### 1. Context API (Estado Global)

```tsx
// data-context.tsx
export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [cases, setCases] = useState<TestCase[]>([]);
  
  return (
    <DataContext.Provider value={{ projects, suites, cases, ... }}>
      {children}
    </DataContext.Provider>
  );
}

// Uso en componentes
const { projects, addProject } = useData();
```

**Usado para**:
- Proyectos, Suites, Casos de Prueba
- Usuario autenticado (Microsoft 365)
- Preferencias de UI (tema, idioma)
- Integraciones activas

### 2. Estado Local (useState)

```tsx
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
```

**Usado para**:
- Estado de UI temporal (modales, menús)
- Formularios no persistidos
- Animaciones y transiciones

### 3. React Hook Form (Formularios)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

**Usado para**:
- Validación de formularios
- Manejo de errores
- Submit handling

---

## 🗺️ Enrutamiento

HAIDA utiliza un enrutamiento condicional simple basado en estado:

```tsx
// App.tsx
export default function App() {
  const { currentPage } = useUI();
  
  return (
    <div className="flex h-screen">
      <Header />
      <div className="flex-1">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'projects' && <Projects />}
        {currentPage === 'designer' && <Designer />}
        {currentPage === 'executor' && <Executor />}
        {currentPage === 'chat' && <Chat />}
      </div>
    </div>
  );
}
```

**Características**:
- No requiere React Router (simplifica la arquitectura)
- Navegación controlada por Context
- Lazy loading de páginas pesadas
- Persistencia de estado entre navegaciones

---

## 🎨 Patrones de Diseño

### Compound Components

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Render Props

```tsx
<DataTable
  data={projects}
  renderRow={(project) => (
    <ProjectRow project={project} />
  )}
/>
```

### Custom Hooks

```tsx
// useGraph.ts
export function useGraph() {
  const { instance, accounts } = useMsal();
  
  const fetchProfile = async () => {
    const response = await graphClient.api('/me').get();
    return response;
  };
  
  return { fetchProfile };
}
```

---

## 🔐 Seguridad Frontend

### Content Security Policy

```ts
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
    },
  },
});
```

### Sanitización de Inputs

```tsx
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);
```

### Protección contra XSS

```tsx
// Evitar dangerouslySetInnerHTML
// Usar React Markdown en su lugar
<ReactMarkdown>{content}</ReactMarkdown>
```

---

## 📚 Referencias

- [React Docs](https://react.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev/guide/)

---

**Última actualización**: Enero 2026 | **Mantenido por**: Hiberus Tecnología
