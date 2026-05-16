import { useState } from "react";
import { Key, Server, Shield, Bell, Zap, Save, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useAgent } from "../context/AgentContext";
import { Card, CardHeader, Button, Input, Toggle, Slider, Badge, Divider } from "../components/ui";
import { cn } from "../lib/utils";

export function Settings() {
  const { settings, updateSettings, agentState, toggleAgent } = useAgent();
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 animate-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">Settings</h1>
          <p className="text-xs text-muted mt-0.5">Configure agent behaviour, integrations, and risk parameters.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={saved ? <Shield size={14} /> : <Save size={14} />}
          onClick={handleSave}
          className={cn(saved && "bg-profit")}
        >
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ---- Claude AI Integration -------------------------- */}
        <Card>
          <CardHeader title="Claude AI Integration" icon={<Zap size={14} />} />
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary">Anthropic API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  className="w-full bg-navy-800 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono placeholder:text-muted focus:outline-none focus:border-[var(--cyan)] transition-colors pr-10"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text-primary)] transition-colors"
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <span className="text-[10px] text-muted">Used for market analysis and reasoning. Never stored on-chain.</span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--cyan)]/5 border border-[var(--cyan)]/15">
              <div className="flex items-center gap-2 mb-2">
                <div className="live-dot" />
                <span className="text-[10px] font-mono text-[var(--cyan)] uppercase tracking-wider">API Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-muted">Model:</span>{" "}
                  <span className="text-[var(--text-primary)]">claude-sonnet-4-20250514</span>
                </div>
                <div>
                  <span className="text-muted">Latency:</span>{" "}
                  <span className="text-profit">22ms avg</span>
                </div>
                <div>
                  <span className="text-muted">Calls today:</span>{" "}
                  <span className="text-[var(--text-primary)]">{agentState.cycleCount}</span>
                </div>
                <div>
                  <span className="text-muted">Status:</span>{" "}
                  <span className="text-profit">Connected</span>
                </div>
              </div>
            </div>

            <Divider />

            <div className="space-y-3">
              <Toggle
                checked={settings.autoExecute}
                onChange={(v) => updateSettings({ autoExecute: v })}
                label="Auto-execute AI recommendations"
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-secondary">Analysis cycle interval</span>
                <Slider
                  min={10}
                  max={120}
                  step={5}
                  value={settings.cycleIntervalSeconds}
                  onChange={(v) => updateSettings({ cycleIntervalSeconds: v })}
                  format={(v) => `${v}s`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ---- Kite SDK Integration --------------------------- */}
        <Card>
          <CardHeader title="Kite AI AA SDK" icon={<Server size={14} />} />
          <div className="space-y-4">
            <Input
              label="SDK Endpoint"
              value={settings.kiteSDKEndpoint}
              onChange={(e) => updateSettings({ kiteSDKEndpoint: e.target.value })}
              icon={<Server size={12} />}
              hint="Kite Abstract Account SDK RPC endpoint"
            />
            <Input
              label="Attestation Registry Address"
              value={settings.attestationRegistry}
              onChange={(e) => updateSettings({ attestationRegistry: e.target.value })}
              icon={<Shield size={12} />}
              hint="On-chain Kite Attestation Registry contract"
            />

            <div className="p-3 rounded-lg bg-teal/5 border border-teal/20">
              <p className="text-[9px] font-mono text-teal uppercase tracking-wider mb-2">Registry Status</p>
              <div className="space-y-1 text-[10px] font-mono">
                {[
                  { k: "Network", v: "Ethereum Mainnet" },
                  { k: "Registry Block", v: "19,452,210" },
                  { k: "Total Attestations", v: "4,502" },
                  { k: "Dispute Rate", v: "0.02%", ok: true },
                  { k: "EigenLayer AVS", v: "Verified", ok: true },
                ].map(({ k, v, ok }) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted">{k}:</span>
                    <span className={ok ? "text-profit" : "text-[var(--text-primary)]"}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="secondary" size="sm" className="w-full justify-center" icon={<RefreshCw size={12} />}>
              Test Connection
            </Button>
          </div>
        </Card>

        {/* ---- Risk Parameters -------------------------------- */}
        <Card>
          <CardHeader title="Risk Parameters" icon={<Shield size={14} />} />
          <div className="space-y-4">
            <Slider
              label="Max Slippage Tolerance"
              min={0.001}
              max={0.1}
              step={0.001}
              value={settings.riskParams.maxSlippageTolerance}
              onChange={(v) => updateSettings({ riskParams: { ...settings.riskParams, maxSlippageTolerance: v } })}
              format={(v) => `${(v * 100).toFixed(1)}%`}
            />
            <Slider
              label="Confidence Threshold"
              min={0.5}
              max={1}
              step={0.001}
              value={settings.riskParams.confidenceThreshold}
              onChange={(v) => updateSettings({ riskParams: { ...settings.riskParams, confidenceThreshold: v } })}
              format={(v) => `${(v * 100).toFixed(1)}%`}
            />
            <Slider
              label="Max Position Size"
              min={1000}
              max={100000}
              step={1000}
              value={settings.riskParams.maxPositionSize}
              onChange={(v) => updateSettings({ riskParams: { ...settings.riskParams, maxPositionSize: v } })}
              format={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Slider
              label="Max Leverage"
              min={1}
              max={10}
              step={0.5}
              value={settings.riskParams.maxLeverage}
              onChange={(v) => updateSettings({ riskParams: { ...settings.riskParams, maxLeverage: v } })}
              format={(v) => `${v}x`}
            />

            <Divider />

            <div className="space-y-3">
              <Toggle
                checked={settings.riskParams.autoRebalance}
                onChange={(v) => updateSettings({ riskParams: { ...settings.riskParams, autoRebalance: v } })}
                label="Auto-rebalance on drift threshold"
              />
              <Toggle
                checked={settings.riskParams.emergencyStopEnabled}
                onChange={(v) => updateSettings({ riskParams: { ...settings.riskParams, emergencyStopEnabled: v } })}
                label="Emergency stop circuit breaker"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Notifications" icon={<Bell size={14} />} />
            <div className="space-y-3">
              <Toggle
                checked={settings.notificationsEnabled}
                onChange={(v) => updateSettings({ notificationsEnabled: v })}
                label="Enable push notifications"
              />
              {[
                "Trade executions",
                "Risk threshold breaches",
                "Attestation completions",
                "Agent cycle errors",
              ].map((item) => (
                <Toggle key={item} checked label={item} onChange={() => {}} />
              ))}
            </div>
          </Card>

          {/* Agent control */}
          <Card className={cn(
            "border",
            agentState.status === "active" ? "border-profit/20 bg-profit/5" : "border-warning/20 bg-warning/5"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-2 h-2 rounded-full", agentState.status === "active" ? "bg-profit" : "bg-warning")} />
              <span className="font-display font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                Agent Control
              </span>
              <Badge variant={agentState.status === "active" ? "active" : "warning"} className="ml-auto">
                {agentState.status}
              </Badge>
            </div>
            <p className="text-[11px] text-muted mb-4 leading-relaxed">
              {agentState.status === "active"
                ? "The autonomous agent is running and executing trades. Cycle #" + agentState.cycleCount + " complete."
                : "Agent is paused. No trades will be executed until resumed."}
            </p>
            <Button
              variant={agentState.status === "active" ? "danger" : "primary"}
              size="md"
              className="w-full justify-center"
              onClick={toggleAgent}
              icon={agentState.status === "active" ? <AlertTriangle size={14} /> : <Zap size={14} />}
            >
              {agentState.status === "active" ? "Pause Agent" : "Resume Agent"}
            </Button>
          </Card>

          {/* Version info */}
          <Card>
            <div className="space-y-2 text-[10px] font-mono">
              <p className="text-muted uppercase tracking-wider font-semibold mb-2">Version Info</p>
              {[
                { k: "Neuron Agent", v: `v${agentState.version}` },
                { k: "Kite AA SDK", v: "v2.1.4" },
                { k: "Claude Model", v: "Sonnet 4" },
                { k: "Build", v: "2025.04.25-prod" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted">{k}</span>
                  <span className="text-[var(--text-primary)]">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
