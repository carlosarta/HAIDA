import { useState } from "react"
import { Button } from "../components/ui/button"
import { GlassCard } from "../components/ui/glass-card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Separator } from "../components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { toast } from "sonner"
import { useUi } from "../lib/ui-context"
import { useMsal } from "@azure/msal-react"
import { loginRequest, isRunningInIframe } from "@/auth/msal-config"
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authAPI, saveAuthToken, regenerateCSRFToken } from "@/services/api"
import { RateLimiter } from "@/lib/security-utils"

// 🔒 Detectar entorno de producción
const IS_PRODUCTION = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production';

// Rate limiter para login: 5 intentos por minuto
const loginRateLimiter = new RateLimiter(5, 60000);

// Schema de validación para el formulario de login
const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

// Schema de validación para recuperación de contraseña
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido" }),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function Login({ onLogin }: { onLogin: () => void }) {
  const { config } = useUi();
  const { login: loginConfig } = config;
  const { instance, accounts, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const isInIframe = isRunningInIframe();

  // Form para login manual
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  // Form para recuperación de contraseña
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgot,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // If already authenticated with Microsoft, proceed to dashboard
  const isAuthenticated = accounts.length > 0;
  if (isAuthenticated && inProgress === 'none') {
    setTimeout(() => onLogin(), 0);
  }

  // Manejador de login manual con email/password
  const handleManualLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");

      // ✅ Verificar rate limiting
      if (loginRateLimiter.isRateLimited(data.email)) {
        setError("Demasiados intentos de inicio de sesión. Por favor, espera un minuto.");
        toast.error("Límite de intentos excedido", {
          description: "Por favor, espera un minuto antes de intentar nuevamente."
        });
        setIsLoading(false);
        return;
      }

      // Registrar intento
      loginRateLimiter.recordAttempt(data.email);

      // Llamada real al backend con TODOS los datos del formulario
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe, // ✅ El checkbox se envía al backend
      });

      // ✅ Login exitoso: resetear rate limiter y regenerar CSRF token
      loginRateLimiter.reset(data.email);
      regenerateCSRFToken();

      // Guardar token de autenticación
      saveAuthToken(response.token, data.rememberMe || false);

      toast.success("¡Bienvenido!", {
        description: `Has iniciado sesión como ${response.user.name || response.user.email}`
      });
      
      setTimeout(() => onLogin(), 500);
    } catch (error: any) {
      console.error('Manual login error:', error);
      
      // No mostrar error de backend no disponible si el mock está funcionando
      setError(error?.message || "Error al iniciar sesión. Intenta nuevamente.");
      toast.error("Error de autenticación", {
        description: error?.message || "Verifica tus credenciales e intenta nuevamente"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador de recuperación de contraseña
  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      setIsSendingResetEmail(true);

      // Llamada real al backend para recuperación de contraseña
      const response = await authAPI.forgotPassword({
        email: data.email,
      });

      toast.success("Email enviado", {
        description: `Se ha enviado un link de recuperación a ${data.email}`
      });
      
      setShowForgotPasswordDialog(false);
      resetForgot();
    } catch (error: any) {
      toast.error("Error", {
        description: error?.message || "No se pudo enviar el email de recuperación"
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (isInIframe) {
        // Use popup flow when in iframe (e.g., Figma Make preview)
        try {
          await instance.loginPopup(loginRequest);
          setIsLoading(false);
          toast.success("¡Autenticación exitosa!", {
            description: "Redirigiendo al dashboard..."
          });
        } catch (popupError: any) {
          console.error('Popup login failed:', popupError);
          setIsLoading(false);
          throw new Error('Por favor, permite popups en tu navegador o abre la aplicación en una nueva pestaña.');
        }
      } else {
        // Use redirect flow when not in iframe (normal browser window)
        toast.success("¡Redirigiendo!", {
          description: "Te estamos llevando a Microsoft para iniciar sesión."
        });
        await instance.loginRedirect(loginRequest);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error?.message || "No se pudo completar la autenticación. Intenta nuevamente.");
      toast.error("Error al iniciar sesión", {
        description: "Por favor intenta nuevamente o contacta a soporte."
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      
      {/* Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <GlassCard className="w-full max-w-md p-8 space-y-6 bg-white/60 dark:bg-slate-900/80 backdrop-blur-3xl border-white/20 shadow-2xl animate-in zoom-in-95 duration-500">
          
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              HAIDA
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Sistema Integral de Automatización de Diseño
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Banner de errores dinámicos del backend */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Formulario de Login Manual */}
            <form onSubmit={handleSubmit(handleManualLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={loginConfig.emailPlaceholder}
                    className="pl-10 h-11"
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={loginConfig.passwordPlaceholder}
                    className="pl-10 pr-10 h-11"
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    {loginConfig.rememberMeText}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-medium text-sm h-auto"
                  onClick={() => setShowForgotPasswordDialog(true)}
                >
                  {loginConfig.forgotPasswordText}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  loginConfig.signInButtonText
                )}
              </Button>
            </form>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                  O continuar con
                </span>
              </div>
            </div>

            {/* Botón de Microsoft SSO */}
            <Button
              onClick={handleMicrosoftLogin}
              disabled={isLoading || inProgress !== 'none'}
              variant="outline"
              className="w-full h-11 text-base font-medium border-2"
              size="lg"
            >
              {(isLoading || inProgress !== 'none') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23" fill="currentColor">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  {loginConfig.microsoftButtonText}
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 space-y-2 text-center border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seguro con Microsoft Entra ID y OAuth 2.0
            </p>
            {/* 🔒 Usuarios de Prueba - Solo en desarrollo */}
            {!IS_PRODUCTION && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-400 mb-2">Usuarios de Prueba:</p>
                <div className="space-y-1 text-xs font-mono text-blue-800 dark:text-blue-300">
                  <p>👑 carlos.admin@haida.com / admin123</p>
                  <p>👔 ana.manager@haida.com / manager123</p>
                  <p>🔧 luis.qa@haida.com / qa123</p>
                  <p>🧪 maria.tester@haida.com / tester123</p>
                </div>
              </div>
            )}
          </div>

        </GlassCard>
      </div>

      {/* Dialog de Recuperación de Contraseña */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForgot(handleForgotPassword)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="tu@email.com"
                  disabled={isSendingResetEmail}
                  {...registerForgot("email")}
                />
                {errorsForgot.email && (
                  <p className="text-xs text-red-500">{errorsForgot.email.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPasswordDialog(false);
                  resetForgot();
                }}
                disabled={isSendingResetEmail}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSendingResetEmail}>
                {isSendingResetEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Footer */}
      {loginConfig.showFooter && (
        <footer className="relative z-10 w-full bg-white/80 dark:bg-slate-900/90 border-t border-border/20 py-8 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-xs text-muted-foreground border-t border-border/20 pt-8">
              <p>{loginConfig.footerText}</p>
              <ul className="flex flex-wrap justify-center gap-6">
                <li><a href="https://www.hiberus.com/aviso-legal" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">Aviso Legal</a></li>
                <li><a href="https://www.hiberus.com/politica-privacidad" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">Política de Privacidad</a></li>
                <li><a href="https://www.hiberus.com/cookies" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">Política de Cookies</a></li>
              </ul>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}