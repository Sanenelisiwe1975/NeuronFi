# @repo/agent — Autonomous DeFi Agent Loop

The core runtime. Implements the **Observe → Reason → Decide → Execute → Resolve → Learn** cycle that runs continuously on Kite chain.

## Loop

```
┌──────────────────────────────────────────────────────────────────┐
│                            main()                                │
│                                                                  │
│  observe() → reason() → decide() → execute() → resolve()         │
│        └────────────────── learn() ────────────────────────┘    │
│                    (every AGENT_LOOP_INTERVAL_MS)                │
└──────────────────────────────────────────────────────────────────┘
```

## Modules

| File | Purpose |
|---|---|
| `index.ts` | Entry point; registers Agent Passport, acquires Redis lock, runs main loop, graceful shutdown |
| `observe.ts` | Fetches prices, gas, portfolio, liquidity, and market opportunities; auto-tops-up USDC from AgentVault |
| `reason.ts` | Thin wrapper that calls `OpenClawPlanner.plan()` via Claude Sonnet 4.6 |
| `decide.ts` | Global risk gates + per-action EV / position-size filtering |
| `execute.ts` | Routes approved actions to Kite AA SDK transfers / contract calls (gasless via paymaster) |
| `resolve.ts` | Closes expired markets, writes AI rationale + Kite Attestation Registry entry, releases ConditionalPayment escrow |
| `learn.ts` | Persists cycle outcomes to JSON log, PostgreSQL, and Redis; updates Bayesian priors |

## Risk Gates (`decide.ts`)

| Gate | Threshold |
|---|---|
| Max position size | 5% of portfolio |
| Max risk score | 70 / 100 |
| Min EV | 0.02 (2%) |
| USDC depeg halt | price < $0.995 |
| Double-entry guard | no re-entry on open positions |
| Network congestion halt | base fee above threshold |

> Gas cost is always $0.00 — all transactions are sponsored by the Kite paymaster.

## Persistence (`learn.ts`)

- **JSON log** — `data/agent-outcomes.jsonl` appended each cycle
- **PostgreSQL** — `loop_outcomes` table (see `infra/init.sql`)
- **Redis** — publishes to `agent:events` channel; sets `agent:latest` key (5-min TTL)
- **Bayesian priors** — `data/priors.json` updated with Beta distribution EMA per action type

## Running

```bash
# Development (hot-reload)
npm run dev -w packages/agent

# Production (after build)
npm run start -w packages/agent
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `KITE_RPC_URL` | Yes | Kite chain JSON-RPC endpoint |
| `KITE_CHAIN_ID` | Yes | Kite chain ID |
| `AGENT_PRIVATE_KEY` | Yes | AA smart account owner private key |
| `KITE_PAYMASTER_URL` | Yes | Kite gasless paymaster endpoint |
| `KITE_AGENT_PASSPORT_ADDRESS` | Yes | Kite Agent Passport registry |
| `KITE_ATTESTATION_REGISTRY` | Yes | Kite Attestation Registry contract |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `USDC_CONTRACT_ADDRESS` | Yes | USDC ERC-20 address on Kite |
| `AGENT_VAULT_ADDRESS` | Yes | AgentVault contract address |
| `MARKET_FACTORY_ADDRESS` | Yes | MarketFactory contract address |
| `MARKET_RESOLVER_ADDRESS` | Yes | MarketResolver contract address |
| `CONDITIONAL_PAYMENT_ADDRESS` | Yes | ConditionalPayment contract address |
| `SUBSCRIPTION_MANAGER_ADDRESS` | Yes | SubscriptionManager contract address |
| `TREASURY_ADDRESS` | Yes | Performance fee recipient |
| `AGENT_DRY_RUN` | No | `true` = log only, no real txs (default: `false`) |
| `AGENT_LOOP_INTERVAL_MS` | No | Loop interval in ms (default: `60000`) |
| `LLM_MODEL` | No | Claude model ID (default: `claude-sonnet-4-6`) |
| `LAYERZERO_BRIDGE_ENABLED` | No | `true` = enable cross-chain USDC bridging |
