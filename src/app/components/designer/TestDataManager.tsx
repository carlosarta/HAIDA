/**
 * Gestor de Datos de Prueba
 * Gestiona variables de datos necesarias para la ejecución de test cases
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Database,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  Bell,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

export interface TestDataVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'email' | 'url' | 'password' | 'json';
  required: boolean;
  defaultValue?: string;
  description?: string;
  detectedByAI?: boolean;
  needsClientInput?: boolean;
}

interface TestDataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variables: TestDataVariable[]) => void;
  detectedVariables?: TestDataVariable[];
  projectName?: string;
}

export function TestDataManager({
  isOpen,
  onClose,
  onSave,
  detectedVariables = [],
  projectName = 'Proyecto',
}: TestDataManagerProps) {
  const [variables, setVariables] = useState<TestDataVariable[]>(detectedVariables);
  const [notificacionesDatosFaltantes, setNotificacionesDatosFaltantes] = useState<TestDataVariable[]>([]);

  // Agregar nueva variable
  const agregarVariable = useCallback(() => {
    const nuevaVariable: TestDataVariable = {
      id: `var_${Date.now()}`,
      name: 'NUEVA_VARIABLE',
      type: 'string',
      required: false,
      defaultValue: '',
      description: '',
      detectedByAI: false,
      needsClientInput: false,
    };
    setVariables(prev => [...prev, nuevaVariable]);
  }, []);

  // Eliminar variable
  const eliminarVariable = useCallback((id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
  }, []);

  // Actualizar variable
  const actualizarVariable = useCallback((id: string, updates: Partial<TestDataVariable>) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  // Detectar datos faltantes
  const detectarDatosFaltantes = useCallback(() => {
    const faltantes = variables.filter(v => v.required && !v.defaultValue);
    setNotificacionesDatosFaltantes(faltantes);
    
    if (faltantes.length > 0) {
      toast.error(`⚠️ ${faltantes.length} datos requeridos sin valor`, {
        description: 'Debes solicitarlos al cliente o configurarlos manualmente',
      });
    } else {
      toast.success('✅ Todos los datos requeridos están configurados');
    }
  }, [variables]);

  // Exportar a Postman
  const exportarAPostman = useCallback(() => {
    const variablesPostman = variables.map(v => ({
      key: v.name,
      value: v.defaultValue || '',
      type: v.type === 'password' ? 'secret' : 'default',
      enabled: true,
    }));

    const blob = new Blob([JSON.stringify(variablesPostman, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_postman_variables.json`;
    a.click();
    
    toast.success('📥 Variables exportadas para Postman');
  }, [variables, projectName]);

  // Guardar y cerrar
  const manejarGuardado = useCallback(() => {
    // Detectar faltantes antes de guardar
    const faltantes = variables.filter(v => v.required && !v.defaultValue);
    
    if (faltantes.length > 0) {
      // Marcar como "necesita input del cliente"
      faltantes.forEach(v => {
        actualizarVariable(v.id, { needsClientInput: true });
      });
      
      setNotificacionesDatosFaltantes(faltantes);
      return; // No cerrar hasta que se completen
    }

    onSave(variables);
    onClose();
    
    toast.success('💾 Datos de prueba guardados', {
      description: `${variables.length} variables configuradas`,
    });
  }, [variables, onSave, onClose, actualizarVariable]);

  const conteoDetectadosIA = variables.filter(v => v.detectedByAI).length;
  const conteoRequeridos = variables.filter(v => v.required).length;
  const conteoFaltantes = variables.filter(v => v.required && !v.defaultValue).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Gestor de Datos de Prueba - {projectName}
          </DialogTitle>
          <DialogDescription>
            Configura las variables de datos necesarias para ejecutar los casos de prueba
          </DialogDescription>
        </DialogHeader>

        {/* Estadísticas - COMPACTAS */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded border bg-card">
            <div className="text-xl font-bold">{variables.length}</div>
            <div className="text-[10px] text-muted-foreground">Total Variables</div>
          </div>
          <div className="p-2 rounded border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="text-xl font-bold text-blue-600">{conteoDetectadosIA}</div>
            <div className="text-[10px] text-blue-600">Detectadas por IA</div>
          </div>
          <div className="p-2 rounded border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <div className="text-xl font-bold text-orange-600">{conteoRequeridos}</div>
            <div className="text-[10px] text-orange-600">Requeridas</div>
          </div>
          <div className="p-2 rounded border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <div className="text-xl font-bold text-red-600">{conteoFaltantes}</div>
            <div className="text-[10px] text-red-600">Sin Valor</div>
          </div>
        </div>

        {/* Notificaciones de datos faltantes */}
        {notificacionesDatosFaltantes.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Solicita al cliente los siguientes datos:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {notificacionesDatosFaltantes.map(v => (
                  <li key={v.id} className="text-sm">
                    <strong>{v.name}</strong> ({v.type}) - {v.description}
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 gap-2"
                onClick={() => {
                  const texto = notificacionesDatosFaltantes
                    .map(v => `${v.name} (${v.type}): ${v.description}`)
                    .join('\n');
                  navigator.clipboard.writeText(texto);
                  toast.success('📋 Lista copiada al portapapeles');
                }}
              >
                <Copy className="h-3 w-3" />
                Copiar lista para enviar al cliente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Variables - COMPACTA */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {variables.map((variable) => (
              <div
                key={variable.id}
                className={cn(
                  "p-3 rounded border transition-all",
                  variable.detectedByAI && "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                  variable.needsClientInput && "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-12 gap-2">
                    {/* Nombre */}
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px]">Nombre Variable</Label>
                      <Input
                        value={variable.name}
                        onChange={(e) => actualizarVariable(variable.id, { name: e.target.value.toUpperCase() })}
                        className="h-7 font-mono text-xs"
                        placeholder="NOMBRE_VAR"
                      />
                    </div>

                    {/* Tipo */}
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px]">Tipo</Label>
                      <Select
                        value={variable.type}
                        onValueChange={(value: any) => actualizarVariable(variable.id, { type: value })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="password">Password</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Valor */}
                    <div className="col-span-4 space-y-1">
                      <Label className="text-[10px]">Valor por Defecto</Label>
                      {variable.type === 'json' ? (
                        <Textarea
                          value={variable.defaultValue || ''}
                          onChange={(e) => actualizarVariable(variable.id, { defaultValue: e.target.value })}
                          className="h-7 text-xs resize-none"
                          placeholder="{}"
                        />
                      ) : (
                        <Input
                          type={variable.type === 'password' ? 'password' : 'text'}
                          value={variable.defaultValue || ''}
                          onChange={(e) => actualizarVariable(variable.id, { defaultValue: e.target.value })}
                          className="h-7 text-xs"
                          placeholder={`Ingresar ${variable.type}...`}
                        />
                      )}
                    </div>

                    {/* Descripción */}
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px]">Descripción</Label>
                      <Input
                        value={variable.description || ''}
                        onChange={(e) => actualizarVariable(variable.id, { description: e.target.value })}
                        className="h-7 text-xs"
                        placeholder="Propósito..."
                      />
                    </div>
                  </div>

                  {/* Badges y Acciones */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      {variable.detectedByAI && (
                        <Badge variant="outline" className="gap-1 text-[10px] h-5 px-1.5">
                          <Sparkles className="h-2.5 w-2.5" />
                          IA
                        </Badge>
                      )}
                      {variable.required && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                          Requerido
                        </Badge>
                      )}
                      {variable.needsClientInput && (
                        <Badge variant="outline" className="gap-1 text-[10px] h-5 px-1.5 border-red-500 text-red-600">
                          <Bell className="h-2.5 w-2.5" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => actualizarVariable(variable.id, { required: !variable.required })}
                      >
                        {variable.required ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => eliminarVariable(variable.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Botón Agregar */}
            <Button
              variant="outline"
              className="w-full border-dashed gap-2 h-8"
              onClick={agregarVariable}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar Variable
            </Button>
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportarAPostman} className="gap-2">
              <Download className="h-3 w-3" />
              Exportar Postman
            </Button>
            <Button variant="outline" size="sm" onClick={detectarDatosFaltantes} className="gap-2">
              <AlertCircle className="h-3 w-3" />
              Verificar Faltantes
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={manejarGuardado} className="gap-2">
              <Database className="h-4 w-4" />
              Guardar Datos
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
