/**
 * SmartReportGenerator Component
 * Sistema inteligente de auto-detección y generación de reportes
 */

import { memo, useState, useCallback } from 'react';
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Settings2,
  Zap,
  Database,
  FileCode,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { cn } from '@/app/components/ui/utils';
import { useToast } from '@/app/components/ui/use-toast';

// Tipos de formatos soportados
const SUPPORTED_FORMATS = {
  JSON: { icon: FileJson, color: 'text-blue-500', label: 'JSON' },
  CSV: { icon: FileSpreadsheet, color: 'text-green-500', label: 'CSV' },
  XML: { icon: FileCode, color: 'text-orange-500', label: 'XML' },
  TEXT: { icon: FileText, color: 'text-gray-500', label: 'Text' },
  EXCEL: { icon: FileSpreadsheet, color: 'text-emerald-500', label: 'Excel' },
} as const;

type FormatType = keyof typeof SUPPORTED_FORMATS;

interface DetectionResult {
  format: FormatType;
  confidence: number;
  dataType: 'test-results' | 'defects' | 'metrics' | 'mixed' | 'unknown';
  structure: any;
  recordCount: number;
}

interface GeneratedReport {
  id: string;
  title: string;
  format: string;
  createdAt: Date;
  downloadUrl: string;
}

export const SmartReportGenerator = memo(() => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [inputData, setInputData] = useState<string>('');

  // Auto-detectar formato de datos
  const detectFormat = useCallback((data: string): DetectionResult => {
    let format: FormatType = 'TEXT';
    let confidence = 0;
    let dataType: DetectionResult['dataType'] = 'unknown';
    let structure: any = null;
    let recordCount = 0;

    // Detectar JSON
    try {
      const parsed = JSON.parse(data);
      format = 'JSON';
      confidence = 95;
      structure = parsed;

      // Analizar tipo de datos
      if (Array.isArray(parsed)) {
        recordCount = parsed.length;
        const sample = parsed[0];
        
        if (sample?.status && (sample?.testName || sample?.test)) {
          dataType = 'test-results';
          confidence = 98;
        } else if (sample?.severity && (sample?.description || sample?.issue)) {
          dataType = 'defects';
          confidence = 98;
        } else if (sample?.metric || sample?.value) {
          dataType = 'metrics';
          confidence = 95;
        }
      } else if (parsed?.results || parsed?.tests) {
        dataType = 'test-results';
        recordCount = parsed.results?.length || parsed.tests?.length || 0;
        confidence = 98;
      } else if (parsed?.defects || parsed?.bugs) {
        dataType = 'defects';
        recordCount = parsed.defects?.length || parsed.bugs?.length || 0;
        confidence = 98;
      }

      return { format, confidence, dataType, structure, recordCount };
    } catch (e) {
      // No es JSON válido
    }

    // Detectar CSV
    if (data.includes(',') && data.includes('\n')) {
      const lines = data.trim().split('\n');
      if (lines.length > 1) {
        format = 'CSV';
        confidence = 85;
        recordCount = lines.length - 1; // Excluding header

        const headers = lines[0].toLowerCase();
        if (headers.includes('test') && headers.includes('status')) {
          dataType = 'test-results';
          confidence = 90;
        } else if (headers.includes('severity') || headers.includes('defect')) {
          dataType = 'defects';
          confidence = 90;
        }

        return { format, confidence, dataType, structure: lines, recordCount };
      }
    }

    // Detectar XML
    if (data.trim().startsWith('<') && data.includes('</')) {
      format = 'XML';
      confidence = 85;
      
      if (data.includes('<testcase') || data.includes('<test')) {
        dataType = 'test-results';
        confidence = 90;
      } else if (data.includes('<defect') || data.includes('<bug')) {
        dataType = 'defects';
        confidence = 90;
      }

      // Contar registros
      const matches = data.match(/<(testcase|test|defect|bug|item)/g);
      recordCount = matches?.length || 0;

      return { format, confidence, dataType, structure: data, recordCount };
    }

    // Default: TEXT
    return { 
      format: 'TEXT', 
      confidence: 50, 
      dataType: 'unknown', 
      structure: data,
      recordCount: data.split('\n').length 
    };
  }, []);

  // Manejar archivo cargado
  const handleFileUpload = useCallback(async (file: File) => {
    setIsDetecting(true);
    setDetectionResult(null);
    setGeneratedReport(null);

    try {
      const text = await file.text();
      setInputData(text);

      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = detectFormat(text);
      setDetectionResult(result);

      toast({
        title: "✅ Formato detectado",
        description: `${result.format} con ${result.confidence}% de confianza`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo procesar el archivo",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  }, [detectFormat, toast]);

  // Manejar texto pegado
  const handlePastedData = useCallback((text: string) => {
    setIsDetecting(true);
    setDetectionResult(null);
    setGeneratedReport(null);
    setInputData(text);

    setTimeout(() => {
      const result = detectFormat(text);
      setDetectionResult(result);
      setIsDetecting(false);

      toast({
        title: "✅ Datos analizados",
        description: `Formato ${result.format} detectado`,
      });
    }, 500);
  }, [detectFormat, toast]);

  // Generar reporte automáticamente
  const generateReport = useCallback(async () => {
    if (!detectionResult) return;

    setIsGenerating(true);

    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));

      const report: GeneratedReport = {
        id: `RPT-${Date.now()}`,
        title: `Auto Report - ${detectionResult.dataType}`,
        format: 'PDF',
        createdAt: new Date(),
        downloadUrl: '#',
      };

      setGeneratedReport(report);

      toast({
        title: "🎉 Reporte generado",
        description: "Tu reporte está listo para descargar",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [detectionResult, toast]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const FormatIcon = detectionResult ? SUPPORTED_FORMATS[detectionResult.format].icon : Upload;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Smart Report Generator</CardTitle>
          </div>
          <CardDescription>
            Sube datos o pégalos directamente. La IA detectará el formato y generará el reporte automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              isDetecting && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}>
                {isDetecting ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Soporta: JSON, CSV, XML, Excel, TXT
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".json,.csv,.xml,.xlsx,.xls,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                id="file-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Seleccionar archivo
                </label>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O pega tus datos</span>
            </div>
          </div>

          {/* Paste Area */}
          <textarea
            className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm resize-none"
            placeholder="Pega aquí tus datos en formato JSON, CSV, XML..."
            value={inputData}
            onChange={(e) => handlePastedData(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Detection Result */}
      {detectionResult && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base">Análisis Completado</CardTitle>
              </div>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                {detectionResult.confidence}% confianza
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Formato</p>
                <div className="flex items-center gap-2">
                  <FormatIcon className={cn("h-4 w-4", SUPPORTED_FORMATS[detectionResult.format].color)} />
                  <p className="text-sm font-medium">{detectionResult.format}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo de Datos</p>
                <p className="text-sm font-medium capitalize">{detectionResult.dataType.replace('-', ' ')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Registros</p>
                <p className="text-sm font-medium">{detectionResult.recordCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge variant="default" className="bg-green-500">Listo</Badge>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Reporte Automáticamente
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Report */}
      {generatedReport && (
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">Reporte Generado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{generatedReport.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {generatedReport.createdAt.toLocaleString()}
                  </p>
                </div>
                <Badge>{generatedReport.format}</Badge>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </Button>
            </div>

            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Reporte publicado automáticamente en <strong>Jira</strong> y <strong>Confluence</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

SmartReportGenerator.displayName = 'SmartReportGenerator';
