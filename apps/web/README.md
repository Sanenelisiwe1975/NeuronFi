# apps/web — NeuronFi Dashboard

Real-time Next.js dashboard for the NeuronFi autonomous DeFi agent running on Kite chain.

## Pages

| Route | Description |
|---|---|
| `/` | Home — agent status, live stats, how-it-works, tech stack |
| `/dashboard` | Full dashboard — markets, portfolio, agent reasoning, resolutions, subscriptions |

## API Routes

| Route | Description |
|---|---|
| `GET /api/agent` | Latest agent state from Redis (iteration, portfolio, reasoning, executions) |
| `GET /api/markets` | Active prediction markets from Kite chain via MarketFactory |
| `GET /api/portfolio` | Last 50 portfolio snapshots from PostgreSQL |
| `GET /api/trades` | Last 20 trade executions from PostgreSQL |
| `GET /api/vault` | AgentVault + agent USDC balances from Kite chain |
| `GET /api/resolutions` | Market resolution statuses + AI rationale from Kite chain |
| `GET /api/conditional` | ConditionalPayment escrow statuses from Kite chain |
| `GET /api/subscription` | SubscriptionManager plans + subscriber data from Kite chain |
| `GET /api/subscription/user` | Active subscription plan for a given wallet address |

## Environment Variables

See [apps/web/.env.example](../../apps/web/.env.example) for the full list. Key variables:

| Variable | Description |
|---|---|
| `KITE_RPC_URL` | Kite chain JSON-RPC endpoint |
| `KITE_ATTESTATION_REGISTRY` | Attestation Registry contract — used in resolution feed |
| `NEXT_PUBLIC_KITE_EXPLORER_URL` | Kite block explorer base URL for tx/address links |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC contract address (client-side subscription flow) |
| `REDIS_URL` | Reads live agent state (`agent:latest` key) |
| `DATABASE_URL` | Reads trade history and portfolio snapshots |

## Running

```bash
# Development
npm run dev -w apps/web
# → http://localhost:3000

# Production build
npm run build -w apps/web
```

## Deployment

Connect the repo to [Vercel](https://vercel.com):
- **Root Directory**: *(blank — repo root)*
- **Build Command**: `npx turbo run build --filter=web`
- **Output Directory**: `apps/web/.next`

Add all variables from `.env.example` in Vercel → Settings → Environment Variables.
