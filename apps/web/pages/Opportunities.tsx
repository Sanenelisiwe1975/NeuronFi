import { useState } from "react";
import { Brain, Play, ChevronRight, Shield, Zap, Info } from "lucide-react";
import { useAgent } from "../context/AgentContext";
import { Card, CardHeader, Badge, Button, RiskBar } from "../components/ui";
import { formatUSD, formatPct, cn } from "../lib/utils";
import { Opportunity, OpportunityAction } from "../types";

export function Opportunities() {
  const { opportunities, opportunitySummary, riskGates, isExecuting, executeOpportunity } = useAgent();
  const [expandedLogic, setExpandedLogic] = useState<string | null>(null);

  const actionVariant = (action: OpportunityAction): "active" | "error" | "warning" | "neutral" => {
    if (action === "Enter") return "active";
    if (action === "Exit") return "error";
    if (action === "Rebalance") return "warning";
    return "neutral";
  };

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">
            Market Opportunities
          </h1>
          <p className="text-xs text-muted mt-0.5">
            AI-curated liquidity paths with prioritized expected value (EV).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] text-muted uppercase font-mono tracking-wider">Global Risk Gate</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--cyan)] rounded-full"
                  style={{ width: `${opportunitySummary.globalRiskGate * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--text-primary)]">
                {opportunitySummary.globalRiskGate.toFixed(2)} / 1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Main layout ------------------------------------- */}
      <div className="grid grid-cols-3 gap-4">
        {/* Opportunities list — 2 cols */}
        <div className="col-span-2 space-y-3">
          {/* Neural Reasoning Summary */}
          <Card className="border-l-2 border-l-[var(--cyan)]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--cyan)]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Brain size={16} className="text-[var(--cyan)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                    Neural Reasoning Summary
                  </h3>
                  <div className="live-dot" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Market volatility in the ETH/LST sector has created a temporal divergence in lending rates. My analysis suggests a{" "}
                  <span className="text-[var(--cyan)] font-semibold">
                    {formatPct(opportunitySummary.capitalEfficiencyGain)} increase
                  </span>{" "}
                  in capital efficiency by rotating idle USDC into the new Frax Ether v3 vaults. Macro sentiment indicators are trending towards{" "}
                  <span className="text-[var(--text-primary)]">{opportunitySummary.macroSentiment}</span>, justifying a moderate risk exposure increase in automated delta-neutral strategies.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
                    <span className="text-[10px] text-muted font-mono">
                      Confidence {opportunitySummary.confidencePct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
                    <span className="text-[10px] text-muted font-mono">
                      Data Sources {opportunitySummary.dataSources} Nodes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Opportunities table */}
          <Card noPad>
            <div className="p-4 pb-0">
              <CardHeader title="Ranked Opportunities" />
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-mono text-muted uppercase tracking-wider border-b border-[var(--border)]">
              <div className="col-span-4">Market Pair</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-2">Risk Score</div>
              <div className="col-span-2">Exp. Value (EV)</div>
              <div className="col-span-2 text-right">Logic</div>
            </div>

            <div className="divide-y divide-[var(--border)]/50">
              {opportunities.map((opp) => (
                <OpportunityRow
                  key={opp.id}
                  opp={opp}
                  actionVariant={actionVariant}
                  expanded={expandedLogic === opp.id}
                  onToggleLogic={() => setExpandedLogic(expandedLogic === opp.id ? null : opp.id)}
                  onExecute={() => executeOpportunity(opp.id)}
                  isExecuting={isExecuting === opp.id}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-3">
          {/* Aggregate EV */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-navy-700 to-navy-800 border border-[var(--border)]">
            <p className="text-[9px] text-muted uppercase font-mono tracking-wider mb-1">Aggregate EV</p>
            <p className="text-3xl font-display font-bold text-gradient-cyan">
              {formatUSD(opportunitySummary.aggregateEV)}
            </p>
            <p className="text-[10px] text-muted mt-1 leading-relaxed">
              Expected monthly yield from top 5 suggested actions.
            </p>
            <Button variant="primary" size="sm" className="w-full justify-center mt-4" icon={<Play size={12} />}>
              Execute All Primary Actions
            </Button>
          </div>

          <Card>
            <CardHeader title="Live Risk Gates" icon={<Shield size={14} />} />
            <div className="space-y-4">
              {riskGates.map((gate) => (
                <div key={gate.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted uppercase font-mono tracking-wider">{gate.label}</p>
                    <div className="flex items-center gap-2">
                      {gate.extra && (
                        <span className="text-[9px] font-mono text-[var(--cyan)]">{gate.extra}</span>
                      )}
                      <span className={cn(
                        "text-xs font-display font-bold",
                        gate.rating === "High" || gate.rating === "Safe" ? "text-profit" : "text-warning"
                      )}>
                        {gate.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          gate.status === "ok" ? "bg-gradient-to-r from-[var(--cyan)] to-[var(--teal)]" : "bg-warning"
                        )}
                        style={{ width: `${(gate.value / gate.maxValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted w-12 text-right">
                      {gate.value} / {gate.maxValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Claude AI insight */}
          <Card className="bg-purple-900/10 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Brain size={12} className="text-purple-400" />
              </div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Claude AI</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Consensus across 18 data nodes suggests the wETH/stETH rebalance has the highest risk-adjusted return this cycle. Executing within the next 15 min optimizes the fee window.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-component -------------------------------------------

function OpportunityRow({
  opp, actionVariant, expanded, onToggleLogic, onExecute, isExecuting,
}: {
  opp: Opportunity;
  actionVariant: (a: OpportunityAction) => "active" | "error" | "warning" | "neutral";
  expanded: boolean;
  onToggleLogic: () => void;
  onExecute: () => void;
  isExecuting: boolean;
}) {
  const isPos = opp.expectedValue >= 0;

  return (
    <>
      <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-navy-700/20 transition-colors">
        {/* Market pair */}
        <div className="col-span-4 flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-navy-800 flex items-center justify-center text-[8px] font-bold">
              {opp.marketPair[0]}
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-green-600 border border-navy-800 flex items-center justify-center text-[8px] font-bold">
              {opp.marketPair.split("/")[1]?.[0] ?? "?"}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{opp.marketPair}</p>
            <p className="text-[10px] text-muted">{opp.protocol}</p>
          </div>
        </div>

        {/* Action */}
        <div className="col-span-2">
          <Badge variant={actionVariant(opp.action)} className="text-[9px]">{opp.action}</Badge>
        </div>

        {/* Risk score */}
        <div className="col-span-2">
          <RiskBar value={opp.riskScore} showValue />
        </div>

        {/* EV */}
        <div className="col-span-2">
          <p className={cn("text-xs font-mono font-semibold", isPos ? "text-profit" : "text-loss")}>
            {opp.evLabel}
          </p>
          <p className="text-[10px] text-muted font-mono">
            {isPos ? "+" : ""}{formatPct(opp.apyPct, false)} APY
          </p>
        </div>

        {/* Logic + Execute */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          <button
            onClick={onToggleLogic}
            className="text-[10px] text-[var(--cyan)] hover:underline font-mono flex items-center gap-1"
          >
            View Logic <ChevronRight size={10} className={cn("transition-transform", expanded && "rotate-90")} />
          </button>
          <Button
            variant="primary"
            size="sm"
            className="text-[9px] px-2 py-1"
            loading={isExecuting}
            onClick={onExecute}
            icon={<Zap size={10} />}
          >
            Run
          </Button>
        </div>
      </div>

      {/* Expanded logic */}
      {expanded && (
        <div className="px-4 pb-3 border-b border-[var(--border)] bg-navy-800/30">
          <div className="p-3 rounded-lg bg-navy-950/60 border border-[var(--border)]">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={10} className="text-[var(--cyan)]" />
              <span className="text-[9px] font-mono text-[var(--cyan)] uppercase tracking-wider">Agent Logic</span>
              <span className="ml-auto text-[9px] font-mono text-muted">
                Confidence: {opp.confidence}% · {opp.dataNodes} nodes
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{opp.logicSummary}</p>
          </div>
        </div>
      )}
    </>
  );
}
