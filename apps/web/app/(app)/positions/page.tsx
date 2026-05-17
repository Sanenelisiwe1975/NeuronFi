'use client';

import { useState } from 'react';

const POSITIONS = [
  { asset: 'BTC/USDC Long', entry: '$64,231.50', size: '1.25 BTC', pnl: '+$4,210.12', pct: '+5.2%', pos: true, icon: 'currency_bitcoin', lockStatus: 'Committed (2.1%)', locked: true },
  { asset: 'ETH Volatility Straddle', entry: '$3,450.00', size: '45.00 ETH', pnl: '-$1,120.40', pct: '-0.8%', pos: false, icon: 'diamond', lockStatus: 'Pending Drawdown', locked: false },
  { asset: 'SOL/USDC Perp', entry: '$142.12', size: '850.00 SOL', pnl: '+$842.15', pct: '+2.1%', pos: true, icon: 'token', lockStatus: 'Committed (1.5%)', locked: true },
];

const RESOLUTIONS = [
  {
    name: 'ARB/USDC Price Expiry',
    block: '19,452,102',
    price: '$1.1420',
    resolved: true,
    rationale: 'Position exited at T-minus 12 minutes to expiry. Liquidity depth on DEX aggregators showed a 0.4% slippage risk increasing. Volatility index signaled a local top; locking gains at $1.14 was mathematically optimal vs. the 0.02% delta improvement from holding to maturity.',
    attestation: '0x8a2f...c92b',
    dispute: '02h 45m 12s',
  },
  {
    name: 'LINK/USDC Delta-Neutral',
    block: '19,451,880',
    price: '$18.92',
    resolved: true,
    rationale: null,
    attestation: null,
    dispute: null,
  },
];

export default function PositionsPage() {
  const [selected, setSelected] = useState(POSITIONS[0]);

  return (
    <div className="px-10 py-8 max-w-[1440px] mx-auto">
      <div className="mb-10">
        <h1 className="font-h1 text-h1 text-on-surface mb-2">Active Positions &amp; Resolution</h1>
        <p className="font-body-lg text-body-lg text-outline">Real-time monitoring of autonomous market interactions and cryptographic attestations.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left: Positions + Resolution */}
        <section className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Open Positions */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-h3 text-h3">Open Positions</h2>
              <span className="bg-primary-container/10 text-on-primary-container text-xs font-bold px-2.5 py-1 rounded-full border border-primary-container/20">
                {POSITIONS.length} ACTIVE
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Asset / Market', 'Position Size', 'PnL (Unrealized)', 'Fee Lock Status', 'Action'].map(h => (
                      <th key={h} className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {POSITIONS.map(p => (
                    <tr key={p.asset} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600">{p.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{p.asset}</div>
                            <div className="text-xs text-outline">Entry: {p.entry}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-data-mono text-data-mono">{p.size}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${p.pos ? 'text-tertiary' : 'text-error'}`}>{p.pnl}</span>
                        <span className={`text-[10px] block ${p.pos ? 'text-tertiary/80' : 'text-error/80'}`}>{p.pct}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-sm ${p.locked ? 'text-primary' : 'text-outline'}`}
                            style={p.locked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {p.locked ? 'lock' : 'lock_open'}
                          </span>
                          <span className={`text-xs font-medium ${p.locked ? 'text-primary' : 'text-outline'}`}>{p.lockStatus}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelected(p)}
                          className="text-primary hover:underline text-sm font-semibold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Resolution Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-h3 text-h3 mb-6">Market Resolution Feed</h3>
            <div className="space-y-4">
              {RESOLUTIONS.map(r => (
                <div key={r.name} className={`p-4 rounded-lg bg-surface-container-low border border-outline-variant relative overflow-hidden ${!r.attestation ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                  {r.attestation && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-tertiary-container text-on-tertiary-container font-label-caps text-[10px] rounded-bl-lg uppercase">
                      Resolved
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-outline-variant">
                        <span className="material-symbols-outlined text-primary">link</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface">{r.name}</h4>
                        <p className="text-xs text-outline">Resolution Block: {r.block}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-outline mb-1 uppercase font-semibold">Final Price (Chainlink)</div>
                      <div className="font-data-mono text-h3 text-primary">{r.price}</div>
                    </div>
                  </div>
                  {r.rationale && (
                    <div className="bg-white/50 p-3 rounded border border-outline-variant/50 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Agent Rationale</span>
                      </div>
                      <p className="text-sm text-on-surface-variant italic leading-relaxed">&ldquo;{r.rationale}&rdquo;</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    {r.attestation ? (
                      <a href={`https://testnet.kitescan.ai/tx/${r.attestation}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80">
                        <span className="material-symbols-outlined text-sm">link</span>
                        Kite Attestation: {r.attestation}
                      </a>
                    ) : (
                      <a href="#" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        Attestation Verified (Finalized)
                      </a>
                    )}
                    {r.dispute ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-sm">timer</span>
                        <span className="text-xs font-bold text-error">Dispute Window: {r.dispute}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-outline">Window Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Drill-down */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-h3 text-h3">Drill-down</h3>
              <button className="material-symbols-outlined text-outline">close</button>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase">
                  LONG {selected.asset.split(' ')[0]}
                </span>
                <span className="text-xs text-outline font-data-mono">ID: N-45092</span>
              </div>
              <div className="aspect-video w-full rounded-lg bg-slate-900 overflow-hidden relative mb-4 flex items-center justify-center">
                <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <path d="M0,180 L40,150 L80,160 L120,100 L160,120 L200,60 L240,80 L280,40 L320,70 L360,30 L400,50" fill="none" stroke="#00d1ff" strokeWidth="2"/>
                  <path d="M0,180 L40,150 L80,160 L120,100 L160,120 L200,60 L240,80 L280,40 L320,70 L360,30 L400,50 L400,200 L0,200 Z" fill="url(#drillGrad)" opacity="0.15"/>
                  <defs>
                    <linearGradient id="drillGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#00d1ff" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#00d1ff" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded border border-white/20 text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  LIVE CHART ACTIVE
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-label-caps text-label-caps text-outline uppercase mb-2">Entry Rationale (AI Neural Link)</h4>
                <div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-cyan-500">
                  <p className="text-sm text-on-surface leading-relaxed">
                    &ldquo;Detected a persistent divergence between Spot and Futures funding rates on Kraken. Whale movement (0x4f...ae) indicates accumulation in the $63k-$64k range. Risk engine permits a 2.5x leverage entry with a 3.5% trailing stop-loss.&rdquo;
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Leverage', val: '2.50x', color: 'text-on-surface' },
                  { label: 'Margin', val: '$32,040', color: 'text-on-surface' },
                  { label: 'Stop Loss', val: '$61,980', color: 'text-error' },
                  { label: 'Take Profit', val: '$68,500', color: 'text-tertiary' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="p-3 rounded-lg border border-outline-variant bg-white">
                    <div className="text-[10px] text-outline uppercase font-bold mb-1">{label}</div>
                    <div className={`font-h3 ${color}`}>{val}</div>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-manrope font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Modify Parameters
                </button>
                <button className="w-full mt-2 bg-transparent text-error border border-error/30 py-3 rounded-xl font-manrope font-bold text-xs hover:bg-error/5 transition-all">
                  Emergency Close Position
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer stats */}
      <div className="mt-gutter grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'verified', iconColor: 'text-tertiary', bg: 'bg-tertiary/10', label: 'Total Attested Value', val: '$4,502,912.45' },
          { icon: 'gavel', iconColor: 'text-primary', bg: 'bg-primary/10', label: 'Dispute Rate (90d)', val: '0.02%' },
          { icon: 'receipt_long', iconColor: 'text-slate-500', bg: 'bg-slate-100', label: 'Kite Registry Status', val: 'Synced (14s ago)' },
        ].map(({ icon, iconColor, bg, label, val }) => (
          <div key={label} className="bg-white border border-outline-variant p-4 rounded-xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </div>
            <div>
              <div className="text-xs text-outline font-semibold uppercase">{label}</div>
              <div className="font-h3 text-on-surface">{val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
