# 📦 Integración con Postman API

**Importación de Colecciones y Generación Automática de Casos de Prueba**

---

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Configuración Inicial](#configuración-inicial)
3. [Workspace HAIDA Global Team](#workspace-haida-global-team)
4. [Colecciones por Proyecto](#colecciones-por-proyecto)
5. [Importación de Colecciones](#importación-de-colecciones)
6. [Generación Automática de Tests](#generación-automática-de-tests)
7. [Newman CLI](#newman-cli)

---

## 🌐 Overview

HAIDA se integra con Postman API para:

- ✅ Importar colecciones de pruebas API existentes
- ✅ Generar casos de prueba ISTQB automáticamente desde requests
- ✅ Sincronizar cambios bidireccionales
- ✅ Ejecutar tests con Newman (CLI)

### Arquitectura de la Integración

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Postman    │ ◄───► │    HAIDA     │ ◄───► │     Jira     │
│  Collections │       │  Test Cases  │       │  Test Issues │
└──────────────┘       └──────────────┘       └──────────────┘
```

---

## ⚙️ Configuración Inicial

### 1. Generar API Key en Postman

1. Ve a [Postman API Keys](https://web.postman.co/settings/me/api-keys)
2. Haz clic en **"Generate API Key"**
3. Dale un nombre descriptivo: `HAIDA Integration`
4. Copia el key generado (empieza con `PMAK-`)

### 2. Configurar en HAIDA

**Opción A: Interfaz Gráfica**
1. Ve a **Settings** → **Integraciones** → **Postman**
2. Pega tu API Key
3. Haz clic en **"Save"**

**Opción B: Variable de Entorno**

```bash
# .env.local
VITE_POSTMAN_API_KEY=PMAK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Verificar Conexión

En **Designer** → **Postman Collections**, haz clic en **"Actualizar"**:
- ✅ Si aparecen colecciones: Configuración correcta
- ❌ Si falla: Verifica que el API Key sea válido

---

## 🏢 Workspace HAIDA Global Team

**Workspace ID**: `3584d84a-1bb2-4f6f-a5f0-0d6dcae7f5d5`

Este workspace contiene todas las colecciones de pruebas de los proyectos Hiberus:

| Proyecto | Colecciones |
|----------|-------------|
| **PRIVALIA** | PRIVALIA API Suite, PRIVALIA Auth Tests |
| **CTB** | CTB API Collection, CTB Integration Tests |
| **HAIDA** | HAIDA System Tests, HAIDA API Reference |

### Acceso al Workspace

```tsx
// Código en postman-api.ts
export const PROYECTOS_POSTMAN: Record<string, ProyectoPostman> = {
  PRIVALIA: {
    workspaceId: '3584d84a-1bb2-4f6f-a5f0-0d6dcae7f5d5',
    nombre: 'HAIDA Global Team',
    colecciones: ['PRIVALIA API Suite', 'PRIVALIA Auth Tests'],
  },
  // ...
};
```

---

## 📦 Colecciones por Proyecto

### PRIVALIA

**Colecciones Disponibles**:
1. **PRIVALIA API Suite**
   - Endpoints de checkout
   - Gestión de productos
   - Autenticación de usuarios
   - Total: ~45 requests

2. **PRIVALIA Auth Tests**
   - OAuth 2.0 flow
   - Token refresh
   - Session management
   - Total: ~12 requests

### CTB

**Colecciones Disponibles**:
1. **CTB API Collection**
   - CRUD operations
   - Búsqueda y filtros
   - Reportes
   - Total: ~30 requests

2. **CTB Integration Tests**
   - Tests de integración
   - Smoke tests
   - Health checks
   - Total: ~15 requests

### HAIDA

**Colecciones Disponibles**:
1. **HAIDA System Tests**
   - API de proyectos
   - API de suites
   - API de casos de prueba
   - Total: ~25 requests

---

## 📥 Importación de Colecciones

### Desde la Interfaz de HAIDA

1. Ve a **Designer** → Haz clic en **"Postman Collections"**
2. Haz clic en **"Actualizar"** para cargar las colecciones
3. Selecciona la colección que quieres importar
4. Haz clic en **"Importar"**

### Lo que sucede internamente

```tsx
// IntegracionesDisenador.tsx
const handleImportarColeccion = async (collectionId: string) => {
  // 1. Obtener detalles completos de la colección
  const collection = await importarColeccion(collectionId);
  
  // 2. Extraer requests
  const requests = collection.requests;
  
  // 3. Generar casos de prueba (1 caso por cada request)
  const testCases = requests.map(request => ({
    title: `[API] ${request.method} ${request.endpoint}`,
    description: request.description,
    steps: generateStepsFromRequest(request),
    expectedResult: request.expectedStatusCode,
  }));
  
  // 4. Crear suite
  await createTestSuite({
    name: `API Tests - ${collection.nombre}`,
    type: 'integration',
    testCases,
  });
};
```

---

## 🤖 Generación Automática de Tests

HAIDA convierte automáticamente requests de Postman en casos de prueba ISTQB:

### Mapeo de Campos

| Postman Request | HAIDA Test Case |
|-----------------|-----------------|
| Request Name | Test Case Title |
| Description | Test Description |
| Method + URL | Preconditions |
| Pre-request Script | Setup Steps |
| Tests Script | Validation Steps |
| Expected Status Code | Expected Result |

### Ejemplo de Conversión

**Request en Postman**:
```json
{
  "name": "Create New User",
  "method": "POST",
  "url": "{{baseUrl}}/api/users",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "tests": "pm.expect(pm.response.code).to.equal(201);"
}
```

**Caso de Prueba Generado**:
```
Título: [API] POST /api/users - Create New User
Tipo: Integration Test
Prioridad: High

Precondiciones:
- El servicio API debe estar disponible
- El usuario no debe existir previamente

Pasos:
1. Enviar request POST a /api/users
2. Incluir body con name y email
3. Verificar status code 201
4. Verificar que la respuesta contenga el ID del usuario creado

Resultado Esperado:
- Status Code: 201 Created
- Response contiene: { id, name, email, createdAt }
```

---

## ⚡ Newman CLI (Automatización)

### Instalación

```bash
npm install -g newman
```

### Ejecutar Colección

```bash
# Ejecutar colección local
newman run collection.json

# Ejecutar con entorno
newman run collection.json -e environment.json

# Exportar resultados a JSON
newman run collection.json --reporters json --reporter-json-export output.json
```

### Integración con CI/CD

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: newman run postman-collection.json -e postman-environment.json
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno en Postman

```tsx
// postman-api.ts
export const POSTMAN_ENVIRONMENTS = {
  LOCAL: {
    baseUrl: 'http://localhost:3000',
    apiKey: 'test-key',
  },
  STAGING: {
    baseUrl: 'https://staging.hiberus.com',
    apiKey: '{{STAGING_API_KEY}}',
  },
  PRODUCTION: {
    baseUrl: 'https://api.hiberus.com',
    apiKey: '{{PROD_API_KEY}}',
  },
};
```

### Scripts de Pre-request y Tests

**Pre-request Script**:
```javascript
// Generar token dinámico
pm.environment.set('authToken', 'Bearer ' + pm.globals.get('apiKey'));
```

**Test Script**:
```javascript
// Validar respuesta
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has user data", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
  pm.expect(jsonData).to.have.property('name');
});
```

---

## 🚨 Troubleshooting

### Error: "Invalid API Key"

**Solución**:
1. Verifica que el key empiece con `PMAK-`
2. Regenera el key en Postman
3. Limpia el localStorage: `localStorage.removeItem('haida_postman_api_key')`

### Error: "Collection not found"

**Solución**:
1. Verifica que la colección exista en el workspace correcto
2. Asegúrate de tener permisos de lectura
3. Contacta al administrador del workspace

### Colecciones no aparecen filtradas

**Solución**:
1. Verifica que el nombre del proyecto en HAIDA coincida con el mapeo en `PROYECTOS_POSTMAN`
2. Revisa que los nombres de las colecciones en Postman incluyan las keywords configuradas

---

## 📚 Referencias

- [Postman API Documentation](https://learning.postman.com/docs/developer/postman-api/intro-api/)
- [Newman Documentation](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Learning Center](https://learning.postman.com/)

---

**Última actualización**: Enero 2026 | **Mantenido por**: Hiberus Tecnología
