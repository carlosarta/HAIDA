"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, UserPlus, CheckSquare, Book, FileText, X, Folder, ChevronRight, Hash, Image, Link as LinkIcon, List as ListIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Textarea } from "../components/ui/textarea";
import { useData } from "../lib/data-context";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { HaidaDocs } from "../components/documentation/HaidaDocs";
import { KanbanColumn } from "../components/projects/KanbanColumn";
import { WikiRenderer } from "../components/projects/WikiRenderer";
import { useProjects } from "../hooks/useProjects";
import type { ProjectTab, TaskStatus, WikiPage } from "../types/project.types";
import { PROJECT_TABS, TASK_STATUS } from "../constants/project.constants";

export function Projects() {
  const { projects } = useData();
  
  // -- UI STATE --
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [activeTab, setActiveTab] = useState<ProjectTab>(PROJECT_TABS.BOARD);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showWikiSidebar, setShowWikiSidebar] = useState(false);

  // -- WIKI STATE --
  const [selectedWikiId, setSelectedWikiId] = useState<string | null>(null);
  const [isEditingWiki, setIsEditingWiki] = useState(false);
  const [wikiContent, setWikiContent] = useState("");

  // -- CUSTOM HOOK --
  const {
    tasks,
    wikiPages,
    taskStats,
    createTask,
    moveTask,
    createWikiPage,
    updateWikiPage,
  } = useProjects(selectedProjectId);

  // -- COMPUTED VALUES --
  const activeProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const activePage = useMemo(
    () => wikiPages.find(p => p.id === selectedWikiId) || wikiPages[0],
    [wikiPages, selectedWikiId]
  );

  // -- HANDLERS --
  const handleOpenTeam = useCallback((projectId: string) => {
    toast.info("Connecting to Team Channel...", {
      description: "Redirecting to Microsoft Teams / Slack...",
      action: {
        label: "Open",
        onClick: () => window.open("https://teams.microsoft.com", "_blank")
      }
    });
  }, []);

  const handleSaveWiki = useCallback(() => {
    if (!selectedWikiId) return;
    updateWikiPage(selectedWikiId, { content: wikiContent });
    setIsEditingWiki(false);
  }, [selectedWikiId, wikiContent, updateWikiPage]);

  const handleCreateWikiPage = useCallback(() => {
    const newPage = createWikiPage();
    if (newPage) {
      setSelectedWikiId(newPage.id);
      setWikiContent(newPage.content);
      setIsEditingWiki(true);
    }
  }, [createWikiPage]);

  const handleSelectWikiPage = useCallback((page: WikiPage) => {
    setSelectedWikiId(page.id);
    setWikiContent(page.content);
    setIsEditingWiki(false);
    setShowWikiSidebar(false);
  }, []);

  const handleCreateTaskWrapper = useCallback((title: string) => {
    createTask(title, TASK_STATUS.TODO);
  }, [createTask]);

  // -- RENDERERS --
  const renderWiki = () => {
    return (
      <div className="flex flex-col lg:flex-row flex-1 h-full border rounded-xl overflow-hidden bg-background">
        {/* Wiki Sidebar - Mobile Toggle + Desktop Always Visible */}
        <div className={cn(
          "lg:w-64 lg:border-r bg-muted/10 flex flex-col",
          "absolute lg:relative z-20 lg:z-auto inset-y-0 left-0",
          "w-64 border-r shadow-lg lg:shadow-none",
          "transition-transform duration-300",
          showWikiSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-background lg:bg-transparent">
            <span className="font-semibold text-sm">Documentation</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateWikiPage}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 lg:hidden" 
                onClick={() => setShowWikiSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {wikiPages.length === 0 && (
                <p className="text-xs text-muted-foreground p-2 text-center">No pages yet.</p>
              )}
              {wikiPages.map(page => (
                <Button
                  key={page.id}
                  variant={activePage?.id === page.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm h-9"
                  onClick={() => handleSelectWikiPage(page)}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{page.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Overlay for mobile sidebar */}
        {showWikiSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setShowWikiSidebar(false)}
          />
        )}

        {/* Wiki Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {activePage ? (
            <>
              <div className="h-12 sm:h-14 border-b flex items-center justify-between px-3 sm:px-6 bg-background/50 gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8 shrink-0"
                    onClick={() => setShowWikiSidebar(true)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Folder className="h-4 w-4 hidden sm:block shrink-0" />
                  <span className="hidden sm:inline">Wiki</span>
                  <ChevronRight className="h-3 w-3 hidden sm:block shrink-0" />
                  <span className="text-foreground font-medium truncate">{activePage.title}</span>
                </div>
                <Button 
                  variant={isEditingWiki ? "default" : "outline"} 
                  size="sm"
                  className="shrink-0 text-xs sm:text-sm h-8"
                  onClick={() => {
                    if(isEditingWiki) handleSaveWiki();
                    else {
                      setWikiContent(activePage.content);
                      setIsEditingWiki(true);
                    }
                  }}
                >
                  {isEditingWiki ? "Save" : "Edit"}
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
                {isEditingWiki ? (
                  <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
                    <Input 
                      value={activePage.title} 
                      onChange={(e) => updateWikiPage(activePage.id, { title: e.target.value })}
                      className="text-xl sm:text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0"
                    />
                    <div className="flex gap-1.5 sm:gap-2 border-b pb-2 overflow-x-auto">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Hash className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ListIcon className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><LinkIcon className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Image className="h-4 w-4" /></Button>
                    </div>
                    <Textarea 
                      value={wikiContent}
                      onChange={(e) => setWikiContent(e.target.value)}
                      className="flex-1 resize-none font-mono text-xs sm:text-sm bg-muted/20 border-none focus-visible:ring-0 p-3 sm:p-4"
                    />
                  </div>
                ) : (
                  <WikiRenderer content={activePage.content} />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
              Select a page to view documentation.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Project Selection */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 border-b border-border/40 pb-3 sm:pb-4 shrink-0">
        <div className="w-full md:w-auto">
           <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
             <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Project Hub</h1>
             {activeProject && (
               <Badge variant="outline" className="text-sm sm:text-lg font-normal px-2 sm:px-3 py-0.5 sm:py-1 bg-background/50 backdrop-blur-sm">
                 {activeProject.key}
               </Badge>
             )}
           </div>
           <p className="text-sm sm:text-base text-muted-foreground">Manage tasks, documentation, and team collaboration.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
           {projects.map(p => (
             <Button
               key={p.id}
               variant={selectedProjectId === p.id ? "default" : "outline"}
               className={cn(
                 "whitespace-nowrap rounded-full transition-all text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4",
                 selectedProjectId === p.id ? "shadow-md shadow-primary/20" : "opacity-70 hover:opacity-100"
               )}
               onClick={() => setSelectedProjectId(p.id)}
             >
               {p.name}
             </Button>
           ))}
           <Button variant="ghost" size="icon" className="rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground h-8 w-8 sm:h-9 sm:w-9 shrink-0" onClick={() => setIsCreateOpen(true)}>
             <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
           </Button>
        </div>
      </div>

      {/* Action Bar & View Switcher */}
      {selectedProjectId && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
           <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto scrollbar-hide">
               <Button 
                   variant={activeTab === PROJECT_TABS.BOARD ? 'secondary' : 'ghost'} 
                   size="sm" 
                   className="h-7 text-[10px] sm:text-xs flex-1 sm:flex-none whitespace-nowrap"
                   onClick={() => setActiveTab(PROJECT_TABS.BOARD)}
               >
                   <CheckSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-2" /> <span className="hidden sm:inline">Board</span>
               </Button>
               <Button 
                   variant={activeTab === PROJECT_TABS.WIKI ? 'secondary' : 'ghost'} 
                   size="sm" 
                   className="h-7 text-[10px] sm:text-xs flex-1 sm:flex-none whitespace-nowrap"
                   onClick={() => setActiveTab(PROJECT_TABS.WIKI)}
               >
                   <Book className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-2" /> <span className="hidden sm:inline">Wiki</span>
               </Button>
               <Button 
                   variant={activeTab === PROJECT_TABS.HAIDA_DOCS ? 'secondary' : 'ghost'} 
                   size="sm" 
                   className="h-7 text-[10px] sm:text-xs flex-1 sm:flex-none whitespace-nowrap"
                   onClick={() => setActiveTab(PROJECT_TABS.HAIDA_DOCS)}
               >
                   <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-2" /> <span className="hidden sm:inline">Docs</span>
               </Button>
           </div>
           
           <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                <div className="flex items-center -space-x-2 mr-2">
                    <Avatar className="border-2 border-background w-7 h-7 sm:w-8 sm:h-8">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] sm:text-[10px] text-muted-foreground font-medium">
                        +3
                    </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs gap-1.5 sm:gap-2" onClick={() => handleOpenTeam(selectedProjectId!)}>
                    <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Team</span>
                </Button>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === PROJECT_TABS.BOARD ? (
          <div className="flex gap-3 sm:gap-4 h-full overflow-x-auto pb-2">
            <div className="flex gap-3 sm:gap-4 min-w-max md:min-w-0 w-full h-full">
              <KanbanColumn
                status={TASK_STATUS.TODO}
                tasks={tasks.filter(t => t.status === TASK_STATUS.TODO)}
                onCreateTask={handleCreateTaskWrapper}
                onMoveTask={moveTask}
              />
              <KanbanColumn
                status={TASK_STATUS.IN_PROGRESS}
                tasks={tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS)}
                onCreateTask={(title) => createTask(title, TASK_STATUS.IN_PROGRESS)}
                onMoveTask={moveTask}
              />
              <KanbanColumn
                status={TASK_STATUS.DONE}
                tasks={tasks.filter(t => t.status === TASK_STATUS.DONE)}
                onCreateTask={(title) => createTask(title, TASK_STATUS.DONE)}
                onMoveTask={moveTask}
              />
            </div>
          </div>
        ) : activeTab === PROJECT_TABS.HAIDA_DOCS ? (
          <HaidaDocs />
        ) : (
          renderWiki()
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Start a new project workspace.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
               <Label>Project Name</Label>
               <Input placeholder="e.g. Website Revamp" />
             </div>
          </div>
          <DialogFooter>
             <Button onClick={() => setIsCreateOpen(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}