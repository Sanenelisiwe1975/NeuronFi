"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  markets: number;
  cycles: number;
  winRate: string;
  volume: string;
  status: "RUNNING" | "WAITING";
}

function useStats(): Stats {
  const [stats, setStats] = useState<Stats>({ markets: 0, cycles: 0, winRate: "—", volume: "$0", status: "WAITING" });

  useEffect(() => {
    async function load() {
      try {
        const [agentRes, marketsRes] = await Promise.allSettled([
          fetch("/api/agent").then(r => r.json()),
          fetch("/api/markets").then(r => r.json()),
        ]);
        const agent   = agentRes.status   === "fulfilled" ? agentRes.value   : null;
        const markets = marketsRes.status === "fulfilled" ? marketsRes.value : null;

        const marketList: { volumeUsdt?: string }[] = markets?.markets ?? [];
        const totalVol = marketList.reduce((s, m) => s + parseFloat(m.volumeUsdt ?? "0"), 0);

        setStats({
          markets:  marketList.length,
          cycles:   agent?.iteration   ?? 0,
          winRate:  agent?.winRate     ?? "—",
          volume:   `$${totalVol.toFixed(0)}`,
          status:   agent?.status      ?? "WAITING",
        });
      } catch { /* ignore */ }
    }
    void load();
  }, []);

  return stats;
}

const STEPS = [
  {
    n: "01",
    title: "Observe",
    desc: "Fetches ETH/USDC prices from Chainlink, gas snapshots, Uniswap V3 liquidity, and open prediction markets on Kite chain — every cycle.",
    color: "#7b62c9",
    bg: "#f3f0fb",
    border: "#ddd5f5",
  },
  {
    n: "02",
    title: "Reason",
    desc: "Sends the full market state to Claude Sonnet 4.6. Claude returns a ranked list of actions with confidence scores and rationale.",
    color: "#5f9a5f",
    bg: "#f0f5f0",
    border: "#cde0cd",
  },
  {
    n: "03",
    title: "Execute",
    desc: "Risk-gated actions are signed and submitted gaslessly via the Kite AA SDK. A 1% performance fee is locked in escrow — released only on correct predictions. Every resolution is attested on the Kite Attestation Registry.",
    color: "#c49a00",
    bg: "#fdf9ed",
    border: "#f0e0a0",
  },
];

const STACK = [
  { label: "Kite AA SDK",     sub: "Gasless smart account" },
  { label: "Agent Passport",  sub: "On-chain agent identity" },
  { label: "Claude Sonnet",   sub: "AI reasoning" },
  { label: "Chainlink",       sub: "Price oracles" },
  { label: "Kite chain",      sub: "Settlement & attestation" },
  { label: "LangChain.js",    sub: "LLM planning" },
  { label: "Next.js",         sub: "Dashboard" },
  { label: "LayerZero",       sub: "Cross-chain USDC" },
];

export default function Home() {
  const stats = useStats();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fdfbf9", minHeight: "100vh", color: "#2a2020" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #7b62c9; color: #fff; border-radius: 99px;
          padding: 13px 28px; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; border: none; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-primary:hover { background: #6a52b8; transform: translateY(-1px); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #2a2020; border-radius: 99px;
          padding: 13px 28px; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; border: 1.5px solid #ede8e8; cursor: pointer;
          transition: border-color 0.15s, transform 0.1s;
        }
        .btn-secondary:hover { border-color: #7b62c9; color: #7b62c9; transform: translateY(-1px); }
        .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #ede8e8; border: 1px solid #ede8e8; border-radius: 16px; overflow: hidden; }
        .stat-cell { background: #fff; padding: 24px 20px; text-align: center; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .stack-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 700px) {
          .stats-strip { grid-template-columns: 1fr 1fr; }
          .steps-grid  { grid-template-columns: 1fr; }
          .stack-grid  { grid-template-columns: 1fr 1fr; }
          @media (max-width: 1000px) { .stack-grid { grid-template-columns: repeat(2, 1fr); } }
          .hero-btns   { flex-direction: column; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="6" r="2" fill="#7b62c9"/>
            <circle cx="15" cy="6" r="2" fill="#7b62c9"/>
            <circle cx="6" cy="12" r="2" fill="#7b62c9"/>
            <circle cx="12" cy="12" r="2" fill="#7b62c9"/>
            <circle cx="18" cy="12" r="2" fill="#7b62c9"/>
            <circle cx="9" cy="18" r="2" fill="#7b62c9"/>
            <circle cx="15" cy="18" r="2" fill="#7b62c9"/>
            <line x1="9" y1="6" x2="15" y2="6" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="9" y1="6" x2="6" y2="12" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="9" y1="6" x2="12" y2="12" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="15" y1="6" x2="12" y2="12" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="15" y1="6" x2="18" y2="12" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="6" y1="12" x2="9" y2="18" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="12" y1="12" x2="9" y2="18" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="12" y1="12" x2="15" y2="18" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="18" y1="12" x2="15" y2="18" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="6" y1="12" x2="12" y2="12" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="12" y1="12" x2="18" y2="12" stroke="#7b62c9" strokeWidth="1.2"/>
            <line x1="9" y1="18" x2="15" y2="18" stroke="#7b62c9" strokeWidth="1.2"/>
          </svg>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#2a2020" }}>NeuronFi</span>
        </span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="https://github.com/Sanenelisiwe1975/autonomous-defi-agent" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#9a8e8e", fontWeight: 500 }}>GitHub</a>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Dashboard →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: stats.status === "RUNNING" ? "#f0f5f0" : "#fdf9f7", border: `1px solid ${stats.status === "RUNNING" ? "#cde0cd" : "#ede8e8"}`, borderRadius: 99, padding: "5px 14px", marginBottom: 28 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: stats.status === "RUNNING" ? "#5f9a5f" : "#c4b8b8", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: stats.status === "RUNNING" ? "#5f9a5f" : "#9a8e8e", fontWeight: 500 }}>
            Agent {stats.status === "RUNNING" ? "online" : "offline"}
          </span>
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px, 6vw, 54px)", lineHeight: 1.15, letterSpacing: "-1px", color: "#2a2020", marginBottom: 20, maxWidth: 700 }}>
          An autonomous AI agent that trades prediction markets on-chain.
        </h1>
        <p style={{ fontSize: 16, color: "#9a8e8e", lineHeight: 1.7, maxWidth: 560, marginBottom: 36 }}>
          Powered by Claude Sonnet 4.6 and the Kite AA SDK. Observes markets, reasons about opportunities, executes gasless trades, and attests every decision on-chain — without human intervention.
        </p>

        <div className="hero-btns">
          <Link href="/dashboard" className="btn-primary">View live dashboard →</Link>
          <a href="https://github.com/Sanenelisiwe1975/autonomous-defi-agent" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <div className="stats-strip">
          {[
            { label: "Active markets",  val: stats.markets.toString() },
            { label: "Agent cycles",    val: stats.cycles.toString() },
            { label: "Total volume",    val: stats.volume },
            { label: "Win rate",        val: stats.winRate },
          ].map(s => (
            <div key={s.label} className="stat-cell">
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#2a2020", lineHeight: 1 }}>{s.val}</p>
              <p style={{ fontSize: 11, color: "#c4b8b8", marginTop: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <p style={{ fontSize: 11, color: "#c4b8b8", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>How it works</p>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#2a2020", marginBottom: 32 }}>Fully autonomous. Every cycle.</h2>
        <div className="steps-grid">
          {STEPS.map(s => (
            <div key={s.n} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: s.color, opacity: 0.6 }}>{s.n}</span>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: s.color }}>{s.title}</span>
              </div>
              <p style={{ fontSize: 13, color: "#6a5e5e", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <p style={{ fontSize: 11, color: "#c4b8b8", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Built with</p>
        <div className="stack-grid">
          {STACK.map(t => (
            <div key={t.label} style={{ background: "#fff", border: "1px solid #ede8e8", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f3f0fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, color: "#7b62c9", fontWeight: 700 }}>{t.label[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2a2020" }}>{t.label}</p>
                <p style={{ fontSize: 11, color: "#c4b8b8" }}>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ background: "#f3f0fb", border: "1px solid #ddd5f5", borderRadius: 20, padding: "40px 36px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#2a2020" }}>Watch it trade live</h2>
          <p style={{ fontSize: 14, color: "#9a8e8e", maxWidth: 440, lineHeight: 1.7 }}>
            The agent is running on Kite chain. Open the dashboard to see real-time reasoning, attested on-chain trades, and portfolio performance.
          </p>
          <Link href="/dashboard" className="btn-primary">Open dashboard →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #ede8e8", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#c4b8b8" }}>
          Built for <strong style={{ color: "#9a8e8e" }}>Kite AI Hackathon — Agentic Trading & Portfolio Management</strong> · Apache 2.0 ·{" "}
          <a href="https://github.com/Sanenelisiwe1975/autonomous-defi-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#7b62c9" }}>GitHub</a>
        </p>
      </footer>
    </div>
  );
}
