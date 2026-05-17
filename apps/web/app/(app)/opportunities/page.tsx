export default function OpportunitiesPage() {
  const OPPS = [
    { pair: 'wETH / stETH', protocol: 'Lido Finance v2', action: 'Rebalance', actionBg: 'bg-primary-container/10 border-primary-container/30 text-primary', risk: 0.12, riskColor: 'bg-tertiary', ev: '+$3,420', apy: '+12.4% APY', evColor: 'text-tertiary' },
    { pair: 'USDC / DAI', protocol: 'Curve 3Pool Expansion', action: 'Enter', actionBg: 'bg-tertiary-container/10 border-tertiary-container/30 text-tertiary', risk: 0.04, riskColor: 'bg-tertiary', ev: '+$1,890', apy: '+5.2% APY', evColor: 'text-tertiary' },
    { pair: 'SOL / jitoSOL', protocol: 'Jupiter Aggregator', action: 'Exit', actionBg: 'bg-error-container/20 border-error/20 text-error', risk: 0.78, riskColor: 'bg-error', ev: '-$450', apy: 'Risk Mitigation', evColor: 'text-error' },
    { pair: 'ARB / GMX', protocol: 'GMX V2 LP', action: 'Enter', actionBg: 'bg-primary-container/10 border-primary-container/30 text-primary', risk: 0.31, riskColor: 'bg-primary', ev: '+$2,110', apy: '+24.1% APY', evColor: 'text-tertiary' },
  ];

  return (
    <div className="p-margin max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-stack-lg">
        <div>
          <h1 className="font-h1 text-h1 text-slate-900">Market Opportunities</h1>
          <p className="text-body-md text-slate-500 mt-2">AI-curated liquidity paths with prioritized expected value (EV).</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Global Risk Gate</span>
            <span className="font-h3 text-primary">0.42 / 1.0</span>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '42%' }} />
          </div>
        </div>
      </div>

      {/* Neural Reasoning Summary */}
      <div className="grid grid-cols-12 gap-gutter mb-stack-lg">
        <div className="col-span-8 bg-white border border-slate-200 rounded-xl p-gutter relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
          <div className="flex items-center gap-3 mb-stack-md">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h2 className="font-h3 text-h3">Neural Reasoning Summary</h2>
          </div>
          <p className="text-body-lg text-slate-600 leading-relaxed mb-stack-md">
            Market volatility in the <span className="font-semibold text-slate-900">ETH/LST</span> sector has created a temporal divergence in lending rates. My analysis suggests a{' '}
            <span className="text-tertiary font-bold">14.2% increase</span> in capital efficiency by rotating idle USDC into the new Frax Ether v3 vaults. Macro sentiment indicators are trending towards 0.65 neutral-bullish, justifying a moderate risk exposure increase in automated delta-neutral strategies.
          </p>
          <div className="flex gap-stack-md">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-slate-200 rounded-full">
              <span className="text-label-caps text-slate-500">Confidence</span>
              <span className="text-label-caps font-bold text-primary">94.2%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-slate-200 rounded-full">
              <span className="text-label-caps text-slate-500">Data Sources</span>
              <span className="text-label-caps font-bold text-primary">18 Nodes</span>
            </div>
          </div>
        </div>
        <div className="col-span-4 bg-primary text-white rounded-xl p-gutter flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed opacity-80">Aggregate EV</span>
            <div className="text-h1 font-h1 mt-2">$12,492<span className="text-h3 opacity-60">.50</span></div>
            <p className="text-body-sm text-primary-fixed mt-stack-sm">Expected monthly yield from top 5 suggested actions.</p>
          </div>
          <button className="w-full py-3 bg-white text-primary font-label-caps rounded-lg flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            Execute All Primary Actions
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-stack-md">
        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border border-slate-200 rounded-lg">
          {['Market Pair', 'Action', 'Risk Score', 'Exp. Value (EV)', 'Logic'].map((h, i) => (
            <div key={h} className={`font-label-caps text-label-caps text-slate-400 ${i === 0 ? 'col-span-3' : i === 4 ? 'col-span-3 text-right' : 'col-span-2 text-center'}`}>{h}</div>
          ))}
        </div>

        {OPPS.map(o => (
          <div key={o.pair} className="grid grid-cols-12 items-center px-6 py-5 bg-white border border-slate-200 rounded-xl hover:border-primary-container transition-all hover:bg-slate-50/50">
            <div className="col-span-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {o.pair.split('/')[0].trim()[0]}
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
                  {o.pair.split('/')[1].trim()[0]}
                </div>
              </div>
              <div>
                <div className="font-h3 text-body-md text-slate-900">{o.pair}</div>
                <div className="text-body-sm text-slate-400">{o.protocol}</div>
              </div>
            </div>
            <div className="col-span-2 flex justify-center">
              <span className={`px-3 py-1 rounded-full border text-label-caps ${o.actionBg}`}>{o.action}</span>
            </div>
            <div className="col-span-2">
              <div className="flex flex-col items-center">
                <span className="font-data-mono text-slate-700">{o.risk.toFixed(2)}</span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2">
                  <div className={`h-full ${o.riskColor}`} style={{ width: `${o.risk * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="col-span-2 text-right">
              <div className={`font-h3 text-body-md ${o.evColor}`}>{o.ev}</div>
              <div className="text-[10px] text-slate-400">{o.apy}</div>
            </div>
            <div className="col-span-3 flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-primary transition-colors border border-slate-200 rounded-lg font-label-caps">
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
          <h3 className="font-h3 text-h3 flex items-center gap-2">
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
          {[
            { label: 'Liquidity Depth', status: 'High', score: '98.2 / 100', pct: 98, color: 'bg-tertiary', textColor: 'text-tertiary' },
            { label: 'Volatility Hedge', status: 'Mod', score: '65.0 / 100', pct: 65, color: 'bg-primary', textColor: 'text-primary' },
            { label: 'Smart Contract', status: 'Safe', score: 'Audit ✅', pct: 100, color: 'bg-tertiary', textColor: 'text-tertiary' },
            { label: 'Gas Efficiency', status: 'Low', score: '72 Gwei', pct: 30, color: 'bg-error', textColor: 'text-error' },
          ].map(({ label, status, score, pct, color, textColor }) => (
            <div key={label} className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">{label}</div>
              <div className="flex justify-between items-end">
                <span className={`text-h3 font-h3 ${textColor}`}>{status}</span>
                <span className="text-label-caps text-slate-400">{score}</span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full mt-3">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
