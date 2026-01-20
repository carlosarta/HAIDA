"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, CheckCircle2, XCircle, Ban, Clock, ChevronRight, 
  RotateCcw, AlertOctagon, Camera, Bug, StopCircle, Filter, Calendar 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useData } from "../lib/data-context";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { useLang } from "../lib/i18n-context";
import { format } from "date-fns";

// --- Tipos de Estado ---
type StepStatus = 'pending' | 'passed' | 'failed' | 'blocked';
type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed';

export function Executor() {
  const { projects, suites, cases, addExecution, addDefect, executions } = useData();
  const { t } = useLang();
  
  // Selección
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("all");
  
  // Estado de Ejecución
  const [execStatus, setExecStatus] = useState<ExecutionStatus>('idle');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Modal de Fallo
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failReason, setFailReason] = useState("");

  // --- NUEVO: Tracking de resultados acumulados ---
  const [executionResults, setExecutionResults] = useState<{
    passedCount: number;
    failedCount: number;
    blockedCount: number;
    caseResults: Array<{ caseId: string; status: 'passed' | 'failed' | 'blocked' }>;
  }>({
    passedCount: 0,
    failedCount: 0,
    blockedCount: 0,
    caseResults: []
  });

  const activeProject = projects?.find(p => p.id === selectedProjectId);
  // FIX: Filter suites from flat list instead of assuming nested
  const projectSuites = useMemo(() => {
    return suites?.filter(s => s.project_id === selectedProjectId) || [];
  }, [suites, selectedProjectId]);

  const activeSuite = projectSuites.find(s => s.id === selectedSuiteId);
  
  // FIX: Filter cases for this suite
  const activeCases = useMemo(() => {
    return cases?.filter(c => c.suite_id === selectedSuiteId) || [];
  }, [cases, selectedSuiteId]);

  const currentCase = activeCases[currentCaseIndex];

  // Inicializar pasos al cambiar de caso
  useEffect(() => {
    if (currentCase) {
      setStepStatuses(new Array(currentCase.steps.length).fill('pending'));
    }
  }, [currentCaseIndex, currentCase]);

  // Cronómetro
  useEffect(() => {
    if (execStatus === 'running') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [execStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Lógica de Negocio ---

  const startExecution = () => {
    if (!activeSuite) return;
    if (activeCases.length === 0) {
      toast.error("This suite has no test cases defined.");
      return;
    }
    setExecStatus('running');
    setCurrentCaseIndex(0);
    setTimer(0);
    // --- NUEVO: Resetear resultados acumulados ---
    setExecutionResults({
      passedCount: 0,
      failedCount: 0,
      blockedCount: 0,
      caseResults: []
    });
    toast.info(`Execution started: ${activeSuite.name}`);
  };

  const handleStepAction = (status: StepStatus) => {
    if (execStatus !== 'running') return;

    if (status === 'failed') {
      setIsFailModalOpen(true);
      return; // Esperar a confirmar el fallo
    }

    updateStepAndAdvance(status);
  };

  const confirmFail = () => {
    // Registrar Defecto
    const defectId = `BUG-${Math.floor(Math.random() * 10000)}`;
    addDefect({
      id: defectId,
      title: `Failed step in ${currentCase.title}`,
      description: `Step failed during execution. Reason: ${failReason}`,
      severity: "high",
      status: "open",
      created_at: new Date().toISOString()
    });
    
    toast.error("Defect logged", { description: `Defect ${defectId} created for this failure.` });
    setIsFailModalOpen(false);
    setFailReason("");
    updateStepAndAdvance('failed');
  };

  const updateStepAndAdvance = (status: StepStatus) => {
    // Encontrar primer paso pendiente
    const nextStepIndex = stepStatuses.findIndex(s => s === 'pending');
    if (nextStepIndex === -1) return; // Ya terminó este caso

    const newStatuses = [...stepStatuses];
    newStatuses[nextStepIndex] = status;
    setStepStatuses(newStatuses);

    // Verificar si se completó el CASO actual
    if (nextStepIndex === stepStatuses.length - 1) {
      // --- NUEVO: Calcular el estado del caso basado en todos los pasos ---
      const hasFailed = newStatuses.some(s => s === 'failed');
      const hasBlocked = newStatuses.some(s => s === 'blocked');
      
      let caseStatus: 'passed' | 'failed' | 'blocked' = 'passed';
      if (hasFailed) caseStatus = 'failed';
      else if (hasBlocked) caseStatus = 'blocked';
      
      // Actualizar resultados acumulados
      setExecutionResults(prev => ({
        passedCount: caseStatus === 'passed' ? prev.passedCount + 1 : prev.passedCount,
        failedCount: caseStatus === 'failed' ? prev.failedCount + 1 : prev.failedCount,
        blockedCount: caseStatus === 'blocked' ? prev.blockedCount + 1 : prev.blockedCount,
        caseResults: [...prev.caseResults, { caseId: currentCase.id, status: caseStatus }]
      }));

      setTimeout(() => {
        if (currentCaseIndex < activeCases.length - 1) {
          setCurrentCaseIndex(i => i + 1);
          toast.success("Case completed", { description: `Status: ${caseStatus}. Advancing to next test case...` });
        } else {
          finishExecution();
        }
      }, 500);
    }
  };

  const finishExecution = () => {
    // --- NUEVO: Calcular estado final basado en resultados reales ---
    const finalPassedCount = executionResults.passedCount;
    const finalFailedCount = executionResults.failedCount;
    const finalBlockedCount = executionResults.blockedCount;
    
    // Determinar estado final de la ejecución
    let finalStatus: 'passed' | 'failed' | 'running' | 'queued' | 'skipped' = 'passed';
    if (finalFailedCount > 0) finalStatus = 'failed';
    
    setExecStatus('completed');
    addExecution({
      project_id: selectedProjectId,
      suite_id: selectedSuiteId,
      status: finalStatus,
      passed_count: finalPassedCount, 
      failed_count: finalFailedCount,
      duration_ms: timer * 1000,
      started_at: new Date().toISOString()
    });
    
    toast.success("Suite Execution Completed!", {
      description: `✅ ${finalPassedCount} passed | ❌ ${finalFailedCount} failed | 🚫 ${finalBlockedCount} blocked`
    });
  };

  const currentStepIndex = stepStatuses.findIndex(s => s === 'pending');
  // const progress = ((currentCaseIndex / activeCases.length) * 100) + ((currentStepIndex / (activeCases.length * 10)) * 100); 

  // --- Filtering History ---
  const filteredExecutions = useMemo(() => {
    let filtered = executions;
    if (filterProject !== "all") {
      filtered = filtered.filter(e => e.project_id === filterProject);
    }
    return filtered.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }, [executions, filterProject]);

  if (execStatus === 'idle') {
    return (
      <div className="container mx-auto p-6 max-w-6xl animate-in fade-in duration-300 space-y-8">
        
        {/* Runner Card */}
        <Card className="border-2 border-dashed border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-primary ml-1" />
            </div>
            <CardTitle className="text-3xl font-bold">Manual Test Runner</CardTitle>
            <CardDescription className="text-lg mt-2">Execute your test plans and log results in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-w-xl mx-auto pb-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {(projects || []).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Test Suite</label>
                <Select value={selectedSuiteId} onValueChange={setSelectedSuiteId} disabled={!selectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Suite" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectSuites.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({cases.filter(c => c.suite_id === s.id).length} cases)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button size="lg" className="w-full text-lg h-12 shadow-lg shadow-primary/20" disabled={!selectedSuiteId} onClick={startExecution}>
              Start Execution
            </Button>
          </CardContent>
        </Card>

        {/* Execution History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <RotateCcw className="h-5 w-5 text-muted-foreground" />
               Execution History
             </h2>
             <div className="flex items-center gap-2">
               <Filter className="h-4 w-4 text-muted-foreground" />
               <Select value={filterProject} onValueChange={setFilterProject}>
                 <SelectTrigger className="w-[180px] h-8 text-xs">
                   <SelectValue placeholder="Filter by Project" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Projects</SelectItem>
                   {(projects || []).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                 </SelectContent>
               </Select>
             </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
               <div className="divide-y">
                 {filteredExecutions.length === 0 ? (
                   <div className="p-8 text-center text-muted-foreground">No executions found.</div>
                 ) : (
                   filteredExecutions.map(exec => {
                     const proj = projects.find(p => p.id === exec.project_id);
                     const suite = suites.find(s => s.id === exec.suite_id);
                     
                     return (
                       <div key={exec.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center",
                              exec.status === 'passed' ? "bg-green-100 text-green-600 dark:bg-green-900/20" :
                              exec.status === 'failed' ? "bg-red-100 text-red-600 dark:bg-red-900/20" :
                              "bg-gray-100 text-gray-600"
                            )}>
                               {exec.status === 'passed' ? <CheckCircle2 className="h-5 w-5" /> : 
                                exec.status === 'failed' ? <Bug className="h-5 w-5" /> :
                                <StopCircle className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="font-semibold">{suite?.name || "Unknown Suite"}</div>
                              <div className="text-xs text-muted-foreground flex gap-2">
                                <Badge variant="outline" className="text-[10px] h-4 px-1">{proj?.key || "UNK"}</Badge>
                                <span>{format(new Date(exec.started_at), "PP p")}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                             <div className="text-center">
                               <div className="text-xs text-muted-foreground uppercase">Passed</div>
                               <div className="font-mono font-bold text-green-600">{exec.passed_count}</div>
                             </div>
                             <div className="text-center">
                               <div className="text-xs text-muted-foreground uppercase">Failed</div>
                               <div className="font-mono font-bold text-red-600">{exec.failed_count}</div>
                             </div>
                             <div className="text-center w-16">
                               <div className="text-xs text-muted-foreground uppercase">Duration</div>
                               <div className="font-mono">{formatTime(exec.duration_ms / 1000)}</div>
                             </div>
                             <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                               <ChevronRight className="h-4 w-4" />
                             </Button>
                          </div>
                       </div>
                     );
                   })
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (execStatus === 'completed') {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center h-[80vh] animate-in fade-in">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Execution Complete!</h1>
        <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
          The suite <strong>{activeSuite?.name}</strong> has been executed. Results have been saved to the history.
        </p>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => setExecStatus('idle')}>Back to Runner</Button>
           <Button onClick={() => setExecStatus('idle')}>View Report</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Bar */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-8 px-3 text-sm font-mono bg-muted flex gap-2">
            <Clock className="h-3 w-3" />
            {formatTime(timer)}
          </Badge>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">{activeSuite?.name}</span>
            <span className="text-xs text-muted-foreground">Running {currentCase?.title} ({currentCaseIndex + 1}/{activeCases.length})</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setExecStatus('idle')}>
            <StopCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Step List */}
        <ScrollArea className="flex-1 bg-muted/10 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentCase?.title}</h2>
              <p className="text-muted-foreground">{currentCase?.description}</p>
              <div className="flex gap-2 mt-2">
                 <Badge variant="secondary">{currentCase?.priority}</Badge>
                 <Badge variant="outline" className="font-mono text-xs">{currentCase?.id}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              {currentCase?.steps.map((step: any, index: number) => {
                const status = stepStatuses[index];
                const isActive = index === currentStepIndex;
                
                return (
                  <Card 
                    key={index} 
                    className={cn(
                      "transition-all duration-300 border-l-4",
                      isActive ? "border-l-primary shadow-lg scale-[1.01] bg-card" : 
                      status === 'passed' ? "border-l-green-500 opacity-60" :
                      status === 'failed' ? "border-l-red-500" :
                      "border-l-transparent border-border opacity-50"
                    )}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                          isActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        {status === 'passed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <span className="text-xs font-bold uppercase text-muted-foreground">Action</span>
                          <p className="text-sm">{step.action}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase text-muted-foreground">Expected Result</span>
                          <p className="text-sm">{step.expected}</p>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      {isActive && (
                        <div className="flex flex-col gap-2 justify-center ml-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 w-24 shadow-sm" onClick={() => handleStepAction('passed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Pass
                          </Button>
                          <Button size="sm" variant="destructive" className="w-24 shadow-sm" onClick={() => handleStepAction('failed')}>
                            <Bug className="mr-2 h-4 w-4" /> Fail
                          </Button>
                          <Button size="sm" variant="secondary" className="w-24" onClick={() => handleStepAction('blocked')}>
                            <Ban className="mr-2 h-4 w-4" /> Block
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Modal de Fallo Overlay */}
      {isFailModalOpen && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95">
            <CardHeader className="bg-red-50 dark:bg-red-900/20 pb-4">
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertOctagon className="h-6 w-6" /> Report Defect
              </CardTitle>
              <CardDescription>
                Describe actual result vs expected result.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Result</label>
                <Textarea 
                  placeholder="What actually happened?" 
                  className="min-h-[100px]" 
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" /> Attach Screenshot
                </Button>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setIsFailModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={confirmFail} disabled={!failReason.trim()}>
                  Log Defect & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}