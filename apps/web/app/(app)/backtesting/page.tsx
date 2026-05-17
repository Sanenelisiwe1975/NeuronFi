'use client';

import { useState } from 'react';

const STRATEGIES = ['Delta Neutral v2', 'Momentum Alpha', 'LST Arbitrage'];

const RESULTS = {
  'Delta Neutral v2': { totalReturn: '+18.4%', sharpe: '2.14', maxDD: '-4.2%', winRate: '68%', trades: 142, profit: '$22,080', avgHold: '6.2h', bestTrade: '+$1,240', worstTrade: '-$380' },
  'Momentum Alpha':   { totalReturn: '+7.2%',  sharpe: '1.42', maxDD: '-8.1%', winRate: '55%', trades: 38,  profit: '$8,640',  avgHold: '18.4h', bestTrade: '+$2,100', worstTrade: '-$740' },
  'LST Arbitrage':    { totalReturn: '+11.8%', sharpe: '1.88', maxDD: '-2.8%', winRate: '75%', trades: 12,  profit: '$14,160', avgHold: '3.1h',  bestTrade: '+$980',   worstTrade: '-$120' },
};

const CHART_POINTS = [100, 102, 104, 101, 106, 108, 105, 110, 113, 109, 115, 118, 116, 120, 118, 122, 119, 125, 128, 124, 130];

const TRADE_LOG = [
  { time: '09:14', pair: 'ETH/USDC', side: 'Long',  size: '$12,400', entry: '$2,384', exit: '$2,504', pnl: '+$620', pnlPos: true },
  { time: '11:32', pair: 'ARB/USDC', side: 'Long',  size: '$8,200',  entry: '$1.81',  exit: '$1.94',  pnl: '+$590', pnlPos: true },
  { time: '14:05', pair: 'SOL/USDC', side: 'Short', size: '$6,000',  entry: '$142',   exit: '$138',   pnl: '+$170', pnlPos: true },
  { time: '16:48', pair: 'ETH/USDC', side: 'Long',  size: '$10,000', entry: '$2,510', exit: '$2,470', pnl: '-$160', pnlPos: false },
  { time: '19:22', pair: 'BTC/USDC', side: 'Long',  size: '$15,000', entry: '$64,200', exit: '$65,100', pnl: '+$210', pnlPos: true },
];

export default function BacktestingPage() {
  const [strategy, setStrategy] = useState(STRATEGIES[0]!);
  const [period, setPeriod] = useState('30d');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(true);

  const result = RESULTS[strategy as keyof typeof RESULTS]!;

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1800);
  };

  const maxY = Math.max(...CHART_POINTS);
  const minY = Math.min(...CHART_POINTS);

  const toSvgY = (v: number) => 160 - ((v - minY) / (maxY - minY)) * 140;
  const pts = CHART_POINTS.map((v, i) => `${(i / (CHART_POINTS.length - 1)) * 760},${toSvgY(v)}`).join(' ');

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <div className="mb-8">
        <h1 className="font-manrope font-bold text-[40px] tracking-tight text-on-surface mb-2">Backtesting</h1>
        <p className="text-base text-outline">Simulate strategy performance against historical market data before deploying live capital.</p>
      </div>

      {/* Config bar */}
      <div className="bg-white border border-outline-variant rounded-xl p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">Strategy</label>
          <select
            value={strategy}
            onChange={e => { setStrategy(e.target.value); setRan(false); }}
            className="px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
          >
            {STRATEGIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">Time Period</label>
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
            {['7d', '30d', '90d', '1y'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { setPeriod(p); setRan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${period === p ? 'bg-white text-primary shadow-sm' : 'text-outline'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">Initial Capital</label>
          <input
            type="number"
            defaultValue={100000}
            className="w-36 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={runBacktest}
          disabled={running}
          className="ml-auto flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-manrope font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-primary/20"
        >
          {running ? (
            <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Running…</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">play_arrow</span> Run Backtest</>
          )}
        </button>
      </div>

      {ran && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-6">
            {[
              { label: 'Total Return', val: result.totalReturn, color: 'text-tertiary' },
              { label: 'Sharpe Ratio', val: result.sharpe, color: 'text-primary' },
              { label: 'Max Drawdown', val: result.maxDD, color: 'text-error' },
              { label: 'Win Rate', val: result.winRate, color: 'text-tertiary' },
              { label: 'Total Trades', val: String(result.trades), color: 'text-on-surface' },
              { label: 'Net Profit', val: result.profit, color: 'text-tertiary' },
              { label: 'Avg Hold', val: result.avgHold, color: 'text-on-surface' },
              { label: 'Best Trade', val: result.bestTrade, color: 'text-tertiary' },
              { label: 'Worst Trade', val: result.worstTrade, color: 'text-error' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white border border-outline-variant rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">{label}</p>
                <p className={`font-manrope font-bold text-lg ${color}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-manrope font-semibold text-lg text-on-surface">Portfolio Value Over Time</h2>
              <span className={`text-sm font-bold ${result.totalReturn.startsWith('+') ? 'text-tertiary' : 'text-error'}`}>{result.totalReturn}</span>
            </div>
            <div className="h-48 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 760 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="btGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00677f" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#00677f" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline points={`${pts} 760,160 0,160`} fill="url(#btGrad)" />
                <polyline points={pts} fill="none" stroke="#00677f" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Trade log */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h2 className="font-manrope font-semibold text-lg text-on-surface">Simulated Trade Log</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Time', 'Pair', 'Side', 'Size', 'Entry', 'Exit', 'PnL'].map(h => (
                    <th key={h} className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-outline">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {TRADE_LOG.map(t => (
                  <tr key={`${t.time}-${t.pair}`} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-3 text-sm font-mono text-outline">{t.time}</td>
                    <td className="px-6 py-3 text-sm font-bold text-on-surface">{t.pair}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.side === 'Long' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                        {t.side}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface">{t.size}</td>
                    <td className="px-6 py-3 text-sm text-outline font-mono">{t.entry}</td>
                    <td className="px-6 py-3 text-sm text-outline font-mono">{t.exit}</td>
                    <td className={`px-6 py-3 text-sm font-bold ${t.pnlPos ? 'text-tertiary' : 'text-error'}`}>{t.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!ran && !running && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-4">history</span>
          <p className="font-manrope font-semibold text-xl text-on-surface mb-2">Configure & Run a Backtest</p>
          <p className="text-sm text-outline max-w-sm">Select a strategy and time period above, then click <span className="font-bold">Run Backtest</span> to simulate performance.</p>
        </div>
      )}

      {running && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-4">refresh</span>
          <p className="font-manrope font-semibold text-xl text-on-surface mb-2">Running Simulation…</p>
          <p className="text-sm text-outline">Processing {period} of historical data for <span className="font-bold">{strategy}</span></p>
        </div>
      )}
    </div>
  );
}
