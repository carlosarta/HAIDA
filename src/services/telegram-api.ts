/**
 * Servicio de integración con el Bot de Telegram
 * Maneja la comunicación bidireccional con el bot de HAIDA
 * 
 * ⚠️ SEGURIDAD: Credenciales encriptadas con AES-256
 */

import { setEncryptedJSON, getEncryptedJSON, removeEncrypted } from './encryption-service';

const TELEGRAM_BOT_URL = 'https://bothaida.stayarta.com';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  userId: string;
}

export interface TelegramMessage {
  text: string;
  chatId: string;
  parse_mode?: 'Markdown' | 'HTML';
}

export interface TelegramNotification {
  tipo: 'defecto' | 'ejecucion' | 'proyecto' | 'reporte';
  titulo: string;
  descripcion: string;
  prioridad?: 'baja' | 'media' | 'alta' | 'critica';
  datos?: any;
}

// ============================================
// CONFIGURACIÓN DEL BOT
// ============================================

/**
 * Conecta el bot de Telegram con la aplicación HAIDA
 */
export async function conectarBotTelegram(config: TelegramConfig): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_BOT_URL}/api/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_token: config.botToken,
        chat_id: config.chatId,
        user_id: config.userId,
        app_name: 'HAIDA QA Platform',
      }),
    });

    if (!response.ok) {
      throw new Error('Error al conectar con el bot de Telegram');
    }

    const data = await response.json();
    
    // ✅ Guardar configuración ENCRIPTADA
    setEncryptedJSON('telegram_config', config);
    
    return data.success || true;
  } catch (error) {
    console.error('Error conectando bot de Telegram:', error);
    throw error;
  }
}

/**
 * Desconecta el bot de Telegram
 */
export async function desconectarBotTelegram(userId: string): Promise<boolean> {
  try {
    const config = obtenerConfiguracionTelegram();
    if (!config) return false;

    const response = await fetch(`${TELEGRAM_BOT_URL}/api/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        chat_id: config.chatId,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al desconectar el bot de Telegram');
    }

    // ✅ Limpiar configuración de manera segura
    removeEncrypted('telegram_config');
    
    return true;
  } catch (error) {
    console.error('Error desconectando bot de Telegram:', error);
    throw error;
  }
}

/**
 * Verifica si el bot está conectado
 */
export function estaConectadoTelegram(): boolean {
  return !!getEncryptedJSON<TelegramConfig>('telegram_config');
}

/**
 * Obtiene la configuración guardada del bot
 */
export function obtenerConfiguracionTelegram(): TelegramConfig | null {
  return getEncryptedJSON<TelegramConfig>('telegram_config');
}

// ============================================
// ENVÍO DE NOTIFICACIONES
// ============================================

/**
 * Envía una notificación al bot de Telegram
 */
export async function enviarNotificacionTelegram(notificacion: TelegramNotification): Promise<boolean> {
  try {
    const config = obtenerConfiguracionTelegram();
    if (!config) {
      console.warn('Bot de Telegram no configurado');
      return false;
    }

    // Formatear el mensaje según el tipo
    const mensaje = formatearMensajeTelegram(notificacion);

    const response = await fetch(`${TELEGRAM_BOT_URL}/api/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: mensaje,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar notificación a Telegram');
    }

    return true;
  } catch (error) {
    console.error('Error enviando notificación a Telegram:', error);
    return false;
  }
}

/**
 * Formatea el mensaje según el tipo de notificación
 */
function formatearMensajeTelegram(notificacion: TelegramNotification): string {
  const emojis = {
    defecto: '🐛',
    ejecucion: '▶️',
    proyecto: '📁',
    reporte: '📊',
  };

  const prioridadEmojis = {
    baja: '🟢',
    media: '🟡',
    alta: '🟠',
    critica: '🔴',
  };

  const emoji = emojis[notificacion.tipo] || '📢';
  const prioridadEmoji = notificacion.prioridad ? prioridadEmojis[notificacion.prioridad] : '';

  let mensaje = `${emoji} *${notificacion.titulo}*\n\n`;
  
  if (notificacion.prioridad) {
    mensaje += `${prioridadEmoji} Prioridad: *${notificacion.prioridad.toUpperCase()}*\n\n`;
  }
  
  mensaje += `${notificacion.descripcion}\n`;

  // Agregar datos adicionales si existen
  if (notificacion.datos) {
    mensaje += '\n*Detalles:*\n';
    Object.entries(notificacion.datos).forEach(([key, value]) => {
      mensaje += `• ${key}: ${value}\n`;
    });
  }

  mensaje += `\n_HAIDA QA Platform • ${new Date().toLocaleString('es-ES')}_`;

  return mensaje;
}

// ============================================
// NOTIFICACIONES ESPECÍFICAS
// ============================================

/**
 * Notifica sobre un nuevo defecto crítico
 */
export async function notificarDefectoCritico(defecto: {
  titulo: string;
  severidad: string;
  proyecto: string;
  ejecutor: string;
}): Promise<boolean> {
  return enviarNotificacionTelegram({
    tipo: 'defecto',
    titulo: 'Nuevo Defecto Crítico Detectado',
    descripcion: `Se ha encontrado un defecto crítico en el proyecto ${defecto.proyecto}`,
    prioridad: 'critica',
    datos: {
      'Defecto': defecto.titulo,
      'Severidad': defecto.severidad,
      'Proyecto': defecto.proyecto,
      'Reportado por': defecto.ejecutor,
    },
  });
}

/**
 * Notifica sobre una ejecución completada
 */
export async function notificarEjecucionCompletada(ejecucion: {
  proyecto: string;
  suite: string;
  estado: string;
  aprobados: number;
  fallidos: number;
  duracion: string;
}): Promise<boolean> {
  const prioridad = ejecucion.fallidos > 0 ? 'alta' : 'media';
  
  return enviarNotificacionTelegram({
    tipo: 'ejecucion',
    titulo: 'Ejecución de Pruebas Completada',
    descripcion: `La suite "${ejecucion.suite}" ha finalizado su ejecución`,
    prioridad,
    datos: {
      'Proyecto': ejecucion.proyecto,
      'Suite': ejecucion.suite,
      'Estado': ejecucion.estado,
      'Aprobados': ejecucion.aprobados,
      'Fallidos': ejecucion.fallidos,
      'Duración': ejecucion.duracion,
    },
  });
}

/**
 * Notifica sobre cambios en un proyecto
 */
export async function notificarCambioProyecto(cambio: {
  proyecto: string;
  tipo: string;
  descripcion: string;
  usuario: string;
}): Promise<boolean> {
  return enviarNotificacionTelegram({
    tipo: 'proyecto',
    titulo: 'Cambio en Proyecto',
    descripcion: cambio.descripcion,
    prioridad: 'media',
    datos: {
      'Proyecto': cambio.proyecto,
      'Tipo de cambio': cambio.tipo,
      'Realizado por': cambio.usuario,
    },
  });
}

/**
 * Notifica sobre un reporte semanal
 */
export async function notificarReporteSemanal(reporte: {
  semana: string;
  proyectos: number;
  ejecuciones: number;
  defectos: number;
  tasaExito: number;
}): Promise<boolean> {
  return enviarNotificacionTelegram({
    tipo: 'reporte',
    titulo: 'Reporte Semanal de QA',
    descripcion: `Resumen de actividades de la semana ${reporte.semana}`,
    prioridad: 'baja',
    datos: {
      'Proyectos activos': reporte.proyectos,
      'Ejecuciones totales': reporte.ejecuciones,
      'Defectos encontrados': reporte.defectos,
      'Tasa de éxito': `${reporte.tasaExito}%`,
    },
  });
}

// ============================================
// RECEPCIÓN DE COMANDOS
// ============================================

/**
 * Configura el webhook para recibir comandos del bot
 */
export async function configurarWebhookTelegram(webhookUrl: string): Promise<boolean> {
  try {
    const config = obtenerConfiguracionTelegram();
    if (!config) {
      throw new Error('Bot no configurado');
    }

    const response = await fetch(`${TELEGRAM_BOT_URL}/api/set-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_token: config.botToken,
        webhook_url: webhookUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al configurar webhook');
    }

    return true;
  } catch (error) {
    console.error('Error configurando webhook:', error);
    return false;
  }
}

/**
 * Procesa un comando recibido desde el bot de Telegram
 */
export async function procesarComandoTelegram(comando: string, parametros: any = {}): Promise<any> {
  try {
    const response = await fetch(`${TELEGRAM_BOT_URL}/api/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: comando,
        params: parametros,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al procesar comando');
    }

    return await response.json();
  } catch (error) {
    console.error('Error procesando comando:', error);
    return { error: 'Error al procesar comando' };
  }
}

// ============================================
// COMANDOS DE PROYECTOS
// ============================================

/**
 * Obtiene la lista de todos los proyectos
 */
export async function obtenerProyectos(): Promise<any> {
  return procesarComandoTelegram('/projects');
}

/**
 * Obtiene detalles de un proyecto específico
 */
export async function obtenerProyecto(projectId: string): Promise<any> {
  return procesarComandoTelegram('/project', { project_id: projectId });
}

/**
 * Crea un nuevo proyecto
 */
export async function crearProyecto(datos: {
  nombre: string;
  descripcion?: string;
  tipo?: string;
}): Promise<any> {
  return procesarComandoTelegram('/project create', datos);
}

/**
 * Archiva un proyecto
 */
export async function archivarProyecto(projectId: string): Promise<any> {
  return procesarComandoTelegram('/project archive', { project_id: projectId });
}

// ============================================
// COMANDOS DE EJECUCIONES
// ============================================

/**
 * Obtiene la lista de ejecuciones
 */
export async function obtenerEjecuciones(filtros?: {
  project_id?: string;
  status?: string;
  limit?: number;
}): Promise<any> {
  return procesarComandoTelegram('/runs', filtros);
}

/**
 * Obtiene detalles de una ejecución específica
 */
export async function obtenerEjecucion(runId: string): Promise<any> {
  return procesarComandoTelegram('/run', { run_id: runId });
}

/**
 * Obtiene el estado de una ejecución
 */
export async function obtenerEstadoEjecucion(runId: string): Promise<any> {
  return procesarComandoTelegram('/run_status', { run_id: runId });
}

/**
 * Cancela una ejecución en progreso
 */
export async function cancelarEjecucion(runId: string): Promise<any> {
  return procesarComandoTelegram('/cancel_run', { run_id: runId });
}

/**
 * Reejecutar una suite de pruebas
 */
export async function reejecutar(runId: string): Promise<any> {
  return procesarComandoTelegram('/rerun', { run_id: runId });
}

// ============================================
// COMANDOS DE REPORTES
// ============================================

/**
 * Obtiene la lista de reportes
 */
export async function obtenerReportes(filtros?: {
  project_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<any> {
  return procesarComandoTelegram('/reports', filtros);
}

/**
 * Obtiene un reporte específico
 */
export async function obtenerReporte(reportId: string): Promise<any> {
  return procesarComandoTelegram('/report', { report_id: reportId });
}

/**
 * Obtiene el último reporte generado
 */
export async function obtenerUltimoReporte(projectId?: string): Promise<any> {
  return procesarComandoTelegram('/last_report', { project_id: projectId });
}

// ============================================
// COMANDOS DE ALERTAS Y SUSCRIPCIONES
// ============================================

/**
 * Suscribe al usuario a notificaciones de un proyecto
 */
export async function suscribirse(datos: {
  project_id?: string;
  tipo_alerta: 'defectos' | 'ejecuciones' | 'reportes' | 'todos';
}): Promise<any> {
  return procesarComandoTelegram('/subscribe', datos);
}

/**
 * Cancela la suscripción a notificaciones
 */
export async function desuscribirse(datos: {
  project_id?: string;
  tipo_alerta?: string;
}): Promise<any> {
  return procesarComandoTelegram('/unsubscribe', datos);
}

/**
 * Obtiene las suscripciones activas del usuario
 */
export async function obtenerSuscripciones(): Promise<any> {
  return procesarComandoTelegram('/subscriptions');
}

/**
 * Obtiene las alertas recientes
 */
export async function obtenerAlertas(filtros?: {
  tipo?: string;
  limit?: number;
}): Promise<any> {
  return procesarComandoTelegram('/alerts', filtros);
}

// ============================================
// COMANDOS DE IA
// ============================================

/**
 * Inicia un chat con la IA de HAIDA
 */
export async function iniciarChatIA(mensaje: string): Promise<any> {
  return procesarComandoTelegram('/chat', { message: mensaje });
}

/**
 * Consulta a Perplexity AI
 */
export async function consultarPerplexity(consulta: string): Promise<any> {
  return procesarComandoTelegram('/perplexity', { query: consulta });
}

// ============================================
// COMANDOS DE ADMINISTRACIÓN
// ============================================

/**
 * Obtiene información del webhook
 */
export async function obtenerInfoWebhook(): Promise<any> {
  return procesarComandoTelegram('/webhook_info');
}

/**
 * Configura el webhook del bot
 */
export async function configurarWebhook(webhookUrl: string): Promise<any> {
  return procesarComandoTelegram('/set_webhook', { webhook_url: webhookUrl });
}

/**
 * Obtiene métricas del sistema
 */
export async function obtenerMetricas(periodo?: string): Promise<any> {
  return procesarComandoTelegram('/metrics', { period: periodo });
}

/**
 * Obtiene información de la base de datos
 */
export async function obtenerInfoDB(): Promise<any> {
  return procesarComandoTelegram('/db');
}

// ============================================
// CATEGORÍAS Y COMANDOS DISPONIBLES
// ============================================

export interface ComandoTelegram {
  key: string;
  command: string;
  telegramLink: string;
  descripcion?: string;
}

export interface CategoriaComandos {
  category: string;
  icon: string;
  color: string;
  commands: ComandoTelegram[];
}

export const COMANDOS_TELEGRAM: CategoriaComandos[] = [
  {
    category: 'projects',
    icon: 'FolderKanban',
    color: '#0EA5E9',
    commands: [
      { 
        key: 'Projects', 
        command: '/projects', 
        telegramLink: 'https://t.me/haida_bot?start=projects',
        descripcion: 'Lista todos los proyectos activos'
      },
      { 
        key: 'Project', 
        command: '/project', 
        telegramLink: 'https://t.me/haida_bot?start=project',
        descripcion: 'Ver detalles de un proyecto específico'
      },
      { 
        key: 'ProjectCreate', 
        command: '/project create', 
        telegramLink: 'https://t.me/haida_bot?start=project_create',
        descripcion: 'Crear un nuevo proyecto'
      },
      { 
        key: 'ProjectArchive', 
        command: '/project archive', 
        telegramLink: 'https://t.me/haida_bot?start=project_archive',
        descripcion: 'Archivar un proyecto existente'
      },
    ]
  },
  {
    category: 'executions',
    icon: 'PlayCircle',
    color: '#16A34A',
    commands: [
      { 
        key: 'Runs', 
        command: '/runs', 
        telegramLink: 'https://t.me/haida_bot?start=runs',
        descripcion: 'Ver todas las ejecuciones de pruebas'
      },
      { 
        key: 'Run', 
        command: '/run', 
        telegramLink: 'https://t.me/haida_bot?start=run',
        descripcion: 'Detalles de una ejecución específica'
      },
      { 
        key: 'RunStatus', 
        command: '/run_status', 
        telegramLink: 'https://t.me/haida_bot?start=run_status',
        descripcion: 'Consultar estado de una ejecución'
      },
      { 
        key: 'CancelRun', 
        command: '/cancel_run', 
        telegramLink: 'https://t.me/haida_bot?start=cancel_run',
        descripcion: 'Cancelar una ejecución en progreso'
      },
      { 
        key: 'Rerun', 
        command: '/rerun', 
        telegramLink: 'https://t.me/haida_bot?start=rerun',
        descripcion: 'Reejecutar una suite de pruebas'
      },
    ]
  },
  {
    category: 'reports',
    icon: 'FileText',
    color: '#F59E0B',
    commands: [
      { 
        key: 'Reports', 
        command: '/reports', 
        telegramLink: 'https://t.me/haida_bot?start=reports',
        descripcion: 'Ver todos los reportes generados'
      },
      { 
        key: 'Report', 
        command: '/report', 
        telegramLink: 'https://t.me/haida_bot?start=report',
        descripcion: 'Detalles de un reporte específico'
      },
      { 
        key: 'LastReport', 
        command: '/last_report', 
        telegramLink: 'https://t.me/haida_bot?start=last_report',
        descripcion: 'Obtener el último reporte generado'
      },
    ]
  },
  {
    category: 'alerts',
    icon: 'Bell',
    color: '#3B82F6',
    commands: [
      { 
        key: 'Subscribe', 
        command: '/subscribe', 
        telegramLink: 'https://t.me/haida_bot?start=subscribe',
        descripcion: 'Suscribirse a notificaciones'
      },
      { 
        key: 'Unsubscribe', 
        command: '/unsubscribe', 
        telegramLink: 'https://t.me/haida_bot?start=unsubscribe',
        descripcion: 'Cancelar suscripción a notificaciones'
      },
      { 
        key: 'Subscriptions', 
        command: '/subscriptions', 
        telegramLink: 'https://t.me/haida_bot?start=subscriptions',
        descripcion: 'Ver suscripciones activas'
      },
      { 
        key: 'Alerts', 
        command: '/alerts', 
        telegramLink: 'https://t.me/haida_bot?start=alerts',
        descripcion: 'Ver alertas recientes'
      },
    ]
  },
  {
    category: 'ai',
    icon: 'Sparkles',
    color: '#2563EB',
    commands: [
      { 
        key: 'Chat', 
        command: '/chat', 
        telegramLink: 'https://t.me/haida_bot?start=chat',
        descripcion: 'Conversar con la IA de HAIDA'
      },
      { 
        key: 'Perplexity', 
        command: '/perplexity', 
        telegramLink: 'https://t.me/haida_bot?start=perplexity',
        descripcion: 'Consultar a Perplexity AI'
      },
    ]
  },
  {
    category: 'admin',
    icon: 'Settings',
    color: '#DC2626',
    commands: [
      { 
        key: 'WebhookInfo', 
        command: '/webhook_info', 
        telegramLink: 'https://t.me/haida_bot?start=webhook_info',
        descripcion: 'Información del webhook configurado'
      },
      { 
        key: 'SetWebhook', 
        command: '/set_webhook', 
        telegramLink: 'https://t.me/haida_bot?start=set_webhook',
        descripcion: 'Configurar webhook del bot'
      },
      { 
        key: 'Metrics', 
        command: '/metrics', 
        telegramLink: 'https://t.me/haida_bot?start=metrics',
        descripcion: 'Ver métricas del sistema'
      },
      { 
        key: 'DB', 
        command: '/db', 
        telegramLink: 'https://t.me/haida_bot?start=db',
        descripcion: 'Información de la base de datos'
      },
    ]
  }
];

/**
 * Obtiene todos los comandos disponibles agrupados por categoría
 */
export function obtenerComandosDisponibles(): CategoriaComandos[] {
  return COMANDOS_TELEGRAM;
}

/**
 * Busca un comando por su clave
 */
export function buscarComando(key: string): ComandoTelegram | null {
  for (const categoria of COMANDOS_TELEGRAM) {
    const comando = categoria.commands.find(cmd => cmd.key === key);
    if (comando) return comando;
  }
  return null;
}

/**
 * Ejecuta un comando por su clave
 */
export async function ejecutarComandoPorClave(key: string, parametros?: any): Promise<any> {
  const comando = buscarComando(key);
  if (!comando) {
    throw new Error(`Comando no encontrado: ${key}`);
  }
  return procesarComandoTelegram(comando.command, parametros);
}