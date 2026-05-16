
import React, {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from "react";
import {
  AgentState, PoolData, Position, Opportunity, AgentFeedEvent,
  MarketOpportunitySummary, RiskGate, AgentSettings,
} from "../types";
import {
  mockAgentState, mockMainPool, mockPositions, mockOpportunities,
  mockOpportunitySummary, mockRiskGates, mockAgentFeed, mockSettings,
  tick, generateChartData, mockClaudeAnalysis, mockKiteExecute, mockAttest,
} from "../lib/mockData";

Interface AgentContextValue {

  agentState: AgentState;
  mainPool: PoolData;
  positions: Position[];
  opportunities: Opportunity[];
  opportunitySummary: MarketOpportunitySummary;
  riskGates: RiskGate[];
  agentFeed: AgentFeedEvent[];
  settings: AgentSettings;
  walletConnected: boolean;
  walletAddress: string;

  toggleAgent: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  executeOpportunity: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<AgentSettings>) => void;
  askClaude: (prompt: string) => Promise<string>;

  isExecuting: string | null;

}

const AgentContext = createContext<AgentContextValue | null>(null);

// ---- Provider ------------------------------------------------

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agentState, setAgentState] = useState<AgentState>(mockAgentState);
  const [mainPool, setMainPool] = useState<PoolData>(mockMainPool);
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [opportunities] = useState<Opportunity[]>(mockOpportunities);
  const [opportunitySummary] = useState<MarketOpportunitySummary>(mockOpportunitySummary);
  const [riskGates] = useState<RiskGate[]>(mockRiskGates);
  const [agentFeed, setAgentFeed] = useState<AgentFeedEvent[]>(mockAgentFeed);
  const [settings, setSettings] = useState<AgentSettings>(mockSettings);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const cycleRef = useRef<number>(0);

  // -- Live ticking: price/pnl updates every 2s ---------------
  useEffect(() => {
    if (agentState.status !== "active") return;

    const priceInterval = setInterval(() => {
      setMainPool((prev) => ({
        ...prev,
        price: parseFloat(tick(prev.price, 0.002).toFixed(2)),
        chartData: [
          ...prev.chartData.slice(1),
          {
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            value: parseFloat(tick(prev.price, 0.002).toFixed(2)),
            volume: parseFloat((Math.random() * 2_000_000 + 500_000).toFixed(0)),
          },
        ],
      }));

      setPositions((prev) =>
        prev.map((p) => {
          const newPrice = tick(p.currentPrice, 0.0015);
          const diff = newPrice - p.entryPrice;
          const newPnl = diff * (p.sizeUSD / p.entryPrice);
          return {
            ...p,
            currentPrice: parseFloat(newPrice.toFixed(2)),
            pnl: parseFloat(newPnl.toFixed(2)),
            pnlPct: parseFloat(((newPnl / p.sizeUSD) * 100).toFixed(2)),
          };
        })
      );
    }, 2_000);

    return () => clearInterval(priceInterval);
  }, [agentState.status]);

  //Agent cycle: new feed events every 30s 
  useEffect(() => {
    if (agentState.status !== "active") return;

    const cycleInterval = setInterval(async () => {
      cycleRef.current += 1;

      // Simulate gas fluctuation
      setAgentState((prev) => ({
        ...prev,
        gasPrice: randInt(8, 22),
        networkLatency: randInt(1, 5),
        cycleCount: prev.cycleCount + 1,
        lastCycleAt: new Date(),
      }));

      // Add a new feed event
      const eventTypes: Array<AgentFeedEvent["type"]> = ["trade", "reasoning", "attestation", "info"];
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const messages: Record<typeof type, string[]> = {
        trade: [
          "Rebalanced wETH/stETH ratio on Lido Finance v2.",
          "Entered USDC/DAI Curve 3Pool position. Size: $12,400.",
          "Partially exited ARB/GMX LP. Locked gains: +$840.",
        ],
        reasoning: [
          "Macro sentiment shifted to neutral-bullish 0.67. Increasing risk budget by 8%.",
          "Funding rate divergence on Binance/Bybit detected. Delta-neutral opportunity flagged.",
          "Bayesian update: 3 new nodes ingested. Confidence in ETH range: 93.1%.",
        ],
        attestation: [
          "Proof-of-Logic submitted to Kite Registry. Block: 19,452,210.",
          "EigenLayer AVS attestation verified. Decision hash locked.",
        ],
        info: [
          "System health check passed. All 12 nodes online.",
          "Gas auto-batching triggered. Saved 0.003 ETH in fees.",
        ],
      };
      const pool = messages[type];
      const message = pool[Math.floor(Math.random() * pool.length)];

      const newEvent: AgentFeedEvent = {
        id: Math.random().toString(36).slice(2),
        type,
        title: type === "trade" ? "Trade Execution"
          : type === "reasoning" ? "Claude Reasoning"
          : type === "attestation" ? "Attestation"
          : "System Info",
        message,
        timestamp: new Date(),
        verified: type === "attestation",
        txHash: type === "trade" ? `0x${Math.random().toString(16).slice(2, 8)}…${Math.random().toString(16).slice(2, 6)}` : undefined,
      };

      setAgentFeed((prev) => [newEvent, ...prev].slice(0, 50));
    }, 30_000);

    return () => clearInterval(cycleInterval);
  }, [agentState.status]);



  const toggleAgent = useCallback(() => {
    setAgentState((prev) => ({
      ...prev,
      status: prev.status === "active" ? "paused" : "active",
    }));
  }, []);

  const connectWallet = useCallback(async () => {
    // TODO: integrate wagmi / ethers.js wallet connection
    await new Promise((r) => setTimeout(r, 800));
    setWalletConnected(true);
    setWalletAddress("0x4a3B…8f21");
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress("");
  }, []);

  const executeOpportunity = useCallback(async (id: string) => {
    setIsExecuting(id);
    try {
      const opp = opportunities.find((o) => o.id === id);
      if (!opp) return;

      // 1. Ask Claude for final confirmation
      await mockClaudeAnalysis(`Execute ${opp.action} on ${opp.marketPair}`);

      // 2. Execute via Kite AA SDK
      const tx = await mockKiteExecute(`${opp.action}:${opp.marketPair}`);

      // 3. Attest the decision
      const attestation = await mockAttest(tx.hash);

      // 4. Add to feed
      const feedEvent: AgentFeedEvent = {
        id: Math.random().toString(36).slice(2),
        type: "trade",
        title: "Manual Execution",
        message: `${opp.action} ${opp.marketPair} — ${opp.evLabel}. Tx: ${tx.hash}`,
        timestamp: new Date(),
        txHash: tx.hash,
        verified: attestation.verified,
      };
      setAgentFeed((prev) => [feedEvent, ...prev]);
    } finally {
      setIsExecuting(null);
    }
  }, [opportunities]);

  const askClaude = useCallback(async (prompt: string): Promise<string> => {
    return mockClaudeAnalysis(prompt);
  }, []);

  const updateSettings = useCallback((partial: Partial<AgentSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AgentContext.Provider
      value={{
        agentState, mainPool, positions, opportunities, opportunitySummary,
        riskGates, agentFeed, settings, walletConnected, walletAddress,
        toggleAgent, connectWallet, disconnectWallet, executeOpportunity,
        updateSettings, askClaude, isExecuting,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

// ---- Hook ----------------------------------------------------

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}