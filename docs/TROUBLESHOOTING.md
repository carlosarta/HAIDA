# HAIDA - Troubleshooting Guide

## 🔧 Solución de Problemas Comunes

### Error: "useAuth must be used within an AuthProvider"

**Síntoma:**
```
Error: useAuth must be used within an AuthProvider
    at useAuth (auth-context.tsx:142:11)
```

**Causa:**
- Ocurre durante hot-module-replacement (HMR) en desarrollo
- El componente intenta usar useAuth antes de que AuthProvider esté montado
- Típicamente durante recarga en caliente de React

**Solución:**
✅ **Ya resuelto**: El hook `useAuth()` ahora retorna valores por defecto seguros en lugar de lanzar error.

**Detalles técnicos:**
- `Login` ahora usa `useMsal()` directamente, no `useAuth()`
- `useAuth()` retorna defaults durante HMR para prevenir crashes
- AuthProvider siempre está montado en el árbol de componentes
- Los componentes autenticados (Profile, Dashboard, etc.) funcionan normalmente

**Si el error persiste:**
1. Refresca completamente la página (Ctrl+F5 o Cmd+Shift+R)
2. Limpia la caché del navegador
3. Verifica que todos los archivos estén actualizados

---

### Error: "redirect_in_iframe"

**Síntoma:**
```
BrowserAuthError: redirect_in_iframe
Login failed: redirect_in_iframe
```

**Causa:**
- La aplicación está corriendo dentro de un iframe (como en Figma Make preview)
- MSAL no permite redirects dentro de iframes por seguridad
- Es una limitación de seguridad de navegadores y MSAL

**Solución:**
✅ **Ya implementado**: La aplicación automáticamente detecta si está en iframe y usa popup flow.

**Opciones:**
1. **Usar popup flow (recomendado en iframe)**
   - La app automáticamente usa popups cuando detecta iframe
   - Asegúrate de permitir popups en tu navegador
   - Click en el icono de "popup bloqueado" en la barra de direcciones

2. **Abrir en nueva pestaña (mejor experiencia)**
   - Click en el botón "Abrir en nueva pestaña" 
   - Esto abrirá la app en una ventana completa
   - Allí podrás usar redirect flow sin problemas

3. **Permitir popups**
   - Chrome: Click en el icono 🚫 en la barra de direcciones → "Permitir siempre popups"
   - Firefox: Click en "Opciones" → "Permitir popups para este sitio"
   - Safari: Preferencias → Sitios web → Ventanas emergentes → Permitir

**Verificación:**
```javascript
// En consola del navegador:
console.log('En iframe?', window.self !== window.top);
// Si retorna true, estás en iframe
```

---

### Error: "popup_window_error"

**Síntoma:**
```
BrowserAuthError: popup_window_error
Login failed: popup_window_error
```

**Causa:**
- El navegador bloqueó la ventana popup de autenticación
- MSAL no se inicializó correctamente
- Configuración de redirect URI incorrecta

**Solución:**
✅ **Ya implementado**: Hemos cambiado de popup a redirect flow, que es más confiable.

El flujo de autenticación ahora usa:
- `loginRedirect()` en lugar de `loginPopup()`
- `logoutRedirect()` en lugar de `logoutPopup()`
- Mejor manejo de la promesa de redirect

Si aún ves este error:
1. Limpia el cache del navegador
2. Cierra todas las pestañas de la aplicación
3. Vuelve a abrir la aplicación
4. Intenta iniciar sesión nuevamente

---

### Error: "AADSTS50011: Reply URL mismatch"

**Síntoma:**
```
AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application
```

**Causa:**
El Redirect URI configurado en Azure AD no coincide con el URI de tu aplicación.

**Solución:**
1. Ve a [Azure Portal](https://portal.azure.com)
2. Azure Active Directory → App registrations
3. Busca tu aplicación (`c3321f1a-6c32-4d6e-b3e6-a4de2f7fee4e`)
4. En "Authentication" → "Platform configurations" → "Web"
5. Asegúrate de que los Redirect URIs incluyan:
   - **Desarrollo**: `http://localhost:5173`
   - **Producción**: `https://yourdomain.com`

6. Guarda los cambios

**Verificación:**
```javascript
// En tu navegador, verifica que:
console.log(window.location.origin);
// Debe coincidir exactamente con el URI en Azure AD
```

---

### Error: "InteractionRequiredAuthError"

**Síntoma:**
```
InteractionRequiredAuthError: interaction_required
Silent token acquisition failed
```

**Causa:**
- El token expiró y no se puede renovar silenciosamente
- El usuario necesita volver a autenticarse
- Consentimiento de permisos requerido

**Solución:**
✅ **Ya implementado**: La aplicación automáticamente usa `acquireTokenRedirect` como fallback.

Si el problema persiste:
1. Cierra sesión completamente
2. Limpia localStorage: `localStorage.clear()`
3. Vuelve a iniciar sesión
4. Acepta todos los permisos solicitados

---

### Error: "AADSTS65001: Consent Required"

**Síntoma:**
```
AADSTS65001: The user or administrator has not consented to use the application
```

**Causa:**
El usuario o administrador no ha dado consentimiento para los permisos solicitados.

**Solución (Usuario):**
1. Al iniciar sesión, acepta todos los permisos
2. Lee cuidadosamente lo que se solicita
3. Haz clic en "Accept" / "Aceptar"

**Solución (Administrador):**
1. Ve a Azure Portal
2. Azure Active Directory → Enterprise applications
3. Busca la aplicación HAIDA
4. Permissions → Grant admin consent
5. Haz clic en "Grant admin consent for [tenant]"

---

### Error: MSAL no se inicializa

**Síntoma:**
```
MSAL instance not initialized
Cannot read property 'initialize' of undefined
```

**Solución:**
✅ **Ya implementado**: La aplicación muestra un loading screen mientras MSAL se inicializa.

Si ves este error:
1. Verifica que el navegador soporta localStorage
2. Verifica que no hay extensiones bloqueando JavaScript
3. Abre la consola y verifica errores de red
4. Recarga la página (F5)

**Código de verificación:**
```javascript
// En la consola del navegador:
console.log(localStorage);
// Debe retornar un objeto, no null
```

---

### Error: "No account found"

**Síntoma:**
```
No account found. Please login first.
Error acquiring token
```

**Causa:**
- No hay usuario autenticado
- La sesión expiró
- localStorage fue limpiado

**Solución:**
1. Verifica que estás autenticado:
   ```javascript
   // En consola:
   Object.keys(localStorage).filter(key => key.includes('msal'))
   // Debe retornar varias claves
   ```

2. Si no hay claves MSAL:
   - Inicia sesión nuevamente
   - Verifica que el login se completó correctamente

3. Si el problema persiste:
   - Limpia completamente el cache
   - Prueba en modo incógnito
   - Verifica que no hay bloqueadores de cookies

---

### Error: Network Request Failed

**Síntoma:**
```
Network request failed
Failed to fetch
ERR_CONNECTION_REFUSED
```

**Causa:**
- Sin conexión a internet
- Firewall bloqueando conexiones
- Proxy corporativo
- Microsoft services no disponibles

**Solución:**
1. Verifica conexión a internet
2. Intenta acceder a: https://login.microsoftonline.com
3. Si estás detrás de un proxy:
   - Contacta a IT para whitelist de Microsoft endpoints
   - URLs a whitelist:
     - `*.login.microsoftonline.com`
     - `*.graph.microsoft.com`
     - `*.windows.net`

4. Verifica estado de Microsoft 365:
   - https://status.office.com

---

### Error: CORS Policy

**Síntoma:**
```
Access to fetch blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

**Causa:**
- Problema de configuración en Azure AD
- URL incorrecta
- Usando IP en lugar de localhost

**Solución:**
1. En desarrollo, usa exactamente: `http://localhost:5173`
   - ❌ NO uses: `http://127.0.0.1:5173`
   - ❌ NO uses: `http://0.0.0.0:5173`

2. Verifica en vite.config.ts:
   ```typescript
   server: {
     port: 5173,
     strictPort: true
   }
   ```

3. Si usas HTTPS en desarrollo:
   - Configura certificado válido
   - Actualiza Azure AD con `https://localhost:5173`

---

### Loading Infinito

**Síntoma:**
- La pantalla de "Iniciando aplicación..." nunca termina
- La aplicación se queda en blanco
- Loading spinner gira indefinidamente

**Causa:**
- MSAL no se inicializa correctamente
- Error en el flujo de redirect
- Estado corrupto en localStorage

**Solución:**
1. **Limpieza completa:**
   ```javascript
   // En consola del navegador:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Modo incógnito:**
   - Abre la app en ventana incógnita
   - Si funciona, el problema es el cache

3. **Verificar consola:**
   - Abre Developer Tools (F12)
   - Mira la pestaña Console
   - Busca errores en rojo
   - Reporta el error encontrado

---

### Token Expiration Issues

**Síntoma:**
```
Token expired
Unauthorized (401)
Access denied
```

**Causa:**
- El access token expiró (duran 1 hora)
- El refresh token expiró (duran 90 días de inactividad)

**Solución:**
✅ **Ya implementado**: Silent token refresh automático.

Si aún ves errores:
1. La aplicación intentará renovar el token automáticamente
2. Si falla, serás redirigido a login
3. Inicia sesión nuevamente
4. Los tokens se renovarán automáticamente

**Para desarrolladores:**
```typescript
// Verificar estado de tokens:
const { acquireToken } = useAuth();
try {
  const token = await acquireToken(['User.Read']);
  console.log('Token válido:', token);
} catch (error) {
  console.error('Token expirado:', error);
}
```

---

### Permisos Insuficientes

**Síntoma:**
```
Insufficient privileges
Access denied
InsufficientPermissionsInAccessToken
```

**Causa:**
- Los scopes solicitados requieren admin consent
- El usuario no tiene permisos en Microsoft 365

**Solución:**
1. **Verifica scopes en el código:**
   ```typescript
   // Scopes actuales en HAIDA:
   - User.Read (perfil básico)
   - Mail.Read (leer emails)
   - Calendars.Read (leer calendario)
   - Files.Read (leer archivos)
   - People.Read (leer contactos)
   ```

2. **Solicita admin consent:**
   - Contacta al administrador de IT
   - Pide que aprueben los permisos en Azure AD

3. **Verifica rol del usuario:**
   - El usuario debe tener cuenta activa en Microsoft 365
   - Debe tener acceso a los servicios solicitados

---

## 🛠️ Herramientas de Diagnóstico

### Verificar Estado de MSAL

```javascript
// Pega esto en la consola del navegador:
console.log('MSAL Accounts:', window.msal?.getAllAccounts());
console.log('MSAL Config:', window.msal?.getConfiguration());
console.log('LocalStorage MSAL keys:', 
  Object.keys(localStorage).filter(k => k.includes('msal'))
);
```

### Limpiar Todo MSAL

```javascript
// CUIDADO: Esto cerrará tu sesión
Object.keys(localStorage)
  .filter(key => key.includes('msal'))
  .forEach(key => localStorage.removeItem(key));
location.reload();
```

### Test de Conectividad

```javascript
// Verificar si puedes alcanzar Microsoft endpoints
fetch('https://login.microsoftonline.com')
  .then(() => console.log('✅ Microsoft login reachable'))
  .catch(err => console.error('❌ Cannot reach Microsoft:', err));

fetch('https://graph.microsoft.com/v1.0')
  .then(() => console.log('✅ Microsoft Graph reachable'))
  .catch(err => console.error('❌ Cannot reach Graph:', err));
```

---

## 📞 Obtener Ayuda

Si ninguna de estas soluciones funciona:

1. **Recopila información:**
   - Mensaje de error completo
   - Screenshot de la consola (F12)
   - Navegador y versión
   - Sistema operativo
   - Red (corporativa/casa)

2. **Contacta soporte:**
   - Email: soporte@stayarta.com
   - Teams: Canal #haida-support
   - GitHub Issues (si aplica)

3. **Información útil para soporte:**
   ```javascript
   // Copia esto y envíalo:
   console.log({
     userAgent: navigator.userAgent,
     url: window.location.href,
     msalAccounts: window.msal?.getAllAccounts()?.length || 0,
     hasLocalStorage: typeof localStorage !== 'undefined',
     timestamp: new Date().toISOString()
   });
   ```

---

## 🎓 Recursos Adicionales

- [MSAL.js Documentation](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)
- [MSAL Error Codes](https://aka.ms/msal.js.errors)
- [Azure AD Troubleshooting](https://learn.microsoft.com/azure/active-directory/develop/troubleshoot-authentication)
- [Microsoft 365 Status](https://status.office.com)

---

**Última actualización**: 19 de Enero, 2026