import { ArrowUpRight, ArrowDownRight, Wifi, Fuel, Clock, Eye, Bot, Shield, ChevronRight, TrendingUp } from "lucide-react";
import { useAgent } from "../context/AgentContext";
import { Card, CardHeader, StatTile, Badge, Button, RiskBar } from "../components/ui";
import { PriceChart } from "../components/charts";
import { formatUSD, formatPct, formatGwei, timeAgo, riskColor, riskBarColor, cn } from "../lib/utils";
import { AgentFeedEvent, Opportunity, Position } from "../types";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { agentState, mainPool, positions, opportunities, agentFeed } = useAgent();
  const navigate = useNavigate();

  const totalPnL = positions.reduce((s, p) => s + p.pnl, 0);
  const totalSize = positions.reduce((s, p) => s + p.sizeUSD, 0);

  return (
    <div className="space-y-4 animate-in">
      <div className="grid grid-cols-4 gap-3">
        <Card className="col-span-1">
          <StatTile
            label="USDC Balance"
            value={formatUSD(agentState.usdcBalance)}
            icon={<span className="text-[10px] text-muted font-mono">USDC</span>}
          />
        </Card>
        <Card>
          <StatTile
            label="Gas Price"
            value={formatGwei(agentState.gasPrice)}
            icon={<Fuel size={12} className="text-[var(--cyan)]" />}
          />
        </Card>
        <Card>
          <StatTile
            label="Network Latency"
            value={`${agentState.networkLatency}s ago`}
            icon={<Clock size={12} className="text-teal" />}
          />
        </Card>
        <Card className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="text-xs text-[var(--text-secondary)] font-mono">Real-time Stream: Connected</span>
        </Card>
      </div>

      {/* ---- Main grid --------------------------------------- */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pool chart — 2 cols */}
        <div className="col-span-2 space-y-3">
          <Card noPad>
            {/* Chart header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border border-navy-800 flex items-center justify-center text-[8px] font-bold">E</div>
                  <div className="w-6 h-6 rounded-full bg-green-600 border border-navy-800 flex items-center justify-center text-[8px] font-bold">U</div>
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-[var(--text-primary)]">{mainPool.name}</p>
                  <p className="text-[10px] text-muted font-mono">{mainPool.protocol} Pool · {mainPool.tier} tier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-display font-bold text-[var(--text-primary)]">
                  {formatUSD(mainPool.price)}
                </p>
                <p className={cn("text-xs font-mono", mainPool.change24h >= 0 ? "text-profit" : "text-loss")}>
                  {mainPool.change24h >= 0 ? <ArrowUpRight size={10} className="inline" /> : <ArrowDownRight size={10} className="inline" />}
                  {formatPct(mainPool.change24h)} (24h)
                </p>
              </div>
            </div>

            <div className="px-2">
              <PriceChart data={mainPool.chartData} positive={mainPool.change24h >= 0} height={170} />
            </div>

            {/* Pool stats */}
            <div className="grid grid-cols-4 gap-0 border-t border-[var(--border)]">
              {[
                { label: "Liquidity", value: formatUSD(mainPool.liquidity, true) },
                { label: "Volume 24H", value: formatUSD(mainPool.volume24h, true) },
                { label: "Fees 24H", value: formatUSD(mainPool.fees24h) },
                { label: "Utilization", value: formatPct(mainPool.utilization, false) },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 text-center border-r border-[var(--border)] last:border-r-0">
                  <p className="text-[10px] text-muted uppercase tracking-wider font-mono">{label}</p>
                  <p className="text-sm font-display font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Active positions table */}
          <Card noPad>
            <div className="flex items-center justify-between p-4 pb-2">
              <CardHeader title="Active Positions" />
              <Button variant="ghost" size="sm" icon={<Eye size={12} />} onClick={() => navigate("/positions")}>
                View All
              </Button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Market / Protocol", "Size (USD)", "Entry Price", "PnL", "Risk Score"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-muted font-mono font-normal uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.slice(0, 3).map((pos) => (
                  <PositionRow key={pos.id} pos={pos} />
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-3">
          {/* AI Opportunities */}
          <Card noPad>
            <div className="p-4 pb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--cyan)]" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                AI Opportunities
              </h3>
            </div>
            <div className="space-y-2 p-3 pt-0">
              {opportunities.slice(0, 3).map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} onNavigate={() => navigate("/opportunities")} />
              ))}
            </div>
          </Card>

          {/* Agent Feed */}
          <Card noPad>
            <div className="p-4 pb-2 flex items-center gap-2">
              <Bot size={14} className="text-[var(--cyan)]" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Agent Feed
              </h3>
              <div className="live-dot ml-auto" />
            </div>
            <div className="space-y-0 divide-y divide-[var(--border)] max-h-[280px] overflow-y-auto">
              {agentFeed.slice(0, 5).map((event) => (
                <FeedItem key={event.id} event={event} />
              ))}
            </div>
          </Card>

          {/* Upgrade card */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-[var(--cyan)]/10 to-[var(--teal)]/5 border border-[var(--cyan)]/20">
            <Badge variant="neutral" className="mb-2 text-[9px]">New: Neuron AI v3.0</Badge>
            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              Upgrade your agent to unlock cross-chain flashloan arbitrage logic and institutional risk modeling.
            </p>
            <Button variant="primary" size="sm" className="w-full justify-center">
              Explore Roadmap <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ------------------------------------------

function PositionRow({ pos }: { pos: Position }) {
  const isProfit = pos.pnl >= 0;
  return (
    <tr className="border-b border-[var(--border)]/50 hover:bg-navy-700/20 transition-colors">
      <td className="px-4 py-3">
        <p className="font-mono text-[var(--text-primary)] font-medium">{pos.market}</p>
        <p className="text-muted text-[10px]">{pos.protocol} · {pos.side}</p>
      </td>
      <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{formatUSD(pos.sizeUSD)}</td>
      <td className="px-4 py-3 font-mono text-[var(--text-secondary)]">{formatUSD(pos.entryPrice)}</td>
      <td className="px-4 py-3">
        <span className={cn("font-mono font-semibold", isProfit ? "text-profit" : "text-loss")}>
          {isProfit ? "+" : ""}{formatUSD(pos.pnl)}
        </span>
      </td>
      <td className="px-4 py-3 w-32">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-navy-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", riskBarColor(pos.riskScore))}
              style={{ width: `${pos.riskScore * 100}%` }}
            />
          </div>
          <span className={cn("text-[10px] font-mono w-5", riskColor(pos.riskScore))}>
            {pos.riskScore.toFixed(2)}
          </span>
        </div>
      </td>
    </tr>
  );
}

function OpportunityCard({ opp, onNavigate }: { opp: Opportunity; onNavigate: () => void }) {
  const isPos = opp.expectedValue >= 0;
  return (
    <div className="p-3 rounded-lg bg-navy-800/50 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all">
      <div className="flex items-center justify-between mb-1">
        <Badge variant={isPos ? "active" : "error"} className="text-[9px]">
          EV {opp.evLabel}
        </Badge>
        <span className="text-[9px] text-muted font-mono">Rank #{opp.rank}</span>
      </div>
      <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
        {opp.marketPair} {opp.action === "Exit" ? "Delta Neutral" : ""}
      </p>
      <p className="text-[10px] text-muted line-clamp-2 mb-2">{opp.logicSummary}</p>
      <Button variant="outline" size="sm" className="w-full justify-center text-[10px]" onClick={onNavigate}>
        Review Strategy
      </Button>
    </div>
  );
}

function FeedItem({ event }: { event: AgentFeedEvent }) {
  const typeColors: Record<AgentFeedEvent["type"], string> = {
    trade: "bg-[var(--cyan)]",
    reasoning: "bg-purple-500",
    attestation: "bg-[var(--teal)]",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  };
  const typeLabels: Record<AgentFeedEvent["type"], string> = {
    trade: "Trade Execution",
    reasoning: "Reasoning",
    attestation: "Attestation",
    warning: "Warning",
    info: "Info",
  };

  return (
    <div className="p-3 hover:bg-navy-700/20 transition-colors">
      <div className="flex items-start gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", typeColors[event.type])} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn("text-[9px] font-mono uppercase tracking-wider font-semibold",
              event.type === "trade" ? "text-[var(--cyan)]"
              : event.type === "warning" ? "text-warning"
              : event.type === "attestation" ? "text-teal"
              : "text-purple-400"
            )}>
              {typeLabels[event.type]}
            </span>
            <span className="text-[9px] text-muted font-mono shrink-0">{timeAgo(event.timestamp)}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{event.message}</p>
          {event.txHash && (
            <p className="text-[9px] font-mono text-muted mt-0.5">Tx: {event.txHash}</p>
          )}
          {event.verified && (
            <div className="flex items-center gap-1 mt-0.5">
              <Shield size={9} className="text-teal" />
              <span className="text-[9px] text-teal font-mono">Verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
