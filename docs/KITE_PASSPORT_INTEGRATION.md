# Kite Agent Passport Integration Guide

This document explains how to integrate Kite Agent Passport into the NeuronFi codebase.

## What Was Added

### 1. New Package: `@repo/kite`

Core Passport implementation with session management:

- **`packages/kite/src/types.ts`** — Session, Passport, ApprovalRequest/Response schemas
- **`packages/kite/src/passport.ts`** — KitePassport class for registration + session lifecycle
- **`packages/kite/src/session.ts`** — Session utilities for spend validation
- **`packages/kite/README.md`** — Usage documentation

### 2. Updated Web APIs

- **`apps/web/api/agent/route.ts`** — Now includes passport + session state in response
- **`apps/web/api/subscription/passport/route.ts`** — Handles registration + session approval

### 3. New Dashboard Component

- **`apps/web/components/PassportBadge.tsx`** — Displays wallet, session status, budget usage

---

## Integration Workflow

### Phase 1: Agent Registration (Startup)

In `packages/agent/src/index.ts` or wherever the agent loop starts:

```typescript
import { initializePassport } from "@repo/kite";

async function startAgent() {
  // Initialize Passport
  const passport = initializePassport();

  const userId = process.env["AGENT_USER_ID"] || "default_user";
  const email = process.env["AGENT_EMAIL"] || "agent@neuronfi.local";

  // Register agent if not already done
  const registered = await passport.register(userId, email, "NeuronFi Agent");
  console.log("Agent registered with wallet:", registered.walletAddress);

  // Now start the main loop
  while (true) {
    await observeReasonDecideExecuteResolveLearn();
    await sleep(60000); // 60 sec
  }
}
```

### Phase 2: Create Session Before Execution

In `packages/agent/src/decide.ts` or `execute.ts`:

```typescript
import { getOrCreateSession } from "@repo/kite";

export async function execute(actions: Action[]) {
  // Create spending session if needed
  const estimatedCost = calculateTotalCost(actions); // e.g., "1000000000000000000" wei
  const session = await getOrCreateSession(
    `Execute ${actions.length} trades`, // User sees this in approval UI
    estimatedCost,
    3600 // 1-hour session
  );

  // If session is pending, user must approve on dashboard
  if (session.status === "pending") {
    console.log("Awaiting user approval for session:", session.id);
    return; // Skip execution until approved
  }

  // Safe to proceed
  for (const action of actions) {
    await executeAction(action, session.id);
  }
}
```

### Phase 3: Validate Before Sending Transaction

In `packages/agent/src/execute.ts`:

```typescript
import { canExecuteTransaction, recordSessionSpend } from "@repo/kite";

async function executeAction(action: Action, sessionId: string) {
  // Check spending limit
  const validation = await canExecuteTransaction(
    sessionId,
    "0", // Kite is gasless
    action.value
  );

  if (!validation.allowed) {
    console.error("Cannot execute:", validation.reason);
    console.log("Remaining budget:", validation.remainingBudget);
    return; // Create new session if needed
  }

  // Execute transaction
  const txHash = await kiteSDK.executeTransaction({
    to: action.to,
    value: action.value,
    data: action.data,
  });

  // Record the spend
  await recordSessionSpend(sessionId, action.value, txHash);
}
```

### Phase 4: Display in Dashboard

In `apps/web/app/dashboard/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { PassportBadge } from "@/components/PassportBadge";

export default function Dashboard() {
  const [agentState, setAgentState] = useState(null);

  useEffect(() => {
    const poll = async () => {
      const res = await fetch("/api/agent");
      const data = await res.json();
      setAgentState(data);
    };

    poll();
    const interval = setInterval(poll, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (!agentState) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>NeuronFi Agent Dashboard</h1>

      {/* Passport + Session Status */}
      <section style={{ marginBottom: "30px" }}>
        <h2>Agent Account</h2>
        <PassportBadge
          passport={agentState.passport}
          session={agentState.session}
        />
      </section>

      {/* Existing agent state (portfolio, trades, etc.) */}
      {/* ... */}
    </div>
  );
}
```

### Phase 5: Session Approval UI

In `apps/web/app/dashboard/page.tsx` or a separate modal:

```typescript
import { useState } from "react";

export function SessionApprovalModal({ sessionId, onApprove }: Props) {
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    const res = await fetch("/api/subscription/passport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve_session",
        sessionId,
        approved: true,
        // In production, include actual passkey signature
      }),
    });

    const result = await res.json();
    if (result.success) {
      onApprove();
    }
    setApproving(false);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #0a0" }}>
      <h3>⚠️ Session Approval Required</h3>
      <p>Agent is requesting spending approval for upcoming trades.</p>
      <button
        onClick={handleApprove}
        disabled={approving}
        style={{
          padding: "10px 20px",
          background: "#0a0",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          cursor: approving ? "not-allowed" : "pointer",
        }}
      >
        {approving ? "Approving..." : "Approve via Passkey"}
      </button>
    </div>
  );
}
```

---

## Environment Variables

Add to `.env` or `.env.local`:

```env
# Kite RPC endpoint
KITE_RPC_URL=https://rpc.kite.core

# Agent identification
AGENT_USER_ID=neuronfi_main
AGENT_EMAIL=agent@neuronfi.local

# Redis (for storing agent state)
REDIS_URL=redis://localhost:6379
```

---

## Data Flow

```
Agent Loop (packages/agent)
  ↓
observe() → fetch prices, portfolio
  ↓
reason() → Claude decides actions
  ↓
decide() → Risk gates + filtering
  ↓
execute() → [NEW] Check spending limits via Passport
  ↓
  ├─ getOrCreateSession() if needed
  ├─ canExecuteTransaction() for each action
  ├─ Send tx to Kite
  └─ recordSessionSpend() after tx confirms
  ↓
resolve() → Attest on Kite chain
  ↓
learn() → Log outcomes

Dashboard (apps/web)
  ↓
GET /api/agent
  ├─ Query Redis for agent state
  └─ GET Passport state + session info via @repo/kite
  ↓
Display PassportBadge with:
  - Wallet address
  - Session status (pending/active/expired)
  - Budget usage %
  - Time remaining
  - USDC balance
```

---

## Testing Locally

### 1. Register Agent

```bash
curl -X POST http://localhost:3000/api/subscription/passport \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "userId": "test_user",
    "email": "test@example.com",
    "agentName": "TestBot"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Agent registered. Verification email sent.",
  "passport": {
    "id": "agent_test_user_1234567890",
    "walletAddress": "0x...",
    "email": "test@example.com"
  }
}
```

### 2. Check Passport State

```bash
curl http://localhost:3000/api/agent
```

Response includes new fields:
```json
{
  "passport": {
    "walletAddress": "0x...",
    "isRegistered": false,
    "balance": { "usdc": "0", "native": "0" }
  },
  "session": null
}
```

### 3. Approve Session (Simulated)

```bash
curl -X POST http://localhost:3000/api/subscription/passport \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_session",
    "sessionId": "session_..._1234567890",
    "approved": true
  }'
```

---

## Next Steps

1. **Fund Agent Wallet** — Use Kite on-ramp or testnet faucet to add USDC
2. **Connect Passkey** — Update `/api/subscription/passport` to validate real passkeys
3. **Monitoring** — Add session lifecycle events to database for audit trail
4. **Error Handling** — Handle session expiration gracefully in agent loop
5. **Multi-Session** — Support multiple concurrent sessions if needed

---

## Architecture Decision Rationale

**Why separate `@repo/kite` package?**
- Isolates wallet/payment logic from core agent loop
- Reusable in other parts of NeuronFi (web, SDK, etc.)
- Easy to mock for testing
- Clear dependency boundaries

**Why sessions instead of per-transaction approvals?**
- Reduces user friction (one approval per batch of trades)
- Fits AI agent workflow (autonomous within budget/time)
- Proven pattern (Ethereum transaction batching, MEV protection)

**Why Passport vs direct wallet signing?**
- User retains device-based proof of authorization
- Agent never has private keys (biggest security advantage)
- Wallets are ephemeral per session (rotating keys)
- Matches Web3 UX expectations (MetaMask-like)
