/**
 * AI Prompt Generator
 * Genera prompts dinámicos basados en configuraciones del usuario
 */

interface GenerationSettings {
  testingStandard: 'ISTQB' | 'ISO' | 'Agile';
  outputFormat: 'Gherkin' | 'Standard';
  coverageDepth: number;
}

interface TestDataVariable {
  name: string;
  type: 'string' | 'number' | 'email' | 'url' | 'password' | 'json';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

/**
 * Genera el prompt del AI basado en las configuraciones del usuario
 */
export function generateAIPrompt(
  settings: GenerationSettings,
  documentContent: string,
  testData: TestDataVariable[]
): string {
  // 1. Base del prompt según el estándar
  const standardPrompt = getStandardPrompt(settings.testingStandard);
  
  // 2. Instrucciones de formato
  const formatInstructions = getFormatInstructions(settings.outputFormat);
  
  // 3. Profundidad de cobertura
  const coverageInstructions = getCoverageInstructions(settings.coverageDepth);
  
  // 4. Datos de prueba disponibles
  const testDataContext = getTestDataContext(testData);

  // Construir prompt final
  const prompt = `
# INSTRUCCIONES PARA GENERACIÓN DE CASOS DE PRUEBA

## ESTÁNDAR: ${settings.testingStandard}
${standardPrompt}

## FORMATO DE SALIDA: ${settings.outputFormat}
${formatInstructions}

## COBERTURA: ${getCoverageLevelName(settings.coverageDepth)} (${settings.coverageDepth}%)
${coverageInstructions}

## DATOS DE PRUEBA DISPONIBLES
${testDataContext}

## DOCUMENTACIÓN A ANALIZAR
${documentContent}

---

GENERA LOS CASOS DE PRUEBA siguiendo EXACTAMENTE el estándar ${settings.testingStandard} y formato ${settings.outputFormat}.
Utiliza las variables de datos de prueba proporcionadas.
Identifica y señala CUALQUIER dato adicional que necesites y no esté disponible.
`;

  return prompt;
}

/**
 * Prompts específicos por estándar de testing
 */
function getStandardPrompt(standard: 'ISTQB' | 'ISO' | 'Agile'): string {
  switch (standard) {
    case 'ISTQB':
      return `
- Usa terminología ISTQB Foundation Level
- Incluye PRECONDICIONES explícitas antes de cada caso
- Define PASOS DE PRUEBA numerados y detallados
- Especifica POSTCONDICIONES y proceso de cleanup
- Añade CRITERIOS DE ENTRADA/SALIDA
- Identifica REQUISITOS DE DATOS DE PRUEBA
- Clasifica por: Funcional, No Funcional, Regresión
- Prioridad: Alta, Media, Baja
- Técnica de diseño: Partición de equivalencia, Valores límite, etc.
`;

    case 'ISO':
      return `
- Sigue estructura formal ISO/IEC 29119
- Incluye IDs DE TRAZABILIDAD a requisitos (REQ-XXX)
- Genera MATRIZ DE COBERTURA de requisitos
- Documentación formal de DISEÑO DE PRUEBAS
- Criterios de COMPLETITUD y COBERTURA
- Registro de CONDICIONES DE PRUEBA
- Análisis de RIESGOS asociados
- Métricas de CALIDAD esperadas
`;

    case 'Agile':
      return `
- Formato User Story: "Como [rol], quiero [acción], para [beneficio]"
- CRITERIOS DE ACEPTACIÓN claros y medibles
- Escenarios BDD integrados (Given/When/Then)
- Enfoque ITERATIVO y colaborativo
- Definition of Done (DoD)
- Historias verticales (end-to-end)
- Estimación en Story Points
- Priorización por valor de negocio
`;
  }
}

/**
 * Instrucciones de formato de salida
 */
function getFormatInstructions(format: 'Gherkin' | 'Standard'): string {
  switch (format) {
    case 'Gherkin':
      return `
**Usa sintaxis Gherkin (BDD):**

Feature: [Nombre de la funcionalidad]
  Como [rol]
  Quiero [acción]
  Para [beneficio]

  Background:
    Given [precondición común]
  
  Scenario: [Nombre del escenario]
    Given [estado inicial]
    And [contexto adicional]
    When [acción del usuario]
    And [otra acción]
    Then [resultado esperado]
    And [verificación adicional]

  Scenario Outline: [Escenario parametrizado]
    Given el usuario está en <página>
    When ingresa <email> y <password>
    Then debe ver <resultado>
    
    Examples:
      | página | email | password | resultado |
      | login  | {{EMAIL}} | {{PASSWORD}} | dashboard |
      | login  | invalid@test.com | wrong | error |
`;

    case 'Standard':
      return `
**Usa formato tabular estándar:**

| # | Paso/Acción | Resultado Esperado | Datos de Prueba |
|---|------------|-------------------|-----------------|
| 1 | Navegar a la página de login | Se muestra formulario con campos email/password | URL: {{BASE_URL}}/login |
| 2 | Ingresar email válido | Campo acepta el valor | {{EMAIL}} |
| 3 | Ingresar password válida | Campo oculta caracteres | {{PASSWORD}} |
| 4 | Hacer click en "Iniciar Sesión" | Redirección a dashboard principal | - |
| 5 | Verificar elementos del dashboard | Se muestran widgets esperados | - |

**Datos de Prueba Requeridos:**
- EMAIL: Email de usuario válido
- PASSWORD: Contraseña correcta
- BASE_URL: URL base de la aplicación
`;
  }
}

/**
 * Instrucciones de cobertura
 */
function getCoverageInstructions(depth: number): string {
  if (depth <= 33) {
    return `
**COBERTURA LOW (0-33%): Solo Happy Paths**
- Genera 3-5 casos por funcionalidad
- Solo flujos principales exitosos
- Casos de uso más comunes
- Validación rápida de features básicas
- NO incluir casos negativos complejos
`;
  } else if (depth <= 66) {
    return `
**COBERTURA NORMAL (34-66%): Happy Paths + Casos Negativos Principales**
- Genera 8-12 casos por funcionalidad
- Flujos principales + alternativos importantes
- Validaciones de campos (formato, longitud, requeridos)
- Errores de negocio comunes (credenciales inválidas, permisos, etc.)
- Manejo de errores HTTP (400, 401, 403, 404, 500)
- Casos límite básicos (strings vacíos, valores extremos)
`;
  } else {
    return `
**COBERTURA EXHAUSTIVE (67-100%): Todos los Edge Cases**
- Genera 20+ casos por funcionalidad
- Todos los edge cases identificables
- Boundary Value Analysis (valores límite)
- Combinaciones de estados complejas
- Casos de seguridad (SQL injection, XSS, CSRF)
- Performance testing (carga, timeout)
- Compatibilidad (navegadores, dispositivos)
- Casos de recuperación ante fallos
- Pruebas de concurrencia
- Validación de integraciones externas
`;
  }
}

/**
 * Contexto de datos de prueba
 */
function getTestDataContext(testData: TestDataVariable[]): string {
  if (testData.length === 0) {
    return `
⚠️ NO hay datos de prueba configurados.
DEBES identificar TODOS los datos necesarios y señalarlos claramente.
`;
  }

  const dataList = testData.map(data => {
    const requiredLabel = data.required ? '**REQUERIDO**' : 'Opcional';
    const value = data.defaultValue || '{{' + data.name + '}}';
    return `- ${data.name} (${data.type}) - ${requiredLabel}: ${data.description || 'N/A'}\n  Valor: ${value}`;
  }).join('\n');

  return `
**Variables disponibles:**
${dataList}

⚠️ Si necesitas DATOS ADICIONALES que no están en la lista, señálalos con formato:
[DATA_NEEDED: nombre_variable - tipo - descripción]
`;
}

/**
 * Helper para nombre del nivel de cobertura
 */
function getCoverageLevelName(depth: number): string {
  if (depth <= 33) return 'LOW';
  if (depth <= 66) return 'NORMAL';
  return 'EXHAUSTIVE';
}

/**
 * Analiza documentación y detecta datos de prueba necesarios
 */
export function detectRequiredTestData(documentContent: string): TestDataVariable[] {
  const detectedData: TestDataVariable[] = [];
  const doc = documentContent.toLowerCase();

  // Detectar URLs/Endpoints
  if (doc.includes('url') || doc.includes('endpoint') || doc.includes('api')) {
    detectedData.push({
      name: 'BASE_URL',
      type: 'url',
      required: true,
      description: 'URL base de la aplicación o API'
    });
  }

  // Detectar autenticación
  if (doc.includes('login') || doc.includes('auth') || doc.includes('usuario')) {
    detectedData.push({
      name: 'EMAIL',
      type: 'email',
      required: true,
      description: 'Email de usuario válido para autenticación'
    });
    detectedData.push({
      name: 'PASSWORD',
      type: 'password',
      required: true,
      description: 'Contraseña del usuario'
    });
  }

  // Detectar API Keys
  if (doc.includes('api key') || doc.includes('token') || doc.includes('bearer')) {
    detectedData.push({
      name: 'API_KEY',
      type: 'string',
      required: true,
      description: 'API Key para autenticación de servicios'
    });
  }

  // Detectar IDs de entidades
  if (doc.includes('usuario id') || doc.includes('user id')) {
    detectedData.push({
      name: 'USER_ID',
      type: 'string',
      required: false,
      description: 'ID de usuario de prueba'
    });
  }

  if (doc.includes('producto') || doc.includes('item') || doc.includes('product')) {
    detectedData.push({
      name: 'PRODUCT_ID',
      type: 'string',
      required: false,
      description: 'ID de producto para testing'
    });
  }

  // Detectar datos de formularios
  if (doc.includes('formulario') || doc.includes('form') || doc.includes('registro')) {
    detectedData.push({
      name: 'TEST_NAME',
      type: 'string',
      required: false,
      defaultValue: 'Usuario Test',
      description: 'Nombre para formularios de prueba'
    });
    detectedData.push({
      name: 'TEST_PHONE',
      type: 'string',
      required: false,
      defaultValue: '+34600000000',
      description: 'Teléfono de prueba'
    });
  }

  // Detectar JSON payloads
  if (doc.includes('json') || doc.includes('payload') || doc.includes('body')) {
    detectedData.push({
      name: 'REQUEST_PAYLOAD',
      type: 'json',
      required: false,
      description: 'Payload JSON para requests'
    });
  }

  return detectedData;
}

/**
 * Genera variables para Postman Collection
 */
export function generatePostmanVariables(testData: TestDataVariable[]): any {
  return testData.map(data => ({
    key: data.name,
    value: data.defaultValue || '',
    type: data.type === 'password' ? 'secret' : 'default',
    enabled: true
  }));
}

/**
 * Genera custom fields para Jira
 */
export function generateJiraCustomFields(testData: TestDataVariable[]): any {
  const fields: any = {};
  
  testData.forEach(data => {
    fields[`customfield_testdata_${data.name.toLowerCase()}`] = data.defaultValue || '';
  });

  return fields;
}
