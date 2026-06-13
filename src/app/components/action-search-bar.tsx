import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconSearch,
  IconClock,
  IconArrowRight,
  IconCornerDownLeft,
  IconCommand,
  IconChevronUp,
  IconChevronDown,
  IconX,
  IconFileText,
  IconLoader2,
  IconStar,
  IconExternalLink,
  IconBolt,
} from "@tabler/icons-react";

export type BidResult = {
  id: string;
  title: string;
  owner: string;
  category: string;
  year: number;
  amount: string;
  due: string;
  status: "go" | "nogo" | "draft" | "won" | "lost";
  thumbHue: number;
};

export type ActionItem = {
  id: string;
  label: string;
  group: string;
  hint?: string;
  icon?: ReactNode;
  shortcut?: string;
  onRun: () => void;
};

const RECENTS_KEY = "bidforge.search.recents.v1";

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecents(list: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* ignore */
  }
}

function statusTone(s: BidResult["status"]) {
  switch (s) {
    case "go":
      return { bg: "rgba(99,153,34,0.14)", fg: "var(--accent-green)", label: "Go" };
    case "won":
      return { bg: "rgba(99,153,34,0.14)", fg: "var(--accent-green)", label: "Won" };
    case "nogo":
      return { bg: "rgba(220,69,69,0.14)", fg: "var(--accent-red)", label: "No-go" };
    case "lost":
      return { bg: "rgba(220,69,69,0.14)", fg: "var(--accent-red)", label: "Lost" };
    default:
      return { bg: "rgba(186,117,23,0.14)", fg: "var(--accent-amber)", label: "Draft" };
  }
}

/* ---------------- Inline trigger ---------------- */
export function ActionSearchBar({
  onOpen,
  placeholder = "Search bids, actions, people…",
}: {
  onOpen: () => void;
  placeholder?: string;
}) {
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className="group hidden md:flex items-center gap-2 rounded-md bg-card border border-border/80 hover:border-border transition-colors text-left"
      style={{
        height: 30,
        borderWidth: "0.5px",
        width: 280,
        paddingInline: 10,
      }}
      aria-label="Open search"
    >
      <IconSearch size={13} className="text-text-tertiary" />
      <span className="flex-1 truncate text-muted-foreground" style={{ fontSize: 12 }}>
        {placeholder}
      </span>
      <span
        className="inline-flex items-center gap-0.5 rounded border border-border/80 px-1.5 py-0.5 text-text-tertiary"
        style={{ fontSize: 10, borderWidth: "0.5px" }}
      >
        {isMac ? <IconCommand size={9} /> : "Ctrl"}
        <span>K</span>
      </span>
    </motion.button>
  );
}

/* ---------------- Spotlight palette ---------------- */
export function ActionSearchPalette({
  open,
  onClose,
  bids,
  actions,
  onOpenBid,
  onQuickAction,
}: {
  open: boolean;
  onClose: () => void;
  bids: BidResult[];
  actions: ActionItem[];
  onOpenBid: (bid: BidResult) => void;
  onQuickAction?: (bid: BidResult, kind: "favorite" | "export") => void;
}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setDebounced("");
      setActive(0);
      setRecents(readRecents());
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!q) {
      setDebounced("");
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      setDebounced(q);
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  const norm = debounced.trim().toLowerCase();

  const matchedBids = useMemo(() => {
    if (!norm) return [] as BidResult[];
    return bids
      .filter((b) =>
        [b.id, b.title, b.owner, b.category, String(b.year)]
          .join(" ")
          .toLowerCase()
          .includes(norm)
      )
      .slice(0, 5);
  }, [bids, norm]);

  const matchedActions = useMemo(() => {
    if (!norm) return actions.slice(0, 6);
    return actions
      .filter((a) =>
        [a.label, a.group, a.hint ?? ""].join(" ").toLowerCase().includes(norm)
      )
      .slice(0, 8);
  }, [actions, norm]);

  type Row =
    | { kind: "bid"; bid: BidResult }
    | { kind: "action"; action: ActionItem }
    | { kind: "recent"; text: string };

  const rows: Row[] = useMemo(() => {
    if (loading) return [];
    if (!norm) {
      const r: Row[] = recents.map((text) => ({ kind: "recent", text }));
      matchedActions.forEach((a) => r.push({ kind: "action", action: a }));
      return r;
    }
    const r: Row[] = [];
    matchedBids.forEach((b) => r.push({ kind: "bid", bid: b }));
    matchedActions.forEach((a) => r.push({ kind: "action", action: a }));
    return r;
  }, [loading, norm, recents, matchedActions, matchedBids]);

  useEffect(() => setActive(0), [rows.length]);

  const commit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recents.filter((r) => r !== trimmed)].slice(0, 6);
    setRecents(next);
    writeRecents(next);
  };

  const runRow = (row: Row) => {
    if (row.kind === "bid") {
      commit(row.bid.id);
      onOpenBid(row.bid);
      onClose();
    } else if (row.kind === "action") {
      if (norm) commit(debounced);
      row.action.onRun();
      onClose();
    } else {
      setQ(row.text);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(Math.max(rows.length - 1, 0), a + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[active];
        if (row) runRow(row);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-row="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const showEmpty = !loading && norm && rows.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 30%, rgba(24,95,165,0.18), rgba(0,0,0,0.55))",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: -16, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] rounded-2xl overflow-hidden border border-border/80"
            style={{
              borderWidth: "0.5px",
              background: "color-mix(in srgb, var(--card) 92%, transparent)",
              backdropFilter: "blur(14px)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset",
            }}
          >
            <div
              className="flex items-center gap-2.5 px-4 py-3 border-b border-border/70"
              style={{ borderBottomWidth: "0.5px" }}
            >
              {loading ? (
                <IconLoader2 size={15} className="text-accent-blue animate-spin" />
              ) : (
                <IconSearch size={15} className="text-text-tertiary" />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search bids, owners, actions…"
                className="flex-1 bg-transparent outline-none placeholder:text-text-tertiary"
                style={{ fontSize: 14 }}
                aria-label="Search input"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="w-5 h-5 rounded-md hover:bg-secondary flex items-center justify-center text-text-tertiary"
                  aria-label="Clear"
                >
                  <IconX size={12} />
                </button>
              )}
              <span
                className="rounded border border-border/80 text-text-tertiary px-1.5 py-0.5"
                style={{ fontSize: 10, borderWidth: "0.5px" }}
              >
                ESC
              </span>
            </div>

            <div
              ref={listRef}
              className="max-h-[58vh] overflow-y-auto py-1.5"
              role="listbox"
            >
              {loading && (
                <div className="px-4 py-10 flex flex-col items-center gap-2 text-text-tertiary">
                  <IconLoader2 size={18} className="animate-spin" />
                  <span style={{ fontSize: 12 }}>Searching…</span>
                </div>
              )}

              {!loading && !norm && recents.length > 0 && (
                <SectionHeader title="Recent" />
              )}

              {!loading &&
                rows.map((row, i) => {
                  const isActive = i === active;
                  if (row.kind === "recent") {
                    return (
                      <Row
                        key={`r-${row.text}`}
                        index={i}
                        active={isActive}
                        onHover={() => setActive(i)}
                        onClick={() => runRow(row)}
                        icon={<IconClock size={13} className="text-text-tertiary" />}
                        title={row.text}
                        meta="Recent search"
                        trailing={
                          <IconArrowRight size={12} className="text-text-tertiary" />
                        }
                      />
                    );
                  }
                  if (row.kind === "bid") {
                    const b = row.bid;
                    const tone = statusTone(b.status);
                    const showHeader =
                      i === 0 ||
                      rows[i - 1].kind !== "bid";
                    return (
                      <div key={`b-${b.id}`}>
                        {showHeader && <SectionHeader title="Bids" />}
                        <Row
                          index={i}
                          active={isActive}
                          onHover={() => setActive(i)}
                          onClick={() => runRow(row)}
                          icon={
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, hsl(${b.thumbHue} 70% 55% / 0.22), hsl(${b.thumbHue + 30} 70% 45% / 0.32))`,
                                color: `hsl(${b.thumbHue} 70% 75%)`,
                              }}
                            >
                              <IconFileText size={14} />
                            </div>
                          }
                          title={
                            <span className="flex items-center gap-2">
                              <span style={{ fontWeight: 500 }}>{b.title}</span>
                              <span
                                className="rounded px-1.5 py-0.5"
                                style={{
                                  fontSize: 9.5,
                                  background: tone.bg,
                                  color: tone.fg,
                                  fontWeight: 600,
                                }}
                              >
                                {tone.label}
                              </span>
                            </span>
                          }
                          meta={`${b.id} · ${b.owner} · ${b.category} · ${b.amount} · due ${b.due}`}
                          trailing={
                            <span className="flex items-center gap-1">
                              <QuickIcon
                                title="Favorite"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickAction?.(b, "favorite");
                                }}
                              >
                                <IconStar size={12} />
                              </QuickIcon>
                              <QuickIcon
                                title="Open in new tab"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickAction?.(b, "export");
                                }}
                              >
                                <IconExternalLink size={12} />
                              </QuickIcon>
                            </span>
                          }
                        />
                      </div>
                    );
                  }
                  const a = row.action;
                  const showHeader =
                    i === 0 ||
                    rows[i - 1].kind !== "action" ||
                    (i > 0 &&
                      rows[i - 1].kind === "action" &&
                      (rows[i - 1] as { action: ActionItem }).action.group !== a.group);
                  return (
                    <div key={`a-${a.id}`}>
                      {showHeader && <SectionHeader title={a.group} />}
                      <Row
                        index={i}
                        active={isActive}
                        onHover={() => setActive(i)}
                        onClick={() => runRow(row)}
                        icon={
                          a.icon ? (
                            <span className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-foreground">
                              {a.icon}
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-foreground">
                              <IconBolt size={13} />
                            </span>
                          )
                        }
                        title={a.label}
                        meta={a.hint}
                        trailing={
                          a.shortcut ? (
                            <span
                              className="rounded border border-border/80 text-text-tertiary px-1.5 py-0.5"
                              style={{ fontSize: 10, borderWidth: "0.5px" }}
                            >
                              {a.shortcut}
                            </span>
                          ) : null
                        }
                      />
                    </div>
                  );
                })}

              {showEmpty && (
                <div className="px-4 py-12 text-center">
                  <div
                    className="mx-auto mb-3 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-text-tertiary"
                  >
                    <IconSearch size={16} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    No matches for “{debounced}”
                  </div>
                  <div className="text-text-tertiary mt-1" style={{ fontSize: 11 }}>
                    Try a bid ID, owner name, or category.
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-center justify-between gap-4 px-4 py-2 border-t border-border/70 text-text-tertiary"
              style={{ borderTopWidth: "0.5px", fontSize: 10 }}
            >
              <div className="flex items-center gap-3">
                <Footnote icon={<IconChevronUp size={10} />} label="Up" />
                <Footnote icon={<IconChevronDown size={10} />} label="Down" />
                <Footnote icon={<IconCornerDownLeft size={10} />} label="Open" />
              </div>
              <div>
                {rows.length} result{rows.length === 1 ? "" : "s"}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="px-3 pt-2.5 pb-1 text-text-tertiary uppercase"
      style={{ fontSize: 10, letterSpacing: "0.06em", fontWeight: 600 }}
    >
      {title}
    </div>
  );
}

function Row({
  index,
  active,
  onHover,
  onClick,
  icon,
  title,
  meta,
  trailing,
}: {
  index: number;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
  icon: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      data-row={index}
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onClick}
      className="relative w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
      style={{
        background: active ? "color-mix(in srgb, var(--foreground) 6%, transparent)" : "transparent",
      }}
    >
      {active && (
        <motion.span
          layoutId="action-row-cursor"
          className="absolute left-1.5 top-1.5 bottom-1.5 w-[2px] rounded-full"
          style={{ background: "var(--accent-blue)" }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {icon}
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13 }}>{title}</div>
        {meta && (
          <div
            className="text-text-tertiary truncate"
            style={{ fontSize: 11 }}
          >
            {meta}
          </div>
        )}
      </div>
      {trailing}
    </button>
  );
}

function QuickIcon({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center text-text-tertiary hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

function Footnote({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-border/80" style={{ borderWidth: "0.5px" }}>
        {icon}
      </span>
      {label}
    </span>
  );
}
