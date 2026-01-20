import { useState, useEffect, useMemo } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical,
  Shield,
  Mail,
  Calendar,
  Activity,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { UserRoleChip } from "./UserRoleChip";
import { StatusBadge } from "./StatusBadge";
import { PermissionsMatrix } from "./PermissionsMatrix";
import { InviteUserModal } from "./InviteUserModal";
import { ConfirmModal } from "./ConfirmModal";
import { AddProjectRoleModal } from "./AddProjectRoleModal";
import { toast } from "sonner";
import { usersAPI } from "@/services/api";
import type { User, GlobalRole, ProjectRole, AuditLog } from "@/types/permissions";
import { GLOBAL_ROLES, PROJECT_ROLES, canEditGlobalRoles } from "@/types/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Skeleton } from "@/app/components/ui/skeleton";

interface UserManagementProps {
  currentUserRole: GlobalRole;
}

export function UserManagement({ currentUserRole }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addProjectRoleModalOpen, setAddProjectRoleModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const canEditGlobal = canEditGlobalRoles(currentUserRole);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Load audit logs when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadAuditLogs(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error: any) {
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async (userId: string) => {
    try {
      const logs = await usersAPI.getAuditLog(userId, 5);
      setAuditLogs(logs);
    } catch (error) {
      setAuditLogs([]);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === "all" || user.globalRole === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const handleUpdateStatus = async (userId: string, status: 'active' | 'inactive') => {
    try {
      await usersAPI.updateStatus(userId, status);
      toast.success(`Usuario ${status === 'active' ? 'activado' : 'desactivado'} correctamente`);
      loadUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status } : null);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado");
    }
  };

  const handleUpdateGlobalRole = async (userId: string, role: GlobalRole) => {
    try {
      await usersAPI.updateGlobalRole(userId, role);
      toast.success("Rol global actualizado correctamente");
      loadUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, globalRole: role } : null);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar rol");
    }
  };

  const handleRemoveProjectRole = async (userId: string, projectId: string) => {
    try {
      await usersAPI.removeProjectRole(userId, projectId);
      toast.success("Rol de proyecto removido");
      loadUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await usersAPI.getById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al remover rol");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                <Shield className="h-8 w-8 text-accent" />
                Gestión de Usuarios y Permisos
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Administra usuarios, roles globales y permisos por proyecto
              </p>
            </div>
            {canEditGlobal && (
              <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar Usuario
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rol Global" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {Object.entries(GLOBAL_ROLES).map(([key, info]) => (
                  <SelectItem key={key} value={key}>{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px] h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Users List */}
        <div className={cn(
          "transition-all duration-300 border-r border-border/50 bg-card/30 overflow-y-auto",
          selectedUser ? "w-full lg:w-1/2" : "w-full"
        )}>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all hover:shadow-md",
                      selectedUser?.id === user.id
                        ? "bg-accent/10 border-accent shadow-sm"
                        : "bg-card border-border/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-border/50">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="font-mono text-sm">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {user.name}
                          </h3>
                          <StatusBadge status={user.status} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1.5">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <UserRoleChip role={user.globalRole} type="global" />
                          {user.projectRoles.slice(0, 2).map((pr) => (
                            <UserRoleChip key={pr.projectId} role={pr.role} type="project" />
                          ))}
                          {user.projectRoles.length > 2 && (
                            <span className="text-xs text-muted-foreground font-mono">
                              +{user.projectRoles.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Details Panel */}
        {selectedUser && (
          <div className="hidden lg:block w-1/2 overflow-y-auto bg-background/50">
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex items-center justify-between">
              <h2 className="font-heading font-semibold text-lg">Detalles del Usuario</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-border/50">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback className="font-mono">
                    {getUserInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-xl mb-1">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedUser.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedUser.status} />
                    {selectedUser.ssoSource && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        SSO: {selectedUser.ssoSource}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {selectedUser.status === 'active' ? (
                      <DropdownMenuItem
                        onClick={() => {
                          setConfirmModal({
                            open: true,
                            title: "Desactivar Usuario",
                            description: `¿Estás seguro de que quieres desactivar a ${selectedUser.name}? El usuario no podrá acceder al sistema.`,
                            action: () => handleUpdateStatus(selectedUser.id, 'inactive'),
                            variant: 'destructive',
                          });
                        }}
                      >
                        Desactivar Usuario
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                      >
                        Activar Usuario
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Eliminar Usuario
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Último acceso
                  </p>
                  <p className="text-sm font-medium">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Creado
                  </p>
                  <p className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              {/* Global Role */}
              <div>
                <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Rol Global
                </h4>
                {canEditGlobal ? (
                  <Select 
                    value={selectedUser.globalRole} 
                    onValueChange={(v) => handleUpdateGlobalRole(selectedUser.id, v as GlobalRole)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GLOBAL_ROLES).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <p className="font-mono text-sm">{info.label}</p>
                            <p className="text-xs text-muted-foreground">{info.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <UserRoleChip role={selectedUser.globalRole} type="global" className="mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {GLOBAL_ROLES[selectedUser.globalRole].description}
                    </p>
                  </div>
                )}
              </div>

              {/* Project Roles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading font-semibold text-sm">
                    Roles por Proyecto ({selectedUser.projectRoles.length})
                  </h4>
                  {canEditGlobal && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddProjectRoleModalOpen(true)}
                      className="h-7 text-xs gap-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Agregar Proyecto
                    </Button>
                  )}
                </div>
                {selectedUser.projectRoles.length === 0 ? (
                  <div className="text-center py-8 rounded-lg bg-muted/30 border border-border/50 border-dashed">
                    <p className="text-sm text-muted-foreground mb-3">Sin proyectos asignados</p>
                    {canEditGlobal && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddProjectRoleModalOpen(true)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Asignar Primer Proyecto
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.projectRoles.map((pr) => (
                      <div
                        key={pr.projectId}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50"
                      >
                        <div>
                          <p className="font-mono text-xs text-muted-foreground mb-0.5">{pr.projectKey}</p>
                          <p className="font-medium text-sm">{pr.projectName}</p>
                          <UserRoleChip role={pr.role} type="project" className="mt-1.5" />
                        </div>
                        {canEditGlobal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmModal({
                                open: true,
                                title: "Remover Acceso al Proyecto",
                                description: `¿Remover a ${selectedUser.name} del proyecto ${pr.projectName}?`,
                                action: () => handleRemoveProjectRole(selectedUser.id, pr.projectId),
                                variant: 'destructive',
                              });
                            }}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Permissions Matrix */}
              <PermissionsMatrix
                globalRole={selectedUser.globalRole}
                projectRole={selectedUser.projectRoles[0]?.role}
              />

              {/* Audit Log */}
              <div>
                <h4 className="font-heading font-semibold text-sm mb-3">
                  Actividad Reciente
                </h4>
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    Sin actividad registrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-muted/30 border border-border/50 text-xs"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-mono font-medium text-foreground">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{log.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={loadUsers}
      />

      {selectedUser && (
        <AddProjectRoleModal
          open={addProjectRoleModalOpen}
          onClose={() => setAddProjectRoleModalOpen(false)}
          onSuccess={async () => {
            await loadUsers();
            if (selectedUser) {
              const updatedUser = await usersAPI.getById(selectedUser.id);
              setSelectedUser(updatedUser);
            }
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          existingProjectIds={selectedUser.projectRoles.map((pr) => pr.projectId)}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        onConfirm={() => {
          confirmModal.action();
          setConfirmModal(prev => ({ ...prev, open: false }));
        }}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
      />
    </div>
  );
}