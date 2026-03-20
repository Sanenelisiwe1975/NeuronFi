# Autonomous DeFi Agent — Pitch Deck

---

## Slide 1 — Title

**Autonomous DeFi Agent**
*The first AI agent that trades prediction markets, manages its own wallet, and gets smarter with every resolved bet.*

Built on Tether WDK · Powered by Claude Sonnet 4.6 · Live on Sepolia

---

## Slide 2 — The Problem

**Prediction markets are powerful. But they require you to be everywhere at once.**

- Polymarket processes $500M+ monthly volume — yet 95% of opportunities are missed by retail users who can't monitor 24/7
- Institutional players use bots. Retail users use intuition. The gap is widening.
- Existing "trading bots" are rule-based — they can't *reason* about novel market questions like "Will the Fed cut rates twice in 2026?"
- No system currently bridges AI reasoning → autonomous wallet management → on-chain execution in a single loop

**The insight:** LLMs can reason about probabilistic outcomes. They just haven't had wallets before.

---

## Slide 3 — The Solution

**An autonomous AI agent that observes, reasons, trades, and learns — continuously, without human input.**

```
Observe → Reason → Decide → Execute → Learn
  │           │        │        │         │
Markets    Claude    Risk    Tether    Bayesian
Prices     Sonnet   Gates    WDK       Priors
Gas        4.6      Filters  Vault     Updated
```

- The agent wakes every 60 seconds
- Reads live market prices, gas, vault balance, open positions
- Asks Claude: *"Given current market conditions, what's the highest EV action?"*
- Executes approved trades on-chain via Tether WDK
- After resolution: updates its own beliefs using Beta distribution Bayesian learning

**It is a trader. It has a wallet. It has a P&L. It gets better over time.**

---

## Slide 4 — How It's Built

**Full-stack autonomous finance — nothing simulated.**

| Layer | Technology |
|---|---|
| Agent wallet | Tether WDK (`@tetherto/wdk-wallet-evm`) |
| AI reasoning | Claude Sonnet 4.6 via LangChain.js |
| Cross-chain | USDT0 LayerZero OFT bridge |
| Price feeds | Chainlink + CoinGecko fallback |
| Smart contracts | Solidity 0.8 — AgentVault, PredictionMarket, MarketResolver, ConditionalPayment, SubscriptionManager |
| Dashboard | Next.js 16, real-time, Polymarket-style UI |
| Infrastructure | PostgreSQL + Redis, Docker Compose |

**Every component is production code. There is no mock.**

---

## Slide 5 — The Architecture

**Three layers of autonomous operation:**

**Layer 1 — Capital management**
AgentVault holds USDT with a hard $1,000/day withdrawal ceiling enforced *on-chain*. The agent auto-tops-up its wallet when balance drops below $50.

**Layer 2 — Intelligent execution**
Claude reasons about market questions and produces structured `AgentAction` objects. Risk gates filter every action before execution:
- Min 2% expected value
- Max 5% position size
- USDT depeg halt
- Gas congestion halt
- 95% slippage protection

**Layer 3 — Outcome-linked incentives**
Every correct prediction releases a 1% performance fee from `ConditionalPayment` escrow to treasury. Wrong predictions: fee stays locked. The agent's revenue is *structurally aligned with accuracy*.

---

## Slide 6 — What Makes This Different

| Feature | Polymarket | Kalshi | Us |
|---|---|---|---|
| Human traders | ✓ | ✓ | Agent trades autonomously |
| AI reasoning trail | ✗ | ✗ | Every trade has on-chain rationale |
| Learns from outcomes | ✗ | ✗ | Bayesian prior updates per resolution |
| Cross-chain liquidity | ✗ | ✗ | USDT0 LayerZero bridge |
| Conditional payments | ✗ | ✗ | Native outcome-linked escrow |
| Subscription model | ✗ | ✗ | On-chain BASIC/PRO/INSTITUTIONAL tiers |
| Regulatory status | Operating | CFTC licensed | Testnet — pre-legal review |

**We are not competing with Polymarket. We are building the autonomous trading desk that participates in all of them.**

---

## Slide 7 — The Business Model

**Two revenue streams, both on-chain.**

**1. Subscription access** — paid in USDT, enforced by smart contract

| Tier | Price | What you get |
|---|---|---|
| FREE | $0/month | Dashboard view |
| BASIC | $29/month | Real-time agent signals |
| PRO | $99/month | API access + reasoning logs |
| INSTITUTIONAL | $499/month | Custom vault allocations + white-label |

1,000 PRO subscribers = **$1.2M ARR**
1,000 INSTITUTIONAL subscribers = **$6M ARR**

**2. Performance fees** — 1% of winning positions, released by `ConditionalPayment` only when predictions are correct. The agent only earns when it's right.

**Revenue is decoupled from AUM. Accuracy is the product.**

---

## Slide 8 — Traction

**Honest status: 3 weeks old, Sepolia testnet.**

What exists today:
- ✅ Full autonomous agent loop running (observe → reason → decide → execute → learn)
- ✅ 6 smart contracts deployed and verified on Sepolia
- ✅ AgentVault holding $1,983 USDT with live withdrawal limits
- ✅ 2 active prediction markets with YES/NO token AMMs
- ✅ Subscription contract deployed with 4 on-chain tiers
- ✅ Production dashboard with wallet connect and subscribe flow
- ✅ Bayesian learning loop updating priors per resolved market
- ✅ USDT0 LayerZero bridge integration (mainnet-ready, testnet-gated)

What we don't have yet:
- ❌ Mainnet deployment
- ❌ Real user P&L data
- ❌ External liquidity

**The hardest part — the infrastructure — is done.**

---

## Slide 9 — Market Opportunity

**Prediction markets are having a moment.**

- Polymarket: $500M+ monthly volume (2024 US election drove record activity)
- Kalshi received CFTC approval after years of litigation — regulatory clarity is improving
- Global prediction market TAM estimated at $50B+ by 2028
- Institutional interest in structured outcome products growing post-election cycle

**Our addressable market isn't just prediction markets.**
Any institution wanting *autonomous AI exposure to outcome markets* without managing it in-house is a potential INSTITUTIONAL subscriber.

Hedge funds. Family offices. DAOs. DeFi protocols. Market makers.

---

## Slide 10 — Risk Controls

**We take autonomous capital management seriously.**

- **$1,000/day vault limit** — hard ceiling enforced in Solidity, not code
- **USDT depeg halt** — all execution suspended if USDT deviates >0.5% from $1.00
- **Gas congestion halt** — suspended if base fee >100 gwei
- **Slippage guard** — rejects trades where price impact exceeds 5%
- **Position cap** — max 5% of portfolio per market
- **EV gate** — minimum 2% expected value after gas costs
- **Dry-run mode** — full simulation without real transactions
- **Every trade is auditable** — reasoning stored on-chain per resolution

**The agent cannot lose more than $1,000/day by design.**

---

## Slide 11 — Roadmap

**Q1 2026 (now)**
- Hackathon submission ✅
- Sepolia testnet live ✅
- Full agent loop + dashboard ✅

**Q2 2026**
- Mainnet deployment (Ethereum + Arbitrum)
- Legal opinion on autonomous agent trading classification
- First 100 paid subscribers
- Agent performance data: 90 days, real P&L
- Integration with Polymarket as external liquidity source

**Q3 2026**
- INSTITUTIONAL tier launch — API + white-label
- Multi-agent architecture (specialised agents per market category)
- Proprietary data feeds (news sentiment, social signals, on-chain flow)
- Backtesting dashboard for subscribers

**Q4 2026**
- Series A raise
- Expand to Kalshi, Manifold, other prediction market venues
- Agent marketplace — third-party agents can deploy into the vault framework

---

## Slide 12 — The Ask

**We are raising a pre-seed round to get from testnet to mainnet.**

**Use of funds:**
- Legal opinion + regulatory strategy — 20%
- Mainnet deployment + security audit — 25%
- Data feeds (news APIs, proprietary signals) — 20%
- Team expansion (one ML engineer, one BD) — 35%

**What we need from the right investor beyond capital:**
- Introductions to prediction market operators (Polymarket, Kalshi)
- Introductions to institutional crypto funds as potential INSTITUTIONAL subscribers
- Legal network for crypto financial services regulation

---

## Slide 13 — Why Now

**Three forces converging:**

1. **LLMs can reason about probabilistic outcomes** — this wasn't true 3 years ago. Claude Sonnet 4.6 can evaluate a market question like a junior analyst.

2. **Tether WDK makes autonomous wallets viable** — secure key management, spending limits, and USDT0 cross-chain bridging in a single SDK. The infrastructure risk is solved.

3. **Prediction markets are becoming legitimate** — Kalshi's CFTC win, Polymarket's volume explosion, and institutional interest mean the market is ready for professional tooling.

**The window to build the autonomous trading layer is open now.**

---

## Slide 14 — Closing

**The prediction market is a problem-solving machine for society.**
*We're building the AI that runs it.*

- Every trade: transparent, auditable, on-chain
- Every prediction: reasoned, logged, learned from
- Every fee: earned only when correct

**Autonomous DeFi Agent**
*Observe. Reason. Execute. Learn. Repeat.*

---

*Demo: [dashboard URL]*
*GitHub: [repo URL]*
*Contact: [email]*
