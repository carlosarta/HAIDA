/**
 * Validation Utilities
 * Utilidades de validación de datos
 */

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida una URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida un número de teléfono
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Valida una contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida un código postal
 */
export function isValidPostalCode(code: string, country: 'US' | 'UK' | 'ES' = 'US'): boolean {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    ES: /^\d{5}$/,
  };

  return patterns[country].test(code);
}

/**
 * Valida que un string no esté vacío
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Valida rango numérico
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida longitud de string
 */
export function hasValidLength(
  value: string,
  min: number,
  max?: number
): { isValid: boolean; error?: string } {
  const length = value.length;

  if (length < min) {
    return {
      isValid: false,
      error: `Must be at least ${min} characters`,
    };
  }

  if (max && length > max) {
    return {
      isValid: false,
      error: `Must be at most ${max} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Valida formato de fecha (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Valida que un objeto tenga las propiedades requeridas
 */
export function hasRequiredProperties<T extends object>(
  obj: T,
  requiredProps: (keyof T)[]
): { isValid: boolean; missing: string[] } {
  const missing = requiredProps.filter(prop => !(prop in obj) || obj[prop] === undefined);

  return {
    isValid: missing.length === 0,
    missing: missing as string[],
  };
}

/**
 * Sanitiza HTML básico (remove scripts)
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}
