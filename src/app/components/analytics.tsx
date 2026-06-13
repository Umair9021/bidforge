import { useState } from "react";
import { motion } from "motion/react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  IconTrendingUp,
  IconTarget,
  IconAlertTriangle,
  IconChartHistogram,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  CountUp,
  FadeContent,
  SplitText,
  BlurText,
  Sparkline,
} from "./reactbits";

type Tab = "overview" | "pipeline" | "distribution" | "trends";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pipeline", label: "Pipeline status" },
  { key: "distribution", label: "Win distribution" },
  { key: "trends", label: "Trends" },
];

const stages = [
  { key: "intake", label: "Intake", count: 4, color: "var(--text-tertiary)" },
  { key: "extracting", label: "Extracting", count: 3, color: "var(--accent-amber)" },
  { key: "drafting", label: "Drafting", count: 5, color: "var(--accent-blue)" },
  { key: "review", label: "Review", count: 2, color: "var(--accent-green)" },
];

const distribution = [
  { bucket: "0–20%", count: 1, color: "var(--accent-red)" },
  { bucket: "20–40%", count: 2, color: "var(--accent-red)" },
  { bucket: "40–60%", count: 4, color: "var(--accent-amber)" },
  { bucket: "60–80%", count: 5, color: "var(--accent-green)" },
  { bucket: "80–100%", count: 2, color: "var(--accent-green)" },
];

const trend12w = [
  { w: "W1", win: 48 },
  { w: "W2", win: 51 },
  { w: "W3", win: 50 },
  { w: "W4", win: 54 },
  { w: "W5", win: 56 },
  { w: "W6", win: 55 },
  { w: "W7", win: 58 },
  { w: "W8", win: 60 },
  { w: "W9", win: 59 },
  { w: "W10", win: 61 },
  { w: "W11", win: 63 },
  { w: "W12", win: 64 },
];

export function Analytics() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="px-3 sm:px-4 lg:px-5 py-6 sm:py-8 space-y-5 max-w-[1320px] mx-auto">
      {/* Header */}
      <FadeContent>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>
              <SplitText text="Analytics" />
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>
              <BlurText
                text="Pipeline health, win distribution and 12-week trends across all bids"
                delay={0.2}
              />
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-md bg-card border border-border/80 px-3 py-1.5"
            style={{ borderWidth: "0.5px", fontSize: 11 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent-green)" }}
            />
            <span className="text-text-tertiary">Live · updated 2m ago</span>
          </div>
        </div>
      </FadeContent>

      {/* Tabs */}
      <div
        className="border-b border-border/80 overflow-x-auto scrollbar-none"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <div className="flex items-center gap-5 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2 transition-colors whitespace-nowrap relative ${
                tab === t.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                fontSize: 12,
                fontWeight: tab === t.key ? 600 : 500,
              }}
            >
              {t.label}
              {tab === t.key && (
                <motion.span
                  layoutId="analytics-tab"
                  className="absolute left-0 right-0 -bottom-[1px]"
                  style={{ height: 2, background: "var(--foreground)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "pipeline" && <PipelineDonut />}
      {tab === "distribution" && <DistributionTab />}
      {tab === "trends" && <TrendsTab />}
    </div>
  );
}

/* ============ Pieces ============ */

function Panel({
  title,
  meta,
  children,
  className = "",
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border/80 rounded-xl ${className}`}
      style={{ borderWidth: "0.5px" }}
    >
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-border/80"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {meta}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total bids", v: 14, suffix: "", icon: IconChartHistogram, color: "var(--accent-blue)" },
          { l: "Avg win prob.", v: 62, suffix: "%", icon: IconTarget, color: "var(--accent-green)" },
          { l: "Hot bids (>70%)", v: 5, suffix: "", icon: IconTrendingUp, color: "var(--accent-green)" },
          { l: "At-risk (<50%)", v: 3, suffix: "", icon: IconAlertTriangle, color: "var(--accent-amber)" },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <FadeContent key={m.l} delay={i * 0.05}>
              <div
                className="bg-card border border-border/80 rounded-lg p-4"
                style={{ borderWidth: "0.5px" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground" style={{ fontSize: 11 }}>
                    {m.l}
                  </span>
                  <Icon size={14} stroke={1.75} style={{ color: m.color }} />
                </div>
                <div
                  className="tracking-tight tabular-nums"
                  style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.05 }}
                >
                  <CountUp to={m.v} suffix={m.suffix} />
                </div>
              </div>
            </FadeContent>
          );
        })}
      </div>
      <PipelineDonut />
      <DistributionTab />
    </div>
  );
}

/* ----- Pipeline Donut (animated circle) ----- */
function PipelineDonut() {
  const total = stages.reduce((s, x) => s + x.count, 0);
  const size = 240;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;

  // compute offsets
  let acc = 0;
  const segments = stages.map((s) => {
    const portion = s.count / total;
    const len = portion * c;
    const seg = { ...s, len, offset: acc, portion };
    acc += len;
    return seg;
  });

  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ? stages.find((s) => s.key === hovered) : null;
  const activeCount = active?.count ?? total;
  const activeLabel = active?.label ?? "All stages";

  return (
    <Panel
      title="Bid pipeline status"
      meta={
        <span className="text-text-tertiary" style={{ fontSize: 11 }}>
          {total} bids · live
        </span>
      }
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* SVG donut */}
        <div
          className="relative shrink-0 w-[180px] sm:w-[220px] md:w-[240px]"
          style={{ aspectRatio: "1" }}
          onMouseLeave={() => setHovered(null)}
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={stroke}
            />
            {/* Segments */}
            {segments.map((s, i) => (
              <motion.circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={hovered === s.key ? stroke + 4 : stroke}
                strokeLinecap="butt"
                strokeDasharray={`${s.len} ${c - s.len}`}
                strokeDashoffset={-s.offset}
                initial={{ strokeDasharray: `0 ${c}` }}
                animate={{ strokeDasharray: `${s.len} ${c - s.len}` }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHovered(s.key)}
                style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
              />
            ))}
            {/* Rotating accent ring */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius - stroke / 2 - 5}
              fill="none"
              stroke="var(--accent-blue)"
              strokeOpacity={0.25}
              strokeWidth={1}
              strokeDasharray="4 8"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              key={activeLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-text-tertiary"
              style={{ fontSize: 11, letterSpacing: "0.02em" }}
            >
              {activeLabel}
            </motion.div>
            <motion.div
              key={`v-${activeCount}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="tracking-tight tabular-nums"
              style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}
            >
              <CountUp to={activeCount} />
            </motion.div>
            <div className="text-muted-foreground" style={{ fontSize: 11 }}>
              {hovered ? `${Math.round((activeCount / total) * 100)}% of pipeline` : "active bids"}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((s) => {
            const pct = Math.round(s.portion * 100);
            const isActive = hovered === s.key;
            return (
              <button
                key={s.key}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  toast(s.label, { description: `${s.count} bids · ${pct}% of pipeline` })
                }
                className={`w-full text-left rounded-lg border border-border/80 px-3 py-2.5 transition-colors ${
                  isActive ? "bg-secondary" : "hover:bg-secondary"
                }`}
                style={{ borderWidth: "0.5px" }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-sm shrink-0"
                      style={{ width: 10, height: 10, background: s.color }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-text-tertiary tabular-nums"
                      style={{ fontSize: 11 }}
                    >
                      {pct}%
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {s.count}
                    </span>
                  </div>
                </div>
                <div
                  className="w-full rounded-full bg-muted overflow-hidden"
                  style={{ height: 4 }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* ----- Distribution histogram (animated + density curve) ----- */
function DistributionTab() {
  return <WinDistribution />;
}

function WinDistribution() {
  const total = distribution.reduce((s, x) => s + x.count, 0);
  const avg = 62;
  const median = 60;

  // Simulate individual bid points scattered within each bucket
  const points = [
    { x: 18, win: 18, label: "RFP-1972 · Smart Grid" },
    { x: 28, win: 28, label: "RFP-2102 · EPA emissions" },
    { x: 38, win: 38, label: "RFQ-1201 · FedRAMP IL5" },
    { x: 44, win: 44, label: "RFP-2090 · DOJ data lake" },
    { x: 51, win: 51, label: "RFP-2070 · NIH research" },
    { x: 56, win: 56, label: "RFQ-1188 · Cloud Migration" },
    { x: 58, win: 58, label: "RFP-2088 · IRS UX" },
    { x: 64, win: 64, label: "RFP-2055 · Naval Logistics" },
    { x: 67, win: 67, label: "RFP-2099 · DHS biometrics" },
    { x: 71, win: 71, label: "RFP-2031 · DOT Infrastructure" },
    { x: 73, win: 73, label: "RFP-2061 · EHR Modernization" },
    { x: 76, win: 76, label: "RFP-2072 · CMS portal" },
    { x: 84, win: 84, label: "RFP-2044 · AI Risk Platform" },
    { x: 88, win: 88, label: "RFP-2050 · State.gov refresh" },
  ];

  const [hover, setHover] = useState<number | null>(null);

  return (
    <Panel
      title="Win probability distribution"
      meta={
        <div className="hidden sm:flex items-center gap-3" style={{ fontSize: 11 }}>
          <span className="text-text-tertiary">{total} bids · 5 buckets</span>
          <span className="flex items-center gap-1.5">
            <span
              className="rounded-full"
              style={{ width: 8, height: 2, background: "var(--accent-blue)" }}
            />
            <span className="text-muted-foreground">density</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="rounded-full"
              style={{
                width: 8,
                height: 2,
                background: "var(--foreground)",
                opacity: 0.5,
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--foreground) 0 2px, transparent 2px 4px)",
              }}
            />
            <span className="text-muted-foreground">average</span>
          </span>
        </div>
      }
    >
      <DistributionChart
        buckets={distribution}
        points={points}
        avg={avg}
        median={median}
        hover={hover}
        setHover={setHover}
      />

      <div
        className="mt-4 pt-3 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3"
        style={{ borderTopWidth: "0.5px" }}
      >
        {[
          { l: "Average", v: `${avg}%`, c: "var(--accent-blue)" },
          { l: "Median", v: `${median}%`, c: "var(--foreground)" },
          { l: "Top quartile", v: "78%", c: "var(--accent-green)" },
          { l: "Bottom quartile", v: "44%", c: "var(--accent-red)" },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-text-tertiary" style={{ fontSize: 11 }}>
              {s.l}
            </div>
            <div
              className="tabular-nums"
              style={{ fontSize: 20, fontWeight: 600, color: s.c, lineHeight: 1.1 }}
            >
              <CountUp to={parseInt(s.v)} suffix="%" />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DistributionChart({
  buckets,
  points,
  avg,
  median,
  hover,
  setHover,
}: {
  buckets: { bucket: string; count: number; color: string }[];
  points: { x: number; win: number; label: string }[];
  avg: number;
  median: number;
  hover: number | null;
  setHover: (i: number | null) => void;
}) {
  // Chart dimensions
  const width = 760;
  const height = 280;
  const padL = 36;
  const padR = 24;
  const padT = 18;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const maxCount = Math.max(...buckets.map((b) => b.count));
  const yTicks = Math.ceil(maxCount);
  const xToPx = (x: number) => padL + (x / 100) * innerW;
  const yToPx = (v: number) => padT + innerH - (v / yTicks) * innerH;

  const bucketWidth = innerW / buckets.length;

  // Density curve via Gaussian KDE on point distribution
  const sigma = 6;
  const density = Array.from({ length: 101 }, (_, x) => {
    const d = points.reduce(
      (s, p) => s + Math.exp(-((x - p.win) ** 2) / (2 * sigma ** 2)),
      0
    );
    return { x, d };
  });
  const maxD = Math.max(...density.map((d) => d.d));
  // Scale density so peak reaches ~85% of maxCount height
  const densityScale = (maxCount * 0.85) / maxD;
  const densityPath = density
    .map((d, i) => {
      const px = xToPx(d.x);
      const py = yToPx(d.d * densityScale);
      return `${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`;
    })
    .join(" ");
  const densityArea = `${densityPath} L${xToPx(100)},${yToPx(0)} L${xToPx(0)},${yToPx(0)} Z`;

  return (
    <div className="relative -mx-4 sm:mx-0 overflow-x-auto">
      <div style={{ minWidth: 520 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ height: "auto", display: "block" }}
        className="overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        {/* Y grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = yToPx(i);
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="2 4"
              />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fill="var(--muted-foreground)"
                fontSize={10}
              >
                {i}
              </text>
            </g>
          );
        })}

        {/* Gradient defs */}
        <defs>
          <linearGradient id="density-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.02" />
          </linearGradient>
          {buckets.map((b, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`bar-grad-${i}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor={b.color} stopOpacity="1" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0.55" />
            </linearGradient>
          ))}
        </defs>

        {/* Bars */}
        {buckets.map((b, i) => {
          const barW = bucketWidth * 0.62;
          const x = padL + bucketWidth * i + (bucketWidth - barW) / 2;
          const y = yToPx(b.count);
          const h = padT + innerH - y;
          const isHover = hover === i;
          return (
            <g key={b.bucket}>
              <motion.rect
                x={x}
                width={barW}
                rx={6}
                fill={`url(#bar-grad-${i})`}
                initial={{ y: padT + innerH, height: 0, opacity: 0 }}
                animate={{ y, height: h, opacity: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseEnter={() => setHover(i)}
                style={{
                  cursor: "pointer",
                  filter: isHover
                    ? `drop-shadow(0 4px 12px ${b.color}55)`
                    : "none",
                  transition: "filter 0.2s",
                }}
              />
              {/* Bar count label */}
              <motion.text
                x={x + barW / 2}
                y={y - 8}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize={11}
                fontWeight={600}
                initial={{ opacity: 0, y: y }}
                animate={{ opacity: 1, y: y - 8 }}
                transition={{ delay: i * 0.08 + 0.7, duration: 0.4 }}
              >
                {b.count}
              </motion.text>
              {/* X label */}
              <text
                x={padL + bucketWidth * i + bucketWidth / 2}
                y={height - 16}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize={11}
              >
                {b.bucket}
              </text>
            </g>
          );
        })}

        {/* Density curve area + line */}
        <motion.path
          d={densityArea}
          fill="url(#density-grad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        />
        <motion.path
          d={densityPath}
          fill="none"
          stroke="var(--accent-blue)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
        />

        {/* Individual bid dots (jittered slightly above x-axis) */}
        {points.map((p, i) => {
          const cx = xToPx(p.x);
          const baseY = padT + innerH;
          const jitter = ((i % 3) - 1) * 4;
          const cy = baseY - 10 + jitter;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={3}
              fill="var(--foreground)"
              fillOpacity={0.55}
              initial={{ opacity: 0, cy: baseY + 10 }}
              animate={{ opacity: 1, cy }}
              transition={{ delay: 1.1 + i * 0.04, duration: 0.4 }}
            >
              <title>
                {p.label} · {p.win}%
              </title>
            </motion.circle>
          );
        })}

        {/* Median line */}
        <motion.line
          x1={xToPx(median)}
          x2={xToPx(median)}
          y1={padT}
          y2={padT + innerH}
          stroke="var(--foreground)"
          strokeOpacity={0.35}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        />
        <text
          x={xToPx(median)}
          y={padT - 6}
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize={10}
          opacity={0.7}
        >
          median {median}%
        </text>

        {/* Average line (dashed) */}
        <motion.line
          x1={xToPx(avg)}
          x2={xToPx(avg)}
          y1={padT}
          y2={padT + innerH}
          stroke="var(--accent-blue)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        />
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <rect
            x={xToPx(avg) - 24}
            y={padT + innerH + 4}
            width={48}
            height={14}
            rx={3}
            fill="var(--accent-blue)"
          />
          <text
            x={xToPx(avg)}
            y={padT + innerH + 14}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            fontWeight={600}
          >
            avg {avg}%
          </text>
        </motion.g>

        {/* Animated pulse on highest bucket */}
        {(() => {
          const peakIdx = buckets.reduce(
            (best, b, i) => (b.count > buckets[best].count ? i : best),
            0
          );
          const barW = bucketWidth * 0.62;
          const x = padL + bucketWidth * peakIdx + (bucketWidth - barW) / 2;
          const y = yToPx(buckets[peakIdx].count);
          return (
            <motion.circle
              cx={x + barW / 2}
              cy={y}
              r={4}
              fill={buckets[peakIdx].color}
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          );
        })()}
      </svg>

      </div>
      {/* Hover tooltip */}
      {hover !== null && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-3 rounded-md bg-card border border-border/80 px-3 py-2 pointer-events-none"
          style={{
            borderWidth: "0.5px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="rounded-sm"
              style={{ width: 8, height: 8, background: buckets[hover].color }}
            />
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {buckets[hover].bucket}
            </span>
          </div>
          <div className="text-muted-foreground" style={{ fontSize: 11 }}>
            {buckets[hover].count} bids ·{" "}
            {Math.round(
              (buckets[hover].count /
                buckets.reduce((s, b) => s + b.count, 0)) *
                100
            )}
            % of pipeline
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TrendsTab() {
  return (
    <Panel
      title="12-week win-probability trend"
      meta={
        <Sparkline
          values={trend12w.map((t) => t.win)}
          color="var(--accent-blue)"
          width={80}
          height={20}
        />
      }
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend12w} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="w"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              tickLine={false}
              domain={[40, 70]}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--card)",
                border: "0.5px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="win"
              stroke="var(--accent-blue)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--accent-blue)" }}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={1100}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
