import { useState } from "react";
import {
  X, ExternalLink, Shield, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Edit3, Zap,
} from "lucide-react";
import { useAgent } from "../context/AgentContext";
import { Card, CardHeader, Badge, Button, RiskBar } from "../components/ui";
import { formatUSD, formatPct, timeAgo, cn, riskColor, riskBarColor } from "../lib/utils";
import { Position, MarketResolution } from "../types";
import { mockResolutions } from "../lib/mockData";

export function Positions() {
  const { positions } = useAgent();
  const [selected, setSelected] = useState<Position | null>(positions[0]);

  const totalAttested = 4_502_912.45;
  const disputeRate = 0.02;

  return (
    <div className="space-y-4 animate-in">
      <div>
        <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">
          Active Positions &amp; Resolution
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Real-time monitoring of autonomous market interactions and cryptographic attestations.
        </p>
      </div>

      {/* ---- Open Positions + Drill-down -------------------- */}
      <div className="grid grid-cols-3 gap-4">
        {/* Positions table — 2 cols */}
        <div className="col-span-2">
          <Card noPad>
            <div className="flex items-center justify-between p-4 pb-2">
              <CardHeader title="Open Positions" />
              <Badge variant="neutral" dot>{positions.length} Active</Badge>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Asset / Market", "Position Size", "PnL (Unrealized)", "Fee Lock Status", ""].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-muted font-mono font-normal text-[10px] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <PositionDetailRow
                    key={pos.id}
                    pos={pos}
                    active={selected?.id === pos.id}
                    onClick={() => setSelected(pos)}
                  />
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Drill-down panel — 1 col */}
        <div>
          {selected ? (
            <DrillDown pos={selected} onClose={() => setSelected(null)} />
          ) : (
            <Card className="flex items-center justify-center h-full text-muted text-xs">
              Select a position to inspect
            </Card>
          )}
        </div>
      </div>

      {/* ---- Market Resolution Feed ------------------------- */}
      <Card noPad>
        <div className="p-4 pb-2">
          <CardHeader title="Market Resolution Feed" />
        </div>
        <div className="space-y-3 p-4 pt-0">
          {mockResolutions.map((res) => (
            <ResolutionItem key={res.id} resolution={res} />
          ))}
        </div>
      </Card>

      {/* ---- Footer stats ------------------------------------ */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--cyan)]/10 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-[var(--cyan)]" />
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider font-mono">Total Attested Value</p>
            <p className="text-sm font-display font-bold text-[var(--text-primary)]">{formatUSD(totalAttested)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider font-mono">Dispute Rate (90D)</p>
            <p className="text-sm font-display font-bold text-[var(--text-primary)]">{formatPct(disputeRate, false)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
            <Shield size={16} className="text-teal" />
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider font-mono">Kite Registry Status</p>
            <p className="text-sm font-display font-bold text-profit">Synced (14s ago)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Sub-components ------------------------------------------

function PositionDetailRow({
  pos, active, onClick,
}: {
  pos: Position;
  active: boolean;
  onClick: () => void;
}) {
  const isProfit = pos.pnl >= 0;
  const statusColors: Record<string, string> = {
    committed: "text-profit",
    pending: "text-warning",
    drawdown: "text-loss",
    closing: "text-muted",
  };

  return (
    <tr
      className={cn(
        "border-b border-[var(--border)]/50 cursor-pointer transition-colors",
        active ? "bg-[var(--cyan)]/5 border-l-2 border-l-[var(--cyan)]" : "hover:bg-navy-700/20"
      )}
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isProfit ? "bg-profit" : "bg-loss")} />
          <div>
            <p className="font-mono text-[var(--text-primary)] font-semibold">{pos.market}</p>
            <p className="text-muted text-[10px]">{pos.side} · Entry {formatUSD(pos.entryPrice)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-mono text-[var(--text-primary)]">{formatUSD(pos.sizeUSD)}</p>
        <p className="text-[10px] text-muted font-mono">{pos.protocol}</p>
      </td>
      <td className="px-4 py-3">
        <p className={cn("font-mono font-semibold", isProfit ? "text-profit" : "text-loss")}>
          {isProfit ? "+" : ""}{formatUSD(pos.pnl)}
        </p>
        <p className={cn("text-[10px] font-mono", isProfit ? "text-profit" : "text-loss")}>
          {formatPct(pos.pnlPct)}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Shield size={10} className={statusColors[pos.feeLockStatus]} />
          <span className={cn("text-[10px] font-mono capitalize", statusColors[pos.feeLockStatus])}>
            {pos.feeLockStatus} ({formatPct(pos.feeLockPct, false)})
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <button className="text-[10px] text-[var(--cyan)] hover:underline font-mono">Detail →</button>
      </td>
    </tr>
  );
}

function DrillDown({ pos, onClose }: { pos: Position; onClose: () => void }) {
  const isProfit = pos.pnl >= 0;

  return (
    <Card className="h-full flex flex-col gap-3 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isProfit ? "active" : "error"}>
            {pos.side} {pos.market}
          </Badge>
          <span className="text-[10px] text-muted font-mono">ID: N-{pos.id.slice(-5).toUpperCase()}</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-[var(--text-primary)] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-lg overflow-hidden bg-navy-950 border border-[var(--border)] h-28 relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[var(--cyan)] to-transparent" />
        <div className="flex items-center gap-2 z-10">
          <div className="live-dot" />
          <span className="text-[10px] font-mono text-[var(--cyan)]">LIVE CHART ACTIVE</span>
        </div>
        {/* Mini sparkline visual */}
        <div className="absolute bottom-2 left-2 right-2 h-8 opacity-40">
          <svg viewBox="0 0 200 32" preserveAspectRatio="none" className="w-full h-full">
            <polyline
              points="0,28 20,20 40,22 60,10 80,14 100,8 120,12 140,6 160,10 180,4 200,8"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Rationale */}
      {pos.entryRationale && (
        <div className="bg-navy-950/60 rounded-lg p-3 border border-[var(--border)]">
          <p className="text-[9px] text-muted uppercase tracking-wider font-mono mb-1.5">Entry Rationale (AI Neural Link)</p>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
            "{pos.entryRationale}"
          </p>
        </div>
      )}

      {/* Stats grid */}
      {pos.leverage && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Leverage", value: `${pos.leverage}x` },
            { label: "Margin", value: formatUSD(pos.margin ?? 0) },
            { label: "Stop Loss", value: formatUSD(pos.stopLoss ?? 0) },
            { label: "Take Profit", value: formatUSD(pos.takeProfit ?? 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-navy-800/50 rounded-lg p-2.5 border border-[var(--border)]">
              <p className="text-[9px] text-muted uppercase font-mono tracking-wider">{label}</p>
              <p className="text-sm font-display font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <Button variant="primary" size="sm" className="justify-center" icon={<Edit3 size={12} />}>
          Modify Parameters
        </Button>
        <Button variant="danger" size="sm" className="justify-center">
          Emergency Close Position
        </Button>
      </div>
    </Card>
  );
}

function ResolutionItem({ resolution }: { resolution: MarketResolution }) {
  const isResolved = resolution.status === "resolved" || resolution.status === "finalized";
  const statusColors: Record<string, string> = {
    resolved: "badge-active",
    finalized: "badge-neutral",
    pending: "badge-warning",
    disputed: "badge-error",
  };

  return (
    <div className="p-4 rounded-xl bg-navy-800/40 border border-[var(--border)] space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-navy-700 flex items-center justify-center">
            <TrendingUp size={12} className="text-[var(--cyan)]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{resolution.market}</p>
            <p className="text-[10px] text-muted font-mono">Resolution Block: {resolution.resolutionBlock.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-3">
          <div>
            <p className="text-[9px] text-muted font-mono uppercase">Final Price ({resolution.currency})</p>
            <p className="text-lg font-display font-bold text-[var(--text-primary)]">${resolution.finalPrice.toFixed(4)}</p>
          </div>
          <span className={cn("status-badge text-[9px]", statusColors[resolution.status])}>
            {resolution.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Agent rationale */}
      <div className="bg-navy-950/60 rounded-lg p-3 border border-[var(--border)]">
        <p className="text-[9px] text-muted uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1">
          <Zap size={9} /> Agent Rationale
        </p>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          "{resolution.agentRationale}"
        </p>
      </div>

      {/* Attestation footer */}
      {resolution.attestation && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield size={11} className="text-teal" />
            <span className="text-[10px] font-mono text-teal">{resolution.attestation}</span>
          </div>
          {resolution.disputeWindow && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={10} className="text-warning" />
              <span className="text-[10px] font-mono text-warning">Dispute Window: {resolution.disputeWindow}</span>
            </div>
          )}
        </div>
      )}

      {!resolution.disputeWindow && (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-[var(--cyan)]" />
          <span className="text-[10px] font-mono text-[var(--cyan)]">Attestation Verified (Finalized)</span>
          <span className="ml-auto text-[10px] font-mono text-muted">Window Closed</span>
        </div>
      )}
    </div>
  );
}
