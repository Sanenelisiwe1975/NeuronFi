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
        <div className="col-span-8 bg-white border border-slate-200 rounded-xl card-shadow p-gutter relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
          <div className="flex items-center gap-3 mb-stack-md">
            <span className="material-symbols-outlined text-primary icon-filled">psychology</span>
            <h2 className="font-manrope font-bold text-h3">Neural Reasoning Summary</h2>
          </div>
          <p className="text-body-lg text-on-surface-variant leading-relaxed mb-stack-md">
            Market volatility in the <span className="font-semibold text-on-surface">ETH/LST</span> sector has created a temporal divergence in lending rates. My analysis suggests a{' '}
            <span className="text-tertiary font-bold">14.2% increase</span> in capital efficiency by rotating idle USDC into the new Frax Ether v3 vaults. Macro sentiment indicators are trending towards 0.65 neutral-bullish, justifying a moderate risk exposure increase in automated delta-neutral strategies.
          </p>
          <div className="flex gap-stack-md flex-wrap">
            {[
              { label: 'Confidence', val: '94.2%' },
              { label: 'Data Sources', val: '18 Nodes' },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-slate-200 rounded-full">
                <span className="text-label-caps text-outline">{label}</span>
                <span className="text-label-caps font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 bg-primary text-white rounded-xl card-shadow p-gutter flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Aggregate EV</span>
            <div className="font-manrope font-bold text-h1 mt-2">
              $12,492<span className="text-h3 opacity-60">.50</span>
            </div>
            <p className="text-body-sm mt-stack-sm opacity-80">Expected monthly yield from top 5 suggested actions.</p>
          </div>
          <button type="button" className="relative w-full py-3 bg-white text-primary font-label-caps rounded-lg flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors mt-6">
            <span className="material-symbols-outlined text-sm icon-filled">bolt</span>
            Execute All Primary Actions
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
