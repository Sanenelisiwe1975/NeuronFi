# Kite Agent Passport — Quick Start (5 min)

## What You're Getting

Your AI agent can now:
- Register with Kite Passport (one-time setup)
- Request spending sessions with budget limits
- Get user approval via passkey
- Execute trades autonomously within limits
- Dashboard shows wallet + session status

## File Locations

**New package**:
- `packages/kite/` — Complete Passport implementation

**Updated web APIs**:
- `apps/web/api/agent/route.ts` — Now includes passport + session
- `apps/web/api/subscription/passport/route.ts` — Handle registration + approval

**New component**:
- `apps/web/components/PassportBadge.tsx` — Display wallet & session on dashboard

**Docs**:
- `KITE_PASSPORT_INTEGRATION.md` — Full integration guide (code examples included)
- `KITE_PASSPORT_DELIVERY.md` — What was delivered (this summary)

## 3 Steps to Integrate

### 1. Agent Startup
In `packages/agent/src/index.ts`:
```typescript
import { initializePassport } from "@repo/kite";

const passport = initializePassport();
await passport.register(userId, email, "NeuronFi Agent");
```

### 2. Before Execution
In `packages/agent/src/execute.ts`:
```typescript
import { getOrCreateSession, canExecuteTransaction } from "@repo/kite";

const session = await getOrCreateSession("Execute swap", estimatedCost, 3600);
const allowed = await canExecuteTransaction(session.id, gasCost, txValue);
if (allowed) {
  await executeOnKite(...);
  await recordSessionSpend(session.id, actualCost, txHash);
}
```

### 3. Dashboard
In `apps/web/app/dashboard/page.tsx`:
```typescript
import { PassportBadge } from "@/components/PassportBadge";

return <PassportBadge passport={state.passport} session={state.session} />;
```

## Test It (3 commands)

```bash
# 1. Register agent
curl -X POST http://localhost:3000/api/subscription/passport \
  -H "Content-Type: application/json" \
  -d '{"action":"register","userId":"test","email":"test@example.com","agentName":"TestBot"}'

# 2. Check state
curl http://localhost:3000/api/agent | jq '.passport,.session'

# 3. Approve session (when needed)
curl -X POST http://localhost:3000/api/subscription/passport \
  -H "Content-Type: application/json" \
  -d '{"action":"approve_session","sessionId":"session_...","approved":true}'
```

## How It Works (30 sec)

```
User                 Agent              Dashboard
 │                    │                     │
 ├─ Setup Passport ──→ │                     │
 │                    ├─ Poll for approval ─→
 │◄─ Approve (✓) ─────┤                     │
 │                    ├─ Executes trades ──→ (Display: 45% budget used)
 │                    │ (within limits)      │
 │                    └─ Session expires ─→  (Display: ⏳ Expired)
```

## Key Features

| Feature | What It Does |
|---|---|
| **Session** | Spending context with budget + time limit |
| **Passport** | Agent identity (wallet + registration) |
| **Spend Limit** | Agent can't spend more than approved |
| **Passkey** | User approves with fingerprint/Face ID, not signing |
| **Auto-Expiry** | Session expires automatically (no indefinite access) |

## Environment

Add to `.env`:
```env
KITE_RPC_URL=https://rpc.kite.core
AGENT_USER_ID=neuronfi_main
AGENT_EMAIL=agent@neuronfi.local
```

## Files Created

✅ `packages/kite/` — Full package (types, passport class, session utils)
✅ `apps/web/api/subscription/passport/route.ts` — API for register + approve
✅ `apps/web/components/PassportBadge.tsx` — Dashboard component
✅ Updated `apps/web/api/agent/route.ts` — Return passport + session state
✅ `KITE_PASSPORT_INTEGRATION.md` — Complete integration guide
✅ `KITE_PASSPORT_DELIVERY.md` — What was delivered

## Next

1. Read `KITE_PASSPORT_INTEGRATION.md` for full code examples
2. Follow the 3 integration steps above
3. Test with the 3 curl commands
4. Deploy and fund agent wallet

**Total time to integrate**: ~30 min for an experienced dev

---

*For detailed docs, see `KITE_PASSPORT_INTEGRATION.md`*
