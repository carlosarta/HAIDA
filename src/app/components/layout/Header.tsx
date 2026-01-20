import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../ui/dropdown-menu"
import { ThemeToggle } from "../ThemeToggle"
import { Bell, Search, Home, Folder, PenTool, PlayCircle, BarChart3, Bot, Languages, Shield } from "lucide-react"
import { Input } from "../ui/input"
import { useState } from "react"
import { cn } from "../ui/utils"
import { toast } from "sonner"
import { useLang, Language } from "../../lib/i18n-context"
import { useUi } from "../../lib/ui-context"

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { lang, setLang, t } = useLang();
  const { config } = useUi();
  const { header } = config;

  // Logic for Global Search
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        toast.info(`${t('search.placeholder')}: "${searchQuery}"`);
        onNavigate('projects'); 
      }
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { name: t("nav.dashboard"), value: "dashboard", icon: <Home className="h-4 w-4" /> },
    { name: t("nav.projects"), value: "projects", icon: <Folder className="h-4 w-4" /> },
    { name: t("nav.designer"), value: "designer", icon: <PenTool className="h-4 w-4" /> },
    { name: t("nav.executor"), value: "executor", icon: <PlayCircle className="h-4 w-4" /> },
    { name: t("nav.reporter"), value: "reporter", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => onNavigate('dashboard')}>

          {/* Changed: Removed hidden sm:inline-block to always show on mobile */}

        </div>

        {/* Center: Navigation (Compact) - Hidden on Mobile */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/50 mx-4">
          {navItems.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-4 rounded-full text-xs font-medium transition-all",
                currentPage === item.value 
                  ? "bg-background text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
              onClick={() => onNavigate(item.value)}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
           {/* Search Toggle */}
           {header.showSearch && (
             <div className={cn("transition-all duration-300", isSearchOpen ? "w-32 sm:w-64" : "w-9")}>
              {isSearchOpen ? (
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t("search.placeholder")} 
                    className="h-9 pl-9 rounded-full bg-muted/40 border-transparent focus:bg-background transition-all"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
           )}

           {/* Copilot 365 Button */}
           <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-9 w-9 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/5",
              currentPage === 'chat' && "bg-primary/10 text-primary ring-1 ring-primary/20"
            )}
            onClick={() => onNavigate('chat')}
            title="AI Copilot"
          >
            <Bot className={cn("h-5 w-5", currentPage === 'chat' && "animate-pulse")} />
          </Button>

          {/* Notifications */}
          {header.showNotifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative hover:bg-muted/50">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <DropdownMenuLabel className="p-3 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                  <DropdownMenuItem className="p-2 cursor-pointer rounded-md focus:bg-muted/50">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">New suite generated</span>
                      <span className="text-xs text-muted-foreground">Checkout E2E suite updated by AI</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Language Switcher */}
          {header.showLanguageSwitcher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as Language)}>
                  <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="fr">Français</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {header.showThemeToggle && <ThemeToggle />}

          {/* User Management - Admin/Manager only */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-9 w-9 rounded-full transition-all text-muted-foreground hover:text-accent hover:bg-accent/5",
              currentPage === 'user-management' && "bg-accent/10 text-accent ring-1 ring-accent/20"
            )}
            onClick={() => onNavigate('user-management')}
            title="Gestión de Usuarios y Permisos"
          >
            <Shield className={cn("h-4 w-4")} />
          </Button>

          {/* User Profile */}
          {header.showUserMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0 ml-1 ring-2 ring-transparent hover:ring-primary/10 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                    <AvatarFallback>CR</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal p-3 bg-muted/30">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Carlos Ruiz</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {t("role.admin")}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')}>Profile & Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('login')} className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}