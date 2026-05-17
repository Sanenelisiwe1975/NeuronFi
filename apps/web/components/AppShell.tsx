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
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/positions', label: 'Positions' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/logs', label: 'Logs' },
  { href: '/settings', label: 'Settings' },
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
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setWalletError(null);
    const eth = getEthereum();
    if (!eth) {
      setWalletError('No wallet detected. Install MetaMask from metamask.io');
      return;
    }
    setConnecting(true);

    // Use a race between the wallet request and a 15s timeout so the UI
    // never hangs indefinitely if the extension is unresponsive.
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Wallet connection timed out. Open MetaMask and try again.')), ms)
        ),
      ]);

    try {
      const accounts = await withTimeout(
        eth.request({ method: 'eth_requestAccounts' }),
        15_000,
      );
      setWalletAddress(accounts[0] ?? null);
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      const msg  = err instanceof Error ? err.message : String(err);

      if (code === 4001) {
        setWalletError('Connection rejected. Approve the MetaMask popup to continue.');
      } else if (msg.includes('timed out')) {
        setWalletError('Wallet timed out. Make sure MetaMask is unlocked, then try again.');
      } else if (msg.includes('redefine') || msg.includes('Failed to connect')) {
        setWalletError('Wallet extension conflict. Disable other EVM wallets in chrome://extensions and refresh.');
      } else {
        setWalletError(msg.slice(0, 120));
      }
    }

    setConnecting(false);
  }, []);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;
    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      setWalletAddress(list[0] ?? null);
    };
    eth.on('accountsChanged', handleAccountsChanged);
    return () => eth.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  return (
    <>
      {/* Top Nav */}
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-container/10 border border-tertiary-container/20">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-xs font-semibold text-tertiary">Agent Active</span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {/* Wallet */}
          <div className="relative">
            {walletError && (
              <div className="absolute top-12 right-0 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 w-64 z-50 shadow-lg">
                {walletError}
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
              {connecting ? 'Connecting…' : shortAddr ?? 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 w-[280px] h-[calc(100vh-64px)] border-r border-slate-200 bg-white flex flex-col py-6 px-4">
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container">psychology</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-none">Neuron AI v2.4</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Autonomous Logic Enabled</p>
            </div>
          </div>
          {walletAddress && (
            <div className="mt-3 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant">
              <p className="text-[10px] text-outline uppercase tracking-wider mb-0.5">Connected</p>
              <p className="text-xs font-mono text-on-surface">{shortAddr}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {SIDE_NAV.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-manrope text-xs font-semibold uppercase tracking-wider ${
                  active
                    ? 'bg-primary/8 text-primary border-r-2 border-primary'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'text-primary' : ''}`}>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 pt-6 px-2">
          <button
            type="button"
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest mb-4 hover:bg-slate-800 transition-all"
          >
            Optimize Strategy
          </button>
          <div className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors font-manrope text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Docs</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors font-manrope text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span>Support</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[280px] pt-16 min-h-screen bg-background">
        {children}
      </main>
    </>
  );
}
