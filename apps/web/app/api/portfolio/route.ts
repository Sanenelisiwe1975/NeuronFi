/**
 * @file app/api/portfolio/route.ts
 * @description GET /api/portfolio — returns last 50 portfolio snapshots from PostgreSQL.
 */

import { NextResponse } from "next/server";

interface PortfolioRow {
  id: number;
  address: string;
  eth_wei: string;
  usdc_micro: string;
  total_usdc: string;
  snapshot_at: string;
}

async function getFromPostgres(): Promise<PortfolioRow[]> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) return [];
  try {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    const { rows } = await client.query<PortfolioRow>(
      `SELECT * FROM portfolio_snapshots ORDER BY snapshot_at DESC LIMIT 50`
    );
    await client.end();
    return rows.reverse();
  } catch {
    return [];
  }
}

export async function GET() {
  const rows = await getFromPostgres();
  const safeNum = (v: unknown, divisor = 1) => {
    const n = Number(v) / divisor;
    return isFinite(n) ? n : 0;
  };
  const snapshots = rows.map((r) => ({
    id: r.id,
    address: r.address,
    ethBalance:  safeNum(r.eth_wei,    1e18).toFixed(6),
    usdcBalance: safeNum(r.usdc_micro, 1e6).toFixed(2),
    xautBalance: "0.0000",
    totalUsdc:   safeNum(r.total_usdc, 1e6).toFixed(2),
    snapshotAt: r.snapshot_at,
  }));
  return NextResponse.json({ snapshots });
}
