'use client';

import { useState } from 'react';

const BARS = [40, 55, 75, 85, 95, 80, 60, 40, 25, 10];

const LOGS = [
  { time: '14:02:11', level: 'INFO', levelColor: 'text-cyan-400', db: 'Postgres', msg: 'Committing Bayesian posterior to {db}... SUCCESS.' },
  { time: '14:02:12', level: 'INFO', levelColor: 'text-cyan-400', db: null, msg: 'Invalidating Redis cache key: neuron_v2:inference:belief_state' },
  { time: '14:02:15', level: 'AGENT', levelColor: 'text-primary-container', db: null, msg: 'Strategy recalculated. Reason: Delta Neutrality deviation > 0.04%.' },
  { time: '14:02:18', level: 'WARN', levelColor: 'text-error', db: null, msg: 'RPC Latency spike detected on Arbitrum. Switching to fallback node.' },
  { time: '14:02:22', level: 'INFO', levelColor: 'text-cyan-400', db: null, msg: 'Persisting telemetry batch #8821 to deep storage...' },
  { time: '14:02:25', level: 'SUCCESS', levelColor: 'text-emerald-400', db: null, msg: 'Persistence check passed. State consistency 1.000.' },
];

export default function LogsPage() {
  const [slippage, setSlippage] = useState(50);
  const [confidence, setConfidence] = useState(85);
  const [paused, setPaused] = useState(false);

  return (
    <div className="pt-24 px-8 pb-12 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-manrope font-bold text-[40px] leading-tight tracking-tight text-on-surface">Learning &amp; Analytics</h1>
          <p className="text-base text-outline mt-1">Real-time Bayesian inference and agent neural telemetry.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Data
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span> Last 24h
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bayesian Chart */}
        <div className="col-span-8 bg-white border border-outline-variant rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-manrope font-semibold text-2xl text-on-surface">Bayesian Prior Updates</h3>
              <p className="text-sm text-outline">Neural belief shift distribution over high-volatility events</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Live Inference</span>
            </div>
          </div>
          <div className="h-[320px] w-full flex items-end gap-1 relative pt-8">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-l border-b border-outline-variant">
              <div className="w-full border-t border-dashed border-outline" />
              <div className="w-full border-t border-dashed border-outline" />
              <div className="w-full border-t border-dashed border-outline" />
            </div>
            {BARS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm border-x border-t transition-all duration-300 hover:opacity-80 cursor-help"
                style={{
                  height: `${h}%`,
                  backgroundColor: `rgba(0,103,127,${0.1 + (h / 100) * 0.5})`,
                  borderColor: `rgba(0,103,127,${0.2 + (h / 100) * 0.3})`,
                }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-semibold tracking-wider text-outline px-2 uppercase">
            <span>Negative Skew (Risk)</span>
            <span>Neutral State</span>
            <span>Positive Skew (Yield)</span>
          </div>
        </div>

        {/* Risk Parameters + Alerts */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <h3 className="font-manrope font-semibold text-2xl text-on-surface mb-4">Risk Parameters</h3>
            <div className="space-y-4">
              {/* Pause toggle */}
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">pause_circle</span>
                  <div>
                    <p className="text-sm font-semibold">Pause Agent</p>
                    <p className="text-[11px] text-outline">Immediate execution halt</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Toggle pause agent"
                  onClick={() => setPaused(!paused)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${paused ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 transition-transform ${paused ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Slippage */}
              <label className="block space-y-2">
                <div className="flex justify-between text-[11px] text-outline font-semibold tracking-wider uppercase">
                  <span>Max Slippage Tolerance</span>
                  <span className="text-on-surface">{(slippage / 100).toFixed(2)}%</span>
                </div>
                <input
                  aria-label="Max slippage tolerance"
                  className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  type="range"
                  min={0} max={100}
                  value={slippage}
                  onChange={e => setSlippage(Number(e.target.value))}
                />
              </label>

              {/* Confidence */}
              <label className="block space-y-2">
                <div className="flex justify-between text-[11px] text-outline font-semibold tracking-wider uppercase">
                  <span>Confidence Threshold</span>
                  <span className="text-on-surface">{confidence}%</span>
                </div>
                <input
                  aria-label="Confidence threshold"
                  className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  type="range"
                  min={0} max={100}
                  value={confidence}
                  onChange={e => setConfidence(Number(e.target.value))}
                />
              </label>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-error-container/20 border border-error/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-error">
              <span className="material-symbols-outlined">report</span>
              <h4 className="font-manrope font-bold text-sm uppercase tracking-wider">Active Alerts</h4>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Gas Congestion:', msg: 'Ethereum L1 gas exceeds 45 gwei. Auto-batching enabled.' },
                { title: 'Halt Warning:', msg: 'USDC liquidity pool depth below threshold on Curve.' },
              ].map(({ title, msg }) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-on-error-container"><span className="font-bold">{title}</span> {msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Analytics */}
        <div className="col-span-4 bg-white border border-outline-variant rounded-xl p-6">
          <h3 className="font-manrope font-semibold text-2xl text-on-surface mb-6">Success Analytics</h3>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e0e3e5" strokeWidth="10" />
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#00677f" strokeDasharray="251.2" strokeDashoffset="45.2" strokeLinecap="round" strokeWidth="10" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-manrope font-bold text-3xl text-primary">82%</span>
              <span className="text-[10px] font-semibold tracking-wider text-outline uppercase">Accuracy Rate</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Predicted', val: '1,240' }, { label: 'Realized', val: '1,018' }].map(({ label, val }) => (
              <div key={label} className="p-3 bg-surface-container-low rounded-lg text-center">
                <p className="text-[10px] font-semibold tracking-wider text-outline uppercase mb-1">{label}</p>
                <p className="font-manrope font-bold text-on-surface">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">terminal</span>
              <h3 className="font-manrope font-bold text-slate-200 text-sm uppercase tracking-widest">Neural Persistence Logs</h3>
            </div>
            <div className="flex gap-4">
              {['Postgres: Online', 'Redis: Sync'].map(label => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[12px] text-slate-300 space-y-2 overflow-y-auto bg-slate-950/50 min-h-[200px]">
            {LOGS.map(({ time, level, levelColor, msg }) => (
              <div key={`${time}-${level}`} className="flex gap-3">
                <span className="text-slate-500 shrink-0">[{time}]</span>
                <span className={`font-bold ${levelColor} shrink-0 min-w-[56px]`}>{level}</span>
                <span className="text-slate-300">{msg}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-2 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
            <span>Write Throughput: 1.2 GB/s</span>
            <span>Latency: 4ms</span>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="col-span-12 grid grid-cols-4 gap-6">
          {[
            { icon: 'memory', iconColor: 'text-primary', bg: 'bg-primary/10', label: 'Model Load', val: '14.2%' },
            { icon: 'database', iconColor: 'text-tertiary', bg: 'bg-tertiary/10', label: 'DB Health', val: '99.9%' },
            { icon: 'hub', iconColor: 'text-secondary', bg: 'bg-secondary/10', label: 'Active Nodes', val: '12 / 12' },
            { icon: 'bolt', iconColor: 'text-on-primary-container', bg: 'bg-primary-container/20', label: 'Inference Time', val: '22ms' },
          ].map(({ icon, iconColor, bg, label, val }) => (
            <div key={label} className="bg-white border border-outline-variant rounded-xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-outline uppercase">{label}</p>
                <p className="font-manrope font-bold text-lg text-on-surface">{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-container to-tertiary-container z-[60]" />
    </div>
  );
}
