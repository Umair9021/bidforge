import { useEffect, useState } from "react";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconAlertCircleFilled,
  IconCircleCheck,
  IconEdit,
  IconLoader2,
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
import { api, rfpNames, type RfpResult, type ComplianceItem, type DraftSection } from "../lib/api";

type Tab = "overview" | "compliance" | "draft" | "score";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "compliance", label: "Compliance" },
  { key: "draft", label: "Draft" },
  { key: "score", label: "Score" },
];

export function Workspace({ rfpId }: { rfpId: string | null }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<RfpResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rfpId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .result(rfpId)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load RFP");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rfpId]);

  if (!rfpId) {
    return (
      <div className="px-3 sm:px-4 lg:px-5 py-12 max-w-[1320px] mx-auto text-center text-muted-foreground" style={{ fontSize: 13 }}>
        Select an RFP from the sidebar or dashboard.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-5 py-12 max-w-[1320px] mx-auto text-center text-muted-foreground flex items-center justify-center gap-2" style={{ fontSize: 13 }}>
        <IconLoader2 size={16} className="animate-spin" /> Loading {rfpId}…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 lg:px-5 py-12 max-w-[1320px] mx-auto text-center" style={{ fontSize: 13, color: "var(--accent-red)" }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  const scoring = data.scoring_output;
  const decision = scoring?.go_no_go_recommendation === "GO" ? "go" : "nogo";
  const confidence = Math.round((scoring?.win_probability ?? 0) * 100);
  const ner = data.ner_output ?? {
    deadlines: [],
    budget_figures: [],
    evaluation_weights: [],
    compliance_clauses: [],
    mandatory_requirements: [],
    evaluation_criteria: [],
  };
  const draftOutput = data.draft_output ?? {
    sections: [],
    compliance_checklist: [],
    missing_evidence: [],
  };
  const sections = data.sections ?? [];

  return (
    <div className="px-3 sm:px-4 lg:px-5 py-6 sm:py-8 space-y-5 max-w-[1320px] mx-auto">
      {scoring && (
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg px-3 sm:px-4 py-2.5 border"
          style={{
            background: decision === "go" ? "var(--accent-green-bg)" : "var(--accent-red-bg)",
            borderColor: decision === "go" ? "rgba(99,153,34,0.28)" : "rgba(226,75,74,0.28)",
            borderWidth: "0.5px",
          }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: decision === "go" ? "var(--accent-green)" : "var(--accent-red)",
                color: "#fff",
              }}
            >
              {decision === "go" ? <IconCircleCheckFilled size={15} /> : <IconCircleXFilled size={15} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Recommendation: {scoring.go_no_go_recommendation}
                </span>
                <span
                  className="rounded"
                  style={{ fontSize: 10, padding: "2px 6px", background: "rgba(0,0,0,0.05)" }}
                >
                  {confidence}% confidence
                </span>
              </div>
              <div className="text-muted-foreground" style={{ fontSize: 11 }}>
                {scoring.go_no_go_rationale}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-border/80" style={{ borderBottomWidth: "0.5px" }}>
        <div className="flex items-start sm:items-end justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2" style={{ fontSize: 11 }}>
              <span className="text-text-tertiary">Workspaces</span>
              <span className="text-text-tertiary">/</span>
              <span className="text-muted-foreground" title={rfpId}>{rfpNames.get(rfpId) ?? rfpId}</span>
            </div>
            <div className="mt-1 mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 style={{ fontSize: 14, fontWeight: 600 }} title={rfpId}>
                {rfpNames.get(rfpId) ?? rfpId}
              </h1>
              <span className="text-text-tertiary" style={{ fontSize: 11 }}>
                {sections.length} sections · {draftOutput.sections.length} drafted
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 -mb-px overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2.5 transition-colors whitespace-nowrap min-h-[36px] flex items-end ${
                tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                fontSize: 12,
                fontWeight: tab === t.key ? 600 : 500,
                borderBottom: tab === t.key ? "2px solid var(--foreground)" : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewTab ner={ner} sections={sections} />}
      {tab === "compliance" && <ComplianceTab items={draftOutput.compliance_checklist} />}
      {tab === "draft" && (
        <DraftTab
          rfpId={rfpId}
          sections={draftOutput.sections}
          onSectionUpdated={(idx, updated) =>
            setData((d) => {
              if (!d) return d;
              const prev = d.draft_output ?? { sections: [], compliance_checklist: [], missing_evidence: [] };
              const next = [...prev.sections];
              next[idx] = updated;
              return { ...d, draft_output: { ...prev, sections: next } };
            })
          }
        />
      )}
      {tab === "score" &&
        (scoring ? (
          <ScoreTab scoring={scoring} />
        ) : (
          <div className="text-muted-foreground text-center py-12" style={{ fontSize: 12 }}>
            Scoring not available yet — RFP is still processing.
          </div>
        ))}
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
    <div className={`bg-card border border-border/80 rounded-xl ${className}`} style={{ borderWidth: "0.5px" }}>
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

function OverviewTab({ ner, sections }: { ner: RfpResult["ner_output"]; sections: RfpResult["sections"] }) {
  const deadlines = ner.deadlines.slice(0, 3).map((d) => `${d.label}: ${d.date_text}`).join(" · ") || "—";
  const budgets =
    ner.budget_figures.slice(0, 3).map((b) => `${b.currency}${b.amount_text} (${b.label})`).join(" · ") || "—";
  const weights =
    ner.evaluation_weights
      .slice(0, 4)
      .map((w) => `${w.criterion}${w.weight_percent != null ? ` ${w.weight_percent}%` : ""}`)
      .join(" · ") || "—";
  const compliance = ner.compliance_clauses.slice(0, 4).join(" · ") || "—";

  const facts = [
    { icon: IconCalendarTime, label: "Deadlines", value: deadlines },
    { icon: IconCash, label: "Budget", value: budgets },
    { icon: IconScale, label: "Eval weights", value: weights },
    { icon: IconShieldCheck, label: "Compliance", value: compliance },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Panel
        title="Extracted entities"
        meta={
          <span className="text-text-tertiary truncate" style={{ fontSize: 11 }}>
            {ner.mandatory_requirements.length} requirements
          </span>
        }
        className="xl:col-span-2"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-1">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-start gap-2.5 py-1.5">
                <Icon size={14} stroke={1.75} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground shrink-0" style={{ fontSize: 11, width: 88 }}>
                  {f.label}
                </span>
                <span style={{ fontSize: 12 }} className="min-w-0">
                  {f.value}
                </span>
              </div>
            );
          })}
        </div>

        {ner.mandatory_requirements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/80" style={{ borderTopWidth: "0.5px" }}>
            <div className="uppercase text-text-tertiary mb-2" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
              Mandatory requirements
            </div>
            <div className="space-y-1">
              {ner.mandatory_requirements.slice(0, 8).map((r, i) => (
                <div key={i} className="flex items-start gap-3 py-1 px-2">
                  <span className="text-text-tertiary tabular-nums shrink-0" style={{ fontSize: 11, width: 24 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 12 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Document sections">
        <div className="space-y-2 max-h-[420px] overflow-y-auto">
          {sections.length === 0 && (
            <div className="text-text-tertiary" style={{ fontSize: 11 }}>
              No sections parsed.
            </div>
          )}
          {sections.slice(0, 30).map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-text-tertiary tabular-nums shrink-0" style={{ fontSize: 10, width: 28 }}>
                p.{s.page}
              </span>
              <span style={{ fontSize: 12 }} className="truncate">
                {s.heading}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ComplianceTab({ items }: { items: ComplianceItem[] }) {
  const pass = items.filter((i) => i.status === "MET").length;
  const partial = items.filter((i) => i.status === "PARTIAL" || i.status === "UNKNOWN").length;
  const fail = items.filter((i) => i.status === "NOT_MET").length;

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
            {partial}
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--accent-red)" }} />
            {fail}
          </span>
        </div>
      }
    >
      {items.length === 0 && (
        <div className="text-text-tertiary p-4 text-center" style={{ fontSize: 12 }}>
          No compliance items.
        </div>
      )}
      <div className="divide-y divide-border/80">
        {items.map((it, idx) => (
          <div key={idx} className="py-2.5 flex items-start gap-2.5">
            {it.status === "MET" && (
              <IconCircleCheckFilled size={14} style={{ color: "var(--accent-green)" }} className="mt-0.5 shrink-0" />
            )}
            {it.status === "NOT_MET" && (
              <IconCircleXFilled size={14} style={{ color: "var(--accent-red)" }} className="mt-0.5 shrink-0" />
            )}
            {(it.status === "PARTIAL" || it.status === "UNKNOWN") && (
              <IconAlertCircleFilled
                size={14}
                style={{ color: "var(--accent-amber)" }}
                className="mt-0.5 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 12 }}>{it.requirement}</div>
              {it.notes && (
                <div className="text-muted-foreground mt-0.5" style={{ fontSize: 11 }}>
                  {it.notes}
                </div>
              )}
              {it.evidence_reference && (
                <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>
                  Evidence: {it.evidence_reference}
                </div>
              )}
            </div>
            <span
              className="rounded shrink-0"
              style={{
                fontSize: 10,
                padding: "2px 7px",
                background: "var(--secondary)",
              }}
            >
              {it.status}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DraftTab({
  rfpId,
  sections,
  onSectionUpdated,
}: {
  rfpId: string;
  sections: DraftSection[];
  onSectionUpdated: (i: number, s: DraftSection) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (i: number) => {
    setEditing(i);
    setDraft(sections[i].drafted_response);
  };

  const save = async () => {
    if (editing === null) return;
    setSaving(true);
    try {
      const updated = await api.editSection(rfpId, editing, draft);
      onSectionUpdated(editing, updated);
      toast.success("Section updated");
      setEditing(null);
    } catch (e: any) {
      toast.error("Save failed", { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Draft response">
      {sections.length === 0 && (
        <div className="text-text-tertiary text-center p-4" style={{ fontSize: 12 }}>
          No drafted sections yet.
        </div>
      )}
      <div className="space-y-5 max-w-[760px]">
        {sections.map((s, i) => (
          <section key={i}>
            <div
              className="uppercase text-text-tertiary mb-1.5"
              style={{ fontSize: 11, letterSpacing: "0.06em", fontWeight: 600 }}
            >
              {s.heading}
            </div>
            {editing === i ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full rounded-md border border-border/80 bg-card p-2 outline-none focus:border-accent-blue"
                  style={{ fontSize: 12, lineHeight: 1.55, borderWidth: "0.5px", minHeight: 160 }}
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-md bg-foreground text-background disabled:opacity-50"
                    style={{ padding: "3px 9px", fontSize: 11 }}
                  >
                    {saving ? "Saving…" : "Save"}
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
                <p style={{ fontSize: 12, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{s.drafted_response}</p>
                {s.has_placeholders && (
                  <div className="text-amber-600 mt-1" style={{ fontSize: 11 }}>
                    ⚠ Contains placeholders — review before submission
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => startEdit(i)}
                    className="inline-flex items-center gap-1 rounded-md border border-border/80 hover:bg-secondary"
                    style={{ padding: "2px 7px", fontSize: 11, borderWidth: "0.5px" }}
                  >
                    <IconEdit size={11} stroke={1.75} /> Edit
                  </button>
                  {s.evidence_used.length > 0 && (
                    <span className="text-text-tertiary" style={{ fontSize: 10 }}>
                      {s.evidence_used.length} evidence source{s.evidence_used.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </>
            )}
          </section>
        ))}
      </div>
    </Panel>
  );
}

function ScoreTab({ scoring }: { scoring: RfpResult["scoring_output"] }) {
  const pct = (n: number | null | undefined) =>
    typeof n === "number" && !isNaN(n) ? Math.round(n * 100) : 0;
  const criteria = [
    { label: "Capability coverage", val: pct(scoring.capability_coverage_score) },
    { label: "Budget alignment", val: pct(scoring.budget_alignment_score) },
    { label: "Compliance completeness", val: pct(scoring.compliance_completeness_score) },
    { label: "Draft quality", val: pct(scoring.draft_quality_indicator) },
    { label: "Past win rate", val: pct(scoring.past_win_rate_similar_domain) },
  ];
  const win = Math.round((scoring.win_probability ?? 0) * 100);
  const go = scoring.go_no_go_recommendation === "GO";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3">
      <Panel title="Win score">
        <div className="flex flex-col items-start">
          <div className="tracking-tight" style={{ fontSize: 48, fontWeight: 600, lineHeight: 1 }}>
            {win}%
          </div>
          <div className="text-muted-foreground mt-1" style={{ fontSize: 11 }}>
            Win probability
          </div>
          <div
            className="mt-4 rounded-md w-full px-2.5 py-2 border"
            style={{
              background: go ? "var(--accent-green-bg)" : "var(--accent-red-bg)",
              borderColor: go ? "rgba(99,153,34,0.28)" : "rgba(226,75,74,0.28)",
              borderWidth: "0.5px",
            }}
          >
            <div className="flex items-center gap-2">
              <IconCircleCheck size={13} style={{ color: go ? "var(--accent-green)" : "var(--accent-red)" }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{scoring.go_no_go_recommendation}</span>
            </div>
            <div className="text-muted-foreground mt-1" style={{ fontSize: 11 }}>
              {scoring.go_no_go_rationale}
            </div>
          </div>
          {scoring.critical_gaps.length > 0 && (
            <div className="mt-3 w-full">
              <div className="text-text-tertiary uppercase mb-1" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
                Critical gaps
              </div>
              <ul className="space-y-1 list-disc pl-4 text-muted-foreground" style={{ fontSize: 11 }}>
                {scoring.critical_gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Panel>
      <Panel title="Scoring criteria">
        <div className="h-[220px] -mt-2 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={criteria.map((c) => ({ subject: c.label, A: c.val }))}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
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
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1" style={{ fontSize: 12 }}>
                <span>{c.label}</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>
                  {c.val}
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
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
