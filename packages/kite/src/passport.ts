import { ethers } from "ethers";
import { Passport, Session, ApprovalRequest, ApprovalResponse } from "./types.js";

/**
 * KitePassport — manages agent identity, sessions, and spending on Kite Chain
 *
 * Flow:
 * 1. Agent registers with user email → Kite Passport creates account + sends verification
 * 2. User creates passkey via dashboard → Agent can now ask for approvals
 * 3. Agent wants to pay for something → Creates session with budget/time limit
 * 4. Calls createSession() → Returns approval request for user
 * 5. User approves via passkey → Session becomes active
 * 6. Agent can execute trades/API calls within budget
 * 7. Session expires or budget runs out → Must create new session
 */
export class KitePassport {
  private passport: Passport | null = null;
  private activeSessions: Map<string, Session> = new Map();
  private rpcUrl: string;
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string = "https://rpc.kite.core") {
    this.rpcUrl = rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Register a new agent with Kite Passport
   * User will receive verification email
   */
  async register(userId: string, email: string, agentName: string): Promise<Passport> {
    // In production, this calls Kite Passport API:
    // POST /api/passport/register
    // {
    //   userId: string,
    //   email: string,
    //   agentName: string
    // }
    // Returns Passport with wallet address + ID

    const walletAddress = ethers.getAddress(
      ethers.getCreateAddress({
        from: "0x" + "0".repeat(40), // Placeholder — actual AA deployment address
        nonce: 0,
      })
    );

    this.passport = {
      id: `agent_${userId}_${Date.now()}`,
      userId,
      email,
      isRegistered: false, // Pending email verification
      passkeyId: undefined,
      walletAddress,
      balance: {
        usdc: "0",
        native: "0",
      },
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
    };

    return this.passport;
  }

  /**
   * Verify email and complete registration
   * Called via link in verification email
   */
  async verifyEmail(passportId: string, verificationToken: string): Promise<boolean> {
    // In production: POST /api/passport/verify
    if (!this.passport || this.passport.id !== passportId) {
      return false;
    }

    this.passport.isRegistered = true;
    return true;
  }

  /**
   * Create a spending session — agent requests approval for a bounded set of actions
   */
  async createSession(request: ApprovalRequest): Promise<Session> {
    if (!this.passport) {
      throw new Error("Passport not registered. Call register() first.");
    }

    const sessionId = `session_${this.passport.id}_${Date.now()}`;
    const now = Date.now();
    const expiresAt = now + request.duration * 1000;

    const session: Session = {
      id: sessionId,
      agentId: this.passport.id,
      userId: this.passport.userId,
      status: "pending",
      maxPerTransaction: request.estimatedCost,
      totalBudget: (BigInt(request.estimatedCost) * 10n).toString(), // 10x for safety margin
      spent: "0",
      createdAt: now,
      approvedAt: undefined,
      expiresAt,
      scope: request.scope,
      reason: request.action,
      transactionCount: 0,
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Approve a session via user's passkey
   * In production, user does this on dashboard; here we simulate it
   */
  async approveSession(response: ApprovalResponse): Promise<Session> {
    const session = this.activeSessions.get(response.sessionId);
    if (!session) {
      throw new Error(`Session ${response.sessionId} not found`);
    }

    if (response.approved) {
      session.status = "active";
      session.approvedAt = Date.now();
    } else {
      session.status = "revoked";
    }

    return session;
  }

  /**
   * Check if agent can spend an amount
   * Called before executing a transaction
   */
  async validateSpend(sessionId: string, amount: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Check status
    if (session.status !== "active") {
      return false;
    }

    // Check expiration
    if (Date.now() > session.expiresAt) {
      session.status = "expired";
      return false;
    }

    // Check per-transaction limit
    if (BigInt(amount) > BigInt(session.maxPerTransaction)) {
      return false;
    }

    // Check total budget
    const remainingBudget = BigInt(session.totalBudget) - BigInt(session.spent);
    if (BigInt(amount) > remainingBudget) {
      return false;
    }

    return true;
  }

  /**
   * Record a spend against a session
   * Called after successfully executing a transaction
   */
  async recordSpend(sessionId: string, amount: string, txHash: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.spent = (BigInt(session.spent) + BigInt(amount)).toString();
    session.transactionCount += 1;

    // Emit event or log to database
    console.log(`[Passport] Recorded spend: ${amount} wei on session ${sessionId}, tx: ${txHash}`);
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): Session | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * List all active sessions
   */
  getActiveSessions(): Session[] {
    return Array.from(this.activeSessions.values()).filter((s) => s.status === "active");
  }

  /**
   * Get current passport
   */
  getPassport(): Passport | null {
    return this.passport;
  }

  /**
   * Fetch wallet balance from Kite
   * Used in dashboard to show available funds
   */
  async refreshBalance(): Promise<{ usdc: string; native: string }> {
    if (!this.passport) {
      throw new Error("No passport registered");
    }

    // TODO: Fetch actual balances from Kite
    // For now, return mock
    return {
      usdc: this.passport.balance.usdc,
      native: this.passport.balance.native,
    };
  }
}

// Singleton instance
let passportInstance: KitePassport | null = null;

/**
 * Initialize global Passport instance
 */
export function initializePassport(rpcUrl?: string): KitePassport {
  if (!passportInstance) {
    passportInstance = new KitePassport(rpcUrl);
  }
  return passportInstance;
}

/**
 * Get global Passport instance
 */
export function getPassport(): KitePassport {
  if (!passportInstance) {
    passportInstance = initializePassport();
  }
  return passportInstance;
}
