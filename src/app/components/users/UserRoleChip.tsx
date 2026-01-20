import { cn } from "@/app/components/ui/utils";
import type { GlobalRole, ProjectRole } from "@/types/permissions";

interface UserRoleChipProps {
  role: GlobalRole | ProjectRole;
  type: 'global' | 'project';
  className?: string;
}

const GLOBAL_ROLE_COLORS: Record<GlobalRole, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  manager: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  qa_engineer: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  tester: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  developer: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  viewer: { bg: 'bg-slate-50 dark:bg-slate-950/30', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' },
};

const PROJECT_ROLE_COLORS: Record<ProjectRole, { bg: string; text: string; border: string }> = {
  owner: { bg: 'bg-[#1F9E8B]/10 dark:bg-[#1F9E8B]/20', text: 'text-[#1F9E8B]', border: 'border-[#1F9E8B]/30' },
  maintainer: { bg: 'bg-[#1F9E8B]/10 dark:bg-[#1F9E8B]/20', text: 'text-[#1F9E8B]', border: 'border-[#1F9E8B]/30' },
  contributor: { bg: 'bg-[#1F9E8B]/10 dark:bg-[#1F9E8B]/20', text: 'text-[#1F9E8B]', border: 'border-[#1F9E8B]/30' },
  viewer: { bg: 'bg-[#1F9E8B]/5 dark:bg-[#1F9E8B]/10', text: 'text-[#1F9E8B]/70', border: 'border-[#1F9E8B]/20' },
};

const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  qa_engineer: 'QA Engineer',
  tester: 'Tester',
  developer: 'Developer',
  viewer: 'Viewer',
};

const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  owner: 'Owner',
  maintainer: 'Maintainer',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

export function UserRoleChip({ role, type, className }: UserRoleChipProps) {
  const colors = type === 'global' 
    ? GLOBAL_ROLE_COLORS[role as GlobalRole] 
    : PROJECT_ROLE_COLORS[role as ProjectRole];
  
  const label = type === 'global'
    ? GLOBAL_ROLE_LABELS[role as GlobalRole]
    : PROJECT_ROLE_LABELS[role as ProjectRole];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border transition-all",
        colors.bg,
        colors.text,
        colors.border,
        type === 'project' && "ring-1 ring-[#1F9E8B]/10",
        className
      )}
    >
      {label}
    </span>
  );
}
