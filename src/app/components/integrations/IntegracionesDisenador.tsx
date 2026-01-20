import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  Package,
  ExternalLink,
  Download,
  RefreshCw,
  Check,
  FolderKanban,
  Key,
  Loader2,
  Filter,
  FileDown,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import {
  obtenerColecciones,
  importarColeccion,
  abrirWorkspacePostman,
  abrirColeccionEnPostman,
  estaConfiguradoPostman,
  guardarPostmanApiKey,
  PROYECTOS_POSTMAN,
  type PostmanCollection,
} from "@/services/postman-api";
import {
  abrirProyectoJira,
  PROYECTOS_JIRA,
  type ProyectoJira,
} from "@/services/jira-api";

interface IntegracionesDisenadorProps {
  proyectoActual?: {
    id: string;
    name: string;
    key: string;
  };
}

export function IntegracionesDisenador({ proyectoActual }: IntegracionesDisenadorProps) {
  // Estado para Postman
  const [modalPostmanAbierto, setModalPostmanAbierto] = useState(false);
  const [modalConfigAbierto, setModalConfigAbierto] = useState(false);
  const [colecciones, setColecciones] = useState<PostmanCollection[]>([]);
  const [cargandoColecciones, setCargandoColecciones] = useState(false);
  const [importando, setImportando] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [exportando, setExportando] = useState(false);

  // Mapear el nombre del proyecto actual a las claves de Postman/Jira
  const obtenerClaveProyecto = (): keyof typeof PROYECTOS_POSTMAN | null => {
    if (!proyectoActual) return null;
    
    const nombreProyecto = proyectoActual.name.toUpperCase();
    if (nombreProyecto.includes('PRIVALIA') || proyectoActual.key === 'PRIV') {
      return 'PRIVALIA';
    } else if (nombreProyecto.includes('CTB') || proyectoActual.key === 'CTB') {
      return 'CTB';
    } else if (nombreProyecto.includes('HAIDA') || proyectoActual.key === 'HAIDA') {
      return 'HAIDA';
    }
    return null;
  };

  const claveProyecto = obtenerClaveProyecto();

  // Filtrar colecciones según el proyecto actual
  const coleccionesFiltradas = claveProyecto 
    ? colecciones.filter(col => {
        const nombresColecciones = PROYECTOS_POSTMAN[claveProyecto].colecciones;
        return nombresColecciones.some(nombre => 
          col.name.toLowerCase().includes(nombre.toLowerCase().split(' ')[0])
        );
      })
    : colecciones;

  // Cargar colecciones de Postman
  const cargarColecciones = async () => {
    if (!estaConfiguradoPostman()) {
      toast.error("Configura tu API Key de Postman primero");
      setModalConfigAbierto(true);
      return;
    }

    setCargandoColecciones(true);
    try {
      const coleccionesObtenidas = await obtenerColecciones();
      setColecciones(coleccionesObtenidas);
      
      const cantidadFiltrada = claveProyecto 
        ? coleccionesObtenidas.filter(col => {
            const nombresColecciones = PROYECTOS_POSTMAN[claveProyecto].colecciones;
            return nombresColecciones.some(nombre => 
              col.name.toLowerCase().includes(nombre.toLowerCase().split(' ')[0])
            );
          }).length
        : coleccionesObtenidas.length;
      
      toast.success(`${cantidadFiltrada} colecciones encontradas para ${proyectoActual?.name || 'todos los proyectos'}`);
    } catch (error: any) {
      toast.error("Error al cargar colecciones", {
        description: error.message,
      });
    } finally {
      setCargandoColecciones(false);
    }
  };

  // Importar colección
  const handleImportarColeccion = async (collectionId: string) => {
    setImportando(collectionId);
    try {
      const coleccionImportada = await importarColeccion(collectionId);
      toast.success("Colección importada exitosamente", {
        description: `${coleccionImportada.nombre} - ${coleccionImportada.requests.length} requests`,
      });
      // Aquí puedes agregar lógica para guardar la colección en HAIDA
    } catch (error: any) {
      toast.error("Error al importar colección", {
        description: error.message,
      });
    } finally {
      setImportando(null);
    }
  };

  // Guardar API Key
  const handleGuardarApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Ingresa un API Key válido");
      return;
    }
    guardarPostmanApiKey(apiKey);
    toast.success("API Key guardado exitosamente");
    setModalConfigAbierto(false);
    setApiKey("");
  };

  // Nueva función para exportar proyecto completo
  const handleExportarProyecto = async () => {
    if (!proyectoActual) {
      toast.error("No hay proyecto seleccionado");
      return;
    }

    setExportando(true);
    try {
      // Importar dinámicamente el servicio de exportación
      const { exportProjectComplete } = await import("@/services/export-service");
      
      // Nota: Aquí deberías obtener los datos reales del contexto
      // Por ahora usamos arrays vacíos, pero en producción deberías:
      // const { suites, cases, executions, defects } = useData();
      // y filtrarlos por proyectoActual.id
      
      await exportProjectComplete(
        proyectoActual,
        [], // TODO: filtrar suites por proyecto
        [], // TODO: filtrar cases por proyecto
        [], // TODO: filtrar executions por proyecto
        []  // TODO: filtrar defects por proyecto
      );

      toast.success("Proyecto exportado exitosamente", {
        description: "Se descargaron 5 archivos: organization.json, modules.json, integrations.json, mappings.json, README.md"
      });
    } catch (error: any) {
      console.error("Error al exportar proyecto:", error);
      toast.error("Error al exportar proyecto", {
        description: error.message || "Error desconocido"
      });
    } finally {
      setExportando(false);
    }
  };

  // Obtener proyecto Jira correspondiente
  const obtenerProyectoJira = (): keyof typeof PROYECTOS_JIRA | null => {
    if (!proyectoActual) return null;
    
    const nombreProyecto = proyectoActual.name.toUpperCase();
    if (nombreProyecto.includes('PRIVALIA') || proyectoActual.key === 'PRIV') {
      return 'PRIVALIA';
    } else if (nombreProyecto.includes('CTB') || proyectoActual.key === 'CTB') {
      return 'CTB';
    } else if (nombreProyecto.includes('HAIDA') || proyectoActual.key === 'HAIDA') {
      return 'HAIDA';
    }
    return null;
  };

  const proyectoJira = obtenerProyectoJira();

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Botón Exportar Proyecto Completo */}
      <Button
        variant="outline"
        className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all"
        onClick={handleExportarProyecto}
        disabled={exportando || !proyectoActual}
      >
        {exportando ? (
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
        ) : (
          <FileDown className="h-4 w-4 text-purple-600" />
        )}
        <span className="hidden sm:inline">Export Complete</span>
        <span className="sm:hidden">Export</span>
      </Button>

      {/* Botón Postman */}
      <Dialog open={modalPostmanAbierto} onOpenChange={setModalPostmanAbierto}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 hover:shadow-md transition-all"
          >
            <Package className="h-4 w-4 text-orange-600" />
            <span className="hidden sm:inline">Postman Collections</span>
            {claveProyecto && (
              <span className="hidden md:inline text-xs text-muted-foreground">
                ({PROYECTOS_POSTMAN[claveProyecto].nombre})
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Colecciones de Postman
              {claveProyecto && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {PROYECTOS_POSTMAN[claveProyecto].nombre}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {claveProyecto 
                ? `Colecciones de pruebas API del proyecto ${proyectoActual?.name}`
                : "Importa colecciones de pruebas API desde tu workspace de Postman"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header con acciones */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cargarColecciones}
                  disabled={cargandoColecciones}
                  className="gap-2"
                >
                  {cargandoColecciones ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Actualizar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={abrirWorkspacePostman}
                  className="gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir Postman
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalConfigAbierto(true)}
                className="gap-2"
              >
                <Key className="h-3.5 w-3.5" />
                Configurar API Key
              </Button>
            </div>

            {/* Indicador de filtro activo */}
            {claveProyecto && colecciones.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    Filtrado por proyecto: {PROYECTOS_POSTMAN[claveProyecto].nombre}
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Mostrando {coleccionesFiltradas.length} de {colecciones.length} colecciones totales
                </p>
              </div>
            )}

            {/* Lista de colecciones */}
            <ScrollArea className="h-[400px] border rounded-lg">
              {coleccionesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                  <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <h3 className="font-semibold text-sm mb-1">
                    {colecciones.length === 0 
                      ? "No hay colecciones cargadas"
                      : `No hay colecciones para ${proyectoActual?.name}`
                    }
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {colecciones.length === 0
                      ? "Haz clic en \"Actualizar\" para cargar tus colecciones"
                      : "Las colecciones de este proyecto no están disponibles"
                    }
                  </p>
                  {colecciones.length === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cargarColecciones}
                      disabled={cargandoColecciones}
                    >
                      Cargar Colecciones
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {coleccionesFiltradas.map((coleccion) => (
                    <div
                      key={coleccion.id}
                      className="p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">
                            {coleccion.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            ID: {coleccion.uid}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Actualizado: {new Date(coleccion.updatedAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => abrirColeccionEnPostman(coleccion.id)}
                            title="Abrir en Postman"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleImportarColeccion(coleccion.id)}
                            disabled={importando === coleccion.id}
                          >
                            {importando === coleccion.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Importando...
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                Importar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Info del workspace */}
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-xs text-orange-900 dark:text-orange-100 mb-1">
                📚 Workspace HAIDA Global Team
              </h4>
              <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                Proyectos: CTB, HAIDA, Privalia | APIs disponibles para todos los proyectos
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuración de API Key */}
      <Dialog open={modalConfigAbierto} onOpenChange={setModalConfigAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configurar Postman API Key
            </DialogTitle>
            <DialogDescription>
              Ingresa tu API Key de Postman para acceder a tus colecciones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">API Key</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="PMAK-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Genera tu API Key en{" "}
                <a
                  href="https://web.postman.co/settings/me/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Postman Settings
                </a>
              </p>
            </div>

            <Button onClick={handleGuardarApiKey} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Guardar API Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botón de Jira - Solo el proyecto actual */}
      {proyectoJira && PROYECTOS_JIRA[proyectoJira] && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => abrirProyectoJira(proyectoJira)}
          className="gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all"
          title={`Abrir ${PROYECTOS_JIRA[proyectoJira].nombre} en Jira`}
        >
          <FolderKanban className="h-3.5 w-3.5 text-blue-600" />
          <span>Jira: {PROYECTOS_JIRA[proyectoJira].nombre}</span>
        </Button>
      )}
    </div>
  );
}