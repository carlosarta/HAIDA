/**
 * Reporter Constants
 * Constantes para el módulo de reportes y configuración
 */

export const REPORT_TYPES = {
  EXECUTIVE: 'executive',
  TECHNICAL: 'technical',
  SPRINT: 'sprint',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  CUSTOM: 'custom',
} as const;

export const CLIENT_PRESETS = {
  ENTERPRISE: 'enterprise',
  STARTUP: 'startup',
  AGENCY: 'agency',
  GOVERNMENT: 'government',
  HEALTHCARE: 'healthcare',
  FINTECH: 'fintech',
} as const;

export const REPORT_SECTIONS = {
  SUMMARY: 'summary',
  METRICS: 'metrics',
  TEST_COVERAGE: 'test_coverage',
  DEFECTS: 'defects',
  EXECUTION_HISTORY: 'execution_history',
  TEAM_PERFORMANCE: 'team_performance',
  TIMELINE: 'timeline',
  RECOMMENDATIONS: 'recommendations',
  ATTACHMENTS: 'attachments',
} as const;

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  WORD: 'word',
  JSON: 'json',
  HTML: 'html',
} as const;

export const CHART_TYPES = {
  PIE: 'pie',
  BAR: 'bar',
  LINE: 'line',
  AREA: 'area',
  DONUT: 'donut',
} as const;

export const COLOR_SCHEMES = {
  PROFESSIONAL: 'professional',
  VIBRANT: 'vibrant',
  MINIMAL: 'minimal',
  DARK: 'dark',
  CUSTOM: 'custom',
} as const;

export const PRESET_CONFIGS = {
  [CLIENT_PRESETS.ENTERPRISE]: {
    name: 'Enterprise',
    description: 'Formal reports for large corporations',
    icon: 'Building2',
    defaultSections: [
      REPORT_SECTIONS.SUMMARY,
      REPORT_SECTIONS.METRICS,
      REPORT_SECTIONS.TEST_COVERAGE,
      REPORT_SECTIONS.DEFECTS,
      REPORT_SECTIONS.TEAM_PERFORMANCE,
      REPORT_SECTIONS.RECOMMENDATIONS,
    ],
    colorScheme: COLOR_SCHEMES.PROFESSIONAL,
    logoPosition: 'top-left',
    includeWatermark: true,
    chartStyle: CHART_TYPES.BAR,
  },
  [CLIENT_PRESETS.STARTUP]: {
    name: 'Startup',
    description: 'Agile and concise reports',
    icon: 'Rocket',
    defaultSections: [
      REPORT_SECTIONS.SUMMARY,
      REPORT_SECTIONS.METRICS,
      REPORT_SECTIONS.EXECUTION_HISTORY,
      REPORT_SECTIONS.DEFECTS,
    ],
    colorScheme: COLOR_SCHEMES.VIBRANT,
    logoPosition: 'center',
    includeWatermark: false,
    chartStyle: CHART_TYPES.DONUT,
  },
  [CLIENT_PRESETS.AGENCY]: {
    name: 'Agency',
    description: 'Client-facing reports with branding',
    icon: 'Briefcase',
    defaultSections: [
      REPORT_SECTIONS.SUMMARY,
      REPORT_SECTIONS.METRICS,
      REPORT_SECTIONS.TEST_COVERAGE,
      REPORT_SECTIONS.TIMELINE,
      REPORT_SECTIONS.ATTACHMENTS,
    ],
    colorScheme: COLOR_SCHEMES.CUSTOM,
    logoPosition: 'top-center',
    includeWatermark: true,
    chartStyle: CHART_TYPES.PIE,
  },
  [CLIENT_PRESETS.GOVERNMENT]: {
    name: 'Government',
    description: 'Detailed compliance reports',
    icon: 'Shield',
    defaultSections: [
      REPORT_SECTIONS.SUMMARY,
      REPORT_SECTIONS.METRICS,
      REPORT_SECTIONS.TEST_COVERAGE,
      REPORT_SECTIONS.DEFECTS,
      REPORT_SECTIONS.EXECUTION_HISTORY,
      REPORT_SECTIONS.TEAM_PERFORMANCE,
      REPORT_SECTIONS.RECOMMENDATIONS,
      REPORT_SECTIONS.ATTACHMENTS,
    ],
    colorScheme: COLOR_SCHEMES.MINIMAL,
    logoPosition: 'top-left',
    includeWatermark: true,
    chartStyle: CHART_TYPES.BAR,
  },
  [CLIENT_PRESETS.HEALTHCARE]: {
    name: 'Healthcare',
    description: 'HIPAA-compliant reports',
    icon: 'Heart',
    defaultSections: [
      REPORT_SECTIONS.SUMMARY,
      REPORT_SECTIONS.METRICS,
      REPORT_SECTIONS.TEST_COVERAGE,
      REPORT_SECTIONS.DEFECTS,
      REPORT_SECTIONS.RECOMMENDATIONS,
    ],
    colorScheme: COLOR_SCHEMES.PROFESSIONAL,
    logoPosition: 'top-right',
    includeWatermark: true,
    chartStyle: CHART_TYPES.LINE,
  },
  [CLIENT_PRESETS.FINTECH]: {
    name: 'Fintech',
    description: 'Security-focused reports',
    icon: 'TrendingUp',
    defaultSections: [
      REPORT_SECTIONS.SUMMARY,
      REPORT_SECTIONS.METRICS,
      REPORT_SECTIONS.TEST_COVERAGE,
      REPORT_SECTIONS.DEFECTS,
      REPORT_SECTIONS.EXECUTION_HISTORY,
      REPORT_SECTIONS.RECOMMENDATIONS,
    ],
    colorScheme: COLOR_SCHEMES.DARK,
    logoPosition: 'top-left',
    includeWatermark: true,
    chartStyle: CHART_TYPES.AREA,
  },
} as const;

export const SECTION_CONFIG = {
  [REPORT_SECTIONS.SUMMARY]: {
    label: 'Executive Summary',
    description: 'High-level overview of test results',
    icon: 'FileText',
    required: true,
  },
  [REPORT_SECTIONS.METRICS]: {
    label: 'Key Metrics',
    description: 'Statistical analysis and KPIs',
    icon: 'BarChart3',
    required: true,
  },
  [REPORT_SECTIONS.TEST_COVERAGE]: {
    label: 'Test Coverage',
    description: 'Coverage analysis and gaps',
    icon: 'Target',
    required: false,
  },
  [REPORT_SECTIONS.DEFECTS]: {
    label: 'Defects Analysis',
    description: 'Bug reports and severity breakdown',
    icon: 'AlertCircle',
    required: false,
  },
  [REPORT_SECTIONS.EXECUTION_HISTORY]: {
    label: 'Execution History',
    description: 'Test run timeline and trends',
    icon: 'History',
    required: false,
  },
  [REPORT_SECTIONS.TEAM_PERFORMANCE]: {
    label: 'Team Performance',
    description: 'Contributor metrics and velocity',
    icon: 'Users',
    required: false,
  },
  [REPORT_SECTIONS.TIMELINE]: {
    label: 'Project Timeline',
    description: 'Milestones and sprint progress',
    icon: 'Calendar',
    required: false,
  },
  [REPORT_SECTIONS.RECOMMENDATIONS]: {
    label: 'Recommendations',
    description: 'Suggested improvements and actions',
    icon: 'Lightbulb',
    required: false,
  },
  [REPORT_SECTIONS.ATTACHMENTS]: {
    label: 'Attachments',
    description: 'Supporting documents and files',
    icon: 'Paperclip',
    required: false,
  },
} as const;

export const COLOR_SCHEME_PALETTES = {
  [COLOR_SCHEMES.PROFESSIONAL]: {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  [COLOR_SCHEMES.VIBRANT]: {
    primary: '#7c3aed',
    secondary: '#ec4899',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f97316',
    danger: '#ef4444',
  },
  [COLOR_SCHEMES.MINIMAL]: {
    primary: '#0f172a',
    secondary: '#475569',
    accent: '#94a3b8',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
  },
  [COLOR_SCHEMES.DARK]: {
    primary: '#111827',
    secondary: '#374151',
    accent: '#6b7280',
    success: '#047857',
    warning: '#b45309',
    danger: '#b91c1c',
  },
} as const;

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'custom', label: 'Custom' },
] as const;
