import { PublicClientApplication, Configuration } from '@azure/msal-browser';

// Check if running in iframe
export const isRunningInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// MSAL Configuration for Microsoft 365 / Entra ID
const msalConfig: Configuration = {
  auth: {
    clientId: 'c3321f1a-6c32-4d6e-b3e6-a4de2f7fee4e',
    authority: 'https://login.microsoftonline.com/organizations',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: false,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case 0: // Error
            console.error('[MSAL]', message);
            return;
          case 1: // Warning
            // Silenciar warnings de MSAL en desarrollo
            return;
          case 2: // Info
            console.info('[MSAL]', message);
            return;
          case 3: // Verbose
            console.debug('[MSAL]', message);
            return;
        }
      },
      logLevel: 0, // Error level only
    },
  },
};

// Create MSAL Instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Login request configuration
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'offline_access'],
};

// Microsoft Graph API scopes
export const graphScopes = {
  profile: ['User.Read'],
  mail: ['Mail.Read'],
  calendar: ['Calendars.Read'],
  files: ['Files.Read'],
};