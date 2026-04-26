import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Zap, ScrollText, Settings2,
  Activity, Layers, RefreshCw, HelpCircle, Bell, Wallet,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAgent } from "../../context/AgentContext";
import { Badge, Button } from "../ui";
import { NeuronLogo } from "./NeuronLogo";
import { TickerBar } from "./TickerBar";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/positions", label: "Positions", icon: TrendingUp },
  { to: "/opportunities", label: "Opportunities", icon: Zap },
  { to: "/analytics", label: "Logs & Analytics", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

const SIDEBAR_ITEMS = [
  { label: "Strategy Builder", icon: Activity },
  { label: "Risk Engine", icon: Layers },
  { label: "Liquidity Pools", icon: RefreshCw },
  { label: "Backtesting", icon: HelpCircle },
];

export function MainLayout() {
  const { agentState, walletConnected, connectWallet, walletAddress } = useAgent();
  const location = useLocation();

  const activeRoute = NAV_ITEMS.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] grid-bg">
      {/* ---- Sidebar ----------------------------------------- */}
      <aside className="w-[200px] shrink-0 flex flex-col border-r border-[var(--border)] bg-navy-900/80 backdrop-blur-sm z-20">
        {/* Logo */}
        <div className="p-4 border-b border-[var(--border)]">
          <NeuronLogo />
        </div>

        {/* Agent version card */}
        <div className="mx-3 mt-3 p-3 rounded-xl bg-[var(--cyan)]/5 border border-[var(--cyan)]/15">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--cyan)] to-[var(--teal)] flex items-center justify-center">
              <Zap size={12} className="text-navy-950" />
            </div>
            <div>
              <p className="text-[10px] font-display font-bold text-[var(--text-primary)]">
                Neuron AI v{agentState.version}
              </p>
              <p className="text-[9px] text-muted uppercase tracking-wider">Autonomous Logic</p>
            </div>
          </div>
          <Badge
            variant={agentState.status === "active" ? "active" : agentState.status === "paused" ? "warning" : "error"}
            dot
            className="text-[9px]"
          >
            {agentState.status === "active" ? "Enabled" : agentState.status}
          </Badge>
        </div>

        {/* Tool nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-3">
          {SIDEBAR_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted hover:text-[var(--text-primary)] hover:bg-navy-700/40 transition-colors text-left"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Optimize CTA */}
        <div className="p-3 border-t border-[var(--border)]">
          <button className="w-full py-2.5 rounded-xl bg-[var(--cyan)] text-navy-950 text-[11px] font-display font-bold uppercase tracking-wider hover:brightness-110 transition-all glow-cyan">
            Optimize Strategy
          </button>
          <div className="flex gap-3 mt-3 px-1">
            <button className="text-[10px] text-muted hover:text-[var(--text-secondary)] flex items-center gap-1">
              <HelpCircle size={10} /> Docs
            </button>
            <button className="text-[10px] text-muted hover:text-[var(--text-secondary)] flex items-center gap-1">
              <HelpCircle size={10} /> Support
            </button>
          </div>
        </div>
      </aside>

      {/* ---- Main content area ------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="h-12 shrink-0 flex items-center px-4 border-b border-[var(--border)] bg-navy-900/60 backdrop-blur-sm z-10">
          {/* Brand */}
          <span className="font-display font-bold text-[var(--cyan)] text-sm mr-6">Neuronfi</span>

          {/* Page tabs */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "text-[var(--cyan)] border-b border-[var(--cyan)]"
                      : "text-muted hover:text-[var(--text-secondary)]"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right status area */}
          <div className="ml-auto flex items-center gap-3">
            {/* Agent status */}
            <Badge variant={agentState.status === "active" ? "active" : "warning"} dot>
              Agent {agentState.status === "active" ? "Active" : "Paused"}
            </Badge>

            {/* Bell */}
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-[var(--text-primary)] hover:bg-navy-700/40 transition-colors relative">
              <Bell size={14} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
            </button>

            {/* Wallet */}
            <Button
              variant="primary"
              size="sm"
              icon={<Wallet size={12} />}
              onClick={walletConnected ? undefined : connectWallet}
            >
              {walletConnected ? walletAddress : "Connect Wallet"}
            </Button>
          </div>
        </header>

        {/* Ticker bar */}
        <TickerBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
