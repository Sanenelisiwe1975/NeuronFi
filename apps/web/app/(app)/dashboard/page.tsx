'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AgentState {
  status: string;
  iteration: number;
  winRate: string;
}

interface Market {
  marketId: string;
  question: string;
  volumeUsdt?: string;
}

const SPARKLINE_POINTS = "0,60 60,45 120,55 180,30 240,40 300,15 360,25 420,5 480,18 540,8";

const FEED = [
  { dot: 'bg-cyan-400', ring: 'ring-cyan-400/30', label: 'Trade Execution', labelColor: 'text-cyan-400', time: 'Just now', msg: 'Rebalanced ETH-USDC LP range to $2,350–$2,500. Slippage: 0.02%.', txHash: '0x4a2…9f3e', verified: true },
  { dot: 'bg-slate-500', ring: null, label: 'Neural Reasoning', labelColor: 'text-slate-400', time: '12m ago', msg: '"Volatility index increasing. Shifting 15% of capital to low-leverage stable pools."', txHash: null, verified: false },
  { dot: 'bg-emerald-500', ring: 'ring-emerald-500/30', label: 'Kite Attestation', labelColor: 'text-emerald-400', time: '45m ago', msg: 'Proof-of-Logic written to Kite Attestation Registry. Record immutable.', txHash: '0x8b1…4d2a', verified: true },
  { dot: 'bg-slate-500', ring: null, label: 'Portfolio Observe', labelColor: 'text-slate-400', time: '1h ago', msg: 'Snapshot #4,218 committed. USDC balance reconciled. Delta: +$142.50.', txHash: null, verified: false },
];

export default function DashboardPage() {
  const [agent, setAgent] = useState<AgentState | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [usdcBalance, setUsdcBalance] = useState('—');

  useEffect(() => {
    fetch('/api/agent').then(r => r.json()).then(setAgent).catch(() => {});
    fetch('/api/markets').then(r => r.json()).then((d: { markets?: Market[] }) => setMarkets(d.markets ?? [])).catch(() => {});
    fetch('/api/portfolio')
      .then(r => r.json())
      .then((d: { snapshots?: Array<{ usdcBalance: string }> }) => {
        const snap = d.snapshots?.at(-1);
        if (snap) setUsdcBalance(`$${Number(snap.usdcBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      })
      .catch(() => {});
  }, []);

  const agentActive = agent?.status === 'RUNNING';

  return (
    <>
      {/* Stats Strip */}
      <div className="px-8 py-5 bg-white border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8 flex-wrap">
            {[
              { label: 'USDC Balance', val: usdcBalance, icon: 'account_balance_wallet', color: 'text-primary', bg: 'bg-primary/8' },
              { label: 'Agent Cycles', val: agent?.iteration ?? '—', icon: 'loop', color: 'text-secondary', bg: 'bg-secondary/8' },
              { label: 'Win Rate', val: agent?.winRate ?? '—', icon: 'trending_up', color: 'text-tertiary', bg: 'bg-tertiary/8' },
              { label: 'Active Markets', val: markets.length || '—', icon: 'bar_chart', color: 'text-primary', bg: 'bg-primary/8' },
              { label: 'Total EV Today', val: '+$3,842', icon: 'bolt', color: 'text-tertiary', bg: 'bg-tertiary/8' },
            ].map(({ label, val, icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{label}</p>
                  <p className="text-[17px] font-extrabold font-manrope text-on-surface leading-none mt-0.5">{val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all ${agentActive ? 'bg-tertiary/5 border-tertiary/20' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`w-2 h-2 rounded-full ${agentActive ? 'bg-tertiary animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-semibold text-on-surface-variant">
              {agentActive ? 'Real-time Stream: Active' : 'Real-time Stream: Paused'}
            </span>
          </div>
        </div>
      </div>

      {!agentActive && (
        <div className="px-8 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
          <p className="text-xs font-semibold text-amber-900">
            Agent execution paused. Adjust risk parameters or resume manually in <Link href="/logs" className="underline">Settings → Logs</Link>.
          </p>
        </div>
      )}

      <div className="p-8 max-w-[1440px] mx-auto grid grid-cols-12 gap-6">

        {/* Left col */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

          {/* Market Overview */}
          <section className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-white text-[16px]">currency_bitcoin</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-white text-[16px]">attach_money</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-on-surface text-[15px] leading-none">ETH / USDC</h3>
                  <p className="text-[11px] text-outline mt-1">Uniswap V3 · 0.05% Tier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-manrope font-extrabold text-[26px] text-on-surface leading-none">$2,412.84</p>
                <p className="text-xs font-bold text-tertiary mt-1 flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  +2.4% (24h)
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-44 mx-6 mb-4 rounded-xl bg-slate-950 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 540 80">
                <defs>
                  <linearGradient id="chartFill" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <polyline points={`${SPARKLINE_POINTS} 540,80 0,80`} fill="url(#chartFill)" />
                <polyline points={SPARKLINE_POINTS} fill="none" stroke="#00d1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
              </svg>
              <div className="absolute top-3 left-4 flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Live Chart</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 px-6 pb-6">
              {[
                { label: 'Liquidity', val: '$42.8M', delta: '+1.2%', up: true },
                { label: 'Volume 24h', val: '$12.4M', delta: '+8.4%', up: true },
                { label: 'Fees 24h', val: '$6,210', delta: '+3.1%', up: true },
                { label: 'Utilization', val: '18.4%', delta: '-0.6%', up: false },
              ].map(({ label, val, delta, up }) => (
                <div key={label} className="bg-surface-container-low rounded-xl p-3 hover:bg-surface-container transition-colors">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1.5">{label}</p>
                  <p className="font-manrope font-bold text-on-surface text-[15px] leading-none">{val}</p>
                  <p className={`text-[10px] font-semibold mt-1 ${up ? 'text-tertiary' : 'text-error'}`}>{delta}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Active Positions */}
          <section className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-manrope font-bold text-on-surface">Active Positions</h3>
                <span className="px-2 py-0.5 bg-primary/8 text-primary text-[10px] font-bold rounded-full">2 OPEN</span>
              </div>
              <Link href="/positions" className="flex items-center gap-1 text-primary text-xs font-bold hover:opacity-80 transition-opacity">
                View All <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    {['Market / Protocol', 'Size (USD)', 'Entry Price', 'PnL', 'Risk', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-outline">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {[
                    { name: 'WETH/USDC LP', protocol: 'Uniswap V3', icon: 'swap_horiz', iconBg: 'bg-primary/10', iconColor: 'text-primary', size: '$45,200', entry: '$2,384.10', pnl: '+$1,120.45', pct: '+2.48%', pos: true, risk: 28, riskLabel: 'Low' },
                    { name: 'ARB/USDC Long', protocol: 'GMX V2', icon: 'trending_up', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', size: '$28,000', entry: '$1.82', pnl: '-$430.12', pct: '-1.54%', pos: false, risk: 74, riskLabel: 'Med-High' },
                  ].map(row => (
                    <tr key={row.name} className="hover:bg-surface-container-low/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${row.iconBg} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-[18px] ${row.iconColor}`}>{row.icon}</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-on-surface">{row.name}</p>
                            <p className="text-[10px] text-outline font-medium">{row.protocol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-manrope font-semibold text-on-surface text-[13px]">{row.size}</td>
                      <td className="px-6 py-4 font-mono text-[12px] text-on-surface-variant">{row.entry}</td>
                      <td className="px-6 py-4">
                        <p className={`text-[13px] font-bold ${row.pos ? 'text-tertiary' : 'text-error'}`}>{row.pnl}</p>
                        <p className={`text-[10px] font-medium ${row.pos ? 'text-tertiary/70' : 'text-error/70'}`}>{row.pct}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${row.risk < 40 ? 'bg-tertiary' : row.risk < 70 ? 'bg-orange-400' : 'bg-error'}`}
                              style={{ width: `${row.risk}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-on-surface-variant">{row.riskLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-surface-container rounded-lg">
                          <span className="material-symbols-outlined text-outline text-[18px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right col */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

          {/* AI Identity Card */}
          <section className="rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-48 h-48 bg-primary/15 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full translate-x-1/4 translate-y-1/4" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center ring-2 ring-primary/10">
                  <span className="material-symbols-outlined text-primary-container text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div>
                  <p className="font-manrope font-extrabold text-white text-sm">NeuronFi Agent</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Claude Sonnet 4.6 · Kite AA</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-tertiary/20 border border-tertiary/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  <span className="text-[9px] font-bold text-tertiary uppercase tracking-widest">Online</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Passport ID', val: '0x2c4b…780c', icon: 'badge' },
                  { label: 'Chain', val: 'Kite #2368', icon: 'link' },
                  { label: 'Iterations', val: `${agent?.iteration ?? 0}`, icon: 'loop' },
                  { label: 'Win Rate', val: agent?.winRate ?? '—', icon: 'military_tech' },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-slate-500 text-[12px]">{icon}</span>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                    </div>
                    <p className="text-[12px] font-mono font-bold text-slate-200">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AI Opportunities */}
          <section className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-manrope font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-cyan-500" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                AI Opportunities
              </h3>
              <Link href="/opportunities" className="text-[11px] font-bold text-primary hover:opacity-70 transition-opacity">See all</Link>
            </div>
            <div className="space-y-3">
              {/* Top opportunity */}
              <div className="relative rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/10 blur-2xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-extrabold rounded-full">EV +14.2%</span>
                  <span className="text-[10px] text-slate-400 font-semibold">#1 Ranked</span>
                </div>
                <p className="font-manrope font-bold text-on-surface text-sm mb-2">LDO/ETH Delta Neutral</p>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[13px] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
                    &ldquo;4% basis spread detected across Aave/Curve. Convergence probability 87% within 48h based on whale wallet inflow patterns.&rdquo;
                  </p>
                </div>
                <Link href="/opportunities">
                  <button className="w-full mt-3 py-2 bg-primary text-white rounded-lg text-[11px] font-bold hover:opacity-90 transition-opacity">
                    Review Strategy →
                  </button>
                </Link>
              </div>

              {/* Second opportunity */}
              <div className="rounded-xl border border-outline-variant p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded-full border border-outline-variant">EV +8.4%</span>
                  <span className="text-[10px] text-slate-400 font-semibold">#2 Ranked</span>
                </div>
                <p className="font-manrope font-bold text-on-surface text-sm mb-1.5">SOL Staking Arbitrage</p>
                <p className="text-[11px] text-outline leading-relaxed italic">
                  &ldquo;jitoSOL pricing inefficiency on Jupiter aggregator. Execution risk: Low.&rdquo;
                </p>
              </div>
            </div>
          </section>

          {/* Agent Feed */}
          <section className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">terminal</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Agent Feed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">Live</span>
              </div>
            </div>
            <div className="p-5 relative">
              <div className="absolute left-9 top-5 bottom-5 w-px bg-slate-800" />
              <div className="space-y-5">
                {FEED.map((item, i) => (
                  <div key={i} className="relative pl-7">
                    <div className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full ${item.dot} ${item.ring ? `ring-4 ${item.ring}` : ''} ring-slate-950`} />
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest ${item.labelColor}`}>{item.label}</span>
                      <span className="text-[9px] text-slate-600 font-medium">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.msg}</p>
                    {item.txHash && (
                      <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="material-symbols-outlined text-[12px] text-emerald-400">verified</span>
                        <span className="text-[10px] font-mono text-slate-500">Tx: {item.txHash}</span>
                        <span className="ml-auto text-[9px] text-emerald-500 font-bold">ON-CHAIN</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
