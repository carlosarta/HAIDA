# HAIDA - Microsoft 365 Integration

## Overview

HAIDA ahora está completamente integrado con Microsoft 365 / Entra ID para autenticación y acceso a Microsoft Graph API.

## Configuración de Autenticación

### Credenciales de Azure AD

- **Client ID**: `c3321f1a-6c32-4d6e-b3e6-a4de2f7fee4e`
- **Tenant ID**: `9b7594d6-2c7d-4fe2-b248-213f64996877`
- **Authority**: `https://login.microsoftonline.com/organizations`
- **Redirect URI**: `{your-app-origin}/auth/callback`

### Scopes Configurados

#### Autenticación Básica
- `openid` - OpenID Connect
- `profile` - Perfil de usuario
- `email` - Email del usuario
- `offline_access` - Refresh tokens

#### Microsoft Graph API
- `User.Read` - Leer perfil del usuario
- `Mail.Read` - Leer correos electrónicos
- `Calendars.Read` - Leer calendarios
- `Files.Read` - Leer archivos de OneDrive
- `People.Read` - Leer contactos

## Arquitectura

### Componentes Principales

1. **MSAL Configuration** (`/src/auth/msal-config.ts`)
   - Configuración de Azure AD / Entra ID
   - Instancia de MSAL Browser
   - Configuración de scopes y permisos

2. **Auth Context** (`/src/app/context/auth-context.tsx`)
   - Proveedor de autenticación global
   - Estado de autenticación (user, loading, isAuthenticated)
   - Funciones: login(), logout(), acquireToken()

3. **Graph Service** (`/src/services/graph.service.ts`)
   - Cliente HTTP para Microsoft Graph API
   - Métodos:
     - `getProfile()` - Obtener perfil del usuario
     - `getProfilePhoto()` - Obtener foto de perfil
     - `getEmails()` - Obtener correos
     - `getCalendarEvents()` - Obtener eventos del calendario
     - `getPeople()` - Obtener contactos
     - `getFiles()` - Obtener archivos de OneDrive
     - `search()` - Búsqueda en Microsoft 365

4. **useGraph Hook** (`/src/hooks/useGraph.ts`)
   - Hook personalizado para acceder a Microsoft Graph
   - Manejo automático de tokens
   - Estado de loading y errores

### Flujo de Autenticación

```
1. Usuario hace clic en "Iniciar Sesión con Microsoft 365"
2. MSAL abre popup de Microsoft login
3. Usuario ingresa credenciales de STAYArta
4. Microsoft valida y redirige con token
5. MSAL almacena token en localStorage
6. AuthContext actualiza estado de autenticación
7. Usuario es redirigido al Dashboard
```

### Flujo de API Calls

```
1. Componente necesita datos de Microsoft Graph
2. Usa useGraph() hook
3. Hook obtiene token válido con acquireToken()
4. GraphService hace request a Microsoft Graph
5. Datos son retornados al componente
```

## Uso en Componentes

### Autenticación

```typescript
import { useAuth } from '@/app/context/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }
  
  return (
    <div>
      <p>Welcome {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Microsoft Graph API

```typescript
import { useGraph } from '@/hooks/useGraph';

function MyComponent() {
  const { getProfile, getEmails, loading, error } = useGraph();
  
  useEffect(() => {
    async function loadData() {
      const profile = await getProfile();
      const emails = await getEmails(10);
    }
    loadData();
  }, []);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <div>...</div>;
}
```

## Seguridad

### Token Management
- Los tokens se almacenan en `localStorage` de forma segura
- Los tokens se renuevan automáticamente (silent refresh)
- Los tokens expiran después de 1 hora
- Refresh tokens permiten mantener la sesión

### Best Practices Implementadas
- ✅ PKCE (Proof Key for Code Exchange) habilitado
- ✅ State parameter para prevenir CSRF
- ✅ Nonce para validación de tokens
- ✅ Tokens no se exponen en URLs
- ✅ Logout completo limpia todos los tokens

## Configuración del Entorno

### Variables de Entorno (Opcional)

Si deseas hacer la configuración más flexible:

```env
VITE_AZURE_CLIENT_ID=c3321f1a-6c32-4d6e-b3e6-a4de2f7fee4e
VITE_AZURE_TENANT_ID=9b7594d6-2c7d-4fe2-b248-213f64996877
VITE_AZURE_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Troubleshooting

### Error: "AADSTS50011: Reply URL mismatch"
- Verifica que el Redirect URI en Azure AD coincida exactamente con tu app
- En desarrollo: `http://localhost:5173/auth/callback`
- En producción: `https://yourdomain.com/auth/callback`

### Error: "AADSTS65001: Consent required"
- El usuario necesita dar consentimiento para los scopes solicitados
- Admin puede pre-aprobar los permisos en Azure AD

### Error: "InteractionRequiredAuthError"
- El token expiró y no se puede renovar silenciosamente
- La aplicación automáticamente mostrará el popup de login

## Testing

### Usuario de Prueba
- Email: `haida@stayarta.com`
- Usa tu cuenta de STAYArta/Hiberus para acceder

### Verificar Autenticación
1. Abre Developer Tools → Application → Local Storage
2. Busca claves que empiecen con `msal`
3. Verifica que hay tokens almacenados

## Próximos Pasos

### Integraciones Futuras
- [ ] Supabase para almacenamiento de datos
- [ ] Azure DevOps para CI/CD
- [ ] Microsoft Teams integration
- [ ] SharePoint document management
- [ ] Power Automate workflows

### Features Planeadas
- [ ] Single Sign-On (SSO) completo
- [ ] Perfil enriquecido con datos de Microsoft Graph
- [ ] Calendario integrado en Dashboard
- [ ] Sincronización de archivos con OneDrive
- [ ] Notificaciones vía Microsoft Teams

## Soporte

Para problemas o preguntas sobre la integración:
- Documentación de MSAL: https://learn.microsoft.com/azure/active-directory/develop/msal-overview
- Microsoft Graph: https://learn.microsoft.com/graph/overview
- Azure AD: https://learn.microsoft.com/azure/active-directory/

---

**Última actualización**: 17 de Enero, 2026
**Versión**: 2.0.0
**Status**: ✅ Producción Ready
