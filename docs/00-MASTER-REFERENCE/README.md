# 🎯 Master Reference

**Fuente única de verdad (Single Source of Truth) para HAIDA**

---

## **📋 Índice de Navegación**

| Layer | Carpeta | Contenido |
|-------|---------|-----------|
| **0** | [00-MASTER-REFERENCE](../00-MASTER-REFERENCE/) | Esta página - Configuración global |
| **1** | [01-FUNDAMENTOS](../01-FUNDAMENTOS/) | Introducción, conceptos básicos, quick start |
| **2** | [02-ARQUITECTURA](../02-ARQUITECTURA/) | Estructura del proyecto, patrones de diseño |
| **3** | [03-GUIAS-DESARROLLO](../03-GUIAS-DESARROLLO/) | Cómo desarrollar features |
| **4** | [04-APIS](../04-APIS/) | Documentación de APIs y servicios |
| **5** | [05-BASE-DATOS](../05-BASE-DATOS/) | Esquema DB, tipos, queries |
| **6** | [06-SEGURIDAD](../06-SEGURIDAD/) | Encriptación, autenticación, RLS |
| **7** | [07-DESPLIEGUE](../07-DESPLIEGUE/) | CI/CD, hosting, environments |
| **8** | [08-MANTENIMIENTO](../08-MANTENIMIENTO/) | Monitoring, debugging, troubleshooting |

---

## **🌐 URLs Principales**

### **Producción**
- **App**: `https://haida.example.com`
- **API**: `https://api.haida.example.com`
- **Docs**: `https://docs.haida.example.com`

### **Staging**
- **App**: `https://staging.haida.example.com`
- **API**: `https://api-staging.haida.example.com`

### **Desarrollo Local**
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3000`
- **Supabase Local**: `http://localhost:54321`

---

## **🎨 Paleta de Colores (Editorial-Tech)**

```css
/* Primarios */
--ink: #1a1a1a;           /* Texto principal, fondos dark */
--sand: #f5f5f0;          /* Fondos claros, superficie */
--signal-orange: #ff6b35; /* CTAs, alertas importantes */

/* Secundarios */
--teal: #00a896;          /* Success, datos positivos */
--slate: #64748b;         /* Texto secundario, disabled */

/* Gradientes IA */
--ai-gradient: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
```

### **Aplicación por Contexto**

| Elemento | Color | Uso |
|----------|-------|-----|
| **Headers** | Ink | Títulos principales |
| **Body Text** | Slate | Párrafos, descripciones |
| **Buttons Primary** | Signal Orange | Acciones principales |
| **Success States** | Teal | Confirmaciones, checks |
| **Cards/Panels** | Sand | Fondos de contenedores |
| **Chat IA** | AI Gradient | Botón de copilot, badges IA |

---

## **🔤 Tipografías**

### **Sora** (Sans-serif moderna)
- **Uso**: Títulos, headings, UI elements
- **Import**: 
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
  ```
- **Pesos**: 400 (Regular), 600 (Semibold), 700 (Bold)

### **IBM Plex Mono** (Monospace técnico)
- **Uso**: Código, métricas, datos técnicos, URLs
- **Import**:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
  ```
- **Pesos**: 400 (Regular), 500 (Medium), 700 (Bold)

### **Ejemplo de Uso**
```tsx
<h1 className="font-sora text-3xl font-bold">HAIDA Platform</h1>
<code className="font-mono text-sm">POST /api/projects</code>
<p className="font-sora text-base">Descripción del feature...</p>
```

---

## **🧩 Componentes UI (Radix UI)**

HAIDA usa **47+ componentes profesionales** de Radix UI:

### **Navegación**
- `NavigationMenu` - Menú principal
- `Tabs` - Pestañas de contenido
- `Breadcrumb` - Navegación jerárquica

### **Overlays**
- `Dialog` - Modales
- `Popover` - Info contextual
- `Tooltip` - Ayudas rápidas
- `HoverCard` - Cards flotantes

### **Forms**
- `Input` - Campos de texto
- `Select` - Dropdowns
- `Checkbox` - Selección múltiple
- `RadioGroup` - Selección única
- `Switch` - Toggles
- `Slider` - Rangos numéricos

### **Data Display**
- `Table` - Tablas de datos
- `Badge` - Etiquetas
- `Avatar` - Imágenes de perfil
- `Progress` - Barras de progreso
- `Separator` - Divisores

### **Feedback**
- `Alert` - Notificaciones inline
- `Toast` (Sonner) - Notificaciones flotantes
- `Skeleton` - Loading states

---

## **⚙️ Configuración Global**

### **Package Manager**
```bash
npm install  # o pnpm install
```

### **Variables de Entorno**
Archivo `.env.local`:
```bash
# Supabase
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Microsoft 365 (SSO)
VITE_MSAL_CLIENT_ID=your-azure-ad-client-id
VITE_MSAL_TENANT_ID=your-tenant-id

# Chat IA
VITE_COPILOT_STUDIO_ENDPOINT=https://...
```

### **Scripts Principales**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

---

## **🚀 Quick Start (5 minutos)**

```bash
# 1. Clonar repositorio
git clone https://github.com/your-org/haida.git
cd haida

# 2. Instalar dependencias
npm install

# 3. Configurar environment
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir navegador
# http://localhost:5173
```

### **Login por Defecto (Mock)**
```
Email: admin@haida.com
Password: (cualquiera en modo dev)
```

---

## **📦 Stack Tecnológico Principal**

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React | 18.3.1 |
| **Build Tool** | Vite | 6.3.5 |
| **Styling** | Tailwind CSS | 4.1.12 |
| **UI Components** | Radix UI | Latest |
| **State Management** | Zustand / Context | - |
| **Routing** | React Router | 6.x |
| **Forms** | React Hook Form | 7.55.0 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Auth** | MSAL (Azure AD) | 5.0.2 |
| **Chat IA** | Copilot Studio / OpenAI | API |
| **Animations** | Motion (Framer Motion) | 12.23.24 |

---

## **🔗 Links Útiles**

- [Figma Designs](https://figma.com/haida-designs)
- [GitHub Repository](https://github.com/your-org/haida)
- [Jira Board](https://your-org.atlassian.net/jira/haida)
- [Confluence Wiki](https://your-org.atlassian.net/wiki/haida)
- [Postman Workspace](https://postman.com/haida-qa)

---

## **👥 Contactos Clave**

| Rol | Persona | Email |
|-----|---------|-------|
| Tech Lead | Carlos A. | carlos@haida.com |
| QA Lead | TBD | qa@haida.com |
| DevOps | TBD | devops@haida.com |
| Product Owner | TBD | po@haida.com |

---

**Última actualización**: 2025-01-20  
**Versión HAIDA**: 1.0.0
