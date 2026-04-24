import { Session } from "./types.js";
import { getPassport } from "./passport.js";

/**
 * Session management utilities for agent execute phase
 * Ensures spend limit enforcement throughout agent's lifecycle
 */

/**
 * Check if a transaction can execute under current session
 * Called in agent's execute.ts before sending tx to Kite
 */
export async function canExecuteTransaction(
  sessionId: string,
  estimatedGasCost: string,
  txValue: string
): Promise<{
  allowed: boolean;
  reason?: string;
  remainingBudget?: string;
}> {
  const passport = getPassport();
  const session = passport.getSession(sessionId);

  if (!session) {
    return {
      allowed: false,
      reason: "Session not found",
    };
  }

  // Check session is active
  if (session.status !== "active") {
    return {
      allowed: false,
      reason: `Session status is ${session.status}`,
    };
  }

  // Check time
  if (Date.now() > session.expiresAt) {
    return {
      allowed: false,
      reason: "Session expired",
    };
  }

  const totalCost = (BigInt(txValue) + BigInt(estimatedGasCost)).toString();
  const isAllowed = await passport.validateSpend(sessionId, totalCost);

  if (!isAllowed) {
    const remaining = (BigInt(session.totalBudget) - BigInt(session.spent)).toString();
    return {
      allowed: false,
      reason: "Exceeds session budget",
      remainingBudget: remaining,
    };
  }

  const remaining = (BigInt(session.totalBudget) - BigInt(session.spent) - BigInt(totalCost)).toString();
  return {
    allowed: true,
    remainingBudget: remaining,
  };
}

/**
 * Get or create session for current action
 * If no active session, creates a pending one for user approval
 */
export async function getOrCreateSession(
  agentAction: string,
  estimatedCost: string,
  durationSeconds: number = 3600 // 1 hour default
): Promise<Session> {
  const passport = getPassport();

  // Check for existing active session
  const active = passport.getActiveSessions();
  if (active.length > 0) {
    return active[0];
  }

  // Create new session
  const request = {
    sessionId: "", // Will be set by createSession
    action: agentAction,
    estimatedCost,
    duration: durationSeconds,
    scope: ["trade", "swap", "api_call"],
  };

  return passport.createSession(request);
}

/**
 * Report transaction result to session
 * Called after execute.ts succeeds
 */
export async function recordSessionSpend(sessionId: string, actualCost: string, txHash: string): Promise<void> {
  const passport = getPassport();
  await passport.recordSpend(sessionId, actualCost, txHash);
}

/**
 * Get session status for dashboard
 */
export function getSessionStatus(session: Session): {
  isActive: boolean;
  budgetUsedPercent: number;
  timeRemainingSeconds: number;
  canSpend: boolean;
} {
  const now = Date.now();
  const isActive = session.status === "active" && now < session.expiresAt;
  const budgetUsedPercent = Math.floor(
    (Number(session.spent) / Number(session.totalBudget)) * 100
  );
  const timeRemainingSec = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
  const remaining = BigInt(session.totalBudget) - BigInt(session.spent);
  const canSpend = isActive && remaining > 0n;

  return {
    isActive,
    budgetUsedPercent,
    timeRemainingSeconds: timeRemainingSec,
    canSpend,
  };
}
