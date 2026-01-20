import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- UI / CMS Data Model (Simulating a Database Schema) ---

export interface LoginConfig {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  rememberMeText: string;
  signInButtonText: string;
  forgotPasswordText: string;
  signUpText: string;
  microsoftButtonText: string;
  footerText: string;
  showMicrosoftLogin: boolean;
  showFooter: boolean;
  backgroundImage: string;
}

export interface HeaderConfig {
  brandName: string;
  showSearch: boolean;
  showNotifications: boolean;
  showThemeToggle: boolean;
  showLanguageSwitcher: boolean;
  showUserMenu: boolean;
}

export interface DashboardConfig {
  welcomeMessage: string;
  subtitleMessage: string;
  showKpiCards: boolean;
  showCharts: boolean;
  showRecentProjects: boolean;
}

export interface UiConfig {
  login: LoginConfig;
  header: HeaderConfig;
  dashboard: DashboardConfig;
}

// --- Mock Initial Data (The "Database" Content) ---

const DEFAULT_UI_CONFIG: UiConfig = {
  login: {
    title: "Welcome Back",
    subtitle: "Enter your credentials to access your QA workspace",
    emailPlaceholder: "name@example.com",
    passwordPlaceholder: "Password",
    rememberMeText: "Remember for 30 days",
    signInButtonText: "Sign In",
    forgotPasswordText: "Forgot password?",
    signUpText: "Sign up",
    microsoftButtonText: "Microsoft Entra ID",
    footerText: "© 2025 Hiberus Tecnología. Todos los derechos reservados.",
    showMicrosoftLogin: true,
    showFooter: true,
    backgroundImage: "bg-blue-500/10", // Example of mapping style
  },
  header: {
    brandName: "HAIDA",
    showSearch: true,
    showNotifications: true,
    showThemeToggle: true,
    showLanguageSwitcher: true,
    showUserMenu: true,
  },
  dashboard: {
    welcomeMessage: "Welcome Back",
    subtitleMessage: "Here's what's happening with your projects today.",
    showKpiCards: true,
    showCharts: true,
    showRecentProjects: true,
  }
};

// --- Context Interface ---

interface UiContextType {
  config: UiConfig;
  updateConfig: (section: keyof UiConfig, data: Partial<any>) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UiConfig>(DEFAULT_UI_CONFIG);

  // This function simulates an UPDATE query to the DB
  const updateConfig = (section: keyof UiConfig, data: Partial<any>) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  return (
    <UiContext.Provider value={{ config, updateConfig }}>
      {children}
    </UiContext.Provider>
  );
}

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
};
