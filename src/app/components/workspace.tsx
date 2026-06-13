import { useState } from "react";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconAlertCircleFilled,
  IconCircleCheck,
  IconEdit,
  IconRefresh,
  IconSparkles,
  IconCalendarTime,
  IconCash,
  IconScale,
  IconShieldCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { OutlineButton } from "./shell";
import { Magnet } from "./reactbits";

type Tab = "overview" | "compliance" | "draft" | "score";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "compliance", label: "Compliance" },
  { key: "draft", label: "Draft" },
  { key: "score", label: "Score" },
];

export function Workspace() {
  const [tab, setTab] = useState<Tab>("overview");
  const [decision, setDecision] = useState<"go" | "nogo">("go");

  return (
    <div className="px-3 sm:px-4 lg:px-5 py-6 sm:py-8 space-y-5 max-w-[1320px] mx-auto">
      {/* Decision banner */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg px-3 sm:px-4 py-2.5 border"
        style={{
          background: decision === "go" ? "var(--accent-green-bg)" : "var(--accent-red-bg)",
          borderColor:
            decision === "go" ? "rgba(99,153,34,0.28)" : "rgba(226,75,74,0.28)",
          borderWidth: "0.5px",
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{
              background:
                decision === "go" ? "var(--accent-green)" : "var(--accent-red)",
              color: "#fff",
            }}
          >
            {decision === "go" ? (
              <IconCircleCheckFilled size={15} />
            ) : (
              <IconCircleXFilled size={15} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Recommendation: {decision === "go" ? "GO" : "NO-GO"}
              </span>
              <span
                className="rounded"
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  background: "rgba(0,0,0,0.05)",
                }}
              >
                71% confidence
              </span>
            </div>
            <div className="text-muted-foreground" style={{ fontSize: 11 }}>
              Budget aligned, technical fit strong. 2 capability gaps require attention.
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <OutlineButton
            tone={decision === "go" ? "nogo" : "go"}
            onClick={() => {
              const next = decision === "go" ? "nogo" : "go";
              setDecision(next);
              toast(`Decision overridden → ${next.toUpperCase()}`, {
                description: "Stakeholders notified.",
              });
            }}
          >
            Override → {decision === "go" ? "NO-GO" : "GO"}
          </OutlineButton>
          <Magnet strength={0.22}>
            <OutlineButton
              tone="primary"
              onClick={() =>
                toast.success("Proposal submitted", {
                  description: "RFP-2031 sent to internal review queue.",
                })
              }
            >
              Approve
            </OutlineButton>
          </Magnet>
        </div>
      </div>

      {/* Header */}
      <div
        className="border-b border-border/80"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <div className="flex items-start sm:items-end justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2" style={{ fontSize: 11 }}>
              <span className="text-text-tertiary">Workspaces</span>
              <span className="text-text-tertiary">/</span>
              <span className="text-muted-foreground">RFP-2031</span>
            </div>
            <div className="mt-1 mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 style={{ fontSize: 14, fontWeight: 600 }}>
                DOT Infrastructure Modernization
              </h1>
              <span className="text-text-tertiary" style={{ fontSize: 11 }}>
                US DOT · $4.2M · Due Jul 14, 2026
              </span>
            </div>
          </div>
          <div className="flex gap-2 pb-3">
            <OutlineButton onClick={() => toast.success("PDF exported", { description: "RFP-2031-Draft.pdf · 24 pages" })}>
              Export
            </OutlineButton>
            <OutlineButton
              tone="primary"
              icon={IconSparkles}
              onClick={() => toast.success("Regenerating all sections...", { description: "Estimated 18s" })}
            >
              <span className="hidden sm:inline">Regenerate all</span>
              <span className="sm:hidden">Regen</span>
            </OutlineButton>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-4 sm:gap-5 -mb-px overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2.5 transition-colors whitespace-nowrap min-h-[36px] flex items-end ${
                tab === t.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                fontSize: 12,
                fontWeight: tab === t.key ? 600 : 500,
                borderBottom:
                  tab === t.key
                    ? "2px solid var(--foreground)"
                    : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "compliance" && <ComplianceChecklist />}
      {tab === "draft" && <DraftTab />}
      {tab === "score" && <WinScore />}
    </div>
  );
}

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
        className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border/80"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {meta}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

function OverviewTab() {
  const facts = [
    { icon: IconCalendarTime, label: "Proposal due", value: "Jul 14, 2026 · 5pm ET" },
    { icon: IconCash, label: "Ceiling", value: "$4,200,000 FFP" },
    { icon: IconScale, label: "Eval weights", value: "Tech 40 · Past 30 · Price 20 · SB 10" },
    { icon: IconShieldCheck, label: "Compliance", value: "FAR 52.204-21 · DFARS 7012 · 508" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Panel
        title="Extracted entities"
        meta={
          <span className="text-text-tertiary truncate" style={{ fontSize: 11 }}>
            47 fields · 94%
          </span>
        }
        className="xl:col-span-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-start gap-2.5 py-1.5">
                <Icon size={14} stroke={1.75} className="text-muted-foreground mt-0.5 shrink-0" />
                <span
                  className="text-muted-foreground shrink-0"
                  style={{ fontSize: 11, width: 88 }}
                >
                  {f.label}
                </span>
                <span style={{ fontSize: 12 }} className="min-w-0">{f.value}</span>
              </div>
            );
          })}
        </div>
        <div
          className="mt-3 pt-3 border-t border-border/80"
          style={{ borderTopWidth: "0.5px" }}
        >
          <div
            className="uppercase text-text-tertiary mb-2"
            style={{ fontSize: 10, letterSpacing: "0.06em" }}
          >
            Key Clauses
          </div>
          <div className="space-y-1">
            {[
              { id: "L.3.2", t: "Cybersecurity standards — ISO 27001 + NIST 800-171" },
              { id: "L.4.1", t: "Cloud authorization — FedRAMP High required" },
              { id: "L.6.2", t: "Personnel clearances — 3 minimum TS/SCI" },
              { id: "M.2", t: "Past performance — 5 contracts > $1M in past 3 yrs" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => toast(c.id, { description: c.t })}
                className="w-full flex items-start gap-3 py-1 px-2 rounded hover:bg-secondary text-left"
              >
                <span
                  className="text-text-tertiary tabular-nums shrink-0"
                  style={{ fontSize: 11, width: 50 }}
                >
                  {c.id}
                </span>
                <span style={{ fontSize: 12 }}>{c.t}</span>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Timeline">
        <div className="space-y-2.5">
          {[
            { d: "Jun 02", t: "RFP released", done: true },
            { d: "Jun 11", t: "Intake & extraction complete", done: true },
            { d: "Jun 18", t: "GO/NO-GO review", done: false, current: true },
            { d: "Jun 28", t: "Q&A window closes", done: false },
            { d: "Jul 07", t: "Internal red team", done: false },
            { d: "Jul 14", t: "Submission deadline", done: false },
          ].map((s, i, arr) => (
            <div key={s.d} className="flex items-start gap-3 relative">
              <div className="flex flex-col items-center" style={{ width: 14 }}>
                <span
                  className="rounded-full shrink-0"
                  style={{
                    width: 8,
                    height: 8,
                    background: s.done
                      ? "var(--accent-green)"
                      : s.current
                      ? "var(--accent-blue)"
                      : "#d8d7d3",
                  }}
                />
                {i < arr.length - 1 && (
                  <span
                    style={{
                      width: "0.5px",
                      flex: 1,
                      background: "var(--border)",
                      minHeight: 18,
                    }}
                  />
                )}
              </div>
              <div className="pb-1">
                <div className="text-text-tertiary tabular-nums" style={{ fontSize: 10 }}>
                  {s.d}
                </div>
                <div style={{ fontSize: 12, fontWeight: s.current ? 600 : 400 }}>
                  {s.t}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ComplianceChecklist() {
  const [items, setItems] = useState([
    { id: "REQ-001", t: "ISO 27001 Certification (current)", section: "L.3.2", status: "pass", ev: "ISO-27001-2024.pdf" },
    { id: "REQ-002", t: "5+ federal contracts > $1M (past 3 yrs)", section: "M.2", status: "pass", ev: "5 of 5 matched" },
    { id: "REQ-003", t: "FedRAMP High authorization", section: "L.4.1", status: "fail", ev: "Missing — Moderate only" },
    { id: "REQ-004", t: "Section 508 VPAT documentation", section: "L.5.7", status: "pass", ev: "VPAT-2.4-Rev3.pdf" },
    { id: "REQ-005", t: "Cleared personnel — TS/SCI (3 min.)", section: "L.6.2", status: "gap", ev: "2 cleared, 1 in process" },
    { id: "REQ-006", t: "Small Business Subcontracting Plan", section: "L.8", status: "pass", ev: "Plan v2.1 attached" },
    { id: "REQ-007", t: "CMMC Level 2 certification", section: "L.4.5", status: "gap", ev: "Self-assessment only" },
    { id: "REQ-008", t: "Bonding capacity ≥ $5M", section: "M.4", status: "pass", ev: "Surety letter on file" },
    { id: "REQ-009", t: "Buy American Act compliance", section: "L.9", status: "gap", ev: "Supplier audit pending" },
    { id: "REQ-010", t: "24/7 NOC with US-based staff", section: "L.7", status: "pass", ev: "Atlanta + Denver NOCs" },
  ]);
  const pass = items.filter((i) => i.status === "pass").length;
  const gap = items.filter((i) => i.status === "gap").length;
  const fail = items.filter((i) => i.status === "fail").length;

  const assign = (id: string) => {
    setItems((it) =>
      it.map((row) => (row.id === id ? { ...row, status: "pass", ev: "Assigned to Capture team" } : row))
    );
    toast.success(`${id} assigned`, { description: "Status will refresh after evidence upload." });
  };

  return (
    <Panel
      title="Compliance checklist"
      meta={
        <div className="flex items-center gap-2 sm:gap-3" style={{ fontSize: 11 }}>
          <span className="flex items-center gap-1">
            <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--accent-green)" }} />
            {pass}
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--accent-amber)" }} />
            {gap}
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--accent-red)" }} />
            {fail}
          </span>
        </div>
      }
    >
      <div className="-mx-3 sm:-mx-4">
        {/* Desktop header */}
        <div
          className="hidden md:grid items-center px-4 py-2 border-y border-border/80 text-text-tertiary uppercase"
          style={{
            gridTemplateColumns: "20px 90px 1fr 70px 1fr 90px",
            fontSize: 10,
            letterSpacing: "0.06em",
            borderTopWidth: "0.5px",
            borderBottomWidth: "0.5px",
            gap: 12,
          }}
        >
          <span />
          <span>ID</span>
          <span>Requirement</span>
          <span>Section</span>
          <span>Evidence</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-border/80 border-t border-border/80 md:border-t-0" style={{ borderTopWidth: "0.5px" }}>
          {items.map((it) => (
            <div
              key={it.id}
              className="px-3 sm:px-4 py-2 hover:bg-secondary md:grid md:items-center"
              style={{
                gridTemplateColumns: "20px 90px 1fr 70px 1fr 90px",
                gap: 12,
              }}
            >
              {/* Mobile */}
              <div className="md:hidden flex items-start gap-2.5">
                {it.status === "pass" && <IconCircleCheckFilled size={14} style={{ color: "var(--accent-green)" }} className="mt-0.5 shrink-0" />}
                {it.status === "fail" && <IconCircleXFilled size={14} style={{ color: "var(--accent-red)" }} className="mt-0.5 shrink-0" />}
                {it.status === "gap" && <IconAlertCircleFilled size={14} style={{ color: "var(--accent-amber)" }} className="mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary tabular-nums" style={{ fontSize: 11 }}>{it.id}</span>
                    <span className="text-muted-foreground" style={{ fontSize: 11 }}>{it.section}</span>
                  </div>
                  <div style={{ fontSize: 12 }}>{it.t}</div>
                  <div className="text-muted-foreground mt-0.5" style={{ fontSize: 11 }}>{it.ev}</div>
                  {it.status !== "pass" && (
                    <button
                      onClick={() => assign(it.id)}
                      className="mt-1.5 rounded-md border border-border/80 hover:bg-card text-muted-foreground"
                      style={{ padding: "2px 8px", fontSize: 11, borderWidth: "0.5px" }}
                    >
                      Assign
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop */}
              {it.status === "pass" && <IconCircleCheckFilled size={14} style={{ color: "var(--accent-green)" }} className="hidden md:inline" />}
              {it.status === "fail" && <IconCircleXFilled size={14} style={{ color: "var(--accent-red)" }} className="hidden md:inline" />}
              {it.status === "gap" && <IconAlertCircleFilled size={14} style={{ color: "var(--accent-amber)" }} className="hidden md:inline" />}
              <span className="hidden md:inline text-text-tertiary tabular-nums" style={{ fontSize: 11 }}>{it.id}</span>
              <span className="hidden md:inline" style={{ fontSize: 12 }}>{it.t}</span>
              <span className="hidden md:inline text-muted-foreground" style={{ fontSize: 11 }}>{it.section}</span>
              <span className="hidden md:inline text-muted-foreground truncate" style={{ fontSize: 11 }}>{it.ev}</span>
              <button
                onClick={() => assign(it.id)}
                disabled={it.status === "pass"}
                className="hidden md:inline ml-auto rounded-md border border-border/80 hover:bg-card text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ padding: "2px 8px", fontSize: 11, borderWidth: "0.5px" }}
              >
                {it.status === "pass" ? "Done" : "Assign"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function DraftTab() {
  const [sections, setSections] = useState([
    { h: "1. Executive Summary", body: "BidForge proposes a phased modernization of the Department of Transportation's legacy traffic-management infrastructure across seven targeted metropolitan regions. Our cloud-native control plane delivers 30% reduction in mean incident response time and full FedRAMP High alignment within the first option year." },
    { h: "2. Technical Approach", body: "Our solution centers on a microservices-based control plane built on FedRAMP High infrastructure. Each regional deployment operates independently while sharing a federated analytics layer that aggregates telemetry from edge sensors, signal controllers, and connected-vehicle feeds. Inter-region failover targets a 60-second RTO." },
    { h: "3. Management Plan", body: "A dedicated program manager (PMP, ITIL v4) leads a cross-functional team of 14 engineers, 3 cybersecurity specialists, and 2 compliance leads. Weekly stakeholder syncs and a public-facing transparency dashboard ensure continuous alignment with DOT leadership." },
    { h: "4. Past Performance", body: "Five federal contracts over $1M in the past three years, including Smart Corridor Deployment (Phoenix, 2024) and Federal Air Traffic Modernization (FAA, 2023). All five received CPARS ratings of Exceptional in Quality and Schedule." },
  ]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (i: number) => {
    setEditing(i);
    setDraft(sections[i].body);
  };

  const save = () => {
    if (editing === null) return;
    setSections((s) => s.map((sec, i) => (i === editing ? { ...sec, body: draft } : sec)));
    toast.success(`${sections[editing].h.split(".")[1]?.trim() || "Section"} updated`);
    setEditing(null);
  };

  const regenerate = (i: number) => {
    toast.success(`Regenerating "${sections[i].h.split(".")[1]?.trim()}"...`, {
      description: "BidForge AI · ~6s",
    });
  };

  return (
    <Panel
      title="Draft response"
      meta={
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Draft saved", { description: "Version v3 · auto-checkpoint" })}
            className="inline-flex items-center gap-1 rounded-md border border-border/80 hover:bg-secondary"
            style={{ padding: "3px 8px", fontSize: 11, borderWidth: "0.5px" }}
          >
            <IconEdit size={11} stroke={1.75} /> Save
          </button>
          <button
            onClick={() => toast.success("Regenerating all sections...", { description: "Estimated 18s" })}
            className="inline-flex items-center gap-1 rounded-md border border-border/80 hover:bg-secondary"
            style={{ padding: "3px 8px", fontSize: 11, borderWidth: "0.5px" }}
          >
            <IconRefresh size={11} stroke={1.75} /> Regen all
          </button>
        </div>
      }
    >
      <div className="space-y-5 max-w-[760px]">
        {sections.map((s, i) => (
          <section key={s.h}>
            <div
              className="uppercase text-text-tertiary mb-1.5"
              style={{ fontSize: 11, letterSpacing: "0.06em", fontWeight: 600 }}
            >
              {s.h}
            </div>
            {editing === i ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full rounded-md border border-border/80 bg-card p-2 outline-none focus:border-accent-blue"
                  style={{ fontSize: 12, lineHeight: 1.55, borderWidth: "0.5px", minHeight: 120 }}
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={save}
                    className="inline-flex items-center gap-1 rounded-md bg-foreground text-background"
                    style={{ padding: "3px 9px", fontSize: 11 }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="inline-flex items-center gap-1 rounded-md border border-border/80 hover:bg-secondary"
                    style={{ padding: "3px 9px", fontSize: 11, borderWidth: "0.5px" }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 12, lineHeight: 1.55 }}>{s.body}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => startEdit(i)}
                    className="inline-flex items-center gap-1 rounded-md border border-border/80 hover:bg-secondary"
                    style={{ padding: "2px 7px", fontSize: 11, borderWidth: "0.5px" }}
                  >
                    <IconEdit size={11} stroke={1.75} /> Edit
                  </button>
                  <button
                    onClick={() => regenerate(i)}
                    className="inline-flex items-center gap-1 rounded-md border border-border/80 hover:bg-secondary"
                    style={{ padding: "2px 7px", fontSize: 11, borderWidth: "0.5px" }}
                  >
                    <IconRefresh size={11} stroke={1.75} /> Regenerate
                  </button>
                  <span className="text-text-tertiary" style={{ fontSize: 10 }}>
                    generated by BidForge · last edit 2m ago
                  </span>
                </div>
              </>
            )}
          </section>
        ))}
      </div>
    </Panel>
  );
}

export function WinScore() {
  const criteria = [
    { label: "Technical capability", val: 92, weight: "40%" },
    { label: "Past performance", val: 88, weight: "30%" },
    { label: "Budget alignment", val: 84, weight: "20%" },
    { label: "Compliance coverage", val: 76, weight: "—" },
    { label: "Competitor pressure", val: 54, weight: "—" },
    { label: "Timeline feasibility", val: 70, weight: "—" },
    { label: "Small business plan", val: 81, weight: "10%" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3">
      <Panel title="Win score">
        <div className="flex flex-col items-start">
          <div className="tracking-tight" style={{ fontSize: 48, fontWeight: 600, lineHeight: 1 }}>
            71%
          </div>
          <div className="text-muted-foreground mt-1" style={{ fontSize: 11 }}>
            Weighted composite · favorable
          </div>
          <div
            className="mt-4 rounded-md w-full px-2.5 py-2 border"
            style={{
              background: "var(--accent-green-bg)",
              borderColor: "rgba(99,153,34,0.28)",
              borderWidth: "0.5px",
            }}
          >
            <div className="flex items-center gap-2">
              <IconCircleCheck size={13} style={{ color: "var(--accent-green)" }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>GO recommended</span>
            </div>
            <div className="text-muted-foreground mt-1" style={{ fontSize: 11 }}>
              Above threshold (60%) across 5 of 7 criteria.
            </div>
          </div>
          <div
            className="mt-3 pt-3 border-t border-border/80 w-full grid grid-cols-3 gap-2 text-center"
            style={{ borderTopWidth: "0.5px" }}
          >
            <div>
              <div className="text-text-tertiary" style={{ fontSize: 10 }}>Last run</div>
              <div style={{ fontSize: 12 }}>12m ago</div>
            </div>
            <div>
              <div className="text-text-tertiary" style={{ fontSize: 10 }}>Model</div>
              <div style={{ fontSize: 12 }}>v4.2</div>
            </div>
            <div>
              <div className="text-text-tertiary" style={{ fontSize: 10 }}>Δ vs last</div>
              <div style={{ fontSize: 12, color: "var(--accent-green)" }}>+4</div>
            </div>
          </div>
          <button
            onClick={() => toast.success("Re-scoring...", { description: "Win model v4.2 · est. 8s" })}
            className="mt-3 w-full rounded-md border border-border/80 hover:bg-secondary inline-flex items-center justify-center gap-1.5"
            style={{ padding: "6px 13px", fontSize: 12, borderWidth: "0.5px" }}
          >
            <IconRefresh size={12} stroke={1.75} /> Recompute
          </button>
        </div>
      </Panel>
      <Panel title="Scoring criteria">
        <div className="h-[220px] -mt-2 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={criteria.map((c) => ({ subject: c.label.split(" ")[0], A: c.val }))}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="A"
                stroke="var(--accent-blue)"
                fill="var(--accent-blue)"
                fillOpacity={0.18}
                strokeWidth={1.5}
                isAnimationActive
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {criteria.map((c) => (
            <button
              key={c.label}
              onClick={() => toast(c.label, { description: `Score ${c.val} · weight ${c.weight}` })}
              className="w-full text-left hover:bg-secondary rounded -m-1 p-1"
            >
              <div className="flex items-center justify-between mb-1" style={{ fontSize: 12 }}>
                <span>{c.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-text-tertiary" style={{ fontSize: 10 }}>weight {c.weight}</span>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>{c.val}</span>
                </span>
              </div>
              <div className="w-full rounded-full bg-muted overflow-hidden" style={{ height: 5 }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.val}%`,
                    background:
                      c.val >= 75
                        ? "var(--accent-green)"
                        : c.val >= 55
                        ? "var(--accent-amber)"
                        : "var(--accent-red)",
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
