/**
 * Servicio de Sincronización Bidireccional
 * Gestiona la sincronización entre HAIDA ↔ Jira ↔ Confluence
 */

import {
  crearIssueJira,
  actualizarIssueJira,
  obtenerIssuesProyecto,
  sincronizarDefectoConJira,
  PROYECTOS_JIRA,
} from "./jira-api";
import {
  crearPaginaConfluence,
  actualizarPaginaConfluence,
  obtenerPaginasEspacio,
  ESPACIOS_CONFLUENCE,
} from "./confluence-api";

// ============================================
// TIPOS
// ============================================

export type EstadoSincronizacion = 'sincronizado' | 'pendiente' | 'error' | 'conflicto';

export interface DocumentoSincronizado {
  id: string;
  nombre: string;
  contenido: string;
  proyectoId: string;
  // Referencias externas
  confluencePageId?: string;
  confluenceUrl?: string;
  // Metadata de sincronización
  estadoSync: EstadoSincronizacion;
  ultimaSync: string;
  versionLocal: number;
  versionRemota?: number;
  errorSync?: string;
}

export interface CasoPruebaSincronizado {
  id: string;
  titulo: string;
  descripcion: string;
  pasos: Array<{ action: string; expected: string }>;
  proyectoId: string;
  suiteId: string;
  prioridad: string;
  estado: string;
  // Referencias externas
  jiraIssueKey?: string;
  jiraIssueUrl?: string;
  // Metadata de sincronización
  estadoSync: EstadoSincronizacion;
  ultimaSync: string;
  versionLocal: number;
  versionRemota?: number;
  errorSync?: string;
}

export interface ColaSincronizacion {
  id: string;
  tipo: 'documento' | 'caso_prueba' | 'suite';
  accion: 'crear' | 'actualizar' | 'eliminar';
  entidadId: string;
  datos: any;
  timestamp: string;
  intentos: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  error?: string;
}

// ============================================
// ALMACENAMIENTO LOCAL
// ============================================

const STORAGE_KEYS = {
  documentos: 'haida_documentos_sync',
  casosPrueba: 'haida_casos_sync',
  cola: 'haida_cola_sync',
  ultimaSync: 'haida_ultima_sync',
};

export function obtenerDocumentos(): DocumentoSincronizado[] {
  const data = localStorage.getItem(STORAGE_KEYS.documentos);
  return data ? JSON.parse(data) : [];
}

export function guardarDocumento(documento: DocumentoSincronizado): void {
  const documentos = obtenerDocumentos();
  const index = documentos.findIndex(d => d.id === documento.id);
  
  if (index >= 0) {
    documentos[index] = documento;
  } else {
    documentos.push(documento);
  }
  
  localStorage.setItem(STORAGE_KEYS.documentos, JSON.stringify(documentos));
}

export function obtenerCasosPrueba(): CasoPruebaSincronizado[] {
  const data = localStorage.getItem(STORAGE_KEYS.casosPrueba);
  return data ? JSON.parse(data) : [];
}

export function guardarCasoPrueba(caso: CasoPruebaSincronizado): void {
  const casos = obtenerCasosPrueba();
  const index = casos.findIndex(c => c.id === caso.id);
  
  if (index >= 0) {
    casos[index] = caso;
  } else {
    casos.push(caso);
  }
  
  localStorage.setItem(STORAGE_KEYS.casosPrueba, JSON.stringify(casos));
}

export function obtenerColaSincronizacion(): ColaSincronizacion[] {
  const data = localStorage.getItem(STORAGE_KEYS.cola);
  return data ? JSON.parse(data) : [];
}

function agregarACola(item: Omit<ColaSincronizacion, 'id' | 'timestamp' | 'intentos' | 'estado'>): void {
  const cola = obtenerColaSincronizacion();
  const nuevoItem: ColaSincronizacion = {
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    intentos: 0,
    estado: 'pendiente',
  };
  
  cola.push(nuevoItem);
  localStorage.setItem(STORAGE_KEYS.cola, JSON.stringify(cola));
}

function actualizarItemCola(id: string, actualizacion: Partial<ColaSincronizacion>): void {
  const cola = obtenerColaSincronizacion();
  const index = cola.findIndex(item => item.id === id);
  
  if (index >= 0) {
    cola[index] = { ...cola[index], ...actualizacion };
    localStorage.setItem(STORAGE_KEYS.cola, JSON.stringify(cola));
  }
}

// ============================================
// SINCRONIZACIÓN DE DOCUMENTOS (CONFLUENCE)
// ============================================

/**
 * Sube un documento a HAIDA y lo sincroniza con Confluence
 */
export async function subirDocumento(
  nombre: string,
  contenido: string,
  proyectoId: string,
  proyectoKey: keyof typeof ESPACIOS_CONFLUENCE
): Promise<DocumentoSincronizado> {
  const documento: DocumentoSincronizado = {
    id: Math.random().toString(36).substr(2, 9),
    nombre,
    contenido,
    proyectoId,
    estadoSync: 'pendiente',
    ultimaSync: new Date().toISOString(),
    versionLocal: 1,
  };

  // Guardar localmente primero
  guardarDocumento(documento);

  // Agregar a cola de sincronización
  agregarACola({
    tipo: 'documento',
    accion: 'crear',
    entidadId: documento.id,
    datos: { nombre, contenido, proyectoKey },
  });

  // Intentar sincronizar inmediatamente
  await sincronizarDocumentoConConfluence(documento.id, proyectoKey);

  return documento;
}

/**
 * Sincroniza un documento con Confluence
 */
async function sincronizarDocumentoConConfluence(
  documentoId: string,
  proyectoKey: keyof typeof ESPACIOS_CONFLUENCE
): Promise<void> {
  const documentos = obtenerDocumentos();
  const documento = documentos.find(d => d.id === documentoId);
  
  if (!documento) {
    throw new Error('Documento no encontrado');
  }

  try {
    const espacioConfig = ESPACIOS_CONFLUENCE[proyectoKey];
    if (!espacioConfig) {
      throw new Error('Espacio de Confluence no configurado');
    }

    // Si no existe en Confluence, crear
    if (!documento.confluencePageId) {
      const pagina = await crearPaginaConfluence({
        spaceKey: espacioConfig.key,
        titulo: documento.nombre,
        contenido: convertirAHTMLConfluence(documento.contenido),
      });

      documento.confluencePageId = pagina.id;
      documento.confluenceUrl = `https://stayarta.atlassian.net/wiki${pagina._links.webui}`;
      documento.versionRemota = 1;
    } else {
      // Actualizar página existente
      await actualizarPaginaConfluence(
        documento.confluencePageId,
        documento.nombre,
        convertirAHTMLConfluence(documento.contenido),
        documento.versionRemota || 1
      );
      documento.versionRemota = (documento.versionRemota || 1) + 1;
    }

    documento.estadoSync = 'sincronizado';
    documento.ultimaSync = new Date().toISOString();
    documento.errorSync = undefined;

    guardarDocumento(documento);
  } catch (error: any) {
    documento.estadoSync = 'error';
    documento.errorSync = error.message;
    guardarDocumento(documento);
    throw error;
  }
}

/**
 * Importa documentos desde Confluence
 */
export async function importarDocumentosConfluence(
  proyectoId: string,
  proyectoKey: keyof typeof ESPACIOS_CONFLUENCE
): Promise<DocumentoSincronizado[]> {
  try {
    const espacioConfig = ESPACIOS_CONFLUENCE[proyectoKey];
    if (!espacioConfig) {
      throw new Error('Espacio de Confluence no configurado');
    }

    const paginas = await obtenerPaginasEspacio(espacioConfig.key, 50);
    const documentosImportados: DocumentoSincronizado[] = [];

    for (const pagina of paginas) {
      const documento: DocumentoSincronizado = {
        id: `conf_${pagina.id}`,
        nombre: pagina.title,
        contenido: pagina.body?.storage?.value || '',
        proyectoId,
        confluencePageId: pagina.id,
        confluenceUrl: `https://stayarta.atlassian.net/wiki${pagina._links.webui}`,
        estadoSync: 'sincronizado',
        ultimaSync: new Date().toISOString(),
        versionLocal: pagina.version.number,
        versionRemota: pagina.version.number,
      };

      guardarDocumento(documento);
      documentosImportados.push(documento);
    }

    return documentosImportados;
  } catch (error) {
    console.error('Error importando documentos de Confluence:', error);
    throw error;
  }
}

// ============================================
// SINCRONIZACIÓN DE CASOS DE PRUEBA (JIRA)
// ============================================

/**
 * Crea un caso de prueba y lo sincroniza con Jira
 */
export async function crearCasoPruebaConSync(
  caso: Omit<CasoPruebaSincronizado, 'id' | 'estadoSync' | 'ultimaSync' | 'versionLocal'>,
  proyectoKey: keyof typeof PROYECTOS_JIRA,
  publicarEnJira: boolean = true
): Promise<CasoPruebaSincronizado> {
  const casoPrueba: CasoPruebaSincronizado = {
    ...caso,
    id: Math.random().toString(36).substr(2, 9),
    estadoSync: publicarEnJira ? 'pendiente' : 'sincronizado',
    ultimaSync: new Date().toISOString(),
    versionLocal: 1,
  };

  // Guardar localmente primero
  guardarCasoPrueba(casoPrueba);

  if (publicarEnJira) {
    // Agregar a cola de sincronización
    agregarACola({
      tipo: 'caso_prueba',
      accion: 'crear',
      entidadId: casoPrueba.id,
      datos: { proyectoKey },
    });

    // Intentar sincronizar inmediatamente
    await sincronizarCasoPruebaConJira(casoPrueba.id, proyectoKey);
  }

  return casoPrueba;
}

/**
 * Sincroniza un caso de prueba con Jira
 */
async function sincronizarCasoPruebaConJira(
  casoId: string,
  proyectoKey: keyof typeof PROYECTOS_JIRA
): Promise<void> {
  const casos = obtenerCasosPrueba();
  const caso = casos.find(c => c.id === casoId);
  
  if (!caso) {
    throw new Error('Caso de prueba no encontrado');
  }

  try {
    const proyectoConfig = PROYECTOS_JIRA[proyectoKey];
    if (!proyectoConfig) {
      throw new Error('Proyecto de Jira no configurado');
    }

    // Convertir pasos a descripción
    const descripcionCompleta = generarDescripcionJira(caso);

    // Si no existe en Jira, crear
    if (!caso.jiraIssueKey) {
      const issue = await crearIssueJira({
        projectKey: proyectoConfig.key,
        summary: caso.titulo,
        description: descripcionCompleta,
        issueType: 'Test',
        priority: mapearPrioridad(caso.prioridad),
      });

      caso.jiraIssueKey = issue.key;
      caso.jiraIssueUrl = `https://stayarta.atlassian.net/browse/${issue.key}`;
      caso.versionRemota = 1;
    } else {
      // Actualizar issue existente
      await actualizarIssueJira(caso.jiraIssueKey, {
        summary: caso.titulo,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: descripcionCompleta }],
            },
          ],
        },
      });
      caso.versionRemota = (caso.versionRemota || 1) + 1;
    }

    caso.estadoSync = 'sincronizado';
    caso.ultimaSync = new Date().toISOString();
    caso.errorSync = undefined;

    guardarCasoPrueba(caso);
  } catch (error: any) {
    caso.estadoSync = 'error';
    caso.errorSync = error.message;
    guardarCasoPrueba(caso);
    throw error;
  }
}

/**
 * Actualiza un caso de prueba y sincroniza con Jira
 */
export async function actualizarCasoPruebaConSync(
  casoId: string,
  actualizacion: Partial<CasoPruebaSincronizado>,
  proyectoKey: keyof typeof PROYECTOS_JIRA
): Promise<void> {
  const casos = obtenerCasosPrueba();
  const caso = casos.find(c => c.id === casoId);
  
  if (!caso) {
    throw new Error('Caso de prueba no encontrado');
  }

  // Actualizar localmente
  Object.assign(caso, actualizacion);
  caso.versionLocal += 1;
  caso.estadoSync = 'pendiente';
  guardarCasoPrueba(caso);

  // Agregar a cola
  agregarACola({
    tipo: 'caso_prueba',
    accion: 'actualizar',
    entidadId: casoId,
    datos: { proyectoKey },
  });

  // Sincronizar
  await sincronizarCasoPruebaConJira(casoId, proyectoKey);
}

/**
 * Importa casos de prueba desde Jira
 */
export async function importarCasosPruebaJira(
  proyectoId: string,
  proyectoKey: keyof typeof PROYECTOS_JIRA
): Promise<CasoPruebaSincronizado[]> {
  try {
    const proyectoConfig = PROYECTOS_JIRA[proyectoKey];
    if (!proyectoConfig) {
      throw new Error('Proyecto de Jira no configurado');
    }

    const issues = await obtenerIssuesProyecto(proyectoConfig.key, 100);
    const casosImportados: CasoPruebaSincronizado[] = [];

    for (const issue of issues) {
      // Solo importar issues de tipo "Test"
      if (issue.fields.issuetype.name !== 'Test') continue;

      const caso: CasoPruebaSincronizado = {
        id: `jira_${issue.id}`,
        titulo: issue.fields.summary,
        descripcion: issue.fields.description || '',
        pasos: parsearPasosDesdeJira(issue.fields.description || ''),
        proyectoId,
        suiteId: '', // Asignar después
        prioridad: issue.fields.priority?.name || 'Medium',
        estado: issue.fields.status.name,
        jiraIssueKey: issue.key,
        jiraIssueUrl: `https://stayarta.atlassian.net/browse/${issue.key}`,
        estadoSync: 'sincronizado',
        ultimaSync: new Date().toISOString(),
        versionLocal: 1,
        versionRemota: 1,
      };

      guardarCasoPrueba(caso);
      casosImportados.push(caso);
    }

    return casosImportados;
  } catch (error) {
    console.error('Error importando casos de prueba de Jira:', error);
    throw error;
  }
}

// ============================================
// PROCESAMIENTO DE COLA
// ============================================

/**
 * Procesa la cola de sincronización
 */
export async function procesarColaSincronizacion(): Promise<void> {
  const cola = obtenerColaSincronizacion();
  const pendientes = cola.filter(item => 
    item.estado === 'pendiente' && item.intentos < 3
  );

  for (const item of pendientes) {
    actualizarItemCola(item.id, { estado: 'procesando', intentos: item.intentos + 1 });

    try {
      if (item.tipo === 'documento') {
        await sincronizarDocumentoConConfluence(item.entidadId, item.datos.proyectoKey);
      } else if (item.tipo === 'caso_prueba') {
        await sincronizarCasoPruebaConJira(item.entidadId, item.datos.proyectoKey);
      }

      actualizarItemCola(item.id, { estado: 'completado' });
    } catch (error: any) {
      actualizarItemCola(item.id, { 
        estado: 'error', 
        error: error.message 
      });
    }
  }
}

// ============================================
// UTILIDADES
// ============================================

function convertirAHTMLConfluence(contenido: string): string {
  // Convertir Markdown a HTML de Confluence
  return `<p>${contenido.replace(/\n/g, '</p><p>')}</p>`;
}

function generarDescripcionJira(caso: CasoPruebaSincronizado): string {
  let descripcion = `${caso.descripcion}\n\n*Pasos de Prueba:*\n\n`;
  
  caso.pasos.forEach((paso, index) => {
    descripcion += `${index + 1}. *Acción:* ${paso.action}\n`;
    descripcion += `   *Resultado Esperado:* ${paso.expected}\n\n`;
  });

  return descripcion;
}

function parsearPasosDesdeJira(descripcion: string): Array<{ action: string; expected: string }> {
  // Parsear descripción de Jira para extraer pasos
  const pasos: Array<{ action: string; expected: string }> = [];
  const lineas = descripcion.split('\n');
  
  let accionActual = '';
  
  for (const linea of lineas) {
    if (linea.includes('*Acción:*')) {
      accionActual = linea.replace('*Acción:*', '').trim();
    } else if (linea.includes('*Resultado Esperado:*') && accionActual) {
      const esperado = linea.replace('*Resultado Esperado:*', '').trim();
      pasos.push({ action: accionActual, expected: esperado });
      accionActual = '';
    }
  }

  return pasos;
}

function mapearPrioridad(prioridad: string): string {
  const mapa: Record<string, string> = {
    critical: 'Highest',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    trivial: 'Lowest',
  };
  return mapa[prioridad.toLowerCase()] || 'Medium';
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicia sincronización automática periódica
 */
export function iniciarSincronizacionAutomatica(intervaloMs: number = 60000): void {
  setInterval(async () => {
    try {
      await procesarColaSincronizacion();
    } catch (error) {
      console.error('Error en sincronización automática:', error);
    }
  }, intervaloMs);
}
