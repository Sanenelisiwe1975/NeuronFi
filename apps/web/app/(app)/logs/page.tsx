'use client';

import { useState } from 'react';

const BARS: { h: number; label: string }[] = [
  { h: 40, label: 'T-9' },
  { h: 55, label: 'T-8' },
  { h: 75, label: 'T-7' },
  { h: 85, label: 'T-6' },
  { h: 95, label: 'T-5' },
  { h: 80, label: 'T-4' },
  { h: 60, label: 'T-3' },
  { h: 40, label: 'T-2' },
  { h: 25, label: 'T-1' },
  { h: 10, label: 'Now' },
];

const LOGS = [
  { time: '14:02:11', level: 'INFO',    levelColor: 'text-cyan-400',    bg: 'bg-cyan-400/5',    msg: 'Committing Bayesian posterior to Postgres... SUCCESS.' },
  { time: '14:02:12', level: 'INFO',    levelColor: 'text-cyan-400',    bg: 'bg-cyan-400/5',    msg: 'Invalidating Redis cache key: neuron_v2:inference:belief_state' },
  { time: '14:02:15', level: 'AGENT',   levelColor: 'text-primary-container', bg: 'bg-primary/5', msg: 'Strategy recalculated. Reason: Delta Neutrality deviation > 0.04%.' },
  { time: '14:02:18', level: 'WARN',    levelColor: 'text-amber-400',   bg: 'bg-amber-400/5',   msg: 'RPC latency spike on Arbitrum. Switching to fallback node.' },
  { time: '14:02:22', level: 'INFO',    levelColor: 'text-cyan-400',    bg: 'bg-cyan-400/5',    msg: 'Persisting telemetry batch #8821 to deep storage...' },
  { time: '14:02:25', level: 'SUCCESS', levelColor: 'text-emerald-400', bg: 'bg-emerald-400/5', msg: 'Persistence check passed. State consistency: 1.000.' },
];

const METRICS = [
  { icon: 'memory',    iconColor: 'text-primary',   bg: 'bg-primary/8',   label: 'Model Load',    val: '14.2%',  delta: '-2.1%',  up: true },
  { icon: 'database',  iconColor: 'text-tertiary',  bg: 'bg-tertiary/8',  label: 'DB Health',     val: '99.9%',  delta: '+0.0%',  up: true },
  { icon: 'hub',       iconColor: 'text-secondary', bg: 'bg-secondary/8', label: 'Active Nodes',  val: '12 / 12', delta: 'Full',  up: true },
  { icon: 'bolt',      iconColor: 'text-primary',   bg: 'bg-primary/8',   label: 'Inference',     val: '22 ms',  delta: '-4ms',   up: true },
];

function barHeightClass(h: number): string {
  if (h >= 90) return 'h-[90%]';
  if (h >= 80) return 'h-[80%]';
  if (h >= 75) return 'h-[75%]';
  if (h >= 60) return 'h-[60%]';
  if (h >= 55) return 'h-[55%]';
  if (h >= 40) return 'h-[40%]';
  if (h >= 25) return 'h-[25%]';
  return 'h-[10%]';
}

function barOpacity(h: number): string {
  const v = Math.round((0.15 + (h / 100) * 0.6) * 10) / 10;
  if (v >= 0.7) return 'opacity-70';
  if (v >= 0.6) return 'opacity-60';
  if (v >= 0.5) return 'opacity-50';
  if (v >= 0.4) return 'opacity-40';
  if (v >= 0.3) return 'opacity-30';
  return 'opacity-20';
}

export default function LogsPage() {
  const [slippage, setSlippage] = useState(50);
  const [confidence, setConfidence] = useState(85);
  const [paused, setPaused] = useState(false);

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-manrope font-extrabold text-[38px] leading-none tracking-tight text-on-surface">
            Learning &amp; Analytics
          </h1>
          <p className="text-base text-outline mt-2">Real-time Bayesian inference and agent neural telemetry.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-[12px] font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Data
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-[12px] font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Last 24h
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Bayesian Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-manrope font-bold text-on-surface text-[17px]">Bayesian Prior Updates</h3>
              <p className="text-[12px] text-outline mt-1">Neural belief shift distribution over high-volatility events</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Live Inference</span>
            </div>
          </div>

          <div className="relative h-72">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] font-bold text-outline text-right pr-2">
              <span>High</span>
              <span>Med</span>
              <span>Low</span>
            </div>
            {/* Chart area */}
            <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end gap-1.5">
              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-full border-t border-dashed border-outline-variant/40" />
                ))}
              </div>
              {BARS.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div
                    className={`w-full rounded-t-lg border border-t border-x bg-primary transition-all duration-300 hover:opacity-90 cursor-pointer ${barHeightClass(bar.h)} ${barOpacity(bar.h)}`}
                    title={`${bar.label}: Probability ${bar.h}%`}
                  />
                  <span className="text-[8px] font-bold text-outline">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex justify-between text-[9px] font-extrabold uppercase tracking-widest text-outline border-t border-outline-variant pt-3">
            <span>← Negative Skew (Risk)</span>
            <span>Neutral State</span>
            <span>Positive Skew (Yield) →</span>
          </div>
        </div>

        {/* Right column: Risk Params + Alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

          {/* Risk Parameters */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6">
            <h3 className="font-manrope font-bold text-on-surface text-[17px] mb-5">Risk Parameters</h3>
            <div className="space-y-4">

              {/* Pause toggle */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${paused ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-low border-outline-variant'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${paused ? 'text-primary' : 'text-outline'}`}>pause_circle</span>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface">Pause Agent</p>
                    <p className="text-[10px] text-outline">Immediate execution halt</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Toggle pause agent"
                  onClick={() => setPaused(!paused)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${paused ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm border border-slate-200 transition-transform ${paused ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Slippage */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-outline">Max Slippage</span>
                  <span className="text-[13px] font-extrabold font-manrope text-on-surface">{(slippage / 100).toFixed(2)}%</span>
                </div>
                <input
                  aria-label="Max slippage tolerance"
                  type="range"
                  min={0} max={100}
                  value={slippage}
                  onChange={e => setSlippage(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-outline font-semibold">
                  <span>0.00%</span><span>0.50%</span><span>1.00%</span>
                </div>
              </div>

              {/* Confidence */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-outline">Min Confidence</span>
                  <span className="text-[13px] font-extrabold font-manrope text-on-surface">{confidence}%</span>
                </div>
                <input
                  aria-label="Confidence threshold"
                  type="range"
                  min={0} max={100}
                  value={confidence}
                  onChange={e => setConfidence(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-outline font-semibold">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white border border-error/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-error text-[18px]">report</span>
              <h4 className="font-manrope font-bold text-[13px] text-on-surface uppercase tracking-wider">Active Alerts</h4>
              <span className="ml-auto px-2 py-0.5 bg-error/10 text-error text-[9px] font-extrabold rounded-full">2 NEW</span>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Gas Congestion', msg: 'Ethereum L1 gas exceeds 45 Gwei. Auto-batching enabled.', time: '2m ago' },
                { title: 'Halt Warning', msg: 'USDC liquidity pool depth below threshold on Curve.', time: '8m ago' },
              ].map(({ title, msg, time }) => (
                <div key={title} className="flex gap-3 items-start p-3 bg-error/5 rounded-xl border border-error/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-bold text-error">{title}</p>
                      <span className="text-[9px] text-outline flex-shrink-0">{time}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Analytics donut */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-2xl p-6">
          <h3 className="font-manrope font-bold text-on-surface text-[17px] mb-6">Success Analytics</h3>
          <div className="flex items-center gap-6">
            {/* Donut */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e0e3e5" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="transparent"
                  stroke="#00677f"
                  strokeDasharray="251.2"
                  strokeDashoffset="45.2"
                  strokeLinecap="round"
                  strokeWidth="10"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-manrope font-extrabold text-[26px] text-primary leading-none">82%</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline mt-1">Accuracy</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {[
                { label: 'Predicted Trades', val: '1,240', color: 'bg-primary' },
                { label: 'Realized Gains', val: '1,018', color: 'bg-tertiary' },
                { label: 'Avg Confidence', val: '91.4%', color: 'bg-secondary' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-outline">{label}</span>
                      <span className="font-manrope font-bold text-on-surface text-[13px]">{val}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neural Persistence Logs */}
        <div className="col-span-12 lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
              </div>
              <span className="material-symbols-outlined text-slate-500 text-[16px]">terminal</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Neural Persistence Logs</span>
            </div>
            <div className="flex gap-4">
              {[
                { label: 'Postgres', color: 'bg-emerald-500' },
                { label: 'Redis', color: 'bg-emerald-500' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}: Online</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-5 space-y-1.5 overflow-y-auto min-h-[200px]">
            {LOGS.map(({ time, level, levelColor, bg, msg }, i) => (
              <div key={i} className={`flex gap-3 px-3 py-2 rounded-lg ${bg} group hover:bg-white/5 transition-colors`}>
                <span className="text-slate-600 font-mono text-[11px] flex-shrink-0">[{time}]</span>
                <span className={`font-mono font-extrabold text-[11px] flex-shrink-0 min-w-[52px] ${levelColor}`}>{level}</span>
                <span className="font-mono text-[11px] text-slate-400">{msg}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex justify-between">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Write Throughput: 1.2 GB/s</span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Latency: 4ms</span>
          </div>
        </div>

        {/* System Metrics */}
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map(({ icon, iconColor, bg, label, val, delta, up }) => (
            <div key={label} className="bg-white border border-outline-variant rounded-2xl p-5 flex items-center gap-4 hover:border-primary/20 transition-colors group">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-outline">{label}</p>
                <p className="font-manrope font-extrabold text-[18px] text-on-surface leading-none mt-1">{val}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${up ? 'text-tertiary' : 'text-error'}`}>{delta}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom progress bar accent */}
      <div className="fixed bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary-container to-tertiary z-[60]" />
    </div>
  );
}
