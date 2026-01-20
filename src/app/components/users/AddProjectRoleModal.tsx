import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { FolderPlus, Shield } from "lucide-react";
import { ProjectRole, PROJECT_ROLES } from "@/types/permissions";
import { toast } from "sonner";
import { usersAPI, projectsAPI } from "@/services/api";
import type { Project } from "@/services/api";

interface AddProjectRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
  existingProjectIds: string[];
}

export function AddProjectRoleModal({
  open,
  onClose,
  onSuccess,
  userId,
  userName,
  existingProjectIds,
}: AddProjectRoleModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("contributor");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const allProjects = await projectsAPI.getAll();
      // Filtrar proyectos que el usuario ya tiene asignados
      const availableProjects = allProjects.filter(
        (p) => !existingProjectIds.includes(p.id)
      );
      setProjects(availableProjects);
      
      if (availableProjects.length > 0) {
        setSelectedProjectId(availableProjects[0].id);
      }
    } catch (error: any) {
      toast.error("Error al cargar proyectos");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("Selecciona un proyecto");
      return;
    }

    setIsLoading(true);
    try {
      await usersAPI.addProjectRole(userId, selectedProjectId, selectedRole);
      
      const project = projects.find((p) => p.id === selectedProjectId);
      toast.success("Rol asignado correctamente", {
        description: `${userName} ahora es ${PROJECT_ROLES[selectedRole].label} en ${project?.name}`,
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Error al asignar rol");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedProjectId("");
      setSelectedRole("contributor");
      onClose();
    }
  };

  const selectedRoleInfo = PROJECT_ROLES[selectedRole];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            Asignar Proyecto
          </DialogTitle>
          <DialogDescription>
            Otorga acceso a {userName} en un proyecto específico con el rol seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {isLoadingProjects ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Cargando proyectos...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderPlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  No hay proyectos disponibles
                </p>
                <p className="text-xs text-muted-foreground">
                  Este usuario ya tiene acceso a todos los proyectos
                </p>
              </div>
            ) : (
              <>
                {/* Project Selector */}
                <div className="space-y-2">
                  <Label htmlFor="project" className="text-sm font-medium">
                    Proyecto
                  </Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="project" className="h-10">
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {project.key} • {project.owner}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Rol en el Proyecto
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole(v as ProjectRole)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_ROLES).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{info.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Description */}
                <div className="rounded-lg bg-muted/50 p-3 border border-border/50">
                  <p className="text-xs font-medium text-foreground mb-1">
                    {selectedRoleInfo.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedRoleInfo.description}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || projects.length === 0}
            >
              {isLoading ? "Asignando..." : "Asignar Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
