# 🚀 HAIDA AI Test Generator - Instrucciones de Deploy

**Versión:** 2.0.0  
**Fecha:** 20 Enero 2025  
**Status:** ✅ LISTO PARA SUBIR A PRODUCCIÓN

---

## 📋 RESUMEN DE CAMBIOS

### Archivos Nuevos Creados

```
✅ /src/app/lib/ai-prompt-generator.ts (320 líneas)
   - generateAIPrompt()
   - detectRequiredTestData()
   - generatePostmanVariables()
   - generateJiraCustomFields()

✅ /src/app/components/designer/TestDataManager.tsx (380 líneas)
   - Modal completo de gestión de datos
   - Sistema de notificaciones
   - Exportación a Postman
   - Detección automática

✅ /src/app/components/ui/alert.tsx (40 líneas)
   - Componente Alert para notificaciones
   
✅ /DOCUMENTACION_SISTEMA_AI_GENERATOR.md (1,200+ líneas)
   - Documentación técnica completa
   
✅ /README_AI_GENERATOR.md (350+ líneas)
   - README ejecutivo
   
✅ /INSTRUCCIONES_DEPLOY.md (este archivo)
```

### Archivos Modificados

```
✅ /src/app/pages/Designer.tsx
   - Agregados estados para AI Generator
   - Función startAnalysis() completa
   - Integración con TestDataManager
   - Modal de confirmación de settings
   - +150 líneas de código
```

---

## 🔍 VERIFICACIÓN PRE-DEPLOY

### 1. Verificar Archivos Creados

```bash
# Verificar que existen todos los archivos
ls -la /src/app/lib/ai-prompt-generator.ts
ls -la /src/app/components/designer/TestDataManager.tsx
ls -la /src/app/components/ui/alert.tsx

# Verificar documentación
ls -la /DOCUMENTACION_SISTEMA_AI_GENERATOR.md
ls -la /README_AI_GENERATOR.md
```

### 2. Test de Compilación

```bash
# Limpiar cache
rm -rf node_modules/.vite
rm -rf dist

# Instalar dependencias (si es necesario)
npm install

# Compilar TypeScript
npm run build

# Verificar que no hay errores
# ✅ Build completado sin errores
```

### 3. Test de Funcionalidad

```bash
# Iniciar en modo desarrollo
npm run dev

# Abrir navegador: http://localhost:5173
# Navegar a: /designer

# Verificar:
✅ Botón "AI Generator" visible
✅ Click abre modal
✅ Tab "Documentación Confluence" funciona
✅ Tab "Subir Archivos" funciona
✅ Configuraciones (Settings icon) se abren
✅ Modal de confirmación muestra impacto
✅ Test Data Manager se abre al detectar datos faltantes
✅ Exportar a Postman funciona
✅ Prompt se muestra en consola (F12)
```

---

## 📦 PASOS PARA DEPLOY

### Opción A: Deploy Manual

```bash
# 1. Build de producción
npm run build

# 2. Verificar carpeta dist
ls -la dist/
# Debe contener: index.html, assets/, etc.

# 3. Subir a servidor
scp -r dist/* user@tu-servidor.com:/var/www/haida/

# 4. Configurar nginx (si aplica)
sudo nano /etc/nginx/sites-available/haida

# Configuración nginx:
server {
    listen 80;
    server_name haida.tu-dominio.com;
    root /var/www/haida;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 5. Reiniciar nginx
sudo systemctl restart nginx

# 6. Verificar en producción
curl https://haida.tu-dominio.com
```

### Opción B: Deploy con Git

```bash
# 1. Commit de cambios
git add .
git commit -m "feat: AI Test Generator v2.0.0 - Complete implementation"

# 2. Push a repositorio
git push origin main

# 3. En servidor, pull cambios
ssh user@servidor
cd /var/www/haida
git pull origin main

# 4. Build en servidor
npm run build

# 5. Restart servicio
pm2 restart haida
# o
sudo systemctl restart haida
```

### Opción C: Deploy Automatizado (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/var/www/haida/"
```

---

## 🔐 CONFIGURACIÓN DE PRODUCCIÓN

### Environment Variables

```bash
# .env.production
VITE_APP_NAME=HAIDA
VITE_APP_VERSION=2.0.0

# APIs (opcional, para futuras integraciones)
VITE_JIRA_API_URL=https://your-domain.atlassian.net
VITE_CONFLUENCE_API_URL=https://your-domain.atlassian.net/wiki
VITE_POSTMAN_API_KEY=PMAK-your-key-here

# AI/Copilot (futuro)
# VITE_OPENAI_API_KEY=sk-xxx
# VITE_COPILOT_API_KEY=xxx
```

---

## 🧪 TESTING POST-DEPLOY

### Checklist de Verificación

```bash
# 1. Abrir aplicación en producción
https://haida.tu-dominio.com/designer

# 2. Test básico
✅ Página carga correctamente
✅ Botón "AI Generator" visible
✅ Click abre modal sin errores

# 3. Test de configuración
✅ Abrir Settings (ícono engranaje)
✅ Cambiar Testing Standard (ISTQB → ISO → Agile)
✅ Cambiar Output Format (Gherkin → Standard)
✅ Mover slider Coverage Depth
✅ Click "Save Preferences"
✅ Modal de confirmación se abre
✅ Botón "Entendido" cierra modal
✅ Toast de confirmación aparece

# 4. Test de generación
✅ Abrir AI Generator
✅ Tab "Upload Archivos"
✅ Seleccionar archivo .txt o .pdf
✅ Click "Generar Casos de Prueba"
✅ Loading spinner aparece
✅ Test Data Manager se abre (si detecta datos)
✅ Variables aparecen en tabla
✅ Botón "Export Postman" funciona
✅ Botón "Save Test Data" funciona
✅ Prompt aparece en consola (F12)

# 5. Test de integración
✅ Exportar variables a Postman (descarga JSON)
✅ Abrir archivo JSON → verificar estructura
✅ Console muestra prompt completo
✅ Copiar prompt → pegar en ChatGPT → funciona
```

---

## 📊 MONITOREO

### Logs a Revisar

```bash
# Browser Console (F12)
✅ Sin errores en consola
✅ Prompt AI se muestra correctamente
✅ localStorage se actualiza

# localStorage verifica:
- haida_testing_standard
- haida_output_format
- haida_coverage_depth

# Verificar en consola del navegador:
localStorage.getItem('haida_testing_standard'); // "ISTQB"
localStorage.getItem('haida_output_format');    // "Gherkin"
localStorage.getItem('haida_coverage_depth');   // "50"
```

---

## 🐛 TROUBLESHOOTING

### Problema: Build falla

```bash
# Error: Cannot find module '@/app/lib/ai-prompt-generator'

Solución:
# Verificar que el archivo existe
ls /src/app/lib/ai-prompt-generator.ts

# Verificar imports en Designer.tsx
grep "ai-prompt-generator" /src/app/pages/Designer.tsx

# Limpiar y rebuild
rm -rf node_modules/.vite dist
npm run build
```

### Problema: Test Data Manager no abre

```bash
# Verificar import en Designer.tsx
import { TestDataManager } from "@/app/components/designer/TestDataManager";

# Verificar estado
const [isTestDataModalOpen, setIsTestDataModalOpen] = useState(false);

# Verificar que se llama:
setIsTestDataModalOpen(true);
```

### Problema: Alert component no funciona

```bash
# Verificar que alert.tsx existe
ls /src/app/components/ui/alert.tsx

# Verificar import en TestDataManager.tsx
import { Alert, AlertDescription } from '@/app/components/ui/alert';
```

---

## 📈 MÉTRICAS POST-DEPLOY

### KPIs a Monitorear

```typescript
// Métricas sugeridas
{
  "casos_generados_total": 0,
  "usuarios_activos": 0,
  "configuraciones_guardadas": 0,
  "exports_postman": 0,
  "tiempo_promedio_generacion": "2.5s",
  "estandar_mas_usado": "ISTQB",
  "formato_mas_usado": "Gherkin"
}
```

---

## 🎯 ROLLBACK (Si es necesario)

```bash
# Si hay problemas, volver a versión anterior:

# Opción 1: Git
git revert HEAD
git push origin main

# Opción 2: Backup
cp -r /var/www/haida_backup/* /var/www/haida/

# Opción 3: Deploy versión anterior
git checkout v1.5.0
npm run build
# ... deploy
```

---

## ✅ CHECKLIST FINAL

```
Pre-Deploy:
✅ Archivos creados verificados
✅ Build sin errores
✅ Tests locales pasan
✅ Documentación completa
✅ .env.production configurado

Deploy:
✅ Build de producción ejecutado
✅ Archivos subidos a servidor
✅ Nginx/Apache configurado
✅ SSL certificado activo
✅ Logs sin errores

Post-Deploy:
✅ Aplicación carga correctamente
✅ AI Generator funciona
✅ Settings persistentes
✅ Test Data Manager operativo
✅ Export Postman funciona
✅ Prompt se genera correctamente
✅ Usuarios notificados del update
✅ Documentación compartida
```

---

## 📞 SOPORTE POST-DEPLOY

### Contactos

```
Tech Lead: [nombre]@haida.dev
DevOps: [nombre]@haida.dev
QA: [nombre]@haida.dev
```

### Canales

```
Slack: #haida-production
Jira: HAIDA/board
Email: support@haida.dev
```

---

## 🎉 LANZAMIENTO

Una vez completados todos los pasos:

```bash
# 1. Anuncio en Slack
"🎉 HAIDA v2.0.0 desplegado!
- AI Test Generator completamente funcional
- Test Data Manager con detección automática
- Integración Postman/Jira/Confluence
- Documentación completa disponible

Ver: README_AI_GENERATOR.md"

# 2. Email a equipos
"Nueva versión HAIDA v2.0.0 disponible en producción.
Características principales: [...]
Documentación: https://haida.dev/docs"

# 3. Update Confluence
- Publicar documentación
- Videos tutoriales
- FAQs
```

---

## 📝 NOTAS FINALES

**Sistema 100% funcional y probado.**

✅ Todos los archivos creados  
✅ Todos los componentes integrados  
✅ Documentación completa  
✅ Listo para producción  

**Archivos para revisión:**
1. `/DOCUMENTACION_SISTEMA_AI_GENERATOR.md` - Documentación técnica completa
2. `/README_AI_GENERATOR.md` - Quick start guide
3. `/src/app/lib/ai-prompt-generator.ts` - Core AI logic
4. `/src/app/components/designer/TestDataManager.tsx` - Data management UI
5. `/src/app/pages/Designer.tsx` - Integración completa

---

**Creado por:** HAIDA Development Team  
**Fecha:** 20 Enero 2025  
**Versión:** 2.0.0  
**Status:** ✅ PRODUCTION READY
