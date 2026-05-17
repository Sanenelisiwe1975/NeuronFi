'use client';

import { useState, useCallback } from 'react';
import { ToastContainer, ToastData } from 'components/Toast';

const CONDITIONS = [
  { id: 'rsi',  label: 'RSI < 30 (Oversold)',        enabled: true },
  { id: 'vol',  label: 'Volume spike > 2x average',  enabled: true },
  { id: 'ema',  label: 'Price crosses EMA 50',        enabled: false },
  { id: 'fund', label: 'Funding rate > 0.05%',        enabled: true },
];

const EXIT_CONDITIONS = [
  { id: 'tp',    label: 'Take profit at +5.0%', enabled: true },
  { id: 'sl',    label: 'Stop loss at -2.5%',   enabled: true },
  { id: 'trail', label: 'Trailing stop 1.5%',   enabled: false },
  { id: 'time',  label: 'Max hold 48 hours',    enabled: true },
];

const STRATEGIES = [
  { name: 'Delta Neutral v2', status: 'Active',  pnl: '+12.4%', trades: 142, winRate: '68%', color: 'text-tertiary', bg: 'bg-tertiary/10 border-tertiary/20' },
  { name: 'Momentum Alpha',   status: 'Paused',  pnl: '+4.1%',  trades: 38,  winRate: '55%', color: 'text-outline',  bg: 'bg-slate-50 border-slate-200' },
  { name: 'LST Arbitrage',    status: 'Testing', pnl: '+2.8%',  trades: 12,  winRate: '75%', color: 'text-primary',  bg: 'bg-primary/5 border-primary/20' },
];

let nextId = 1;

export default function StrategyBuilderPage() {
  const [conditions,       setConditions]       = useState(CONDITIONS);
  const [exits,            setExits]            = useState(EXIT_CONDITIONS);
  const [posSize,          setPosSize]          = useState(15);
  const [leverage,         setLeverage]         = useState(25);
  const [activeStrategy,   setActiveStrategy]   = useState(STRATEGIES[0]!.name);
  const [suggestionApplied,setSuggestionApplied]= useState(false);
  const [toasts,           setToasts]           = useState<ToastData[]>([]);
  const [deploying,        setDeploying]        = useState(false);
  const [simulating,       setSimulating]       = useState(false);

  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const push = useCallback((toast: Omit<ToastData, 'id'>) => setToasts(t => [...t, { ...toast, id: nextId++ }]), []);

  const toggle = (list: typeof CONDITIONS, setList: (v: typeof CONDITIONS) => void, id: string) =>
    setList(list.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));

  const handleDeploy = async () => {
    const active = conditions.filter(c => c.enabled).length;
    if (active === 0) { push({ type: 'warning', title: 'No entry conditions', msg: 'Enable at least one entry condition before deploying.' }); return; }
    setDeploying(true);
    await new Promise(r => setTimeout(r, 1600));
    setDeploying(false);
    push({ type: 'success', title: 'Strategy Deployed', msg: `"${activeStrategy}" is now live with ${active} entry conditions.` });
  };

  const handleSimulate = async () => {
    setSimulating(true);
    await new Promise(r => setTimeout(r, 1200));
    setSimulating(false);
    push({ type: 'info', title: 'Simulation Complete', msg: 'Projected 30d return: +11.8% · Sharpe: 1.94 · Max DD: -3.1%' });
  };

  const handleSave = () => push({ type: 'success', title: 'Draft Saved', msg: `"${activeStrategy}" saved with current parameters.` });

  const handleAddCondition = () => push({ type: 'info', title: 'Coming Soon', msg: 'Custom condition builder will be available in the next release.' });

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-8">
        <h1 className="font-manrope font-bold text-[40px] tracking-tight text-on-surface mb-2">Strategy Builder</h1>
        <p className="text-base text-outline">Configure, test and deploy autonomous trading strategies for the Neuron AI agent.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Saved strategies */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-manrope font-semibold text-lg text-on-surface">Saved Strategies</h2>
              <button type="button" onClick={handleAddCondition} className="text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">add</span> New
              </button>
            </div>
            <div className="divide-y divide-outline-variant">
              {STRATEGIES.map(s => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => { setActiveStrategy(s.name); setSuggestionApplied(false); }}
                  className={`w-full text-left px-6 py-4 hover:bg-surface-container-low transition-colors ${activeStrategy === s.name ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-on-surface">{s.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>{s.status}</span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-outline">
                    <span>PnL: <span className={`font-bold ${s.color}`}>{s.pnl}</span></span>
                    <span>Trades: {s.trades}</span>
                    <span>Win: {s.winRate}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">AI Suggestion</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              &ldquo;Based on current ETH/LST funding divergence, consider enabling the EMA 50 crossover condition. Historical accuracy: <span className="font-bold text-primary">79.3%</span>.&rdquo;
            </p>
            {suggestionApplied ? (
              <div className="mt-3 w-full py-2 bg-tertiary/10 border border-tertiary/20 rounded-lg text-xs font-bold text-tertiary flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Applied — EMA 50 condition enabled
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConditions(prev => prev.map(c => c.id === 'ema' ? { ...c, enabled: true } : c));
                  setSuggestionApplied(true);
                  push({ type: 'success', title: 'AI Suggestion Applied', msg: 'EMA 50 crossover condition has been enabled.' });
                }}
                className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                Apply Suggestion
              </button>
            )}
          </div>
        </div>

        {/* Builder */}
        <div className="col-span-8 space-y-6">
          {/* Entry conditions */}
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">trending_up</span>
              Entry Conditions
            </h2>
            <div className="space-y-3">
              {conditions.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${c.enabled ? 'bg-tertiary/5 border-tertiary/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${c.enabled ? 'text-tertiary' : 'text-slate-300'}`}>check_circle</span>
                    <span className={`text-sm font-medium ${c.enabled ? 'text-on-surface' : 'text-outline line-through'}`}>{c.label}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Toggle ${c.label}`}
                    onClick={() => toggle(conditions, setConditions, c.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${c.enabled ? 'bg-tertiary' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${c.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddCondition} className="w-full py-2 border border-dashed border-outline-variant rounded-lg text-xs font-semibold text-outline hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Add Condition
              </button>
            </div>
          </div>

          {/* Exit conditions */}
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">trending_down</span>
              Exit Conditions
            </h2>
            <div className="space-y-3">
              {exits.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${c.enabled ? 'bg-error/5 border-error/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${c.enabled ? 'text-error' : 'text-slate-300'}`}>cancel</span>
                    <span className={`text-sm font-medium ${c.enabled ? 'text-on-surface' : 'text-outline line-through'}`}>{c.label}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Toggle ${c.label}`}
                    onClick={() => toggle(exits, setExits, c.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${c.enabled ? 'bg-error' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${c.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Position sizing */}
          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-semibold text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              Position Sizing &amp; Leverage
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <label className="block">
                <div className="flex justify-between text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                  <span>Position Size</span><span className="text-on-surface">{posSize}%</span>
                </div>
                <input type="range" min={1} max={50} value={posSize} onChange={e => setPosSize(+e.target.value)}
                  aria-label="Position size" className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg cursor-pointer" />
                <div className="flex justify-between text-[10px] text-outline mt-1"><span>1%</span><span>50%</span></div>
              </label>
              <label className="block">
                <div className="flex justify-between text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                  <span>Max Leverage</span><span className="text-on-surface">{(leverage / 10).toFixed(1)}x</span>
                </div>
                <input type="range" min={10} max={50} value={leverage} onChange={e => setLeverage(+e.target.value)}
                  aria-label="Max leverage" className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg cursor-pointer" />
                <div className="flex justify-between text-[10px] text-outline mt-1"><span>1x</span><span>5x</span></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={handleDeploy} disabled={deploying}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-manrope font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60">
              {deploying
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Deploying…</>
                : <><span className="material-symbols-outlined text-[18px]">rocket_launch</span> Deploy Strategy</>}
            </button>
            <button type="button" onClick={handleSimulate} disabled={simulating}
              className="px-6 py-3 border border-outline-variant rounded-xl font-manrope font-bold text-sm text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-2 disabled:opacity-60">
              {simulating
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Running…</>
                : <><span className="material-symbols-outlined text-[18px]">science</span> Simulate</>}
            </button>
            <button type="button" onClick={handleSave}
              className="px-6 py-3 border border-outline-variant rounded-xl font-manrope font-bold text-sm text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span> Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
