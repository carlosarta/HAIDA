# 📊 HAIDA Reporter - Configurador de Reportes

## 🎯 Descripción

Módulo completo de **configuración y generación de reportes** con plantillas predefinidas para diferentes tipos de clientes. Permite customizar secciones, colores, layouts y exportar en múltiples formatos.

---

## ✨ Características Principales

### 🎨 **Presets por Tipo de Cliente**

| Preset | Descripción | Secciones | Estilo |
|--------|-------------|-----------|--------|
| **Enterprise** | Reportes formales para corporaciones | 6 secciones | Professional |
| **Startup** | Reportes ágiles y concisos | 4 secciones | Vibrant |
| **Agency** | Reportes client-facing con branding | 5 secciones | Custom |
| **Government** | Reportes detallados de compliance | 8 secciones | Minimal |
| **Healthcare** | Reportes HIPAA-compliant | 5 secciones | Professional |
| **Fintech** | Reportes enfocados en seguridad | 6 secciones | Dark |

### 📋 **Secciones Disponibles**

- ✅ **Executive Summary** - Overview de alto nivel (Required)
- ✅ **Key Metrics** - Análisis estadístico y KPIs (Required)
- 📊 **Test Coverage** - Análisis de cobertura
- 🐛 **Defects Analysis** - Reporte de bugs y severidad
- 📈 **Execution History** - Timeline y tendencias
- 👥 **Team Performance** - Métricas de equipo
- 📅 **Project Timeline** - Milestones y sprints
- 💡 **Recommendations** - Sugerencias de mejora
- 📎 **Attachments** - Documentos de soporte

### 🎨 **Customización**

#### Apariencia
- **Color Schemes**: Professional, Vibrant, Minimal, Dark, Custom
- **Chart Types**: Pie, Bar, Line, Area, Donut
- **Branding**: Logo, watermark, company name
- **Logo Position**: Top-left, Top-center, Top-right, Center

#### Layout
- **Page Size**: A4, Letter, Legal
- **Orientation**: Portrait, Landscape
- **Margins**: Customizables (top, right, bottom, left)
- **Header/Footer**: Heights configurables

#### Charts
- Tipo por defecto
- Mostrar leyenda
- Mostrar valores
- Animaciones

### 📤 **Formatos de Exportación**

- 📄 **PDF** - Documento portable
- 📊 **Excel** - Hoja de cálculo con datos
- 📝 **Word** - Documento editable
- 🔧 **JSON** - Datos estructurados
- 🌐 **HTML** - Reporte web

---

## 🏗️ Arquitectura

```
reporter/
├── constants/
│   └── reporter.constants.ts    # Presets, secciones, configuraciones
├── types/
│   └── reporter.types.ts        # Interfaces TypeScript
├── hooks/
│   └── useReporter.ts          # Lógica de negocio
└── components/
    ├── TemplateSelector.tsx    # Selector de plantillas
    ├── ReportCustomizer.tsx    # Panel de customización
    ├── ReportPreview.tsx       # Vista previa en tiempo real
    └── index.ts                # Exports
```

---

## 💻 Uso

### Crear un Reporte desde Preset

```typescript
import { useReporter } from '@/app/hooks';

function MyComponent() {
  const { createFromPreset } = useReporter();

  const handleCreate = () => {
    createFromPreset('enterprise', 'Q4 2024 Report');
  };
}
```

### Customizar Configuración

```typescript
const { updateConfiguration, activeConfig } = useReporter();

// Actualizar color scheme
updateConfiguration(activeConfig.id, {
  colorScheme: 'vibrant'
});

// Cambiar layout
updateConfiguration(activeConfig.id, {
  layout: {
    ...activeConfig.layout,
    orientation: 'landscape'
  }
});
```

### Toggle Secciones

```typescript
const { toggleSection } = useReporter();

// Activar/desactivar sección
toggleSection('team_performance');
```

### Generar Reporte

```typescript
const { generateReport, isGenerating } = useReporter();

<Button 
  onClick={() => generateReport()} 
  disabled={isGenerating}
>
  {isGenerating ? 'Generating...' : 'Generate Report'}
</Button>
```

### Exportar Reporte

```typescript
const { exportReport } = useReporter();

// Exportar como PDF
exportReport('pdf');

// Exportar como Excel
exportReport('excel');
```

---

## 🎯 Ejemplo Completo

```typescript
import { useState } from 'react';
import { useReporter } from '@/app/hooks/useReporter';
import { 
  TemplateSelector, 
  ReportCustomizer, 
  ReportPreview 
} from '@/app/components/reporter';

function ReportBuilder() {
  const {
    configurations,
    activeConfig,
    reportData,
    createFromPreset,
    updateConfiguration,
    toggleSection,
    generateReport,
    exportReport,
  } = useReporter();

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  return (
    <div>
      {/* Template Selector */}
      <TemplateSelector
        onSelect={(preset, name) => {
          createFromPreset(preset, name);
          setShowTemplateDialog(false);
        }}
      />

      {/* Customizer & Preview */}
      {activeConfig && (
        <div className="grid grid-cols-2 gap-4">
          <ReportCustomizer
            config={activeConfig}
            onUpdate={(updates) => 
              updateConfiguration(activeConfig.id, updates)
            }
            onToggleSection={toggleSection}
          />
          <ReportPreview
            config={activeConfig}
            data={reportData}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => generateReport()}>
          Generate
        </Button>
        <Button onClick={() => exportReport('pdf')}>
          Export PDF
        </Button>
      </div>
    </div>
  );
}
```

---

## 🔧 Configuración Avanzada

### Crear Preset Personalizado

```typescript
import { PRESET_CONFIGS } from '@/app/constants/reporter.constants';

// Extender con nuevo preset
const CUSTOM_PRESET = {
  name: 'Custom Client',
  description: 'Tailored for specific client',
  defaultSections: [
    'summary',
    'metrics',
    'defects',
  ],
  colorScheme: 'custom',
  chartStyle: 'bar',
};
```

### Custom Color Scheme

```typescript
updateConfiguration(configId, {
  colorScheme: 'custom',
  customColors: {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
  }
});
```

### Filtros de Datos

```typescript
updateConfiguration(configId, {
  filters: {
    projectId: 'proj-123',
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
    },
    tags: ['regression', 'smoke'],
    status: ['passed', 'failed'],
  }
});
```

---

## 📊 Datos del Reporte

### Estructura de ReportData

```typescript
interface ReportData {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    passRate: number;
    executionTime: number;
  };
  metrics: {
    coverage: number;
    velocity: number;
    defectDensity: number;
    automationRate: number;
    avgExecutionTime: number;
  };
  defects: DefectSummary[];
  executionHistory: ExecutionRecord[];
  teamPerformance?: TeamMetrics[];
  timeline?: TimelineEvent[];
  recommendations?: string[];
}
```

---

## 🎨 Personalización de UI

### Chart Customization

```typescript
updateConfiguration(configId, {
  charts: {
    defaultType: 'donut',
    showLegend: true,
    showValues: true,
    animated: true,
  }
});
```

### Branding

```typescript
updateConfiguration(configId, {
  branding: {
    logo: 'https://example.com/logo.png',
    logoPosition: 'top-center',
    companyName: 'Acme Corp',
    tagline: 'Quality First',
    includeWatermark: true,
  }
});
```

---

## 🚀 Características Futuras

- [ ] Scheduling automático de reportes
- [ ] Templates compartidos entre equipos
- [ ] Integración con email para envío automático
- [ ] Comparación de reportes históricos
- [ ] Análisis AI de tendencias
- [ ] Exportación a PowerPoint
- [ ] Reportes interactivos en HTML
- [ ] Firma digital de reportes

---

## 📝 Notas Técnicas

### Performance
- Componentes memoizados con `React.memo`
- Datos calculados con `useMemo`
- Callbacks optimizados con `useCallback`
- Lazy loading de charts pesados

### Seguridad
- Sanitización de datos en preview
- Validación de configuraciones
- Rate limiting en exports
- Watermarks para confidencialidad

### Accesibilidad
- ARIA labels en todos los controles
- Navegación por teclado
- Contraste de colores WCAG AA
- Screen reader compatible

---

**Última actualización:** 2026-01-20  
**Versión:** 2.0.0  
**Autor:** HAIDA Development Team
