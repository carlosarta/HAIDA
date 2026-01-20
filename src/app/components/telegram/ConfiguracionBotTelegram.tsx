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
import { MessageCircle, ExternalLink, Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";
import QRCode from "react-qr-code";
import { 
  conectarBotTelegram, 
  estaConectadoTelegram, 
  obtenerConfiguracionTelegram 
} from "@/services/telegram-api";

interface ConfiguracionBotTelegramProps {
  abierto: boolean;
  alCerrar: () => void;
}

export function ConfiguracionBotTelegram({
  abierto,
  alCerrar,
}: ConfiguracionBotTelegramProps) {
  const [tokenTelegram, setTokenTelegram] = useState("");
  const [idChat, setIdChat] = useState("");
  const [conectado, setConectado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const URL_BOT_HAIDA = "https://bothaida.stayarta.com/";

  const manejarConexion = async () => {
    if (!tokenTelegram || !idChat) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setCargando(true);
    
    try {
      await conectarBotTelegram({
        botToken: tokenTelegram,
        chatId: idChat,
        userId: 'current-user-id', // En producción, esto vendría del contexto de autenticación
      });
      
      setConectado(true);
      toast.success("Bot de Telegram conectado exitosamente", {
        description: "Ahora recibirás notificaciones en tiempo real"
      });
    } catch (error: any) {
      toast.error("Error al conectar el bot de Telegram", {
        description: error.message || "Verifica tus credenciales e intenta nuevamente"
      });
    } finally {
      setCargando(false);
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiado(false), 2000);
  };

  const manejarCerrar = () => {
    if (!cargando) {
      alCerrar();
    }
  };

  useEffect(() => {
    const verificarConexión = async () => {
      const estaConectado = await estaConectadoTelegram();
      setConectado(estaConectado);
    };

    const obtenerConfig = async () => {
      const config = await obtenerConfiguracionTelegram();
      if (config) {
        setTokenTelegram(config.token);
        setIdChat(config.idChat);
      }
    };

    verificarConexión();
    obtenerConfig();
  }, []);

  return (
    <Dialog open={abierto} onOpenChange={manejarCerrar}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header con botón de cerrar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 py-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-0.5">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <DialogTitle className="font-heading text-xl leading-tight">
                    Configuración del Bot de Telegram
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    Configura el bot de Telegram para recibir notificaciones y actualizaciones
                    de tus proyectos de QA directamente en tu dispositivo.
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={manejarCerrar}
                disabled={cargando}
                className="h-8 w-8 rounded-lg shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Estado de conexión */}
          {conectado && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-green-600 mt-0.5">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-green-900 dark:text-green-100 mb-0.5">
                  Bot conectado correctamente
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Recibirás notificaciones en tiempo real de tus proyectos
                </p>
              </div>
            </div>
          )}

          {/* Paso 1: Acceder al Bot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  1
                </span>
                Accede al Bot de HAIDA
              </h4>
            </div>
            <div className="p-5 rounded-xl border border-border/50 bg-muted/30 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Haz clic en el botón para abrir el bot de HAIDA en Telegram y comenzar
                la conversación.
              </p>
              <Button
                variant="outline"
                className="w-full h-11 gap-2 bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 hover:border-blue-500/30 transition-all"
                onClick={() => window.open(URL_BOT_HAIDA, "_blank")}
              >
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Abrir Bot de HAIDA en Telegram</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </Button>
              
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground font-medium">o escanea el código QR</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              
              <div className="p-4 rounded-xl bg-background/50 border border-border/30 flex items-center justify-center">
                <div className="p-6 bg-white dark:bg-white rounded-lg shadow-sm">
                  <QRCode
                    value={URL_BOT_HAIDA}
                    size={128}
                    className="h-32 w-32 text-muted-foreground/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Paso 2: Obtener Token */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </span>
                Obtén tu Token de Autenticación
              </h4>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium">
                  Token del Bot
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="token"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={tokenTelegram}
                    onChange={(e) => setTokenTelegram(e.target.value)}
                    className="font-mono text-sm h-11"
                    disabled={cargando || conectado}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copiarAlPortapapeles(tokenTelegram)}
                    disabled={!tokenTelegram || cargando || conectado}
                    className="h-11 w-11 shrink-0"
                  >
                    {copiado ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El bot te enviará este token después de iniciar la conversación con /start
                </p>
              </div>
            </div>
          </div>

          {/* Paso 3: ID del Chat */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  3
                </span>
                Configura el ID del Chat
              </h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatId" className="text-sm font-medium">
                ID del Chat
              </Label>
              <Input
                id="chatId"
                placeholder="Ej: -1001234567890"
                value={idChat}
                onChange={(e) => setIdChat(e.target.value)}
                className="font-mono text-sm h-11"
                disabled={cargando || conectado}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                El bot te proporcionará el ID del chat tras el primer mensaje
              </p>
            </div>
          </div>

          {/* Tipos de notificaciones */}
          <div className="space-y-3 pt-2">
            <h4 className="font-heading font-semibold text-sm">
              Notificaciones Disponibles
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Nuevos defectos críticos",
                "Ejecuciones completadas",
                "Cambios en proyectos",
                "Reportes semanales",
              ].map((notificacion) => (
                <div
                  key={notificacion}
                  className="p-3 rounded-lg border border-border/50 bg-muted/30 text-xs font-medium text-center hover:bg-muted/50 transition-colors"
                >
                  {notificacion}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={manejarCerrar}
              disabled={cargando}
              className="flex-1 h-11"
            >
              {conectado ? "Cerrar" : "Cancelar"}
            </Button>
            <Button
              onClick={manejarConexion}
              disabled={!tokenTelegram || !idChat || conectado || cargando}
              className={cn(
                "flex-1 h-11 gap-2 font-medium",
                conectado && "bg-green-600 hover:bg-green-700"
              )}
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Conectando...
                </>
              ) : conectado ? (
                <>
                  <Check className="h-4 w-4" />
                  Conectado
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Conectar Bot
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}