import { cn } from "@/app/components/ui/utils";
import { Check, Lock } from "lucide-react";
import { PERMISSIONS_BY_RESOURCE, type Permission, type GlobalRole, type ProjectRole } from "@/types/permissions";
import { calculateEffectivePermissions } from "@/types/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

interface PermissionsMatrixProps {
  globalRole: GlobalRole;
  projectRole?: ProjectRole;
  className?: string;
}

const RESOURCE_LABELS: Record<string, string> = {
  projects: 'Proyectos',
  test_suites: 'Test Suites',
  test_cases: 'Test Cases',
  executions: 'Ejecuciones',
  reports: 'Reportes',
  users: 'Usuarios',
  settings: 'Configuración',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Crear',
  read: 'Ver',
  update: 'Editar',
  delete: 'Eliminar',
  manage: 'Gestionar',
  execute: 'Ejecutar',
  export: 'Exportar',
  manage_permissions: 'Permisos',
};

export function PermissionsMatrix({ globalRole, projectRole, className }: PermissionsMatrixProps) {
  const effectivePermissions = calculateEffectivePermissions(globalRole, projectRole);

  const hasPermission = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}` as Permission;
    return effectivePermissions.includes(permission);
  };

  return (
    <TooltipProvider>
      <div className={cn("border border-border/50 rounded-lg overflow-hidden bg-card", className)}>
        {/* Header */}
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h4 className="font-heading font-semibold text-sm text-foreground">
            Matriz de Permisos Efectivos
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Combinación de permisos globales {projectRole && '+ permisos del proyecto'}
          </p>
        </div>

        {/* Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/20">
                <th className="text-left py-2 px-4 font-mono font-medium text-muted-foreground sticky left-0 bg-muted/20 z-10">
                  Recurso
                </th>
                {Object.entries(ACTION_LABELS).map(([action, label]) => (
                  <th key={action} className="text-center py-2 px-3 font-mono font-medium text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSIONS_BY_RESOURCE).map(([resource, actions], idx) => (
                <tr 
                  key={resource} 
                  className={cn(
                    "border-t border-border/50 hover:bg-muted/20 transition-colors",
                    idx % 2 === 0 && "bg-muted/5"
                  )}
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border/50">
                    {RESOURCE_LABELS[resource] || resource}
                  </td>
                  {Object.keys(ACTION_LABELS).map((action) => {
                    const hasAccess = actions.includes(action) && hasPermission(resource, action);
                    const isActionAvailable = actions.includes(action);

                    if (!isActionAvailable) {
                      return <td key={action} className="text-center py-2.5 px-3 text-muted-foreground/20">—</td>;
                    }

                    return (
                      <td key={action} className="text-center py-2.5 px-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center">
                              {hasAccess ? (
                                <Check className="h-4 w-4 text-[#1F9E8B]" />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {hasAccess 
                                ? `Puede ${ACTION_LABELS[action].toLowerCase()} ${RESOURCE_LABELS[resource].toLowerCase()}`
                                : `No puede ${ACTION_LABELS[action].toLowerCase()} ${RESOURCE_LABELS[resource].toLowerCase()}`
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Legend */}
        <div className="bg-muted/10 px-4 py-2.5 border-t border-border/50 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#1F9E8B]" />
            <span className="text-muted-foreground">Permitido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-muted-foreground/30" />
            <span className="text-muted-foreground">Bloqueado</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
