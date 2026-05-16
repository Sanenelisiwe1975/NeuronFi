/**
 * @file app/api/vault/route.ts
 * @description GET /api/vault — returns AgentVault + agent wallet USDC balances.
 */

import { NextResponse } from "next/server";

const VAULT_ABI = [
  "function usdcBalance() external view returns (uint256)",
  "function remainingDailyUsdc() external view returns (uint256)",
  "function dailyLimitUsdc() external view returns (uint256)",
];

const ERC20_ABI = ["function balanceOf(address) external view returns (uint256)"];

async function getAgentAddressFromRedis(): Promise<string | null> {
  const redisUrl = process.env["REDIS_URL"];
  if (!redisUrl) return null;
  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl });
    await client.connect();
    const raw = await client.get("agent:latest");
    await client.disconnect();
    if (!raw) return null;
    const state = JSON.parse(raw) as { portfolio?: { address?: string } };
    return state.portfolio?.address ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const rpcUrl = process.env["KITE_RPC_URL"];
  const vaultAddress = process.env["AGENT_VAULT_ADDRESS"];
  const usdtAddress = process.env["USDC_CONTRACT_ADDRESS"];

  if (!rpcUrl || !vaultAddress || !usdtAddress) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider) as any;
    const usdt = new ethers.Contract(usdtAddress, ERC20_ABI, provider) as any;

    const agentAddress = await getAgentAddressFromRedis();

    const [vaultUsdt, remainingDaily, dailyLimit, agentUsdt] = await Promise.all([
      vault.usdcBalance() as Promise<bigint>,
      vault.remainingDailyUsdc() as Promise<bigint>,
      vault.dailyLimitUsdc() as Promise<bigint>,
      agentAddress ? (usdt.balanceOf(agentAddress) as Promise<bigint>) : Promise.resolve(0n),
    ]);

    const dailyUsed = dailyLimit - remainingDaily;

    const cache = { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' };
    return NextResponse.json({
      vaultUsdt: (Number(vaultUsdt) / 1e6).toFixed(2),
      agentUsdt: (Number(agentUsdt) / 1e6).toFixed(2),
      dailyLimit: (Number(dailyLimit) / 1e6).toFixed(2),
      dailyUsed: (Number(dailyUsed > 0n ? dailyUsed : 0n) / 1e6).toFixed(2),
      remainingDaily: (Number(remainingDaily) / 1e6).toFixed(2),
      agentAddress: agentAddress ?? vaultAddress,
    }, { headers: cache });
  } catch (err) {
    console.error("[/api/vault]", err);
    return NextResponse.json({ error: "Chain read failed" }, { status: 500 });
  }
}
