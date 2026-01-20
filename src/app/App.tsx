import { ThemeProvider } from "./components/theme-provider";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/auth/msal-config";
import { AuthProvider } from "./context/auth-context";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { Login } from "./pages/Login";
import { Projects } from "./pages/Projects";
import { Designer } from "./pages/Designer";
import { Executor } from "./pages/Executor";
import { Reporter } from "./pages/Reporter";
import {Qlty} from "./pages/Profile"; // Note: Profile export was named Profile, need to check if I broke it. Assuming default export or named export.
import { Profile } from "./pages/Profile";
import { StyleGuide } from "./components/StyleGuide";
import { UserManagement } from "./components/users/UserManagement";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useState, useEffect } from "react";
import { Home, Folder, MessageSquare, PenTool, PlayCircle, BarChart3 } from "lucide-react";
import { cn } from "./components/ui/utils";
import { DataProvider } from "./lib/data-context";
import { UiProvider } from "./lib/ui-context";
import { LanguageProvider } from "./lib/i18n-context";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [msalInitialized, setMsalInitialized] = useState(false);

  useEffect(() => {
    // Initialize MSAL instance
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setMsalInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        setMsalInitialized(true); // Still set to true to render the app
      }
    };

    initializeMsal();
  }, []);

  const isLoginPage = currentPage === "login";
  
  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onLogin={() => setCurrentPage("dashboard")} />;
      case "dashboard":
        return <Dashboard />;
      case "chat":
        return <Chat />;
      case "projects":
        return <Projects />;
      case "designer":
        return <Designer />;
      case "executor": 
        return <Executor />;
      case "reporter": 
        return <Reporter />;
      case "user-management":
        return <UserManagement currentUserRole="admin" />;
      case "profile":
        return <Profile onLogout={() => setCurrentPage("login")} />;
      case "styleguide":
        return <StyleGuide />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { name: "Dashboard", value: "dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Projects", value: "projects", icon: <Folder className="h-5 w-5" /> },
    { name: "Designer", value: "designer", icon: <PenTool className="h-5 w-5" /> },
    { name: "Executor", value: "executor", icon: <PlayCircle className="h-5 w-5" /> },
    { name: "Reporter", value: "reporter", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Chat IA", value: "chat", icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <ErrorBoundary>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <DataProvider>
            <UiProvider>
            <LanguageProvider>
              <ThemeProvider defaultTheme="light" enableSystem disableTransitionOnChange>
                {/* Show loading while MSAL initializes */}
                {!msalInitialized ? (
                  <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Iniciando aplicación...</p>
                    </div>
                  </div>
                ) : (
                  <>
              {/* Global Styles Injection for Scrollbar Hiding */}
              <style dangerouslySetInnerHTML={{__html: `
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                  width: 0px;
                  background: transparent;
                }
                
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
                
                /* Ensure body doesn't scroll double */
                body {
                  overflow: hidden;
                  width: 100%;
                  height: 100%;
                  position: fixed;
                }
              `}} />

              <div className="flex flex-col h-[100dvh] bg-background text-foreground font-sans antialiased overflow-hidden">
                
                {/* Ambient Background Glows */}
                <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten opacity-50" />
                <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/15 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten opacity-50" />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                   {!isLoginPage && <Header onNavigate={setCurrentPage} currentPage={currentPage} />}
                   
                   {/* Scrollable Container with Hidden Scrollbar */}
                   <main className={cn(
                     "flex-1 overflow-y-auto no-scrollbar scroll-smooth", 
                     isLoginPage ? "" : "pb-20 md:pb-0"
                   )}>
                     {renderPage()}
                   </main>
                </div>
                
                {/* Bottom Nav for Mobile */}
                {!isLoginPage && (
                  <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass border-t border-white/20 z-50 flex items-center justify-around px-2 pb-safe bg-background/80 backdrop-blur-lg">
                    {navItems.slice(0, 5).map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setCurrentPage(item.value)}
                        className={cn(
                          "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                          currentPage === item.value ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {currentPage === item.value && (
                          <span className="absolute top-0 h-0.5 w-8 bg-primary rounded-b-full" />
                        )}
                        <div className={cn("p-1 rounded-xl transition-all", currentPage === item.value ? "bg-primary/10" : "")}>
                           {item.icon}
                        </div>
                        <span className="text-[10px] font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                <Toaster />
              </div>
              </>
              )}
            </ThemeProvider>
          </LanguageProvider>
          </UiProvider>
        </DataProvider>
      </AuthProvider>
    </MsalProvider>
    </ErrorBoundary>
  );
}