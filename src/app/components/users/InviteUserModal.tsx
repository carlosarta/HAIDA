import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { AlertCircle, Mail, Shield } from "lucide-react";
import { GlobalRole, GLOBAL_ROLES } from "@/types/permissions";
import { toast } from "sonner";
import { usersAPI } from "@/services/api";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteUserModal({ open, onClose, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<GlobalRole>("tester");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("El email es requerido");
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersAPI.invite(email, role);
      toast.success(response.message);
      setEmail("");
      setRole("tester");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al invitar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      setRole("tester");
      onClose();
    }
  };

  const selectedRoleInfo = GLOBAL_ROLES[role];
  const isHighRiskRole = role === 'admin' || role === 'manager';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invitar Nuevo Usuario
          </DialogTitle>
          <DialogDescription>
            Envía una invitación por email para agregar un nuevo usuario al sistema HAIDA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email del Usuario
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10"
                required
              />
            </div>

            {/* Role Selector */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Rol Global
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as GlobalRole)} disabled={isLoading}>
                <SelectTrigger id="role" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GLOBAL_ROLES).map(([key, info]) => (
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

            {/* High Risk Warning */}
            {isHighRiskRole && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-400">
                    Rol de Alto Privilegio
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                    Este rol tiene acceso completo al sistema. Asígnalo solo a usuarios de confianza.
                  </p>
                </div>
              </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
