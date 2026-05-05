// ============================================================
// Mock data layer — replace with real blockchain/API calls
// for production. All generators are pure functions to ensure
// deterministic seeding and easy testing.
// ============================================================

import {
  AgentState, PoolData, Position, Opportunity, AgentFeedEvent,
  MarketOpportunitySummary, RiskGate, BayesianPoint, SuccessAnalytics,
  SystemMetric, PersistenceLog, MarketResolution, AgentSettings,
  ChartPoint,
} from "../types";

//Helpers

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Generate a wave-like price chart
export function generateChartData(
  baseValue: number,
  points = 60,
  volatility = 0.03
): ChartPoint[] {
  let val = baseValue;
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    val = val * (1 + (Math.random() - 0.5) * volatility);
    const t = new Date(now - (points - i) * 60_000);
    return {
      time: t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: parseFloat(val.toFixed(2)),
      volume: parseFloat(rand(500_000, 3_000_000).toFixed(0)),
    };
  });
}

// Agent State 

export const mockAgentState: AgentState = {
  version: "2.4",
  status: "active",
  usdcBalance: 124_500,
  gasPrice: 12,
  networkLatency: 2,
  streamConnected: true,
  cycleCount: 1_847,
  lastCycleAt: new Date(),
};

//  Pool Data 

export const mockMainPool: PoolData = {
  id: "eth-usdc-uni-v3",
  name: "ETH / USDC",
  protocol: "Uniswap V3",
  tier: "0.05%",
  price: 2412.84,
  change24h: 2.4,
  liquidity: 42_800_000,
  volume24h: 12_400_000,
  fees24h: 6_210,
  utilization: 18.4,
  chartData: generateChartData(2412.84, 80, 0.025),
};

//  Positions -----------------------------------------

export const mockPositions: Position[] = [
  {
    id: "pos-001",
    market: "BTC/USDC",
    protocol: "Spot",
    side: "Long",
    sizeUSD: 45_000,
    entryPrice: 64_231.50,
    currentPrice: 67_500,
    pnl: 4210.12,
    pnlPct: 5.2,
    riskScore: 0.12,
    feeLockStatus: "committed",
    feeLockPct: 2.1,
    openedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    leverage: 2.5,
    margin: 32_040,
    stopLoss: 61_980,
    takeProfit: 68_500,
    entryRationale:
      "Detected a persistent divergence between Spot and Futures funding rates on Kraken. Whale movement (0x4f…ae) indicates accumulation in the $63k–$64k range. Risk engine permits a 2.5x leverage entry with a 3.5% trailing stop-loss.",
  },
  {
    id: "pos-002",
    market: "ETH",
    protocol: "Deribit",
    side: "Straddle",
    sizeUSD: 28_000,
    entryPrice: 3450,
    currentPrice: 3210,
    pnl: -1120.40,
    pnlPct: -0.8,
    riskScore: 0.54,
    feeLockStatus: "drawdown",
    feeLockPct: 1.8,
    openedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "pos-003",
    market: "SOL/USDC",
    protocol: "Jupiter",
    side: "Perp",
    sizeUSD: 14_200,
    entryPrice: 142.17,
    currentPrice: 148.40,
    pnl: 842.15,
    pnlPct: 3.1,
    riskScore: 0.22,
    feeLockStatus: "committed",
    feeLockPct: 1.5,
    openedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "pos-004",
    market: "WETH/USDC",
    protocol: "Uniswap V3",
    side: "LP",
    sizeUSD: 45_200,
    entryPrice: 2384.10,
    currentPrice: 2412.84,
    pnl: 1120.45,
    pnlPct: 2.8,
    riskScore: 0.09,
    feeLockStatus: "committed",
    feeLockPct: 2.1,
    openedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "pos-005",
    market: "ARB/USDC",
    protocol: "GMX V2",
    side: "Long",
    sizeUSD: 28_000,
    entryPrice: 1.82,
    currentPrice: 1.67,
    pnl: -430.12,
    pnlPct: -1.9,
    riskScore: 0.67,
    feeLockStatus: "pending",
    feeLockPct: 1.2,
    openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Opportunities 

export const mockOpportunitySummary: MarketOpportunitySummary = {
  globalRiskGate: 0.42,
  aggregateEV: 12492.50,
  neuralReasoning:
    "Market volatility in the ETH/LST sector has created a temporal divergence in lending rates. My analysis suggests a 14.2% increase in capital efficiency by rotating idle USDC into the new Frax Ether v3 vaults. Macro sentiment indicators are trending towards 0.65 neutral-bullish, justifying a moderate risk exposure increase in automated delta-neutral strategies.",
  capitalEfficiencyGain: 14.2,
  macroSentiment: "Neutral-Bullish (0.65)",
  confidencePct: 94.2,
  dataSources: 18,
};

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-001",
    rank: 1,
    marketPair: "wETH / stETH",
    protocol: "Lido Finance v2",
    action: "Rebalance",
    riskScore: 0.12,
    expectedValue: 3420,
    apyPct: 12.4,
    evLabel: "+$3,420",
    logicSummary: "Low-risk LST arbitrage with tight spread. Auto-compounding enabled.",
    confidence: 96.1,
    dataNodes: 14,
  },
  {
    id: "opp-002",
    rank: 2,
    marketPair: "USDC / DAI",
    protocol: "Curve 3Pool",
    action: "Enter",
    riskScore: 0.04,
    expectedValue: 1890,
    apyPct: 15.2,
    evLabel: "+$1,890",
    logicSummary: "Stablecoin pool imbalance creating 0.12% arb. Near-zero impermanent loss.",
    confidence: 99.1,
    dataNodes: 22,
  },
  {
    id: "opp-003",
    rank: 3,
    marketPair: "SOL / jitoSOL",
    protocol: "Jupiter Aggregator",
    action: "Exit",
    riskScore: 0.78,
    expectedValue: -450,
    apyPct: -2.1,
    evLabel: "-$450",
    logicSummary: "Elevated JitoSOL redemption queue. Exit risk mitigation recommended.",
    confidence: 82.4,
    dataNodes: 9,
  },
  {
    id: "opp-004",
    rank: 4,
    marketPair: "ARB / GMX",
    protocol: "GMX V2 LP",
    action: "Enter",
    riskScore: 0.31,
    expectedValue: 2110,
    apyPct: 24.1,
    evLabel: "+$2,110",
    logicSummary: "ARB/GMX funding rate positive. LP fees at 90-day high. Moderate-risk entry.",
    confidence: 88.7,
    dataNodes: 16,
  },
  {
    id: "opp-005",
    rank: 5,
    marketPair: "LDO / ETH",
    protocol: "Aave v3",
    action: "Enter",
    riskScore: 0.19,
    expectedValue: 1520,
    apyPct: 9.8,
    evLabel: "+$1,520",
    logicSummary: "LDO/ETH delta-neutral via Aave borrow. 4bps spread detected. High prob convergence.",
    confidence: 91.2,
    dataNodes: 20,
  },
];

// Risk Gates

export const mockRiskGates: RiskGate[] = [
  { name: "liquidity", label: "Liquidity Depth", value: 98.2, maxValue: 100, rating: "High", status: "ok" },
  { name: "volatility", label: "Volatility Hedge", value: 65.0, maxValue: 100, rating: "Mod", status: "ok" },
  { name: "smart-contract", label: "Smart Contract", value: 100, maxValue: 100, rating: "Safe", status: "ok", extra: "Audit ✓" },
];

// Agent Feed

export const mockAgentFeed: AgentFeedEvent[] = [
  {
    id: uid(),
    type: "trade",
    title: "Trade Execution",
    message: "Rebalanced ETH-USDC LP range to $2,350–$2,500.",
    timestamp: new Date(Date.now() - 30_000),
    txHash: "0x9a2…3f36",
    verified: true,
  },
  {
    id: uid(),
    type: "reasoning",
    title: "Reasoning",
    message: "Volatility index increasing. Shifting 15% of capital to low-leverage stable pools.",
    timestamp: new Date(Date.now() - 12 * 60_000),
  },
  {
    id: uid(),
    type: "attestation",
    title: "Attestation",
    message: "Proof-of-Logic generated via EigenLayer AVS. Verified.",
    timestamp: new Date(Date.now() - 12 * 60_000),
    verified: true,
  },
  {
    id: uid(),
    type: "trade",
    title: "Trade Execution",
    message: "Entered USDC/DAI Curve 3Pool position. Size: $18,500.",
    timestamp: new Date(Date.now() - 28 * 60_000),
    txHash: "0x7b1…af89",
    verified: true,
  },
  {
    id: uid(),
    type: "warning",
    title: "Risk Alert",
    message: "ARB/USDC position approaching stop-loss threshold. Monitoring.",
    timestamp: new Date(Date.now() - 45 * 60_000),
  },
  {
    id: uid(),
    type: "reasoning",
    title: "Claude Analysis",
    message: "Market correlation matrix updated. 14 new data nodes ingested. Bayesian prior shifted 0.04 towards risk-off.",
    timestamp: new Date(Date.now() - 68 * 60_000),
  },
];

// Market Resolutions

export const mockResolutions: MarketResolution[] = [
  {
    id: "res-001",
    market: "ARB/USDC Price Expiry",
    finalPrice: 1.142,
    currency: "CHAINLINK",
    resolutionBlock: 19_452_102,
    status: "resolved",
    attestation: "Kite: 0x8a2f…c92b",
    disputeWindow: "02h 45m 12s",
    agentRationale:
      "Position exited at T-minus 12 minutes to expiry. Liquidity depth on DEX aggregators showed a 0.4% slippage risk increasing. Volatility index signaled a local top; locking gains at $1.14 was mathematically optimal vs. the 0.02% delta improvement from holding to maturity.",
  },
  {
    id: "res-002",
    market: "LINK/USDC Delta-Neutral",
    finalPrice: 18.92,
    currency: "CHAINLINK",
    resolutionBlock: 19_451_980,
    status: "finalized",
    agentRationale: "Delta-neutral strategy closed at target. Full attestation verified.",
  },
];

//Bayesian / Analytics 

export const mockBayesian: BayesianPoint[] = [
  { label: "−3σ", value: 12 },
  { label: "−2σ", value: 28 },
  { label: "−1σ", value: 55 },
  { label: "0", value: 88 },
  { label: "+1σ", value: 100 },
  { label: "+2σ", value: 72 },
  { label: "+3σ", value: 40 },
  { label: "+4σ", value: 18 },
];

export const mockSuccessAnalytics: SuccessAnalytics = {
  accuracyRate: 0.82,
  predictedCount: 1240,
  realizedCount: 1018,
};

export const mockSystemMetrics: SystemMetric[] = [
  { id: "model-load", label: "Model Load", value: "14.2%", status: "ok" },
  { id: "db-health", label: "DB Health", value: "99.9%", status: "ok" },
  { id: "active-nodes", label: "Active Nodes", value: "12 / 12", status: "ok" },
  { id: "inference-time", label: "Inference Time", value: "22ms", status: "ok" },
];

export const mockPersistenceLogs: PersistenceLog[] = [
  { timestamp: "14:02:11", level: "INFO", message: "Committing Bayesian posterior to Postgres... SUCCESS." },
  { timestamp: "14:02:12", level: "INFO", message: "Invalidating Redis cache key: neuron_v2:inference:belief_state" },
  { timestamp: "14:02:15", level: "AGENT", message: "Strategy recalculated. Reason: Delta Neutrality deviation > 0.04%." },
  { timestamp: "14:02:18", level: "WARN", message: "RPC Latency spike detected on Arbitrum. Switching to fallback node." },
  { timestamp: "14:02:22", level: "INFO", message: "Persisting telemetry batch #8021 to deep storage..." },
  { timestamp: "14:02:25", level: "SUCCESS", message: "Persistence check passed. State consistency 1.000." },
  { timestamp: "14:01:58", level: "INFO", message: "Cycle #1847 initiated. Gas: 12 gwei. Slippage budget: 0.35%." },
  { timestamp: "14:01:44", level: "AGENT", message: "Claude AI analysis complete. Confidence: 94.2%. Action: Rebalance wETH/stETH." },
];

// Settings

export const mockSettings: AgentSettings = {
  apiKey: "sk-ant-api03-••••••••••••••••••••••••••••••••",
  kiteSDKEndpoint: "https://sdk.kite.ai/v2/aa",
  attestationRegistry: "0xKiteRegistryMainnet",
  notificationsEnabled: true,
  autoExecute: true,
  cycleIntervalSeconds: 30,
  riskParams: {
    maxSlippageTolerance: 0.035,
    confidenceThreshold: 0.854,
    maxPositionSize: 50_000,
    maxLeverage: 3,
    autoRebalance: true,
    emergencyStopEnabled: true,
  },
};

// Simulated live tick

/**
 * Returns a slightly modified version of a value to simulate
 * real-time price ticking. Use inside setInterval to animate.
 */
export function tick(val: number, volatility = 0.001): number {
  return val * (1 + (Math.random() - 0.5) * volatility);
}

// Mock Claude AI response

export async function mockClaudeAnalysis(prompt: string): Promise<string> {
  // In production this calls the Anthropic API with the Kite system prompt
  const responses = [
    `Analysis of ${prompt.slice(0, 30)}... I detect a 94.2% confidence signal. Market microstructure shows whale accumulation patterns in the $63k range. Recommend entering with 2.5x leverage and 3.5% trailing stop.`,
    `Bayesian update triggered by new data nodes. The ETH/LST sector divergence has widened to 14bps. Rotating 15% capital into Frax Ether v3 vaults will improve capital efficiency by 14.2%.`,
    `Risk assessment: Current portfolio delta is +0.32. To maintain delta-neutral positioning, suggest reducing ETH exposure by $8,200 and hedging via options on Deribit. Confidence: 91.8%.`,
  ];
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
  return responses[randInt(0, responses.length)];
}

// ---------- Mock Kite SDK transaction -------------------------

export async function mockKiteExecute(action: string): Promise<{ hash: string; confirmed: boolean }> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
  return {
    hash: `0x${Math.random().toString(16).slice(2, 10)}…${Math.random().toString(16).slice(2, 6)}`,
    confirmed: Math.random() > 0.05,
  };
}

// Mock attestation registry 

export async function mockAttest(decisionHash: string): Promise<{ attestationKey: string; verified: boolean }> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
  return {
    attestationKey: `Kite: 0x${decisionHash.slice(0, 4)}…${decisionHash.slice(-4)}`,
    verified: true,
  };
}
