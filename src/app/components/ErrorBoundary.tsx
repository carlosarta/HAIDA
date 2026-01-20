/**
 * 🛡️ HAIDA - Error Boundary
 * 
 * Componente de React que captura errores en el árbol de componentes
 * y muestra una UI de fallback amigable.
 * 
 * SEGURIDAD: Previene que errores críticos colapsen toda la aplicación
 * 
 * @module ErrorBoundary
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Captura errores en componentes hijos y muestra UI de recuperación
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Actualiza el estado cuando ocurre un error
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Captura información del error y lo registra
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error para debugging
    console.error('🛑 Error capturado por ErrorBoundary:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // TODO: Enviar a servicio de logging (Sentry, LogRocket, etc.)
    // Ejemplo:
    // Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      errorInfo,
    });
  }

  /**
   * Maneja el reinicio de la aplicación
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Maneja la recarga completa de la página
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Redirige al inicio
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si se provee un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20 p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-sm">
              {/* Icono de Error */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Título */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Oops! Algo salió mal
                </h1>
                <p className="text-muted-foreground">
                  La aplicación encontró un error inesperado y necesita reiniciarse.
                </p>
              </div>

              {/* Detalles del Error (Solo en desarrollo) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm font-mono text-destructive font-semibold mb-2">
                    Error Details (Development Mode):
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Ver Component Stack
                      </summary>
                      <pre className="text-[10px] text-muted-foreground mt-2 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Mensaje de Usuario */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Qué puedes hacer:</strong>
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Intenta recargar la página</li>
                  <li>Verifica tu conexión a internet</li>
                  <li>Limpia el caché del navegador</li>
                  <li>Si el problema persiste, contacta a soporte</li>
                </ul>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Intentar de Nuevo
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-blue-600"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recargar Página
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="secondary"
                  className="flex-1 gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ir al Inicio
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Error ID: {Date.now().toString(36).toUpperCase()}
                  {' • '}
                  {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  HAIDA Quality Assurance Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundary específico para secciones críticas
 * Muestra un mensaje más pequeño para errores en componentes específicos
 */
export class PartialErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🛑 PartialErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-destructive">
                Error al cargar este componente
              </h3>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || 'Un error inesperado ocurrió'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para capturar errores asíncronos
 * Útil para errores en useEffect, fetch, etc.
 */
export function useErrorHandler() {
  return (error: Error) => {
    console.error('🛑 Error asíncrono capturado:', error);
    // Lanzar el error para que ErrorBoundary lo capture
    throw error;
  };
}
