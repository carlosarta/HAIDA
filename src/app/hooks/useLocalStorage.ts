/**
 * useLocalStorage Hook
 * Hook optimizado para persistir estado en localStorage con type safety
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Función para obtener el valor inicial
  const readValue = useCallback((): T => {
    // Prevenir errores en SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // Estado con lazy initialization
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Función para guardar valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // Prevenir errores en SSR
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        // Permitir que value sea una función al igual que useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Guardar en localStorage
        window.localStorage.setItem(key, JSON.stringify(newValue));

        // Actualizar estado
        setStoredValue(newValue);

        // Disparar evento personalizado para sincronizar entre tabs
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Sincronizar estado entre tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue] as const;
}
