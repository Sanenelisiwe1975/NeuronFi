'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener: (event: string, cb: (...args: unknown[]) => void) => void;
};

const TOP_NAV = [
  { href: '/dashboard',     label: 'Dashboard' },
  { href: '/positions',     label: 'Positions' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/logs',          label: 'Logs' },
  { href: '/settings',      label: 'Settings' },
];

const SIDE_NAV = [
  { href: '/strategy-builder', icon: 'architecture', label: 'Strategy Builder' },
  { href: '/risk-engine',      icon: 'security',     label: 'Risk Engine' },
  { href: '/liquidity-pools',  icon: 'water_drop',   label: 'Liquidity Pools' },
  { href: '/backtesting',      icon: 'history',      label: 'Backtesting' },
];

function getEthereum(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  try {
    return (window as unknown as { ethereum?: EthereumProvider }).ethereum ?? null;
  } catch {
    return null;
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const [collapsed, setCollapsed]    = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting,    setConnecting]    = useState(false);
  const [connectStep,   setConnectStep]   = useState('');
  const [walletError,   setWalletError]   = useState<string | null>(null);
  const [agentRunning,  setAgentRunning]  = useState(true);

  const sideW = collapsed ? 'w-[68px]' : 'w-[280px]';
  const mainL = collapsed ? 'ml-[68px]' : 'ml-[280px]';

  useEffect(() => {
    fetch('/api/agent')
      .then(r => r.json())
      .then((d: { status?: string }) => setAgentRunning(d.status === 'RUNNING'))
      .catch(() => {});
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletError(null);
    const eth = getEthereum();
    if (!eth) {
      setWalletError('No wallet detected. Install MetaMask from metamask.io');
      return;
    }
    setConnecting(true);

    try {
      // Step 1 — check if already authorised (instant, no popup)
      setConnectStep('Checking wallet…');
      const existing = await eth.request({ method: 'eth_accounts' }) as string[];
      if (existing.length > 0) {
        setWalletAddress(existing[0] ?? null);
        setConnecting(false);
        setConnectStep('');
        return;
      }

      // Step 2 — request access; MetaMask opens its popup for the user to
      // unlock or approve. No artificial timeout — the user may need time
      // to type their password. MetaMask itself will reject if they cancel.
      setConnectStep('Check MetaMask popup…');
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
      setWalletAddress(accounts[0] ?? null);
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      const msg  = err instanceof Error ? err.message : String(err);

      if (code === 4001) {
        setWalletError('Connection rejected. Click "Connect Wallet" and approve in MetaMask.');
      } else if (code === -32002) {
        // Already pending — MetaMask popup is open but user hasn't responded
        setWalletError('MetaMask popup is already open. Check your browser extension.');
      } else if (msg.includes('redefine') || msg.includes('Failed to connect')) {
        setWalletError('Extension conflict detected. Disable other EVM wallets in chrome://extensions and refresh.');
      } else {
        setWalletError(msg.slice(0, 140));
      }
    }

    setConnecting(false);
    setConnectStep('');
  }, []);

  // Auto-dismiss wallet error after 6 seconds
  useEffect(() => {
    if (!walletError) return;
    const t = setTimeout(() => setWalletError(null), 6000);
    return () => clearTimeout(t);
  }, [walletError]);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;
    const handler = (a: unknown) => setWalletAddress((a as string[])[0] ?? null);
    eth.on('accountsChanged', handler);
    return () => eth.removeListener('accountsChanged', handler);
  }, []);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  return (
    <>
      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-16 flex justify-between items-center px-8 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-extrabold tracking-tighter text-slate-900">
            Neuronfi
          </Link>
          <nav className="hidden md:flex gap-6 items-center h-full">
            {TOP_NAV.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`font-manrope text-sm font-medium tracking-tight transition-all ${
                    active
                      ? 'text-cyan-500 border-b-2 border-cyan-500 pb-5 mb-[-21px]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Agent status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            agentRunning ? 'bg-tertiary-container/10 border-tertiary-container/20' : 'bg-amber-50 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${agentRunning ? 'bg-tertiary animate-pulse' : 'bg-amber-500'}`} />
            <span className={`text-xs font-semibold ${agentRunning ? 'text-tertiary' : 'text-amber-700'}`}>
              {agentRunning ? 'Agent Active' : 'Agent Paused'}
            </span>
          </div>

          {/* Notifications */}
          <button type="button" aria-label="Notifications" className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {/* Wallet */}
          <div className="relative">
            {walletError && (
              <div className="absolute top-12 right-0 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2.5 w-72 z-50 shadow-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-[16px] mt-0.5 flex-shrink-0">error</span>
                <span className="leading-relaxed">{walletError}</span>
              </div>
            )}
            <button
              type="button"
              onClick={walletAddress ? undefined : connectWallet}
              disabled={connecting}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 ${
                walletAddress
                  ? 'bg-surface-container-low border border-outline-variant text-on-surface font-mono'
                  : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              {connecting ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  {connectStep || 'Connecting…'}
                </span>
              ) : shortAddr ?? 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`fixed left-0 top-16 ${sideW} h-[calc(100vh-64px)] border-r border-slate-200 bg-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-40`}>

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-4 -right-3 z-50 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[14px] text-outline">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Agent identity */}
        <div className={`flex-shrink-0 border-b border-slate-100 transition-all duration-300 ${collapsed ? 'px-3 py-5' : 'px-6 py-5'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary-container icon-filled">psychology</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 leading-none truncate">Neuron AI v2.4</h3>
                <p className={`text-[10px] uppercase tracking-widest mt-1 font-semibold truncate ${agentRunning ? 'text-slate-500' : 'text-amber-600'}`}>
                  {agentRunning ? 'Autonomous Logic Enabled' : 'Autonomous Logic Paused'}
                </p>
              </div>
            )}
          </div>
          {!collapsed && walletAddress && (
            <div className="mt-3 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant">
              <p className="text-[10px] text-outline uppercase tracking-wider mb-0.5">Connected</p>
              <p className="text-xs font-mono text-on-surface">{shortAddr}</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className={`flex-1 flex flex-col gap-1 transition-all duration-300 ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
          {SIDE_NAV.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg transition-colors font-manrope text-xs font-semibold uppercase tracking-wider group relative ${
                  collapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'
                } ${
                  active
                    ? 'bg-primary/8 text-primary border-r-2 border-primary'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${active ? 'text-primary' : ''}`}>{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={`border-t border-slate-100 transition-all duration-300 ${collapsed ? 'px-2 py-4' : 'px-4 py-5'}`}>
          {collapsed ? (
            /* Icon-only: just show the optimize icon with tooltip */
            <Link
              href="/strategy-builder"
              title="Optimize Strategy"
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-primary-container hover:opacity-90 transition-opacity group relative mb-3"
            >
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">rocket_launch</span>
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                Optimize Strategy
              </span>
            </Link>
          ) : (
            <Link
              href="/strategy-builder"
              className="block w-full bg-primary-container text-on-primary-container text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest mb-4 hover:opacity-90 transition-opacity"
            >
              Optimize Strategy
            </Link>
          )}

          <div className={`flex gap-1 ${collapsed ? 'flex-col items-center' : 'flex-col'}`}>
            {[
              { href: 'https://docs.kite.ai',   icon: 'description', label: 'Docs' },
              { href: 'https://discord.gg/kiteai', icon: 'help',     label: 'Support' },
            ].map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors font-manrope text-xs font-semibold uppercase tracking-wider group relative ${
                  collapsed ? 'px-2 py-2.5 justify-center' : 'px-4 py-2'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    {label}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main content — shifts with sidebar ───────────────────────── */}
      <main className={`${mainL} pt-16 min-h-screen bg-background transition-all duration-300 ease-in-out`}>
        {children}
      </main>
    </>
  );
}
