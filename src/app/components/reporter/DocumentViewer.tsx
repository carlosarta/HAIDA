/**
 * DocumentViewer Component
 * Visor y editor de documentos online con colaboración en tiempo real
 */

import { memo, useState, useCallback } from 'react';
import { 
  FileText, 
  File, 
  Download,
  Edit,
  Eye,
  EyeOff,
  Save,
  X,
  Users,
  Clock,
  Share2,
  History,
  CheckCircle2,
  Loader2,
  FileType,
  FilePlus,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import { useToast } from '@/app/components/ui/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'excel' | 'text';
  size: string;
  lastModified: Date;
  author: string;
  isEditing: boolean;
  syncedTo: string[];
  version: number;
  collaborators: Array<{
    id: string;
    name: string;
    avatar?: string;
    isActive: boolean;
  }>;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Test Report Q1 2024.pdf',
    type: 'pdf',
    size: '2.4 MB',
    lastModified: new Date('2024-01-15'),
    author: 'Carlos Admin',
    isEditing: false,
    syncedTo: ['Confluence', 'SharePoint'],
    version: 3,
    collaborators: [
      { id: '1', name: 'Carlos', isActive: true },
      { id: '2', name: 'Ana', isActive: false },
    ],
  },
  {
    id: '2',
    name: 'Defect Analysis.xlsx',
    type: 'excel',
    size: '856 KB',
    lastModified: new Date('2024-01-18'),
    author: 'Luis QA',
    isEditing: true,
    syncedTo: ['Jira'],
    version: 7,
    collaborators: [
      { id: '3', name: 'Luis', isActive: true },
      { id: '4', name: 'Maria', isActive: true },
    ],
  },
  {
    id: '3',
    name: 'Requirements Document.docx',
    type: 'word',
    size: '1.2 MB',
    lastModified: new Date('2024-01-20'),
    author: 'Ana Manager',
    isEditing: false,
    syncedTo: ['Confluence', 'SharePoint', 'Google Drive'],
    version: 12,
    collaborators: [
      { id: '2', name: 'Ana', isActive: true },
    ],
  },
];

const DOC_TYPE_CONFIG = {
  pdf: { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/20', label: 'PDF' },
  word: { icon: FileType, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/20', label: 'Word' },
  excel: { icon: FileType, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/20', label: 'Excel' },
  text: { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-950/20', label: 'Text' },
};

export const DocumentViewer = memo(() => {
  const { toast } = useToast();
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [content, setContent] = useState('');

  // Abrir documento
  const openDocument = useCallback((doc: Document) => {
    setSelectedDoc(doc);
    setIsEditing(false);
    setContent(`# ${doc.name}\n\nContenido del documento...`);
    
    toast({
      title: "📄 Documento abierto",
      description: `${doc.name} está listo para visualizar`,
    });
  }, [toast]);

  // Activar modo edición
  const startEditing = useCallback(() => {
    setIsEditing(true);
    toast({
      title: "✏️ Modo edición",
      description: "Los cambios se sincronizarán automáticamente",
    });
  }, [toast]);

  // Guardar cambios
  const saveDocument = useCallback(async () => {
    setIsSaving(true);
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setIsEditing(false);
    
    toast({
      title: "✅ Cambios guardados",
      description: `Sincronizado con ${selectedDoc?.syncedTo.join(', ')}`,
    });
  }, [selectedDoc, toast]);

  // Descargar documento
  const downloadDocument = useCallback((doc: Document) => {
    toast({
      title: "⬇️ Descargando",
      description: `${doc.name} (${doc.size})`,
    });
  }, [toast]);

  if (!selectedDoc) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Ver y editar documentos online</CardDescription>
            </div>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {documents.map((doc) => {
                const TypeIcon = DOC_TYPE_CONFIG[doc.type].icon;
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => openDocument(doc)}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center",
                      DOC_TYPE_CONFIG[doc.type].bgColor
                    )}>
                      <TypeIcon className={cn("h-6 w-6", DOC_TYPE_CONFIG[doc.type].color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{doc.name}</p>
                        {doc.isEditing && (
                          <Badge variant="default" className="gap-1">
                            <Edit className="h-3 w-3" />
                            Editando
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>v{doc.version}</span>
                        <span>•</span>
                        <span>{doc.lastModified.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {doc.syncedTo.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {doc.collaborators.map((collab) => (
                          <Avatar key={collab.id} className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className={cn(
                              "text-xs",
                              collab.isActive ? "bg-green-100 text-green-700" : "bg-muted"
                            )}>
                              {collab.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  const TypeIcon = DOC_TYPE_CONFIG[selectedDoc.type].icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDoc(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                DOC_TYPE_CONFIG[selectedDoc.type].bgColor
              )}>
                <TypeIcon className={cn("h-5 w-5", DOC_TYPE_CONFIG[selectedDoc.type].color)} />
              </div>
              <div>
                <p className="font-medium">{selectedDoc.name}</p>
                <p className="text-xs text-muted-foreground">
                  Versión {selectedDoc.version} • {selectedDoc.size}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Collaborators */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {selectedDoc.collaborators.map((collab) => (
                    <Avatar key={collab.id} className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className={cn(
                        "text-xs",
                        collab.isActive ? "bg-green-100 text-green-700" : "bg-muted"
                      )}>
                        {collab.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
              >
                <History className="mr-2 h-4 w-4" />
                Historial
              </Button>

              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveDocument}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(selectedDoc)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                  <Button
                    size="sm"
                    onClick={startEditing}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Editor */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Cambios se guardan automáticamente cada 3 segundos
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[500px] p-4 rounded-md border bg-background font-mono text-sm resize-none"
                  placeholder="Escribe aquí..."
                />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ScrollArea className="h-[500px]">
                  <div className="p-4 whitespace-pre-wrap font-mono text-sm">
                    {content}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sync Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado de Sincronización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedDoc.syncedTo.map((service) => (
                <div key={service} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <span className="text-sm">{service}</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {[
                    { user: 'Carlos', action: 'guardó cambios', time: 'Hace 2 min' },
                    { user: 'Ana', action: 'comentó', time: 'Hace 15 min' },
                    { user: 'Luis', action: 'editó', time: 'Hace 1 hora' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{activity.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

DocumentViewer.displayName = 'DocumentViewer';
