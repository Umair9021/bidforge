import { useEffect, useMemo, useState } from "react";
import {
  IconPlus,
  IconFilter,
  IconFileText,
  IconClock,
  IconAdjustmentsHorizontal,
  IconLoader2,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { OutlineButton, type ViewKey } from "./shell";
import {
  CountUp,
  ClickSpark,
  FadeContent,
  RangeSlider,
  SplitText,
  BlurText,
  GradientText,
  Aurora,
  TiltCard,
} from "./reactbits";
import { api, rfpNames, type RfpListItem, type ScoringOutput } from "../lib/api";

const presets = [
  { label: "All", range: [0, 100] as [number, number] },
  { label: "Hot", range: [70, 100] as [number, number] },
  { label: "Watch", range: [50, 70] as [number, number] },
  { label: "At risk", range: [0, 50] as [number, number] },
];

const statusBadge: Record<string, string> = {
  complete: "var(--accent-green)",
  failed: "var(--accent-red)",
  pending: "var(--text-tertiary)",
  extracting: "var(--accent-amber)",
  ner: "var(--accent-amber)",
  retrieving: "var(--accent-amber)",
  drafting: "var(--accent-blue)",
  scoring: "var(--accent-blue)",
};
const statusBg: Record<string, string> = {
  complete: "var(--accent-green-bg)",
  failed: "var(--accent-red-bg)",
  pending: "var(--secondary)",
  extracting: "var(--accent-amber-bg)",
  ner: "var(--accent-amber-bg)",
  retrieving: "var(--accent-amber-bg)",
  drafting: "var(--accent-blue-bg)",
  scoring: "var(--accent-blue-bg)",
};

const STATUS_FILTERS = ["All", "complete", "drafting", "scoring", "extracting", "ner", "retrieving", "pending", "failed"];

type Row = RfpListItem & { win?: number | null; recommendation?: "GO" | "NO-GO" | null };

export function Dashboard({
  onOpen,
  onOpenRfp,
  onChanged,
}: {
  onOpen: (v: ViewKey) => void;
  onOpenRfp: (id: string) => void;
  onChanged?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [winRange, setWinRange] = useState<[number, number]>([0, 100]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deleteOne = async (id: string) => {
    if (!window.confirm(`Delete ${rfpNames.get(id) ?? id}?`)) return;
    try {
      await api.delete(id);
      rfpNames.remove(id);
      setRows((prev) => prev.filter((r) => r.rfp_id !== id));
      onChanged?.();
      toast.success("Deleted");
    } catch (e: any) {
      toast.error("Delete failed", { description: e?.message });
    }
  };

  const deleteAll = async () => {
    if (rows.length === 0) return;
    if (!window.confirm(`Delete all ${rows.length} workspace${rows.length === 1 ? "" : "s"}?`)) return;
    const ids = rows.map((r) => r.rfp_id);
    const results = await Promise.allSettled(ids.map((id) => api.delete(id)));
    results.forEach((res, i) => {
      if (res.status === "fulfilled") rfpNames.remove(ids[i]);
    });
    setRows([]);
    onChanged?.();
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) toast.error(`${failed} delete${failed === 1 ? "" : "s"} failed`);
    else toast.success("All workspaces deleted");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = (await api.list()).filter((r) => !!rfpNames.get(r.rfp_id));
        if (cancelled) return;
        setRows(list.map((r) => ({ ...r, win: null, recommendation: null })));
        const scored = await Promise.all(
          list.map(async (r) => {
            if (r.status !== "complete") return r;
            try {
              const s: ScoringOutput = await api.scoring(r.rfp_id);
              return {
                ...r,
                win: Math.round((s.win_probability ?? 0) * 100),
                recommendation: s.go_no_go_recommendation,
              };
            } catch {
              return r;
            }
          })
        );
        if (!cancelled) setRows(scored);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load RFPs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => filter === "All" || r.status === filter)
      .filter((r) => {
        if (r.win == null) return winRange[0] === 0 && winRange[1] === 100;
        return r.win >= winRange[0] && r.win <= winRange[1];
      });
  }, [rows, filter, winRange]);

  const metrics = useMemo(() => {
    const active = rows.filter((r) => r.status !== "complete" && r.status !== "failed").length;
    const scored = rows.filter((r) => r.win != null);
    const avgWin = scored.length
      ? Math.round(scored.reduce((a, r) => a + (r.win ?? 0), 0) / scored.length)
      : 0;
    const goCount = rows.filter((r) => r.recommendation === "GO").length;
    const completed = rows.filter((r) => r.status === "complete").length;
    return [
      { label: "Total RFPs", value: rows.length, suffix: "" },
      { label: "Active", value: active, suffix: "" },
      { label: "Avg win probability", value: avgWin, suffix: "%" },
      { label: "GO recommendations", value: goCount, suffix: `/${completed || 0}` },
    ];
  }, [rows]);

  return (
    <div className="px-3 sm:px-4 lg:px-5 py-6 sm:py-8 space-y-6 max-w-[1320px] mx-auto">
      <div className="relative -mx-3 sm:-mx-4 lg:-mx-5 px-3 sm:px-4 lg:px-5 py-2 -mt-4 sm:-mt-6">
        <Aurora colors={["#185fa5", "#639922", "#ba7517"]} />
        <div className="relative flex items-end justify-between flex-wrap gap-3 pt-6">
          <div>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 600, letterSpacing: "-0.015em" }}>
              <SplitText text="Welcome back" />
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>
              <BlurText
                text={
                  loading
                    ? "Loading pipeline..."
                    : rows.length === 0
                    ? "No RFPs yet — upload one to get started"
                    : `${rows.length} RFP${rows.length === 1 ? "" : "s"} in pipeline`
                }
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
              <span style={{ fontWeight: 600 }}>
                {rows.length} bid{rows.length === 1 ? "" : "s"}
              </span>
            </GradientText>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((m, i) => (
          <FadeContent key={m.label} delay={i * 0.05}>
            <TiltCard max={4}>
              <div
                className="w-full text-left bg-card border border-border/80 rounded-lg p-3"
                style={{ borderWidth: "0.5px" }}
              >
                <div className="text-muted-foreground truncate" style={{ fontSize: 11 }}>
                  {m.label}
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div
                    className="tracking-tight tabular-nums"
                    style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}
                  >
                    <CountUp to={m.value} suffix={m.suffix} />
                  </div>
                </div>
              </div>
            </TiltCard>
          </FadeContent>
        ))}
      </div>

      <div
        className="bg-card border border-border/80 rounded-xl overflow-hidden"
        style={{ borderWidth: "0.5px" }}
      >
        <div
          className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border/80"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>RFPs</h2>
            <span className="text-text-tertiary truncate hidden sm:inline" style={{ fontSize: 11 }}>
              {filtered.length} of {rows.length} · {filter}
            </span>
          </div>
          <div className="flex items-center gap-2 relative">
            <OutlineButton icon={IconFilter} onClick={() => setShowFilters((s) => !s)}>
              {filter}
            </OutlineButton>
            {showFilters && (
              <div
                className="absolute right-0 top-9 z-10 bg-card border border-border/80 rounded-md shadow-md py-1 w-36"
                style={{ borderWidth: "0.5px" }}
              >
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setShowFilters(false);
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
            {rows.length > 0 && (
              <OutlineButton icon={IconTrash} onClick={deleteAll}>
                <span className="hidden sm:inline">Delete all</span>
              </OutlineButton>
            )}
            <ClickSpark color="#185fa5">
              <OutlineButton tone="primary" icon={IconPlus} onClick={() => onOpen("upload")}>
                <span className="hidden sm:inline">New bid</span>
                <span className="sm:hidden">New</span>
              </OutlineButton>
            </ClickSpark>
          </div>
        </div>

        <div
          className="px-4 sm:px-5 pt-3 pb-3 border-b border-border/80 space-y-3"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <IconAdjustmentsHorizontal size={13} stroke={1.75} className="text-muted-foreground" />
              {presets.map((p) => {
                const active = winRange[0] === p.range[0] && winRange[1] === p.range[1];
                return (
                  <button
                    key={p.label}
                    onClick={() => setWinRange(p.range)}
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

        <div
          className="hidden md:grid items-center px-4 py-2 border-b border-border/80 text-text-tertiary uppercase"
          style={{
            gridTemplateColumns: "36px 1fr 160px 140px 100px",
            fontSize: 10,
            letterSpacing: "0.06em",
            borderBottomWidth: "0.5px",
            gap: "12px",
          }}
        >
          <span />
          <span>RFP</span>
          <span>Created</span>
          <span>Win probability</span>
          <span className="text-right">Status</span>
        </div>

        <div className="divide-y divide-border/80">
          {loading && (
            <div
              className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2"
              style={{ fontSize: 12 }}
            >
              <IconLoader2 size={14} className="animate-spin" /> Loading…
            </div>
          )}
          {error && !loading && (
            <div className="p-8 text-center" style={{ fontSize: 12, color: "var(--accent-red)" }}>
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground" style={{ fontSize: 12 }}>
              {rows.length === 0 ? (
                <>
                  No RFPs yet.{" "}
                  <button onClick={() => onOpen("upload")} className="text-accent-blue underline">
                    Upload one
                  </button>
                </>
              ) : (
                <>
                  No bids match "{filter}".{" "}
                  <button onClick={() => setFilter("All")} className="text-accent-blue underline">
                    Clear filter
                  </button>
                </>
              )}
            </div>
          )}
          {!loading &&
            filtered.map((r) => (
              <div
                key={r.rfp_id}
                onClick={() => onOpenRfp(r.rfp_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpenRfp(r.rfp_id);
                }}
                className="group relative w-full hover:bg-secondary transition-colors text-left p-3 md:p-0 cursor-pointer"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOne(r.rfp_id);
                  }}
                  aria-label="Delete RFP"
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md hover:bg-card border border-border/80 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ borderWidth: "0.5px" }}
                >
                  <IconTrash size={12} stroke={1.75} />
                </button>
                <div className="md:hidden flex gap-3">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center bg-secondary border border-border/80 shrink-0"
                    style={{ borderWidth: "0.5px" }}
                  >
                    <IconFileText size={15} stroke={1.5} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>
                          {rfpNames.get(r.rfp_id) ?? r.rfp_id}
                        </div>
                        <div className="text-text-tertiary truncate" style={{ fontSize: 11 }}>
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center justify-center rounded-md shrink-0"
                        style={{
                          padding: "3px 9px",
                          fontSize: 11,
                          fontWeight: 500,
                          color: statusBadge[r.status] ?? "var(--text-tertiary)",
                          background: statusBg[r.status] ?? "var(--secondary)",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                    {r.win != null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between" style={{ fontSize: 11 }}>
                          <span className="text-muted-foreground">Win</span>
                          <span className="tabular-nums">{r.win}%</span>
                        </div>
                        <div
                          className="mt-1 w-full rounded-full bg-muted overflow-hidden"
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
                    )}
                  </div>
                </div>

                <div
                  className="hidden md:grid items-center px-4 py-2.5"
                  style={{
                    gridTemplateColumns: "36px 1fr 160px 140px 100px",
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
                      {r.rfp_id}
                    </div>
                    {r.recommendation && (
                      <div className="text-text-tertiary truncate" style={{ fontSize: 11 }}>
                        {r.recommendation}
                      </div>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: 12 }}>
                    <IconClock size={11} stroke={1.75} className="text-text-tertiary" />
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <div>
                    {r.win != null ? (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="tabular-nums" style={{ fontSize: 11 }}>
                            {r.win}%
                          </span>
                        </div>
                        <div className="w-full rounded-full bg-muted overflow-hidden" style={{ height: 4 }}>
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
                      </>
                    ) : (
                      <span className="text-text-tertiary" style={{ fontSize: 11 }}>—</span>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center justify-center rounded-md ml-auto"
                    style={{
                      padding: "3px 9px",
                      fontSize: 11,
                      fontWeight: 500,
                      color: statusBadge[r.status] ?? "var(--text-tertiary)",
                      background: statusBg[r.status] ?? "var(--secondary)",
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
