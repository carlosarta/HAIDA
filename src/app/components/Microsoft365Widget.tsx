import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useGraph } from '@/hooks/useGraph';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Mail, Calendar, FileText, Users } from 'lucide-react';

export function Microsoft365Widget() {
  const { user } = useAuth();
  const { getProfile, getProfilePhoto, loading } = useGraph();
  
  const [profile, setProfile] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    const loadMicrosoft365Data = async () => {
      try {
        const [profileData, photo] = await Promise.all([
          getProfile(),
          getProfilePhoto(),
        ]);
        setProfile(profileData);
        setPhotoUrl(photo || '');
      } catch (error) {
        console.error('Failed to load Microsoft 365 data:', error);
      }
    };

    if (user) {
      loadMicrosoft365Data();
    }
  }, [user, getProfile, getProfilePhoto]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 23 23" fill="currentColor">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          Microsoft 365 Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={photoUrl} alt={user?.name} />
            <AvatarFallback className="text-xl">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{profile?.displayName || user?.name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.jobTitle || 'QA Professional'}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile?.department && (
                <Badge variant="secondary" className="text-xs">
                  {profile.department}
                </Badge>
              )}
              {profile?.officeLocation && (
                <Badge variant="outline" className="text-xs">
                  📍 {profile.officeLocation}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Email</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Calendar</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">OneDrive</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">Teams</span>
          </div>
        </div>

        {profile?.mobilePhone && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            <span className="font-medium">Mobile:</span> {profile.mobilePhone}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
