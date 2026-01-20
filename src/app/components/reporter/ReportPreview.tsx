/**
 * ReportPreview Component
 * Vista previa en tiempo real del reporte
 */

import { memo, useMemo } from 'react';
import { FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { cn } from '@/app/components/ui/utils';
import { REPORT_SECTIONS, COLOR_SCHEME_PALETTES } from '@/app/constants/reporter.constants';
import type { ReportConfiguration, ReportData } from '@/app/types/reporter.types';
import { formatRelativeTime, formatDuration } from '@/app/utils/format.utils';

interface ReportPreviewProps {
  config: ReportConfiguration;
  data: ReportData;
}

export const ReportPreview = memo(({ config, data }: ReportPreviewProps) => {
  const colors = COLOR_SCHEME_PALETTES[config.colorScheme] || COLOR_SCHEME_PALETTES.professional;

  // Chart data for test status
  const statusChartData = useMemo(() => [
    { name: 'Passed', value: data.summary.passed, color: colors.success },
    { name: 'Failed', value: data.summary.failed, color: colors.danger },
    { name: 'Blocked', value: data.summary.blocked, color: colors.warning },
    { name: 'Skipped', value: data.summary.skipped, color: colors.accent },
  ], [data.summary, colors]);

  // Render section based on type
  const renderSection = (section: string) => {
    switch (section) {
      case REPORT_SECTIONS.SUMMARY:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold">{data.summary.totalTests}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-600">{data.summary.passRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{data.summary.failed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Execution Time</p>
                  <p className="text-2xl font-bold">{formatDuration(data.summary.executionTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case REPORT_SECTIONS.METRICS:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {config.charts.defaultType === 'pie' || config.charts.defaultType === 'donut' ? (
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={config.charts.defaultType === 'donut' ? 60 : 0}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={config.charts.showValues}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {config.charts.showLegend && <Tooltip />}
                  </PieChart>
                ) : (
                  <BarChart data={statusChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    {config.charts.showLegend && <Tooltip />}
                    <Bar dataKey="value" fill={colors.primary} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case REPORT_SECTIONS.TEST_COVERAGE:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Test Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Coverage</span>
                  <span className="font-bold">{data.metrics.coverage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${data.metrics.coverage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Automation Rate</p>
                  <p className="text-lg font-semibold">{data.metrics.automationRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Velocity</p>
                  <p className="text-lg font-semibold">{data.metrics.velocity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case REPORT_SECTIONS.DEFECTS:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Defects Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.defects.slice(0, 5).map((defect) => (
                  <div
                    key={defect.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'h-2 w-2 rounded-full mt-2 shrink-0',
                      defect.severity === 'critical' && 'bg-red-500',
                      defect.severity === 'high' && 'bg-orange-500',
                      defect.severity === 'medium' && 'bg-yellow-500',
                      defect.severity === 'low' && 'bg-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{defect.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {defect.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {defect.status.replace('_', ' ')}
                        </Badge>
                        {defect.assignee && (
                          <span className="text-xs text-muted-foreground">
                            {defect.assignee}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(defect.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case REPORT_SECTIONS.EXECUTION_HISTORY:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Execution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.executionHistory.slice().reverse()}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip />
                  {config.charts.showLegend && <Legend />}
                  <Line
                    type="monotone"
                    dataKey="passed"
                    stroke={colors.success}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke={colors.danger}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case REPORT_SECTIONS.TEAM_PERFORMANCE:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.teamPerformance?.map((member) => (
                  <div key={member.memberId} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.memberName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {member.testsExecuted} tests • {member.defectsFound} defects found
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{member.contribution}%</p>
                      <p className="text-xs text-muted-foreground">contribution</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case REPORT_SECTIONS.RECOMMENDATIONS:
        return (
          <Card key={section} className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{config.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {config.sections.length} sections • Last updated {formatRelativeTime(config.updatedAt)}
            </p>
          </div>
          {config.branding.includeWatermark && (
            <Badge variant="outline" className="text-xs">
              {config.branding.companyName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <CardContent className="p-6 space-y-4">
          {config.sections.map((section) => renderSection(section))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
});

ReportPreview.displayName = 'ReportPreview';
