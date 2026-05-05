import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { ChartPoint, BayesianPoint } from "../../types";
import { formatUSD } from "../../lib/utils";

//Price Area Chart 

interface PriceChartProps {
  data: ChartPoint[];
  positive?: boolean;
  height?: number;
}

export function PriceChart({ data, positive = true, height = 160 }: PriceChartProps) {
  const color = positive ? "#00d4ff" : "#ef4444";
  const gradId = `grad-${positive ? "pos" : "neg"}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tick={{ fill: "#3d5a80", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#3d5a80", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "#0d1630",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "JetBrains Mono",
            color: "#e8f0fe",
          }}
          formatter={(value: number) => [formatUSD(value), "Price"]}
          labelStyle={{ color: "#7a9bc4", marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ---- Bayesian Distribution Bar Chart -------------------------

interface BayesianChartProps {
  data: BayesianPoint[];
  height?: number;
}

export function BayesianChart({ data, height = 180 }: BayesianChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "#3d5a80", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "#0d1630",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "JetBrains Mono",
            color: "#e8f0fe",
          }}
          formatter={(v: number) => [v, "Belief"]}
          labelStyle={{ color: "#7a9bc4" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => {
            // Center bar is peak (neutral state) — use teal; extremes use dim cyan
            const isMid = i === Math.floor(data.length / 2);
            return <Cell key={i} fill={isMid ? "#00b4a0" : "#00d4ff"} fillOpacity={0.5 + (entry.value / 120)} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---- Accuracy Donut -----------------------------------------

interface AccuracyDonutProps {
  value: number; // 0-1
  size?: number;
}

export function AccuracyDonut({ value, size = 120 }: AccuracyDonutProps) {
  const data = [
    { name: "Accurate", value },
    { name: "Miss", value: 1 - value },
  ];

  return (
    <PieChart width={size} height={size}>
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#00b4a0" />
        </linearGradient>
      </defs>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={size * 0.35}
        outerRadius={size * 0.48}
        startAngle={90}
        endAngle={-270}
        dataKey="value"
        strokeWidth={0}
      >
        <Cell fill="url(#donut-grad)" />
        <Cell fill="rgba(0,212,255,0.08)" />
      </Pie>
    </PieChart>
  );
}

// ---- Mini sparkline (inline, no axes) -----------------------

interface SparklineProps {
  data: number[];
  positive?: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({ data, positive = true, width = 80, height = 28 }: SparklineProps) {
  const pts = data.map((v, i) => ({ i, v }));
  const color = positive ? "#00d4ff" : "#ef4444";

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={pts} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill="url(#spark-grad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
