"use client";

import Highlighter from 'react-highlight-words';
import { escapeRegExp } from '@/lib/security-utils';
import { useState, useMemo, useRef } from "react";
import { 
  Search, Plus, Folder, FileText, ChevronRight, MoreHorizontal, 
  Save, Play, Layers, Tag, CheckSquare, List, LayoutGrid, Upload, Sparkles, Settings, X, File, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useData } from "../lib/data-context";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { IntegracionesDisenador } from "../components/integrations/IntegracionesDisenador";
import { GestorDocumentos } from "../components/documents/GestorDocumentos";
import { type DocumentoSincronizado, crearCasoPruebaConSync } from "../services/sync-service";
import { ESPACIOS_CONFLUENCE } from "../services/confluence-api";
import { PROYECTOS_JIRA } from "../services/jira-api";
import { generateAIPrompt, detectRequiredTestData, type TestDataVariable as AITestDataVariable } from "@/app/lib/ai-prompt-generator";
import { TestDataManager, type TestDataVariable } from "@/app/components/designer/TestDataManager";

// --- Tipos Locales para la UI ---
type ViewMode = "list" | "grid";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

export function Designer() {
  const { projects, suites, cases, updateTestCase } = useData();
  
  // Estado de Selección y UI
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects?.[0]?.id || "");
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isEditing, setIsEditing] = useState(false);

  // --- AI / Upload State ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Nuevo estado para AI Generator ---
  const [aiGeneratorTab, setAiGeneratorTab] = useState<'confluence' | 'upload'>('confluence');
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [publishToJira, setPublishToJira] = useState(true);
  const [jiraIssueType, setJiraIssueType] = useState('Test');
  const [targetProject, setTargetProject] = useState(selectedProjectId || 'p1');

  // --- 🎯 Generation Settings State ---
  const [testingStandard, setTestingStandard] = useState<'ISTQB' | 'ISO' | 'Agile'>(() => {
    const saved = localStorage.getItem('haida_testing_standard');
    return (saved as any) || 'ISTQB';
  });
  const [outputFormat, setOutputFormat] = useState<'Gherkin' | 'Standard'>(() => {
    const saved = localStorage.getItem('haida_output_format');
    return (saved as any) || 'Gherkin';
  });
  const [coverageDepth, setCoverageDepth] = useState<number>(() => {
    const saved = localStorage.getItem('haida_coverage_depth');
    return saved ? parseInt(saved) : 50;
  });
  const [isConfirmSettingsOpen, setIsConfirmSettingsOpen] = useState(false);

  // --- 🎯 Test Data Manager State ---
  const [isTestDataModalOpen, setIsTestDataModalOpen] = useState(false);
  const [testDataVariables, setTestDataVariables] = useState<TestDataVariable[]>([]);
  const [detectedVariables, setDetectedVariables] = useState<TestDataVariable[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  // --- LÓGICA "FINDER" (Deep Search) ---
  const filteredData = useMemo(() => {
    if (!projects || projects.length === 0) return { suites: [], cases: [] };

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return { suites: [], cases: [] };

    // Filter suites for this project
    const projectSuites = suites.filter(s => s.project_id === project.id);

    // Si no hay búsqueda, mostramos jerarquía normal
    if (!searchQuery.trim()) {
      const activeSuiteCases = selectedSuiteId 
        ? cases.filter(c => c.suite_id === selectedSuiteId)
        : [];
      return {
        suites: projectSuites,
        cases: activeSuiteCases
      };
    }

    // Búsqueda Profunda (Deep Search)
    const lowerQuery = searchQuery.toLowerCase();
    
    // Buscar casos que coincidan en Título, Descripción, o Contenido de Pasos
    const matchingCases: any[] = [];
    
    // Filter cases belonging to this project
    const projectCases = cases.filter(c => c.project_id === project.id);

    projectCases.forEach(testCase => {
      const titleMatch = testCase.title.toLowerCase().includes(lowerQuery);
      const descMatch = testCase.description?.toLowerCase().includes(lowerQuery);
      // Buscar DENTRO del "Documento" (Pasos)
      const stepMatch = testCase.steps?.some((step: any) => 
        step.action.toLowerCase().includes(lowerQuery) || 
        step.expected.toLowerCase().includes(lowerQuery)
      );

      if (titleMatch || descMatch || stepMatch) {
        const suite = projectSuites.find(s => s.id === testCase.suite_id);
        matchingCases.push({
          ...testCase,
          _suiteName: suite?.name // Meta-data para mostrar contexto
        });
      }
    });

    return {
      suites: projectSuites, // Mantenemos suites visibles
      cases: matchingCases,
      isSearchMode: true
    };

  }, [projects, suites, cases, selectedProjectId, selectedSuiteId, searchQuery]);

  const activeProject = projects?.find(p => p.id === selectedProjectId);
  const activeCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find(c => c.id === selectedCaseId);
  }, [selectedCaseId, cases]);

  // Manejador de Guardado Simulado
  const handleSaveCase = () => {
    setIsEditing(false);
    toast.success("Test case saved successfully", {
      description: "All changes have been synced to the database."
    });
  };

  // --- File Upload Logic ---
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadFile[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startUploadProcess = () => {
    if (files.length === 0) return;

    // Simulate upload for pending files
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
        if (files.some(f => f.status === 'success')) {
            startAnalysis();
        }
        return;
    }

    pendingFiles.forEach(file => {
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f));
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate random error for demonstration (e.g., if file name contains "error")
          const hasError = file.name.toLowerCase().includes("error");
          
          setFiles(prev => prev.map(f => f.id === file.id ? { 
            ...f, 
            status: hasError ? 'error' : 'success', 
            progress: 100,
            errorMessage: hasError ? "Invalid file format or corrupted data." : undefined
          } : f));

          // Check if all done
          // This is a simplified check inside the interval, effectively works per file
        } else {
           setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress } : f));
        }
      }, 300);
    });
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simular extracción de contenido de documentos
    setTimeout(() => {
      // 1. EXTRAER CONTENIDO DE DOCUMENTOS
      const documentContent = aiGeneratorTab === 'confluence'
        ? selectedDocs.map(doc => `${doc.titulo}\n${doc.contenido || 'Contenido de ejemplo'}`).join('\n\n')
        : files.map(f => `Archivo: ${f.name}\nContenido simulado del documento para análisis de IA...`).join('\n\n');

      // 2. DETECTAR DATOS DE PRUEBA NECESARIOS
      const detected = detectRequiredTestData(documentContent);
      setDetectedVariables(detected);

      // 3. GENERAR PROMPT DE IA CON CONFIGURACIONES
      const aiPrompt = generateAIPrompt(
        {
          testingStandard,
          outputFormat,
          coverageDepth
        },
        documentContent,
        testDataVariables.length > 0 ? testDataVariables : detected
      );

      setGeneratedPrompt(aiPrompt);

      // 4. MOSTRAR PROMPT EN CONSOLA (Para debugging/integración con IA real)
      console.log('🤖 ============ AI PROMPT GENERADO ============');
      console.log(aiPrompt);
      console.log('🤖 ============================================');

      setIsAnalyzing(false);

      // 5. VERIFICAR SI HAY DATOS FALTANTES
      const missingData = detected.filter(d => d.required && !testDataVariables.find(v => v.name === d.name));
      
      if (missingData.length > 0) {
        // Abrir Test Data Manager automáticamente
        toast.warning(`⚠️ ${missingData.length} datos requeridos detectados`, {
          description: 'Configúralos antes de generar los casos de prueba',
          duration: 5000,
        });
        
        setIsUploadModalOpen(false);
        setIsTestDataModalOpen(true);
      } else {
        // 6. GENERAR CASOS (simulado - aquí iría la llamada real al AI)
        const successCount = aiGeneratorTab === 'upload'
          ? files.filter(f => f.status === 'success').length
          : selectedDocs.length;

        if (successCount > 0) {
          toast.success("🎉 Casos de Prueba Generados", {
            description: `Estándar ${testingStandard} | Formato ${outputFormat} | Cobertura ${coverageDepth}%. Revisa la consola (F12) para ver el prompt.`,
            duration: 6000,
          });
          
          // Mostrar toast adicional con el prompt
          setTimeout(() => {
            toast.info('🤖 Prompt Generado para IA', {
              description: 'Abre la consola (F12) para copiar el prompt y enviarlo a ChatGPT/Copilot',
              action: {
                label: 'Ver Consola',
                onClick: () => console.log(aiPrompt)
              }
            });
          }, 1000);

          setIsUploadModalOpen(false);
          setFiles([]);
          setSelectedDocs([]);
        } else {
          toast.error("Error en Generación", { description: "No hay documentos válidos para procesar" });
        }
      }
    }, 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden bg-background/50 backdrop-blur-sm">
      
      {/* 1. SIDEBAR (Navegación de Proyecto/Suites) - Estilo Finder Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/40 bg-muted/10 flex flex-col h-full glass">
        <div className="p-4 border-b border-border/40 space-y-3">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-semibold shadow-sm">
                <span className="truncate">{activeProject?.name || "Select Project"}</span>
                <ChevronRight className="h-4 w-4 rotate-90 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {projects?.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => {
                  setSelectedProjectId(p.id);
                  setSelectedSuiteId(null);
                  setSelectedCaseId(null);
                }}>
                  <Folder className="mr-2 h-4 w-4 text-blue-500" />
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-blue-500/20 transition-all"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Generator
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className="px-2 space-y-0.5">
            <Button
              variant={selectedSuiteId === null && !searchQuery ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-medium"
              onClick={() => { setSelectedSuiteId(null); setSearchQuery(""); }}
            >
              <Layers className="mr-2 h-4 w-4 text-primary" />
              All Suites
            </Button>
            
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-1 flex justify-between items-center">
              <span>Test Suites</span>
              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            
            {filteredData.suites.map(suite => {
              // Calculate real-time case count for suite
              const suiteCaseCount = cases.filter(c => c.suite_id === suite.id).length;
              
              return (
                <Button
                  key={suite.id}
                  variant={selectedSuiteId === suite.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm group transition-all",
                    selectedSuiteId === suite.id ? "bg-white dark:bg-slate-800 shadow-sm" : ""
                  )}
                  onClick={() => { 
                    setSelectedSuiteId(suite.id); 
                    setSearchQuery(""); // Limpiar búsqueda al navegar
                    setSelectedCaseId(null);
                  }}
                >
                  <Folder className={cn(
                    "mr-2 h-4 w-4 transition-colors",
                    selectedSuiteId === suite.id ? "text-blue-500 fill-blue-500/20" : "text-muted-foreground"
                  )} />
                  <span className="truncate">{suite.name}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {suiteCaseCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t border-border/40">
           <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
             <Plus className="mr-2 h-4 w-4" /> New Manual Suite
           </Button>
        </div>
      </aside>

      {/* 2. MIDDLE LIST (Lista de Casos con Búsqueda) - Estilo Finder List */}
      <section className="flex-1 md:max-w-md border-r border-border/40 flex flex-col bg-background/30 h-full">
        {/* Search Bar "Spotlight" Style */}
        <div className="p-3 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="relative group">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input 
              placeholder="Search inside cases..." 
              className="pl-9 bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-xl shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute right-2 top-2.5 text-[10px] text-muted-foreground bg-muted px-1.5 rounded">
                Deep Search
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
             <span className="text-xs text-muted-foreground font-medium">
               {filteredData.cases.length} Items {filteredData.isSearchMode ? "Found" : ""}
             </span>
             <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewMode("list")}>
                 <List className={cn("h-3.5 w-3.5", viewMode === "list" ? "text-primary" : "text-muted-foreground")} />
               </Button>
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewMode("grid")}>
                 <LayoutGrid className={cn("h-3.5 w-3.5", viewMode === "grid" ? "text-primary" : "text-muted-foreground")} />
               </Button>
             </div>
          </div>
        </div>

        {/* Case List */}
        <ScrollArea className="flex-1">
          <div className={cn("p-3 gap-2", viewMode === "grid" ? "grid grid-cols-2" : "flex flex-col")}>
            <AnimatePresence>
            {filteredData.cases.map((testCase: any) => (
              <motion.div
                key={testCase.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  onClick={() => setSelectedCaseId(testCase.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border transition-all duration-200 group relative overflow-hidden",
                    viewMode === "list" ? "p-3 flex flex-col gap-1" : "p-4 aspect-square flex flex-col justify-between",
                    selectedCaseId === testCase.id 
                      ? "bg-primary/5 border-primary/50 shadow-sm ring-1 ring-primary/20" 
                      : "bg-card hover:bg-muted/50 border-transparent hover:border-border/60"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <FileText className={cn("h-4 w-4", selectedCaseId === testCase.id ? "text-primary" : "text-muted-foreground")} />
                       <span className="font-semibold text-sm line-clamp-1">{testCase.title}</span>
                    </div>
                    {filteredData.isSearchMode && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1">{testCase._suiteName}</Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {testCase.description || "No description provided."}
                  </div>

                  {/* Highlights for search hits in steps */}
                  {filteredData.isSearchMode && searchQuery && (
                     <div className="mt-2 text-[10px] bg-yellow-500/10 text-yellow-600 p-1.5 rounded border border-yellow-500/20">
                        <span className="font-bold">Match found in content</span>
                     </div>
                  )}
                  
                  {viewMode === "list" && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-4">{testCase.id}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">{testCase.priority}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            
            {filteredData.cases.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                 <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                 <p className="text-sm">No test cases found</p>
                 {searchQuery && <p className="text-xs opacity-50">Try a different keyword</p>}
               </div>
            )}
          </div>
        </ScrollArea>
      </section>

      {/* 3. RIGHT PANE (Editor/Detail) - Document Style */}
      <main className="flex-[2] bg-background flex flex-col h-full overflow-hidden relative">
        {/* Barra superior con integraciones - Siempre visible */}
        <div className="h-auto border-b border-border/40 bg-background/50 backdrop-blur-md">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Integraciones</span>
              </div>
              <IntegracionesDisenador proyectoActual={activeProject} />
            </div>
          </div>
        </div>

        {activeCase ? (
          <>
            {/* Toolbar */}
            <div className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">{activeProject?.key}-{activeCase.id}</span>
                 <ChevronRight className="h-3 w-3" />
                 <span className="text-foreground font-medium truncate max-w-[200px]">{activeCase.title}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                 </Button>
                 {isEditing && (
                    <Button size="sm" onClick={handleSaveCase} className="gap-2">
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                 )}
                 <Separator orientation="vertical" className="h-6" />
                 <Button variant="outline" size="sm" className="gap-2">
                    <Play className="h-3.5 w-3.5" /> Run
                 </Button>
              </div>
            </div>

            {/* Content Editor */}
            <ScrollArea className="flex-1 p-8 max-w-4xl mx-auto w-full">
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header Info */}
                <div className="space-y-4">
                  {isEditing ? (
                    <Input 
                      className="text-3xl font-bold border-none px-0 shadow-none focus-visible:ring-0 h-auto rounded-none border-b border-transparent focus:border-border transition-colors placeholder:text-muted-foreground/40" 
                      defaultValue={activeCase.title} 
                      placeholder="Test Case Title"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold tracking-tight">{activeCase.title}</h1>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-md px-2 py-1"><Tag className="h-3 w-3 mr-1" /> Functional</Badge>
                    <Badge variant="outline" className="rounded-md px-2 py-1"><AlertTriangle className="h-3 w-3 mr-1" /> {activeCase.priority}</Badge>
                    <Badge variant="secondary" className="rounded-md px-2 py-1 bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900">Automated</Badge>
                  </div>

                  {isEditing ? (
                    <Textarea 
                      className="resize-none border-muted bg-muted/20" 
                      placeholder="Description and preconditions..." 
                      defaultValue={activeCase.description} 
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {activeCase.description || "No description provided. Click edit to add details about preconditions, test data, or objectives."}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Steps "Table" */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" /> Test Steps
                  </h3>
                  
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[40px_1fr_1fr] bg-muted/50 border-b text-xs font-medium text-muted-foreground p-3">
                      <div className="text-center">#</div>
                      <div>Action</div>
                      <div>Expected Result</div>
                    </div>
                    
                    <div className="bg-card divide-y">
                      {activeCase.steps?.map((step: any, index: number) => (
                        <div key={index} className="grid grid-cols-[40px_1fr_1fr] p-3 text-sm hover:bg-muted/20 transition-colors group">
                           <div className="text-center text-muted-foreground font-mono pt-1">{index + 1}</div>
                           <div className="pr-4">
                             {isEditing ? (
                               <Input defaultValue={step.action} className="h-8" />
                             ) : (
                               <Highlighter
                                 searchWords={searchQuery ? [searchQuery] : []}
                                 autoEscape={true}
                                 textToHighlight={step.action}
                                 highlightClassName="bg-yellow-200 dark:bg-yellow-900 rounded-sm px-0.5"
                               />
                             )}
                           </div>
                           <div>
                              {isEditing ? (
                               <Input defaultValue={step.expected} className="h-8" />
                             ) : (
                               <div className="text-muted-foreground">
                                 <Highlighter
                                   searchWords={searchQuery ? [searchQuery] : []}
                                   autoEscape={true}
                                   textToHighlight={step.expected}
                                   highlightClassName="bg-yellow-200 dark:bg-yellow-900 rounded-sm px-0.5"
                                 />
                               </div>
                             )}
                           </div>
                        </div>
                      ))}
                      
                      {isEditing && (
                        <Button variant="ghost" className="w-full rounded-none h-10 text-muted-foreground hover:text-primary border-t border-dashed">
                           <Plus className="h-4 w-4 mr-2" /> Add Step
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 bg-muted/5">
             <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6 animate-pulse">
               <FileText className="h-10 w-10" />
             </div>
             <h2 className="text-xl font-semibold mb-2">No Test Case Selected</h2>
             <p className="max-w-xs text-center text-sm">Select a file from the list or create a new one to start designing your test.</p>
          </div>
        )}
      </main>

      {/* AI Generator / Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Test Generator con Sincronización Jira/Confluence
            </DialogTitle>
            <DialogDescription>
              Selecciona documentación de Confluence o sube archivos. El AI generará casos ISTQB y los publicará automáticamente en Jira.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Selector de Proyecto Target */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Proyecto Destino</Label>
                <Select value={targetProject} onValueChange={setTargetProject}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.key} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tipo de Issue (Jira)</Label>
                <Select value={jiraIssueType} onValueChange={setJiraIssueType}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkbox Publicar en Jira */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Checkbox 
                id="publishJira" 
                checked={publishToJira} 
                onCheckedChange={(checked) => setPublishToJira(checked as boolean)}
              />
              <Label 
                htmlFor="publishJira" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                📤 Publicar automáticamente casos generados en Jira como "{jiraIssueType}"
              </Label>
            </div>

            {/* Tabs: Confluence vs Upload */}
            <Tabs value={aiGeneratorTab} onValueChange={(v) => setAiGeneratorTab(v as 'confluence' | 'upload')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="confluence" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Documentación Confluence
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Subir Archivos
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Documentos de Confluence */}
              <TabsContent value="confluence" className="mt-4">
                <div className="p-4 border rounded-lg bg-card">
                  {activeProject && (
                    <GestorDocumentos
                      proyectoId={targetProject}
                      proyectoKey={
                        targetProject === 'p1' ? 'PRIVALIA' : 
                        targetProject === 'p2' ? 'CTB' : 
                        'HAIDA'
                      }
                      onDocumentosSeleccionados={setSelectedDocs}
                    />
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Upload Manual */}
              <TabsContent value="upload" className="mt-4 space-y-4">
                {/* Drop Zone */}
                <div 
                  className={cn(
                    "p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer bg-muted/10 relative",
                    isAnalyzing && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                   <input 
                     type="file" 
                     multiple 
                     className="hidden" 
                     ref={fileInputRef} 
                     onChange={handleFileSelect}
                     accept=".pdf,.docx,.txt,.md"
                   />
                   <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                     <Upload className="h-5 w-5 text-primary" />
                   </div>
                   <div className="text-center">
                     <p className="text-sm font-semibold text-foreground">Click para seleccionar archivos</p>
                     <p className="text-xs text-muted-foreground">o arrastra y suelta aquí (PDF, DOCX, TXT, MD)</p>
                   </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-2 bg-card border rounded-lg group animate-in slide-in-from-top-2">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <File className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-sm font-medium truncate">{file.name}</span>
                             <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                          
                          {file.status !== 'pending' && file.status !== 'error' && (
                            <Progress value={file.progress} className="h-1.5" />
                          )}
                          
                          {file.status === 'error' && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {file.errorMessage || "Upload failed"}
                            </span>
                          )}
                        </div>

                        <div className="shrink-0">
                          {file.status === 'pending' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600" onClick={() => removeFile(file.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {file.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          {file.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          {file.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Analyzing State */}
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                 <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                 <span className="text-sm font-medium text-primary">
                   AI analizando documentos y generando casos de prueba ISTQB...
                 </span>
              </div>
            )}

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <span className="text-base">💡</span>
                <span>
                  <strong>Prioridad de fuentes:</strong> El AI buscará primero en documentación de Confluence sincronizada,
                  luego en archivos subidos manualmente. Los casos generados se publicarán automáticamente como "{jiraIssueType}" en Jira si la opción está activada.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="outline" onClick={() => { 
               setIsUploadModalOpen(false); 
               setFiles([]); 
               setSelectedDocs([]);
             }}>
               Cancelar
             </Button>
             <Button 
               disabled={
                 isAnalyzing || 
                 (aiGeneratorTab === 'upload' && files.length === 0) ||
                 (aiGeneratorTab === 'confluence' && selectedDocs.length === 0)
               } 
               onClick={aiGeneratorTab === 'upload' ? startUploadProcess : startAnalysis}
               className="min-w-[180px] gap-2"
             >
               {isAnalyzing ? (
                 <>
                   <Loader2 className="h-4 w-4 animate-spin" />
                   Generando...
                 </>
               ) : (
                 <>
                   <Sparkles className="h-4 w-4" />
                   Generar Casos de Prueba
                 </>
               )}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de Generación</DialogTitle>
            <DialogDescription>Configura cómo la IA genera tus casos de prueba</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Estándar de Testing</Label>
               <div className="flex gap-2">
                  <Badge 
                    className="cursor-pointer transition-all"
                    onClick={() => setTestingStandard('ISTQB')}
                    variant={testingStandard === 'ISTQB' ? 'default' : 'outline'}
                  >
                    ISTQB Foundation
                  </Badge>
                  <Badge 
                    className="cursor-pointer transition-all"
                    onClick={() => setTestingStandard('ISO')}
                    variant={testingStandard === 'ISO' ? 'default' : 'outline'}
                  >
                    ISO/IEC 29119
                  </Badge>
                  <Badge 
                    className="cursor-pointer transition-all"
                    onClick={() => setTestingStandard('Agile')}
                    variant={testingStandard === 'Agile' ? 'default' : 'outline'}
                  >
                    Agile
                  </Badge>
               </div>
             </div>
             <div className="space-y-2">
               <Label>Formato de Salida</Label>
               <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={cn(
                      "border rounded p-3 text-sm cursor-pointer hover:border-primary transition-all",
                      outputFormat === 'Gherkin' ? 'border-primary bg-primary/5 shadow-sm' : ''
                    )}
                    onClick={() => setOutputFormat('Gherkin')}
                  >
                    <div className="font-bold">Gherkin (BDD)</div>
                    <div className="text-xs text-muted-foreground">Given/When/Then</div>
                  </div>
                  <div 
                    className={cn(
                      "border rounded p-3 text-sm cursor-pointer hover:border-primary transition-all",
                      outputFormat === 'Standard' ? 'border-primary bg-primary/5 shadow-sm' : ''
                    )}
                    onClick={() => setOutputFormat('Standard')}
                  >
                    <div className="font-bold">Estándar</div>
                    <div className="text-xs text-muted-foreground">Acción/Resultado</div>
                  </div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <Label>Profundidad de Cobertura</Label>
                 <Badge variant="outline" className="text-xs">
                   {coverageDepth <= 33 ? 'Baja' : coverageDepth <= 66 ? 'Normal' : 'Exhaustiva'}
                 </Badge>
               </div>
               <Input 
                 type="range" 
                 className="w-full"
                 min="0"
                 max="100"
                 value={coverageDepth}
                 onChange={(e) => setCoverageDepth(parseInt(e.target.value))}
               />
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Baja (0%)</span>
                 <span className="font-semibold text-foreground">{coverageDepth}%</span>
                 <span>Exhaustiva (100%)</span>
               </div>
             </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setIsSettingsModalOpen(false);
                setIsConfirmSettingsOpen(true);
              }}
            >
              Guardar Preferencias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal - Muestra impacto de configuraciones */}
      <Dialog open={isConfirmSettingsOpen} onOpenChange={setIsConfirmSettingsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Configuración Guardada Exitosamente
            </DialogTitle>
            <DialogDescription>
              Estas configuraciones afectarán cómo el AI genera tus test cases
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Testing Standard Impact */}
            <div className="p-3 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Estándar de Testing
                </h4>
                <Badge variant="default">{testingStandard}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {testingStandard === 'ISTQB' && (
                    <>
                      ✅ <strong>ISTQB Foundation:</strong> Casos con terminología ISTQB oficial
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                        <li>Precondiciones explícitas</li>
                        <li>Pasos de prueba detallados</li>
                        <li>Postcondiciones y cleanup</li>
                      </ul>
                    </>
                  )}
                  {testingStandard === 'ISO' && (
                    <>
                      ✅ <strong>ISO/IEC 29119:</strong> Estructura formal con trazabilidad completa
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                        <li>IDs de trazabilidad a requisitos</li>
                        <li>Matrices de cobertura</li>
                        <li>Documentación formal</li>
                      </ul>
                    </>
                  )}
                  {testingStandard === 'Agile' && (
                    <>
                      ✅ <strong>Agile:</strong> User stories en formato ágil
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                        <li>Como [rol], quiero [acción], para [beneficio]</li>
                        <li>Criterios de aceptación claros</li>
                        <li>Escenarios BDD integrados</li>
                      </ul>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Output Format Impact */}
            <div className="p-3 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Formato de Salida
                </h4>
                <Badge variant="default">{outputFormat}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {outputFormat === 'Gherkin' && (
                    <>
                      ✅ <strong>Gherkin (BDD):</strong> Sintaxis Given/When/Then
                      <div className="mt-1 p-2 bg-muted/50 rounded font-mono text-[10px]">
                        <div className="text-green-600">Given</div> el usuario está en login
                        <div className="text-blue-600">When</div> ingresa credenciales
                        <div className="text-purple-600">Then</div> ve el dashboard
                      </div>
                    </>
                  )}
                  {outputFormat === 'Standard' && (
                    <>
                      ✅ <strong>Estándar:</strong> Formato Acción / Resultado
                      <div className="mt-1 p-2 bg-muted/50 rounded text-[10px]">
                        <div><strong>Acción:</strong> Navegar a login → <strong>Resultado:</strong> Formulario visible</div>
                        <div><strong>Acción:</strong> Ingresar datos → <strong>Resultado:</strong> Dashboard</div>
                      </div>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Coverage Depth Impact */}
            <div className="p-3 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Profundidad de Cobertura
                </h4>
                <Badge variant="default">
                  {coverageDepth <= 33 ? 'Baja' : coverageDepth <= 66 ? 'Normal' : 'Exhaustiva'} ({coverageDepth}%)
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {coverageDepth <= 33 && (
                    <>
                      ✅ <strong>Baja (0-33%):</strong> Solo happy paths básicos
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                        <li>Flujos principales exitosos (3-5 casos)</li>
                        <li>Casos de uso más comunes</li>
                      </ul>
                    </>
                  )}
                  {coverageDepth > 33 && coverageDepth <= 66 && (
                    <>
                      ✅ <strong>Normal (34-66%):</strong> Happy paths + casos negativos
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                        <li>Flujos principales + alternativos (8-12 casos)</li>
                        <li>Validaciones y errores comunes</li>
                      </ul>
                    </>
                  )}
                  {coverageDepth > 66 && (
                    <>
                      ✅ <strong>Exhaustiva (67-100%):</strong> Cobertura completa
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                        <li>Todos los edge cases (20+ casos)</li>
                        <li>Boundary testing y seguridad</li>
                      </ul>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                    Configuración Aplicada al Generador de IA
                  </p>
                  <ul className="text-[11px] text-blue-700 dark:text-blue-400 space-y-0.5 mt-1">
                    <li>📋 Estándar: <strong>{testingStandard}</strong></li>
                    <li>📝 Formato: <strong>{outputFormat}</strong></li>
                    <li>🎯 Cobertura: <strong>{coverageDepth <= 33 ? 'Baja' : coverageDepth <= 66 ? 'Normal' : 'Exhaustiva'}</strong> ({coverageDepth}%)</li>
                  </ul>
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-1">
                    Configuración guardada en tu navegador
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                // Guardar definitivamente en localStorage
                localStorage.setItem('haida_testing_standard', testingStandard);
                localStorage.setItem('haida_output_format', outputFormat);
                localStorage.setItem('haida_coverage_depth', coverageDepth.toString());
                
                setIsConfirmSettingsOpen(false);
                
                toast.success('⚙️ Configuración guardada', {
                  description: `Estándar: ${testingStandard} | Formato: ${outputFormat} | Cobertura: ${coverageDepth}%`,
                });
              }}
              className="min-w-[120px]"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Data Manager Modal */}
      <TestDataManager
        isOpen={isTestDataModalOpen}
        onClose={() => setIsTestDataModalOpen(false)}
        onSave={(variables) => {
          setTestDataVariables(variables);
          setIsTestDataModalOpen(false);
          toast.success('💾 Datos de Prueba Guardados', {
            description: `${variables.length} variables configuradas exitosamente`,
          });
          
          // Reabrir AI Generator para continuar
          setIsUploadModalOpen(true);
        }}
        detectedVariables={detectedVariables}
        projectName={activeProject?.name || 'Proyecto'}
      />
    </div>
  );
}

// Icono faltante
function AlertTriangle({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}