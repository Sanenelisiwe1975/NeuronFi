'use client';

import { useState, useCallback } from 'react';
import { ToastContainer, ToastData } from 'components/Toast';

let nextId = 1;

const POSITIONS = [
  {
    asset: 'BTC/USDC Long',
    entry: '$64,231.50',
    size: '1.25 BTC',
    sizeUsd: '$80,289',
    pnl: '+$4,210.12',
    pct: '+5.24%',
    pos: true,
    icon: 'currency_bitcoin',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    lockStatus: 'Committed (2.1% fee)',
    locked: true,
    risk: 32,
    riskW: 'w-1/3',
    id: 'N-45092',
    leverage: '2.50x',
    margin: '$32,040',
    stop: '$61,980',
    tp: '$68,500',
    rationale: 'Persistent divergence between Spot and Futures funding rates on Kraken. Whale accumulation (0x4f…ae) in $63k–$64k range detected. Risk engine permits 2.5x leverage with 3.5% trailing stop.',
  },
  {
    asset: 'ETH Volatility Straddle',
    entry: '$3,450.00',
    size: '45.00 ETH',
    sizeUsd: '$155,250',
    pnl: '-$1,120.40',
    pct: '-0.72%',
    pos: false,
    icon: 'diamond',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    lockStatus: 'Pending Drawdown',
    locked: false,
    risk: 61,
    riskW: 'w-3/5',
    id: 'N-45088',
    leverage: '1.00x',
    margin: '$155,250',
    stop: '$3,100',
    tp: '$3,900',
    rationale: 'Implied volatility exceeds realized by 18%. Straddle captures both-direction breakout within 72h window. Delta-neutral exposure, managed via on-chain options vault.',
  },
  {
    asset: 'SOL/USDC Perp',
    entry: '$142.12',
    size: '850.00 SOL',
    sizeUsd: '$120,802',
    pnl: '+$842.15',
    pct: '+0.70%',
    pos: true,
    icon: 'token',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    lockStatus: 'Committed (1.5% fee)',
    locked: true,
    risk: 24,
    riskW: 'w-1/4',
    id: 'N-45081',
    leverage: '3.00x',
    margin: '$40,267',
    stop: '$138.00',
    tp: '$156.00',
    rationale: 'Momentum signal triggered on Jupiter DEX. On-chain volume spike +142% vs. 7d avg. Risk score within safe band. Position capped at 3x leverage per risk engine policy.',
  },
];

const RESOLUTIONS = [
  {
    name: 'ARB/USDC Price Expiry',
    block: '19,452,102',
    price: '$1.1420',
    resolved: true,
    rationale: 'Position exited at T-minus 12 minutes to expiry. Liquidity depth on DEX aggregators showed 0.4% slippage risk increasing. Volatility index signaled a local top; locking gains at $1.14 was mathematically optimal vs. the 0.02% delta improvement from holding to maturity.',
    attestation: '0x8a2f…c92b',
    dispute: '02h 45m 12s',
  },
  {
    name: 'LINK/USDC Delta-Neutral',
    block: '19,451,880',
    price: '$18.92',
    resolved: true,
    rationale: null,
    attestation: '0x3c11…f840',
    dispute: null,
  },
];

export default function PositionsPage() {
  const [selected,     setSelected]     = useState(POSITIONS[0]);
  const [modifying,    setModifying]    = useState(false);
  const [closing,      setClosing]      = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [newStop,      setNewStop]      = useState('');
  const [newTp,        setNewTp]        = useState('');
  const [toasts,       setToasts]       = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const push    = useCallback((toast: Omit<ToastData, 'id'>) => setToasts(t => [...t, { ...toast, id: nextId++ }]), []);

  const handleModify = async () => {
    if (!newStop && !newTp) { push({ type: 'warning', title: 'Nothing changed', msg: 'Enter a new stop-loss or take-profit value.' }); return; }
    setModifying(true);
    await new Promise(r => setTimeout(r, 1100));
    setModifying(false);
    setNewStop(''); setNewTp('');
    push({ type: 'success', title: 'Parameters Updated', msg: `${selected!.asset} — stop-loss and take-profit have been modified on-chain.` });
  };

  const handleClose = async () => {
    setClosing(true);
    await new Promise(r => setTimeout(r, 1400));
    setClosing(false);
    setConfirmClose(false);
    push({ type: 'success', title: 'Position Closed', msg: `${selected!.asset} has been closed. Final PnL: ${selected!.pnl}` });
  };

  return (
    <div className="px-8 py-8 max-w-[1440px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Emergency Close confirmation overlay */}
      {confirmClose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              </div>
              <h3 className="font-manrope font-bold text-on-surface text-[16px]">Close Position?</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              This will market-close <span className="font-bold text-on-surface">{selected!.asset}</span> immediately at the current price. Current PnL: <span className={`font-bold ${selected!.pos ? 'text-tertiary' : 'text-error'}`}>{selected!.pnl}</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmClose(false)}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleClose} disabled={closing}
                className="flex-1 py-2.5 bg-error text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {closing ? <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Closing…</> : 'Confirm Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-manrope font-extrabold text-[38px] leading-none tracking-tight text-on-surface">
          Active Positions
        </h1>
        <p className="text-base text-outline mt-2">Real-time monitoring of autonomous market interactions and cryptographic attestations.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left — Positions + Resolution */}
        <section className="col-span-12 lg:col-span-8 space-y-6">

          {/* Open Positions */}
          <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="font-manrope font-bold text-on-surface">Open Positions</h2>
              <span className="px-2.5 py-0.5 bg-primary/8 text-primary text-[10px] font-extrabold rounded-full border border-primary/15">
                {POSITIONS.length} ACTIVE
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    {['Asset / Market', 'Size', 'PnL', 'Fee Lock', 'Risk', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-outline">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {POSITIONS.map(p => {
                    const isActive = selected.asset === p.asset;
                    return (
                      <tr
                        key={p.asset}
                        onClick={() => setSelected(p)}
                        className={`cursor-pointer transition-all ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-container-low/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${p.iconBg} flex items-center justify-center flex-shrink-0`}>
                              <span className={`material-symbols-outlined text-[18px] ${p.iconColor}`}>{p.icon}</span>
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-on-surface">{p.asset}</p>
                              <p className="text-[10px] text-outline">Entry: {p.entry}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-[12px] font-semibold text-on-surface">{p.size}</p>
                          <p className="text-[10px] text-outline">{p.sizeUsd}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-[13px] font-extrabold ${p.pos ? 'text-tertiary' : 'text-error'}`}>{p.pnl}</p>
                          <p className={`text-[10px] font-semibold ${p.pos ? 'text-tertiary/70' : 'text-error/70'}`}>{p.pct}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[16px] ${p.locked ? 'text-primary icon-filled' : 'text-outline'}`}>
                              {p.locked ? 'lock' : 'lock_open'}
                            </span>
                            <span className={`text-[11px] font-medium ${p.locked ? 'text-primary' : 'text-outline'}`}>{p.lockStatus}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${p.riskW} ${p.risk < 40 ? 'bg-tertiary' : p.risk < 65 ? 'bg-amber-400' : 'bg-error'}`} />
                            </div>
                            <span className="text-[10px] font-bold text-outline">{p.risk}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white' : 'text-primary border border-primary/20 hover:bg-primary/5'}`}
                          >
                            {isActive ? 'Selected' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Resolution Feed */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
              </div>
              <h3 className="font-manrope font-bold text-on-surface">Market Resolution Feed</h3>
            </div>
            <div className="space-y-4">
              {RESOLUTIONS.map(r => (
                <div
                  key={r.name}
                  className="rounded-xl border border-outline-variant bg-surface-container-low overflow-hidden hover:border-primary/20 transition-all"
                >
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-outline-variant flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">candlestick_chart</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-manrope font-bold text-on-surface text-[14px]">{r.name}</h4>
                          <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[9px] font-extrabold rounded-full uppercase tracking-wider">Resolved</span>
                        </div>
                        <p className="text-[10px] text-outline mt-0.5">Block #{r.block}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1">Final Price · Chainlink</p>
                      <p className="font-manrope font-extrabold text-primary text-[20px] leading-none">{r.price}</p>
                    </div>
                  </div>

                  {r.rationale && (
                    <div className="px-5 pb-4 pt-0">
                      <div className="bg-white border border-outline-variant/60 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary text-[14px] icon-filled">auto_awesome</span>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant">Agent Rationale</span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant italic leading-relaxed">&ldquo;{r.rationale}&rdquo;</p>
                      </div>
                    </div>
                  )}

                  <div className="px-5 py-3 border-t border-outline-variant/50 flex items-center justify-between">
                    <a
                      href={`https://testnet.kitescan.ai/tx/${r.attestation}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:opacity-70 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified_user</span>
                      Kite Attestation: {r.attestation}
                    </a>
                    {r.dispute ? (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-error text-[14px]">timer</span>
                        <span className="text-[10px] font-bold text-error">Dispute: {r.dispute}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-outline">Window Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right — Drill-down */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden sticky top-24">
            {/* Drill-down header */}
            <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">open_in_full</span>
                <h3 className="font-manrope font-bold text-on-surface text-[14px]">Position Drill-down</h3>
              </div>
              <span className="font-mono text-[10px] text-outline bg-surface-container-low px-2 py-1 rounded-lg border border-outline-variant">ID: {selected.id}</span>
            </div>

            <div className="p-5">
              {/* Badge + Chart */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold rounded-full border border-primary/20 uppercase tracking-wider">
                  LONG {selected.asset.split('/')[0].trim()}
                </span>
                <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${selected.pos ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' : 'bg-error/10 text-error border border-error/20'}`}>
                  {selected.pos ? '▲ Profitable' : '▼ Drawdown'}
                </span>
              </div>

              {/* Chart */}
              <div className="rounded-xl bg-slate-950 overflow-hidden relative mb-4 h-36">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 144" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ddGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor={selected.pos ? '#00d1ff' : '#ef4444'} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={selected.pos ? '#00d1ff' : '#ef4444'} stopOpacity="0" />
                    </linearGradient>
                    <filter id="ddGlow">
                      <feGaussianBlur stdDeviation="2" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <path d="M0,130 L40,110 L80,115 L120,80 L160,95 L200,45 L240,65 L280,30 L320,55 L360,22 L400,38 L400,144 L0,144 Z" fill="url(#ddGrad)" />
                  <path d="M0,130 L40,110 L80,115 L120,80 L160,95 L200,45 L240,65 L280,30 L320,55 L360,22 L400,38" fill="none" stroke={selected.pos ? '#00d1ff' : '#ef4444'} strokeWidth="2" strokeLinecap="round" filter="url(#ddGlow)" />
                </svg>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selected.pos ? 'bg-cyan-400' : 'bg-red-400'}`} />
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">Live</span>
                </div>
                <div className="absolute top-3 right-3 text-right">
                  <p className={`font-manrope font-extrabold text-[18px] leading-none ${selected.pos ? 'text-cyan-300' : 'text-red-400'}`}>{selected.pnl}</p>
                  <p className={`text-[10px] font-bold ${selected.pos ? 'text-cyan-500' : 'text-red-500'}`}>{selected.pct}</p>
                </div>
              </div>

              {/* Position params */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Leverage', val: selected.leverage, color: 'text-on-surface' },
                  { label: 'Margin', val: selected.margin, color: 'text-on-surface' },
                  { label: 'Stop Loss', val: selected.stop, color: 'text-error' },
                  { label: 'Take Profit', val: selected.tp, color: 'text-tertiary' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="p-3 rounded-xl border border-outline-variant bg-surface-container-low">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-outline mb-1.5">{label}</p>
                    <p className={`font-manrope font-extrabold text-[16px] leading-none ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* AI Rationale */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-primary text-[13px] icon-filled">auto_awesome</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant">Entry Rationale · Neural Link</span>
                </div>
                <div className="bg-surface-container-low border-l-4 border-primary p-4 rounded-xl">
                  <p className="text-[11px] text-on-surface-variant leading-relaxed italic">&ldquo;{selected.rationale}&rdquo;</p>
                </div>
              </div>

              {/* Modify Parameters inline form */}
              <div className="mb-4 space-y-3">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-outline">Modify Parameters</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-outline font-bold uppercase tracking-wider block mb-1">New Stop Loss</label>
                    <input
                      type="text"
                      value={newStop}
                      onChange={e => setNewStop(e.target.value)}
                      placeholder={selected!.stop}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-[12px] text-on-surface focus:outline-none focus:border-error focus:ring-1 focus:ring-error/20 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-outline font-bold uppercase tracking-wider block mb-1">New Take Profit</label>
                    <input
                      type="text"
                      value={newTp}
                      onChange={e => setNewTp(e.target.value)}
                      placeholder={selected!.tp}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-[12px] text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/20 font-mono"
                    />
                  </div>
                </div>
                <button type="button" onClick={handleModify} disabled={modifying}
                  className="w-full bg-primary text-white py-3 rounded-xl font-manrope font-bold text-[13px] shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {modifying
                    ? <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Updating…</>
                    : <><span className="material-symbols-outlined text-[16px]">edit</span> Apply Changes</>}
                </button>
              </div>
              <button type="button" onClick={() => setConfirmClose(true)}
                className="w-full bg-transparent text-error border border-error/25 py-3 rounded-xl font-manrope font-bold text-[12px] hover:bg-error/5 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[15px]">close</span>
                Emergency Close Position
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: 'verified', iconColor: 'text-tertiary', bg: 'bg-tertiary/8', label: 'Total Attested Value', val: '$4,502,912.45', sub: 'Kite Registry' },
          { icon: 'gavel', iconColor: 'text-primary', bg: 'bg-primary/8', label: 'Dispute Rate (90d)', val: '0.02%', sub: 'Well below 1% threshold' },
          { icon: 'sync', iconColor: 'text-secondary', bg: 'bg-secondary/8', label: 'Registry Sync', val: 'Synced 14s ago', sub: 'Kite testnet · Block #19,452,112' },
        ].map(({ icon, iconColor, bg, label, val, sub }) => (
          <div key={label} className="bg-white border border-outline-variant p-4 rounded-2xl flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{label}</p>
              <p className="font-manrope font-bold text-[15px] text-on-surface leading-none mt-1">{val}</p>
              <p className="text-[10px] text-outline mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
