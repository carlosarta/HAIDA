/**
 * Reporter Types
 * Tipos TypeScript para el módulo de reportes
 */

import {
  REPORT_TYPES,
  CLIENT_PRESETS,
  REPORT_SECTIONS,
  EXPORT_FORMATS,
  CHART_TYPES,
  COLOR_SCHEMES,
} from '@/app/constants/reporter.constants';

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];
export type ClientPreset = typeof CLIENT_PRESETS[keyof typeof CLIENT_PRESETS];
export type ReportSection = typeof REPORT_SECTIONS[keyof typeof REPORT_SECTIONS];
export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS];
export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];
export type ColorScheme = typeof COLOR_SCHEMES[keyof typeof COLOR_SCHEMES];

export interface ReportConfiguration {
  id: string;
  name: string;
  type: ReportType;
  preset?: ClientPreset;
  sections: ReportSection[];
  colorScheme: ColorScheme;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  branding: {
    logo?: string;
    logoPosition: 'top-left' | 'top-center' | 'top-right' | 'center';
    companyName: string;
    tagline?: string;
    includeWatermark: boolean;
  };
  layout: {
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    headerHeight?: number;
    footerHeight?: number;
  };
  charts: {
    defaultType: ChartType;
    showLegend: boolean;
    showValues: boolean;
    animated: boolean;
  };
  filters: {
    projectId?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
    status?: string[];
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    recipients: string[];
    nextRun?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface ReportData {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    passRate: number;
    executionTime: number;
  };
  metrics: {
    coverage: number;
    velocity: number;
    defectDensity: number;
    automationRate: number;
    avgExecutionTime: number;
  };
  defects: DefectSummary[];
  executionHistory: ExecutionRecord[];
  teamPerformance?: TeamMetrics[];
  timeline?: TimelineEvent[];
  recommendations?: string[];
}

export interface DefectSummary {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignee?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ExecutionRecord {
  id: string;
  date: Date;
  passed: number;
  failed: number;
  total: number;
  duration: number;
}

export interface TeamMetrics {
  memberId: string;
  memberName: string;
  testsExecuted: number;
  defectsFound: number;
  avgResolutionTime: number;
  contribution: number;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'milestone' | 'release' | 'sprint' | 'issue';
  title: string;
  description?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  preset: ClientPreset;
  thumbnail?: string;
  configuration: Partial<ReportConfiguration>;
}

export interface ReportExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  compress: boolean;
  password?: string;
}
