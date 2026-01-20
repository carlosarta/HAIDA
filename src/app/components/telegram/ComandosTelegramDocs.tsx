import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  FolderKanban,
  PlayCircle,
  FileText,
  Bell,
  Sparkles,
  Settings,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { COMANDOS_TELEGRAM, type CategoriaComandos } from "@/services/telegram-api";

const ICONOS_CATEGORIAS = {
  FolderKanban,
  PlayCircle,
  FileText,
  Bell,
  Sparkles,
  Settings,
};

interface ComandosTelegramDocsProps {
  compacto?: boolean;
}

export function ComandosTelegramDocs({ compacto = false }: ComandosTelegramDocsProps) {
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarComando = (comando: string) => {
    navigator.clipboard.writeText(comando);
    setCopiado(comando);
    toast.success("Comando copiado al portapapeles");
    setTimeout(() => setCopiado(null), 2000);
  };

  const obtenerIconoCategoria = (nombreIcono: string) => {
    const IconComponent = ICONOS_CATEGORIAS[nombreIcono as keyof typeof ICONOS_CATEGORIAS];
    return IconComponent || FolderKanban;
  };

  if (compacto) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {COMANDOS_TELEGRAM.map((categoria) => {
          const IconoCategoria = obtenerIconoCategoria(categoria.icon);
          return (
            <div
              key={categoria.category}
              className="p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${categoria.color}15`, color: categoria.color }}
                >
                  <IconoCategoria className="h-4 w-4" />
                </div>
                <h4 className="font-heading font-semibold text-sm capitalize">
                  {categoria.category}
                </h4>
              </div>
              <div className="space-y-1.5">
                {categoria.commands.map((cmd) => (
                  <div
                    key={cmd.key}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-md hover:bg-background/50"
                  >
                    <code className="font-mono text-xs">{cmd.command}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copiarComando(cmd.command)}
                    >
                      {copiado === cmd.command ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-heading text-lg font-semibold">
          Comandos Disponibles del Bot de Telegram
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Utiliza estos comandos para interactuar con HAIDA directamente desde Telegram.
          Puedes copiar el comando o hacer clic en el enlace para abrirlo en Telegram.
        </p>
      </div>

      <div className="space-y-6">
        {COMANDOS_TELEGRAM.map((categoria) => {
          const IconoCategoria = obtenerIconoCategoria(categoria.icon);
          return (
            <div
              key={categoria.category}
              className="p-5 rounded-xl border border-border/50 bg-muted/20"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: `${categoria.color}15`, color: categoria.color }}
                >
                  <IconoCategoria className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-base capitalize">
                    {categoria.category}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {categoria.commands.length} comandos disponibles
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {categoria.commands.map((cmd) => (
                  <div
                    key={cmd.key}
                    className="p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm font-semibold px-2 py-1 rounded bg-muted">
                            {cmd.command}
                          </code>
                        </div>
                        {cmd.descripcion && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {cmd.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copiarComando(cmd.command)}
                          title="Copiar comando"
                        >
                          {copiado === cmd.command ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(cmd.telegramLink, "_blank")}
                          title="Abrir en Telegram"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <h4 className="font-heading font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
          💡 Consejo
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Puedes usar estos comandos directamente en el chat con el bot de HAIDA.
          Algunos comandos pueden requerir parámetros adicionales que el bot te solicitará
          mediante preguntas interactivas.
        </p>
      </div>
    </div>
  );
}
