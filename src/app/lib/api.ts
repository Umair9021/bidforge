const BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://latex-auto-mae-celebrity.trycloudflare.com/api";

export type RfpStatus =
  | "pending"
  | "extracting"
  | "ner"
  | "retrieving"
  | "drafting"
  | "scoring"
  | "complete"
  | "failed";

export type RfpStatusResponse = {
  rfp_id: string;
  status: RfpStatus;
  progress: number | null;
};

export type RfpListItem = {
  rfp_id: string;
  status: string;
  created_at: string;
};

export type NerOutput = {
  deadlines: Array<{ label: string; date_text: string }>;
  budget_figures: Array<{ label: string; amount_text: string; currency: string }>;
  evaluation_weights: Array<{ criterion: string; weight_percent: number | null }>;
  compliance_clauses: string[];
  mandatory_requirements: string[];
  evaluation_criteria: Array<{ criterion: string; weight_percent: number | null }>;
};

export type DraftSection = {
  heading: string;
  original_rfp_text: string;
  drafted_response: string;
  evidence_used: string[];
  has_placeholders: boolean;
};

export type ComplianceItem = {
  requirement: string;
  status: "MET" | "NOT_MET" | "PARTIAL" | "UNKNOWN";
  evidence_reference: string | null;
  notes: string;
};

export type ScoringOutput = {
  win_probability: number;
  go_no_go_recommendation: "GO" | "NO-GO";
  go_no_go_rationale: string;
  critical_gaps: string[];
  capability_coverage_score: number;
  budget_alignment_score: number;
  compliance_completeness_score: number;
  draft_quality_indicator: number;
  past_win_rate_similar_domain: number;
  competitor_presence_flag: boolean;
  dimension_scores: Record<string, number>;
  historical_benchmarks: Record<string, number>;
};

export type RfpResult = {
  rfp_id: string;
  status: "complete";
  error: null;
  raw_text: string;
  sections: Array<{ heading: string; content: string; page: number }>;
  ner_output: NerOutput;
  retrieval_output: {
    matched_capabilities: Array<{
      requirement: string;
      top_matches: Array<{
        cap_id: string;
        domain: string;
        document: string;
        dense_score: number;
        fused_score: number;
      }>;
    }>;
    gap_flags: Array<{
      requirement: string;
      reason: string;
      severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    }>;
  };
  draft_output: {
    sections: DraftSection[];
    compliance_checklist: ComplianceItem[];
    missing_evidence: string[];
  };
  scoring_output: ScoringOutput;
};

export type ApiError = {
  error: string;
  message: string;
  rfp_id: string | null;
  detail: Record<string, unknown>;
};

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    throw new Error(body.message || body.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  base: BASE,

  health: () => fetch(`${BASE}/health`).then(j<{ status: string }>),

  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${BASE}/rfp/upload`, { method: "POST", body: fd }).then(
      j<{ rfp_id: string; status: "pending" }>
    );
  },

  status: (id: string) =>
    fetch(`${BASE}/rfp/${id}/status`).then(j<RfpStatusResponse>),

  result: (id: string) => fetch(`${BASE}/rfp/${id}/result`).then(j<RfpResult>),

  draft: (id: string) =>
    fetch(`${BASE}/rfp/${id}/draft`).then(
      j<{ sections: DraftSection[]; compliance_checklist: ComplianceItem[]; missing_evidence: string[] }>
    ),

  scoring: (id: string) =>
    fetch(`${BASE}/rfp/${id}/scoring`).then(j<ScoringOutput>),

  compliance: (id: string) =>
    fetch(`${BASE}/rfp/${id}/compliance`).then(j<ComplianceItem[]>),

  list: (skip = 0, limit = 100) =>
    fetch(`${BASE}/rfp/list?skip=${skip}&limit=${limit}`).then(j<RfpListItem[]>),

  editSection: (id: string, index: number, drafted_response: string) =>
    fetch(`${BASE}/rfp/${id}/draft/sections/${index}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drafted_response }),
    }).then(j<DraftSection>),

  delete: (id: string) =>
    fetch(`${BASE}/rfp/${id}`, { method: "DELETE" }).then(j<{ ok: true }>),
};

const NAME_KEY = "bidforge:rfp-names";

type NameMap = Record<string, string>;

function readNames(): NameMap {
  try {
    return JSON.parse(localStorage.getItem(NAME_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeNames(map: NameMap) {
  try {
    localStorage.setItem(NAME_KEY, JSON.stringify(map));
  } catch {}
}

export const rfpNames = {
  get(id: string): string | undefined {
    return readNames()[id];
  },
  set(id: string, name: string) {
    const map = readNames();
    map[id] = name;
    writeNames(map);
  },
  remove(id: string) {
    const map = readNames();
    delete map[id];
    writeNames(map);
  },
  findIdByName(name: string): string | undefined {
    const map = readNames();
    return Object.keys(map).find((k) => map[k] === name);
  },
  all(): NameMap {
    return readNames();
  },
};

export function pollStatus(
  id: string,
  onTick: (s: RfpStatusResponse) => void,
  intervalMs = 3000
): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = async () => {
    if (cancelled) return;
    try {
      const s = await api.status(id);
      if (cancelled) return;
      onTick(s);
      if (s.status === "complete" || s.status === "failed") return;
    } catch {
      // swallow; keep polling
    }
    timer = setTimeout(tick, intervalMs);
  };

  tick();
  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}
