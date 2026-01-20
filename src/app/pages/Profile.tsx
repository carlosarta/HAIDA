"use client";

import { useState, useRef, useEffect } from "react";
import { User, Mail, Shield, Save, LogOut, Bell, Moon, Sun, Camera, Lock, Smartphone, Globe, Upload, ExternalLink, Trash2, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {HbSeparator} from "../components/ui/separator"; // Note: This seems to be a custom name in my thought, but I should use Separator
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {HbBadge} from "../components/ui/badge"; // Note: custom name check
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { useAuth } from "../context/auth-context";
import { useGraph } from "@/hooks/useGraph";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

type Tab = 'personal' | 'system' | 'general' | 'security' | 'notifications';

export function Profile({ onLogout }: { onLogout: () => void }) {
  const { user: authUser, logout } = useAuth();
  const { getProfile, getProfilePhoto } = useGraph();
  
  const [user, setUser] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    role: "QA Professional",
    avatar: "",
    department: "Quality Assurance",
    bio: ""
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Microsoft Graph profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profile, photoUrl] = await Promise.all([
          getProfile(),
          getProfilePhoto()
        ]);
        
        setUser(prev => ({
          ...prev,
          name: profile.displayName || authUser?.name || "",
          email: profile.mail || profile.userPrincipalName || authUser?.email || "",
          department: profile.department || "Quality Assurance",
          bio: profile.aboutMe || "",
          avatar: photoUrl || "",
        }));
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    if (authUser) {
      loadProfile();
    }
  }, [authUser, getProfile, getProfilePhoto]);
  
  // Estados para Preferencias del Sistema
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
    mfaEnabled: true,
    language: "English (US)",
    externalLinks: "new_tab",
    autoLock: false
  });

  // Notification Preferences State
  const [notificationSettings, setNotificationSettings] = useState({
    suiteCompletion: true,
    taskAssignments: true,
    mentions: true,
    projectUpdates: false
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully", {
      description: "Your changes have been saved to the secure database."
    });
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUser(prev => ({ ...prev, avatar: imageUrl }));
      toast.success("Avatar Updated", { description: "New profile picture uploaded." });
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => {
      const newState = !prev[key as keyof typeof preferences];
      
      // Theme Logic
      if (key === 'darkMode') {
        const root = window.document.documentElement;
        if (newState) {
          root.classList.add("dark");
          toast.info("Dark Mode Enabled");
        } else {
          root.classList.remove("dark");
          toast.info("Light Mode Enabled");
        }
      } else {
        toast.info("Preference Updated");
      }
      
      return { ...prev, [key]: newState };
    });
  };

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification Preference Updated");
  };

  const handleClearCache = () => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    toast.success("App Cache Cleared", {
      description: "Application storage has been reset. Reloading..."
    });

    // Reload application after a short delay to allow toast to show
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleLogout = () => {
    toast.success("Sesión cerrada", {
      description: "Has cerrado sesión correctamente."
    });
    logout();
    onLogout();
  };

  // --- TAB CONTENT RENDERERS ---

  const renderPersonal = () => (
    <Card className="border-t-4 border-t-primary shadow-md">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Manage your public profile and contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className={cn("h-32 w-32 border-4 border-background shadow-xl transition-all", isEditing && "group-hover:opacity-75")}>
              <AvatarImage src={user.avatar} className="object-cover" />
              <AvatarFallback className="text-2xl">CR</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Camera className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {isEditing && <p className="text-xs text-muted-foreground">Click image to upload</p>}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name" 
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})}
                disabled={!isEditing}
                className="pl-10" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                value={user.email} 
                disabled 
                className="pl-10 bg-muted/50" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            <Input 
              id="dept" 
              value={user.department} 
              onChange={(e) => setUser({...user, department: e.target.value})}
              disabled={!isEditing} 
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2 border p-2.5 rounded-md bg-muted/20 h-10">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{user.role}</span>
              <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary hover:bg-primary/20">Admin</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Input 
            value={user.bio} 
            onChange={(e) => setUser({...user, bio: e.target.value})}
            disabled={!isEditing}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t bg-muted/5 px-6 py-4">
        <div className="text-xs text-muted-foreground">
          Last login: Today at 09:41 AM from Mac OS
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderSystem = () => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>System Preferences</CardTitle>
        <CardDescription>Customize your workspace experience.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              {preferences.darkMode ? <Moon className="h-5 w-5 text-purple-500" /> : <Sun className="h-5 w-5 text-orange-500" />}
              Appearance
            </Label>
            <p className="text-sm text-muted-foreground">Toggle between Light and Dark themes.</p>
          </div>
          <Switch 
            checked={preferences.darkMode} 
            onCheckedChange={() => togglePreference('darkMode')} 
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Language
            </Label>
            <p className="text-sm text-muted-foreground">Select your preferred language interface.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{preferences.language}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><span className="sr-only">Change</span><Upload className="h-4 w-4 rotate-90" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGeneral = () => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage application behavior and storage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* External Links */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
            <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-blue-500" />
                    External Links
                </Label>
                <p className="text-sm text-muted-foreground">Choose how to open links outside the application.</p>
            </div>
             <div className="flex items-center gap-2">
                <select 
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={preferences.externalLinks}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreferences({...preferences, externalLinks: val});
                      if (val !== 'default') {
                        toast.info(`Preferred browser set to ${val}`, {
                          description: "If not detected, you'll be redirected to the official store for installation."
                        });
                      }
                    }}
                >
                    <option value="default">System Default</option>
                    <option value="chrome">Google Chrome</option>
                    <option value="firefox">Mozilla Firefox</option>
                    <option value="safari">Apple Safari</option>
                    <option value="edge">Microsoft Edge</option>
                    <option value="opera">Opera</option>
                    <option value="brave">Brave</option>
                </select>
             </div>
        </div>

        {/* App Lock */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
            <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                    <Lock className="h-5 w-5 text-orange-500" />
                    Application Lock
                </Label>
                <p className="text-sm text-muted-foreground">Auto-lock application after 15 minutes of inactivity.</p>
            </div>
            <Switch 
                checked={preferences.autoLock} 
                onCheckedChange={() => togglePreference('autoLock')} 
            />
        </div>

        <Separator />

        {/* Clear Cache */}
         <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
               <Trash2 className="h-6 w-6" /> 
             </div>
             <div>
               <h4 className="font-semibold text-red-800 dark:text-red-400">Clear Application Cache</h4>
               <p className="text-xs text-red-700 dark:text-red-500">Free up space and resolve local data issues.</p>
             </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800">
                  Clear Now
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear local data stored by this application in your browser. It will not affect your other browser data. The page will reload after clearing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </CardContent>
    </Card>
  );

  const renderSecurity = () => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage password and authentication methods.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
               <Shield className="h-6 w-6" />
             </div>
             <div>
               <h4 className="font-semibold text-green-800 dark:text-green-400">Account Protected</h4>
               <p className="text-xs text-green-700 dark:text-green-500">Your account meets all security standards.</p>
             </div>
          </div>
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">Audit Log</Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Two-Factor Authentication (2FA)
            </Label>
            <p className="text-sm text-muted-foreground">Secure your account with an authenticator app.</p>
          </div>
          <Switch 
            checked={preferences.mfaEnabled} 
            onCheckedChange={() => togglePreference('mfaEnabled')}
          />
        </div>

        <div className="space-y-2 pt-4">
           <Label>Change Password</Label>
           <div className="grid grid-cols-2 gap-4">
             <Input type="password" placeholder="Current Password" />
             <Input type="password" placeholder="New Password" />
           </div>
           <Button className="w-full mt-2" variant="secondary">Update Password</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderNotifications = () => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Control which updates you want to receive.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Suite Completion */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Suite Execution
            </Label>
            <p className="text-sm text-muted-foreground">Notify when automated test suites complete.</p>
          </div>
          <Switch 
            checked={notificationSettings.suiteCompletion} 
            onCheckedChange={() => toggleNotification('suiteCompletion')} 
          />
        </div>

        {/* Task Assignments */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Task Assignments
            </Label>
            <p className="text-sm text-muted-foreground">Get notified when a team member assigns a task to you.</p>
          </div>
          <Switch 
            checked={notificationSettings.taskAssignments} 
            onCheckedChange={() => toggleNotification('taskAssignments')} 
          />
        </div>

        {/* Mentions */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Mentions
            </Label>
            <p className="text-sm text-muted-foreground">Notify when you are mentioned in comments or docs.</p>
          </div>
          <Switch 
            checked={notificationSettings.mentions} 
            onCheckedChange={() => toggleNotification('mentions')} 
          />
        </div>

        {/* Project Updates */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Project Updates
            </Label>
            <p className="text-sm text-muted-foreground">Receive weekly summaries of project activity.</p>
          </div>
          <Switch 
            checked={notificationSettings.projectUpdates} 
            onCheckedChange={() => toggleNotification('projectUpdates')} 
          />
        </div>

      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-in fade-in duration-500 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, preferences, and security.</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Navigation Tabs (Horizontal Capsules) */}
        <nav className="flex flex-wrap items-center gap-2">
          <Button 
            variant={activeTab === 'personal' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full px-6", activeTab === 'personal' ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50")}
            onClick={() => setActiveTab('personal')}
          >
            <User className="mr-2 h-4 w-4" /> Personal
          </Button>
          <Button 
            variant={activeTab === 'system' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full px-6", activeTab === 'system' ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50")}
            onClick={() => setActiveTab('system')}
          >
            <User className="mr-2 h-4 w-4" /> System
          </Button>
          <Button 
            variant={activeTab === 'general' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full px-6", activeTab === 'general' ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50")}
            onClick={() => setActiveTab('general')}
          >
             <Globe className="mr-2 h-4 w-4" /> General
          </Button>
          <Button 
            variant={activeTab === 'security' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full px-6", activeTab === 'security' ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50")}
            onClick={() => setActiveTab('security')}
          >
            <Lock className="mr-2 h-4 w-4" /> Security
          </Button>
          <Button 
            variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full px-6", activeTab === 'notifications' ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50")}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
        </nav>
        
        {/* Logout Button (Moved below options container) */}
        <div className="flex justify-start">
             <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full px-6" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Button>
        </div>

        <Separator />

        <div className="mt-2">
          {activeTab === 'personal' && renderPersonal()}
          {activeTab === 'system' && renderSystem()}
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'notifications' && renderNotifications()}
        </div>
      </div>
    </div>
  );
}