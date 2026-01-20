import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- ISTQB / Enterprise Data Model ---

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Active' | 'Draft' | 'Archived' | 'Deprecated';
export type ExecutionStatus = 'passed' | 'failed' | 'running' | 'queued' | 'skipped';
export type TestType = 'Web' | 'API' | 'Mobile' | 'Desktop';

// 1. Project (The root entity)
export interface Project {
  id: string;
  key: string; // e.g., "HAIDA"
  name: string;
  description?: string;
  owner: string;
  status: Status;
  created_at: string;
}

// 2. Requirement (For Traceability)
export interface Requirement {
  id: string;
  project_id: string;
  identifier: string; // e.g., "REQ-001"
  description: string;
}

// 3. Test Suite (Logical grouping)
export interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  type: TestType;
  case_count: number;
}

// 4. Test Case (The definition)
export interface TestCase {
  id: string;
  project_id: string;
  suite_id: string;
  title: string;
  description?: string;
  priority: Priority;
  linked_req_id?: string; // Traceability
  steps: { action: string; expected: string }[];
}

// 5. Execution (The instance of a run)
export interface Execution {
  id: string;
  project_id: string;
  suite_id: string;
  status: ExecutionStatus;
  started_at: string; // ISO Date
  duration_ms: number;
  passed_count: number;
  failed_count: number;
  defect_id?: string; // Linked defect if failed
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
}

// --- Mock Initial Data (Seed) ---

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', key: 'PRIV', name: 'Privalia - Plataforma E-commerce', owner: 'Carlos Ruiz', status: 'Active', created_at: '2024-01-10' },
  { id: 'p2', key: 'CTB', name: 'CTB - Core Transaction Backend', owner: 'Ana Garcia', status: 'Active', created_at: '2024-06-15' },
  { id: 'p3', key: 'HAID', name: 'HAIDA - QA Enterprise Platform', owner: 'Miguel Torres', status: 'Active', created_at: '2025-01-01' },
];

const MOCK_SUITES: TestSuite[] = [
  { id: 's1', project_id: 'p1', name: 'Checkout E2E - Privalia', type: 'Web', case_count: 45 },
  { id: 's2', project_id: 'p1', name: 'Payment Integration', type: 'API', case_count: 32 },
  { id: 's3', project_id: 'p2', name: 'Transaction Core Engine', type: 'API', case_count: 28 },
  { id: 's4', project_id: 'p3', name: 'HAIDA Platform Testing', type: 'Web', case_count: 56 },
];

const MOCK_CASES: TestCase[] = [
  { 
    id: 'c1', project_id: 'p1', suite_id: 's1', title: 'Verify Login with Valid Credentials', priority: 'Critical', 
    description: 'Ensure user can login with valid email and password',
    steps: [
      { action: 'Navigate to login page', expected: 'Login page displayed' },
      { action: 'Enter valid email and password', expected: 'Fields populated' },
      { action: 'Click Login button', expected: 'Redirected to dashboard' }
    ]
  },
  { 
    id: 'c2', project_id: 'p1', suite_id: 's1', title: 'Verify Login with Invalid Password', priority: 'High', 
    description: 'Ensure system rejects invalid password',
    steps: [
      { action: 'Navigate to login page', expected: 'Login page displayed' },
      { action: 'Enter valid email and invalid password', expected: 'Fields populated' },
      { action: 'Click Login button', expected: 'Error message displayed' }
    ]
  },
  {
    id: 'c3', project_id: 'p1', suite_id: 's2', title: 'API Auth Token Generation', priority: 'Critical',
    description: 'Verify JWT generation',
    steps: [
      { action: 'POST /api/auth/login', expected: '200 OK with token' }
    ]
  }
];

const MOCK_EXECUTIONS: Execution[] = [
  { id: 'exe1', project_id: 'p1', suite_id: 's1', status: 'passed', started_at: new Date(Date.now() - 86400000).toISOString(), duration_ms: 240000, passed_count: 44, failed_count: 1 },
  { id: 'exe2', project_id: 'p1', suite_id: 's2', status: 'failed', started_at: new Date(Date.now() - 43200000).toISOString(), duration_ms: 45000, passed_count: 10, failed_count: 2, defect_id: 'DEF-101' },
  { id: 'exe3', project_id: 'p2', suite_id: 's3', status: 'passed', started_at: new Date(Date.now() - 10000000).toISOString(), duration_ms: 120000, passed_count: 20, failed_count: 0 },
];

// --- Context Interface ---

interface DataContextType {
  projects: Project[];
  suites: TestSuite[];
  cases: TestCase[];
  executions: Execution[];
  defects: Defect[];
  
  // Actions (CRUD Logic)
  addProject: (project: Omit<Project, 'id' | 'created_at'>) => void;
  deleteProject: (id: string) => void;
  updateTestCase: (id: string, data: Partial<TestCase>) => void;
  runSuite: (suiteId: string) => void; // Simulator
  addExecution: (execution: Omit<Execution, 'id'>) => void;
  addDefect: (defect: Defect) => void;
  
  // Getters / Selectors
  getProjectKPIs: (projectId?: string) => { totalTests: number; successRate: number; activeSuites: number; criticalDefects: number };
  getExecutionsByProject: (projectId?: string) => Execution[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [suites, setSuites] = useState<TestSuite[]>(MOCK_SUITES);
  const [cases, setCases] = useState<TestCase[]>(MOCK_CASES);
  const [executions, setExecutions] = useState<Execution[]>(MOCK_EXECUTIONS);
  const [defects, setDefects] = useState<Defect[]>([]);

  // -- Actions --

  const addProject = (data: Omit<Project, 'id' | 'created_at'>) => {
    const newProject: Project = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Cascade delete logic would go here (delete suites/executions related to project)
  };

  const updateTestCase = (id: string, data: Partial<TestCase>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const addExecution = (execution: Omit<Execution, 'id'>) => {
    const newExecution = { ...execution, id: Math.random().toString(36).substr(2, 9) };
    setExecutions(prev => [newExecution, ...prev]);
  };

  const addDefect = (defect: Defect) => {
    setDefects(prev => [defect, ...prev]);
  };

  const runSuite = (suiteId: string) => {
    const suite = suites.find(s => s.id === suiteId);
    if (!suite) return;

    // Simulate a "Running" state
    const newId = Math.random().toString(36).substr(2, 9);
    const tempExecution: Execution = {
      id: newId,
      project_id: suite.project_id,
      suite_id: suite.id,
      status: 'running',
      started_at: new Date().toISOString(),
      duration_ms: 0,
      passed_count: 0,
      failed_count: 0
    };

    setExecutions(prev => [tempExecution, ...prev]);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setExecutions(prev => prev.map(exe => {
        if (exe.id === newId) {
          // Randomized result
          const isFailure = Math.random() > 0.7; 
          return {
            ...exe,
            status: isFailure ? 'failed' : 'passed',
            duration_ms: Math.floor(Math.random() * 50000) + 1000,
            passed_count: isFailure ? suite.case_count - 2 : suite.case_count,
            failed_count: isFailure ? 2 : 0,
            defect_id: isFailure ? `DEF-${Math.floor(Math.random() * 1000)}` : undefined
          };
        }
        return exe;
      }));
    }, 3000);
  };

  // -- Selectors --

  const getExecutionsByProject = (projectId?: string) => {
    if (!projectId || projectId === 'all') return executions;
    return executions.filter(e => e.project_id === projectId);
  };

  const getProjectKPIs = (projectId?: string) => {
    const relevantExecutions = getExecutionsByProject(projectId);
    const relevantSuites = (!projectId || projectId === 'all') 
      ? suites 
      : suites.filter(s => s.project_id === projectId);

    const totalTests = relevantSuites.reduce((acc, s) => acc + s.case_count, 0);
    const activeSuites = relevantSuites.length;
    
    // Calculate Success Rate based on executions
    const passedExecutions = relevantExecutions.filter(e => e.status === 'passed').length;
    const totalFinished = relevantExecutions.filter(e => e.status !== 'running' && e.status !== 'queued').length;
    const successRate = totalFinished > 0 ? Math.round((passedExecutions / totalFinished) * 100) : 0;

    const criticalDefects = relevantExecutions.filter(e => e.status === 'failed').length;

    return { totalTests, activeSuites, successRate, criticalDefects };
  };

  return (
    <DataContext.Provider value={{ 
      projects, 
      suites, 
      cases,
      executions, 
      defects,
      addProject, 
      deleteProject, 
      updateTestCase,
      runSuite,
      addExecution,
      addDefect,
      getProjectKPIs,
      getExecutionsByProject
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};