import { useState } from "react";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconPlus,
  IconFilter,
  IconFileText,
  IconClock,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { OutlineButton, type ViewKey } from "./shell";
import {
  CountUp,
  ClickSpark,
  FadeContent,
  RangeSlider,
  ListPreview,
  SplitText,
  BlurText,
  GradientText,
  Aurora,
  TiltCard,
  Sparkline,
  type PreviewItem,
} from "./reactbits";

const metrics: {
  label: string;
  num: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta: string;
  up: boolean;
  sub: string;
  trend: number[];
  trendColor: string;
}[] = [
  { label: "Active bids", num: 14, delta: "+3", up: true, sub: "this week", trend: [8, 9, 10, 9, 11, 12, 11, 14], trendColor: "var(--accent-blue)" },
  { label: "Avg win probability", num: 62, suffix: "%", delta: "+4.2", up: true, sub: "vs last mo.", trend: [54, 56, 55, 58, 57, 60, 61, 62], trendColor: "var(--accent-green)" },
  { label: "Time saved", num: 54, suffix: "%", delta: "+12", up: true, sub: "manual effort", trend: [30, 34, 38, 41, 44, 48, 51, 54], trendColor: "var(--accent-green)" },
  { label: "Avg cycle", num: 2.4, suffix: "d", decimals: 1, delta: "-1.8", up: false, sub: "draft to review", trend: [4.2, 4.0, 3.7, 3.4, 3.0, 2.8, 2.6, 2.4], trendColor: "var(--accent-amber)" },
];

const presets = [
  { label: "All", range: [0, 100] as [number, number] },
  { label: "Hot", range: [70, 100] as [number, number] },
  { label: "Watch", range: [50, 70] as [number, number] },
  { label: "At risk", range: [0, 50] as [number, number] },
];

const allRfps = [
  { id: "RFP-2031", title: "DOT Infrastructure Modernization", client: "US Dept. of Transportation", value: "$4.2M", due: "5d", win: 71, status: "drafting", stage: "Drafting" },
  { id: "RFQ-1188", title: "Cloud Migration & SecOps", client: "Northwind Federal Credit", value: "$1.8M", due: "12d", win: 58, status: "extracting", stage: "Extracting" },
  { id: "RFP-2044", title: "AI Risk Assessment Platform", client: "Aetheris Insurance", value: "$2.9M", due: "3d", win: 84, status: "review", stage: "Review" },
  { id: "RFP-1972", title: "Smart Grid Analytics", client: "Pacific Energy Co.", value: "$5.6M", due: "21d", win: 41, status: "intake", stage: "Intake" },
  { id: "RFP-2055", title: "Naval Logistics Portal Redesign", client: "US Navy NAVSUP", value: "$3.1M", due: "8d", win: 67, status: "drafting", stage: "Drafting" },
  { id: "RFQ-1201", title: "FedRAMP IL5 Migration Services", client: "DISA", value: "$7.4M", due: "31d", win: 38, status: "intake", stage: "Intake" },
  { id: "RFP-2061", title: "EHR Modernization & Interop", client: "VA Office of IT", value: "$12.8M", due: "45d", win: 72, status: "extracting", stage: "Extracting" },
];

const statusBadge: Record<string, string> = {
  drafting: "var(--accent-blue)",
  extracting: "var(--accent-amber)",
  review: "var(--accent-green)",
  intake: "var(--text-tertiary)",
};
const statusBg: Record<string, string> = {
  drafting: "var(--accent-blue-bg)",
  extracting: "var(--accent-amber-bg)",
  review: "var(--accent-green-bg)",
  intake: "var(--secondary)",
};

const FILTERS = ["All", "Drafting", "Review", "Extracting", "Intake"];

export function Dashboard({ onOpen }: { onOpen: (v: ViewKey) => void }) {
  const [filter, setFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [winRange, setWinRange] = useState<[number, number]>([0, 100]);

  const rfps = allRfps
    .filter((r) => filter === "All" || r.stage === filter)
    .filter((r) => r.win >= winRange[0] && r.win <= winRange[1]);

  const previewItems: PreviewItem[] = allRfps.slice(0, 5).map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: `${r.id} · ${r.client}`,
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</h4>
          <span
            className="rounded-md"
            style={{
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 500,
              color: statusBadge[r.status],
              background: statusBg[r.status],
            }}
          >
            {r.status}
          </span>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: 11 }}>
          {r.client}
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { l: "Value", v: r.value },
            { l: "Due", v: r.due },
            { l: "Win", v: `${r.win}%` },
          ].map((c) => (
            <div
              key={c.l}
              className="rounded-md p-2 border border-border/80"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="text-text-tertiary" style={{ fontSize: 10 }}>
                {c.l}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1" style={{ fontSize: 11 }}>
            <span className="text-muted-foreground">Win probability</span>
            <span>{r.win}%</span>
          </div>
          <div
            className="w-full rounded-full bg-muted overflow-hidden"
            style={{ height: 4 }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${r.win}%`,
                background:
                  r.win >= 70
                    ? "var(--accent-green)"
                    : r.win >= 50
                    ? "var(--accent-amber)"
                    : "var(--accent-red)",
              }}
            />
          </div>
        </div>
        <button
          onClick={() => onOpen("workspace")}
          className="w-full rounded-md bg-foreground text-background py-1.5 hover:opacity-90"
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          Open workspace →
        </button>
      </div>
    ),
  }));

  return (
    <div className="px-3 sm:px-4 lg:px-5 py-6 sm:py-8 space-y-6 max-w-[1320px] mx-auto">
      {/* Hero with Aurora */}
      <div className="relative -mx-3 sm:-mx-4 lg:-mx-5 px-3 sm:px-4 lg:px-5 py-2 -mt-4 sm:-mt-6">
        <Aurora colors={["#185fa5", "#639922", "#ba7517"]} />
        <div className="relative flex items-end justify-between flex-wrap gap-3 pt-6">
          <div>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 600, letterSpacing: "-0.015em" }}>
              <SplitText text="Good afternoon, Maya" />
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>
              <BlurText
                text="14 active bids · 2 need your attention today"
                delay={0.25}
              />
            </p>
          </div>
          <div
            className="rounded-md bg-card border border-border/80 px-3 py-1.5 backdrop-blur-sm"
            style={{ borderWidth: "0.5px", fontSize: 11 }}
          >
            <span className="text-text-tertiary">Pipeline</span>
            <span className="mx-2 text-text-tertiary">·</span>
            <GradientText>
              <span style={{ fontWeight: 600 }}>$24.6M weighted</span>
            </GradientText>
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((m, i) => (
          <FadeContent key={m.label} delay={i * 0.05}>
            <TiltCard max={4}>
              <button
                onClick={() =>
                  toast(m.label, {
                    description: `${m.prefix ?? ""}${m.num}${m.suffix ?? ""} · ${m.sub} (${m.delta})`,
                  })
                }
                className="w-full text-left bg-card border border-border/80 rounded-lg p-3 hover:border-foreground/20 transition-colors"
                style={{ borderWidth: "0.5px" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground truncate" style={{ fontSize: 11 }}>
                    {m.label}
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5"
                    style={{ fontSize: 10, color: "var(--accent-green)" }}
                  >
                    {m.up ? (
                      <IconArrowUpRight size={11} stroke={2} />
                    ) : (
                      <IconArrowDownRight size={11} stroke={2} />
                    )}
                    {m.delta}
                  </span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div
                    className="tracking-tight tabular-nums"
                    style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}
                  >
                    <CountUp
                      to={m.num}
                      prefix={m.prefix}
                      suffix={m.suffix}
                      decimals={m.decimals ?? 0}
                    />
                  </div>
                  <Sparkline values={m.trend} color={m.trendColor} width={64} height={22} />
                </div>
                <div className="text-text-tertiary mt-1" style={{ fontSize: 10 }}>
                  {m.sub}
                </div>
              </button>
            </TiltCard>
          </FadeContent>
        ))}
      </div>

      {/* RFP list */}
      <div
        className="bg-card border border-border/80 rounded-xl overflow-hidden"
        style={{ borderWidth: "0.5px" }}
      >
        <div
          className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border/80"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Active RFPs</h2>
            <span className="text-text-tertiary truncate hidden sm:inline" style={{ fontSize: 11 }}>
              {rfps.length} of {allRfps.length} · {filter}
            </span>
          </div>
          <div className="flex items-center gap-2 relative">
            <OutlineButton icon={IconFilter} onClick={() => setShowFilters((s) => !s)}>
              {filter}
            </OutlineButton>
            {showFilters && (
              <div
                className="absolute right-0 top-9 z-10 bg-card border border-border/80 rounded-md shadow-md py-1 w-32"
                style={{ borderWidth: "0.5px" }}
              >
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setShowFilters(false);
                      toast(`Filtered: ${f}`);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-secondary ${
                      filter === f ? "text-foreground" : "text-muted-foreground"
                    }`}
                    style={{ fontSize: 12 }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
            <ClickSpark color="#185fa5">
              <OutlineButton tone="primary" icon={IconPlus} onClick={() => onOpen("upload")}>
                <span className="hidden sm:inline">New bid</span>
                <span className="sm:hidden">New</span>
              </OutlineButton>
            </ClickSpark>
          </div>
        </div>

        {/* Slider filter */}
        <div
          className="px-4 sm:px-5 pt-3 pb-3 border-b border-border/80 space-y-3"
          style={{ borderBottomWidth: "0.5px" }}
        >
          {/* Preset chips */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <IconAdjustmentsHorizontal size={13} stroke={1.75} className="text-muted-foreground" />
              {presets.map((p) => {
                const active =
                  winRange[0] === p.range[0] && winRange[1] === p.range[1];
                return (
                  <button
                    key={p.label}
                    onClick={() => {
                      setWinRange(p.range);
                      toast(`Filter: ${p.label}`);
                    }}
                    className={`rounded-full border transition-colors ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card text-muted-foreground border-border/80 hover:text-foreground"
                    }`}
                    style={{ padding: "3px 10px", fontSize: 11, borderWidth: "0.5px" }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <span
              className="rounded-md tabular-nums bg-secondary"
              style={{ fontSize: 11, padding: "2px 7px", fontWeight: 600 }}
            >
              {winRange[0]}–{winRange[1]}%
            </span>
          </div>
          <div className="max-w-[520px]">
            <RangeSlider value={winRange} onChange={setWinRange} />
          </div>
        </div>

        {/* Desktop column headers */}
        <div
          className="hidden md:grid items-center px-4 py-2 border-b border-border/80 text-text-tertiary uppercase"
          style={{
            gridTemplateColumns: "36px 1fr 110px 80px 140px 100px 80px",
            fontSize: 10,
            letterSpacing: "0.06em",
            borderBottomWidth: "0.5px",
            gap: "12px",
          }}
        >
          <span />
          <span>RFP</span>
          <span>Value</span>
          <span>Due</span>
          <span>Win probability</span>
          <span>Stage</span>
          <span className="text-right">Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/80">
          {rfps.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                toast(`Opening ${r.id}`, { description: r.title });
                onOpen("workspace");
              }}
              className="w-full hover:bg-secondary transition-colors text-left p-3 md:p-0"
            >
              {/* Mobile layout */}
              <div className="md:hidden flex gap-3">
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center bg-secondary border border-border/80 shrink-0"
                  style={{ borderWidth: "0.5px" }}
                >
                  <IconFileText
                    size={15}
                    stroke={1.5}
                    className="text-muted-foreground"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        {r.title}
                      </div>
                      <div
                        className="text-text-tertiary truncate"
                        style={{ fontSize: 11 }}
                      >
                        {r.id} · {r.client}
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center justify-center rounded-md shrink-0"
                      style={{
                        padding: "3px 9px",
                        fontSize: 11,
                        fontWeight: 500,
                        color: statusBadge[r.status],
                        background: statusBg[r.status],
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div
                    className="mt-2 flex items-center gap-3 text-muted-foreground"
                    style={{ fontSize: 11 }}
                  >
                    <span>{r.value}</span>
                    <span className="flex items-center gap-1">
                      <IconClock size={11} stroke={1.75} />
                      {r.due}
                    </span>
                    <span className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>
                      {r.win}%
                    </span>
                  </div>
                  <div
                    className="mt-1.5 w-full rounded-full bg-muted overflow-hidden"
                    style={{ height: 4 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.win}%`,
                        background:
                          r.win >= 70
                            ? "var(--accent-green)"
                            : r.win >= 50
                            ? "var(--accent-amber)"
                            : "var(--accent-red)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div
                className="hidden md:grid items-center px-4 py-2.5"
                style={{
                  gridTemplateColumns: "36px 1fr 110px 80px 140px 100px 80px",
                  gap: "12px",
                }}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center bg-secondary border border-border/80"
                  style={{ borderWidth: "0.5px" }}
                >
                  <IconFileText size={15} stroke={1.5} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>
                    {r.title}
                  </div>
                  <div className="text-text-tertiary truncate" style={{ fontSize: 11 }}>
                    {r.id} · {r.client}
                  </div>
                </div>
                <span style={{ fontSize: 12 }}>{r.value}</span>
                <span className="flex items-center gap-1" style={{ fontSize: 12 }}>
                  <IconClock size={11} stroke={1.75} className="text-text-tertiary" />
                  {r.due}
                </span>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 11 }}>{r.win}%</span>
                  </div>
                  <div
                    className="w-full rounded-full bg-muted overflow-hidden"
                    style={{ height: 4 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.win}%`,
                        background:
                          r.win >= 70
                            ? "var(--accent-green)"
                            : r.win >= 50
                            ? "var(--accent-amber)"
                            : "var(--accent-red)",
                      }}
                    />
                  </div>
                </div>
                <span className="text-muted-foreground" style={{ fontSize: 11 }}>
                  {r.stage}
                </span>
                <span
                  className="inline-flex items-center justify-center rounded-md ml-auto"
                  style={{
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: statusBadge[r.status],
                    background: statusBg[r.status],
                  }}
                >
                  {r.status}
                </span>
              </div>
            </button>
          ))}
          {rfps.length === 0 && (
            <div className="p-8 text-center text-muted-foreground" style={{ fontSize: 12 }}>
              No bids match "{filter}". <button onClick={() => setFilter("All")} className="text-accent-blue underline">Clear filter</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 style={{ fontSize: 13, fontWeight: 600 }}>Quick preview</h3>
          <span className="text-text-tertiary" style={{ fontSize: 11 }}>
            hover a bid to peek
          </span>
        </div>
        <ListPreview items={previewItems} onSelect={() => onOpen("workspace")} />
      </div>

    </div>
  );
}
