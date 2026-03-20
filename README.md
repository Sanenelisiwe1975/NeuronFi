# Autonomous DeFi Agent

An autonomous on-chain agent that continuously observes DeFi markets, reasons about opportunities using Claude (Anthropic), decides risk-adjusted positions, executes trades via the Tether WDK, and learns from every cycle — all without human intervention.

Built for the **Tether Hackathon Galáctica: WDK Edition 1** — Track: **Autonomous DeFi Agent** + **Agent Wallets**.

---

## How It Works

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Agent Loop                                 │
│                                                                      │
│  Observe → Reason → Decide → Execute → Resolve → Learn               │
│    │          │        │        │          │         │               │
│  Prices    Claude    EV +     WDK +     AI Oracle  Postgres          │
│  Gas       Sonnet    Risk     Contracts  on-chain   Redis            │
│  Vault     Plan      Gates    + Cond.    rationale  write-ahead      │
│  Markets           Payment  escrow                  buffer           │
└──────────────────────────────────────────────────────────────────────┘
```

1. **Observe** — fetches ETH/USDT/XAUT prices (Chainlink per-feed with CoinGecko fallback), gas snapshot, Uniswap V3 liquidity, and active prediction market opportunities from `MarketFactory`. Auto-tops-up agent USDT from `AgentVault` if balance drops below $50. Tracks open positions to prevent double-entry.
2. **Reason** — sends the full market state to Claude Sonnet 4.6 via LangChain.js; receives a ranked list of `AgentAction` objects (OpenClaw planning engine). Supports `ENTER_MARKET`, `EXIT_MARKET`, `REBALANCE`, `CREATE_MARKET`, and `HOLD` actions.
3. **Decide** — applies global risk gates (USDT depeg halt, gas congestion halt) and per-action filters (min EV > 2%, max position size 5%, risk score ≤ 70, no double-entry on open positions).
4. **Execute** — routes approved actions via the Tether WDK (`transferUSDT`, `transferXAUT`) and direct Solidity calls (`enterPosition`, `redeem`, `createMarket`). After each market entry, locks a 1% performance fee in `ConditionalPayment` — released to treasury only if the prediction is correct.
5. **Resolve** — after a market closes, the agent fetches the Chainlink price, compares it to the question threshold, calls `MarketResolver.aiResolve()` with a full rationale stored permanently on-chain, then finalises after the 24-hour dispute window.
6. **Learn** — persists cycle outcomes to PostgreSQL and Redis; updates Bayesian priors (Beta distribution EMA) per action type. Failed Postgres writes are buffered in Redis and flushed on reconnect.

---

## Monorepo Structure

```
autonomous-defi-agent/
├── apps/
│   └── web/                  # Next.js 14 real-time dashboard (Polymarket-style UI)
├── packages/
│   ├── agent/                # Autonomous loop (observe→learn)
│   ├── contracts/            # Solidity: AgentVault, PredictionMarket, MarketFactory,
│   │                         #   MarketResolver, ConditionalPayment, SubscriptionManager
│   ├── data/                 # Oracle, Uniswap V3 liquidity, gas feeds
│   ├── planner/              # LLM reasoning engine (LangChain.js + Claude Sonnet 4.6)
│   ├── wdk/                  # Tether WDK wallet wrapper + USDT0 LayerZero bridge
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
- Docker (for Postgres + Redis)
- An Ethereum RPC endpoint (Alchemy or Infura — Sepolia)
- Anthropic API key

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
# Agent
cp packages/agent/.env.example packages/agent/.env
# Fill in: RPC_URL, AGENT_SEED_PHRASE, ANTHROPIC_API_KEY, contract addresses

# Dashboard
cp apps/web/.env.example apps/web/.env.local
# Fill in: RPC_URL, contract addresses
```

### 4. Start infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 5. Build all packages

```bash
npm run build
```

### 6. Deploy contracts (Sepolia)

```bash
cd packages/contracts

# Deploy core contracts (requires Hardhat — or use already-deployed addresses below)
npx hardhat run scripts/deploy.ts --network sepolia   # AgentVault + MarketFactory

# One-time setup scripts (run after deploy)
node scripts/set-vault-agent.mjs       # authorise WDK wallet on AgentVault
node scripts/deploy-resolver.mjs       # MarketResolver + wires Chainlink feed
node scripts/deploy-conditional.mjs    # ConditionalPayment + IMarket-compatible market
node scripts/deploy-subscription.mjs   # SubscriptionManager (4 USDT tiers)
node scripts/set-permissionless.mjs    # allow agent wallet to create markets
node scripts/seed-markets.mjs          # deploy 10 diverse starter markets (Crypto/Macro/DeFi/Politics/Science)
```

Copy the printed addresses into `packages/agent/.env` and `apps/web/.env.local`.

> **Already deployed on Sepolia** — see the contracts table below. You can skip the Hardhat deploy and use those addresses directly.

### 7. Run the agent

```bash
cd packages/agent
node --env-file=.env dist/index.js
```

### 8. Open the dashboard

```bash
cd apps/web
npm run dev
# → http://localhost:3000/dashboard
```

### 9. Deploy dashboard to Vercel (optional)

```bash
npx vercel --prod
```

Set all env vars from `apps/web/.env.example` in the Vercel dashboard before deploying.

---

## Environment Variables

### Agent (`packages/agent/.env`)

| Variable | Required | Description |
|---|---|---|
| `RPC_URL` | Yes | Ethereum JSON-RPC endpoint |
| `AGENT_SEED_PHRASE` | Yes | BIP-39 mnemonic — WDK wallet |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `USDT_CONTRACT_ADDRESS` | Yes | USD₮ ERC-20 address |
| `XAUT_CONTRACT_ADDRESS` | Yes | XAU₮ ERC-20 address |
| `AGENT_VAULT_ADDRESS` | Yes | Deployed AgentVault address |
| `MARKET_FACTORY_ADDRESS` | Yes | Deployed MarketFactory address |
| `MARKET_RESOLVER_ADDRESS` | Yes | Deployed MarketResolver address |
| `CONDITIONAL_PAYMENT_ADDRESS` | Yes | Deployed ConditionalPayment address |
| `SUBSCRIPTION_MANAGER_ADDRESS` | Yes | Deployed SubscriptionManager address |
| `TREASURY_ADDRESS` | Yes | Performance fee recipient address |
| `AGENT_DRY_RUN` | No | `true` = log only, no real txs (default: `false`) |
| `LLM_MODEL` | No | Claude model ID (default: `claude-sonnet-4-6`) |
| `LLM_TEMPERATURE` | No | LLM temperature 0–1 (default: `0.2`) |
| `USDT0_BRIDGE_ENABLED` | No | `true` = enable LayerZero USDT0 cross-chain bridging |

### Dashboard (`apps/web/.env.local`)

| Variable | Description |
|---|---|
| `RPC_URL` | Ethereum JSON-RPC endpoint |
| `REDIS_URL` | Redis — reads live agent state |
| `DATABASE_URL` | PostgreSQL — reads trade history |
| `MARKET_FACTORY_ADDRESS` | Fetches active markets from chain |
| `AGENT_VAULT_ADDRESS` | Reads vault balances |
| `USDT_CONTRACT_ADDRESS` | Token balance queries |
| `MARKET_RESOLVER_ADDRESS` | Resolution event queries |
| `CONDITIONAL_PAYMENT_ADDRESS` | Escrow status queries |
| `SUBSCRIPTION_MANAGER_ADDRESS` | Subscription tier queries |
| `TREASURY_ADDRESS` | Treasury address |

### Contracts scripts (`packages/contracts/.env`)

| Variable | Description |
|---|---|
| `RPC_URL` | Ethereum JSON-RPC endpoint |
| `DEPLOYER_PRIVATE_KEY` | Deployer EOA private key |
| `USDT_CONTRACT_ADDRESS` | USD₮ ERC-20 address |
| `MARKET_FACTORY_ADDRESS` | MarketFactory address |
| `AGENT_VAULT_ADDRESS` | AgentVault address |
| `MARKET_RESOLVER_ADDRESS` | MarketResolver address |
| `CONDITIONAL_PAYMENT_ADDRESS` | ConditionalPayment address |
| `SUBSCRIPTION_MANAGER_ADDRESS` | SubscriptionManager address |
| `TREASURY_ADDRESS` | Treasury / deployer address |

---

## Smart Contracts (Sepolia Testnet)

| Contract | Address | Purpose |
|---|---|---|
| `AgentVault` | `0x824a901E3609C5d8D6F874b31Fe736364190119D` | Holds USD₮; enforces $1,000/day agent withdrawal limit |
| `MarketFactory` | `0x3947C99650879990cB2c0C0cbB22FE71e5CF11f9` | Creates and registers PredictionMarket instances; permissionless mode enabled |
| `MarketResolver` | `0x8e50025719b9f605C11Eb43c1683C9536eAdc8B0` | Multi-path resolution: AI oracle, Chainlink, UMA, multisig |
| `ConditionalPayment` | `0xC53a881F97fa5AFFf966A150dD6A7151fACcb7f3` | Outcome-linked USDT escrow — fee released only on correct prediction |
| `SubscriptionManager` | `0xdD8Ac6Aff3D034e9BEC91482140F3C3792D5148B` | On-chain subscription tiers paid in USDT (FREE/$0, BASIC/$29, PRO/$99, INSTITUTIONAL/$499) |
| Agent wallet (WDK) | `0xd4f54bB98BA78a813c82C78934191cBba3C33900` | Autonomous trading wallet managed by Tether WDK |
| Deployer / Treasury | `0xF60ab179Fe7ECdc1320b375b7185302ee23c4888` | Contract owner and performance fee recipient |

> Individual `PredictionMarket` contracts are deployed dynamically by the agent via `MarketFactory.createMarket()`. Query `factory.getActiveMarkets()` for the current list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Wallet | Tether WDK (`@tetherto/wdk-wallet-evm`) |
| Cross-chain bridge | USDT0 LayerZero OFT (`@tetherto/wdk-protocol-bridge-usdt0-evm`) |
| AI Planning | LangChain.js + Claude Sonnet 4.6 (`@langchain/anthropic`) |
| Price Feeds | Chainlink AggregatorV3 (per-feed) + CoinGecko REST API (per-feed fallback) |
| DEX Data | Uniswap V3 pool queries via ethers.js |
| Smart Contracts | Solidity 0.8 + Hardhat |
| Dashboard | Next.js 14 App Router + Recharts + MetaMask wallet connect |
| Database | PostgreSQL 16 |
| Cache / Lock | Redis 7 (distributed lock + write-ahead buffer) |
| Monorepo | Turborepo + npm workspaces |
| Deployment | Vercel (dashboard) + Docker Compose (infra) |
| Language | TypeScript ESM throughout |

---

## Dashboard Features

The dashboard is a Polymarket-style real-time UI visible at `/dashboard`:

- **Market cards** — probability hero number, YES/NO price display, days-left countdown, agent position badge, sparkline trend
- **Search + sort** — filter by keyword, sort by volume / closing soon / probability / trending
- **Category pills** — All, Crypto, Macro, Politics, Science, Sports, Other (auto-inferred from question text)
- **KPI strip** — live markets count, total volume, resolutions, agent win rate, P&L
- **Wallet connect** — MetaMask integration; shows connected address and active subscription plan
- **Subscribe** — buy a BASIC/PRO/INSTITUTIONAL subscription directly from the UI (USDT approval + on-chain tx)
- **Portfolio tab** — portfolio value chart, USDT/XAUT balances, trade history with Etherscan links
- **Agent tab** — live reasoning, cycle time, gas price, ConditionalPayment escrows, last cycle actions
- **Resolution feed** — AI rationale displayed per resolved market

---

## Risk Controls

- **USDT depeg halt** — all execution suspended if USDT price deviates >0.5% from $1.00
- **Gas congestion halt** — all execution suspended if base fee >100 gwei
- **EV threshold** — `ENTER_MARKET` rejected if net expected value <2% (after gas costs)
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
