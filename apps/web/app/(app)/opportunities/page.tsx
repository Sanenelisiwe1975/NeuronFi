export default function OpportunitiesPage() {
  const OPPS = [
    {
      pair: 'wETH / stETH',
      protocol: 'Lido Finance v2',
      action: 'Rebalance',
      actionBg: 'bg-primary text-white',
      risk: 0.12,
      riskLabel: 'Low',
      riskColor: 'bg-tertiary',
      riskText: 'text-tertiary',
      ev: '+$3,420',
      apy: '+12.4% APY',
      evColor: 'text-tertiary',
      confidence: 94,
      rationale: 'ETH/LST lending rate divergence detected. Capital efficiency gain: 14.2% via Frax Ether v3 vaults.',
    },
    {
      pair: 'USDC / DAI',
      protocol: 'Curve 3Pool',
      action: 'Enter',
      actionBg: 'bg-tertiary text-white',
      risk: 0.04,
      riskLabel: 'Minimal',
      riskColor: 'bg-tertiary',
      riskText: 'text-tertiary',
      ev: '+$1,890',
      apy: '+5.2% APY',
      evColor: 'text-tertiary',
      confidence: 98,
      rationale: 'Stablecoin yield optimization. 3Pool expansion offers near-zero IL with competitive fee generation.',
    },
    {
      pair: 'SOL / jitoSOL',
      protocol: 'Jupiter Aggregator',
      action: 'Exit',
      actionBg: 'bg-error text-white',
      risk: 0.78,
      riskLabel: 'High',
      riskColor: 'bg-error',
      riskText: 'text-error',
      ev: '-$450',
      apy: 'Risk Mitigation',
      evColor: 'text-error',
      confidence: 81,
      rationale: 'jitoSOL pricing anomaly indicates elevated liquidation risk. Exit preserves $6,200 in unrealized gains.',
    },
    {
      pair: 'ARB / GMX',
      protocol: 'GMX V2 LP',
      action: 'Enter',
      actionBg: 'bg-primary text-white',
      risk: 0.31,
      riskLabel: 'Moderate',
      riskColor: 'bg-primary',
      riskText: 'text-primary',
      ev: '+$2,110',
      apy: '+24.1% APY',
      evColor: 'text-tertiary',
      confidence: 88,
      rationale: 'GMX V2 LP fee yield at 24.1% APY with hedged delta. Optimal entry window: next 6h.',
    },
  ];

  const RISK_GATES = [
    { label: 'Liquidity Depth', status: 'Pass', score: '98.2', pct: 98, color: 'bg-tertiary', textColor: 'text-tertiary', icon: 'water_drop' },
    { label: 'Volatility Hedge', status: 'Caution', score: '65.0', pct: 65, color: 'bg-amber-400', textColor: 'text-amber-600', icon: 'show_chart' },
    { label: 'Smart Contract', status: 'Audited', score: '100', pct: 100, color: 'bg-tertiary', textColor: 'text-tertiary', icon: 'shield' },
    { label: 'Gas Efficiency', status: 'Elevated', score: '72 Gwei', pct: 30, color: 'bg-error', textColor: 'text-error', icon: 'local_gas_station' },
  ];

  return (
    <div className="p-8 max-w-[1440px] mx-auto">

      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-manrope font-extrabold text-[38px] leading-none tracking-tight text-on-surface">
            Market Opportunities
          </h1>
          <p className="text-base text-outline mt-2">AI-curated liquidity paths ranked by expected value (EV).</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-outline-variant rounded-2xl px-5 py-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1">Global Risk Gate</p>
            <p className="font-manrope font-extrabold text-primary text-[22px] leading-none">0.42 / 1.0</p>
          </div>
          <div className="w-28">
            <div className="flex justify-between text-[9px] font-bold text-outline mb-1.5">
              <span>Safe</span><span>Danger</span>
            </div>
            <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: '42%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Neural Reasoning + EV Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Neural Reasoning */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-outline-variant overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-container" />
          <div className="p-6 pl-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div>
                <h2 className="font-manrope font-bold text-on-surface text-[15px] leading-none">Neural Reasoning Summary</h2>
                <p className="text-[10px] text-outline mt-0.5">Claude Sonnet 4.6 · Confidence: 94.2%</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 border border-primary/15 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Inferring</span>
              </div>
            </div>

            <p className="text-[15px] text-on-surface-variant leading-relaxed mb-5">
              Market volatility in the <span className="font-bold text-on-surface">ETH/LST</span> sector has created a temporal divergence in lending rates. Analysis suggests a{' '}
              <span className="text-tertiary font-extrabold">14.2% increase</span> in capital efficiency by rotating idle USDC into Frax Ether v3 vaults. Macro sentiment at{' '}
              <span className="font-semibold text-on-surface">0.65 neutral-bullish</span> justifies moderate risk exposure increase in delta-neutral strategies.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Confidence', val: '94.2%', icon: 'verified' },
                { label: 'Data Sources', val: '18 Nodes', icon: 'hub' },
                { label: 'Signal Age', val: '4m ago', icon: 'schedule' },
                { label: 'Model', val: 'Claude Sonnet 4.6', icon: 'smart_toy' },
              ].map(({ label, val, icon }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full">
                  <span className="material-symbols-outlined text-[12px] text-outline">{icon}</span>
                  <span className="text-[10px] text-outline font-semibold">{label}:</span>
                  <span className="text-[10px] font-extrabold text-primary">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aggregate EV */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl overflow-hidden relative bg-gradient-to-br from-primary to-[#004e60] text-white p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <p className="text-[9px] font-bold uppercase tracking-widest text-primary-fixed opacity-70 mb-2">Aggregate EV This Cycle</p>
            <div className="font-manrope font-extrabold text-[44px] leading-none mb-1">
              $12,492
              <span className="text-[24px] opacity-50">.50</span>
            </div>
            <p className="text-[12px] text-primary-fixed opacity-70 mb-6">Expected monthly yield from top 5 actions.</p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { label: 'Actions', val: '4' },
                { label: 'Avg Confidence', val: '90.2%' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/10 border border-white/15 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary-fixed opacity-60 mb-1">{label}</p>
                  <p className="font-manrope font-bold text-[16px] text-white">{val}</p>
                </div>
              ))}
            </div>

            <button type="button" className="w-full py-3 bg-white text-primary font-manrope font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors shadow-lg shadow-black/20">
              <span className="material-symbols-outlined text-[16px] icon-filled">bolt</span>
              Execute All Primary Actions
            </button>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="mb-8">
        {/* Header row */}
        <div className="grid grid-cols-12 px-6 py-3 bg-surface-container-low border border-outline-variant rounded-xl mb-2">
          {[
            { label: 'Market Pair', span: 'col-span-3' },
            { label: 'Action', span: 'col-span-2 text-center' },
            { label: 'Risk Score', span: 'col-span-2 text-center' },
            { label: 'Exp. Value', span: 'col-span-2 text-right' },
            { label: 'Confidence', span: 'col-span-2 text-center' },
            { label: '', span: 'col-span-1' },
          ].map(({ label, span }) => (
            <div key={label} className={`${span} text-[10px] font-extrabold uppercase tracking-widest text-outline`}>{label}</div>
          ))}
        </div>

        <div className="space-y-2">
          {OPPS.map(o => (
            <div
              key={o.pair}
              className="grid grid-cols-12 items-center px-6 py-5 bg-white border border-outline-variant rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              {/* Pair */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="flex -space-x-2 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                    {o.pair.split('/')[0].trim()[0]}
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-on-surface-variant flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                    {o.pair.split('/')[1].trim()[0]}
                  </div>
                </div>
                <div>
                  <p className="font-manrope font-bold text-on-surface text-[14px] leading-none">{o.pair}</p>
                  <p className="text-[10px] text-outline font-medium mt-0.5">{o.protocol}</p>
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2 flex justify-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${o.actionBg}`}>
                  {o.action}
                </span>
              </div>

              {/* Risk */}
              <div className="col-span-2 flex flex-col items-center gap-1.5">
                <span className={`font-manrope font-extrabold text-[15px] ${o.riskText}`}>{o.risk.toFixed(2)}</span>
                <div className="w-20 h-1 bg-surface-container-low rounded-full overflow-hidden">
                  <div className={`h-full ${o.riskColor} rounded-full`} style={{ width: `${o.risk * 100}%` }} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${o.riskText}`}>{o.riskLabel}</span>
              </div>

              {/* EV */}
              <div className="col-span-2 text-right">
                <p className={`font-manrope font-extrabold text-[17px] leading-none ${o.evColor}`}>{o.ev}</p>
                <p className="text-[10px] text-outline font-medium mt-0.5">{o.apy}</p>
              </div>

              {/* Confidence bar */}
              <div className="col-span-2 flex flex-col items-center gap-1.5">
                <span className="font-manrope font-bold text-[15px] text-on-surface">{o.confidence}%</span>
                <div className="w-20 h-1 bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: `${o.confidence}%` }} />
                </div>
              </div>

              {/* Logic */}
              <div className="col-span-1 flex justify-end">
                <button type="button" className="flex items-center gap-1 px-3 py-2 text-[11px] font-bold text-outline hover:text-primary hover:bg-primary/5 rounded-xl border border-outline-variant hover:border-primary/20 transition-all">
                  Logic
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>

              {/* Rationale tooltip-style on hover */}
              <div className="col-span-12 mt-0 overflow-hidden max-h-0 group-hover:max-h-16 transition-all duration-300">
                <div className="pt-3 border-t border-outline-variant/50 mt-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[13px] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <p className="text-[11px] text-on-surface-variant italic leading-relaxed">&ldquo;{o.rationale}&rdquo;</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Risk Gates */}
      <div className="bg-white border border-outline-variant rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">security</span>
            </div>
            <h3 className="font-manrope font-bold text-on-surface">Live Risk Gates</h3>
          </div>
          <div className="flex items-center gap-4">
            {[
              { color: 'bg-tertiary', label: 'Pass' },
              { color: 'bg-amber-400', label: 'Caution' },
              { color: 'bg-error', label: 'Block' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {RISK_GATES.map(({ label, status, score, pct, color, textColor, icon }) => (
            <div key={label} className="p-4 bg-surface-container-low border border-outline-variant rounded-xl hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className={`material-symbols-outlined text-[16px] ${textColor}`}>{icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{label}</span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className={`font-manrope font-extrabold text-[20px] leading-none ${textColor}`}>{status}</span>
                <span className="text-[10px] font-mono font-bold text-outline">{score}</span>
              </div>
              <div className="w-full h-1 bg-surface-dim rounded-full">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
