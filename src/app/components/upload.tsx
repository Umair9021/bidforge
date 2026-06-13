import { useEffect, useRef, useState } from "react";
import { api, pollStatus, rfpNames, type RfpStatus } from "../lib/api";
import {
  IconUpload,
  IconFileTypePdf,
  IconFileTypeDocx,
  IconFileTypeXls,
  IconCircleCheckFilled,
  IconLoader2,
  IconBrain,
  IconScale,
  IconCalendarTime,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { OutlineButton, type ViewKey } from "./shell";

type FileRow = {
  name: string;
  size: string;
  icon: any;
  color: string;
  status: "done" | "processing" | "failed";
  rfpId?: string;
  progress?: number;
  stage?: RfpStatus;
  error?: string;
};

const initial: FileRow[] = [];

const PIPELINE: { stage: RfpStatus; label: string; icon: any; pct: number }[] = [
  { stage: "pending", label: "Queued", icon: IconBrain, pct: 0 },
  { stage: "extracting", label: "Document parse", icon: IconBrain, pct: 15 },
  { stage: "ner", label: "Entity extraction", icon: IconCalendarTime, pct: 30 },
  { stage: "retrieving", label: "Capability matching", icon: IconScale, pct: 50 },
  { stage: "drafting", label: "Drafting response", icon: IconBrain, pct: 70 },
  { stage: "scoring", label: "Win scoring", icon: IconShieldCheck, pct: 85 },
  { stage: "complete", label: "Complete", icon: IconShieldCheck, pct: 100 },
];

function iconFor(name: string): { icon: any; color: string } {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { icon: IconFileTypePdf, color: "var(--accent-red)" };
  if (ext === "docx" || ext === "doc") return { icon: IconFileTypeDocx, color: "var(--accent-blue)" };
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return { icon: IconFileTypeXls, color: "var(--accent-green)" };
  return { icon: IconFileTypePdf, color: "var(--text-tertiary)" };
}

export function Upload({ onOpen, onUploaded }: { onOpen?: (v: ViewKey) => void; onUploaded?: () => void }) {
  const [files, setFiles] = useState<FileRow[]>(initial);
  const [form, setForm] = useState({ name: "", client: "", manager: "", value: "" });
  const inputRef = useRef<HTMLInputElement>(null);
  const stoppers = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    return () => {
      stoppers.current.forEach((stop) => stop());
      stoppers.current.clear();
    };
  }, []);

  const onFilesPicked = async (list: FileList | null) => {
    if (!list || !list.length) return;
    const picks = Array.from(list);
    const queued: FileRow[] = picks.map((f) => {
      const { icon, color } = iconFor(f.name);
      return {
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
        icon,
        color,
        status: "processing",
        progress: 0,
        stage: "pending",
      };
    });
    setFiles((prev) => [...prev, ...queued]);
    toast.success(`${picks.length} file${picks.length > 1 ? "s" : ""} queued`, {
      description: "Uploading to extraction pipeline...",
    });

    for (const file of picks) {
      try {
        const { rfp_id } = await api.upload(file);
        rfpNames.set(rfp_id, file.name);
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name ? { ...f, rfpId: rfp_id } : f))
        );
        onUploaded?.();
        const stop = pollStatus(rfp_id, (s) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.rfpId === rfp_id
                ? {
                    ...f,
                    stage: s.status,
                    progress: s.progress ?? f.progress,
                    status:
                      s.status === "complete"
                        ? "done"
                        : s.status === "failed"
                        ? "failed"
                        : "processing",
                  }
                : f
            )
          );
          if (s.status === "complete") {
            toast.success("Parsing complete", { description: file.name });
            stoppers.current.delete(rfp_id);
          } else if (s.status === "failed") {
            api
              .result(rfp_id)
              .then((r: any) => {
                const reason = r?.error || "Backend processing failed";
                setFiles((prev) =>
                  prev.map((f) => (f.rfpId === rfp_id ? { ...f, error: reason } : f))
                );
                toast.error("Parsing failed", { description: `${file.name}: ${reason}` });
              })
              .catch((e) => {
                setFiles((prev) =>
                  prev.map((f) => (f.rfpId === rfp_id ? { ...f, error: e?.message ?? "Failed" } : f))
                );
                toast.error("Parsing failed", { description: file.name });
              });
            stoppers.current.delete(rfp_id);
          }
        });
        stoppers.current.set(rfp_id, stop);
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: "failed", error: err?.message ?? "Upload failed" }
              : f
          )
        );
        toast.error("Upload failed", { description: err?.message ?? file.name });
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFilesPicked(e.dataTransfer.files);
  };

  const remove = (name: string) => {
    setFiles((prev) => {
      const row = prev.find((x) => x.name === name);
      if (row?.rfpId) {
        stoppers.current.get(row.rfpId)?.();
        stoppers.current.delete(row.rfpId);
        api.delete(row.rfpId).catch(() => {});
        rfpNames.remove(row.rfpId);
      }
      return prev.filter((x) => x.name !== name);
    });
    toast(`Removed ${name}`);
  };

  const create = () => {
    if (!form.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    toast.success(`Workspace "${form.name}" created`, {
      description: `${files.length} files attached`,
    });
    onOpen?.("workspace");
  };

  return (
    <div className="px-3 sm:px-4 lg:px-5 py-6 sm:py-8 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
      <div className="space-y-3">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-card border border-dashed border-border rounded-xl p-6 sm:p-8 text-center"
          style={{ borderWidth: "1px" }}
        >
          <div
            className="w-10 h-10 rounded-md mx-auto bg-secondary border border-border/80 flex items-center justify-center mb-3"
            style={{ borderWidth: "0.5px" }}
          >
            <IconUpload size={16} stroke={1.75} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Drop RFP, RFQ, or tender files</div>
          <div className="text-muted-foreground mt-1" style={{ fontSize: 11 }}>
            PDF, DOCX, XLSX, ZIP · up to 200MB · entities auto-extracted
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFilesPicked(e.target.files)}
          />
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <OutlineButton tone="primary" icon={IconUpload} onClick={() => inputRef.current?.click()}>
              Choose files
            </OutlineButton>
            <OutlineButton
              onClick={() => {
                const url = window.prompt("Paste document URL:");
                if (url) toast.success("URL queued", { description: url });
              }}
            >
              Paste URL
            </OutlineButton>
          </div>
        </div>

        <div
          className="bg-card border border-border/80 rounded-xl overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <div
            className="px-3 sm:px-4 py-2.5 border-b border-border/80 flex items-center justify-between"
            style={{ borderBottomWidth: "0.5px" }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 600 }}>Uploaded files</h3>
            <span className="text-text-tertiary" style={{ fontSize: 11 }}>
              {files.length} files
            </span>
          </div>
          <div className="divide-y divide-border/80">
            {files.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.name}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 hover:bg-secondary group"
                >
                  <Icon size={16} stroke={1.5} style={{ color: f.color }} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate" style={{ fontSize: 12 }}>{f.name}</div>
                    <div className="text-text-tertiary" style={{ fontSize: 10 }}>
                      {f.size}
                      {f.status === "failed" && (
                        <span style={{ color: "var(--accent-red)" }}>
                          {" · "}
                          {f.error ?? "Backend processing failed"}
                        </span>
                      )}
                    </div>
                  </div>
                  {f.status === "done" ? (
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: 11, color: "var(--accent-green)" }}
                    >
                      <IconCircleCheckFilled size={12} />
                      <span className="hidden sm:inline">Parsed</span>
                    </span>
                  ) : f.status === "failed" ? (
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: 11, color: "var(--accent-red)" }}
                      title={f.error}
                    >
                      <IconX size={12} />
                      <span className="hidden sm:inline">Failed</span>
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      <IconLoader2 size={12} className="animate-spin" />
                      <span className="hidden sm:inline">
                        {f.stage ?? "Processing"}
                        {typeof f.progress === "number" ? ` ${f.progress}%` : ""}
                      </span>
                    </span>
                  )}
                  <button
                    onClick={() => remove(f.name)}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-card flex items-center justify-center text-muted-foreground"
                    aria-label="Remove file"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              );
            })}
            {files.length === 0 && (
              <div className="px-4 py-6 text-center text-muted-foreground" style={{ fontSize: 12 }}>
                No files yet — drop some above.
              </div>
            )}
          </div>
        </div>

        <div
          className="bg-card border border-border/80 rounded-xl"
          style={{ borderWidth: "0.5px" }}
        >
          <div
            className="px-3 sm:px-4 py-2.5 border-b border-border/80"
            style={{ borderBottomWidth: "0.5px" }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 600 }}>Workspace metadata</h3>
          </div>
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { k: "name", l: "Workspace name" },
              { k: "client", l: "Client" },
              { k: "manager", l: "Bid manager" },
              { k: "value", l: "Estimated value" },
            ].map((f) => (
              <div key={f.k}>
                <label className="block text-muted-foreground mb-1" style={{ fontSize: 11 }}>
                  {f.l}
                </label>
                <input
                  value={(form as any)[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-md bg-card border border-border/80 outline-none focus:border-accent-blue"
                  style={{ fontSize: 12, borderWidth: "0.5px" }}
                />
              </div>
            ))}
          </div>
          <div
            className="px-3 sm:px-4 py-2.5 border-t border-border/80 flex justify-end gap-2"
            style={{ borderTopWidth: "0.5px" }}
          >
            <OutlineButton onClick={() => onOpen?.("dashboard")}>Cancel</OutlineButton>
            <OutlineButton tone="primary" onClick={create}>
              Create workspace
            </OutlineButton>
          </div>
        </div>
      </div>

      <div
        className="bg-card border border-border/80 rounded-xl h-fit"
        style={{ borderWidth: "0.5px" }}
      >
        <div
          className="px-4 py-2.5 border-b border-border/80"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 600 }}>Extraction pipeline</h3>
          <div className="text-text-tertiary" style={{ fontSize: 11 }}>
            real-time NER + clause matcher
          </div>
        </div>
        <div className="p-4 space-y-3">
          {files.filter((f) => f.status !== "done").length === 0 && (
            <div className="text-text-tertiary" style={{ fontSize: 11 }}>
              No active uploads.
            </div>
          )}
          {files
            .filter((f) => f.status === "processing" || f.status === "failed")
            .map((f) => {
              const currentIdx = PIPELINE.findIndex((p) => p.stage === f.stage);
              return (
                <div key={f.name} className="space-y-2">
                  <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                    <span className="truncate flex-1" style={{ fontWeight: 500 }}>{f.name}</span>
                    <span className="text-text-tertiary tabular-nums" style={{ fontSize: 11 }}>
                      {f.progress ?? 0}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {PIPELINE.filter((p) => p.stage !== "pending" && p.stage !== "complete").map((p, idx) => {
                      const done = currentIdx > idx + 1 || f.stage === "complete";
                      const active = currentIdx === idx + 1;
                      return (
                        <div key={p.stage} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                            style={{
                              background: done
                                ? "var(--accent-green-bg)"
                                : active
                                ? "var(--accent-blue-bg)"
                                : "var(--secondary)",
                              color: done
                                ? "var(--accent-green)"
                                : active
                                ? "var(--accent-blue)"
                                : "var(--text-tertiary)",
                            }}
                          >
                            {done ? (
                              <IconCircleCheckFilled size={11} />
                            ) : active ? (
                              <IconLoader2 size={11} className="animate-spin" />
                            ) : (
                              <p.icon size={11} stroke={1.75} />
                            )}
                          </div>
                          <span className={done || active ? "" : "text-text-tertiary"}>{p.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
