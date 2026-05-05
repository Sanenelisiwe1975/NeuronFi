/**
 * Learning & Analytics page.
 * Bayesian prior updates, success analytics, neural persistence logs,
 * risk parameter controls, and system health metrics.
 */

import { useState, useEffect, useRef } from "react";
import { Download, Calendar, Pause, Play, AlertCircle } from "lucide-react";
import { useAgent } from "../context/AgentContext";
import { Card, CardHeader, Badge, Button, Toggle, Slider } from "../components/ui";
import { BayesianChart, AccuracyDonut } from "../components/charts";
import { mockBayesian, mockSuccessAnalytics, mockSystemMetrics, mockPersistenceLogs } from "../lib/mockData";
import { cn } from "../lib/utils";
import { PersistenceLog } from "../types";

export function Analytics() {
  const { agentState, toggleAgent, settings, updateSettings } = useAgent();
  const [logs, setLogs] = useState<PersistenceLog[]>(mockPersistenceLogs);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const logsRef = useRef<HTMLDivElement>(null);

  // Simulate streaming new log entries
  useEffect(() => {
    if (agentState.status !== "active") return;
    const interval = setInterval(() => {
      const newMessages = [
        { level: "INFO" as const, message: `Cycle #${agentState.cycleCount + 1} analysis complete. Latency: ${agentState.networkLatency * 1000}ms.` },
        { level: "AGENT" as const, message: "Bayesian posterior updated. Confidence shift: +0.02." },
        { level: "SUCCESS" as const, message: "State consistency check passed. Hash: 1.000." },
        { level: "WARN" as const, message: "Gas spike detected. Auto-batching 3 transactions." },
        { level: "INFO" as const, message: "EigenLayer AVS heartbeat confirmed. Node: 12/12." },
      ];
      const pick = newMessages[Math.floor(Math.random() * newMessages.length)];
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      setLogs((prev) => [{ timestamp: ts, ...pick }, ...prev].slice(0, 80));
    }, 8_000);
    return () => clearInterval(interval);
  }, [agentState.status, agentState.cycleCount, agentState.networkLatency]);

  const logLevelColor = (level: PersistenceLog["level"]) => {
    const map: Record<PersistenceLog["level"], string> = {
      INFO: "text-[var(--cyan)]",
      AGENT: "text-purple-400",
      WARN: "text-warning",
      SUCCESS: "text-profit",
      ERROR: "text-loss",
    };
    return map[level];
  };

  return (
    <div className="space-y-4 animate-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">
            Learning &amp; Analytics
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time Bayesian inference and agent neural telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono transition-colors",
                  timeRange === r
                    ? "bg-[var(--cyan)] text-navy-950 font-semibold"
                    : "text-muted hover:text-[var(--text-primary)]"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={<Download size={12} />}>
            Export Data
          </Button>
        </div>
      </div>

      {/* ---- Main grid --------------------------------------- */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left — Bayesian + Success */}
        <div className="col-span-2 space-y-4">
          {/* Bayesian priors */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <CardHeader
                title="Bayesian Prior Updates"
                subtitle="Neural belief shift distribution over high-volatility events"
              />
              <Badge variant="active" dot className="text-[9px]">Live Inference</Badge>
            </div>
            <div className="flex items-end justify-between text-[9px] font-mono text-muted mb-1 px-2">
              <span>Negative Skew (Risk)</span>
              <span>Neutral State</span>
              <span>Positive Skew (Yield)</span>
            </div>
            <BayesianChart data={mockBayesian} height={180} />
          </Card>

          {/* Success Analytics + Logs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Success analytics */}
            <Card>
              <CardHeader title="Success Analytics" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <AccuracyDonut value={mockSuccessAnalytics.accuracyRate} size={100} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-[var(--text-primary)]">
                        {Math.round(mockSuccessAnalytics.accuracyRate * 100)}%
                      </p>
                      <p className="text-[9px] text-muted">Accuracy</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[9px] text-muted font-mono uppercase tracking-wider">Predicted</p>
                    <p className="text-xl font-display font-bold text-[var(--text-primary)]">
                      {mockSuccessAnalytics.predictedCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div>
                    <p className="text-[9px] text-muted font-mono uppercase tracking-wider">Realized</p>
                    <p className="text-xl font-display font-bold text-profit">
                      {mockSuccessAnalytics.realizedCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* System metrics */}
            <Card>
              <CardHeader title="System Health" />
              <div className="grid grid-cols-2 gap-2">
                {mockSystemMetrics.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-navy-800/50 border border-[var(--border)]">
                    <p className="text-[9px] text-muted font-mono uppercase tracking-wider">{m.label}</p>
                    <p className={cn("text-sm font-display font-bold mt-0.5",
                      m.status === "ok" ? "text-[var(--text-primary)]" : "text-warning"
                    )}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Neural Persistence Logs terminal */}
          <Card noPad className="border-navy-600">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-navy-950/80">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider ml-1">
                  Neural Persistence Logs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="live-dot" />
                  <span className="text-[9px] font-mono text-muted">Postgres Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span className="text-[9px] font-mono text-muted">Redis Sync</span>
                </div>
              </div>
            </div>

            <div
              ref={logsRef}
              className="h-48 overflow-y-auto bg-navy-950 p-4 space-y-1 relative scanlines font-mono"
            >
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] leading-relaxed">
                  <span className="text-navy-600 shrink-0">[{log.timestamp}]</span>
                  <span className={cn("shrink-0 font-semibold w-14", logLevelColor(log.level))}>
                    {log.level}
                  </span>
                  <span className="text-[var(--text-secondary)]">{log.message}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-navy-950/50 text-[9px] font-mono text-muted">
              <span>Write Throughput: 1.2 GB/s</span>
              <span>Latency: 4ms</span>
            </div>
          </Card>
        </div>

        {/* Right — Risk Parameters + Alerts */}
        <div className="space-y-3">
          <Card>
            <CardHeader title="Risk Parameters" />

            {/* Pause agent toggle */}
            <div className="p-3 rounded-lg bg-navy-800/50 border border-[var(--border)] mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Pause Agent</p>
                  <p className="text-[10px] text-muted mt-0.5">Immediate execution halt</p>
                </div>
                <Toggle
                  checked={agentState.status === "paused"}
                  onChange={toggleAgent}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Slider
                label="Max Slippage Tolerance"
                min={0.001}
                max={0.1}
                step={0.001}
                value={settings.riskParams.maxSlippageTolerance}
                onChange={(v) => updateSettings({
                  riskParams: { ...settings.riskParams, maxSlippageTolerance: v }
                })}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
              <Slider
                label="Confidence Threshold"
                min={0.5}
                max={1}
                step={0.001}
                value={settings.riskParams.confidenceThreshold}
                onChange={(v) => updateSettings({
                  riskParams: { ...settings.riskParams, confidenceThreshold: v }
                })}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
              <Slider
                label="Max Position Size"
                min={1000}
                max={100000}
                step={1000}
                value={settings.riskParams.maxPositionSize}
                onChange={(v) => updateSettings({
                  riskParams: { ...settings.riskParams, maxPositionSize: v }
                })}
                format={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
            </div>
          </Card>

          {/* Active alerts */}
          <Card className="border-warning/20 bg-warning/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-warning" />
              <span className="text-[10px] font-mono text-warning uppercase tracking-wider font-bold">
                Active Alerts
              </span>
            </div>
            <div className="space-y-2">
              <AlertItem
                message="Gas Congestion: Ethereum L1 gas exceeds 45 gwei. Auto-batching enabled."
              />
              <AlertItem
                message="Halt Warning: USDC liquidity pool depth below threshold on Curve."
              />
            </div>
          </Card>

          {/* Agent telemetry */}
          <Card>
            <CardHeader title="Agent Telemetry" />
            <div className="space-y-2.5">
              {[
                { label: "Total Cycles Run", value: agentState.cycleCount.toLocaleString() },
                { label: "Avg Cycle Time", value: "1.8s" },
                { label: "EigenLayer AVS", value: "Verified ✓", ok: true },
                { label: "Kite Registry", value: "Synced", ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--border)]/50 last:border-0">
                  <span className="text-[10px] text-muted font-mono">{label}</span>
                  <span className={cn("text-[10px] font-mono font-semibold", ok ? "text-profit" : "text-[var(--text-primary)]")}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-warning mt-0.5 shrink-0">·</span>
      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{message}</p>
    </div>
  );
}
