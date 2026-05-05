export type AgentStatus = "active" | "paused" | "error" | "initializing";

export interface AgentState {
  version: string;
  status: AgentStatus;
  usdcBalance: number;
  gasPrice: number; // gwei
  networkLatency: number; // ms
  streamConnected: boolean;
  cycleCount: number;
  lastCycleAt: Date;
}

//Market / Pool 

export interface PoolData {
  id: string;
  name: string;          // e.g. "ETH / USDC"
  protocol: string;      // e.g. "Uniswap V3"
  tier: string;          // e.g. "0.05%"
  price: number;
  change24h: number;
  liquidity: number;
  volume24h: number;
  fees24h: number;
  utilization: number;
  chartData: ChartPoint[];
}

export interface ChartPoint {
  time: string;
  value: number;
  volume?: number;
}

// Positions 

export type PositionSide = "Long" | "Short" | "LP" | "Perp" | "Straddle" | "Delta-Neutral";
export type PositionStatus = "committed" | "pending" | "drawdown" | "closing";

export interface Position {
  id: string;
  market: string;
  protocol: string;
  side: PositionSide;
  sizeUSD: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
  riskScore: number;        // 0-1
  feeLockStatus: PositionStatus;
  feeLockPct: number;
  openedAt: Date;
  leverage?: number;
  margin?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryRationale?: string;
}

// Opportunities

export type OpportunityAction = "Enter" | "Exit" | "Rebalance" | "Hold";
export type RiskLevel = "low" | "medium" | "high";

export interface Opportunity {
  id: string;
  rank: number;
  marketPair: string;
  protocol: string;
  action: OpportunityAction;
  riskScore: number;
  expectedValue: number;
  apyPct: number;
  evLabel: string;          // e.g. "+$3,420"
  logicSummary: string;
  confidence: number;
  dataNodes: number;
}

export interface MarketOpportunitySummary {
  globalRiskGate: number;   // 0-1
  aggregateEV: number;
  neuralReasoning: string;
  capitalEfficiencyGain: number;
  macroSentiment: string;
  confidencePct: number;
  dataSources: number;
}

// Agent Feed / Logs

export type FeedEventType = "trade" | "reasoning" | "attestation" | "warning" | "info";

export interface AgentFeedEvent {
  id: string;
  type: FeedEventType;
  title: string;
  message: string;
  timestamp: Date;
  txHash?: string;
  verified?: boolean;
}

// Risk Gates 

export interface RiskGate {
  name: string;
  label: string;
  value: number;        // 0-100
  maxValue: number;
  rating: "High" | "Mod" | "Low" | "Safe";
  status: "ok" | "warning" | "error";
  extra?: string;       // e.g. "Audit ✓"
}

// Analytics / Logs 

export interface BayesianPoint {
  label: string;
  value: number;
}

export interface SuccessAnalytics {
  accuracyRate: number;
  predictedCount: number;
  realizedCount: number;
}

export interface SystemMetric {
  id: string;
  label: string;
  value: string;
  status: "ok" | "warning" | "error";
}

export interface PersistenceLog {
  timestamp: string;
  level: "INFO" | "AGENT" | "WARN" | "SUCCESS" | "ERROR";
  message: string;
}

// Resolution 

export type ResolutionStatus = "resolved" | "pending" | "disputed" | "finalized";

export interface MarketResolution {
  id: string;
  market: string;
  finalPrice: number;
  currency: string;
  resolutionBlock: number;
  status: ResolutionStatus;
  attestation?: string;
  disputeWindow?: string;
  agentRationale: string;
}

// Settings

export interface RiskParameters {
  maxSlippageTolerance: number;   // 0-1
  confidenceThreshold: number;    // 0-1
  maxPositionSize: number;        // USD
  maxLeverage: number;
  autoRebalance: boolean;
  emergencyStopEnabled: boolean;
}

export interface AgentSettings {
  apiKey: string;                 // Claude AI key (masked)
  kiteSDKEndpoint: string;
  attestationRegistry: string;
  riskParams: RiskParameters;
  notificationsEnabled: boolean;
  autoExecute: boolean;
  cycleIntervalSeconds: number;
}

// Claude AI Integration 

export interface ClaudeAnalysis {
  reasoning: string;
  confidence: number;
  recommendedAction: OpportunityAction;
  riskAssessment: string;
  expectedOutcome: string;
  timestamp: Date;
}

// Kite SDK Integration 

export interface KiteTransaction {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  gasUsed?: number;
  blockNumber?: number;
  timestamp: Date;
}

export interface KiteAttestationRecord {
  id: string;
  decisionHash: string;
  attestationKey: string;
  verifiedAt: Date;
  status: "verified" | "pending" | "disputed";
}
