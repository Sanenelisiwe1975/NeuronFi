'use client';

import { useState, useCallback } from 'react';
import { ToastContainer, ToastData } from 'components/Toast';

const POOLS = [
  { pair: 'ETH / USDC', protocol: 'Uniswap V3', tvl: '$42.8M', apy: '8.4%', vol24h: '$12.4M', myShare: '$45,200', myPct: '0.11%', status: 'In Position', statusColor: 'text-tertiary bg-tertiary/10 border-tertiary/20', fee: '0.05%', risk: 'Low', riskColor: 'text-tertiary' },
  { pair: 'USDC / DAI', protocol: 'Curve 3Pool', tvl: '$280M', apy: '5.2%', vol24h: '$88M', myShare: '—', myPct: '—', status: 'Available', statusColor: 'text-primary bg-primary/10 border-primary/20', fee: '0.01%', risk: 'Low', riskColor: 'text-tertiary' },
  { pair: 'wETH / stETH', protocol: 'Lido v2', tvl: '$620M', apy: '12.4%', vol24h: '$34M', myShare: '—', myPct: '—', status: 'Available', statusColor: 'text-primary bg-primary/10 border-primary/20', fee: '0.04%', risk: 'Med', riskColor: 'text-amber-500' },
  { pair: 'ARB / GMX', protocol: 'GMX V2 LP', tvl: '$18M', apy: '24.1%', vol24h: '$6.2M', myShare: '—', myPct: '—', status: 'Available', statusColor: 'text-primary bg-primary/10 border-primary/20', fee: '0.25%', risk: 'High', riskColor: 'text-error' },
  { pair: 'SOL / jitoSOL', protocol: 'Jupiter', tvl: '$92M', apy: '9.8%', vol24h: '$22M', myShare: '—', myPct: '—', status: 'Exit Signal', statusColor: 'text-error bg-error/10 border-error/20', fee: '0.06%', risk: 'Med', riskColor: 'text-amber-500' },
];

let nextId = 1;

export default function LiquidityPoolsPage() {
  const [selected, setSelected] = useState(POOLS[0]!);
  const [addAmount, setAddAmount] = useState('');
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  const push = useCallback((toast: Omit<ToastData, 'id'>) => {
    setToasts(t => [...t, { ...toast, id: nextId++ }]);
  }, []);

  const handleAction = async () => {
    if (!addAmount || Number(addAmount) <= 0) {
      push({ type: 'warning', title: 'Enter an amount', msg: `Specify how much to ${tab === 'add' ? 'add' : 'remove'} before confirming.` });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    if (tab === 'add') {
      push({ type: 'success', title: 'Liquidity Added', msg: `$${Number(addAmount).toLocaleString()} USDC deposited into ${selected.pair} pool.` });
    } else {
      push({ type: 'success', title: 'Liquidity Removed', msg: `${addAmount}% of your ${selected.pair} position has been withdrawn.` });
    }
    setAddAmount('');
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-8">
        <h1 className="font-manrope font-bold text-[40px] tracking-tight text-on-surface mb-2">Liquidity Pools</h1>
        <p className="text-base text-outline">Monitor and manage LP positions across DeFi protocols. AI-ranked by expected value.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total LP Value', val: '$45,200', icon: 'account_balance', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Avg APY', val: '8.4%', icon: 'trending_up', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'Fees Earned (7d)', val: '$312.40', icon: 'payments', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'Imperm. Loss', val: '-$84.20', icon: 'swap_vert', color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, val, icon, color, bg }) => (
          <div key={label} className="bg-white border border-outline-variant rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${color}`}>{icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">{label}</p>
              <p className="font-manrope font-bold text-xl text-on-surface">{val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Pool table */}
        <div className="col-span-8">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-manrope font-semibold text-lg text-on-surface">Available Pools</h2>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Click a row to manage · AI-Ranked by EV</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Pool', 'TVL', 'APY', 'Vol 24h', 'My Share', 'Risk', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-outline">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {POOLS.map(p => {
                    const isSelected = selected.pair === p.pair;
                    return (
                      <tr
                        key={p.pair}
                        onClick={() => setSelected(p)}
                        className={`cursor-pointer transition-all group ${
                          isSelected
                            ? 'bg-primary/8 border-l-4 border-l-primary'
                            : 'hover:bg-surface-container-low border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {p.pair.split('/').map(t => (
                                <div key={t} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                                  {t.trim()[0]}
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{p.pair}</p>
                              <p className="text-[10px] text-outline">{p.protocol} · {p.fee}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-on-surface">{p.tvl}</td>
                        <td className="px-4 py-4 text-sm font-bold text-tertiary">{p.apy}</td>
                        <td className="px-4 py-4 text-sm text-outline">{p.vol24h}</td>
                        <td className="px-4 py-4 text-sm font-medium text-on-surface">{p.myShare}</td>
                        <td className={`px-4 py-4 text-sm font-bold ${p.riskColor}`}>{p.risk}</td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${p.statusColor}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? 'text-primary' : 'text-outline group-hover:text-primary'}`}>
                            {isSelected ? 'chevron_right' : 'chevron_right'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pool actions panel */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white border border-primary/30 rounded-xl p-6 shadow-lg shadow-primary/5">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex -space-x-1">
                  {selected.pair.split('/').map(t => (
                    <div key={t} className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      {t.trim()[0]}
                    </div>
                  ))}
                </div>
                <h3 className="font-manrope font-bold text-lg text-on-surface">{selected.pair}</h3>
              </div>
              <p className="text-sm text-outline">{selected.protocol} · Fee: {selected.fee}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'APY', val: selected.apy, color: 'text-tertiary' },
                { label: 'TVL', val: selected.tvl, color: 'text-on-surface' },
                { label: 'My Share', val: selected.myShare, color: 'text-on-surface' },
                { label: 'Risk', val: selected.risk, color: selected.riskColor },
              ].map(({ label, val, color }) => (
                <div key={label} className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">{label}</p>
                  <p className={`font-manrope font-bold text-base ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            {/* Add/Remove tabs */}
            <div className="flex bg-surface-container-low rounded-lg p-1 mb-4">
              {(['add', 'remove'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setAddAmount(''); }}
                  className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-outline hover:text-on-surface'}`}
                >
                  {t === 'add' ? 'Add Liquidity' : 'Remove'}
                </button>
              ))}
            </div>

            <label className="block mb-4">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                {tab === 'add' ? 'Amount (USDC)' : 'Remove (%)'}
              </span>
              <input
                type="number"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                placeholder={tab === 'add' ? 'Enter USDC amount' : '0 – 100'}
                className="mt-1.5 w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </label>

            <button
              type="button"
              onClick={handleAction}
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-manrope font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                tab === 'add'
                  ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                  : 'bg-error text-white hover:opacity-90 shadow-lg shadow-error/20'
              }`}
            >
              {submitting ? (
                <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Processing…</>
              ) : tab === 'add' ? (
                <><span className="material-symbols-outlined text-[18px]">add_circle</span> Add Liquidity to {selected.pair}</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">remove_circle</span> Remove Liquidity</>
              )}
            </button>
          </div>

          {/* AI recommendation */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Agent Recommendation</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
              &ldquo;Rotate 20% of idle USDC into the <span className="font-bold text-on-surface">wETH / stETH</span> pool. LST rate divergence creates a <span className="text-tertiary font-bold">+14.2% EV</span> opportunity over the next 48h.&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                const pool = POOLS.find(p => p.pair === 'wETH / stETH')!;
                setSelected(pool);
                setTab('add');
                push({ type: 'info', title: 'Recommendation Applied', msg: 'wETH / stETH pool selected. Enter your USDC amount to proceed.' });
              }}
              className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              Apply Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
