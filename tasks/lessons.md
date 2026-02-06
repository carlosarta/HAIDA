# Lecciones Aprendidas / Lessons Learned

Este archivo registra patrones, errores comunes y lecciones aprendidas durante el desarrollo de HAIDA.
Se actualiza como parte del bucle de automejora tras cada corrección relevante.

---

## Configuración del Proyecto

### Dependencias con conflicto de peerDependencies
- **Problema**: `@azure/msal-react@5.x` requiere React 19, pero el proyecto usa React 18.3.1.
- **Solución**: Usar `--legacy-peer-deps` al instalar dependencias con npm.
- **Acción futura**: Evaluar migración a React 19 o downgrade de `@azure/msal-react` a versión compatible.

### TypeScript estricto
- El proyecto usa `strict: true` en tsconfig.json.
- `noUnusedLocals` y `noUnusedParameters` están desactivados (`false`) para evitar ruido durante desarrollo activo.
- Se pueden activar para auditorías de código.

---

## Patrones de Desarrollo

### Estructura de archivos
- Componentes UI reutilizables en `src/app/components/ui/`
- Páginas en `src/app/pages/`
- Servicios de API en `src/services/`
- Utilidades en `src/app/utils/`
- Tests junto al código fuente: `*.test.ts` / `*.test.tsx`

### Alias de imports
- `@/` mapea a `./src/` (configurado en vite.config.ts y tsconfig.json)

---

## Errores Comunes a Evitar

### Errores de TypeScript pre-existentes (~25 errores)
- Imports incorrectos: `Qlty`, `HbSeparator`, `HbBadge` (nombres que no existen en los módulos exportados)
- Props faltantes en tipos: `Project`, `TelegramConfig`, etc.
- Módulos no encontrados: imports relativos como `../services/sync-service` desde páginas (deberían usar `@/services/`)
- `ThemeProviderProps` incompatible con la versión de `next-themes`
- `NodeJS` namespace no disponible (falta `@types/node` en algunos contextos)

### ESLint: 1 error pre-existente + 270 warnings
- Error: `no-useless-escape` en `src/app/utils/markdown.utils.ts:169`
- Warnings: mayoritariamente `@typescript-eslint/no-explicit-any` en types y `@typescript-eslint/no-unused-vars`

### React como peerDependency opcional
- **Problema**: react/react-dom están como `peerDependencies` opcionales, no se instalan automáticamente.
- **Solución**: Se añadieron como `devDependencies` para que build y tests funcionen.

---

## Notas de Verificación

- Antes de marcar una tarea como completada, ejecutar: `npm run check`
- Este comando ejecuta typecheck + lint + tests en secuencia
