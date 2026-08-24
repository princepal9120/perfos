import axios from "axios";

/**
 * Typed API client for the PerfOS FastAPI backend (app/api/routes.py).
 *
 * Base URL resolution:
 *  - On Cloudflare Pages (and other hosts) use NEXT_PUBLIC_API_URL if set.
 *  - Locally, leave it as "/api" and let next.config.js rewrite to the backend.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function setWorkspaceId(id: string | number) {
  api.defaults.headers.common["X-Workspace-Id"] = String(id);
}

/** Generic GET by absolute app path (e.g. "/api/recommendations"). */
export async function apiGet<T>(path: string): Promise<T> {
  const { data } = await axios.get<T>(path);
  return data;
}

/** Generic POST by absolute app path. */
export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const { data } = await axios.post<T>(path, body ?? {});
  return data;
}

// ---- Types (mirror pydantic models in app/api/routes.py) ----

export type Platform =
  | "google"
  | "meta"
  | "shopify"
  | "tiktok"
  | "linkedin"
  | "pinterest"
  | "snapchat"
  | "amazon"
  | "reddit"
  | "twitter"
  | "youtube"
  | "amazon_ads"
  | "x_ads";
export type AgentProvider =
  | "chatgpt"
  | "claude"
  | "opencode"
  | "openai"
  | "anthropic";
export type Risk = "low" | "medium" | "high";

/** TokenOut */
export interface TokenOut {
  access_token: string;
  token_type: string;
  workspace_id: number;
}

/** TokenRequest */
export interface TokenRequest {
  api_key?: string;
  password?: string;
  workspace_id?: number;
  workspace?: string;
}

/** WorkspaceOut (created_at has an ORM default) */
export interface Workspace {
  id: number;
  org_id: number | null;
  name: string;
  currency: string;
  created_at: string;
}

/** AccountCreate */
export interface AccountCreate {
  platform: Platform;
  platform_account_id?: string;
  name?: string;
}

/** AccountOut (platform constrained to PLATFORMS by AccountCreate; connected_at has an ORM default) */
export interface AdAccount {
  id: number;
  workspace_id: number;
  platform: Platform;
  platform_account_id: string | null;
  name: string;
  status: string;
  connected_at: string;
}

/** ChannelStat */
export interface ChannelStat {
  platform: string;
  spend: number;
  claimed_value: number;
  claimed_roas: number;
}

/** ReconcileOut — GET /reconcile */
export interface ReconcileResult {
  total_spend: number;
  platform_claimed_value: number;
  actual_revenue: number;
  blended_mer: number;
  per_channel: ChannelStat[];
  over_count_value: number;
  over_count_pct: number;
  tracking_integrity_flag: boolean;
}

/** BriefingOut.kpis — built by app/services/briefing.py */
export interface BriefingKpis {
  spend: number;
  revenue: number;
  blended_roas: number;
  over_count_pct: number;
}

export interface BriefingChange {
  summary: string;
  type: string;
  risk: Risk;
  confidence: number | null;
  proposed_changes: Record<string, unknown> | null;
}

export interface BriefingRecommendation {
  id: number | null;
  type: string;
  reason: string;
  evidence: Record<string, unknown> | null;
  expected_impact: string | null;
  confidence: number | null;
  risk: Risk;
  status: string;
}

/** BriefingOut — GET /briefing */
export interface Briefing {
  kpis: BriefingKpis;
  changes: BriefingChange[];
  recommendations: BriefingRecommendation[];
  narrative: string;
}

/** RecommendationOut */
export interface Recommendation {
  id: number;
  workspace_id: number;
  type: string;
  reason: string;
  evidence_json: Record<string, unknown> | null;
  expected_impact: string | null;
  confidence: number;
  risk: Risk;
  proposed_changes_json: Record<string, unknown> | null;
  rollback_json: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

/** DecisionRequest */
export interface DecisionRequest {
  actor?: string;
  note?: string;
}

/** DecisionResult — response of /recommendations/{id}/approve and /reject */
export interface DecisionResult {
  recommendation_id: number;
  status: string;
  decision: string;
  reasons: string[];
}

/** ExperimentCreate */
export interface ExperimentCreate {
  hypothesis: string;
  primary_metric?: string;
  control_json?: Record<string, unknown>;
  variant_json?: Record<string, unknown>;
}

/** ExperimentOut */
export interface Experiment {
  id: number;
  workspace_id: number;
  hypothesis: string;
  control_json: Record<string, unknown> | null;
  variant_json: Record<string, unknown> | null;
  primary_metric: string;
  status: string;
  result_json: Record<string, unknown> | null;
  created_at: string;
}

/** OutcomeOut (recorded_at has an ORM default) */
export interface Outcome {
  id: number;
  recommendation_id: number;
  metric: string;
  before: number;
  after: number;
  delta: number;
  recorded_at: string;
}

/** AgentCreate */
export interface AgentCreate {
  provider: AgentProvider;
  name: string;
  config_json?: Record<string, unknown>;
}

/** AgentOut */
export interface ConnectedAgent {
  id: number;
  workspace_id: number;
  provider: string;
  name: string;
  status: string;
  config_json: Record<string, unknown> | null;
  last_run_at: string | null;
}

// ---- Endpoints (app/api/routes.py) ----

/** POST /auth/token */
export async function postAuthToken(body: TokenRequest): Promise<TokenOut> {
  const { data } = await api.post<TokenOut>("/auth/token", body);
  return data;
}

/** GET /workspaces */
export async function getWorkspaces(): Promise<Workspace[]> {
  const { data } = await api.get<Workspace[]>("/workspaces");
  return data;
}

/** GET /accounts (requires X-Workspace-Id header) */
export async function getAccounts(): Promise<AdAccount[]> {
  const { data } = await api.get<AdAccount[]>("/accounts");
  return data;
}

/** POST /accounts */
export async function connectAccount(body: AccountCreate): Promise<AdAccount> {
  const { data } = await api.post<AdAccount>("/accounts", body);
  return data;
}

/** GET /reconcile (workspace_id via query param or X-Workspace-Id header) */
export async function getReconcile(workspaceId?: number): Promise<ReconcileResult> {
  const { data } = await api.get<ReconcileResult>("/reconcile", {
    ...(workspaceId !== undefined ? { params: { workspace_id: workspaceId } } : {}),
  });
  return data;
}

/** GET /attribution (agent 19's endpoint; requires X-Workspace-Id header) */
export async function getAttribution(): Promise<Record<string, unknown>> {
  const { data } = await api.get<Record<string, unknown>>("/attribution");
  return data;
}

/** GET /briefing */
export async function getBriefing(): Promise<Briefing> {
  const { data } = await api.get<Briefing>("/briefing");
  return data;
}

/** GET /recommendations */
export async function getRecommendations(): Promise<Recommendation[]> {
  const { data } = await api.get<Recommendation[]>("/recommendations");
  return data;
}

/** POST /recommendations/generate — runs reconcile→attribute→recommend, persists rows */
export async function generateRecommendations(): Promise<Recommendation[]> {
  const { data } = await api.post<Recommendation[]>("/recommendations/generate");
  return data;
}

/** POST /recommendations/{id}/approve — policy-gated; returns DecisionResult */
export async function approveRecommendation(
  id: number,
  body?: DecisionRequest
): Promise<DecisionResult> {
  const { data } = await api.post<DecisionResult>(
    `/recommendations/${id}/approve`,
    body ?? {}
  );
  return data;
}

/** POST /recommendations/{id}/reject */
export async function rejectRecommendation(
  id: number,
  body?: DecisionRequest
): Promise<DecisionResult> {
  const { data } = await api.post<DecisionResult>(
    `/recommendations/${id}/reject`,
    body ?? {}
  );
  return data;
}

/** GET /experiments */
export async function getExperiments(): Promise<Experiment[]> {
  const { data } = await api.get<Experiment[]>("/experiments");
  return data;
}

/** POST /experiments */
export async function createExperiment(body: ExperimentCreate): Promise<Experiment> {
  const { data } = await api.post<Experiment>("/experiments", body);
  return data;
}

/** GET /outcomes */
export async function getOutcomes(): Promise<Outcome[]> {
  const { data } = await api.get<Outcome[]>("/outcomes");
  return data;
}

/** GET /agents */
export async function getAgents(): Promise<ConnectedAgent[]> {
  const { data } = await api.get<ConnectedAgent[]>("/agents");
  return data;
}

/** POST /agents */
export async function registerAgent(body: AgentCreate): Promise<ConnectedAgent> {
  const { data } = await api.post<ConnectedAgent>("/agents", body);
  return data;
}

/** POST /agents/{id}/dispatch */
export async function dispatchAgent(
  id: number,
  payload: Record<string, unknown> = {}
): Promise<ConnectedAgent> {
  const { data } = await api.post<ConnectedAgent>(
    `/agents/${id}/dispatch`,
    payload
  );
  return data;
}

// ---- MCP servers ----

export interface MCPServer {
  id: number;
  workspace_id: number;
  name: string;
  transport: "http" | "sse" | "stdio";
  endpoint: string | null;
  enabled: boolean;
  status: string;
  config_json: Record<string, unknown> | null;
  last_checked_at: string | null;
}

export interface MCPServerCreate {
  name: string;
  transport: "http" | "sse" | "stdio";
  endpoint?: string | null;
  enabled?: boolean;
  config_json?: Record<string, unknown> | null;
}

/** GET /mcp */
export async function getMcpServers(): Promise<MCPServer[]> {
  const { data } = await api.get<MCPServer[]>("/mcp");
  return data;
}

/** POST /mcp */
export async function registerMcpServer(
  body: MCPServerCreate
): Promise<MCPServer> {
  const { data } = await api.post<MCPServer>("/mcp", body);
  return data;
}

/** POST /mcp/{id}/toggle */
export async function toggleMcpServer(id: number): Promise<MCPServer> {
  const { data } = await api.post<MCPServer>(`/mcp/${id}/toggle`);
  return data;
}

// ---- External integrations ----

export type IntegrationProvider =
  | "google_ads"
  | "meta_ads"
  | "shopify"
  | "stripe"
  | "slack"
  | "linear"
  | "github"
  | "notion";

export type IntegrationCategory = "ads" | "analytics" | "crm" | "creative";

/** IntegrationCreate */
export interface IntegrationCreate {
  name: string;
  provider: IntegrationProvider;
  category: IntegrationCategory;
  endpoint?: string | null;
  api_key?: string | null;
  config_json?: Record<string, unknown> | null;
}

/** IntegrationOut */
export interface Integration {
  id: number;
  workspace_id: number;
  name: string;
  category: IntegrationCategory;
  provider: string;
  endpoint: string | null;
  api_key_encrypted: string | null;
  enabled: boolean;
  status: string;
  config_json: Record<string, unknown> | null;
  last_checked_at: string | null;
}

/** GET /integrations */
export async function getIntegrations(): Promise<Integration[]> {
  const { data } = await api.get<Integration[]>("/integrations");
  return data;
}

/** POST /integrations */
export async function registerIntegration(
  body: IntegrationCreate
): Promise<Integration> {
  const { data } = await api.post<Integration>("/integrations", body);
  return data;
}

/** POST /integrations/{id}/toggle */
export async function toggleIntegration(id: number): Promise<Integration> {
  const { data } = await api.post<Integration>(`/integrations/${id}/toggle`);
  return data;
}

/** GET /health */
export async function getHealth(): Promise<{ status: string }> {
  const { data } = await api.get<{ status: string }>("/health");
  return data;
}

// ---- Command Center ----

/** GET /pipeline reconcile_summary */
export interface ReconcileSummary {
  spend: number;
  claimed: number;
  actual: number;
  over_count_pct: number;
  mer: number;
}

/** name + status pair for agents / MCP servers / integrations */
export interface StatusEntry {
  name: string;
  status: string;
}

/** Recommendation summary row inside PipelineResult */
export interface PipelineRecommendation {
  id: number | null;
  type: string;
  reason: string;
  expected_impact?: string | null;
  confidence?: number | null;
  risk?: Risk;
  status: string;
}

/** PipelineResult — GET /pipeline */
export interface PipelineResult {
  reconcile_summary: ReconcileSummary;
  recommendations: PipelineRecommendation[];
  agents_status: StatusEntry[];
  mcp_servers: StatusEntry[];
  integrations: StatusEntry[];
  pipeline_run_at: string;
}

/** ToolCall — POST /tools/call */
export interface ToolCall {
  tool: string;
  status: "ok" | "error" | string;
  params_echo: Record<string, unknown>;
  result: unknown;
  called_at: string;
}

/** DispatchResult — POST /agents/dispatch-all */
export interface DispatchResult {
  dispatched_agents: string[];
  count: number;
  called_at: string;
}

/** GET /pipeline — run the full reconcile -> analysis -> recommend pipeline */
export async function runPipeline(): Promise<PipelineResult> {
  const { data } = await api.get<PipelineResult>("/pipeline");
  return data;
}

/** POST /tools/call */
export async function callTool(
  tool_name: string,
  params: Record<string, unknown> = {}
): Promise<ToolCall> {
  const { data } = await api.post<ToolCall>("/tools/call", { tool_name, params });
  return data;
}

/** POST /agents/dispatch-all */
export async function dispatchAllAgents(): Promise<DispatchResult> {
  const { data } = await api.post<DispatchResult>("/agents/dispatch-all");
  return data;
}

// ---- Unified measurement: iROAS / incrementality / optimizer / creatives ----

/** Platform ids supported across ad channels (13 total). */
export type AdChannel =
  | "google"
  | "meta"
  | "shopify"
  | "tiktok"
  | "linkedin"
  | "pinterest"
  | "snapchat"
  | "amazon"
  | "reddit"
  | "twitter"
  | "youtube"
  | "amazon_ads"
  | "x_ads";

export type TestType = "geo_holdout" | "conversion_lift" | "ab";
export type TestStatus = "draft" | "running" | "completed";

/** GET /iroas */
export interface IroasRow {
  platform: string;
  reported_roas: number;
  iroas: number;
  calibration: number;
}

export async function getIroas(): Promise<IroasRow[]> {
  const { data } = await api.get<IroasRow[]>("/iroas");
  return data;
}

/** GET /creatives */
export interface CreativePerformance {
  id: number;
  workspace_id: number;
  platform: string;
  creative_id: string;
  impressions: number;
  spend: number;
  conversions: number;
  fatigue_score: number;
  hook_rate: number;
}

export async function getCreatives(): Promise<CreativePerformance[]> {
  const { data } = await api.get<CreativePerformance[]>("/creatives");
  return data;
}

/** GET /anomalies */
export interface Anomaly {
  platform: string;
  metric: string;
  severity: string;
  detected_at: string;
  detail: string;
}

export async function getAnomalies(): Promise<Anomaly[]> {
  const { data } = await api.get<Anomaly[]>("/anomalies");
  return data;
}

/** POST /optimizer/reallocate */
export interface OptimizerPlanRow {
  platform: string;
  current_spend: number;
  recommended_spend: number;
  delta: number;
  expected_iroas: number;
}

export interface OptimizerPlan {
  total_current_spend: number;
  total_recommended_spend: number;
  plan: OptimizerPlanRow[];
}

export async function postReallocate(): Promise<OptimizerPlan> {
  const { data } = await api.post<OptimizerPlan>("/optimizer/reallocate");
  return data;
}

/** IncrementalityTestOut */
export interface IncrementalityTest {
  id: number;
  workspace_id: number;
  platform: string;
  test_type: TestType;
  status: TestStatus;
  markets_treated: string[] | null;
  markets_control: string[] | null;
  spend_treated: number;
  spend_control: number;
  conversions_treated: number;
  conversions_control: number;
  lift_pct: number | null;
  started_at: string | null;
  completed_at: string | null;
}

/** POST /incrementality body */
export interface IncrementalityCreate {
  platform: AdChannel;
  test_type?: TestType;
  markets_treated?: string[];
  markets_control?: string[];
  spend_treated?: number;
  spend_control?: number;
  conversions_treated?: number;
  conversions_control?: number;
}

/** GET /incrementality */
export async function getIncrementalityTests(): Promise<IncrementalityTest[]> {
  const { data } = await api.get<IncrementalityTest[]>("/incrementality");
  return data;
}

/** POST /incrementality */
export async function createIncrementalityTest(
  body: IncrementalityCreate
): Promise<IncrementalityTest> {
  const { data } = await api.post<IncrementalityTest>("/incrementality", body);
  return data;
}

/** POST /incrementality/{id}/run */
export async function runIncrementalityTest(id: number): Promise<IncrementalityTest> {
  const { data } = await api.post<IncrementalityTest>(`/incrementality/${id}/run`);
  return data;
}

/** POST /incrementality/{id}/complete */
export async function completeIncrementalityTest(
  id: number
): Promise<IncrementalityTest> {
  const { data } = await api.post<IncrementalityTest>(`/incrementality/${id}/complete`);
  return data;
}
