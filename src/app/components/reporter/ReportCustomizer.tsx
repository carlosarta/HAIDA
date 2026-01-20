/**
 * ReportCustomizer Component
 * Panel de customización de reportes
 */

import { memo } from 'react';
import { 
  Check, 
  Palette, 
  Layout, 
  Settings2,
  FileText,
  BarChart3,
  Target,
  AlertCircle,
  History,
  Users,
  Calendar,
  Lightbulb,
  Paperclip,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';
import { cn } from '@/app/components/ui/utils';
import { SECTION_CONFIG, COLOR_SCHEMES, CHART_TYPES } from '@/app/constants/reporter.constants';
import type { ReportConfiguration, ReportSection } from '@/app/types/reporter.types';

// Map icon names to components
const ICON_MAP: Record<string, any> = {
  FileText,
  BarChart3,
  Target,
  AlertCircle,
  History,
  Users,
  Calendar,
  Lightbulb,
  Paperclip,
};

interface ReportCustomizerProps {
  config: ReportConfiguration;
  onUpdate: (updates: Partial<ReportConfiguration>) => void;
  onToggleSection: (section: ReportSection) => void;
}

export const ReportCustomizer = memo(({ config, onUpdate, onToggleSection }: ReportCustomizerProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Customize Report
        </CardTitle>
        <CardDescription>Configure sections, layout, and branding</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="sections" className="w-full">
          <div className="px-6 pb-3 border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs">Appearance</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
            </TabsList>
          </div>

          {/* Sections Tab */}
          <TabsContent value="sections" className="m-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which sections to include in your report
                </p>
                {(Object.keys(SECTION_CONFIG) as ReportSection[]).map((section) => {
                  const sectionConfig = SECTION_CONFIG[section];
                  const SectionIcon = ICON_MAP[sectionConfig.icon];
                  const isEnabled = config.sections.includes(section);

                  return (
                    <div
                      key={section}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                        isEnabled ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                      )}
                      onClick={() => onToggleSection(section)}
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                        isEnabled ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <SectionIcon className={cn(
                          'h-5 w-5',
                          isEnabled ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium cursor-pointer">
                            {sectionConfig.label}
                          </Label>
                          {sectionConfig.required && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sectionConfig.description}
                        </p>
                      </div>
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0',
                        isEnabled ? 'bg-primary border-primary' : 'border-muted-foreground'
                      )}>
                        {isEnabled && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="m-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-6">
                {/* Color Scheme */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Scheme
                  </Label>
                  <Select
                    value={config.colorScheme}
                    onValueChange={(value) => onUpdate({ colorScheme: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(COLOR_SCHEMES) as (keyof typeof COLOR_SCHEMES)[]).map((scheme) => (
                        <SelectItem key={scheme} value={COLOR_SCHEMES[scheme]}>
                          {scheme.charAt(0) + scheme.slice(1).toLowerCase().replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Branding */}
                <div className="space-y-3">
                  <Label>Branding</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="watermark" className="text-sm font-normal">
                        Include Watermark
                      </Label>
                      <Switch
                        id="watermark"
                        checked={config.branding.includeWatermark}
                        onCheckedChange={(checked) =>
                          onUpdate({
                            branding: { ...config.branding, includeWatermark: checked },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo-position" className="text-sm">Logo Position</Label>
                      <Select
                        value={config.branding.logoPosition}
                        onValueChange={(value) =>
                          onUpdate({
                            branding: { ...config.branding, logoPosition: value as any },
                          })
                        }
                      >
                        <SelectTrigger id="logo-position">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-center">Top Center</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Charts */}
                <div className="space-y-3">
                  <Label>Charts Configuration</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="chart-type" className="text-sm">Default Chart Type</Label>
                      <Select
                        value={config.charts.defaultType}
                        onValueChange={(value) =>
                          onUpdate({
                            charts: { ...config.charts, defaultType: value as any },
                          })
                        }
                      >
                        <SelectTrigger id="chart-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(CHART_TYPES) as (keyof typeof CHART_TYPES)[]).map((type) => (
                            <SelectItem key={type} value={CHART_TYPES[type]}>
                              {type.charAt(0) + type.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-legend" className="text-sm font-normal">
                        Show Legend
                      </Label>
                      <Switch
                        id="show-legend"
                        checked={config.charts.showLegend}
                        onCheckedChange={(checked) =>
                          onUpdate({
                            charts: { ...config.charts, showLegend: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-values" className="text-sm font-normal">
                        Show Values
                      </Label>
                      <Switch
                        id="show-values"
                        checked={config.charts.showValues}
                        onCheckedChange={(checked) =>
                          onUpdate({
                            charts: { ...config.charts, showValues: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animated" className="text-sm font-normal">
                        Animated Charts
                      </Label>
                      <Switch
                        id="animated"
                        checked={config.charts.animated}
                        onCheckedChange={(checked) =>
                          onUpdate({
                            charts: { ...config.charts, animated: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="m-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-6">
                {/* Page Setup */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Page Setup
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="page-size" className="text-sm">Page Size</Label>
                      <Select
                        value={config.layout.pageSize}
                        onValueChange={(value) =>
                          onUpdate({
                            layout: { ...config.layout, pageSize: value as any },
                          })
                        }
                      >
                        <SelectTrigger id="page-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orientation" className="text-sm">Orientation</Label>
                      <Select
                        value={config.layout.orientation}
                        onValueChange={(value) =>
                          onUpdate({
                            layout: { ...config.layout, orientation: value as any },
                          })
                        }
                      >
                        <SelectTrigger id="orientation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Margins */}
                <div className="space-y-3">
                  <Label>Margins (mm)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                      <div key={side} className="space-y-2">
                        <Label htmlFor={`margin-${side}`} className="text-sm capitalize">
                          {side}
                        </Label>
                        <input
                          id={`margin-${side}`}
                          type="number"
                          min="0"
                          max="50"
                          value={config.layout.margins[side]}
                          onChange={(e) =>
                            onUpdate({
                              layout: {
                                ...config.layout,
                                margins: {
                                  ...config.layout.margins,
                                  [side]: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

ReportCustomizer.displayName = 'ReportCustomizer';