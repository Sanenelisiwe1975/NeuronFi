'use client';

import { useState, useCallback } from 'react';
import { ToastContainer, ToastData } from 'components/Toast';

let nextId = 1;

function TokenPair({ a, b }: { a: { letter: string; color: string }; b: { letter: string; color: string } }) {
  return (
    <div className="flex -space-x-2 flex-shrink-0">
      <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-extrabold text-sm shadow-sm ${a.color}`}>
        {a.letter}
      </div>
      <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-extrabold text-sm shadow-sm ${b.color}`}>
        {b.letter}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [toasts,    setToasts]    = useState<ToastData[]>([]);
  const [executing, setExecuting] = useState(false);
  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const push    = useCallback((t: Omit<ToastData, 'id'>) => setToasts(ts => [...ts, { ...t, id: nextId++ }]), []);

  const handleExecuteAll = async () => {
    setExecuting(true);
    await new Promise(r => setTimeout(r, 1800));
    setExecuting(false);
    push({ type: 'success', title: 'All Actions Queued', msg: '4 primary actions submitted to the agent. Execution begins next cycle.' });
  };

  const OPPS = [
    {
      pair: 'wETH / stETH',
      protocol: 'Lido Finance v2',
      tokenA: { letter: 'E', color: 'bg-[#627EEA]' },
      tokenB: { letter: 'S', color: 'bg-[#00A3FF]' },
      action: 'Rebalance',
      actionStyle: 'bg-primary-container/10 border border-primary-container/30 text-primary',
      risk: 0.12,
      riskColor: 'bg-tertiary',
      riskW: 'w-[12%]',
      ev: '+$3,420',
      apy: '+12.4% APY',
      evColor: 'text-tertiary',
      rationale: 'ETH/LST lending rate divergence. Capital efficiency gain: 14.2% via Frax Ether v3 vaults.',
    },
    {
      pair: 'USDC / DAI',
      protocol: 'Curve 3Pool Expansion',
      tokenA: { letter: 'U', color: 'bg-[#2775CA]' },
      tokenB: { letter: 'D', color: 'bg-[#F5AC37]' },
      action: 'Enter',
      actionStyle: 'bg-tertiary-container/10 border border-tertiary-container/30 text-tertiary',
      risk: 0.04,
      riskColor: 'bg-tertiary',
      riskW: 'w-[4%]',
      ev: '+$1,890',
      apy: '+5.2% APY',
      evColor: 'text-tertiary',
      rationale: 'Stablecoin yield optimization. 3Pool expansion offers near-zero IL with competitive fee generation.',
    },
    {
      pair: 'SOL / jitoSOL',
      protocol: 'Jupiter Aggregator',
      tokenA: { letter: 'S', color: 'bg-[#9945FF]' },
      tokenB: { letter: 'J', color: 'bg-emerald-500' },
      action: 'Exit',
      actionStyle: 'bg-error-container/20 border border-error/20 text-error',
      risk: 0.78,
      riskColor: 'bg-error',
      riskW: 'w-[78%]',
      ev: '-$450',
      apy: 'Risk Mitigation',
      evColor: 'text-error',
      rationale: 'jitoSOL pricing anomaly indicates elevated liquidation risk. Exit preserves $6,200 in unrealized gains.',
    },
    {
      pair: 'ARB / GMX',
      protocol: 'GMX V2 LP',
      tokenA: { letter: 'A', color: 'bg-[#12AAFF]' },
      tokenB: { letter: 'G', color: 'bg-[#03D1CF]' },
      action: 'Enter',
      actionStyle: 'bg-primary-container/10 border border-primary-container/30 text-primary',
      risk: 0.31,
      riskColor: 'bg-primary',
      riskW: 'w-[31%]',
      ev: '+$2,110',
      apy: '+24.1% APY',
      evColor: 'text-tertiary',
      rationale: 'GMX V2 LP fee yield at 24.1% APY with hedged delta. Optimal entry window: next 6h.',
    },
  ];

  const RISK_GATES = [
    { label: 'Liquidity Depth', status: 'High', score: '98.2 / 100', pctW: 'w-[98%]', color: 'bg-tertiary', textColor: 'text-tertiary' },
    { label: 'Volatility Hedge', status: 'Mod', score: '65.0 / 100', pctW: 'w-[65%]', color: 'bg-primary', textColor: 'text-primary' },
    { label: 'Smart Contract', status: 'Safe', score: 'Audit ✅', pctW: 'w-full', color: 'bg-tertiary', textColor: 'text-tertiary' },
    { label: 'Gas Efficiency', status: 'Low', score: '72 Gwei', pctW: 'w-[30%]', color: 'bg-error', textColor: 'text-error' },
  ];

  return (
    <div className="p-margin max-w-[1440px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="flex justify-between items-end mb-stack-lg">
        <div>
          <h1 className="font-manrope font-bold text-h1 text-on-surface">Market Opportunities</h1>
          <p className="text-body-md text-outline mt-2">AI-curated liquidity paths with prioritized expected value (EV).</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl card-shadow flex items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Global Risk Gate</span>
            <p className="font-manrope font-bold text-[22px] text-primary leading-none mt-1">0.42 / 1.0</p>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[42%]" />
          </div>
        </div>
      </div>

      {/* Neural Reasoning + Aggregate EV */}
      <div className="grid grid-cols-12 gap-gutter mb-stack-lg">

        {/* ── Neural Reasoning Card ─────────────────────────────────────── */}
        <div className="col-span-8 rounded-2xl overflow-hidden relative neural-card-bg">

          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none neural-grid-overlay" />

          <div className="relative p-8">
            {/* Header row */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Brain icon with glow rings */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <div className="absolute w-14 h-14 rounded-full bg-primary/20 neural-ping-slow" />
                  <div className="absolute w-11 h-11 rounded-full bg-primary/30 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/40">
                    <span className="material-symbols-outlined text-white text-[26px] icon-filled">psychology</span>
                  </div>
                </div>
                <div>
                  <h2 className="font-manrope font-extrabold text-white text-[20px] leading-tight tracking-tight">
                    Neural Reasoning Summary
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Claude Sonnet 4.6 · Kite Attestation Registry</p>
                </div>
              </div>

              {/* Live inferring badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/30 rounded-full flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">Live Inferring</span>
              </div>
            </div>

            {/* Reasoning paragraph — Manrope for premium readability */}
            <div className="mb-6 pl-2 border-l-2 border-primary/40">
              <p className="font-manrope text-[15px] leading-[1.85] text-slate-300 font-medium">
                Market volatility in the{' '}
                <span className="text-white font-bold px-1.5 py-0.5 bg-white/8 rounded">ETH/LST</span>{' '}
                sector has created a temporal divergence in lending rates. My analysis suggests a{' '}
                <span className="text-cyan-300 font-extrabold">+14.2% increase</span>{' '}
                in capital efficiency by rotating idle USDC into the new{' '}
                <span className="text-white font-semibold">Frax Ether v3 vaults</span>.
                Macro sentiment is trending at{' '}
                <span className="text-emerald-400 font-bold">0.65 neutral-bullish</span>
                , justifying a moderate risk exposure increase in automated{' '}
                <span className="text-cyan-200 font-semibold italic">delta-neutral strategies</span>.
              </p>
            </div>

            {/* Confidence meter + stats */}
            <div className="space-y-3">
              {/* Confidence bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Model Confidence</span>
                  <span className="font-manrope font-extrabold text-cyan-300 text-[15px]">94.2%</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full w-[94%] neural-confidence-bar" />
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: 'hub',        label: 'Data Sources', val: '18 Nodes' },
                  { icon: 'schedule',   label: 'Signal Age',   val: '4m ago' },
                  { icon: 'smart_toy',  label: 'Model',        val: 'Sonnet 4.6' },
                  { icon: 'verified',   label: 'Attested',     val: 'On-chain' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/6 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-[12px] text-slate-500">{icon}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{label}:</span>
                    <span className="text-[10px] font-extrabold text-slate-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Aggregate EV Card ─────────────────────────────────────────── */}
        <div className="col-span-4 bg-primary text-white rounded-2xl card-shadow p-gutter flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Aggregate EV This Cycle</span>
            <div className="font-manrope font-extrabold text-h1 mt-2 leading-none">
              $12,492<span className="text-h3 opacity-50">.50</span>
            </div>
            <p className="text-body-sm mt-stack-sm opacity-75 leading-relaxed">Expected monthly yield from top 5 suggested actions.</p>

            <div className="grid grid-cols-2 gap-2 mt-5">
              {[{ label: 'Actions', val: '4' }, { label: 'Avg Confidence', val: '90.2%' }].map(({ label, val }) => (
                <div key={label} className="bg-white/10 border border-white/15 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                  <p className="font-manrope font-bold text-[16px]">{val}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleExecuteAll}
            disabled={executing}
            className="relative w-full py-3 bg-white text-primary font-manrope font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors mt-6 shadow-lg shadow-black/20 disabled:opacity-60"
          >
            {executing
              ? <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Queuing…</>
              : <><span className="material-symbols-outlined text-sm icon-filled">bolt</span> Execute All Primary Actions</>}
          </button>
        </div>
      </div>

      {/* Opportunities List — 5 columns matching reference */}
      <div className="space-y-stack-md">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="col-span-3 text-label-caps text-outline">Market Pair</div>
          <div className="col-span-2 text-label-caps text-outline text-center">Action</div>
          <div className="col-span-2 text-label-caps text-outline text-center">Risk Score</div>
          <div className="col-span-2 text-label-caps text-outline text-right">Exp. Value (EV)</div>
          <div className="col-span-3 text-label-caps text-outline text-right">Logic</div>
        </div>

        {OPPS.map(o => (
          <div
            key={o.pair}
            className="grid grid-cols-12 items-center px-6 py-5 bg-white border border-slate-200 rounded-xl card-shadow hover:border-primary-container hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
          >
            {/* Market Pair */}
            <div className="col-span-3 flex items-center gap-3">
              <TokenPair a={o.tokenA} b={o.tokenB} />
              <div>
                <div className="font-manrope font-bold text-body-md text-on-surface">{o.pair}</div>
                <div className="text-body-sm text-outline">{o.protocol}</div>
              </div>
            </div>

            {/* Action */}
            <div className="col-span-2 flex justify-center">
              <span className={`px-3 py-1 rounded-full text-label-caps ${o.actionStyle}`}>{o.action}</span>
            </div>

            {/* Risk Score */}
            <div className="col-span-2 flex flex-col items-center">
              <span className="font-data-mono text-on-surface-variant">{o.risk.toFixed(2)}</span>
              <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${o.riskColor} ${o.riskW}`} />
              </div>
            </div>

            {/* EV */}
            <div className="col-span-2 text-right">
              <div className={`font-manrope font-bold text-body-md ${o.evColor}`}>{o.ev}</div>
              <div className="text-[10px] text-outline">{o.apy}</div>
            </div>

            {/* Logic button */}
            <div className="col-span-3 flex justify-end gap-3 items-center">
              <p className="text-[11px] text-outline italic hidden group-hover:block text-right leading-relaxed max-w-[160px]">
                &ldquo;{o.rationale}&rdquo;
              </p>
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-outline hover:text-primary transition-colors border border-slate-200 hover:border-primary/30 rounded-lg text-label-caps flex-shrink-0">
                View Logic
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Risk Gates */}
      <div className="mt-stack-lg p-gutter bg-surface-container-low border border-slate-200 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-manrope font-bold text-h3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            Live Risk Gates
          </h3>
          <div className="flex items-center gap-4 text-label-caps font-bold">
            {[{ color: 'bg-tertiary', label: 'Pass' }, { color: 'bg-primary', label: 'Caution' }, { color: 'bg-error', label: 'Block' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-gutter">
          {RISK_GATES.map(({ label, status, score, pctW, color, textColor }) => (
            <div key={label} className="p-4 bg-white rounded-lg border border-slate-200 hover:-translate-y-0.5 hover:card-shadow transition-all duration-200">
              <div className="text-[10px] text-outline font-bold uppercase mb-2">{label}</div>
              <div className="flex justify-between items-end">
                <span className={`font-manrope font-bold text-h3 ${textColor}`}>{status}</span>
                <span className="text-label-caps text-outline">{score}</span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${color} ${pctW}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
