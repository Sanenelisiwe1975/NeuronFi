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
      {/* Stats row */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-12">
            <div>
              <p className="text-label-caps text-slate-500 mb-1">USDC BALANCE</p>
              <h2 className="text-h3 font-manrope text-slate-900">{usdcBalance}</h2>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-label-caps text-slate-500 mb-1">AGENT CYCLES</p>
              <h2 className="text-h3 font-manrope text-slate-900">{agent?.iteration ?? '—'}</h2>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-label-caps text-slate-500 mb-1">WIN RATE</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[16px]">speed</span>
                <span className="text-body-md font-semibold text-slate-900">{agent?.winRate ?? '—'}</span>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-label-caps text-slate-500 mb-1">MARKETS</p>
              <h2 className="text-h3 font-manrope text-slate-900">{markets.length}</h2>
            </div>
          </div>
          <div>
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-3 ${agentActive ? 'bg-tertiary-container/10 border-tertiary-container/30' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-2 h-2 rounded-full ${agentActive ? 'bg-tertiary animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-body-sm font-medium text-slate-600">
                {agentActive ? 'Real-time Stream: Active' : 'Real-time Stream: Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!agentActive && (
        <div className="px-8 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
          <p className="text-body-sm font-medium text-amber-800">
            Agent execution is currently paused. Manual intervention or risk parameter adjustment required to resume.
          </p>
        </div>
      )}

      <div className="p-8 max-w-[1440px] mx-auto grid grid-cols-12 gap-gutter">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
          {/* Market Overview */}
          <section className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[16px]">currency_bitcoin</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[16px]">attach_money</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-h3 text-slate-900">ETH / USDC</h3>
                  <p className="text-body-sm text-slate-500">Uniswap V3 Pool • 0.05% tier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-h3 font-h3 text-slate-900">$2,412.84</p>
                <p className="text-body-sm font-semibold text-tertiary">+2.4% (24h)</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-48 w-full bg-surface-container-lowest rounded-lg border border-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                <path d="M0,150 Q50,120 100,140 T200,100 T300,160 T400,80 T500,120 T600,60 T700,90 T800,40" fill="none" stroke="#00677f" strokeLinecap="round" strokeWidth="3" />
                <path d="M0,150 Q50,120 100,140 T200,100 T300,160 T400,80 T500,120 T600,60 T700,90 T800,40 L800,200 L0,200 Z" fill="url(#grad1)" opacity="0.1" />
                <defs>
                  <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00677f', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#00677f', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Liquidity', val: '$42.8M' },
                { label: 'Volume 24h', val: '$12.4M' },
                { label: 'Fees 24h', val: '$6,210' },
                { label: 'Utilization', val: '18.4%' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-surface-container-low p-3 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</p>
                  <p className="text-body-md font-bold text-slate-900">{val}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Active Positions */}
          <section className="bg-white rounded-xl border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-h3 text-body-lg font-bold text-slate-900">Active Positions</h3>
              <Link href="/positions" className="text-primary text-body-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Market / Protocol', 'Size (USD)', 'Entry Price', 'PnL', 'Risk Score', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-label-caps text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'WETH/USDC LP', protocol: 'Uniswap V3', icon: 'swap_horiz', size: '$45,200.00', entry: '$2,384.10', pnl: '+$1,120.45', pnlPos: true, risk: 'Low', riskW: 'w-1/4', riskC: 'bg-tertiary' },
                    { name: 'ARB/USDC Long', protocol: 'GMX V2', icon: 'trending_up', size: '$28,000.00', entry: '$1.82', pnl: '-$430.12', pnlPos: false, risk: 'Med', riskW: 'w-3/4', riskC: 'bg-orange-500' },
                  ].map(row => (
                    <tr key={row.name} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600">{row.icon}</span>
                          </div>
                          <div>
                            <p className="text-body-sm font-bold text-slate-900">{row.name}</p>
                            <p className="text-[10px] text-slate-500">{row.protocol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-sm font-medium text-slate-900">{row.size}</td>
                      <td className="px-6 py-4 text-body-sm text-slate-600">{row.entry}</td>
                      <td className={`px-6 py-4 text-body-sm font-bold ${row.pnlPos ? 'text-tertiary' : 'text-error'}`}>{row.pnl}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`${row.riskW} h-full ${row.riskC}`} />
                          </div>
                          <span className="text-body-sm font-semibold text-slate-700">{row.risk}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-50 rounded-lg">
                          <span className="material-symbols-outlined text-slate-400">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          {/* AI Opportunities */}
          <section className="bg-white rounded-xl border border-outline-variant p-6">
            <h3 className="font-h3 text-body-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-500">bolt</span>
              AI Opportunities
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-bold rounded">EV: +14.2%</span>
                  <span className="text-[10px] text-slate-400 font-medium">Rank #1</span>
                </div>
                <p className="text-body-sm font-bold text-slate-900 mb-2">LDO/ETH Delta Neutral</p>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[14px] mt-1">auto_awesome</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    &ldquo;Detected 4% basis spread between Aave and Curve. High probability of convergence within 48h based on whale wallet inflow.&rdquo;
                  </p>
                </div>
                <Link href="/opportunities">
                  <button className="w-full mt-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">
                    Review Strategy
                  </button>
                </Link>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 opacity-70">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">EV: +8.4%</span>
                  <span className="text-[10px] text-slate-400 font-medium">Rank #2</span>
                </div>
                <p className="text-body-sm font-bold text-slate-900 mb-2">SOL Staking Arbitrage</p>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[14px] mt-1">auto_awesome</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    &ldquo;Identified jitoSOL pricing inefficiency on Jupiter aggregator. Execution risk: Low.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Agent Feed */}
          <section className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <h3 className="font-h3 text-body-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">terminal</span>
              Agent Feed
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-px before:bg-slate-800">
              {[
                { dot: 'bg-cyan-400', label: 'Trade Execution', labelColor: 'text-cyan-400', time: 'Just now', msg: 'Rebalanced ETH-USDC LP range to $2,350-$2,500.', tx: '0x4a2...9f3e' },
                { dot: 'bg-slate-600', label: 'Reasoning', labelColor: 'text-slate-400', time: '12m ago', msg: '"Volatility index increasing. Shifting 15% of capital to low-leverage stable pools."', tx: null },
                { dot: 'bg-slate-600', label: 'Attestation', labelColor: 'text-slate-400', time: '45m ago', msg: 'Proof-of-Logic generated via EigenLayer AVS. Verified.', tx: null },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full ${item.dot} ring-4 ring-slate-900`} />
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${item.labelColor}`}>{item.label}</p>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-body-sm font-medium text-slate-300">{item.msg}</p>
                    {item.tx && (
                      <div className="mt-2 p-2 bg-slate-800/50 rounded border border-slate-700/50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                        <span className="text-[10px] text-slate-400 font-mono">Tx Hash: {item.tx}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Promo */}
          <div className="bg-gradient-to-br from-primary to-cyan-700 rounded-xl p-6 text-white">
            <h4 className="font-bold mb-2">New: Neuron AI v3.0</h4>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">Upgrade your agent to unlock cross-chain flashloan arbitrage logic and institutional risk modeling.</p>
            <button className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-xs font-bold hover:bg-white/30 transition-all">
              Explore Roadmap
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
