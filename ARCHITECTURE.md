# How This Project Is Connected — A Beginner's Guide

This document explains the whole system from scratch: what each piece does, why it exists, and how the pieces talk to each other. Read this before diving into any individual package.

---

## The Big Picture — What Is This Thing?

This is a **bot that manages money on a blockchain by itself — on Kite chain.**

Every 60 seconds it wakes up, looks at the market, thinks about what to do, makes a decision, does a trade (or not), attests the result on-chain, and records what happened. Then it sleeps and does it all again — forever, without a human pressing any buttons.

The loop has six steps and each step is its own file:

```
observe.ts  →  reason.ts  →  decide.ts  →  execute.ts  →  resolve.ts  →  learn.ts
   │               │              │              │               │              │
 "What is        "What         "Should        "Actually       "Attest        "Write
  happening       should        I do          do it"          it on          it down"
  right now?"     I do?"        this?"        gaslessly"      Kite chain"
```

---

## The Monorepo — Why So Many Folders?

The project is split into **packages** (libraries) and **apps** (things that run). This is called a monorepo — one Git repo, many projects that share code.

```
NeuronFi/
│
├── packages/          ← libraries (no user-facing UI)
│   ├── kite/          ← Kite AA SDK wallet, Agent Passport, attestations
│   ├── data/          ← fetches prices, gas costs, market data
│   ├── planner/       ← asks Claude (Anthropic) what to do
│   └── agent/         ← the main loop (uses all three above)
│
├── apps/
│   └── web/           ← dashboard website so you can watch the bot
│
├── packages/contracts/ ← the Solidity smart contracts on Kite chain
└── infra/              ← cloud infra config (Neon Postgres + Upstash Redis)
```

**Why split it up?** Each package has one job. You can swap out `data/` (e.g. use a different price source) without touching `agent/`. You can test `planner/` in isolation without a real wallet.

---

## Package Dependency Map

This shows which package imports which. An arrow means "uses":

```
                 ┌──────────────┐
                 │  @repo/data  │  prices, gas, liquidity
                 └──────┬───────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
          ▼             ▼              ▼
   ┌────────────┐ ┌──────────────┐    │
   │ @repo/kite │ │@repo/planner │    │
   │  (wallet + │ │  (Claude AI) │    │
   │  passport +│ │              │    │
   │  attest)   │ │              │    │
   └──────┬─────┘ └──────┬───────┘    │
          │              │            │
          └──────────────┴────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ @repo/agent │  ← the main loop
                  └──────┬──────┘
                         │
                         ▼
                    ┌──────────┐
                    │ apps/web │  ← reads what agent logged
                    └──────────┘
```

**Rule:** packages on the left/top get built first. Turbo handles the order automatically because of `"dependsOn": ["^build"]` in `turbo.json`.

---

## Step 1 — `@repo/data` (The Sensors)

**Files:** `oracle.ts`, `liquidity.ts`, `gas.ts`

**Job:** Fetch numbers from the outside world. No decisions here — just raw data.

### What it fetches:

```
Chainlink (on-chain, Kite)  →  ETH price, USDC price
  └─ if Chainlink fails      →  CoinGecko REST API (fallback)

Kite node (on-chain)        →  current gas price (always near-zero — Kite is gasless)
Uniswap V3 pool (on-chain)  →  how much liquidity is in a trading pool
```

### Why does this exist as its own package?

Both `planner/` and `agent/` need prices. If price fetching lived inside `agent/`, `planner/` couldn't use it without importing `agent/` — which would create a circular dependency. Shared data code goes in `data/`.

### Key functions you'll call:

```ts
import { fetchPrices, fetchGasSnapshot, fetchPoolLiquidity } from "@repo/data";

const prices = await fetchPrices(provider);
// → { ethUsd: 2400, usdcUsd: 1.0001 }

const gas = await fetchGasSnapshot(provider);
// → { baseFeePerGas: 0n, gasPriceGwei: 0 }  ← gasless on Kite via paymaster
```

---

## Step 2 — `@repo/kite` (The Wallet, Identity & Attestation Layer)

**Files:** `wallet.ts`, `passport.ts`, `attestation.ts`, `bridge.ts`

**Job:** Everything that touches Kite chain directly — wallet management, agent identity, on-chain attestation, and cross-chain bridging.

### What Kite AA SDK is

The Kite **Account Abstraction (AA) SDK** creates a smart contract wallet (not a plain EOA). This smart account is sponsored by a Kite **paymaster** — meaning all gas fees are covered, and the agent never needs native gas tokens. Approved actions are submitted as **UserOperations** batched into a single on-chain call.

### What Agent Passport is

A **Kite Agent Passport** is an on-chain identity registration for autonomous agents. On first startup, the agent registers itself with a name, capability list, and owner address. Every trade and attestation is associated with the passport ID — making the agent's full activity queryable in the Kite explorer.

```
Your .env file
  AGENT_PRIVATE_KEY=0x…
  KITE_PAYMASTER_URL=https://…
        │
        ▼
  createAgentWallet()          ← wallet.ts
        │
        ▼
  Kite AA smart account
        ├── getUsdcBalance()          → USDC balance (6 decimals)
        ├── transferUsdc(to, amount)  → gasless USDC transfer via paymaster
        └── batchExecute([…])         → multiple actions in one UserOperation
```

### What Attestation does

After every market resolution, `attestation.ts` writes a record to the **Kite Attestation Registry**:

```ts
// attestation.ts
await kiteAttestation.attest({
  subject: marketAddress,
  data: keccak256(abi.encodePacked(marketId, rationale, outcome, timestamp)),
  attester: agentPassportId,
});
```

This makes every AI decision permanently auditable — anyone can verify what the agent decided and why, directly on Kite chain.

### The transfer shape

```ts
// CORRECT ✓
await transferUsdc({
  to: "0xRecipient",
  amount: 5_000_000n,          // micro-USDC (1 USDC = 1,000,000)
  paymasterUrl: KITE_PAYMASTER_URL,
});
```

### Cross-chain bridge

`bridge.ts` wraps Kite's **LayerZero** integration for cross-chain USDC transfers. Enable with `LAYERZERO_BRIDGE_ENABLED=true`. Used when the `BRIDGE_USDC` action type is approved.

---

## Step 3 — `@repo/planner` (The Brain)

**Files:** `goals.ts`, `actions.ts`, `openclaw.ts`, `prompts/`

**Job:** Look at all the market data and decide what the agent *should* do — using Claude Sonnet 4.6 (Anthropic).

### How it works internally

```
MarketObservation (prices + gas + opportunities)
        │
        ▼
buildPlanningMessage()   ← prompts/planning.ts assembles a prompt
        │
        ▼
ChatAnthropic (Claude Sonnet 4.6, JSON mode)
        │  "Here is what I recommend..."
        ▼
Zod schema validation    ← makes sure Claude returned valid JSON
        │
        ▼
AgentAction[]            ← list of typed decisions
  e.g. { type: "ENTER_MARKET", marketId: "…", probability: 0.72, ev: 0.08 }
```

### What is an AgentAction?

It's a typed instruction. There are five kinds:

```ts
{ type: "ENTER_MARKET",  marketId: "…", amountMicroUsdc: 5_000_000n, probability: 0.72 }
{ type: "EXIT_MARKET",   marketId: "…" }
{ type: "REBALANCE",     fromToken: "USDC", toToken: "ETH", amountMicroUsdc: 10_000_000n }
{ type: "BRIDGE_USDC",   targetChain: "base", amountMicroUsdc: 20_000_000n }
{ type: "HOLD" }  // do nothing this cycle
```

### What is "OpenClaw"?

It's the name given to the reasoning engine in this project. It uses LangChain.js as the framework to call Claude Sonnet 4.6 via the Anthropic API. LangChain handles prompt templating, retries, and output parsing.

### What if there's no Anthropic API key?

`openclaw.ts` has a `mockPlan()` fallback that always returns `HOLD`. The whole loop still runs — it just never trades. Useful for testing without spending API credits.

---

## Step 4 — `@repo/agent` (The Loop)

This is where everything comes together. Each file is one phase of the loop.

### `observe.ts` — gather signals

```ts
async function observe(account, rpcUrl, network): Promise<ObserveResult>
```

Calls `@repo/data` and `@repo/kite` in parallel:

```
observe()
  ├── fetchPrices(provider)           → ETH/USDC prices
  ├── fetchGasSnapshot(provider)      → current gas cost (near-zero on Kite)
  ├── getPortfolioSnapshot(account)   → wallet USDC balances
  ├── fetchPoolLiquidity(provider)    → Uniswap depth
  ├── discoverOpportunities()         → open prediction markets (on-chain via MarketFactory)
  └── checkRiskGates(prices, gas)     → [warnings if USDC depegged]
```

Also auto-tops-up the agent's USDC from `AgentVault` if balance drops below $50.

Returns one big `ObserveResult` object that all later phases read.

### `reason.ts` — ask Claude

```ts
async function reason(signals: ObserveResult): Promise<ActionPlan>
```

A thin wrapper. Just calls `planner.plan(signals)` and returns the result. One line of real logic — the complexity lives in `@repo/planner`.

### `decide.ts` — apply hard rules

```ts
function decide(plan: ActionPlan, signals: ObserveResult): DecisionResult
```

Claude's suggestions go through a filter. This phase cannot be bypassed:

```
For each action in the plan:

  1. Is USDC depegged (price < $0.995)?         → reject everything
  2. Is gas unusually high?                      → reject everything
  3. Did Claude say "just HOLD"?                 → approve only HOLD
  4. Is net EV < 2%?                             → reject this action
     (EV = probability × payout − 1 − gas cost)
  5. Is risk score > 70?                         → reject this action
  6. Is position > 5% of portfolio?              → clamp it down, not reject
  7. Is position < $1 after clamping?            → reject this action
  8. Is there already an open position here?     → reject (no double-entry)
  ──────────────────────────────────────────────────────────────────────
  Everything that passes → approved[]
  Everything that failed → rejected[] with a reason string
```

**Why separate decide from reason?** The LLM can hallucinate or be overconfident. Hard math in `decide.ts` is the safety net.

### `execute.ts` — do the actual thing

```ts
async function execute(decision: DecisionResult, account, dryRun): Promise<ExecutionResult[]>
```

Routes each approved action to the correct on-chain call via the Kite AA SDK:

```
ENTER_MARKET  → transferUsdc() to prediction market contract (gasless via paymaster)
                then createConditionalPayment() → locks 1% performance fee in escrow
EXIT_MARKET   → contract call to redeem position
REBALANCE     → swap USDC ↔ ETH
BRIDGE_USDC   → LayerZero cross-chain USDC transfer
HOLD          → nothing (logs "no-op")
```

If `AGENT_DRY_RUN=true` (the default for testing), execute logs what it *would* do but never sends a real transaction.

### `resolve.ts` — close markets and attest

```ts
async function resolveMarkets(account, rpcUrl): Promise<void>
```

Runs alongside the main loop. For each market past its closing time:

```
1. Fetch final Chainlink price for the market's asset
2. Compare to the market's prediction threshold
3. Call MarketResolver.aiResolve(outcome, rationale) on-chain
4. Write attestation to Kite Attestation Registry
   → keccak256(marketId + rationale + outcome + timestamp)
5. Wait 24-hour dispute window, then finalize
6. Release ConditionalPayment escrow to treasury (if prediction was correct)
```

The attestation step is what makes NeuronFi unique — every AI decision is permanently verifiable on Kite chain.

### `learn.ts` — write it all down

```ts
async function learn(cycleData): Promise<void>
```

Saves the outcome of every cycle in three places simultaneously:

```
agent-outcomes.jsonl  ← plain text file, one JSON line per cycle (always works)
PostgreSQL            ← loop_outcomes table (structured queries, analytics)
Redis                 ← agent:latest key (dashboard reads this) + publishes agent:events
```

Uses `Promise.allSettled` so if Postgres is down, the file log still saves. No single failure kills the cycle.

Also updates **Bayesian priors** (Beta distribution EMA) per action type in `priors.json` — the agent gradually learns which action types perform best.

### `index.ts` — the main loop

```ts
// Agent Passport registration (once at startup)
await registerAgentPassport({ name: "NeuronFi Trading Agent", capabilities: [...] });

while (true) {
  await runCycle();       // observe → reason → decide → execute → learn
  await resolveMarkets(); // close expired markets + write attestations
  await sleep(60_000);   // wait 60 seconds
}
```

Also handles:
- Loading `.env` at startup
- Creating the Kite AA smart account once (not every cycle)
- Acquiring a Redis distributed lock (prevents two agent instances running at once)
- Catching errors so one bad cycle doesn't kill the agent
- Listening for Ctrl+C (SIGINT) to safely shut down

---
## The Smart Contracts (`packages/contracts/`)

The agent interacts with these Solidity contracts deployed on **Kite chain**:

```
User deposits USDC
        │
        ▼
  AgentVault.sol
  ├── agentWithdrawUsdc()  ← only the agent's AA wallet can call this
  └── userWithdraw()       ← user can reclaim funds
        │
        ▼
  MarketFactory.sol
  └── createMarket()  →  PredictionMarket.sol
                           ├── enterPosition(isYes, amount) → mints OutcomeToken (YES/NO)
                           ├── redeem()                     → winning tokens pay out USDC
                           └── resolve(winner)              → set by MarketResolver
        │
        ▼
  MarketResolver.sol
  ├── aiResolve(outcome, rationale)  ← agent writes AI rationale on-chain
  ├── 24-hour dispute window
  └── → Kite Attestation Registry   ← permanent, verifiable proof of decision
        │
        ▼
  ConditionalPayment.sol
  └── createPayment()  ← locks 1% fee; released to treasury only if prediction correct

  SubscriptionManager.sol
  └── subscribe(plan)  ← users pay USDC for FREE/BASIC/PRO/INSTITUTIONAL tiers
```

**PredictionMarket** is a binary AMM (Automated Market Maker). You bet YES or NO on an event. If you're right, you get a payout. The agent tries to predict which outcome is more likely and enter before the market price catches up.

**ConditionalPayment** is the performance accountability mechanism — the agent only earns its fee if it's actually right.

**TypeChain** generates TypeScript types from the ABI so the agent's TypeScript code is fully typed when calling contract functions.

---

## The Dashboard (`apps/web/`)

A Next.js website that shows what the agent is doing in near-real-time.

```
Agent (every cycle)
  └── learn.ts sets Redis key: agent:latest = { portfolio, lastAction, passportId, … }
                                                        │
                                                        │  every 10 seconds
                                                        ▼
                                              apps/web/app/api/agent/route.ts
                                              (Next.js API route)
                                              reads Redis → returns JSON
                                                        │
                                                        ▼
                                              apps/web/app/dashboard/page.tsx
                                              (React client component)
                                              shows MetricCards, PortfolioChart,
                                              TradeTable, AttestationFeed
```

The dashboard doesn't talk to the blockchain directly for live state. It reads what the agent has already logged in Redis, and makes targeted on-chain reads (vault balances, market lists) via Next.js API routes.

**Key dashboard views:**
- **Markets tab** — open prediction markets with YES/NO probabilities, agent position badges, days remaining
- **Portfolio tab** — USDC balance, portfolio value chart, trade history with Kite Explorer links
- **Agent tab** — live reasoning text, cycle time, Agent Passport ID, ConditionalPayment escrows
- **Resolution feed** — AI rationale + Kite Attestation Registry hash per resolved market
- **Subscribe** — USDC-powered subscription tiers, purchasable directly from the UI

---

## The Infrastructure (`infra/`)

Two managed cloud services — no Docker needed for production:

| Service | Provider | Purpose |
|---|---|---|
| PostgreSQL | [Neon](https://neon.tech) (free tier) | Stores cycle history, trades, portfolio snapshots |
| Redis | [Upstash](https://upstash.com) (free tier) | Fast cache; dashboard reads `agent:latest`; pub/sub for live events |

`infra/init.sql` creates the database tables. Apply it by pasting into the Neon SQL editor:
- `loop_outcomes` — one row per agent cycle
- `trades` — one row per executed trade
- `portfolio_snapshots` — balance history
- `market_signals` — raw price/gas readings
- `agent_priors` — learned probability estimates (Bayesian updating)

---

## How to Trace a Single Cycle End-to-End

Here is exactly what happens when the agent wakes up:

```
1. index.ts           resolveConfig() reads .env
2. index.ts           registerAgentPassport() → Kite Passport ID: 0xABC…
3. index.ts           createAgentWallet() → Kite AA smart account (gasless)
4. index.ts           acquireRedisLock() → prevents duplicate instances
5. index.ts           calls runCycle()

6. observe.ts         fetchPrices()           → ETH=$2400, USDC=$1.00
7. observe.ts         fetchGasSnapshot()      → 0 gwei (gasless — paymaster covers it)
8. observe.ts         getPortfolioSnapshot()  → 100 USDC, 0.05 ETH
9. observe.ts         discoverOpportunities() → 4 open prediction markets
10. observe.ts        checkRiskGates()        → [] (no gates triggered)

11. reason.ts         OpenClawPlanner.plan(signals)
12. openclaw.ts         buildPlanningMessage() assembles prompt
13. openclaw.ts         Claude Sonnet 4.6 responds: "ENTER_MARKET on market_002, 70% confidence"
14. openclaw.ts         Zod validates the JSON response
15. reason.ts         returns ActionPlan { actions: [EnterMarketAction], recommendHold: false }

16. decide.ts         no risk gates → proceed
17. decide.ts         action = ENTER_MARKET, market_002
18. decide.ts           rawEV = 0.70 × 1.8 − 1 = 0.26
19. decide.ts           gasCostFraction = $0.00 / $100 = 0.00  ← gasless!
20. decide.ts           netEV = 0.26  ✓ (> 0.02 min)
21. decide.ts           riskScore = 34  ✓ (< 70 max)
22. decide.ts           position = $5, cap = $5 (5% of $100)  ✓
23. decide.ts         approved: [EnterMarketAction]

24. execute.ts        transferUsdc({ to: market_002, amount: 5_000_000n }) via Kite AA SDK
25. execute.ts        → UserOperation submitted to Kite paymaster (gas: $0.00)
26. execute.ts        createConditionalPayment() → locks $0.05 performance fee in escrow

27. resolve.ts        checks expired markets → none expired this cycle

28. learn.ts          writes to agent-outcomes.jsonl
29. learn.ts          INSERT INTO loop_outcomes VALUES (…)
30. learn.ts          Redis SET agent:latest = { passportId: 0xABC…, … }
31. learn.ts          updates priors.json with Beta distribution EMA

32. index.ts          sleep 60 seconds → goto step 5
```

---

## Where to Start When Building Something Like This

If you were building this from scratch, the order to build would be:

```
1. infra/              → provision Neon Postgres + Upstash Redis
2. packages/data/      → write price/gas fetchers, test them in isolation
3. packages/kite/      → wrap the Kite AA SDK, test getUsdcBalance()
4. packages/planner/   → write the prompt, test with Claude mock first
5. packages/contracts/ → write + deploy Solidity contracts to Kite chain
6. packages/agent/     → wire observe→reason→decide→execute→resolve→learn
7. apps/web/           → build the dashboard last, everything else is an API
```

This matches the dependency order. You can't build `agent/` until `data/`, `kite/`, and `planner/` all work — because `agent/` imports all of them.

---

## Glossary

| Term | Plain English |
|---|---|
| **EV (Expected Value)** | Average profit per dollar risked. EV = 0.08 means expect 8 cents profit per dollar. |
| **AA (Account Abstraction)** | Smart contract wallet that can have custom rules, batch transactions, and sponsor gas fees. |
| **UserOperation** | The AA equivalent of a transaction — submitted to a bundler, not directly to the chain. |
| **Paymaster** | A smart contract that pays gas fees on behalf of the user. Kite's paymaster makes all agent transactions gasless. |
| **Agent Passport** | Kite's on-chain registry for autonomous agent identities. Gives the agent a verifiable ID. |
| **Attestation** | A signed, on-chain record proving that something happened. NeuronFi uses this to prove AI decisions. |
| **Basis points (bps)** | 1 bps = 0.01%. 200 bps = 2%. |
| **Wei** | Smallest ETH unit. 1 ETH = 1,000,000,000,000,000,000 wei (1e18). |
| **Micro-USDC** | Smallest USDC unit. 1 USDC = 1,000,000 micro-USDC (6 decimals). |
| **Non-custodial** | The agent controls funds but cannot steal them — only the private key owner can. |
| **AMM** | Automated Market Maker. A smart contract that sets prices using a formula instead of an order book. |
| **ERC-20** | The standard interface for fungible tokens on EVM chains. USDC is an ERC-20 token. |
| **ABI** | Application Binary Interface — the recipe for calling a smart contract's functions. |
| **TypeChain** | Tool that reads ABI files and generates TypeScript types for contract calls. |
| **Monorepo** | One Git repo containing multiple packages/apps that can import each other. |
| **Turborepo** | Build tool that understands the monorepo dependency graph and only rebuilds what changed. |
| **ESM** | ES Modules — the modern JavaScript import/export system (`import x from "y"`). All packages use ESM. |
| **LayerZero** | Cross-chain messaging protocol. Used here to bridge USDC between Kite and other chains. |
| **Beta distribution EMA** | The Bayesian learning method used to update the agent's confidence in each action type over time. |
