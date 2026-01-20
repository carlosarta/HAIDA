# 🚀 Guía Rápida - Conectar Backend a HAIDA

## ⚠️ Error Actual: "Failed to fetch"

Este error aparece porque **el frontend está intentando conectarse al backend pero no está disponible**.

---

## 📋 Solución: 3 Opciones

### Opción 1: Configurar la URL del Backend (Recomendado)

1. **Crea un archivo `.env`** en la raíz del proyecto:
```bash
VITE_API_URL=http://localhost:3000/api
```

2. **Cambia el puerto** si tu backend usa otro puerto:
```bash
# Ejemplo: Backend en puerto 8080
VITE_API_URL=http://localhost:8080/api

# Ejemplo: Backend en servidor remoto
VITE_API_URL=https://api.haida.com/v1
```

3. **Reinicia el servidor de desarrollo**:
```bash
npm run dev
```

---

### Opción 2: Crear un Backend Mínimo de Prueba

Si no tienes un backend aún, aquí está un ejemplo mínimo con **Node.js + Express**:

#### 1. Crea una carpeta `backend`:
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv bcrypt jsonwebtoken
```

#### 2. Crea el archivo `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'tu-secreto-super-seguro-cambialo-en-produccion';

app.use(cors());
app.use(express.json());

// Usuario de prueba (en producción, esto sería una base de datos)
const users = [
  {
    id: '1',
    email: 'admin@haida.com',
    // Password: "admin123" hasheada
    passwordHash: '$2b$10$XJWvZqQZ5xQZ5xQZ5xQZ5O5xQZ5xQZ5xQZ5xQZ5xQZ5xQZ5xQZ5x',
    name: 'Administrador',
    role: 'admin'
  }
];

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    console.log('📧 Login attempt:', { email, rememberMe });
    
    // Buscar usuario
    const user = users.find(u => u.email === email);
    
    // Validación simple para demo (en producción usar bcrypt.compare)
    if (!user || password !== 'admin123') {
      return res.status(401).json({ 
        message: 'Email o contraseña incorrectos' 
      });
    }
    
    // Generar token JWT
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );
    
    console.log('✅ Login exitoso:', user.email);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      expiresIn: rememberMe ? 2592000 : 86400
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  console.log('📧 Recuperación de contraseña para:', email);
  
  res.json({
    message: 'Se ha enviado un email de recuperación',
    success: true
  });
});

// GET /api/auth/verify
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Token inválido' });
  }
});

// Endpoints adicionales (proyectos, suites, etc.)
app.get('/api/projects', (req, res) => {
  res.json([
    { id: 'p1', key: 'ECM', name: 'E-commerce Revamp', owner: 'Carlos Ruiz', status: 'Active', created_at: '2025-01-10' }
  ]);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend HAIDA corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  console.log(`\n👤 Usuario de prueba:`);
  console.log(`   Email: admin@haida.com`);
  console.log(`   Password: admin123\n`);
});
```

#### 3. Ejecuta el backend:
```bash
node server.js
```

#### 4. Ahora intenta hacer login con:
- **Email**: `admin@haida.com`
- **Password**: `admin123`
- **RememberMe**: ✅ (opcional)

---

### Opción 3: Usar un Backend Existente

Si ya tienes un backend, asegúrate de que:

1. ✅ **CORS esté habilitado** para el frontend
2. ✅ **Los endpoints estén implementados** según `BACKEND_API_SPEC.md`
3. ✅ **El puerto sea el correcto** en el archivo `.env`

---

## 🔍 Verificar la Conexión

### En el navegador:

1. Abre la consola de desarrollo (F12)
2. Ve a la pestaña "Network" (Red)
3. Intenta hacer login
4. Busca la petición a `/auth/login`
5. Verifica:
   - ❌ **Status: (failed)** = Backend no disponible
   - ✅ **Status: 200** = Backend funcionando
   - ⚠️ **Status: 401** = Credenciales incorrectas
   - ⚠️ **Status: 404** = Endpoint no existe

### Desde la terminal:

Prueba el endpoint manualmente:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@haida.com",
    "password": "admin123",
    "rememberMe": true
  }'
```

Deberías ver:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@haida.com",
    "name": "Administrador",
    "role": "admin"
  },
  "expiresIn": 2592000
}
```

---

## 📊 Estado de los Datos

### ✅ Datos que SE ENVÍAN al Backend:

| Componente | Datos | Endpoint |
|------------|-------|----------|
| Login | `email`, `password`, **`rememberMe`** | `POST /auth/login` |
| Forgot Password | `email` | `POST /auth/forgot-password` |

### ⚠️ Pendientes de Conectar:

- Projects
- Test Suites
- Test Cases
- Executions
- Defects
- Tasks (Kanban)
- Wiki
- Chat IA

---

## 🐛 Troubleshooting

### Error: "Backend no disponible"
- ✅ Verifica que el backend esté corriendo
- ✅ Verifica la URL en `.env`
- ✅ Verifica que CORS esté habilitado

### Error: "Email o contraseña incorrectos"
- ✅ El backend está funcionando
- ⚠️ Las credenciales son incorrectas
- ✅ Usa: `admin@haida.com` / `admin123`

### Error: "CORS policy"
- ⚠️ El backend no tiene CORS habilitado
- Agrega en el backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 📚 Documentación Adicional

- `BACKEND_API_SPEC.md` - Especificación completa de endpoints
- `INTEGRATION_STATUS.md` - Estado de integración
- `.env.example` - Ejemplo de configuración

---

## ✅ Checklist

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Archivo `.env` creado con `VITE_API_URL`
- [ ] Servidor de desarrollo reiniciado
- [ ] CORS habilitado en el backend
- [ ] Credenciales de prueba funcionando
- [ ] Token JWT guardado en localStorage/sessionStorage

---

**¿Necesitas ayuda?** Revisa los logs de la consola del navegador y del backend para más detalles.
