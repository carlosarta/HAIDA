/**
 * ActivityFeed Component
 * Componente optimizado para mostrar actividad reciente
 */

import { memo, useMemo } from 'react';
import { 
  CheckCircle2, 
  PlusCircle, 
  Edit, 
  UserPlus, 
  MessageSquare, 
  Upload,
  LucideIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import type { Activity } from '@/app/types/dashboard.types';
import { ACTIVITY_TYPES } from '@/app/constants/dashboard.constants';

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: string;
}

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  [ACTIVITY_TYPES.TASK_CREATED]: PlusCircle,
  [ACTIVITY_TYPES.TASK_UPDATED]: Edit,
  [ACTIVITY_TYPES.TASK_COMPLETED]: CheckCircle2,
  [ACTIVITY_TYPES.PROJECT_CREATED]: PlusCircle,
  [ACTIVITY_TYPES.USER_JOINED]: UserPlus,
  [ACTIVITY_TYPES.COMMENT_ADDED]: MessageSquare,
  [ACTIVITY_TYPES.FILE_UPLOADED]: Upload,
};

const ACTIVITY_COLORS: Record<string, string> = {
  [ACTIVITY_TYPES.TASK_CREATED]: 'text-blue-500 bg-blue-100 dark:bg-blue-900',
  [ACTIVITY_TYPES.TASK_UPDATED]: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900',
  [ACTIVITY_TYPES.TASK_COMPLETED]: 'text-green-500 bg-green-100 dark:bg-green-900',
  [ACTIVITY_TYPES.PROJECT_CREATED]: 'text-purple-500 bg-purple-100 dark:bg-purple-900',
  [ACTIVITY_TYPES.USER_JOINED]: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900',
  [ACTIVITY_TYPES.COMMENT_ADDED]: 'text-pink-500 bg-pink-100 dark:bg-pink-900',
  [ACTIVITY_TYPES.FILE_UPLOADED]: 'text-orange-500 bg-orange-100 dark:bg-orange-900',
};

const ActivityItem = memo(({ activity }: { activity: Activity }) => {
  const Icon = ACTIVITY_ICONS[activity.type] || PlusCircle;
  const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-500 bg-gray-100';

  const timeAgo = useMemo(() => {
    const seconds = Math.floor((Date.now() - activity.timestamp.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }, [activity.timestamp]);

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {activity.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {activity.userName && (
            <>
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">
                  {activity.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {activity.userName}
              </span>
            </>
          )}
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

export const ActivityFeed = memo(({ activities, maxHeight = '400px' }: ActivityFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }} className="px-4 pb-4">
          <div className="space-y-2">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

ActivityFeed.displayName = 'ActivityFeed';
