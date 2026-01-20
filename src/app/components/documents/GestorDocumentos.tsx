import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import {
  FileText,
  Upload,
  RefreshCw,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
  Loader2,
  Download,
  Trash2,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  obtenerDocumentos,
  subirDocumento,
  importarDocumentosConfluence,
  type DocumentoSincronizado,
  type EstadoSincronizacion,
} from "@/services/sync-service";
import { ESPACIOS_CONFLUENCE } from "@/services/confluence-api";
import { cn } from "@/app/components/ui/utils";

interface GestorDocumentosProps {
  proyectoId: string;
  proyectoKey: keyof typeof ESPACIOS_CONFLUENCE;
  onDocumentosSeleccionados: (documentos: DocumentoSincronizado[]) => void;
}

export function GestorDocumentos({
  proyectoId,
  proyectoKey,
  onDocumentosSeleccionados,
}: GestorDocumentosProps) {
  const [documentos, setDocumentos] = useState<DocumentoSincronizado[]>([]);
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [modalSubidaAbierto, setModalSubidaAbierto] = useState(false);
  const [nuevoDocumento, setNuevoDocumento] = useState({ nombre: '', contenido: '' });
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  // Cargar documentos al montar
  useEffect(() => {
    cargarDocumentos();
  }, [proyectoId]);

  // Notificar cambios en selección
  useEffect(() => {
    const docsSeleccionados = documentos.filter(d => documentosSeleccionados.has(d.id));
    onDocumentosSeleccionados(docsSeleccionados);
  }, [documentosSeleccionados, documentos]);

  const cargarDocumentos = () => {
    const todosDocumentos = obtenerDocumentos();
    const documentosProyecto = todosDocumentos.filter(d => d.proyectoId === proyectoId);
    setDocumentos(documentosProyecto);
  };

  const handleImportarConfluence = async () => {
    setImportando(true);
    try {
      const documentosImportados = await importarDocumentosConfluence(proyectoId, proyectoKey);
      toast.success(`${documentosImportados.length} documentos importados de Confluence`);
      cargarDocumentos();
    } catch (error: any) {
      toast.error('Error al importar documentos', {
        description: error.message,
      });
    } finally {
      setImportando(false);
    }
  };

  const handleSubirDocumento = async () => {
    if (!nuevoDocumento.nombre || !nuevoDocumento.contenido) {
      toast.error('Completa todos los campos');
      return;
    }

    setSubiendoArchivo(true);
    try {
      const documento = await subirDocumento(
        nuevoDocumento.nombre,
        nuevoDocumento.contenido,
        proyectoId,
        proyectoKey
      );

      toast.success('Documento subido y sincronizado con Confluence', {
        description: documento.confluenceUrl,
      });

      setNuevoDocumento({ nombre: '', contenido: '' });
      setModalSubidaAbierto(false);
      cargarDocumentos();
    } catch (error: any) {
      toast.error('Error al subir documento', {
        description: error.message,
      });
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleSeleccionarDocumento = (id: string) => {
    const nuevaSeleccion = new Set(documentosSeleccionados);
    if (nuevaSeleccion.has(id)) {
      nuevaSeleccion.delete(id);
    } else {
      nuevaSeleccion.add(id);
    }
    setDocumentosSeleccionados(nuevaSeleccion);
  };

  const handleSeleccionarTodos = () => {
    if (documentosSeleccionados.size === documentos.length) {
      setDocumentosSeleccionados(new Set());
    } else {
      setDocumentosSeleccionados(new Set(documentos.map(d => d.id)));
    }
  };

  const obtenerIconoEstado = (estado: EstadoSincronizacion) => {
    switch (estado) {
      case 'sincronizado':
        return <Check className="h-3.5 w-3.5 text-green-500" />;
      case 'pendiente':
        return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      case 'conflicto':
        return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  const obtenerColorEstado = (estado: EstadoSincronizacion) => {
    switch (estado) {
      case 'sincronizado':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      case 'pendiente':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
      case 'conflicto':
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-base">
            Documentación del Proyecto
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {documentos.length} documentos disponibles | {documentosSeleccionados.size} seleccionados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportarConfluence}
            disabled={importando}
            className="gap-2"
          >
            {importando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Importar de Confluence
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setModalSubidaAbierto(true)}
            className="gap-2"
          >
            <FileUp className="h-3.5 w-3.5" />
            Subir Nuevo
          </Button>
        </div>
      </div>

      {/* Barra de selección */}
      {documentos.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeleccionarTodos}
            className="text-xs"
          >
            {documentosSeleccionados.size === documentos.length ? 'Deseleccionar' : 'Seleccionar'} Todos
          </Button>
          {documentosSeleccionados.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              {documentosSeleccionados.size} seleccionados
            </Badge>
          )}
        </div>
      )}

      {/* Lista de documentos */}
      <ScrollArea className="h-[400px] border rounded-lg">
        {documentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="font-semibold text-sm mb-1">No hay documentos</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Importa documentos desde Confluence o sube nuevos
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {documentos.map((documento) => (
              <div
                key={documento.id}
                onClick={() => handleSeleccionarDocumento(documento.id)}
                className={cn(
                  "p-4 rounded-lg border transition-all cursor-pointer",
                  documentosSeleccionados.has(documento.id)
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-card hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="font-semibold text-sm truncate">
                        {documento.nombre}
                      </h4>
                      {obtenerIconoEstado(documento.estadoSync)}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", obtenerColorEstado(documento.estadoSync))}
                      >
                        {documento.estadoSync}
                      </Badge>
                      {documento.confluenceUrl && (
                        <Badge variant="secondary" className="text-xs">
                          Sincronizado con Confluence
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        v{documento.versionLocal}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {documento.contenido.substring(0, 150)}...
                    </p>

                    {documento.errorSync && (
                      <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Error: {documento.errorSync}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>
                        Última sincronización: {new Date(documento.ultimaSync).toLocaleString('es-ES')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {documento.confluenceUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(documento.confluenceUrl, '_blank');
                        }}
                        title="Abrir en Confluence"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Modal para subir nuevo documento */}
      <Dialog open={modalSubidaAbierto} onOpenChange={setModalSubidaAbierto}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Subir Nuevo Documento
            </DialogTitle>
            <DialogDescription>
              El documento se guardará en HAIDA y se sincronizará automáticamente con Confluence
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Documento</Label>
              <Input
                id="nombre"
                placeholder="Ej: Especificación de Requisitos"
                value={nuevoDocumento.nombre}
                onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenido">Contenido</Label>
              <Textarea
                id="contenido"
                placeholder="Escribe o pega el contenido del documento aquí..."
                className="min-h-[300px] font-mono text-sm"
                value={nuevoDocumento.contenido}
                onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, contenido: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Soporta formato Markdown. Se convertirá automáticamente para Confluence.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                ℹ️ Este documento se publicará automáticamente en el espacio de Confluence:{" "}
                <strong>{ESPACIOS_CONFLUENCE[proyectoKey]?.nombre}</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setModalSubidaAbierto(false)}
              disabled={subiendoArchivo}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubirDocumento}
              disabled={subiendoArchivo || !nuevoDocumento.nombre || !nuevoDocumento.contenido}
              className="gap-2"
            >
              {subiendoArchivo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir y Sincronizar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
