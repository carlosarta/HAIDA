/**
 * 🗄️ HAIDA - Database Types
 * 
 * Tipos TypeScript generados automáticamente desde el esquema PostgreSQL
 * 
 * IMPORTANTE: Este archivo es generado automáticamente.
 * No editar manualmente - usar `npm run generate:types` después de migraciones.
 * 
 * @module database.types
 * @generated 2025-01-20
 */

// ============================================
// ENUMS
// ============================================

export type TenantSize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended' | 'cancelled';
export type TenantRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type GlobalRole = 'admin' | 'manager' | 'tester' | 'qa_engineer' | 'developer' | 'viewer';

export type SSOProvider = 'microsoft' | 'google' | 'github' | 'saml';

export type DefectSeverity = 'critical' | 'high' | 'medium' | 'low';
export type DefectPriority = 'p0' | 'p1' | 'p2' | 'p3' | 'p4';
export type DefectStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix' | 'duplicate';

export type ChatProvider = 'copilot-studio' | 'openai' | 'anthropic' | 'routellm';
export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatContentType = 'text' | 'markdown' | 'json' | 'error';
export type ChatThreadStatus = 'active' | 'archived' | 'deleted';

export type ProjectStatus = 'active' | 'inactive' | 'archived';
export type TestPriority = 'critical' | 'high' | 'medium' | 'low';
export type TestType = 'smoke' | 'regression' | 'integration' | 'e2e' | 'unit' | 'performance';
export type TestStatus = 'active' | 'inactive' | 'deprecated';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TestResultStatus = 'passed' | 'failed' | 'skipped' | 'error';

export type FeatureFlagType = 'boolean' | 'string' | 'number' | 'json';
export type RateLimitAppliesTo = 'user' | 'tenant' | 'ip';

// ============================================
// TABLE TYPES
// ============================================

/**
 * Feature Flags - Global feature toggles
 */
export interface FeatureFlag {
  key: string; // PRIMARY KEY
  name: string;
  description?: string;
  type: FeatureFlagType;
  default_value: any; // jsonb
  rollout_percentage: number; // 0-100
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tenant Feature Flags - Feature toggles per tenant
 */
export interface TenantFeatureFlag {
  tenant_id: string; // uuid, FK to tenants
  flag_key: string; // FK to feature_flags
  value?: any; // jsonb
  is_enabled: boolean;
  rollout_percentage: number;
  set_by?: string;
  set_at: string;
}

/**
 * User Feature Flags - Feature toggles per user
 */
export interface UserFeatureFlag {
  user_id: string; // uuid
  flag_key: string; // FK to feature_flags
  value?: any; // jsonb
  is_enabled: boolean;
  set_by?: string;
  set_at: string;
}

/**
 * Tenants - Multi-tenant organization entities
 */
export interface Tenant {
  id: string; // uuid PRIMARY KEY
  name: string;
  slug: string; // UNIQUE
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  size?: TenantSize;
  timezone: string;
  locale: string;
  settings: {
    features: {
      chat_ia: boolean;
      api_access: boolean;
      advanced_reporting: boolean;
    };
    max_users: number;
    max_projects: number;
    allow_public_signup: boolean;
    require_email_verification: boolean;
  };
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Tenant Members - Users belonging to tenants
 */
export interface TenantMember {
  tenant_id: string; // uuid, FK to tenants
  user_id: string; // uuid, FK to auth.users
  role: TenantRole;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  last_active_at?: string;
  permissions: string[]; // jsonb array
}

/**
 * User Profiles - Extended user information
 */
export interface UserProfile {
  id: string; // uuid PRIMARY KEY, FK to auth.users
  email: string; // UNIQUE
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  department?: string;
  phone?: string;
  timezone: string;
  locale: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      push: boolean;
      email: boolean;
      reports: boolean;
    };
    dashboard_layout: string;
  };
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * User SSO Providers - OAuth/SSO connections
 */
export interface UserSSOProvider {
  user_id: string; // uuid
  provider: SSOProvider;
  provider_id: string;
  provider_data: Record<string, any>; // jsonb
  linked_at: string;
  last_used_at: string;
}

/**
 * Roles - RBAC roles
 */
export interface Role {
  id: string; // uuid PRIMARY KEY
  name: string; // UNIQUE
  display_name?: string;
  description?: string;
  is_system_role: boolean;
  permissions: string[]; // jsonb array
  created_at: string;
}

/**
 * Permissions - RBAC permissions
 */
export interface Permission {
  id: string; // uuid PRIMARY KEY
  name: string; // UNIQUE
  resource?: string;
  action?: string;
  description?: string;
  created_at: string;
}

/**
 * Role Permissions - Many-to-many roles<->permissions
 */
export interface RolePermission {
  role_id: string; // uuid, FK to roles
  permission_id: string; // uuid, FK to permissions
  granted_by?: string;
  granted_at: string;
}

/**
 * Rate Limit Counters - Request tracking per user/tenant/endpoint
 */
export interface RateLimitCounter {
  user_id: string; // uuid
  tenant_id: string; // uuid, FK to tenants
  endpoint: string;
  window_start: string; // timestamptz
  request_count: number;
  blocked_until?: string;
  created_at: string;
}

/**
 * Rate Limit Policies - Rate limiting configurations
 */
export interface RateLimitPolicy {
  id: string; // uuid PRIMARY KEY
  name: string; // UNIQUE
  description?: string;
  requests_per_minute: number;
  requests_per_hour: number;
  burst_limit: number;
  applies_to: RateLimitAppliesTo;
  is_active: boolean;
  created_at: string;
}

/**
 * Defects - Bug/issue tracking
 */
export interface Defect {
  id: string; // uuid PRIMARY KEY
  tenant_id?: string; // uuid, FK to tenants
  project_id?: string; // uuid
  test_execution_id?: string; // uuid
  test_result_id?: string; // uuid
  title: string;
  description?: string;
  severity: DefectSeverity;
  priority: DefectPriority;
  status: DefectStatus;
  external_issue_id?: string; // Jira/GitHub issue ID
  external_url?: string;
  assigned_to?: string; // uuid
  reported_by?: string; // uuid
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  environment?: string;
  browser?: string;
  os_version?: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>; // jsonb
  tags: string[];
  metadata: Record<string, any>; // jsonb
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Event Logs - Audit trail
 */
export interface EventLog {
  id: string; // uuid PRIMARY KEY
  user_id?: string; // uuid
  event_type: string;
  message?: string;
  metadata?: Record<string, any>; // jsonb
  created_at: string;
}

/**
 * Chat Threads - IA chat conversations
 */
export interface ChatThread {
  id: string; // uuid PRIMARY KEY
  tenant_id?: string; // uuid, FK to tenants
  project_id?: string; // uuid
  user_id?: string; // uuid
  title?: string;
  provider: ChatProvider;
  thread_id?: string; // UNIQUE, external provider thread ID
  status: ChatThreadStatus;
  metadata: Record<string, any>; // jsonb
  created_at: string;
  updated_at: string;
}

/**
 * Chat Messages - Individual messages in threads
 */
export interface ChatMessage {
  id: string; // uuid PRIMARY KEY
  thread_id: string; // uuid, FK to chat_threads
  role: ChatRole;
  content?: string;
  content_type: ChatContentType;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>; // jsonb
  metadata: Record<string, any>; // jsonb
  created_at: string;
}

/**
 * Chat Providers - IA provider configurations per tenant
 */
export interface ChatProviderConfig {
  tenant_id: string; // uuid, FK to tenants
  provider: ChatProvider;
  is_active: boolean;
  config: {
    api_key?: string;
    endpoint?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }; // jsonb
  usage_limits: {
    tokens_per_month: number;
    requests_per_hour: number;
    requests_per_minute: number;
  }; // jsonb
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Users - Application users (separate from auth.users)
 */
export interface User {
  id: string; // uuid PRIMARY KEY
  email: string; // UNIQUE
  name?: string;
  role: GlobalRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  metadata: Record<string, any>; // jsonb
}

/**
 * Projects - Testing projects
 */
export interface Project {
  id: string; // uuid PRIMARY KEY
  name: string;
  slug: string; // UNIQUE
  description?: string;
  base_url?: string;
  repository_url?: string;
  status: ProjectStatus;
  owner_id?: string; // uuid, FK to users
  created_at: string;
  updated_at: string;
  settings: {
    change_detection_enabled?: boolean;
    auto_trigger_tests?: boolean;
    notification_channels?: string[];
  }; // jsonb
  metadata: Record<string, any>; // jsonb
}

/**
 * Test Suites - Collections of test cases
 */
export interface TestSuite {
  id: string; // uuid PRIMARY KEY
  project_id: string; // uuid, FK to projects
  name: string;
  description?: string;
  suite_type?: TestType;
  priority: TestPriority;
  tags: string[];
  is_active: boolean;
  created_by?: string; // uuid
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>; // jsonb
}

/**
 * Test Cases - Individual test definitions
 */
export interface TestCase {
  id: string; // uuid PRIMARY KEY
  test_suite_id: string; // uuid, FK to test_suites
  test_id?: string; // UNIQUE, custom test ID
  name?: string;
  description?: string;
  test_type?: TestType;
  component?: string;
  module?: string;
  requirement_ids: string[];
  preconditions?: string;
  test_steps?: string;
  expected_result?: string;
  priority: TestPriority;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  is_automated: boolean;
  automation_script_path?: string;
  automation_framework?: string;
  status: TestStatus;
  tags: string[];
  created_by?: string; // uuid
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>; // jsonb
}

/**
 * Change Detections - Webhook-triggered change events
 */
export interface ChangeDetection {
  id: string; // uuid PRIMARY KEY
  project_id: string; // uuid, FK to projects
  url: string;
  tag?: string;
  change_type?: string;
  previous_md5?: string;
  current_md5?: string;
  diff_summary?: string;
  webhook_payload?: Record<string, any>; // jsonb
  selected_test_profile?: string;
  test_suite_ids: string[]; // uuid[]
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: string;
  detected_at: string;
  created_at: string;
  metadata: Record<string, any>; // jsonb
}

/**
 * Test Executions - Test run sessions
 */
export interface TestExecution {
  id: string; // uuid PRIMARY KEY
  project_id: string; // uuid, FK to projects
  change_detection_id?: string; // uuid
  execution_type?: 'manual' | 'scheduled' | 'triggered' | 'ci_cd';
  trigger_source?: string;
  environment: 'development' | 'staging' | 'production';
  browser?: string;
  platform?: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  allure_report_url?: string;
  playwright_report_url?: string;
  artifacts_path?: string;
  triggered_by?: string; // uuid
  metadata: Record<string, any>; // jsonb
}

/**
 * Test Results - Individual test outcomes
 */
export interface TestResult {
  id: string; // uuid PRIMARY KEY
  test_execution_id: string; // uuid, FK to test_executions
  test_case_id?: string; // uuid, FK to test_cases
  test_name?: string;
  test_file?: string;
  test_id_ref?: string;
  status: TestResultStatus;
  error_message?: string;
  error_stack?: string;
  duration_ms?: number;
  retries: number;
  screenshot_url?: string;
  video_url?: string;
  trace_url?: string;
  logs?: string;
  assertions_passed: number;
  assertions_failed: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  metadata: Record<string, any>; // jsonb
}

// ============================================
// VIEW TYPES
// ============================================

/**
 * Project Health View - Aggregated project metrics
 */
export interface ProjectHealth {
  project_id: string;
  project_name: string;
  total_executions: number;
  completed_executions: number;
  failed_executions: number;
  avg_duration_ms: number;
  total_assertions_passed: number;
  total_assertions_failed: number;
  last_execution_at?: string;
}

/**
 * Test Coverage View - Suite automation metrics
 */
export interface TestCoverage {
  test_suite_id: string;
  project_id: string;
  suite_name: string;
  total_test_cases: number;
  automated_test_cases: number;
  manual_test_cases: number;
  automation_percentage: number;
}

/**
 * Recent Executions View - Latest test runs
 */
export interface RecentExecution {
  execution_id: string;
  project_id: string;
  project_name?: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Database insert types (omit auto-generated fields)
 */
export type InsertProject = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type InsertTestSuite = Omit<TestSuite, 'id' | 'created_at' | 'updated_at'>;
export type InsertTestCase = Omit<TestCase, 'id' | 'created_at' | 'updated_at'>;
export type InsertTestExecution = Omit<TestExecution, 'id' | 'started_at' | 'duration_ms'>;
export type InsertDefect = Omit<Defect, 'id' | 'created_at' | 'updated_at'>;
export type InsertChatThread = Omit<ChatThread, 'id' | 'created_at' | 'updated_at'>;
export type InsertChatMessage = Omit<ChatMessage, 'id' | 'created_at'>;

/**
 * Database update types (partial, omit PKs)
 */
export type UpdateProject = Partial<Omit<Project, 'id' | 'created_at'>>;
export type UpdateTestSuite = Partial<Omit<TestSuite, 'id' | 'project_id' | 'created_at'>>;
export type UpdateTestCase = Partial<Omit<TestCase, 'id' | 'test_suite_id' | 'created_at'>>;
export type UpdateTestExecution = Partial<Omit<TestExecution, 'id' | 'project_id' | 'started_at'>>;
export type UpdateDefect = Partial<Omit<Defect, 'id' | 'created_at'>>;

/**
 * Joined types (con relaciones)
 */
export interface TestCaseWithSuite extends TestCase {
  suite: TestSuite;
}

export interface TestResultWithCase extends TestResult {
  test_case?: TestCase;
}

export interface TestExecutionWithResults extends TestExecution {
  results: TestResult[];
}

export interface DefectWithReferences extends Defect {
  project?: Project;
  test_execution?: TestExecution;
  test_result?: TestResult;
  assigned_user?: User;
  reporter?: User;
}

export interface ChatThreadWithMessages extends ChatThread {
  messages: ChatMessage[];
}

export interface ProjectWithStats extends Project {
  total_suites: number;
  total_cases: number;
  total_executions: number;
  health?: ProjectHealth;
}
