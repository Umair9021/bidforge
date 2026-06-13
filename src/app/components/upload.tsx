import { useRef, useState } from "react";
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
  status: "done" | "processing";
};

const initial: FileRow[] = [
  { name: "RFP-2031-SolicitationPackage.pdf", size: "4.8 MB", icon: IconFileTypePdf, color: "var(--accent-red)", status: "done" },
  { name: "Attachment-A-Tech-Requirements.docx", size: "1.2 MB", icon: IconFileTypeDocx, color: "var(--accent-blue)", status: "done" },
  { name: "Attachment-B-Pricing-Schedule.xlsx", size: "284 KB", icon: IconFileTypeXls, color: "var(--accent-green)", status: "done" },
  { name: "Amendment-01.pdf", size: "612 KB", icon: IconFileTypePdf, color: "var(--accent-red)", status: "processing" },
];

const stages = [
  { icon: IconBrain, label: "Document parse", status: "done", note: "4 files, 312 pages", pct: 100 },
  { icon: IconCalendarTime, label: "Deadline extraction", status: "done", note: "12 dates found", pct: 100 },
  { icon: IconScale, label: "Evaluation weights", status: "done", note: "4 criteria mapped", pct: 100 },
  { icon: IconShieldCheck, label: "Compliance clauses", status: "processing", note: "27/34 mapped", pct: 78 },
];

function iconFor(name: string): { icon: any; color: string } {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { icon: IconFileTypePdf, color: "var(--accent-red)" };
  if (ext === "docx" || ext === "doc") return { icon: IconFileTypeDocx, color: "var(--accent-blue)" };
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return { icon: IconFileTypeXls, color: "var(--accent-green)" };
  return { icon: IconFileTypePdf, color: "var(--text-tertiary)" };
}

export function Upload({ onOpen }: { onOpen?: (v: ViewKey) => void }) {
  const [files, setFiles] = useState<FileRow[]>(initial);
  const [form, setForm] = useState({
    name: "DOT Infrastructure Modernization",
    client: "US Dept. of Transportation",
    manager: "Maya Kapoor",
    value: "$4.2M",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const onFilesPicked = (list: FileList | null) => {
    if (!list || !list.length) return;
    const next: FileRow[] = Array.from(list).map((f) => {
      const { icon, color } = iconFor(f.name);
      return {
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
        icon,
        color,
        status: "processing",
      };
    });
    setFiles((prev) => [...prev, ...next]);
    toast.success(`${next.length} file${next.length > 1 ? "s" : ""} queued`, {
      description: "NER pipeline starting...",
    });
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => (next.find((n) => n.name === f.name) ? { ...f, status: "done" } : f))
      );
      toast.success("Parsing complete", { description: `${next.length} new file(s) processed` });
    }, 1800);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFilesPicked(e.dataTransfer.files);
  };

  const remove = (name: string) => {
    setFiles((f) => f.filter((x) => x.name !== name));
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
                    <div className="text-text-tertiary" style={{ fontSize: 10 }}>{f.size}</div>
                  </div>
                  {f.status === "done" ? (
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: 11, color: "var(--accent-green)" }}
                    >
                      <IconCircleCheckFilled size={12} />
                      <span className="hidden sm:inline">Parsed</span>
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      <IconLoader2 size={12} className="animate-spin" />
                      <span className="hidden sm:inline">Processing</span>
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
          {stages.map((s) => {
            const Icon = s.icon;
            const done = s.status === "done";
            return (
              <div key={s.label} className="flex items-start gap-2.5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: done ? "var(--accent-green-bg)" : "var(--secondary)",
                    color: done ? "var(--accent-green)" : "var(--text-tertiary)",
                  }}
                >
                  <Icon size={13} stroke={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{s.label}</span>
                    {done ? (
                      <IconCircleCheckFilled size={12} style={{ color: "var(--accent-green)" }} />
                    ) : (
                      <IconLoader2 size={12} className="animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-text-tertiary" style={{ fontSize: 11 }}>{s.note}</div>
                  <div
                    className="mt-1.5 w-full rounded-full bg-muted overflow-hidden"
                    style={{ height: 4 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.pct}%`, background: "var(--accent-green)" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="px-4 py-2.5 border-t border-border/80 flex items-center justify-between"
          style={{ borderTopWidth: "0.5px" }}
        >
          <span className="text-text-tertiary" style={{ fontSize: 11 }}>ETA &lt; 30s</span>
          <OutlineButton
            onClick={() =>
              toast("Raw NER output", {
                description: '{"entities":[{"type":"DEADLINE","value":"2026-07-14"}, ...]}',
              })
            }
          >
            View raw
          </OutlineButton>
        </div>
      </div>
    </div>
  );
}
