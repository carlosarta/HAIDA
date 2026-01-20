/**
 * Servicio de integración con Confluence API
 * Permite sincronizar documentación desde Confluence
 * 
 * ⚠️ SEGURIDAD: Credenciales encriptadas con AES-256
 */

import { setEncryptedJSON, getEncryptedJSON, removeEncrypted } from './encryption-service';

const CONFLUENCE_DOMAIN = 'stayarta.atlassian.net';
const CONFLUENCE_BASE_URL = `https://${CONFLUENCE_DOMAIN}/wiki`;

export interface EspacioConfluence {
  key: string;
  nombre: string;
  url: string;
  descripcion?: string;
  tipo: 'proyecto' | 'global';
}

// ============================================
// ESPACIOS CONFIGURADOS
// ============================================

export const ESPACIOS_CONFLUENCE: Record<string, EspacioConfluence> = {
  PRIVALIA: {
    key: 'PRIVALIA',
    nombre: 'Privalia',
    url: 'https://stayarta.atlassian.net/wiki/x/E4E8AQ',
    tipo: 'proyecto',
    descripcion: 'Documentación del proyecto Privalia',
  },
  CTB: {
    key: 'CTB',
    nombre: 'CTB',
    url: 'https://stayarta.atlassian.net/wiki/x/f4AZAQ',
    tipo: 'proyecto',
    descripcion: 'Documentación del proyecto CTB',
  },
  HAIDA: {
    key: 'HAIDA',
    nombre: 'HAIDA',
    url: 'https://stayarta.atlassian.net/wiki/x/AQDp',
    tipo: 'proyecto',
    descripcion: 'Documentación de la plataforma HAIDA',
  },
};

// ============================================
// URLs GLOBALES
// ============================================

export const CONFLUENCE_URLS = {
  home: 'https://stayarta.atlassian.net/wiki/home',
  espacios: 'https://stayarta.atlassian.net/wiki/spaces',
  recientes: 'https://stayarta.atlassian.net/wiki/recent',
  buscar: 'https://stayarta.atlassian.net/wiki/search',
};

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

/**
 * Abre la página principal de Confluence
 */
export function abrirConfluenceHome(): void {
  window.open(CONFLUENCE_URLS.home, '_blank');
}

/**
 * Abre un espacio específico de Confluence
 */
export function abrirEspacioConfluence(espacio: keyof typeof ESPACIOS_CONFLUENCE): void {
  const espacioConfig = ESPACIOS_CONFLUENCE[espacio];
  if (espacioConfig) {
    window.open(espacioConfig.url, '_blank');
  }
}

/**
 * Abre la página de espacios
 */
export function abrirEspaciosConfluence(): void {
  window.open(CONFLUENCE_URLS.espacios, '_blank');
}

/**
 * Abre la búsqueda de Confluence
 */
export function abrirBusquedaConfluence(termino?: string): void {
  const url = termino 
    ? `${CONFLUENCE_URLS.buscar}?text=${encodeURIComponent(termino)}`
    : CONFLUENCE_URLS.buscar;
  window.open(url, '_blank');
}

/**
 * Obtiene la lista de espacios disponibles
 */
export function obtenerEspaciosConfluence(): EspacioConfluence[] {
  return Object.values(ESPACIOS_CONFLUENCE);
}

/**
 * Obtiene un espacio específico por su clave
 */
export function obtenerEspacioPorClave(key: string): EspacioConfluence | undefined {
  return Object.values(ESPACIOS_CONFLUENCE).find(e => e.key === key);
}

// ============================================
// INTEGRACIÓN CON API DE CONFLUENCE
// ============================================

/**
 * Obtiene la configuración de autenticación de Confluence
 */
export function obtenerConfigConfluence(): { email: string; apiToken: string } | null {
  return getEncryptedJSON<{ email: string; apiToken: string }>('confluence_config');
}

/**
 * Guarda la configuración de autenticación de Confluence
 */
export function guardarConfigConfluence(email: string, apiToken: string): void {
  setEncryptedJSON('confluence_config', { email, apiToken });
}

/**
 * Elimina la configuración de Confluence
 */
export function eliminarConfigConfluence(): void {
  removeEncrypted('confluence_config');
}

/**
 * Verifica si Confluence está configurado
 */
export function estaConfiguradoConfluence(): boolean {
  return !!obtenerConfigConfluence();
}

/**
 * Genera headers para requests a Confluence API
 */
function obtenerHeadersConfluence(): HeadersInit {
  const config = obtenerConfigConfluence();
  if (!config) {
    throw new Error('Confluence no está configurado');
  }

  const auth = btoa(`${config.email}:${config.apiToken}`);
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Obtiene las páginas de un espacio
 */
export async function obtenerPaginasEspacio(spaceKey: string, limit: number = 25): Promise<any[]> {
  try {
    const response = await fetch(
      `${CONFLUENCE_BASE_URL}/rest/api/content?spaceKey=${spaceKey}&limit=${limit}&expand=version,space`,
      {
        method: 'GET',
        headers: obtenerHeadersConfluence(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener páginas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error obteniendo páginas de Confluence:', error);
    throw error;
  }
}

/**
 * Crea una nueva página en Confluence
 */
export async function crearPaginaConfluence(datos: {
  spaceKey: string;
  titulo: string;
  contenido: string;
  parentId?: string;
}): Promise<any> {
  try {
    const response = await fetch(
      `${CONFLUENCE_BASE_URL}/rest/api/content`,
      {
        method: 'POST',
        headers: obtenerHeadersConfluence(),
        body: JSON.stringify({
          type: 'page',
          title: datos.titulo,
          space: {
            key: datos.spaceKey,
          },
          body: {
            storage: {
              value: datos.contenido,
              representation: 'storage',
            },
          },
          ...(datos.parentId && {
            ancestors: [{ id: datos.parentId }],
          }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al crear página: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creando página en Confluence:', error);
    throw error;
  }
}

/**
 * Actualiza una página existente en Confluence
 */
export async function actualizarPaginaConfluence(
  pageId: string,
  titulo: string,
  contenido: string,
  version: number
): Promise<void> {
  try {
    const response = await fetch(
      `${CONFLUENCE_BASE_URL}/rest/api/content/${pageId}`,
      {
        method: 'PUT',
        headers: obtenerHeadersConfluence(),
        body: JSON.stringify({
          type: 'page',
          title: titulo,
          body: {
            storage: {
              value: contenido,
              representation: 'storage',
            },
          },
          version: {
            number: version + 1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al actualizar página: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error actualizando página en Confluence:', error);
    throw error;
  }
}

/**
 * Busca contenido en Confluence
 */
export async function buscarEnConfluence(query: string, spaceKey?: string): Promise<any[]> {
  try {
    const cql = spaceKey 
      ? `text ~ "${query}" AND space = ${spaceKey}`
      : `text ~ "${query}"`;

    const response = await fetch(
      `${CONFLUENCE_BASE_URL}/rest/api/content/search?cql=${encodeURIComponent(cql)}`,
      {
        method: 'GET',
        headers: obtenerHeadersConfluence(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al buscar contenido: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error buscando en Confluence:', error);
    throw error;
  }
}

/**
 * Publica un reporte de HAIDA en Confluence
 */
export async function publicarReporteEnConfluence(reporte: {
  titulo: string;
  proyecto: keyof typeof ESPACIOS_CONFLUENCE;
  fecha: string;
  resumen: string;
  detalles: {
    ejecuciones: number;
    aprobadas: number;
    fallidas: number;
    defectos: number;
  };
  graficas?: string[]; // URLs de imágenes
}): Promise<{ pageId: string; url: string }> {
  try {
    const espacioConfig = ESPACIOS_CONFLUENCE[reporte.proyecto];
    if (!espacioConfig) {
      throw new Error('Espacio no encontrado');
    }

    // Generar HTML del reporte
    const contenidoHTML = generarHTMLReporte(reporte);

    const pagina = await crearPaginaConfluence({
      spaceKey: espacioConfig.key,
      titulo: `${reporte.titulo} - ${reporte.fecha}`,
      contenido: contenidoHTML,
    });

    return {
      pageId: pagina.id,
      url: `${CONFLUENCE_BASE_URL}${pagina._links.webui}`,
    };
  } catch (error) {
    console.error('Error publicando reporte en Confluence:', error);
    throw error;
  }
}

/**
 * Genera el HTML de un reporte para Confluence
 */
function generarHTMLReporte(reporte: any): string {
  return `
    <h1>${reporte.titulo}</h1>
    <p><strong>Fecha:</strong> ${reporte.fecha}</p>
    
    <h2>Resumen Ejecutivo</h2>
    <p>${reporte.resumen}</p>
    
    <h2>Métricas</h2>
    <table>
      <tbody>
        <tr>
          <th>Ejecuciones Totales</th>
          <td>${reporte.detalles.ejecuciones}</td>
        </tr>
        <tr>
          <th>Pruebas Aprobadas</th>
          <td style="color: green;">${reporte.detalles.aprobadas}</td>
        </tr>
        <tr>
          <th>Pruebas Fallidas</th>
          <td style="color: red;">${reporte.detalles.fallidas}</td>
        </tr>
        <tr>
          <th>Defectos Encontrados</th>
          <td>${reporte.detalles.defectos}</td>
        </tr>
      </tbody>
    </table>
    
    ${reporte.graficas && reporte.graficas.length > 0 ? `
      <h2>Gráficas</h2>
      ${reporte.graficas.map((url: string) => `<p><img src="${url}" alt="Gráfica" /></p>`).join('')}
    ` : ''}
    
    <p><em>Reporte generado automáticamente por HAIDA QA Platform</em></p>
  `;
}

/**
 * Obtiene las páginas recientes del usuario
 */
export async function obtenerPaginasRecientes(limit: number = 10): Promise<any[]> {
  try {
    const response = await fetch(
      `${CONFLUENCE_BASE_URL}/rest/api/content?limit=${limit}&expand=space,version&orderby=lastmodified`,
      {
        method: 'GET',
        headers: obtenerHeadersConfluence(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener páginas recientes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error obteniendo páginas recientes de Confluence:', error);
    throw error;
  }
}