/**
 * HAIDA Documentación Oficial
 * 
 * Estructura basada en las Capas de Documentación del proyecto:
 * - Layer 1 (Master Reference): 00-MASTER-REFERENCE/
 * - Layer 2 (Frontend): 01-FRONTEND/
 * - Layer 3 (Backend): 02-BACKEND/
 * - Layer 4 (Database): 03-DATABASE/
 * - Layer 5 (Integrations): 04-INTEGRATIONS/
 * - Layer 6 (Requirements): 05-REQUIREMENTS/
 * - Layer 7 (Testing): 06-TESTING/
 * - Layer 8 (Postman): 07-POSTMAN/
 * - Layer 9 (Repositories): 08-REPOSITORIES/
 * - Layer 10 (Configuration): 09-CONFIGURATION/
 */

import { useState } from 'react';
import { 
  Book, Sparkles, Settings, Puzzle, Palette, AlertCircle, 
  Code, Zap, FileText, ExternalLink, CheckCircle, Info,
  Rocket, Shield, Database, MessageSquare, Search, ChevronRight,
  FolderOpen, Layers, Layout, Server, Plug, ClipboardList,
  TestTube, Package, GitBranch, Cog, Home, MapPin
} from 'lucide-react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { cn } from '@/app/components/ui/utils';

type DocSection = 
  | 'master-reference'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'integrations'
  | 'requirements'
  | 'testing'
  | 'postman'
  | 'repositories'
  | 'configuration';

interface DocItem {
  id: DocSection;
  folder: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
  content: React.ReactNode;
  files?: string[];
}

// Índice de documentación completo
const DOCUMENTATION_INDEX: DocItem[] = [
  {
    id: 'master-reference',
    folder: '00-MASTER-REFERENCE',
    title: 'Master Reference',
    description: 'Configuración global y fuente única de verdad',
    icon: Database,
    badge: 'START HERE',
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Master Reference</h1>
          <p className="text-muted-foreground">Configuración global y fuente única de verdad</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Hub de Navegación
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-lg font-mono mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Master URLs & Configs
                </div>
                <div className="text-sm text-muted-foreground">
                  Para código, datos técnicos y métricas
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-lg font-mono mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Quick Start (5 min)
                </div>
                <div className="text-sm text-muted-foreground">
                  Para código, datos técnicos y métricas
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'frontend',
    folder: '01-FRONTEND',
    title: 'Frontend',
    description: 'React, TypeScript, Radix UI, Tailwind CSS',
    icon: Code,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Frontend</h1>
          <p className="text-muted-foreground">React, TypeScript, Radix UI, Tailwind CSS</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Arquitectura Frontend
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'backend',
    folder: '02-BACKEND',
    title: 'Backend',
    description: 'API Reference, Servicios, Autenticación',
    icon: Server,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Backend</h1>
          <p className="text-muted-foreground">API Reference, Servicios, Autenticación</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  API Reference
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-lg font-mono mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Autenticación
                </div>
                <div className="text-sm text-muted-foreground">
                  Para código, datos técnicos y métricas
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'database',
    folder: '03-DATABASE',
    title: 'Database',
    description: 'PostgreSQL/Supabase',
    icon: Database,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Database</h1>
          <p className="text-muted-foreground">PostgreSQL/Supabase</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Documentación de Base de Datos
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'integrations',
    folder: '04-INTEGRATIONS',
    title: 'Integraciones',
    description: 'Postman, Jira, Confluence, Telegram, Microsoft 365',
    icon: Puzzle,
    badge: 'Importante',
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Integraciones</h1>
          <p className="text-muted-foreground">Postman, Jira, Confluence, Telegram, Microsoft 365</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Microsoft 365
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-lg font-mono mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Postman API
                </div>
                <div className="text-sm text-muted-foreground">
                  Para código, datos técnicos y métricas
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-lg font-mono mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Estado de Integraciones
                </div>
                <div className="text-sm text-muted-foreground">
                  Para código, datos técnicos y métricas
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'requirements',
    folder: '05-REQUIREMENTS',
    title: 'Requirements',
    description: 'BRDs/Especificaciones',
    icon: ClipboardList,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Requirements</h1>
          <p className="text-muted-foreground">BRDs/Especificaciones</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Documentación de Requisitos
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'testing',
    folder: '06-TESTING',
    title: 'Testing & QA',
    description: 'Estrategia de Testing, ISTQB, Automatización',
    icon: CheckCircle,
    badge: 'QA',
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Testing & QA</h1>
          <p className="text-muted-foreground">Estrategia de Testing, ISTQB, Automatización</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Data-Driven Testing
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'postman',
    folder: '07-POSTMAN',
    title: 'Postman',
    description: 'Colecciones/Newman',
    icon: TestTube,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Postman</h1>
          <p className="text-muted-foreground">Colecciones/Newman</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Documentación de Postman
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'repositories',
    folder: '08-REPOSITORIES',
    title: 'Repositories',
    description: 'CI/CD/GitHub Actions',
    icon: GitBranch,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Repositories</h1>
          <p className="text-muted-foreground">CI/CD/GitHub Actions</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Documentación de Repositorios
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'configuration',
    folder: '09-CONFIGURATION',
    title: 'Configuration',
    description: 'Deployment, Docker, Variables de Entorno',
    icon: Settings,
    content: (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configuration</h1>
          <p className="text-muted-foreground">Deployment, Docker, Variables de Entorno</p>
        </div>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Documentos Principales</h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Quick Start Backend
                </div>
                <div className="text-sm text-muted-foreground">
                  Para títulos y elementos destacados
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Paleta de Colores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="h-20 bg-[#1a1a1a] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Ink</div>
                <div className="text-xs text-muted-foreground font-mono">#1a1a1a</div>
              </div>
              <div>
                <div className="h-20 bg-[#f5f5f0] rounded-lg mb-2 border border-border"></div>
                <div className="text-sm font-medium">Sand</div>
                <div className="text-xs text-muted-foreground font-mono">#f5f5f0</div>
              </div>
              <div>
                <div className="h-20 bg-[#ff6b35] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Signal Orange</div>
                <div className="text-xs text-muted-foreground font-mono">#ff6b35</div>
              </div>
              <div>
                <div className="h-20 bg-[#00a896] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Teal</div>
                <div className="text-xs text-muted-foreground font-mono">#00a896</div>
              </div>
              <div>
                <div className="h-20 bg-[#64748b] rounded-lg mb-2"></div>
                <div className="text-sm font-medium">Slate</div>
                <div className="text-xs text-muted-foreground font-mono">#64748b</div>
              </div>
              <div>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-2"></div>
                <div className="text-sm font-medium">AI Gradient</div>
                <div className="text-xs text-muted-foreground">Purple → Pink</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Componentes de UI</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Radix UI para componentes base (Dialog, Dropdown, etc.)</p>
              <p>• Tailwind CSS v4 para estilos</p>
              <p>• Lucide React para iconografía</p>
              <p>• Motion/React para animaciones suaves</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function HaidaDocs() {
  const [activeSection, setActiveSection] = useState<DocSection>('master-reference');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDocPath, setActiveDocPath] = useState<string | null>(null);

  const sections = DOCUMENTATION_INDEX.sort((a, b) => a.folder.localeCompare(b.folder));
  const activeItem = sections.find(s => s.id === activeSection);

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Book className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">HAIDA Docs</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sections
              .filter(section => 
                searchQuery === '' || 
                section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                section.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-1",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{section.title}</span>
                  {section.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </button>
              ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <Info className="h-3 w-3" />
              <span>Versión: 1.0.0</span>
            </div>
            <div>Última actualización: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Document List (when section has multiple documents) */}
        {activeItem && activeItem.files && activeItem.files.length > 0 && (
          <div className="w-72 border-r border-border bg-muted/10 flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm mb-1">{activeItem.title}</h3>
              <p className="text-xs text-muted-foreground">{activeItem.description}</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {activeItem.files.map(doc => (
                  <button
                    key={doc}
                    className={cn(
                      "w-full flex items-start gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      activeDocPath === doc
                        ? "bg-background border border-border shadow-sm"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{doc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Markdown Content Viewer */}
        <div className="flex-1 bg-background flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-8 max-w-4xl mx-auto">
              {activeItem && activeItem.content ? (
                <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                  {activeItem.content}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecciona un documento</h3>
                  <p className="text-sm text-muted-foreground">
                    Elige un documento del menú izquierdo para comenzar
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}