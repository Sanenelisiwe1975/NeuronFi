 -- ============================================================
--  NeuronFi — PostgreSQL schema
--  Apply via: paste into Neon SQL editor (https://neon.tech)
-- ============================================================

-- Agent loop outcomes
CREATE TABLE IF NOT EXISTS loop_outcomes (
  id           SERIAL PRIMARY KEY,
  iteration    INTEGER NOT NULL,
  network      TEXT NOT NULL,
  duration_ms  INTEGER NOT NULL,
  signals      JSONB NOT NULL,
  plan         JSONB NOT NULL,
  decision     JSONB NOT NULL,
  executions   JSONB NOT NULL,
  portfolio    JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual trade executions
CREATE TABLE IF NOT EXISTS trades (
  id              SERIAL PRIMARY KEY,
  loop_outcome_id INTEGER REFERENCES loop_outcomes(id),
  action_type     TEXT NOT NULL,
  market_id       TEXT,
  token           TEXT,
  amount_micro    BIGINT,
  tx_hash         TEXT,
  fee_wei         BIGINT,
  success         BOOLEAN NOT NULL,
  error           TEXT,
  executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio snapshots (one per loop)
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id           SERIAL PRIMARY KEY,
  address      TEXT NOT NULL,
  eth_wei      NUMERIC NOT NULL,
  usdc_micro   NUMERIC NOT NULL,
  total_usdc   NUMERIC NOT NULL,
  snapshot_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Market signals cache
CREATE TABLE IF NOT EXISTS market_signals (
  id            SERIAL PRIMARY KEY,
  observed_at   TIMESTAMPTZ NOT NULL,
  usdc_price    NUMERIC,
  eth_price     NUMERIC,
  gas_gwei      NUMERIC,
  opportunities JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent-learned priors (updated by the Learn phase)
CREATE TABLE IF NOT EXISTS agent_priors (
  id           SERIAL PRIMARY KEY,
  key          TEXT NOT NULL UNIQUE,
  value        JSONB NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kite attestation records (mirrors what's written to Kite Attestation Registry)
CREATE TABLE IF NOT EXISTS attestations (
  id              SERIAL PRIMARY KEY,
  market_address  TEXT NOT NULL,
  market_id       TEXT NOT NULL,
  attestation_hash TEXT NOT NULL,
  outcome         TEXT NOT NULL,
  rationale       TEXT,
  passport_id     TEXT,
  attested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_trades_executed_at        ON trades(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshot_at     ON portfolio_snapshots(snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_loop_outcomes_iteration   ON loop_outcomes(iteration DESC);
CREATE INDEX IF NOT EXISTS idx_attestations_market       ON attestations(market_address);
