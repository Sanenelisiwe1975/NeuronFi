import { z } from "zod";

/**
 * Session represents a spending approval from the user.
 * Agent can autonomously execute actions within budget/time limits.
 */
export const SessionSchema = z.object({
  id: z.string().describe("Unique session ID"),
  agentId: z.string().describe("Agent's Passport ID"),
  userId: z.string().describe("User who owns the agent"),
  status: z.enum(["pending", "approved", "active", "expired", "revoked"]).describe("Session state"),
  
  // Spending limits
  maxPerTransaction: z.string().describe("Max spend per action (in wei)"),
  totalBudget: z.string().describe("Total budget for session (in wei)"),
  spent: z.string().describe("Amount already spent (in wei)"),
  
  // Time limits
  createdAt: z.number().describe("Unix timestamp of creation"),
  approvedAt: z.number().optional().describe("Unix timestamp of approval"),
  expiresAt: z.number().describe("Unix timestamp of expiration"),
  
  // Scope
  scope: z.array(z.string()).describe("What agent is allowed to do"),
  
  // Metadata
  reason: z.string().optional().describe("User-supplied reason (e.g., 'Find and call weather API')"),
  transactionCount: z.number().default(0).describe("Number of transactions in session"),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Agent Passport — identity of the AI agent on Kite
 */
export const PassportSchema = z.object({
  id: z.string().describe("Unique Agent Passport ID (on Kite)"),
  userId: z.string().describe("Owner user ID"),
  
  // Account status
  isRegistered: z.boolean().describe("Agent registered on Kite"),
  email: z.string().email().describe("User email for verification"),
  
  // Keys
  passkeyId: z.string().optional().describe("Passkey ID on user's device"),
  
  // Funding
  walletAddress: z.string().describe("Kite Chain wallet address (0x...)"),
  balance: z.object({
    usdc: z.string().describe("USDC balance (in wei)"),
    native: z.string().describe("Native Kite token balance (in wei)"),
  }),
  
  // Metadata
  createdAt: z.number().describe("Unix timestamp of agent creation"),
  lastSeenAt: z.number().describe("Unix timestamp of last activity"),
});

export type Passport = z.infer<typeof PassportSchema>;

/**
 * Session approval request — what agent sends to user for approval
 */
export const ApprovalRequestSchema = z.object({
  sessionId: z.string(),
  action: z.string().describe("What the agent wants to do"),
  estimatedCost: z.string().describe("Estimated spend (in wei)"),
  duration: z.number().describe("How long session should be valid (seconds)"),
  scope: z.array(z.string()).describe("Specific capabilities needed"),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

/**
 * Session approval response — user's decision via passkey
 */
export const ApprovalResponseSchema = z.object({
  sessionId: z.string(),
  approved: z.boolean(),
  passkeySig: z.string().optional().describe("Passkey signature proving user identity"),
  denialReason: z.string().optional(),
});

export type ApprovalResponse = z.infer<typeof ApprovalResponseSchema>;
