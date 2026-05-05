import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Format USD values 
export function formatUSD(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

//Format percentage
export function formatPct(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

//Format time ago
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Format gwei
export function formatGwei(gwei: number): string {
  return `${gwei} gwei`;
}

//Risk score color
export function riskColor(score: number): string {
  if (score < 0.3) return "text-profit";
  if (score < 0.6) return "text-warning";
  return "text-loss";
}

//Risk score bar color 
export function riskBarColor(score: number): string {
  if (score < 0.3) return "bg-green-500";
  if (score < 0.6) return "bg-amber-500";
  return "bg-red-500";
}

// Truncate wallet address 
export function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Number with +/- sign 
export function withSign(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
