import { useAgent } from "../../context/AgentContext";
import { formatUSD, formatPct } from "../../lib/utils";

const STATIC_PAIRS = [
  { pair: "BTC/USDC", price: 67420, change: 1.8 },
  { pair: "ETH/USDC", price: 2412.84, change: 2.4 },
  { pair: "SOL/USDC", price: 148.32, change: 3.1 },
  { pair: "ARB/USDC", price: 1.67, change: -1.9 },
  { pair: "LINK/USDC", price: 18.92, change: 0.7 },
  { pair: "AAVE/USDC", price: 167.4, change: -0.4 },
  { pair: "CRV/USDC", price: 0.412, change: 2.2 },
];

export function TickerBar() {
  const { agentState } = useAgent();

  const items = [...STATIC_PAIRS, ...STATIC_PAIRS]; // duplicate for seamless scroll

  return (
    <div className="h-7 shrink-0 border-b border-[var(--border)] bg-navy-950/80 overflow-hidden flex items-center">
      <div className="flex items-center gap-6 animate-ticker whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-muted">{item.pair}</span>
            <span className="text-[var(--text-primary)]">{formatUSD(item.price)}</span>
            <span className={item.change >= 0 ? "text-profit" : "text-loss"}>
              {formatPct(item.change)}
            </span>
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="live-dot" />
          <span className="text-muted">
            Gas: {agentState.gasPrice} gwei · Latency: {agentState.networkLatency}s
          </span>
        </span>
      </div>
    </div>
  );
}
