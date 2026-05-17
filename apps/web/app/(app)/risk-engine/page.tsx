'use client';

import { useState, useCallback } from 'react';
import { ToastContainer, ToastData } from 'components/Toast';

const RISK_GATES = [
  { label: 'Liquidity Depth',   value: 98,  status: 'Pass',    statusColor: 'text-tertiary', barColor: 'bg-tertiary', detail: '98.2 / 100' },
  { label: 'Volatility Hedge',  value: 65,  status: 'Caution', statusColor: 'text-primary',  barColor: 'bg-primary',  detail: '65.0 / 100' },
  { label: 'Smart Contract',    value: 100, status: 'Safe',    statusColor: 'text-tertiary', barColor: 'bg-tertiary', detail: 'Audited ✅' },
  { label: 'Gas Efficiency',    value: 30,  status: 'Low',     statusColor: 'text-error',    barColor: 'bg-error',    detail: '72 Gwei' },
  { label: 'Counterparty Risk', value: 85,  status: 'Pass',    statusColor: 'text-tertiary', barColor: 'bg-tertiary', detail: 'AAA rated' },
  { label: 'Oracle Health',     value: 99,  status: 'Pass',    statusColor: 'text-tertiary', barColor: 'bg-tertiary', detail: 'Chainlink live' },
];

const ALERTS = [
  { level: 'error', icon: 'error',         title: 'Gas Congestion',        msg: 'Ethereum L1 gas exceeds 45 gwei. Auto-batching enabled.',        time: '2m ago' },
  { level: 'error', icon: 'warning',       title: 'Halt Warning',          msg: 'USDC liquidity pool depth below threshold on Curve.',            time: '8m ago' },
  { level: 'warn',  icon: 'info',          title: 'Slippage Alert',        msg: 'Detected 0.3% slippage on ARB/USDC trade. Within tolerance.',    time: '15m ago' },
  { level: 'ok',    icon: 'check_circle',  title: 'Position Rebalanced',   msg: 'Delta neutral rebalance completed successfully.',                time: '32m ago' },
];

const WIDTHS = ['w-[98%]','w-[65%]','w-full','w-[30%]','w-[85%]','w-[99%]'];

let nextId = 1;

export default function RiskEnginePage() {
  const [maxSlippage,  setMaxSlippage]  = useState(50);
  const [confidence,   setConfidence]   = useState(85);
  const [maxDrawdown,  setMaxDrawdown]  = useState(10);
  const [posLimit,     setPosLimit]     = useState(20);
  const [agentPaused,  setAgentPaused]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [toasts,       setToasts]       = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const push = useCallback((toast: Omit<ToastData, 'id'>) => setToasts(t => [...t, { ...toast, id: nextId++ }]), []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    push({ type: 'success', title: 'Parameters Saved', msg: `Slippage: ${(maxSlippage/100).toFixed(2)}% · Confidence: ${confidence}% · Max DD: ${maxDrawdown}%` });
  };

  const handleTogglePause = () => {
    const next = !agentPaused;
    setAgentPaused(next);
    push(next
      ? { type: 'warning', title: 'Agent Paused', msg: 'All autonomous trade execution is halted.' }
      : { type: 'success', title: 'Agent Resumed', msg: 'Autonomous trade execution is now active.' }
    );
  };

  const overallRisk = 0.42;

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manrope font-bold text-[40px] tracking-tight text-on-surface mb-2">Risk Engine</h1>
          <p className="text-base text-outline">Real-time risk monitoring, circuit breakers, and parameter controls for the autonomous agent.</p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white border border-outline-variant rounded-xl">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Global Risk Score</p>
            <p className="font-manrope font-bold text-2xl text-primary">{overallRisk} / 1.0</p>
          </div>
          <div className="w-20 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[42%] rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Risk gates */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-manrope font-semibold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                Live Risk Gates
              </h2>
              <div className="flex items-center gap-4 text-[11px] font-bold">
                {[{ c: 'bg-tertiary', l: 'Pass' }, { c: 'bg-primary', l: 'Caution' }, { c: 'bg-error', l: 'Block' }].map(({ c, l }) => (
                  <div key={l} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${c}`} />{l}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {RISK_GATES.map((g, i) => (
                <div key={g.label} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant hover:border-outline transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{g.label}</p>
                    <span className={`text-[10px] font-bold ${g.statusColor}`}>{g.status}</span>
                  </div>
                  <div className="flex justify-between items-end mb-2">
                    <span className={`font-manrope font-bold text-xl ${g.statusColor}`}>{g.value}%</span>
                    <span className="text-[11px] text-outline">{g.detail}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${g.barColor} ${WIDTHS[i]} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert log */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h2 className="font-manrope font-semibold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">notifications_active</span>
                Active Alerts
              </h2>
            </div>
            <div className="divide-y divide-outline-variant">
              {ALERTS.map(a => {
                const colors: Record<string, string> = { error: 'text-error', warn: 'text-amber-500', ok: 'text-tertiary' };
                return (
                  <div key={a.title} className="px-6 py-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors">
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 ${colors[a.level]}`}>{a.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-on-surface">{a.title}</span>
                        <span className="text-[10px] text-outline">{a.time}</span>
                      </div>
                      <p className="text-sm text-outline">{a.msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="col-span-4 space-y-6">
          {/* Agent pause */}
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-semibold text-lg text-on-surface mb-4">Circuit Breakers</h2>
            <div className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${agentPaused ? 'bg-error/5 border-error/30' : 'bg-tertiary/5 border-tertiary/20'}`}
              onClick={handleTogglePause}>
              <div>
                <p className="text-sm font-bold text-on-surface">Agent Execution</p>
                <p className="text-[11px] text-outline mt-0.5">{agentPaused ? 'All trades halted' : 'Running autonomously'}</p>
              </div>
              <button
                type="button"
                aria-label="Toggle agent pause"
                onClick={e => { e.stopPropagation(); handleTogglePause(); }}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors flex-shrink-0 ${agentPaused ? 'bg-error' : 'bg-tertiary'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${agentPaused ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {agentPaused && (
              <p className="mt-3 text-xs text-error font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Agent paused — no new positions will open.
              </p>
            )}
          </div>

          {/* Parameter sliders */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 space-y-5">
            <h2 className="font-manrope font-semibold text-lg text-on-surface">Risk Parameters</h2>
            {[
              { label: 'Max Slippage',        val: maxSlippage, set: setMaxSlippage, fmt: (v: number) => `${(v/100).toFixed(2)}%`, max: 200 },
              { label: 'Confidence Threshold',val: confidence,  set: setConfidence,  fmt: (v: number) => `${v}%`,                  max: 100 },
              { label: 'Max Daily Drawdown',  val: maxDrawdown, set: setMaxDrawdown,  fmt: (v: number) => `${v}%`,                  max: 30  },
              { label: 'Max Position Size',   val: posLimit,    set: setPosLimit,     fmt: (v: number) => `${v}%`,                  max: 50  },
            ].map(({ label, val, set, fmt, max }) => (
              <label key={label} className="block">
                <div className="flex justify-between text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                  <span>{label}</span><span className="text-on-surface">{fmt(val)}</span>
                </div>
                <input type="range" min={1} max={max} value={val}
                  onChange={e => set(+e.target.value)}
                  aria-label={label}
                  className="w-full h-1.5 bg-surface-variant rounded-lg cursor-pointer accent-primary" />
              </label>
            ))}
            <button type="button" onClick={handleSave} disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-xl font-manrope font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {saving
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Saving…</>
                : <><span className="material-symbols-outlined text-[18px]">save</span> Save Parameters</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
