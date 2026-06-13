import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { IconX, IconBell, IconChevronRight, IconSearch, IconSun, IconMoon, IconCornerDownLeft } from "@tabler/icons-react";

/* ============== Animation primitives ============== */

export function CountUp({
  to,
  from = 0,
  duration = 1.2,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(
    spring,
    (v) => `${prefix}${v.toFixed(decimals)}${suffix}`
  );
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to]);
  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.03,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: delay + i * stagger,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function BlurText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      className={className}
      initial={{ filter: "blur(6px)", opacity: 0, y: 4 }}
      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}

export function ShinyText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        backgroundImage:
          "linear-gradient(110deg, currentColor 35%, rgba(255,255,255,0.85) 50%, currentColor 65%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shine 2.6s linear infinite",
      }}
    >
      {text}
    </span>
  );
}

export function GradientText({
  children,
  className = "",
  colors = ["#185fa5", "#639922", "#ba7517", "#185fa5"],
}: {
  children: ReactNode;
  className?: string;
  colors?: string[];
}) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "gradientShift 6s ease infinite",
      }}
    >
      {children}
    </span>
  );
}

export function AnimatedList({
  children,
  stagger = 0.05,
  className = "",
}: {
  children: ReactNode[];
  stagger?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ delay: i * stagger, duration: 0.35, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

export function ClickSpark({
  children,
  color = "#185fa5",
}: {
  children: ReactNode;
  color?: string;
}) {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const handle = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setSparks((s) => [...s, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setSparks((s) => s.filter((sp) => sp.id !== id)), 600);
  };
  return (
    <div className="relative inline-block" onClick={handle}>
      {children}
      {sparks.map((sp) => (
        <span
          key={sp.id}
          className="pointer-events-none absolute"
          style={{ left: sp.x, top: sp.y }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute block rounded-full"
                style={{ width: 3, height: 3, background: color }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * 18,
                  y: Math.sin(angle) * 18,
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

export function FadeContent({
  children,
  delay = 0,
  y = 8,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function Magnet({
  children,
  strength = 0.2,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============== Built-in components ============== */

/* ----- NotificationBar ----- */
export function NotificationBar({
  messages,
  interval = 4500,
  onAction,
}: {
  messages: { icon?: ReactNode; text: string; cta?: string }[];
  interval?: number;
  onAction?: (i: number) => void;
}) {
  const [i, setI] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (dismissed || messages.length <= 1) return;
    const t = setInterval(() => setI((x) => (x + 1) % messages.length), interval);
    return () => clearInterval(t);
  }, [messages.length, interval, dismissed]);

  if (dismissed) return null;
  const m = messages[i];
  return (
    <div
      className="w-full bg-foreground text-background overflow-hidden"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center gap-3 px-4 sm:px-5 py-2">
        <IconBell size={13} className="shrink-0 opacity-80" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 min-w-0"
            >
              <span className="truncate" style={{ fontSize: 12 }}>
                {m.text}
              </span>
              {m.cta && (
                <button
                  onClick={() => onAction?.(i)}
                  className="ml-auto inline-flex items-center gap-0.5 hover:opacity-80 shrink-0"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {m.cta} <IconChevronRight size={12} />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {messages.map((_, idx) => (
            <span
              key={idx}
              className="rounded-full transition-all"
              style={{
                width: idx === i ? 14 : 4,
                height: 4,
                background: idx === i ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <IconX size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----- Slider (range) — polished ----- */
export function RangeSlider({
  min = 0,
  max = 100,
  value,
  onChange,
  format = (v) => `${v}%`,
}: {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (v: number) => string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"lo" | "hi" | null>(null);
  const [active, setActive] = useState<"lo" | "hi" | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const onMove = (clientX: number) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.round(min + ratio * (max - min));
    const [lo, hi] = value;
    if (dragging.current === "lo") onChange([Math.min(v, hi), hi]);
    else onChange([lo, Math.max(v, lo)]);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => onMove(e.clientX);
    const touch = (e: TouchEvent) => e.touches[0] && onMove(e.touches[0].clientX);
    const up = () => {
      dragging.current = null;
      setActive(null);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", touch);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", touch);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  });

  const [lo, hi] = value;
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full select-none" style={{ paddingTop: 4, paddingBottom: 18 }}>
      <div
        ref={trackRef}
        className="relative w-full rounded-full"
        style={{
          height: 6,
          background:
            "linear-gradient(90deg, var(--accent-red) 0%, var(--accent-amber) 50%, var(--accent-green) 100%)",
          opacity: 0.18,
        }}
      >
        {/* Active range */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${pct(lo)}%`,
            width: `${pct(hi) - pct(lo)}%`,
            height: 6,
            top: 0,
            background:
              "linear-gradient(90deg, var(--accent-red) 0%, var(--accent-amber) 50%, var(--accent-green) 100%)",
            backgroundSize: `${100 / Math.max(0.01, (pct(hi) - pct(lo)) / 100)}% 100%`,
            backgroundPositionX: `${-pct(lo) * (100 / Math.max(0.01, (pct(hi) - pct(lo)) / 100)) / 100 * 100}%`,
          }}
        />
        {/* Ticks */}
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute rounded-full"
            style={{
              left: `${t}%`,
              top: -2,
              width: 1,
              height: 10,
              background: "rgba(0,0,0,0.12)",
              transform: "translateX(-50%)",
            }}
          />
        ))}

        {/* Handles */}
        {(["lo", "hi"] as const).map((handle) => {
          const v = handle === "lo" ? lo : hi;
          const isActive = active === handle;
          return (
            <div
              key={handle}
              className="absolute"
              style={{ left: `${pct(v)}%`, top: 3, transform: "translate(-50%, -50%)" }}
            >
              <motion.button
                whileTap={{ scale: 1.1 }}
                animate={{ scale: isActive ? 1.15 : 1 }}
                onMouseDown={() => {
                  dragging.current = handle;
                  setActive(handle);
                }}
                onTouchStart={() => {
                  dragging.current = handle;
                  setActive(handle);
                }}
                className="rounded-full bg-card shadow-md cursor-grab active:cursor-grabbing relative"
                style={{
                  width: 18,
                  height: 18,
                  borderWidth: "1.5px",
                  borderStyle: "solid",
                  borderColor: "var(--foreground)",
                  boxShadow: isActive
                    ? "0 0 0 6px rgba(24,95,165,0.12), 0 2px 6px rgba(0,0,0,0.15)"
                    : "0 1px 3px rgba(0,0,0,0.12)",
                }}
                aria-label={`${handle} handle`}
              />
              {/* Bubble label */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute pointer-events-none rounded-md bg-foreground text-background tabular-nums"
                    style={{
                      bottom: 26,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "3px 7px",
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {format(v)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Tick labels */}
        <div className="absolute left-0 right-0" style={{ top: 14 }}>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute text-text-tertiary tabular-nums"
              style={{
                left: `${t}%`,
                transform: "translateX(-50%)",
                fontSize: 10,
              }}
            >
              {format(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----- ThemeToggle ----- */
export function ThemeToggle({
  dark,
  onChange,
}: {
  dark: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={() => onChange(!dark)}
      className="relative rounded-full border border-border/80 bg-card overflow-hidden"
      style={{ width: 46, height: 24, borderWidth: "0.5px" }}
      aria-label="Toggle theme"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 rounded-full flex items-center justify-center"
        style={{
          width: 19,
          height: 19,
          left: dark ? 24 : 2,
          background: dark ? "var(--foreground)" : "#fff",
          color: dark ? "#fff" : "var(--foreground)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={dark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {dark ? <IconMoon size={11} stroke={2} /> : <IconSun size={11} stroke={2} />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

/* ----- AnimatedSearchBar ----- */
export function AnimatedSearchBar({
  onSubmit,
  placeholder = "Search anything…",
}: {
  onSubmit?: (q: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) onSubmit?.(q.trim());
      }}
      animate={{
        boxShadow: focused
          ? "0 0 0 3px rgba(24,95,165,0.12), 0 1px 3px rgba(0,0,0,0.06)"
          : "0 0 0 0 rgba(24,95,165,0), 0 0 0 0 rgba(0,0,0,0)",
      }}
      className="relative flex items-center rounded-md bg-card border border-border/80 transition-colors"
      style={{
        height: 30,
        borderWidth: "0.5px",
        borderColor: focused ? "var(--accent-blue)" : undefined,
        width: focused ? 280 : 220,
        transition: "width 220ms ease, border-color 180ms ease",
      }}
    >
      <IconSearch size={13} className="absolute left-2.5 text-text-tertiary pointer-events-none" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full pl-7 pr-16 h-full bg-transparent outline-none"
        style={{ fontSize: 12 }}
      />
      <span
        className="absolute right-2 inline-flex items-center gap-1 text-text-tertiary"
        style={{ fontSize: 10 }}
      >
        {q ? (
          <>
            <IconCornerDownLeft size={10} /> enter
          </>
        ) : (
          <span
            className="rounded border border-border/80 px-1"
            style={{ borderWidth: "0.5px" }}
          >
            ⌘K
          </span>
        )}
      </span>
    </motion.form>
  );
}

/* ----- MoveableSlider (draggable carousel) ----- */
export function MoveableSlider({
  children,
  itemWidth = 280,
  gap = 14,
}: {
  children: ReactNode[];
  itemWidth?: number;
  gap?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const measure = () => setContainerW(containerRef.current?.offsetWidth ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const totalW = children.length * (itemWidth + gap) - gap;
  const dragMax = 0;
  const dragMin = Math.min(0, containerW - totalW);
  const perPage = Math.max(1, Math.floor((containerW + gap) / (itemWidth + gap)));
  const pages = Math.max(1, Math.ceil(children.length / perPage));
  const x = useMotionValue(0);

  const goTo = (p: number) => {
    const clamped = Math.max(0, Math.min(pages - 1, p));
    setPage(clamped);
    const target = Math.max(dragMin, -clamped * perPage * (itemWidth + gap));
    x.set(target);
  };

  useEffect(() => {
    const unsub = x.on("change", (val) => {
      const p = Math.round(-val / ((itemWidth + gap) * perPage));
      setPage(Math.max(0, Math.min(pages - 1, p)));
    });
    return () => unsub();
  }, [perPage, pages, itemWidth, gap, x]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{ paddingBottom: 2, cursor: "grab" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: dragMin, right: dragMax }}
          dragElastic={0.08}
          dragMomentum={true}
          style={{ x, display: "flex", gap }}
          whileTap={{ cursor: "grabbing" }}
        >
          {children.map((c, i) => (
            <div key={i} style={{ width: itemWidth, flexShrink: 0 }}>
              {c}
            </div>
          ))}
        </motion.div>
      </div>
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === page ? 18 : 5,
                height: 5,
                background:
                  i === page ? "var(--foreground)" : "rgba(0,0,0,0.18)",
              }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Aurora ----- */
export function Aurora({
  className = "",
  colors = ["#185fa5", "#639922", "#ba7517"],
}: {
  className?: string;
  colors?: string[];
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      {colors.map((c, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 360,
            height: 360,
            background: c,
            filter: "blur(80px)",
            opacity: 0.22,
            left: `${(i * 35) % 80}%`,
            top: `${(i * 20) % 60 - 20}%`,
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 16 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.0) 0%, var(--background) 100%)",
        }}
      />
    </div>
  );
}

/* ----- TiltCard ----- */
export function TiltCard({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ry.set(x * max);
        rx.set(-y * max);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        transformPerspective: 700,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ----- Sparkline ----- */
export function Sparkline({
  values,
  color = "var(--accent-blue)",
  width = 80,
  height = 24,
  fill = true,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.0001, max - min);
  const step = width / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} className="overflow-visible">
      {fill && (
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 0.6 }}
          d={area}
          fill={color}
        />
      )}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2} fill={color} />
    </svg>
  );
}

/* ----- CommandPalette ----- */
export type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon?: ReactNode;
  shortcut?: string;
  onRun: () => void;
};

export function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const filtered = items.filter((it) =>
    [it.label, it.group, it.hint ?? ""].some((s) =>
      s.toLowerCase().includes(q.toLowerCase())
    )
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(filtered.length - 1, a + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        filtered[active].onRun();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, onClose]);

  const groups: Record<string, CommandItem[]> = {};
  filtered.forEach((it) => {
    (groups[it.group] ||= []).push(it);
  });
  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.35)" }}
          />
          <motion.div
            initial={{ y: -10, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] bg-card rounded-xl border border-border/80 overflow-hidden"
            style={{ borderWidth: "0.5px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b border-border/80"
              style={{ borderBottomWidth: "0.5px" }}
            >
              <IconSearch size={14} className="text-text-tertiary" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Type a command or search…"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 13 }}
              />
              <span
                className="rounded border border-border/80 text-text-tertiary px-1.5 py-0.5"
                style={{ fontSize: 10, borderWidth: "0.5px" }}
              >
                ESC
              </span>
            </div>
            <div className="max-h-[55vh] overflow-y-auto py-1">
              {Object.entries(groups).map(([group, list]) => (
                <div key={group}>
                  <div
                    className="px-3 pt-2.5 pb-1 text-text-tertiary uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.06em", fontWeight: 600 }}
                  >
                    {group}
                  </div>
                  {list.map((it) => {
                    flatIndex++;
                    const isActive = flatIndex === active;
                    return (
                      <button
                        key={it.id}
                        onMouseEnter={() => setActive(flatIndex)}
                        onClick={() => {
                          it.onRun();
                          onClose();
                        }}
                        className={`relative w-full flex items-center gap-3 px-3 py-2 text-left ${
                          isActive ? "bg-[#f5f5f4]" : ""
                        }`}
                      >
                        {it.icon ? (
                          <span className="w-6 h-6 rounded-md flex items-center justify-center bg-[#f5f5f4]">
                            {it.icon}
                          </span>
                        ) : (
                          <span className="w-6 h-6" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{it.label}</div>
                          {it.hint && (
                            <div
                              className="text-text-tertiary truncate"
                              style={{ fontSize: 11 }}
                            >
                              {it.hint}
                            </div>
                          )}
                        </div>
                        {it.shortcut && (
                          <span
                            className="text-text-tertiary tabular-nums"
                            style={{ fontSize: 10 }}
                          >
                            {it.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div
                  className="px-3 py-6 text-center text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  No results
                </div>
              )}
            </div>
            <div
              className="px-3 py-2 border-t border-border/80 flex items-center justify-between text-text-tertiary"
              style={{ borderTopWidth: "0.5px", fontSize: 10 }}
            >
              <span>↑↓ to navigate · ↵ to run</span>
              <span>⌘K anywhere</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----- InboxDrawer ----- */
export type InboxItem = {
  id: string;
  text: string;
  hint?: string;
  time: string;
  tone: "info" | "success" | "warn" | "danger";
};

export function InboxDrawer({
  open,
  onClose,
  items,
  onMarkAllRead,
}: {
  open: boolean;
  onClose: () => void;
  items: InboxItem[];
  onMarkAllRead?: () => void;
}) {
  const toneColor: Record<InboxItem["tone"], string> = {
    info: "var(--accent-blue)",
    success: "var(--accent-green)",
    warn: "var(--accent-amber)",
    danger: "var(--accent-red)",
  };
  const toneBg: Record<InboxItem["tone"], string> = {
    info: "var(--accent-blue-bg)",
    success: "var(--accent-green-bg)",
    warn: "var(--accent-amber-bg)",
    danger: "var(--accent-red-bg)",
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.25)" }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50 bg-card border-l border-border/80 flex flex-col"
            style={{ width: 360, borderLeftWidth: "0.5px" }}
          >
            <div
              className="px-5 py-3 border-b border-border/80 flex items-center justify-between"
              style={{ borderBottomWidth: "0.5px" }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Inbox</div>
                <div className="text-text-tertiary" style={{ fontSize: 11 }}>
                  {items.length} recent · last 24h
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onMarkAllRead}
                  className="text-muted-foreground hover:text-foreground"
                  style={{ fontSize: 11 }}
                >
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-md hover:bg-[#f5f5f4] flex items-center justify-center"
                  aria-label="Close inbox"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.map((it, i) => (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex gap-3 p-3 rounded-lg border border-border/80 hover:bg-[#fafaf9]"
                  style={{ borderWidth: "0.5px" }}
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: toneColor[it.tone] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12 }}>{it.text}</div>
                    {it.hint && (
                      <div
                        className="rounded mt-1.5 px-2 py-1 inline-block"
                        style={{
                          fontSize: 10,
                          background: toneBg[it.tone],
                          color: toneColor[it.tone],
                        }}
                      >
                        {it.hint}
                      </div>
                    )}
                    <div className="text-text-tertiary mt-1.5" style={{ fontSize: 10 }}>
                      {it.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ----- PageTransition ----- */
export function PageTransition({
  keyId,
  children,
}: {
  keyId: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ----- MetallicText ----- */
export function MetallicText({
  text,
  className = "",
  dark = false,
  style,
}: {
  text: string;
  className?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  const gradient = dark
    ? "linear-gradient(105deg, #777 0%, #d8d8d8 18%, #ffffff 32%, #c0c0c0 44%, #888 56%, #ebebeb 70%, #ffffff 82%, #aaa 100%)"
    : "linear-gradient(105deg, #3a3a3a 0%, #888 18%, #cccccc 32%, #666 44%, #2a2a2a 56%, #aaaaaa 70%, #e0e0e0 82%, #666 100%)";
  return (
    <span
      className={className}
      style={{
        backgroundImage: gradient,
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "metallicShine 3.5s linear infinite",
        ...style,
      }}
    >
      {text}
    </span>
  );
}

/* ----- CircularGallery ----- */
export function CircularGallery({
  items,
  radius = 160,
  speed = 14,
  itemSize = 76,
}: {
  items: { label: string; icon?: ReactNode }[];
  radius?: number;
  speed?: number;
  itemSize?: number;
}) {
  const [tick, setTick] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const containerSize = (radius + itemSize + 10) * 2;
  const center = containerSize / 2;

  useEffect(() => {
    const update = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      setTick((now - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative mx-auto select-none" style={{ width: containerSize, height: containerSize }}>
      {/* Connection lines */}
      <svg className="absolute inset-0 pointer-events-none" width={containerSize} height={containerSize}>
        {items.map((_, i) => {
          const base = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const a = base + tick * (speed * Math.PI / 180);
          const x = center + Math.cos(a) * radius;
          const y = center + Math.sin(a) * radius;
          const lineOpacity = Math.max(0.04, ((Math.sin(a) + 1) / 2) * 0.18);
          return (
            <line key={i} x1={center} y1={center} x2={x} y2={y}
              stroke="currentColor" strokeWidth={0.5} opacity={lineOpacity} strokeDasharray="3 5" />
          );
        })}
      </svg>

      {/* Center hub */}
      <div
        className="absolute flex flex-col items-center justify-center rounded-2xl bg-foreground text-background"
        style={{ left: center - 46, top: center - 46, width: 92, height: 92, zIndex: 20 }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>BIDFORGE</span>
        <span style={{ fontSize: 8.5, fontWeight: 400, opacity: 0.55, marginTop: 3 }}>AI Platform</span>
      </div>

      {/* Orbital items */}
      {items.map((item, i) => {
        const base = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const a = base + tick * (speed * Math.PI / 180);
        const sinA = Math.sin(a);
        const x = center + Math.cos(a) * radius - itemSize / 2;
        const y = center + sinA * radius - itemSize / 2;
        const opacity = 0.35 + 0.65 * ((sinA + 1) / 2);
        const scale = 0.72 + 0.36 * ((sinA + 1) / 2);
        const zIndex = Math.round((sinA + 1) * 5) + 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: itemSize,
              height: itemSize,
              opacity,
              transform: `scale(${scale})`,
              zIndex,
              borderWidth: "0.5px",
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/80 bg-card"
          >
            <div className="text-foreground">{item.icon}</div>
            <span className="text-muted-foreground text-center" style={{ fontSize: 9.5, fontWeight: 500, lineHeight: 1.2, padding: "0 4px" }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ----- BorderGlow ----- */
export function BorderGlow({
  children,
  className = "",
  color = "#185fa5",
  pulse = false,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  pulse?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={
        pulse
          ? {
              boxShadow: [
                `0 0 0 0.5px ${color}25, 0 0 10px ${color}12`,
                `0 0 0 1px ${color}60, 0 0 26px ${color}28`,
                `0 0 0 0.5px ${color}25, 0 0 10px ${color}12`,
              ],
            }
          : {
              boxShadow: hovered
                ? `0 0 0 1px ${color}70, 0 0 20px ${color}35, 0 0 40px ${color}12`
                : `0 0 0 0.5px rgba(0,0,0,0.07)`,
            }
      }
      transition={
        pulse
          ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.28, ease: "easeOut" }
      }
    >
      {children}
    </motion.div>
  );
}

/* ----- ListPreview (hover-preview list) ----- */
export type PreviewItem = {
  id: string;
  title: string;
  subtitle: string;
  preview: ReactNode;
};

export function ListPreview({
  items,
  onSelect,
}: {
  items: PreviewItem[];
  onSelect?: (item: PreviewItem) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(items[0]?.id ?? null);
  const active = items.find((i) => i.id === hovered) ?? items[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-3">
      <div
        className="bg-card border border-border/80 rounded-xl divide-y divide-border/80 overflow-hidden"
        style={{ borderWidth: "0.5px" }}
      >
        {items.map((it) => {
          const isActive = it.id === hovered;
          return (
            <button
              key={it.id}
              onMouseEnter={() => setHovered(it.id)}
              onFocus={() => setHovered(it.id)}
              onClick={() => onSelect?.(it)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                isActive ? "bg-[#fafaf9]" : "hover:bg-[#fafaf9]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="preview-rail"
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                  style={{ background: "var(--foreground)" }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>
                  {it.title}
                </div>
                <div
                  className="text-text-tertiary truncate"
                  style={{ fontSize: 11 }}
                >
                  {it.subtitle}
                </div>
              </div>
              <IconChevronRight size={12} className="text-text-tertiary" />
            </button>
          );
        })}
      </div>
      <div
        className="bg-card border border-border/80 rounded-xl p-4 min-h-[220px]"
        style={{ borderWidth: "0.5px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
          >
            {active?.preview}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
