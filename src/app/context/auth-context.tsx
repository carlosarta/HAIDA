import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest, isRunningInIframe } from '@/auth/msal-config';

interface User {
  name: string;
  email: string;
  id: string;
  photo?: string;
  authMethod?: 'microsoft' | 'manual';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  manualLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  acquireToken: (scopes: string[]) => Promise<string>;
  isInIframe: boolean;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [manualUser, setManualUser] = useState<User | null>(null);
  const isInIframe = isRunningInIframe();

  useEffect(() => {
    // Handle redirect promise on page load (only if not in iframe)
    const initializeMsal = async () => {
      try {
        if (!isInIframe) {
          await instance.handleRedirectPromise();
        }
        setLoading(false);
        setReady(true);
      } catch (error) {
        console.error('MSAL initialization error:', error);
        setLoading(false);
        setReady(true);
      }
    };

    if (inProgress === InteractionStatus.None) {
      initializeMsal();
    } else {
      setLoading(false);
      setReady(true);
    }
  }, [instance, inProgress, isInIframe]);

  // Función de login manual (para futuro uso con Supabase)
  const manualLogin = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);

      // TODO: Implementar integración con Supabase
      // Por ahora, usamos mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUsers = [
        { email: "admin@haida.com", password: "admin123", name: "Admin HAIDA", id: "admin-1" },
        { email: "user@haida.com", password: "user123", name: "User HAIDA", id: "user-1" },
        { email: "demo@haida.com", password: "demo123", name: "Demo User", id: "demo-1" },
      ];

      const user = mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (user) {
        setManualUser({
          name: user.name,
          email: user.email,
          id: user.id,
          authMethod: 'manual',
        });
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const login = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isInIframe) {
        // Use popup flow when in iframe (e.g., Figma Make preview)
        try {
          await instance.loginPopup(loginRequest);
          setLoading(false);
        } catch (popupError: any) {
          // If popup is blocked, show error
          console.error('Popup login failed:', popupError);
          setLoading(false);
          throw new Error('Por favor, permite popups en tu navegador o abre la aplicación en una nueva pestaña.');
        }
      } else {
        // Use redirect flow when not in iframe (normal browser window)
        await instance.loginRedirect(loginRequest);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    }
  }, [instance, isInIframe]);

  const logout = useCallback(() => {
    // Clear manual user if exists
    if (manualUser) {
      setManualUser(null);
      return;
    }

    // Otherwise, logout from Microsoft
    if (isInIframe) {
      instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } else {
      instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    }
  }, [instance, isInIframe, manualUser]);

  const acquireToken = useCallback(
    async (scopes: string[]): Promise<string> => {
      const account = accounts[0];
      if (!account) {
        throw new Error('No account found. Please login first.');
      }

      try {
        // Try silent token acquisition first
        const response = await instance.acquireTokenSilent({
          scopes,
          account,
        });
        return response.accessToken;
      } catch (error) {
        console.warn('Silent token acquisition failed, using interactive method');
        // Fall back to interactive method based on iframe status
        try {
          if (isInIframe) {
            const response = await instance.acquireTokenPopup({
              scopes,
              account,
            });
            return response.accessToken;
          } else {
            const response = await instance.acquireTokenRedirect({
              scopes,
              account,
            });
            return response?.accessToken || '';
          }
        } catch (interactiveError) {
          console.error('Token acquisition failed:', interactiveError);
          throw interactiveError;
        }
      }
    },
    [instance, accounts, isInIframe]
  );

  // Priorizar usuario manual sobre cuenta de Microsoft
  const user: User | null = manualUser || (accounts[0]
    ? {
        name: accounts[0].name || 'Unknown User',
        email: accounts[0].username || '',
        id: accounts[0].localAccountId,
        authMethod: 'microsoft',
      }
    : null);

  const value: AuthContextType = {
    isAuthenticated: !!manualUser || accounts.length > 0,
    user,
    loading: inProgress !== InteractionStatus.None || loading,
    login,
    manualLogin,
    logout,
    acquireToken,
    isInIframe,
    ready,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // During development hot-reload, context might not be available
    // Return safe defaults instead of throwing
    console.warn('useAuth called outside of AuthProvider, returning defaults');
    return {
      isAuthenticated: false,
      user: null,
      loading: true,
      login: async () => {},
      manualLogin: async () => {},
      logout: () => {},
      acquireToken: async () => '',
      isInIframe: false,
      ready: false,
    };
  }
  return context;
}