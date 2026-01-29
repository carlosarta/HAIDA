/**
 * Export Service - Sistema de Generación y Exportación de Archivos
 * 
 * Genera estructura completa del proyecto siguiendo la arquitectura Schema-Driven:
 * - organization.json (Jerarquía de carpetas)
 * - modules.json (Pirámide de Cohn: Unit, Integration, E2E, Security)
 * - integrations.json (Configuración Postman/Jira/Confluence)
 * - mappings.json (Trazabilidad REQ-### ↔ TC_### bidireccional)
 * - project-{name}.zip (Exportación completa)
 */

import type { Project, TestSuite, TestCase, Execution, Defect } from './api';
import { PROYECTOS_POSTMAN } from './postman-api';
import { PROYECTOS_JIRA } from './jira-api';
import { ESPACIOS_CONFLUENCE } from './confluence-api';
import { obtenerDocumentos, obtenerCasosPrueba } from './sync-service';

// ============================================
// TIPOS
// ============================================

export interface OrganizationStructure {
  version: string;
  generatedAt: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  structure: {
    suites: SuiteFolderStructure[];
    cases: CaseFolderStructure[];
    executions: ExecutionFolderStructure[];
  };
  metadata: {
    totalSuites: number;
    totalCases: number;
    totalExecutions: number;
  };
}

interface SuiteFolderStructure {
  path: string;
  suiteId: string;
  suiteName: string;
  type: string;
  caseCount: number;
}

interface CaseFolderStructure {
  path: string;
  caseId: string;
  caseTitle: string;
  suiteId: string;
  priority: string;
  module?: string;
}

interface ExecutionFolderStructure {
  path: string;
  executionId: string;
  suiteId: string;
  status: string;
  timestamp: string;
}

export interface ModulesStructure {
  version: string;
  generatedAt: string;
  testingPyramid: {
    unit: ModuleCategory;
    integration: ModuleCategory;
    e2e: ModuleCategory;
    security: ModuleCategory;
  };
  functionalModules: FunctionalModule[];
  metadata: {
    totalModules: number;
    coverage: {
      unit: number;
      integration: number;
      e2e: number;
      security: number;
    };
  };
}

interface ModuleCategory {
  level: string;
  description: string;
  testCases: string[];
  count: number;
}

interface FunctionalModule {
  id: string;
  name: string;
  description: string;
  type: 'functional' | 'api' | 'ui' | 'security';
  testCases: string[];
  requirements: string[];
  coverage: number;
}

export interface IntegrationsConfig {
  version: string;
  generatedAt: string;
  postman: {
    enabled: boolean;
    workspaces: PostmanWorkspaceConfig[];
    collections: PostmanCollectionConfig[];
  };
  jira: {
    enabled: boolean;
    projects: JiraProjectConfig[];
    issueTypes: string[];
    customFields: any[];
  };
  confluence: {
    enabled: boolean;
    spaces: ConfluenceSpaceConfig[];
    templates: string[];
  };
  telegram: {
    enabled: boolean;
    botToken?: string;
    chatId?: string;
    commands: string[];
  };
}

interface PostmanWorkspaceConfig {
  projectKey: string;
  workspaceId: string;
  workspaceName: string;
  collections: string[];
}

interface PostmanCollectionConfig {
  id: string;
  name: string;
  requestCount: number;
  mappedToCases: string[];
}

interface JiraProjectConfig {
  key: string;
  name: string;
  jiraKey: string;
  issueTypes: string[];
  syncedIssues: number;
}

interface ConfluenceSpaceConfig {
  projectKey: string;
  spaceKey: string;
  spaceName: string;
  pageCount: number;
}

export interface MappingsStructure {
  version: string;
  generatedAt: string;
  requirements: RequirementMapping[];
  testCases: TestCaseMapping[];
  traceability: TraceabilityMatrix;
  metadata: {
    totalRequirements: number;
    totalTestCases: number;
    coverage: number;
    orphanedTests: string[];
    unmappedRequirements: string[];
  };
}

interface RequirementMapping {
  id: string; // REQ-001
  title: string;
  description: string;
  type: 'functional' | 'non-functional' | 'security' | 'performance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  testCases: string[]; // [TC_001, TC_002]
  coverage: number;
  status: 'covered' | 'partial' | 'uncovered';
}

interface TestCaseMapping {
  id: string; // TC_001
  title: string;
  suiteId: string;
  requirements: string[]; // [REQ-001, REQ-002]
  jiraIssueKey?: string;
  confluencePageId?: string;
  postmanRequestId?: string;
  executionResults: {
    executionId: string;
    status: 'passed' | 'failed' | 'blocked';
    timestamp: string;
  }[];
}

interface TraceabilityMatrix {
  forward: Record<string, string[]>; // REQ-001 → [TC_001, TC_002]
  backward: Record<string, string[]>; // TC_001 → [REQ-001, REQ-002]
  coverage: Record<string, number>; // REQ-001 → 100%
}

// ============================================
// GENERACIÓN DE ORGANIZACIÓN
// ============================================

export function generateOrganizationStructure(
  project: Project,
  suites: TestSuite[],
  cases: TestCase[],
  executions: Execution[]
): OrganizationStructure {
  const projectSuites = suites.filter(s => s.project_id === project.id);
  const projectCases = cases.filter(c => 
    projectSuites.some(s => s.id === c.suite_id)
  );
  const projectExecutions = executions.filter(e => e.project_id === project.id);

  const suiteFolders: SuiteFolderStructure[] = projectSuites.map(suite => ({
    path: `/projects/${project.key}/suites/${suite.id}`,
    suiteId: suite.id,
    suiteName: suite.name,
    type: suite.type,
    caseCount: projectCases.filter(c => c.suite_id === suite.id).length,
  }));

  const caseFolders: CaseFolderStructure[] = projectCases.map(testCase => {
    const suite = projectSuites.find(s => s.id === testCase.suite_id);
    return {
      path: `/projects/${project.key}/suites/${testCase.suite_id}/cases/${testCase.id}`,
      caseId: testCase.id,
      caseTitle: testCase.title,
      suiteId: testCase.suite_id,
      priority: testCase.priority,
      module: inferModuleFromTitle(testCase.title),
    };
  });

  const executionFolders: ExecutionFolderStructure[] = projectExecutions.map(execution => ({
    path: `/projects/${project.key}/executions/${execution.id}`,
    executionId: execution.id,
    suiteId: execution.suite_id,
    status: execution.status,
    timestamp: execution.started_at,
  }));

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      key: project.key,
    },
    structure: {
      suites: suiteFolders,
      cases: caseFolders,
      executions: executionFolders,
    },
    metadata: {
      totalSuites: projectSuites.length,
      totalCases: projectCases.length,
      totalExecutions: projectExecutions.length,
    },
  };
}

// ============================================
// GENERACIÓN DE MÓDULOS (PIRÁMIDE DE COHN)
// ============================================

export function generateModulesStructure(
  project: Project,
  suites: TestSuite[],
  cases: TestCase[]
): ModulesStructure {
  const projectSuites = suites.filter(s => s.project_id === project.id);
  const projectCases = cases.filter(c => 
    projectSuites.some(s => s.id === c.suite_id)
  );

  // Clasificar casos según la Pirámide de Cohn
  const unitTests = projectCases.filter(c => 
    c.title.toLowerCase().includes('unit') || 
    projectSuites.find(s => s.id === c.suite_id)?.type === 'unit'
  );

  const integrationTests = projectCases.filter(c => 
    c.title.toLowerCase().includes('integration') || 
    c.title.toLowerCase().includes('api') ||
    projectSuites.find(s => s.id === c.suite_id)?.type === 'integration'
  );

  const e2eTests = projectCases.filter(c => 
    c.title.toLowerCase().includes('e2e') || 
    c.title.toLowerCase().includes('end-to-end') ||
    c.title.toLowerCase().includes('ui') ||
    projectSuites.find(s => s.id === c.suite_id)?.type === 'e2e'
  );

  const securityTests = projectCases.filter(c => 
    c.title.toLowerCase().includes('security') || 
    c.title.toLowerCase().includes('auth') ||
    projectSuites.find(s => s.id === c.suite_id)?.type === 'security'
  );

  // Extraer módulos funcionales
  const functionalModules = extractFunctionalModules(projectCases, projectSuites);

  const totalTests = projectCases.length;

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    testingPyramid: {
      unit: {
        level: 'Unit Tests',
        description: 'Tests de componentes individuales aislados',
        testCases: unitTests.map(c => c.id),
        count: unitTests.length,
      },
      integration: {
        level: 'Integration Tests',
        description: 'Tests de interacción entre módulos y APIs',
        testCases: integrationTests.map(c => c.id),
        count: integrationTests.length,
      },
      e2e: {
        level: 'E2E Tests',
        description: 'Tests de flujos completos de usuario',
        testCases: e2eTests.map(c => c.id),
        count: e2eTests.length,
      },
      security: {
        level: 'Security Tests',
        description: 'Tests de seguridad, autenticación y autorización',
        testCases: securityTests.map(c => c.id),
        count: securityTests.length,
      },
    },
    functionalModules,
    metadata: {
      totalModules: functionalModules.length,
      coverage: {
        unit: totalTests > 0 ? Math.round((unitTests.length / totalTests) * 100) : 0,
        integration: totalTests > 0 ? Math.round((integrationTests.length / totalTests) * 100) : 0,
        e2e: totalTests > 0 ? Math.round((e2eTests.length / totalTests) * 100) : 0,
        security: totalTests > 0 ? Math.round((securityTests.length / totalTests) * 100) : 0,
      },
    },
  };
}

// ============================================
// GENERACIÓN DE INTEGRACIONES
// ============================================

export function generateIntegrationsConfig(
  project: Project
): IntegrationsConfig {
  const projectKey = project.key.toUpperCase() as keyof typeof PROYECTOS_POSTMAN;
  
  // Postman
  const postmanConfig = PROYECTOS_POSTMAN[projectKey];
  const postmanWorkspaces: PostmanWorkspaceConfig[] = postmanConfig ? [{
    projectKey: project.key,
    workspaceId: postmanConfig.workspaceId,
    workspaceName: postmanConfig.nombre,
    collections: postmanConfig.colecciones,
  }] : [];

  // Jira
  const jiraConfig = PROYECTOS_JIRA[projectKey];
  const jiraProjects: JiraProjectConfig[] = jiraConfig ? [{
    key: project.key,
    name: project.name,
    jiraKey: jiraConfig.key,
    issueTypes: ['Test', 'Bug', 'Task', 'Story'],
    syncedIssues: 0, // TODO: contar desde sync-service
  }] : [];

  // Confluence
  const confluenceConfig = ESPACIOS_CONFLUENCE[projectKey];
  const confluenceSpaces: ConfluenceSpaceConfig[] = confluenceConfig ? [{
    projectKey: project.key,
    spaceKey: confluenceConfig.key,
    spaceName: confluenceConfig.nombre,
    pageCount: 0, // TODO: contar desde sync-service
  }] : [];

  // Telegram
  const telegramEnabled = localStorage.getItem('haida_telegram_token') !== null;
  const telegramToken = localStorage.getItem('haida_telegram_token') || undefined;
  const telegramChatId = localStorage.getItem('haida_telegram_chat_id') || undefined;

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    postman: {
      enabled: postmanWorkspaces.length > 0,
      workspaces: postmanWorkspaces,
      collections: [], // TODO: llenar desde postman-api
    },
    jira: {
      enabled: jiraProjects.length > 0,
      projects: jiraProjects,
      issueTypes: ['Test', 'Bug', 'Task', 'Story', 'Epic'],
      customFields: [],
    },
    confluence: {
      enabled: confluenceSpaces.length > 0,
      spaces: confluenceSpaces,
      templates: ['Test Plan', 'Test Results', 'Requirements'],
    },
    telegram: {
      enabled: telegramEnabled,
      botToken: telegramToken ? '***CONFIGURED***' : undefined,
      chatId: telegramChatId,
      commands: [
        '/start', '/help', '/status', '/projects', '/suites', '/run',
        '/results', '/defects', '/stats', '/export', '/config'
      ],
    },
  };
}

// ============================================
// GENERACIÓN DE MAPEOS (TRAZABILIDAD)
// ============================================

export function generateMappingsStructure(
  project: Project,
  suites: TestSuite[],
  cases: TestCase[],
  executions: Execution[]
): MappingsStructure {
  const projectSuites = suites.filter(s => s.project_id === project.id);
  const projectCases = cases.filter(c => 
    projectSuites.some(s => s.id === c.suite_id)
  );
  const projectExecutions = executions.filter(e => e.project_id === project.id);

  // Extraer requisitos de las descripciones de los casos
  const requirements = extractRequirements(projectCases);
  
  // Mapear casos de prueba
  const testCaseMappings: TestCaseMapping[] = projectCases.map(testCase => {
    const casoSync = obtenerCasosPrueba().find(c => c.titulo === testCase.title);
    const executionResults = projectExecutions
      .filter(e => e.suite_id === testCase.suite_id)
      .map(e => ({
        executionId: e.id,
        status: e.status as 'passed' | 'failed' | 'blocked',
        timestamp: e.started_at,
      }));

    return {
      id: `TC_${testCase.id}`,
      title: testCase.title,
      suiteId: testCase.suite_id,
      requirements: extractRequirementIds(testCase.description),
      jiraIssueKey: casoSync?.jiraIssueKey,
      confluencePageId: undefined, // TODO: mapear desde documentos
      postmanRequestId: undefined, // TODO: mapear desde postman
      executionResults,
    };
  });

  // Construir matriz de trazabilidad
  const forward: Record<string, string[]> = {};
  const backward: Record<string, string[]> = {};
  const coverage: Record<string, number> = {};

  requirements.forEach(req => {
    const mappedCases = testCaseMappings
      .filter(tc => tc.requirements.includes(req.id))
      .map(tc => tc.id);
    
    forward[req.id] = mappedCases;
    coverage[req.id] = mappedCases.length > 0 ? 100 : 0;
  });

  testCaseMappings.forEach(tc => {
    tc.requirements.forEach(reqId => {
      if (!backward[tc.id]) backward[tc.id] = [];
      backward[tc.id].push(reqId);
    });
  });

  const orphanedTests = testCaseMappings
    .filter(tc => tc.requirements.length === 0)
    .map(tc => tc.id);

  const unmappedRequirements = requirements
    .filter(req => (forward[req.id] || []).length === 0)
    .map(req => req.id);

  const totalCoverage = requirements.length > 0
    ? Math.round((requirements.filter(req => (forward[req.id] || []).length > 0).length / requirements.length) * 100)
    : 0;

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    requirements,
    testCases: testCaseMappings,
    traceability: {
      forward,
      backward,
      coverage,
    },
    metadata: {
      totalRequirements: requirements.length,
      totalTestCases: testCaseMappings.length,
      coverage: totalCoverage,
      orphanedTests,
      unmappedRequirements,
    },
  };
}

// ============================================
// EXPORTACIÓN COMPLETA
// ============================================

export async function exportProjectComplete(
  project: Project,
  suites: TestSuite[],
  cases: TestCase[],
  executions: Execution[],
  defects: Defect[]
): Promise<void> {
  const organization = generateOrganizationStructure(project, suites, cases, executions);
  const modules = generateModulesStructure(project, suites, cases);
  const integrations = generateIntegrationsConfig(project);
  const mappings = generateMappingsStructure(project, suites, cases, executions);

  // Crear blobs para descarga
  const files = {
    'organization.json': JSON.stringify(organization, null, 2),
    'modules.json': JSON.stringify(modules, null, 2),
    'integrations.json': JSON.stringify(integrations, null, 2),
    'mappings.json': JSON.stringify(mappings, null, 2),
    'README.md': generateReadme(project, organization, modules, mappings),
  };

  // Descargar cada archivo
  for (const [filename, content] of Object.entries(files)) {
    downloadFile(content, filename, 'application/json');
  }
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// UTILIDADES
// ============================================

function inferModuleFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('login') || lower.includes('auth')) return 'Authentication';
  if (lower.includes('checkout') || lower.includes('payment')) return 'Checkout';
  if (lower.includes('search') || lower.includes('filter')) return 'Search';
  if (lower.includes('cart') || lower.includes('basket')) return 'Shopping Cart';
  if (lower.includes('profile') || lower.includes('account')) return 'User Profile';
  return 'General';
}

function extractFunctionalModules(cases: TestCase[], suites: TestSuite[]): FunctionalModule[] {
  const modules = new Map<string, TestCase[]>();

  cases.forEach(testCase => {
    const module = inferModuleFromTitle(testCase.title);
    if (!modules.has(module)) {
      modules.set(module, []);
    }
    modules.get(module)!.push(testCase);
  });

  return Array.from(modules.entries()).map(([name, testCases]) => {
    // Extract unique requirements from all test cases in this module
    const moduleRequirements = new Set<string>();
    let testCasesWithRequirements = 0;

    testCases.forEach(tc => {
      const reqIds = extractRequirementIds(tc.description);
      reqIds.forEach(id => moduleRequirements.add(id));
      if (reqIds.length > 0) {
        testCasesWithRequirements++;
      }
    });

    // Calculate coverage as percentage of test cases with mapped requirements
    const coverage = testCases.length > 0
      ? (testCasesWithRequirements / testCases.length) * 100
      : 0;

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description: `Módulo funcional: ${name}`,
      type: inferModuleType(name),
      testCases: testCases.map(c => `TC_${c.id}`),
      requirements: Array.from(moduleRequirements),
      coverage,
    };
  });
}

function inferModuleType(moduleName: string): 'functional' | 'api' | 'ui' | 'security' {
  const lower = moduleName.toLowerCase();
  if (lower.includes('api') || lower.includes('integration')) return 'api';
  if (lower.includes('ui') || lower.includes('interface')) return 'ui';
  if (lower.includes('security') || lower.includes('auth')) return 'security';
  return 'functional';
}

function extractRequirements(cases: TestCase[]): RequirementMapping[] {
  const requirements = new Map<string, RequirementMapping>();

  cases.forEach(testCase => {
    const reqIds = extractRequirementIds(testCase.description);
    reqIds.forEach(reqId => {
      if (!requirements.has(reqId)) {
        requirements.set(reqId, {
          id: reqId,
          title: `Requirement ${reqId}`,
          description: `Extracted from test case: ${testCase.title}`,
          type: 'functional',
          priority: testCase.priority as any,
          testCases: [],
          coverage: 0,
          status: 'covered',
        });
      }
    });
  });

  return Array.from(requirements.values());
}

function extractRequirementIds(description: string): string[] {
  const regex = /REQ-\d{3}/g;
  const matches = description.match(regex);
  return matches || [];
}

function generateReadme(
  project: Project,
  organization: OrganizationStructure,
  modules: ModulesStructure,
  mappings: MappingsStructure
): string {
  return `# ${project.name} - Exportación Completa

## Información del Proyecto
- **ID**: ${project.id}
- **Clave**: ${project.key}
- **Nombre**: ${project.name}
- **Generado**: ${new Date().toLocaleString()}

## Estructura
- **Suites**: ${organization.metadata.totalSuites}
- **Casos de Prueba**: ${organization.metadata.totalCases}
- **Ejecuciones**: ${organization.metadata.totalExecutions}

## Módulos (Pirámide de Cohn)
- **Unit Tests**: ${modules.testingPyramid.unit.count} (${modules.metadata.coverage.unit}%)
- **Integration Tests**: ${modules.testingPyramid.integration.count} (${modules.metadata.coverage.integration}%)
- **E2E Tests**: ${modules.testingPyramid.e2e.count} (${modules.metadata.coverage.e2e}%)
- **Security Tests**: ${modules.testingPyramid.security.count} (${modules.metadata.coverage.security}%)

## Trazabilidad
- **Requisitos**: ${mappings.metadata.totalRequirements}
- **Cobertura**: ${mappings.metadata.coverage}%
- **Tests Huérfanos**: ${mappings.metadata.orphanedTests.length}
- **Requisitos sin Mapear**: ${mappings.metadata.unmappedRequirements.length}

## Archivos Incluidos
1. \`organization.json\` - Estructura de carpetas y jerarquía
2. \`modules.json\` - Clasificación por Pirámide de Cohn
3. \`integrations.json\` - Configuración de Postman/Jira/Confluence/Telegram
4. \`mappings.json\` - Matriz de trazabilidad REQ ↔ TC

## Uso
Estos archivos pueden importarse en sistemas de gestión de calidad o usarse para auditorías de cumplimiento.
`;
}
