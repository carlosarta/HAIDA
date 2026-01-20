import { cn } from "@/app/components/ui/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
  className?: string;
}

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle2,
    label: 'Activo',
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    iconColor: 'text-green-600 dark:text-green-500',
  },
  inactive: {
    icon: XCircle,
    label: 'Inactivo',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-400',
    iconColor: 'text-slate-500 dark:text-slate-400',
  },
  pending: {
    icon: Clock,
    label: 'Pendiente',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-500',
  },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", config.iconColor)} />
      {config.label}
    </span>
  );
}
