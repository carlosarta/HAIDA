/**
 * Reporter Page - Optimized
 * Configurador y generador de reportes customizables
 */

import { useState, useCallback } from 'react';
import {
  Plus,
  Download,
  Play,
  Save,
  Copy,
  Trash2,
  Settings,
  FileText,
  Sparkles,
  Zap,
  Eye,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { TemplateSelector } from '@/app/components/reporter/TemplateSelector';
import { ReportCustomizer } from '@/app/components/reporter/ReportCustomizer';
import { ReportPreview } from '@/app/components/reporter/ReportPreview';
import { SmartReportGenerator } from '@/app/components/reporter/SmartReportGenerator';
import { DocumentViewer } from '@/app/components/reporter/DocumentViewer';
import { useReporter } from '@/app/hooks/useReporter';
import { EXPORT_FORMATS } from '@/app/constants/reporter.constants';
import type { ClientPreset, ExportFormat } from '@/app/types/reporter.types';
import { cn } from '@/app/components/ui/utils';
import { formatRelativeTime } from '@/app/utils/format.utils';

export function Reporter() {
  const {
    configurations,
    activeConfig,
    reportData,
    isGenerating,
    calculatedMetrics,
    createFromPreset,
    updateConfiguration,
    toggleSection,
    generateReport,
    exportReport,
    deleteConfiguration,
    duplicateConfiguration,
    setActiveConfig,
  } = useReporter();

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(true);

  const handleCreateFromTemplate = useCallback((preset: ClientPreset, name: string) => {
    createFromPreset(preset, name);
    setIsTemplateDialogOpen(false);
  }, [createFromPreset]);

  const handleExport = useCallback((format: ExportFormat) => {
    exportReport(format);
  }, [exportReport]);

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-[calc(100vh-4rem)] flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Report Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Create customizable reports with preset templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
          {activeConfig && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateReport(activeConfig.id)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(Object.keys(EXPORT_FORMATS) as (keyof typeof EXPORT_FORMATS)[]).map((key) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleExport(EXPORT_FORMATS[key])}
                    >
                      Export as {key}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configurations Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configurations</CardTitle>
              <CardDescription>Saved report templates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {configurations.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No configurations yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsTemplateDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Create First Report
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="p-2 space-y-1">
                    {configurations.map((config) => (
                      <div
                        key={config.id}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer group transition-all',
                          'hover:bg-muted/50',
                          activeConfig?.id === config.id && 'bg-primary/10 border-l-2 border-l-primary'
                        )}
                        onClick={() => setActiveConfig(config)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {config.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {config.sections.length} sections
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateConfiguration(config.id);
                                }}
                              >
                                <Copy className="h-3 w-3 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConfiguration(config.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {config.preset && (
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {config.preset}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(config.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {activeConfig && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pass Rate</span>
                  <span className="font-semibold text-green-600">
                    {calculatedMetrics.passRate}%
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Defects</span>
                  <span className="font-semibold">{calculatedMetrics.totalDefects}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Critical</span>
                  <span className="font-semibold text-red-600">
                    {calculatedMetrics.criticalDefects}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Area */}
        <div className="lg:col-span-9 space-y-4">
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder" className="gap-2">
                <FileText className="h-4 w-4" />
                Report Builder
              </TabsTrigger>
              <TabsTrigger value="smart" className="gap-2">
                <Zap className="h-4 w-4" />
                Smart Generator
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <Eye className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Report Builder Tab */}
            <TabsContent value="builder" className="mt-4">
              {!activeConfig ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Report Selected</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create a new report configuration or select an existing one to start customizing your reports
                    </p>
                    <Button onClick={() => setIsTemplateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Report
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Customizer */}
                  {showCustomizer && (
                    <ReportCustomizer
                      config={activeConfig}
                      onUpdate={(updates) => updateConfiguration(activeConfig.id, updates)}
                      onToggleSection={toggleSection}
                    />
                  )}

                  {/* Preview */}
                  <div className={showCustomizer ? '' : 'xl:col-span-2'}>
                    <ReportPreview config={activeConfig} data={reportData} />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Smart Generator Tab */}
            <TabsContent value="smart" className="mt-4">
              <SmartReportGenerator />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <DocumentViewer />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Choose a preset template to start with
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <TemplateSelector onSelect={handleCreateFromTemplate} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}