/**
 * Servicio de integración con Jira API
 * Permite sincronizar casos de prueba, defectos y proyectos desde Jira
 * 
 * ⚠️ SEGURIDAD: Credenciales encriptadas con AES-256
 */

import { setEncryptedJSON, getEncryptedJSON, removeEncrypted } from './encryption-service';

const JIRA_DOMAIN = 'stayarta.atlassian.net';
const JIRA_BASE_URL = `https://${JIRA_DOMAIN}`;

export interface ProyectoJira {
  key: string;
  nombre: string;
  url: string;
  boardUrl?: string;
  tipo: 'software' | 'servicedesk' | 'business';
  descripcion?: string;
}

// ============================================
// PROYECTOS CONFIGURADOS
// ============================================

export const PROYECTOS_JIRA: Record<string, ProyectoJira> = {
  PRIVALIA: {
    key: 'P20F',
    nombre: 'Privalia',
    url: 'https://stayarta.atlassian.net/jira/software/c/projects/P20F/boards/167',
    boardUrl: 'https://stayarta.atlassian.net/jira/software/c/projects/P20F/boards/167',
    tipo: 'software',
    descripcion: 'Proyecto Privalia - Gestión de pruebas y desarrollo',
  },
  CTB: {
    key: 'CTB',
    nombre: 'CTB',
    url: 'https://stayarta.atlassian.net/jira/software/c/projects/CTB/boards/134',
    boardUrl: 'https://stayarta.atlassian.net/jira/software/c/projects/CTB/boards/134',
    tipo: 'software',
    descripcion: 'Proyecto CTB - Gestión de pruebas y desarrollo',
  },
  HAIDA: {
    key: 'HAID',
    nombre: 'HAIDA',
    url: 'https://stayarta.atlassian.net/jira/software/c/projects/HAID/boards/168',
    boardUrl: 'https://stayarta.atlassian.net/jira/software/c/projects/HAID/boards/168',
    tipo: 'software',
    descripcion: 'Proyecto HAIDA - Plataforma QA',
  },
  HAIDA_DEV: {
    key: 'HAIDA',
    nombre: 'HAIDA Service Desk',
    url: 'https://stayarta.atlassian.net/jira/servicedesk/projects/HAIDA/settings/details',
    tipo: 'servicedesk',
    descripcion: 'Service Desk de HAIDA - Soporte y desarrollo',
  },
};

// ============================================
// URLs GLOBALES
// ============================================

export const JIRA_URLS = {
  proyectos: 'https://stayarta.atlassian.net/jira/projects?page=1&sortKey=name&sortOrder=ASC&types=software%2Cbusiness',
  dashboard: 'https://stayarta.atlassian.net/jira/dashboards',
  settings: 'https://stayarta.atlassian.net/jira/settings/projects',
};

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

/**
 * Abre la página de proyectos de Jira
 */
export function abrirProyectosJira(): void {
  window.open(JIRA_URLS.proyectos, '_blank');
}

/**
 * Abre un proyecto específico de Jira
 */
export function abrirProyectoJira(proyecto: keyof typeof PROYECTOS_JIRA): void {
  const proyectoConfig = PROYECTOS_JIRA[proyecto];
  if (proyectoConfig) {
    window.open(proyectoConfig.url, '_blank');
  }
}

/**
 * Abre el tablero de un proyecto específico
 */
export function abrirTableroJira(proyecto: keyof typeof PROYECTOS_JIRA): void {
  const proyectoConfig = PROYECTOS_JIRA[proyecto];
  if (proyectoConfig?.boardUrl) {
    window.open(proyectoConfig.boardUrl, '_blank');
  }
}

/**
 * Obtiene la lista de proyectos disponibles
 */
export function obtenerProyectosJira(): ProyectoJira[] {
  return Object.values(PROYECTOS_JIRA);
}

/**
 * Obtiene un proyecto específico por su clave
 */
export function obtenerProyectoPorClave(key: string): ProyectoJira | undefined {
  return Object.values(PROYECTOS_JIRA).find(p => p.key === key);
}

// ============================================
// INTEGRACIÓN CON API DE JIRA
// ============================================

/**
 * Obtiene la configuración de autenticación de Jira
 */
export function obtenerConfigJira(): { email: string; apiToken: string } | null {
  return getEncryptedJSON<{ email: string; apiToken: string }>('jira_config');
}

/**
 * Guarda la configuración de autenticación de Jira
 */
export function guardarConfigJira(email: string, apiToken: string): void {
  setEncryptedJSON('jira_config', { email, apiToken });
}

/**
 * Elimina la configuración de Jira
 */
export function eliminarConfigJira(): void {
  removeEncrypted('jira_config');
}

/**
 * Verifica si Jira está configurado
 */
export function estaConfiguradoJira(): boolean {
  return !!obtenerConfigJira();
}

/**
 * Genera headers para requests a Jira API
 */
function obtenerHeadersJira(): HeadersInit {
  const config = obtenerConfigJira();
  if (!config) {
    throw new Error('Jira no está configurado');
  }

  const auth = btoa(`${config.email}:${config.apiToken}`);
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Obtiene los issues de un proyecto
 */
export async function obtenerIssuesProyecto(projectKey: string, maxResults: number = 50): Promise<any[]> {
  try {
    const response = await fetch(
      `${JIRA_BASE_URL}/rest/api/3/search?jql=project=${projectKey}&maxResults=${maxResults}`,
      {
        method: 'GET',
        headers: obtenerHeadersJira(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener issues: ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues || [];
  } catch (error) {
    console.error('Error obteniendo issues de Jira:', error);
    throw error;
  }
}

/**
 * Crea un nuevo issue en Jira
 */
export async function crearIssueJira(datos: {
  projectKey: string;
  summary: string;
  description: string;
  issueType: string;
  priority?: string;
}): Promise<any> {
  try {
    const response = await fetch(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      {
        method: 'POST',
        headers: obtenerHeadersJira(),
        body: JSON.stringify({
          fields: {
            project: {
              key: datos.projectKey,
            },
            summary: datos.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: datos.description,
                    },
                  ],
                },
              ],
            },
            issuetype: {
              name: datos.issueType,
            },
            ...(datos.priority && {
              priority: {
                name: datos.priority,
              },
            }),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al crear issue: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creando issue en Jira:', error);
    throw error;
  }
}

/**
 * Actualiza un issue existente
 */
export async function actualizarIssueJira(issueKey: string, campos: any): Promise<void> {
  try {
    const response = await fetch(
      `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`,
      {
        method: 'PUT',
        headers: obtenerHeadersJira(),
        body: JSON.stringify({
          fields: campos,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al actualizar issue: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error actualizando issue en Jira:', error);
    throw error;
  }
}

/**
 * Obtiene las transiciones disponibles para un issue
 */
export async function obtenerTransicionesIssue(issueKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
      {
        method: 'GET',
        headers: obtenerHeadersJira(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener transiciones: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transitions || [];
  } catch (error) {
    console.error('Error obteniendo transiciones de Jira:', error);
    throw error;
  }
}

/**
 * Realiza una transición en un issue
 */
export async function transicionarIssue(issueKey: string, transitionId: string): Promise<void> {
  try {
    const response = await fetch(
      `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
      {
        method: 'POST',
        headers: obtenerHeadersJira(),
        body: JSON.stringify({
          transition: {
            id: transitionId,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al transicionar issue: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error transicionando issue en Jira:', error);
    throw error;
  }
}

/**
 * Sincroniza un defecto de HAIDA con Jira
 */
export async function sincronizarDefectoConJira(defecto: {
  titulo: string;
  descripcion: string;
  severidad: string;
  proyecto: keyof typeof PROYECTOS_JIRA;
}): Promise<{ issueKey: string; url: string }> {
  try {
    const proyectoConfig = PROYECTOS_JIRA[defecto.proyecto];
    if (!proyectoConfig) {
      throw new Error('Proyecto no encontrado');
    }

    const prioridad = mapearSeveridadAPrioridad(defecto.severidad);

    const issue = await crearIssueJira({
      projectKey: proyectoConfig.key,
      summary: defecto.titulo,
      description: defecto.descripcion,
      issueType: 'Bug',
      priority: prioridad,
    });

    return {
      issueKey: issue.key,
      url: `${JIRA_BASE_URL}/browse/${issue.key}`,
    };
  } catch (error) {
    console.error('Error sincronizando defecto con Jira:', error);
    throw error;
  }
}

/**
 * Mapea la severidad de HAIDA a la prioridad de Jira
 */
function mapearSeveridadAPrioridad(severidad: string): string {
  const mapa: Record<string, string> = {
    critical: 'Highest',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    trivial: 'Lowest',
  };
  return mapa[severidad.toLowerCase()] || 'Medium';
}