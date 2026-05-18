'use client';

import { useState, useCallback } from 'react';
import { ToastContainer, ToastData } from 'components/Toast';

let nextId = 1;

export default function SettingsPage() {
  const [agentName,    setAgentName]    = useState('Neuron AI v2.4');
  const [execMode,     setExecMode]     = useState('Autonomous');
  const [maxPosition,  setMaxPosition]  = useState('50000');
  const [slippage,     setSlippage]     = useState(50);
  const [confidence,   setConfidence]   = useState(85);
  const [dailyLoss,    setDailyLoss]    = useState(5);
  const [leverageCap,  setLeverageCap]  = useState(30);
  const [notifs,       setNotifs]       = useState({ trades: true, risk: true, daily: true, paused: true });
  const [saving,       setSaving]       = useState(false);
  const [toasts,       setToasts]       = useState<ToastData[]>([]);

  const dismiss  = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const push     = useCallback((toast: Omit<ToastData, 'id'>) => setToasts(t => [...t, { ...toast, id: nextId++ }]), []);

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    push({ type: 'success', title: 'Settings Saved', msg: `Agent "${agentName}" updated. Changes take effect on the next cycle.` });
  };

  const sliders = [
    { label: 'Max Slippage Tolerance', val: slippage,    set: setSlippage,    fmt: (v: number) => `${(v / 100).toFixed(2)}%`, max: 200 },
    { label: 'Confidence Threshold',   val: confidence,  set: setConfidence,  fmt: (v: number) => `${v}%`,                    max: 100 },
    { label: 'Max Daily Loss Limit',   val: dailyLoss,   set: setDailyLoss,   fmt: (v: number) => `${v}%`,                    max: 20  },
    { label: 'Leverage Cap',           val: leverageCap, set: setLeverageCap, fmt: (v: number) => `${(v / 10).toFixed(1)}x`,  max: 50  },
  ];

  const notifRows: { key: keyof typeof notifs; label: string; desc: string }[] = [
    { key: 'trades', label: 'Trade Executions', desc: 'Alert on every on-chain action' },
    { key: 'risk',   label: 'Risk Alerts',       desc: 'Notify when risk gates trigger' },
    { key: 'daily',  label: 'Daily Summary',     desc: 'End-of-day P&L report' },
    { key: 'paused', label: 'Agent Paused',      desc: 'Alert when execution halts' },
  ];

  return (
    <div className="p-margin max-w-[1440px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-10">
        <h1 className="font-manrope font-bold text-h1 text-on-surface mb-2">Settings</h1>
        <p className="text-body-lg text-outline">Configure agent behavior, risk parameters, and notifications.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-8 space-y-gutter">

          {/* Agent Config */}
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-bold text-h3 mb-6">Agent Configuration</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-label-caps text-outline mb-2">AGENT NAME</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-label-caps text-outline mb-2">EXECUTION MODE</label>
                <select
                  value={execMode}
                  onChange={e => setExecMode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                >
                  {['Autonomous', 'Semi-Autonomous', 'Manual Approval'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-caps text-outline mb-2">MAX POSITION SIZE (USDC)</label>
                <input
                  type="number"
                  value={maxPosition}
                  onChange={e => setMaxPosition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Risk Parameters */}
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-bold text-h3 mb-6">Risk Parameters</h2>
            <div className="space-y-6">
              {sliders.map(({ label, val, set, fmt, max }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-label-caps text-[11px] text-outline uppercase tracking-wider">{label}</span>
                    <span className="text-[13px] font-manrope font-extrabold text-on-surface">{fmt(val)}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={max}
                    value={val}
                    onChange={e => set(+e.target.value)}
                    aria-label={label}
                    className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-outline">
                    <span>{fmt(1)}</span><span>{fmt(max)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right col */}
        <div className="col-span-4 space-y-gutter">
          {/* Notifications */}
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-bold text-h3 mb-6">Notifications</h2>
            <div className="space-y-1">
              {notifRows.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">{label}</p>
                    <p className="text-[11px] text-outline">{desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs[key]}
                    aria-label={`Toggle ${label}`}
                    onClick={() => toggleNotif(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${notifs[key] ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-200 shadow transition-transform ${notifs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Network info */}
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-manrope font-bold text-h3 mb-6">Network</h2>
            <div className="space-y-1">
              {[
                { label: 'Network',    val: 'Kite Chain', color: '' },
                { label: 'Chain ID',   val: '2368',       color: '' },
                { label: 'RPC Status', val: 'Connected',  color: 'text-tertiary' },
                { label: 'Block',      val: '#19,452,112',color: '' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-outline-variant last:border-0">
                  <span className="text-label-caps text-[11px] text-outline uppercase tracking-wider">{label}</span>
                  <span className={`text-body-sm font-semibold ${color || 'text-on-surface'}`}>{val}</span>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-manrope font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {saving
              ? <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Saving…</>
              : <><span className="material-symbols-outlined text-[18px]">save</span> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
