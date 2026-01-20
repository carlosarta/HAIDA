/**
 * 🔒 HAIDA - Encryption Service
 * 
 * Servicio para encriptación segura de datos sensibles en localStorage
 * usando AES-256 con CryptoJS.
 * 
 * SEGURIDAD:
 * - Genera una clave única por sesión usando Web Crypto API
 * - Encriptación AES-256
 * - Los tokens nunca se almacenan en texto plano
 * 
 * @module encryption-service
 */

import CryptoJS from 'crypto-js';

// Generar clave de encriptación única por sesión (no persistente)
let sessionEncryptionKey: string | null = null;

/**
 * Obtiene o genera la clave de encriptación de la sesión
 */
function getEncryptionKey(): string {
  if (!sessionEncryptionKey) {
    // Generar una clave aleatoria usando Web Crypto API
    const array = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(array);
    sessionEncryptionKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return sessionEncryptionKey;
}

/**
 * Encripta un string usando AES-256
 * 
 * @param data - Dato a encriptar
 * @returns String encriptado en formato Base64
 */
export function encrypt(data: string): string {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error('Error al encriptar datos:', error);
    throw new Error('Fallo en encriptación');
  }
}

/**
 * Desencripta un string encriptado con AES-256
 * 
 * @param encryptedData - String encriptado
 * @returns Dato desencriptado
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Dato corrupto o clave inválida');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar datos:', error);
    // Si falla la desencriptación, los datos están corruptos
    return '';
  }
}

/**
 * Guarda un dato encriptado en localStorage
 * 
 * @param key - Clave de almacenamiento
 * @param value - Valor a guardar (será encriptado)
 */
export function setEncrypted(key: string, value: string): void {
  try {
    const encrypted = encrypt(value);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Error al guardar dato encriptado (${key}):`, error);
  }
}

/**
 * Recupera y desencripta un dato de localStorage
 * 
 * @param key - Clave de almacenamiento
 * @returns Valor desencriptado o null si no existe
 */
export function getEncrypted(key: string): string | null {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    return decrypt(encrypted);
  } catch (error) {
    console.error(`Error al recuperar dato encriptado (${key}):`, error);
    // Si falla, eliminar el dato corrupto
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Guarda un objeto JSON encriptado
 * 
 * @param key - Clave de almacenamiento
 * @param obj - Objeto a guardar
 */
export function setEncryptedJSON<T>(key: string, obj: T): void {
  try {
    const json = JSON.stringify(obj);
    setEncrypted(key, json);
  } catch (error) {
    console.error(`Error al guardar JSON encriptado (${key}):`, error);
  }
}

/**
 * Recupera un objeto JSON encriptado
 * 
 * @param key - Clave de almacenamiento
 * @returns Objeto desencriptado o null
 */
export function getEncryptedJSON<T>(key: string): T | null {
  try {
    const json = getEncrypted(key);
    if (!json) return null;
    
    return JSON.parse(json) as T;
  } catch (error) {
    console.error(`Error al recuperar JSON encriptado (${key}):`, error);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Elimina un dato encriptado
 * 
 * @param key - Clave de almacenamiento
 */
export function removeEncrypted(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Limpia todas las claves encriptadas que coincidan con un prefijo
 * 
 * @param prefix - Prefijo a buscar (ej: 'haida_')
 */
export function clearEncryptedByPrefix(prefix: string): void {
  const keys = Object.keys(localStorage);
  keys
    .filter(key => key.startsWith(prefix))
    .forEach(key => localStorage.removeItem(key));
}
