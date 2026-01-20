/**
 * 🔒 HAIDA - Security Utilities
 * 
 * Utilidades de seguridad para prevenir vulnerabilidades comunes
 * 
 * @module security-utils
 */

/**
 * Escapa caracteres especiales de RegExp para prevenir ReDoS
 * 
 * SEGURIDAD: Previene inyección de expresiones regulares maliciosas
 * que podrían causar Denial of Service (ReDoS)
 * 
 * @param string - String a escapar
 * @returns String con caracteres especiales escapados
 * 
 * @example
 * ```ts
 * const userInput = "(a+)+$"; // Expresión peligrosa
 * const safe = escapeRegExp(userInput); // Escapada: "\\(a\\+\\)\\+\\$"
 * const regex = new RegExp(safe, 'gi'); // Seguro
 * ```
 */
export function escapeRegExp(string: string): string {
  // Escapar caracteres especiales de RegExp: . * + ? ^ $ { } ( ) | [ ] \
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Valida si un string es seguro para usar en HTML
 * 
 * @param input - String a validar
 * @returns true si es seguro
 */
export function isSafeHTML(input: string): boolean {
  // Detectar etiquetas script, iframes, y eventos JavaScript
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<object/i,
    /<embed/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitiza un string eliminando caracteres peligrosos
 * 
 * @param input - String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/on\w+=/gi, ''); // Eliminar eventos (onclick, etc.)
}

/**
 * Valida una URL para asegurar que es segura
 * 
 * @param url - URL a validar
 * @returns true si la URL es segura
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Solo permitir protocolos seguros
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Limita la longitud de un string para prevenir ataques de memoria
 * 
 * @param input - String a limitar
 * @param maxLength - Longitud máxima permitida
 * @returns String truncado
 */
export function limitLength(input: string, maxLength: number = 10000): string {
  return input.slice(0, maxLength);
}

/**
 * Valida un email de forma segura
 * 
 * @param email - Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Genera un ID único seguro usando Web Crypto API
 * 
 * @returns ID único
 */
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida un token JWT básico (solo estructura, no firma)
 * 
 * @param token - Token a validar
 * @returns true si tiene estructura válida
 */
export function hasValidJWTStructure(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Máscara para mostrar datos sensibles parcialmente
 * 
 * @param data - Dato a enmascarar
 * @param visibleChars - Caracteres visibles al final
 * @returns Dato enmascarado
 * 
 * @example
 * ```ts
 * maskSensitiveData('1234567890', 4) // "******7890"
 * ```
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return data;
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

/**
 * Rate limiting simple para prevenir abuso
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minuto
  ) {}
  
  /**
   * Verifica si se excedió el límite de intentos
   * 
   * @param key - Identificador (ej: email, IP)
   * @returns true si se excedió el límite
   */
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar intentos dentro de la ventana de tiempo
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    this.attempts.set(key, recentAttempts);
    
    return recentAttempts.length >= this.maxAttempts;
  }
  
  /**
   * Registra un nuevo intento
   * 
   * @param key - Identificador
   */
  recordAttempt(key: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    attempts.push(now);
    this.attempts.set(key, attempts);
  }
  
  /**
   * Resetea los intentos de una clave
   * 
   * @param key - Identificador
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * Limpia intentos antiguos
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < this.windowMs);
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }
}

/**
 * Valida inputs de formularios con reglas de seguridad
 */
export const InputValidator = {
  /**
   * Valida un username
   */
  username: (value: string): { valid: boolean; error?: string } => {
    if (value.length < 3) return { valid: false, error: 'Mínimo 3 caracteres' };
    if (value.length > 50) return { valid: false, error: 'Máximo 50 caracteres' };
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return { valid: false, error: 'Solo letras, números, guiones y guiones bajos' };
    }
    return { valid: true };
  },
  
  /**
   * Valida una contraseña
   */
  password: (value: string): { valid: boolean; error?: string } => {
    if (value.length < 8) return { valid: false, error: 'Mínimo 8 caracteres' };
    if (value.length > 128) return { valid: false, error: 'Máximo 128 caracteres' };
    if (!/[a-z]/.test(value)) return { valid: false, error: 'Debe incluir minúsculas' };
    if (!/[A-Z]/.test(value)) return { valid: false, error: 'Debe incluir mayúsculas' };
    if (!/[0-9]/.test(value)) return { valid: false, error: 'Debe incluir números' };
    return { valid: true };
  },
  
  /**
   * Valida un proyecto/nombre
   */
  projectName: (value: string): { valid: boolean; error?: string } => {
    if (value.length < 1) return { valid: false, error: 'Campo requerido' };
    if (value.length > 200) return { valid: false, error: 'Máximo 200 caracteres' };
    if (!isSafeHTML(value)) return { valid: false, error: 'Contiene caracteres no permitidos' };
    return { valid: true };
  },
};
