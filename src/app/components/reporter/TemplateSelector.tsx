/**
 * TemplateSelector Component
 * Selector de plantillas y presets de reportes
 */

import { memo, useState } from 'react';
import {
  Building2,
  Rocket,
  Briefcase,
  Shield,
  Heart,
  TrendingUp,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { cn } from '@/app/components/ui/utils';
import { PRESET_CONFIGS, CLIENT_PRESETS } from '@/app/constants/reporter.constants';
import type { ClientPreset } from '@/app/types/reporter.types';

interface TemplateSelectorProps {
  onSelect: (preset: ClientPreset, name: string) => void;
}

const PRESET_ICONS = {
  [CLIENT_PRESETS.ENTERPRISE]: Building2,
  [CLIENT_PRESETS.STARTUP]: Rocket,
  [CLIENT_PRESETS.AGENCY]: Briefcase,
  [CLIENT_PRESETS.GOVERNMENT]: Shield,
  [CLIENT_PRESETS.HEALTHCARE]: Heart,
  [CLIENT_PRESETS.FINTECH]: TrendingUp,
};

export const TemplateSelector = memo(({ onSelect }: TemplateSelectorProps) => {
  const [selectedPreset, setSelectedPreset] = useState<ClientPreset | null>(null);
  const [reportName, setReportName] = useState('');

  const handleSelect = (preset: ClientPreset) => {
    setSelectedPreset(preset);
    setReportName(`${PRESET_CONFIGS[preset].name} Report`);
  };

  const handleCreate = () => {
    if (!selectedPreset || !reportName.trim()) return;
    onSelect(selectedPreset, reportName);
  };

  return (
    <div className="space-y-6">
      {/* Template Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(PRESET_CONFIGS) as ClientPreset[]).map((preset) => {
            const config = PRESET_CONFIGS[preset];
            const Icon = PRESET_ICONS[preset];
            const isSelected = selectedPreset === preset;

            return (
              <Card
                key={preset}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg',
                  isSelected && 'ring-2 ring-primary shadow-lg'
                )}
                onClick={() => handleSelect(preset)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{config.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">
                        {config.defaultSections.length} sections
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {config.colorScheme}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration Form */}
      {selectedPreset && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="text-base">Report Configuration</CardTitle>
            <CardDescription>
              Configure your report based on {PRESET_CONFIGS[selectedPreset].name} template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPreset(null);
                  setReportName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!reportName.trim()}
              >
                Create Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

TemplateSelector.displayName = 'TemplateSelector';
