/**
 * StatCard Component
 * Componente optimizado para mostrar estadísticas
 */

import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { cn } from '@/app/components/ui/utils';
import type { StatCard as StatCardType } from '@/app/types/dashboard.types';

interface StatCardProps {
  stat: StatCardType;
  icon?: LucideIcon;
}

export const StatCard = memo(({ stat, icon: Icon }: StatCardProps) => {
  const getTrendIcon = () => {
    if (!stat.change) return Minus;
    if (stat.changeType === 'increase') return TrendingUp;
    if (stat.changeType === 'decrease') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!stat.change) return 'text-muted-foreground';
    if (stat.changeType === 'increase') return 'text-green-500';
    if (stat.changeType === 'decrease') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        {stat.change !== undefined && (
          <div className={cn('flex items-center text-xs mt-1', getTrendColor())}>
            <TrendIcon className="h-3 w-3 mr-1" />
            <span>{Math.abs(stat.change)}%</span>
          </div>
        )}
        {stat.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {stat.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
