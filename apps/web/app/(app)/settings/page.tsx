export default function SettingsPage() {
  return (
    <div className="p-margin max-w-[1440px] mx-auto">
      <div className="mb-10">
        <h1 className="font-h1 text-h1 text-on-surface mb-2">Settings</h1>
        <p className="text-body-lg text-outline">Configure agent behavior, risk parameters, and notifications.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-8 space-y-gutter">
          {/* Agent Config */}
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-h3 text-h3 mb-6">Agent Configuration</h2>
            <div className="space-y-6">
              {[
                { label: 'Agent Name', defaultVal: 'Neuron AI v2.4', type: 'text' },
                { label: 'Execution Mode', defaultVal: 'Autonomous', type: 'text' },
                { label: 'Max Position Size (USDC)', defaultVal: '50000', type: 'number' },
              ].map(({ label, defaultVal, type }) => (
                <div key={label}>
                  <label className="block text-label-caps text-outline mb-2">{label.toUpperCase()}</label>
                  <input
                    type={type}
                    defaultValue={defaultVal}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Risk Parameters */}
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-h3 text-h3 mb-6">Risk Parameters</h2>
            <div className="space-y-6">
              {[
                { label: 'Max Slippage Tolerance', val: '0.50%', defaultVal: 50 },
                { label: 'Confidence Threshold', val: '85.4%', defaultVal: 85 },
                { label: 'Max Daily Loss Limit', val: '5.00%', defaultVal: 5 },
                { label: 'Leverage Cap', val: '3.0x', defaultVal: 30 },
              ].map(({ label, val, defaultVal }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-label-caps text-[11px]">
                    <span className="text-outline">{label}</span>
                    <span className="text-on-surface font-bold">{val}</span>
                  </div>
                  <input
                    className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                    type="range"
                    defaultValue={defaultVal}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right col */}
        <div className="col-span-4 space-y-gutter">
          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-h3 text-h3 mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: 'Trade Executions', desc: 'Alert on every on-chain action' },
                { label: 'Risk Alerts', desc: 'Notify when risk gates trigger' },
                { label: 'Daily Summary', desc: 'End-of-day P&L report' },
                { label: 'Agent Paused', desc: 'Alert when execution halts' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">{label}</p>
                    <p className="text-[11px] text-outline">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-outline-variant rounded-xl p-6">
            <h2 className="font-h3 text-h3 mb-6">Network</h2>
            <div className="space-y-3">
              {[
                { label: 'Network', val: 'Kite Chain' },
                { label: 'Chain ID', val: '2368' },
                { label: 'RPC Status', val: 'Connected', color: 'text-tertiary' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant last:border-0">
                  <span className="text-label-caps text-outline">{label}</span>
                  <span className={`text-body-sm font-semibold ${color ?? 'text-on-surface'}`}>{val}</span>
                </div>
              ))}
            </div>
          </section>

          <button className="w-full bg-primary text-white py-3 rounded-xl font-manrope font-bold text-sm hover:opacity-90 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
