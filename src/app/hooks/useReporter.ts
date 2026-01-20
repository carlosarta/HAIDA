/**
 * useReporter Hook
 * Hook optimizado para gestión de reportes
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type {
  ReportConfiguration,
  ReportData,
  ClientPreset,
  ReportSection,
  ExportFormat,
} from '@/app/types/reporter.types';
import {
  REPORT_TYPES,
  PRESET_CONFIGS,
  REPORT_SECTIONS,
  COLOR_SCHEMES,
} from '@/app/constants/reporter.constants';

// Mock data generator
const generateMockReportData = (): ReportData => ({
  summary: {
    totalTests: 450,
    passed: 387,
    failed: 42,
    blocked: 15,
    skipped: 6,
    passRate: 86,
    executionTime: 3600000, // 1 hour in ms
  },
  metrics: {
    coverage: 82,
    velocity: 95,
    defectDensity: 2.3,
    automationRate: 78,
    avgExecutionTime: 8000,
  },
  defects: [
    {
      id: 'def-001',
      title: 'Login button not responding',
      severity: 'critical',
      status: 'in_progress',
      assignee: 'Carlos Martinez',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'def-002',
      title: 'UI alignment issue on mobile',
      severity: 'medium',
      status: 'open',
      createdAt: new Date(Date.now() - 172800000),
    },
  ],
  executionHistory: Array.from({ length: 7 }, (_, i) => ({
    id: `exec-${i}`,
    date: new Date(Date.now() - i * 86400000),
    passed: Math.floor(Math.random() * 100) + 300,
    failed: Math.floor(Math.random() * 50),
    total: 450,
    duration: Math.floor(Math.random() * 3600000) + 1800000,
  })),
  teamPerformance: [
    {
      memberId: 'u1',
      memberName: 'Carlos Martinez',
      testsExecuted: 125,
      defectsFound: 12,
      avgResolutionTime: 4.2,
      contribution: 28,
    },
    {
      memberId: 'u2',
      memberName: 'Ana Rodriguez',
      testsExecuted: 98,
      defectsFound: 8,
      avgResolutionTime: 3.8,
      contribution: 22,
    },
  ],
  timeline: [
    {
      id: 't1',
      date: new Date(Date.now() - 604800000),
      type: 'sprint',
      title: 'Sprint 12 Started',
      description: 'Focus on authentication module',
    },
    {
      id: 't2',
      date: new Date(Date.now() - 259200000),
      type: 'milestone',
      title: 'Test Coverage Milestone',
      description: 'Reached 80% coverage',
    },
  ],
  recommendations: [
    'Increase test automation coverage to 85%',
    'Focus on critical defects resolution',
    'Implement regression test suite',
    'Add performance testing for API endpoints',
  ],
});

export function useReporter() {
  const [configurations, setConfigurations] = useState<ReportConfiguration[]>([]);
  const [activeConfig, setActiveConfig] = useState<ReportConfiguration | null>(null);
  const [reportData, setReportData] = useState<ReportData>(generateMockReportData());
  const [isGenerating, setIsGenerating] = useState(false);

  // Create configuration from preset
  const createFromPreset = useCallback((preset: ClientPreset, name: string) => {
    const presetConfig = PRESET_CONFIGS[preset];
    
    const newConfig: ReportConfiguration = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: REPORT_TYPES.CUSTOM,
      preset,
      sections: [...presetConfig.defaultSections],
      colorScheme: presetConfig.colorScheme,
      branding: {
        logoPosition: presetConfig.logoPosition,
        companyName: 'HAIDA QA Platform',
        includeWatermark: presetConfig.includeWatermark,
      },
      layout: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
      charts: {
        defaultType: presetConfig.chartStyle,
        showLegend: true,
        showValues: true,
        animated: true,
      },
      filters: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConfigurations(prev => [newConfig, ...prev]);
    setActiveConfig(newConfig);
    toast.success(`Report configuration created from ${presetConfig.name} preset`);
    
    return newConfig;
  }, []);

  // Update configuration
  const updateConfiguration = useCallback((
    configId: string,
    updates: Partial<ReportConfiguration>
  ) => {
    setConfigurations(prev =>
      prev.map(config =>
        config.id === configId
          ? { ...config, ...updates, updatedAt: new Date() }
          : config
      )
    );

    if (activeConfig?.id === configId) {
      setActiveConfig(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }

    toast.success('Configuration updated');
  }, [activeConfig]);

  // Toggle section
  const toggleSection = useCallback((section: ReportSection) => {
    if (!activeConfig) return;

    const newSections = activeConfig.sections.includes(section)
      ? activeConfig.sections.filter(s => s !== section)
      : [...activeConfig.sections, section];

    updateConfiguration(activeConfig.id, { sections: newSections });
  }, [activeConfig, updateConfiguration]);

  // Generate report
  const generateReport = useCallback(async (configId?: string) => {
    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data
      setReportData(generateMockReportData());
      
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Export report
  const exportReport = useCallback(async (format: ExportFormat) => {
    setIsGenerating(true);

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
      
      // In production, this would trigger actual download
      // const blob = await exportReportToFormat(reportData, activeConfig, format);
      // downloadBlob(blob, `report-${Date.now()}.${format}`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Delete configuration
  const deleteConfiguration = useCallback((configId: string) => {
    setConfigurations(prev => prev.filter(c => c.id !== configId));
    
    if (activeConfig?.id === configId) {
      setActiveConfig(null);
    }
    
    toast.success('Configuration deleted');
  }, [activeConfig]);

  // Duplicate configuration
  const duplicateConfiguration = useCallback((configId: string) => {
    const original = configurations.find(c => c.id === configId);
    if (!original) return;

    const duplicate: ReportConfiguration = {
      ...original,
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConfigurations(prev => [duplicate, ...prev]);
    toast.success('Configuration duplicated');
  }, [configurations]);

  // Calculated metrics (memoized)
  const calculatedMetrics = useMemo(() => {
    const { summary } = reportData;
    
    return {
      passRate: summary.totalTests > 0 
        ? Math.round((summary.passed / summary.totalTests) * 100)
        : 0,
      failRate: summary.totalTests > 0
        ? Math.round((summary.failed / summary.totalTests) * 100)
        : 0,
      totalDefects: reportData.defects.length,
      criticalDefects: reportData.defects.filter(d => d.severity === 'critical').length,
      openDefects: reportData.defects.filter(d => d.status === 'open').length,
    };
  }, [reportData]);

  return {
    // State
    configurations,
    activeConfig,
    reportData,
    isGenerating,
    calculatedMetrics,

    // Actions
    createFromPreset,
    updateConfiguration,
    toggleSection,
    generateReport,
    exportReport,
    deleteConfiguration,
    duplicateConfiguration,
    setActiveConfig,
  };
}
