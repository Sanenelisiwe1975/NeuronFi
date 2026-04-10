# NeuronFi — Autonomous DeFi Agent

An autonomous on-chain agent that continuously observes DeFi markets, reasons about opportunities using Claude (Anthropic), decides risk-adjusted positions, executes trades via the **Kite AI AA SDK**, attests decisions through the **Kite Attestation Registry**, and learns from every cycle — all without human intervention.

Built for the **Kite AI Hackathon** — Track: **Agentic Trading & Portfolio Management**.

---

## How It Works

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Agent Loop                                 │
│                                                                      │
│  Observe → Reason → Decide → Execute → Resolve → Learn               │
│    │          │        │        │          │         │               │
│  Prices    Claude    EV +     Kite AA   Kite        Postgres          │
│  Gas       Sonnet    Risk     SDK +     Attestation  Redis            │
│  Vault     Plan      Gates    Contracts  Registry    write-ahead      │
│  Markets           Payment  escrow     on-chain     buffer           │
└──────────────────────────────────────────────────────────────────────┘
```

1. **Observe** — fetches ETH/USDC prices (Chainlink per-feed with CoinGecko fallback), gas snapshot, Uniswap V3 liquidity, and active prediction market opportunities from `MarketFactory`. Auto-tops-up agent USDC from `AgentVault` if balance drops below $50. Tracks open positions to prevent double-entry.
2. **Reason** — sends the full market state to Claude Sonnet 4.6 via LangChain.js; receives a ranked list of `AgentAction` objects (OpenClaw planning engine). Supports `ENTER_MARKET`, `EXIT_MARKET`, `REBALANCE`, `CREATE_MARKET`, and `HOLD` actions.
3. **Decide** — applies global risk gates (USDC depeg halt, gas congestion halt) and per-action filters (min EV > 2%, max position size 5%, risk score ≤ 70, no double-entry on open positions).
4. **Execute** — routes approved actions via the **Kite AA SDK** (gasless USDC transfers) and direct Solidity calls (`enterPosition`, `redeem`, `createMarket`). After each market entry, locks a 1% performance fee in `ConditionalPayment` — released to treasury only if the prediction is correct.
5. **Resolve** — after a market closes, the agent fetches the Chainlink price, calls `MarketResolver.aiResolve()` with a full rationale, then writes an **attestation to the Kite Attestation Registry** — making every AI decision permanently verifiable on-chain. Finalises after the 24-hour dispute window.
6. **Learn** — persists cycle outcomes to PostgreSQL and Redis; updates Bayesian priors (Beta distribution EMA) per action type. Failed Postgres writes are buffered in Redis and flushed on reconnect.

---

## Monorepo Structure

```
NeuronFi/
├── apps/
│   └── web/                  # Next.js 14 real-time dashboard (Polymarket-style UI)
├── packages/
│   ├── agent/                # Autonomous loop (observe→learn)
│   ├── contracts/            # Solidity: AgentVault, PredictionMarket, MarketFactory,
│   │                         #   MarketResolver, ConditionalPayment, SubscriptionManager
│   ├── data/                 # Oracle, Uniswap V3 liquidity, gas feeds
│   ├── planner/              # LLM reasoning engine (LangChain.js + Claude Sonnet 4.6)
│   ├── kite/                 # Kite AA SDK wallet wrapper + Agent Passport + LayerZero bridge
│   ├── ui/                   # Shared React components
│   ├── eslint-config/        # Shared ESLint presets
│   └── typescript-config/    # Shared tsconfig bases
├── infra/
│   ├── docker-compose.yml    # Postgres 16 + Redis 7
│   └── init.sql              # Database schema
├── vercel.json               # Vercel monorepo deployment config
└── apps/web/.env.example     # All required dashboard environment variables
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A Kite chain RPC endpoint (from the [Kite Chain Network Getting Started](https://docs.kite.ai) guide)
- Anthropic API key
- [Neon](https://neon.tech) account (free tier — cloud Postgres)
- [Upstash](https://upstash.com) account (free tier — cloud Redis)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
# Agent
cp packages/agent/.env.example packages/agent/.env
# Fill in: KITE_RPC_URL, KITE_CHAIN_ID, AGENT_PRIVATE_KEY, ANTHROPIC_API_KEY, contract addresses

# Dashboard
cp apps/web/.env.example apps/web/.env.local
# Fill in: KITE_RPC_URL, contract addresses
```

### 4. Set up cloud infrastructure

Create a free [Neon](https://neon.tech) Postgres database and a free [Upstash](https://upstash.com) Redis instance. Copy their connection strings into `packages/agent/.env` (`DATABASE_URL`, `REDIS_URL`) and `apps/web/.env.local`.

Apply the database schema:
```bash
# Paste contents of infra/init.sql into the Neon SQL editor
```

> No Docker needed — Neon and Upstash provide managed cloud Postgres and Redis.

### 5. Build all packages

```bash
npm run build
```

### 6. Deploy contracts (Kite chain)

```bash
cd packages/contracts

# Deploy core contracts to Kite
npx hardhat run scripts/deploy.ts --network kite   # AgentVault + MarketFactory

# One-time setup scripts (run after deploy)
node scripts/set-vault-agent.mjs       # authorise AA wallet on AgentVault
node scripts/deploy-resolver.mjs       # MarketResolver + wires Chainlink feed + Kite Attestation Registry
node scripts/deploy-conditional.mjs    # ConditionalPayment + IMarket-compatible market
node scripts/deploy-subscription.mjs   # SubscriptionManager (4 USDC tiers)
node scripts/set-permissionless.mjs    # allow agent wallet to create markets
node scripts/seed-markets.mjs          # deploy 10 diverse starter markets (Crypto/Macro/DeFi/Politics/Science)
```

Copy the printed addresses into `packages/agent/.env` and `apps/web/.env.local`.

### 7. Register the Agent Passport

The agent registers a Kite Agent Passport on first startup — giving it an on-chain identity traceable in the dashboard and explorer. No manual step needed; the agent handles this automatically before the first loop cycle.

### 8. Run the agent

```bash
cd packages/agent
npm run dev        # development (tsx watch, no build needed)
# or
npm run build && npm run start   # production
```

### 9. Open the dashboard

```bash
cd apps/web
npm run dev
# → http://localhost:3000/dashboard
```

### 10. Deploy dashboard to Vercel

Connect the GitHub repo to [Vercel](https://vercel.com). Set:
- **Root Directory**: *(blank — repo root)*
- **Build Command**: `npx turbo run build --filter=web`
- **Output Directory**: `apps/web/.next`

Add all env vars from `apps/web/.env.local` in the Vercel dashboard → Settings → Environment Variables.

**Live demo**: [neuronfi.vercel.app](https://neuronfi.vercel.app)

---

## Environment Variables

### Agent (`packages/agent/.env`)

| Variable | Required | Description |
|---|---|---|
| `KITE_RPC_URL` | Yes | Kite chain JSON-RPC endpoint |
| `KITE_CHAIN_ID` | Yes | Kite chain ID |
| `AGENT_PRIVATE_KEY` | Yes | Agent wallet private key (AA smart account owner) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `USDC_CONTRACT_ADDRESS` | Yes | USDC ERC-20 address on Kite |
| `KITE_PAYMASTER_URL` | Yes | Kite gasless paymaster endpoint |
| `KITE_ATTESTATION_REGISTRY` | Yes | Kite Attestation Registry contract address |
| `KITE_AGENT_PASSPORT_ADDRESS` | Yes | Kite Agent Passport registry address |
| `AGENT_VAULT_ADDRESS` | Yes | Deployed AgentVault address |
| `MARKET_FACTORY_ADDRESS` | Yes | Deployed MarketFactory address |
| `MARKET_RESOLVER_ADDRESS` | Yes | Deployed MarketResolver address |
| `CONDITIONAL_PAYMENT_ADDRESS` | Yes | Deployed ConditionalPayment address |
| `SUBSCRIPTION_MANAGER_ADDRESS` | Yes | Deployed SubscriptionManager address |
| `TREASURY_ADDRESS` | Yes | Performance fee recipient address |
| `AGENT_DRY_RUN` | No | `true` = log only, no real txs (default: `false`) |
| `LLM_MODEL` | No | Claude model ID (default: `claude-sonnet-4-6`) |
| `LLM_TEMPERATURE` | No | LLM temperature 0–1 (default: `0.2`) |
| `LAYERZERO_BRIDGE_ENABLED` | No | `true` = enable cross-chain USDC bridging via LayerZero |

### Dashboard (`apps/web/.env.local`)

| Variable | Description |
|---|---|
| `KITE_RPC_URL` | Kite chain JSON-RPC endpoint |
| `REDIS_URL` | Redis — reads live agent state |
| `DATABASE_URL` | PostgreSQL — reads trade history |
| `MARKET_FACTORY_ADDRESS` | Fetches active markets from chain |
| `AGENT_VAULT_ADDRESS` | Reads vault balances |
| `USDC_CONTRACT_ADDRESS` | Token balance queries |
| `MARKET_RESOLVER_ADDRESS` | Resolution event queries |
| `CONDITIONAL_PAYMENT_ADDRESS` | Escrow status queries |
| `SUBSCRIPTION_MANAGER_ADDRESS` | Subscription tier queries |
| `KITE_ATTESTATION_REGISTRY` | Attestation lookup for resolved markets |
| `TREASURY_ADDRESS` | Treasury address |

### Contracts scripts (`packages/contracts/.env`)

| Variable | Description |
|---|---|
| `KITE_RPC_URL` | Kite chain JSON-RPC endpoint |
| `KITE_CHAIN_ID` | Kite chain ID |
| `DEPLOYER_PRIVATE_KEY` | Deployer EOA private key |
| `USDC_CONTRACT_ADDRESS` | USDC ERC-20 address on Kite |
| `KITE_ATTESTATION_REGISTRY` | Kite Attestation Registry address |
| `MARKET_FACTORY_ADDRESS` | MarketFactory address |
| `AGENT_VAULT_ADDRESS` | AgentVault address |
| `MARKET_RESOLVER_ADDRESS` | MarketResolver address |
| `CONDITIONAL_PAYMENT_ADDRESS` | ConditionalPayment address |
| `SUBSCRIPTION_MANAGER_ADDRESS` | SubscriptionManager address |
| `TREASURY_ADDRESS` | Treasury / deployer address |

---

## Smart Contracts (Kite Chain)

| Contract | Purpose |
|---|---|
| `AgentVault` | Holds USDC; enforces $1,000/day agent withdrawal limit |
| `MarketFactory` | Creates and registers PredictionMarket instances; permissionless mode enabled |
| `MarketResolver` | Multi-path resolution: AI oracle + Chainlink; writes outcome attestation to Kite Attestation Registry |
| `ConditionalPayment` | Outcome-linked USDC escrow — performance fee released only on correct prediction |
| `SubscriptionManager` | On-chain subscription tiers paid in USDC (FREE/$0, BASIC/$29, PRO/$99, INSTITUTIONAL/$499) |
| Agent wallet (AA) | Gasless smart account managed by Kite AA SDK; identified by Agent Passport |

> Contract addresses are populated after deployment. Individual `PredictionMarket` contracts are deployed dynamically by the agent via `MarketFactory.createMarket()`. Query `factory.getActiveMarkets()` for the current list.

---

## Kite AI Integration

### Account Abstraction (AA SDK)
The agent wallet is a **Kite smart account** created via the Kite AA SDK. This replaces a standard EOA and provides:
- **Gasless execution** — the Kite paymaster sponsors all transaction fees; the agent never needs native gas tokens
- **Programmable constraints** — spending limits and action whitelists enforced at the account level
- **Batch transactions** — multiple actions (USDC approve + market enter + ConditionalPayment lock) submitted in a single UserOperation

### Agent Passport
On first startup, the agent registers a **Kite Agent Passport** with:
- Name: `NeuronFi Trading Agent`
- Capabilities: `ENTER_MARKET`, `EXIT_MARKET`, `REBALANCE`, `CREATE_MARKET`
- Owner: deployer address

Every on-chain action is associated with the passport ID, making the agent's full trade history queryable by passport in the Kite explorer.

### Attestation Registry
Every market resolution writes a tamper-proof attestation to the **Kite Attestation Registry**:
```
attestation = keccak256(marketId + aiRationale + outcome + timestamp)
```
This means:
- Every AI decision is permanently auditable on-chain
- Disputed resolutions can be verified against the attestation
- The dashboard displays attestation hashes with direct Kite explorer links

### Cross-Chain (LayerZero)
The `@repo/kite` package wraps Kite's LayerZero integration for cross-chain USDC bridging. Enable with `LAYERZERO_BRIDGE_ENABLED=true`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Wallet | Kite AA SDK (smart account, gasless via paymaster) |
| Agent Identity | Kite Agent Passport |
| Attestation | Kite Attestation Registry |
| Cross-chain bridge | LayerZero USDC OFT (via Kite integration) |
| AI Planning | LangChain.js + Claude Sonnet 4.6 (`@langchain/anthropic`) |
| Price Feeds | Chainlink AggregatorV3 (per-feed) + CoinGecko REST API (per-feed fallback) |
| DEX Data | Uniswap V3 pool queries via ethers.js |
| Smart Contracts | Solidity 0.8 + Hardhat (deployed to Kite chain) |
| Dashboard | Next.js 14 App Router + Recharts + wallet connect |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless cloud) |
| Cache / Lock | Redis via [Upstash](https://upstash.com) (distributed lock + write-ahead buffer) |
| Monorepo | Turborepo + npm workspaces |
| Deployment | Vercel (dashboard) + Neon + Upstash (cloud infra) |
| Language | TypeScript ESM throughout |

---

## Dashboard Features

The dashboard is a Polymarket-style real-time UI visible at `/dashboard`:

- **Market cards** — probability hero number, YES/NO price display, days-left countdown, agent position badge, sparkline trend
- **Search + sort** — filter by keyword, sort by volume / closing soon / probability / trending
- **Category pills** — All, Crypto, Macro, Politics, Science, Sports, Other (auto-inferred from question text)
- **KPI strip** — live markets count, total volume, resolutions, agent win rate, P&L
- **Wallet connect** — connects to Kite chain; shows connected address and active subscription plan
- **Subscribe** — buy a BASIC/PRO/INSTITUTIONAL subscription directly from the UI (USDC approval + on-chain tx)
- **Portfolio tab** — portfolio value chart, USDC balances, trade history with Kite explorer links
- **Agent tab** — live reasoning, cycle time, gas (always $0 — gasless), ConditionalPayment escrows, last cycle actions, Agent Passport ID
- **Resolution feed** — AI rationale + Kite Attestation Registry hash per resolved market

---

## Risk Controls

- **USDC depeg halt** — all execution suspended if USDC price deviates >0.5% from $1.00
- **Gas congestion halt** — all execution suspended if base fee exceeds threshold (gasless via paymaster — agent monitors network congestion, not gas cost)
- **EV threshold** — `ENTER_MARKET` rejected if net expected value <2%
- **Risk score filter** — rejects positions with probability uncertainty + payout ratio risk >70/100
- **Position cap** — individual positions clamped to 5% of total portfolio
- **Double-entry guard** — agent checks open positions each cycle; will not re-enter a market it already holds
- **Daily vault limit** — `AgentVault` contract enforces $1,000/day withdrawal ceiling on-chain
- **Slippage guard** — market entry accepts minimum 95% of quoted token output
- **Distributed lock** — Redis `SET NX` prevents two agent instances running simultaneously
- **Dry-run mode** — set `AGENT_DRY_RUN=true` to log actions without executing transactions

---

## Development Commands

```bash
npm run build          # Build all packages (respects dependency order)
npm run dev            # Start all packages in watch mode
npm run lint           # Lint all packages
npm run check-types    # Type-check all packages
```

Run a single package with `--filter`:

```bash
npm run build -- --filter=@repo/agent
npm run dev   -- --filter=web
```

---

## License

Apache 2.0 — see [LICENSE](LICENSE).
