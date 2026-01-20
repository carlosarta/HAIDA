/**
 * Servicio de integración con Postman API
 * Permite cargar y gestionar colecciones de pruebas desde Postman
 */

const POSTMAN_API_URL = 'https://api.getpostman.com';
const POSTMAN_WORKSPACE_ID = 'bfdc7712-ccbd-4181-88a9-0e14bf4abcf1';
const POSTMAN_TEAM_URL = 'https://www.postman.com/posthaida';

export interface PostmanCollection {
  id: string;
  name: string;
  uid: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostmanAPI {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostmanEnvironment {
  id: string;
  name: string;
  values: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
}

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Obtiene el API Key de Postman almacenado
 */
export function obtenerPostmanApiKey(): string | null {
  return localStorage.getItem('postman_api_key');
}

/**
 * Guarda el API Key de Postman
 */
export function guardarPostmanApiKey(apiKey: string): void {
  localStorage.setItem('postman_api_key', apiKey);
}

/**
 * Elimina el API Key de Postman
 */
export function eliminarPostmanApiKey(): void {
  localStorage.removeItem('postman_api_key');
}

/**
 * Verifica si Postman está configurado
 */
export function estaConfiguradoPostman(): boolean {
  return !!obtenerPostmanApiKey();
}

// ============================================
// HEADERS PARA REQUESTS
// ============================================

function obtenerHeaders(): HeadersInit {
  const apiKey = obtenerPostmanApiKey();
  if (!apiKey) {
    throw new Error('Postman API Key no configurado');
  }
  
  return {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  };
}

// ============================================
// COLECCIONES
// ============================================

/**
 * Obtiene todas las colecciones del workspace de HAIDA
 */
export async function obtenerColecciones(): Promise<PostmanCollection[]> {
  try {
    const response = await fetch(
      `${POSTMAN_API_URL}/collections?workspace=${POSTMAN_WORKSPACE_ID}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener colecciones: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collections || [];
  } catch (error) {
    console.error('Error obteniendo colecciones de Postman:', error);
    throw error;
  }
}

/**
 * Obtiene una colección específica por ID
 */
export async function obtenerColeccion(collectionId: string): Promise<any> {
  try {
    const response = await fetch(
      `${POSTMAN_API_URL}/collections/${collectionId}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener colección: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection;
  } catch (error) {
    console.error('Error obteniendo colección de Postman:', error);
    throw error;
  }
}

/**
 * Importa una colección de Postman a HAIDA
 */
export async function importarColeccion(collectionId: string): Promise<{
  nombre: string;
  descripcion: string;
  requests: any[];
}> {
  try {
    const coleccion = await obtenerColeccion(collectionId);
    
    // Convertir la estructura de Postman a formato HAIDA
    const requests = extraerRequestsDeColeccion(coleccion);
    
    return {
      nombre: coleccion.info.name,
      descripcion: coleccion.info.description || '',
      requests,
    };
  } catch (error) {
    console.error('Error importando colección:', error);
    throw error;
  }
}

/**
 * Extrae los requests de una colección de Postman
 */
function extraerRequestsDeColeccion(coleccion: any): any[] {
  const requests: any[] = [];
  
  function procesarItem(item: any, carpeta: string = '') {
    if (item.request) {
      // Es un request
      requests.push({
        nombre: item.name,
        metodo: item.request.method,
        url: typeof item.request.url === 'string' 
          ? item.request.url 
          : item.request.url?.raw || '',
        headers: item.request.header || [],
        body: item.request.body,
        carpeta,
        descripcion: item.request.description || '',
      });
    }
    
    if (item.item && Array.isArray(item.item)) {
      // Es una carpeta con sub-items
      const nuevaCarpeta = carpeta ? `${carpeta}/${item.name}` : item.name;
      item.item.forEach((subItem: any) => procesarItem(subItem, nuevaCarpeta));
    }
  }
  
  if (coleccion.item) {
    coleccion.item.forEach((item: any) => procesarItem(item));
  }
  
  return requests;
}

// ============================================
// APIs
// ============================================

/**
 * Obtiene todas las APIs del workspace
 */
export async function obtenerAPIs(): Promise<PostmanAPI[]> {
  try {
    const response = await fetch(
      `${POSTMAN_API_URL}/apis?workspace=${POSTMAN_WORKSPACE_ID}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener APIs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.apis || [];
  } catch (error) {
    console.error('Error obteniendo APIs de Postman:', error);
    throw error;
  }
}

/**
 * Obtiene una API específica por ID
 */
export async function obtenerAPI(apiId: string): Promise<any> {
  try {
    const response = await fetch(
      `${POSTMAN_API_URL}/apis/${apiId}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener API: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo API de Postman:', error);
    throw error;
  }
}

// ============================================
// ENVIRONMENTS
// ============================================

/**
 * Obtiene todos los entornos del workspace
 */
export async function obtenerEntornos(): Promise<PostmanEnvironment[]> {
  try {
    const response = await fetch(
      `${POSTMAN_API_URL}/environments?workspace=${POSTMAN_WORKSPACE_ID}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener entornos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.environments || [];
  } catch (error) {
    console.error('Error obteniendo entornos de Postman:', error);
    throw error;
  }
}

// ============================================
// PROYECTOS ESPECÍFICOS
// ============================================

export const PROYECTOS_POSTMAN = {
  CTB: {
    nombre: 'CTB',
    colecciones: ['CTB Collection'],
    apis: ['CTB API'],
  },
  HAIDA: {
    nombre: 'HAIDA',
    colecciones: ['HAIDA Collection'],
    apis: ['HAIDA API'],
  },
  PRIVALIA: {
    nombre: 'Privalia',
    colecciones: ['Privalia Collection'],
    apis: ['Privalia API'],
  },
};

/**
 * Obtiene las colecciones de un proyecto específico
 */
export async function obtenerColeccionesProyecto(proyecto: keyof typeof PROYECTOS_POSTMAN): Promise<PostmanCollection[]> {
  const todasColecciones = await obtenerColecciones();
  const nombresColecciones = PROYECTOS_POSTMAN[proyecto].colecciones;
  
  return todasColecciones.filter(col => 
    nombresColecciones.some(nombre => col.name.includes(nombre))
  );
}

/**
 * Obtiene las APIs de un proyecto específico
 */
export async function obtenerAPIsProyecto(proyecto: keyof typeof PROYECTOS_POSTMAN): Promise<PostmanAPI[]> {
  const todasAPIs = await obtenerAPIs();
  const nombresAPIs = PROYECTOS_POSTMAN[proyecto].apis;
  
  return todasAPIs.filter(api => 
    nombresAPIs.some(nombre => api.name.includes(nombre))
  );
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Abre el workspace de Postman en una nueva pestaña
 */
export function abrirWorkspacePostman(): void {
  window.open(POSTMAN_TEAM_URL, '_blank');
}

/**
 * Abre una colección en Postman web
 */
export function abrirColeccionEnPostman(collectionId: string): void {
  window.open(
    `https://www.postman.com/posthaida/workspace/${POSTMAN_WORKSPACE_ID}/collection/${collectionId}`,
    '_blank'
  );
}

/**
 * Genera un enlace de exportación para una colección
 */
export function generarEnlaceExportacion(collectionId: string): string {
  return `${POSTMAN_API_URL}/collections/${collectionId}?apikey=${obtenerPostmanApiKey()}`;
}
