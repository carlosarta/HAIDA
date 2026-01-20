# HAIDA - Configuración Data-Driven

## 📊 Sistema Modular

HAIDA está diseñado con una arquitectura completamente modular y data-driven. Todos los textos, configuraciones y elementos UI pueden ser modificados desde una base de datos o archivo de configuración.

## 🎨 UI Context - Configuración de Interface

### Estructura del UI Config

```typescript
interface UiConfig {
  login: LoginConfig;
  header: HeaderConfig;
  dashboard: DashboardConfig;
  // ... más configuraciones
}
```

### Ejemplo: Configuración de Login

```typescript
const loginConfig: LoginConfig = {
  title: "Welcome Back",
  subtitle: "Enter your credentials to access your QA workspace",
  emailPlaceholder: "name@example.com",
  passwordPlaceholder: "Password",
  rememberMeText: "Remember for 30 days",
  signInButtonText: "Sign In",
  forgotPasswordText: "Forgot password?",
  signUpText: "Sign up",
  microsoftButtonText: "Microsoft Entra ID",
  footerText: "© 2025 Hiberus Tecnología. Todos los derechos reservados.",
  showMicrosoftLogin: true,
  showFooter: true,
  backgroundImage: "bg-blue-500/10"
}
```

### Uso en Componentes

```typescript
import { useUi } from '@/app/lib/ui-context';

function Login() {
  const { config } = useUi();
  const { login } = config;
  
  return (
    <div>
      <h1>{login.title}</h1>
      <p>{login.subtitle}</p>
      <button>{login.signInButtonText}</button>
    </div>
  );
}
```

### Modificar Configuración Dinámicamente

```typescript
function AdminPanel() {
  const { config, updateConfig } = useUi();
  
  const changeLoginTitle = () => {
    updateConfig('login', {
      title: 'Nuevo título personalizado'
    });
  };
  
  return (
    <button onClick={changeLoginTitle}>
      Cambiar título de login
    </button>
  );
}
```

## 📦 Data Context - Gestión de Datos

### Estructura del Data Context

```typescript
interface DataContextType {
  projects: Project[];
  currentProject: Project | null;
  users: User[];
  testSuites: TestSuite[];
  isLoading: boolean;
  setCurrentProject: (project: Project) => void;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}
```

### Ejemplo de Uso

```typescript
import { useData } from '@/app/lib/data-context';

function ProjectList() {
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    isLoading 
  } = useData();
  
  if (isLoading) return <Loader />;
  
  return (
    <div>
      {projects.map(project => (
        <div 
          key={project.id}
          onClick={() => setCurrentProject(project)}
          className={currentProject?.id === project.id ? 'active' : ''}
        >
          {project.name}
        </div>
      ))}
    </div>
  );
}
```

## 🌍 Internacionalización (i18n)

### Language Context

```typescript
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string; // translation function
  availableLanguages: string[];
}
```

### Ejemplo de Traducción

```typescript
import { useLanguage } from '@/app/lib/i18n-context';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.subtitle')}</p>
      
      <button onClick={() => setLanguage('es')}>Español</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

### Archivo de Traducciones

```typescript
// /src/locales/es.json
{
  "welcome": {
    "title": "Bienvenido a HAIDA",
    "subtitle": "Sistema de automatización de pruebas"
  },
  "buttons": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar"
  }
}

// /src/locales/en.json
{
  "welcome": {
    "title": "Welcome to HAIDA",
    "subtitle": "Test automation system"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  }
}
```

## 🎭 Tema (Theme)

### Theme Provider

```typescript
import { ThemeProvider, useTheme } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="light" enableSystem>
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## 🔧 Configuración Avanzada

### Configuración desde API/Supabase

```typescript
// En el futuro, cuando se integre Supabase:

async function loadConfigFromDatabase() {
  const { data, error } = await supabase
    .from('ui_config')
    .select('*')
    .eq('app_id', 'haida')
    .single();
    
  if (data) {
    updateConfig('login', data.login_config);
    updateConfig('dashboard', data.dashboard_config);
  }
}
```

### Configuración desde Variables de Entorno

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_TITLE': JSON.stringify(
      process.env.VITE_APP_TITLE || 'HAIDA'
    ),
  }
});

// Uso en componente
function Header() {
  const title = import.meta.env.VITE_APP_TITLE;
  return <h1>{title}</h1>;
}
```

## 📝 Ejemplo Completo: Dashboard Configurable

### Configuración

```typescript
interface DashboardConfig {
  welcomeMessage: string;
  subtitleMessage: string;
  showKpiCards: boolean;
  showCharts: boolean;
  showRecentProjects: boolean;
  kpiCards: KpiCardConfig[];
  widgets: WidgetConfig[];
}

const defaultDashboardConfig: DashboardConfig = {
  welcomeMessage: "Welcome Back",
  subtitleMessage: "Here's what's happening with your projects today.",
  showKpiCards: true,
  showCharts: true,
  showRecentProjects: true,
  kpiCards: [
    {
      id: 'total-tests',
      title: 'Total Tests',
      icon: 'TestTube',
      color: 'blue',
      enabled: true
    },
    {
      id: 'passed-tests',
      title: 'Passed',
      icon: 'CheckCircle',
      color: 'green',
      enabled: true
    },
    {
      id: 'failed-tests',
      title: 'Failed',
      icon: 'XCircle',
      color: 'red',
      enabled: true
    }
  ],
  widgets: [
    {
      id: 'recent-activity',
      type: 'list',
      title: 'Recent Activity',
      position: { row: 1, col: 1 },
      size: { width: 2, height: 1 },
      enabled: true
    },
    {
      id: 'test-coverage',
      type: 'chart',
      title: 'Test Coverage',
      position: { row: 1, col: 3 },
      size: { width: 1, height: 1 },
      enabled: true
    }
  ]
};
```

### Componente Dashboard

```typescript
function Dashboard() {
  const { config } = useUi();
  const { dashboard } = config;
  
  return (
    <div className="container">
      <div className="mb-8">
        <h1>{dashboard.welcomeMessage}</h1>
        <p>{dashboard.subtitleMessage}</p>
      </div>
      
      {dashboard.showKpiCards && (
        <div className="grid grid-cols-3 gap-4">
          {dashboard.kpiCards.filter(card => card.enabled).map(card => (
            <KpiCard key={card.id} config={card} />
          ))}
        </div>
      )}
      
      {dashboard.showCharts && (
        <div className="grid grid-cols-2 gap-6 mt-6">
          {dashboard.widgets.filter(w => w.enabled).map(widget => (
            <Widget key={widget.id} config={widget} />
          ))}
        </div>
      )}
      
      {dashboard.showRecentProjects && (
        <RecentProjects />
      )}
    </div>
  );
}
```

## 🎯 Best Practices

### 1. Centralizar Configuración

```typescript
// ✅ BIEN - Configuración centralizada
const { config } = useUi();
const buttonText = config.login.signInButtonText;

// ❌ MAL - Texto hardcodeado
const buttonText = "Sign In";
```

### 2. Tipado Estricto

```typescript
// ✅ BIEN - Interfaces definidas
interface ButtonConfig {
  text: string;
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}

// ❌ MAL - Configuración sin tipo
const config: any = { ... };
```

### 3. Valores por Defecto

```typescript
// ✅ BIEN - Valores por defecto
const title = config.login?.title || 'Default Title';

// ❌ MAL - Sin valores por defecto
const title = config.login.title; // puede ser undefined
```

### 4. Memoización

```typescript
// ✅ BIEN - Memoizar valores complejos
const filteredProjects = useMemo(() => {
  return projects.filter(p => p.enabled);
}, [projects]);

// ❌ MAL - Recalcular en cada render
const filteredProjects = projects.filter(p => p.enabled);
```

## 🔄 Migración a Supabase (Futuro)

Cuando se integre Supabase, la configuración será completamente dinámica:

```sql
-- Tabla de configuración
CREATE TABLE ui_config (
  id UUID PRIMARY KEY,
  app_id TEXT NOT NULL,
  section TEXT NOT NULL, -- 'login', 'dashboard', etc.
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de traducciones
CREATE TABLE translations (
  id UUID PRIMARY KEY,
  language TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(language, namespace, key)
);
```

```typescript
// Hook para cargar configuración desde Supabase
function useRemoteConfig() {
  const { updateConfig } = useUi();
  
  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase
        .from('ui_config')
        .select('*')
        .eq('app_id', 'haida');
        
      data?.forEach(item => {
        updateConfig(item.section, item.config);
      });
    };
    
    loadConfig();
  }, []);
}
```

## 📚 Recursos

- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [i18next (i18n library)](https://www.i18next.com/)

---

**🎉 Tu aplicación está lista para ser completamente configurable desde una base de datos!**
