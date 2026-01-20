# HAIDA - Quick Start Guide

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- npm o pnpm
- Cuenta de Microsoft 365 (STAYArta/Hiberus)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd haida

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔐 Autenticación Microsoft 365

### Primera Vez

1. Abre la aplicación en tu navegador
2. Haz clic en "Iniciar Sesión con Microsoft 365"
3. Ingresa tu email de STAYArta: `usuario@stayarta.com`
4. Ingresa tu contraseña de Hiberus/STAYArta
5. Acepta los permisos solicitados (solo la primera vez)
6. Serás redirigido al Dashboard

### Permisos Solicitados

La aplicación solicita acceso a:
- ✅ Perfil básico (nombre, email, foto)
- ✅ Leer correos electrónicos
- ✅ Leer eventos del calendario
- ✅ Leer archivos de OneDrive
- ✅ Leer contactos

**Nota**: Estos permisos son solo de LECTURA. La aplicación nunca modifica tus datos de Microsoft 365.

## 📁 Estructura del Proyecto

```
haida/
├── src/
│   ├── auth/
│   │   └── msal-config.ts          # Configuración de Azure AD
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/                 # Componentes UI (Radix + Tailwind)
│   │   │   ├── layout/             # Header, Footer
│   │   │   ├── Microsoft365Widget.tsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── auth-context.tsx    # Context de autenticación
│   │   │   ├── data-context.tsx    # Context de datos
│   │   │   └── ui-context.tsx      # Context de UI
│   │   ├── lib/
│   │   │   └── i18n-context.tsx    # Internacionalización
│   │   └── pages/
│   │       ├── Login.tsx           # Página de login
│   │       ├── Dashboard.tsx       # Dashboard principal
│   │       ├── Profile.tsx         # Perfil de usuario
│   │       └── ...
│   ├── hooks/
│   │   └── useGraph.ts             # Hook para Microsoft Graph
│   ├── services/
│   │   └── graph.service.ts        # Cliente de Microsoft Graph API
│   └── styles/
│       ├── theme.css               # Variables de tema
│       └── ...
├── docs/
│   └── MICROSOFT-365-INTEGRATION.md
└── package.json
```

## 🎨 Temas (Light/Dark)

La aplicación soporta tema claro y oscuro:

```typescript
import { useTheme } from './components/theme-provider';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Cambiar Tema
    </button>
  );
}
```

## 🌍 Configuración Modular (Data-Driven)

Todos los textos e configuraciones están en contextos:

### UI Context

```typescript
import { useUi } from '@/app/lib/ui-context';

function MyComponent() {
  const { config, updateConfig } = useUi();
  
  // Acceder a configuración
  console.log(config.login.title);
  
  // Actualizar configuración
  updateConfig('login', { title: 'Nuevo título' });
}
```

### Data Context

```typescript
import { useData } from '@/app/lib/data-context';

function MyComponent() {
  const { projects, currentProject, setCurrentProject } = useData();
  
  return (
    <div>
      {projects.map(project => (
        <button key={project.id} onClick={() => setCurrentProject(project)}>
          {project.name}
        </button>
      ))}
    </div>
  );
}
```

## 🔧 Uso de Microsoft Graph

### Obtener Perfil del Usuario

```typescript
import { useGraph } from '@/hooks/useGraph';

function ProfileComponent() {
  const { getProfile, loading, error } = useGraph();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile();
      setProfile(data);
    }
    loadProfile();
  }, []);
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return <div>{profile.displayName}</div>;
}
```

### Obtener Correos

```typescript
const { getEmails } = useGraph();

async function loadEmails() {
  const emails = await getEmails(10); // Get latest 10 emails
  console.log(emails);
}
```

### Obtener Eventos del Calendario

```typescript
const { getCalendarEvents } = useGraph();

async function loadCalendar() {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const events = await getCalendarEvents(today, nextWeek);
  console.log(events);
}
```

## 🎯 Componentes UI Principales

### Button

```typescript
import { Button } from '@/app/components/ui/button';

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Mi Card</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
</Card>
```

### Input

```typescript
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="tu@email.com" />
</div>
```

### Toast (Notificaciones)

```typescript
import { toast } from 'sonner';

// Success
toast.success('¡Éxito!', {
  description: 'Operación completada correctamente'
});

// Error
toast.error('Error', {
  description: 'Algo salió mal'
});

// Info
toast.info('Información', {
  description: 'Ten en cuenta esto'
});

// Loading
toast.promise(
  fetchData(),
  {
    loading: 'Cargando...',
    success: '¡Listo!',
    error: 'Error al cargar'
  }
);
```

## 📝 Validación con Zod

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

## 🚨 Troubleshooting

### La aplicación no se conecta a Microsoft 365
- Verifica que tienes conexión a internet
- Asegúrate de usar una cuenta de STAYArta/Hiberus
- Limpia el cache del navegador y vuelve a intentar
- Verifica la consola del navegador para errores

### Error de CORS
- El CORS está configurado correctamente en Azure AD
- Si trabajas en localhost, usa exactamente `http://localhost:5173`
- No uses `127.0.0.1` ni otras IPs

### Los datos no se cargan
- Verifica que diste permisos a la aplicación
- Abre Developer Tools → Console para ver errores
- Intenta cerrar sesión y volver a iniciar

## 📦 Build para Producción

```bash
# Build
npm run build

# Preview del build
npm run preview
```

Los archivos de producción estarán en la carpeta `dist/`

## 🔗 Enlaces Útiles

- [Documentación de MSAL](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)
- [Microsoft Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
- [Radix UI Components](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## 💡 Tips

1. **Dark Mode**: Usa el toggle en el Header para cambiar entre tema claro/oscuro
2. **Responsive**: La aplicación es responsive, prueba en mobile con Developer Tools
3. **Hot Reload**: Los cambios se reflejan automáticamente en desarrollo
4. **TypeScript**: Aprovecha el autocompletado de VS Code para evitar errores
5. **Console**: Mantén la consola abierta para ver logs y errores

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Haz tus cambios
3. Commit: `git commit -m "Añadir nueva funcionalidad"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📧 Soporte

Para preguntas o problemas:
- Email: soporte@stayarta.com
- Teams: Canal #haida-support

---

**Happy Coding! 🚀**
