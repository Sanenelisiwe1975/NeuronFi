'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  markets: number;
  cycles: number;
  winRate: string;
  volume: string;
  status: 'RUNNING' | 'WAITING';
}

function useStats(): Stats {
  const [stats, setStats] = useState<Stats>({
    markets: 0, cycles: 0, winRate: '—', volume: '$0', status: 'WAITING',
  });

  useEffect(() => {
    async function load() {
      try {
        const [agentRes, marketsRes] = await Promise.allSettled([
          fetch('/api/agent').then(r => r.json()),
          fetch('/api/markets').then(r => r.json()),
        ]);
        const agent = agentRes.status === 'fulfilled' ? agentRes.value : null;
        const markets = marketsRes.status === 'fulfilled' ? marketsRes.value : null;
        const list: { volumeUsdt?: string }[] = markets?.markets ?? [];
        const vol = list.reduce((s, m) => s + parseFloat(m.volumeUsdt ?? '0'), 0);
        setStats({
          markets: list.length,
          cycles: agent?.iteration ?? 0,
          winRate: agent?.winRate ?? '—',
          volume: `$${vol.toFixed(0)}`,
          status: agent?.status ?? 'WAITING',
        });
      } catch { /* ignore */ }
    }
    void load();
  }, []);

  return stats;
}

const STEPS = [
  {
    n: '01', title: 'Observe', icon: 'visibility',
    desc: 'Fetches ETH/USDC prices from Chainlink, gas snapshots, Uniswap V3 liquidity, and open prediction markets on Kite chain — every cycle.',
    accent: 'border-primary bg-primary/5 text-primary',
  },
  {
    n: '02', title: 'Reason', icon: 'psychology',
    desc: 'Sends the full market state to Claude Sonnet 4.6. Claude returns a ranked list of actions with confidence scores and rationale.',
    accent: 'border-tertiary bg-tertiary/5 text-tertiary',
  },
  {
    n: '03', title: 'Execute', icon: 'bolt',
    desc: 'Risk-gated actions are signed and submitted gaslessly via the Kite AA SDK. Every resolution is attested on the Kite Attestation Registry.',
    accent: 'border-secondary bg-secondary/5 text-secondary',
  },
];

const STACK = [
  { label: 'Kite AA SDK', sub: 'Gasless smart account', icon: 'hub' },
  { label: 'Agent Passport', sub: 'On-chain agent identity', icon: 'badge' },
  { label: 'Claude Sonnet', sub: 'AI reasoning', icon: 'psychology' },
  { label: 'Chainlink', sub: 'Price oracles', icon: 'link' },
  { label: 'Kite Chain', sub: 'Settlement & attestation', icon: 'verified' },
  { label: 'LangChain.js', sub: 'LLM planning', icon: 'account_tree' },
  { label: 'Next.js', sub: 'Dashboard', icon: 'web' },
  { label: 'LayerZero', sub: 'Cross-chain USDC', icon: 'swap_horiz' },
];

export default function HomePage() {
  const stats = useStats();
  const isRunning = stats.status === 'RUNNING';

  return (
    <div className="min-h-screen bg-background text-on-background font-inter">

      {/* Top Nav */}
      <header className="fixed top-0 left-0 w-full h-16 flex justify-between items-center px-8 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold tracking-tighter text-slate-900 font-manrope">Neuronfi</span>
          <nav className="hidden md:flex items-center gap-6 h-full">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/positions', label: 'Positions' },
              { href: '/opportunities', label: 'Opportunities' },
              { href: '/logs', label: 'Logs' },
              { href: '/settings', label: 'Settings' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-manrope text-sm font-medium tracking-tight text-slate-500 hover:text-slate-900 transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isRunning ? 'bg-tertiary-container/10 border-tertiary-container/20' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-tertiary animate-pulse' : 'bg-slate-300'}`} />
            <span className={`text-xs font-semibold ${isRunning ? 'text-tertiary' : 'text-slate-400'}`}>
              Agent {isRunning ? 'Active' : 'Offline'}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Open App
          </Link>
        </div>
      </header>

      <div className="pt-16">
        {/* Hero */}
        <section className="max-w-[1440px] mx-auto px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-8 ${isRunning ? 'bg-tertiary/5 border-tertiary/20 text-tertiary' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-tertiary animate-pulse' : 'bg-slate-300'}`} />
              Agent {isRunning ? 'running live on Kite chain' : 'currently offline'}
            </div>

            <h1 className="font-manrope font-bold text-[56px] leading-[1.1] tracking-[-0.02em] text-on-surface mb-6">
              An autonomous AI agent that trades{' '}
              <span className="text-primary">prediction markets</span>{' '}
              on-chain.
            </h1>

            <p className="text-body-lg text-outline max-w-xl mb-10">
              Powered by Claude Sonnet 4.6 and the Kite AA SDK. Observes markets, reasons about
              opportunities, executes gasless trades, and attests every decision on-chain —
              without human intervention.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-manrope font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                View Live Dashboard
              </Link>
              <a
                href="https://github.com/Sanenelisiwe1975/NeuronFi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-on-surface border border-outline-variant px-6 py-3 rounded-xl font-manrope font-semibold text-sm hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-outline-variant bg-white">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-outline-variant">
              {[
                { label: 'Active Markets', val: String(stats.markets) },
                { label: 'Agent Cycles', val: String(stats.cycles) },
                { label: 'Total Volume', val: stats.volume },
                { label: 'Win Rate', val: stats.winRate },
              ].map(({ label, val }) => (
                <div key={label} className="px-8 py-8 text-center">
                  <p className="font-manrope font-bold text-[36px] leading-none text-on-surface mb-2">{val}</p>
                  <p className="text-label-caps text-outline uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-[1440px] mx-auto px-8 py-20">
          <div className="mb-12">
            <p className="text-label-caps text-outline uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-manrope font-bold text-[36px] tracking-tight text-on-surface">
              Fully autonomous. Every cycle.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, icon, desc, accent }) => (
              <div key={n} className={`bg-white border rounded-xl p-6 ${accent.split(' ')[0]}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.split(' ')[1]} ${accent.split(' ')[0]}`}>
                    <span className={`material-symbols-outlined ${accent.split(' ')[2]}`}>{icon}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${accent.split(' ')[2]} opacity-60`}>{n}</span>
                    <h3 className={`font-manrope font-bold text-xl ${accent.split(' ')[2]}`}>{title}</h3>
                  </div>
                </div>
                <p className="text-body-sm text-outline leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="bg-surface-container-low border-y border-outline-variant py-20">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="mb-12">
              <p className="text-label-caps text-outline uppercase tracking-widest mb-3">Built with</p>
              <h2 className="font-manrope font-bold text-[36px] tracking-tight text-on-surface">
                Production-grade infrastructure.
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STACK.map(({ label, sub, icon }) => (
                <div key={label} className="bg-white border border-outline-variant rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{label}</p>
                    <p className="text-[11px] text-outline">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1440px] mx-auto px-8 py-20">
          <div className="bg-primary rounded-2xl p-12 flex flex-col items-center text-center text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-label-caps uppercase tracking-widest text-primary-fixed/70 mb-4">Live on Kite Chain</p>
              <h2 className="font-manrope font-bold text-[40px] tracking-tight mb-4">Watch it trade live</h2>
              <p className="text-body-lg text-primary-fixed/80 max-w-md mb-8">
                The agent is running on Kite chain. Open the dashboard to see real-time reasoning,
                attested on-chain trades, and portfolio performance.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-manrope font-bold text-sm hover:bg-primary-fixed transition-all active:scale-[0.98] shadow-xl"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Open Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-outline-variant bg-white">
          <div className="max-w-[1440px] mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-manrope font-extrabold text-lg text-on-surface">Neuronfi</span>
              <span className="text-outline text-sm">·</span>
              <span className="text-sm text-outline">Kite AI Hackathon — Agentic Trading</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-outline">Apache 2.0</span>
              <a
                href="https://github.com/Sanenelisiwe1975/NeuronFi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
                GitHub
              </a>
              <Link href="/dashboard" className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
                Dashboard →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
