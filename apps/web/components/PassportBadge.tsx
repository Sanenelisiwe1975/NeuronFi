"use client";

interface SessionStatus {
  isActive: boolean;
  budgetUsedPercent: number;
  timeRemainingSeconds: number;
  canSpend: boolean;
}

interface PassportInfo {
  walletAddress: string;
  isRegistered: boolean;
  balance: { usdc: string; native: string };
}

interface PassportBadgeProps {
  passport: PassportInfo | null;
  session: (SessionStatus & { id: string; status: string; totalBudget: string; spent: string }) | null;
}

export function PassportBadge({ passport, session }: PassportBadgeProps) {
  if (!passport) {
    return (
      <div style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: "8px",
        fontSize: "12px",
        color: "#888",
      }}>
        <span>🔐 Agent not registered</span>
      </div>
    );
  }

  const shortAddress = `${passport.walletAddress.slice(0, 6)}...${passport.walletAddress.slice(-4)}`;
  const budgetPercent = session ? Math.floor((Number(session.spent) / Number(session.totalBudget)) * 100) : 0;
  const timeRemainingSec = session ? Math.max(0, session.timeRemainingSeconds) : 0;
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div style={{
      display: "inline-flex",
      flexDirection: "column",
      gap: "6px",
      fontSize: "11px",
      fontFamily: "'IBM Plex Mono', monospace",
      color: "#ddd",
      padding: "8px 12px",
      borderRadius: "4px",
      background: "rgba(0, 230, 118, 0.08)",
      border: "1px solid rgba(0, 230, 118, 0.2)",
    }}>
      {/* Wallet address */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ opacity: 0.6 }}>🔐</span>
        <span style={{ fontSize: "10px", color: "#0ae" }}>{shortAddress}</span>
      </div>

      {/* Session status */}
      {session ? (
        <>
          {session.isActive ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0f0" }}>
              <span>📊</span>
              <span>
                {budgetPercent}% of ${(Number(session.totalBudget) / 1e18).toFixed(2)} USDC
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fa0" }}>
              <span>⏳</span>
              <span>{session.status} — awaiting approval</span>
            </div>
          )}

          {/* Time remaining */}
          {session.isActive && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#666", fontSize: "10px" }}>
              <span>⏱</span>
              <span>{formatTime(timeRemainingSec)} remaining</span>
            </div>
          )}
        </>
      ) : (
        <div style={{ opacity: 0.5, fontSize: "10px" }}>
          No active session
        </div>
      )}

      {/* Balance */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", opacity: 0.7 }}>
        <span>💰</span>
        <span>{(Number(passport.balance.usdc) / 1e18).toFixed(2)} USDC</span>
      </div>
    </div>
  );
}
