/**
 * Dashboard Page - Optimized
 * Vista principal con estadísticas y actividad
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { 
  Folder, 
  FileText, 
  Activity, 
  AlertCircle,
  CheckSquare,
  Users,
} from 'lucide-react';
import { useData } from '@/app/lib/data-context';
import { useDashboard } from '@/app/hooks/useDashboard';
import { StatCard } from '@/app/components/dashboard/StatCard';
import { ActivityFeed } from '@/app/components/dashboard/ActivityFeed';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { CHART_COLORS } from '@/app/constants/dashboard.constants';

export function Dashboard() {
  const { projects, suites, executions, defects } = useData();
  const { stats, activities, taskSummary } = useDashboard();

  // Calcular estadísticas de proyectos (memoizado)
  const projectStats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalTestCases = suites.reduce((acc, s) => acc + (s.case_count || 0), 0);
    
    const passed = executions.filter(e => e.status === 'passed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const blocked = executions.filter(e => e.status === 'blocked').length;
    const skipped = executions.filter(e => e.status === 'skipped').length;
    
    const totalExecutions = passed + failed + blocked + skipped;
    const executionRate = totalTestCases > 0 
      ? Math.round((totalExecutions / totalTestCases) * 100) 
      : 0;
    
    const criticalDefects = defects.filter(d => d.severity === 'critical').length;

    return {
      activeProjects,
      totalTestCases,
      executionRate,
      criticalDefects,
      passed,
      failed,
      blocked,
      skipped,
    };
  }, [projects, suites, executions, defects]);

  // Datos para gráfico de pie (memoizado)
  const pieChartData = useMemo(() => [
    { name: 'Passed', value: projectStats.passed, color: CHART_COLORS[0] },
    { name: 'Failed', value: projectStats.failed, color: CHART_COLORS[1] },
    { name: 'Blocked', value: projectStats.blocked, color: CHART_COLORS[2] },
    { name: 'Skipped', value: projectStats.skipped, color: CHART_COLORS[3] },
  ], [projectStats]);

  // Datos para gráfico de barras (memoizado)
  const barChartData = useMemo(() => 
    projects.slice(0, 5).map(project => ({
      name: project.key,
      tests: suites.filter(s => s.project_id === project.id).length,
    }))
  , [projects, suites]);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your QA overview
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          stat={{
            id: 'projects',
            title: 'Active Projects',
            value: projectStats.activeProjects,
            change: 12,
            changeType: 'increase',
            description: 'In progress',
          }}
          icon={Folder}
        />
        <StatCard
          stat={{
            id: 'test-cases',
            title: 'Test Cases',
            value: projectStats.totalTestCases,
            change: 8,
            changeType: 'increase',
            description: 'Total coverage',
          }}
          icon={FileText}
        />
        <StatCard
          stat={{
            id: 'execution-rate',
            title: 'Execution Rate',
            value: `${projectStats.executionRate}%`,
            change: -3,
            changeType: 'decrease',
            description: 'This week',
          }}
          icon={Activity}
        />
        <StatCard
          stat={{
            id: 'critical-defects',
            title: 'Critical Defects',
            value: projectStats.criticalDefects,
            change: 0,
            changeType: 'neutral',
            description: 'Needs attention',
          }}
          icon={AlertCircle}
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Test Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tests per Project */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tests per Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tests" fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed & Quick Stats */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} maxHeight="500px" />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Task Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="font-bold">{taskSummary.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-bold text-green-600">{taskSummary.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="font-bold text-blue-600">{taskSummary.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Todo</span>
                <span className="font-bold text-slate-600">{taskSummary.todo}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="font-bold text-lg">{taskSummary.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${taskSummary.completionRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Members</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Online Now</span>
                <span className="font-bold text-green-600">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tasks Today</span>
                <span className="font-bold">23</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
