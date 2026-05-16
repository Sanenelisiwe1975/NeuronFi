/**
 * @file app/api/agent/route.ts
 * @description GET /api/agent — returns the latest agent state from Redis
 * or the JSON log file as a fallback.
 * Also includes Kite Agent Passport state (registration + active session).
 */

import { NextResponse } from "next/server";
import { getPassport, getSessionStatus } from "@repo/kite";

interface AgentState {
  iteration: number;
  network: string;
  portfolio: {
    address: string;
    ethWei: string;
    usdtMicro: string;
    xautMicro: string;
    totalValueUsdt: string;
    snapshotAt: number;
  };
  lastCycleMs: number;
  executions: Array<{
    actionId: string;
    actionType: string;
    success: boolean;
    txHash?: string;
    feeWei?: string;
    error?: string;
    skipped: boolean;
    executedAt: string;
  }>;
  marketSentiment: string;
  reasoning: string;
  summary: string;
  updatedAt: string;
}

async function getFromRedis(): Promise<AgentState | null> {
  const redisUrl = process.env["REDIS_URL"];
  if (!redisUrl) return null;
  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl });
    await client.connect();
    const raw = await client.get("agent:latest");
    await client.disconnect();
    return raw ? (JSON.parse(raw) as AgentState) : null;
  } catch {
    return null;
  }
}


async function getGasGwei(): Promise<string | null> {
  const rpcUrl = process.env["KITE_RPC_URL"];
  if (!rpcUrl) return null;
  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) return null;
    return (Number(feeData.gasPrice) / 1e9).toFixed(2);
  } catch {
    return null;
  }
}

export async function GET() {
  const [state, gasGwei] = await Promise.all([
    getFromRedis(),
    getGasGwei(),
  ]);

  // Get Kite Agent Passport state
  let passport = null;
  let session = null;
  try {
    const passportInstance = getPassport();
    const passportData = passportInstance.getPassport();
    if (passportData) {
      passport = {
        id: passportData.id,
        walletAddress: passportData.walletAddress,
        isRegistered: passportData.isRegistered,
        balance: passportData.balance,
      };
      
      const activeSessions = passportInstance.getActiveSessions();
      if (activeSessions.length > 0) {
        const currentSession = activeSessions[0];
        session = {
          id: currentSession.id,
          status: currentSession.status,
          budgetRemaining: (BigInt(currentSession.totalBudget) - BigInt(currentSession.spent)).toString(),
          totalBudget: currentSession.totalBudget,
          spent: currentSession.spent,
          transactionCount: currentSession.transactionCount,
          expiresAt: currentSession.expiresAt,
          ...getSessionStatus(currentSession),
        };
      }
    }
  } catch {
    // Passport not initialized, continue without it
  }

  if (!state) {
    return NextResponse.json(
      {
        iteration: 0,
        network: process.env["NETWORK"] ?? "kite",
        portfolio: null,
        lastCycleMs: 0,
        executions: [],
        marketSentiment: "NEUTRAL",
        reasoning: "",
        summary: "",
        gasGwei,
        updatedAt: new Date().toISOString(),
        passport,
        session,
        status: "WAITING",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ ...state, gasGwei, passport, session, status: "RUNNING" });
}
