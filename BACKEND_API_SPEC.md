# HAIDA - Especificación de API Backend

Este documento describe los endpoints que el backend debe implementar para que HAIDA funcione correctamente.

## URL Base

La URL base de la API se configura en `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

## Autenticación

Todos los endpoints autenticados requieren el header:
```
Authorization: Bearer {token}
```

---

## Endpoints de Autenticación

### 1. Login con Email/Contraseña

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "rememberMe": true  // Opcional, indica si el usuario quiere mantener la sesión
}
```

**Response 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-123",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "admin"  // admin, user, viewer, etc.
  },
  "expiresIn": 86400  // Segundos hasta que expire el token
}
```

**Response 401 Unauthorized:**
```json
{
  "message": "Email o contraseña incorrectos"
}
```

**Response 400 Bad Request:**
```json
{
  "message": "Email y contraseña son requeridos"
}
```

---

### 2. Logout

**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 OK:**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### 3. Recuperación de Contraseña

**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response 200 OK:**
```json
{
  "message": "Se ha enviado un email de recuperación",
  "success": true
}
```

**Response 404 Not Found:**
```json
{
  "message": "No existe una cuenta con ese email",
  "success": false
}
```

---

### 4. Verificar Token

**GET** `/auth/verify`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 OK:**
```json
{
  "valid": true,
  "user": {
    "id": "user-uuid-123",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "admin"
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "valid": false,
  "message": "Token inválido o expirado"
}
```

---

## Gestión de Tokens

### RememberMe: Lógica del Backend

Cuando `rememberMe: true`:
- El token debe tener una duración extendida (ej: 30 días)
- El frontend guardará el token en `localStorage` (persistente)

Cuando `rememberMe: false`:
- El token debe tener una duración corta (ej: 24 horas)
- El frontend guardará el token en `sessionStorage` (solo durante la sesión del navegador)

### Ejemplo de implementación en Node.js/Express

```javascript
// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  // Validar credenciales
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  }
  
  // Generar token con duración basada en rememberMe
  const expiresIn = rememberMe ? '30d' : '24h';
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    expiresIn: rememberMe ? 2592000 : 86400  // en segundos
  });
});
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Recurso creado |
| 400 | Solicitud incorrecta |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 500 | Error del servidor |

---

## CORS

El backend debe permitir peticiones desde el dominio del frontend:

```javascript
// Express.js ejemplo
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## Seguridad

### Recomendaciones:

1. **Nunca** almacenar contraseñas en texto plano (usar bcrypt, argon2, etc.)
2. Usar tokens JWT firmados con una clave secreta fuerte
3. Implementar rate limiting para prevenir ataques de fuerza bruta
4. Validar todos los inputs del frontend
5. Usar HTTPS en producción
6. Implementar refresh tokens para mayor seguridad
7. Agregar logging de intentos de login fallidos

### Ejemplo de validación de email:

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ message: 'Email inválido' });
}
```

---

## Próximos Endpoints Necesarios

A medida que se desarrollen más funcionalidades en HAIDA, se necesitarán endpoints adicionales para:

- Gestión de proyectos
- Gestión de casos de prueba
- Ejecución de tests
- Generación de reportes
- Chat con IA
- Gestión de usuarios (admin)
- Perfiles de usuario

Este documento se actualizará con las especificaciones de cada endpoint.
