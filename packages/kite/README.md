# @repo/kite — Kite Agent Passport

AI agent identity, spending sessions, and gasless payment infrastructure on Kite Chain.

## What It Does

- **Agent Registration**: Registers AI agent with Kite Passport, gets wallet address
- **Session Management**: Create spending sessions with budget + time limits
- **Spend Validation**: Check if transaction fits current session budget before executing
- **Spend Recording**: Track all spending against sessions for audit trail
- **Passkey Integration**: User approves sessions via device passkey (fingerprint/FaceID/hardware key)

## Installation

```bash
npm install @repo/kite
```

Add to `packages/agent` dependencies:

```json
{
  "dependencies": {
    "@repo/kite": "*"
  }
}
```

## Usage

### 1. Register Agent (on startup)

```typescript
import { initializePassport } from "@repo/kite";

const passport = initializePassport();

const userPassport = await passport.register(
  userId,
  "user@example.com",
  "KiteTradeBot"
);

console.log("Agent wallet:", userPassport.walletAddress);
// Send verification email to user
```

### 2. Create Session for Action

Before agent executes trades, create a session:

```typescript
import { getOrCreateSession, recordSessionSpend } from "@repo/kite";

// In agent's decide/execute phase
const session = await getOrCreateSession(
  "Execute swap ETH → USDC", // User sees this
  "1000000000000000000", // 1 USDC in wei
  3600 // 1 hour session
);

// Session is pending — user must approve on dashboard via passkey
// Once approved, session.status === "active"
```

### 3. Validate Before Execute

In agent's `execute.ts`:

```typescript
import { canExecuteTransaction } from "@repo/kite";

const canExecute = await canExecuteTransaction(
  sessionId,
  "0", // estimated gas (Kite is gasless)
  tradeAmount
);

if (!canExecute.allowed) {
  console.log("Cannot execute:", canExecute.reason);
  // Create new session if needed
  return;
}

// Safe to execute
const txHash = await executeOnKite(...);
```

### 4. Record Spend

After successful transaction:

```typescript
import { recordSessionSpend } from "@repo/kite";

await recordSessionSpend(sessionId, actualSpentAmount, txHash);
```

### 5. Check Session Status (Dashboard)

```typescript
import { getSessionStatus } from "@repo/kite";

const passport = getPassport();
const session = passport.getSession(sessionId);
const status = getSessionStatus(session);

console.log({
  isActive: status.isActive,
  budgetUsedPercent: status.budgetUsedPercent,
  timeRemainingSeconds: status.timeRemainingSeconds,
  canSpend: status.canSpend,
});
```

## Integration Points

### Agent Loop

- **observe.ts** → `initializePassport()` on startup
- **decide.ts** → `getOrCreateSession()` before proposing trades
- **execute.ts** → `canExecuteTransaction()` + `recordSessionSpend()` around Kite SDK calls

### Web Dashboard

- **api/agent/route.ts** → Expose `getPassport().getActiveSession()`
- **dashboard/page.tsx** → Display session status + spending
- **components/StatusBadge.tsx** → Show "Session Active" / "Awaiting Approval" / "Expired"

## Session Lifecycle

```
CREATE (pending)
  ↓
[User approves on dashboard via passkey]
  ↓
ACTIVE (can spend within budget/time)
  ↓
EXPIRED (time runs out) or REVOKED (user cancels)
  ↓
[Agent must create new session for next action]
```

## Environment Variables

```env
# Kite RPC endpoint
KITE_RPC_URL=https://rpc.kite.core

# Passport API endpoint (future)
KITE_PASSPORT_API=https://passport.kite.core/api
```

## Architecture

```
┌─────────────────────────┐
│    KitePassport         │  ← Main class, manages identity + sessions
├─────────────────────────┤
│ - register()            │
│ - createSession()       │
│ - approveSession()      │
│ - validateSpend()       │
│ - recordSpend()         │
└──────────┬──────────────┘
           │
┌──────────┴─────────────────┐
│    Session Management      │
├────────────────────────────┤
│ - getOrCreateSession()     │
│ - canExecuteTransaction()  │
│ - recordSessionSpend()     │
│ - getSessionStatus()       │
└────────────────────────────┘
```

## Security Model

1. **Agent Registration**: Email verification proves user ownership
2. **Session Approval**: User's device passkey proves authorization (not agent)
3. **Budget Enforcement**: Agent cannot exceed session limits (code-enforced)
4. **Time Limits**: Sessions auto-expire to prevent unlimited access
5. **Audit Trail**: Every spend recorded on-chain and in DB

---

**Next Steps:**

- Integrate into `@repo/agent` loop
- Update `apps/web` API routes to expose session state
- Connect dashboard to show active sessions + approval UI
