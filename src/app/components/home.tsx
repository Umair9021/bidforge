import {
  IconArrowRight,
  IconCommand,
  IconSparkles,
  IconShieldCheck,
  IconBolt,
  IconFileText,
  IconChartBar,
  IconUsers,
  IconUser,
  IconCircleCheck,
  IconStar,
  IconBrandGithub,
  IconBrandX,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import {
  TypeText,
  CurvedLoop,
  GlareHover,
  Antigravity,
} from "./home-bits";
import {
  AnimatedList,
  GradientText,
  FadeContent,
  CountUp,
  ThemeToggle,
  ClickSpark,
  MetallicText,
  CircularGallery,
  BorderGlow,
} from "./reactbits";
import { ContainerScroll } from "./container-scroll";

/* ---------------- Hero typographic decorations ---------------- */
function HeroRails() {
  return (
    <>
      {[
        { side: "left" as const, label: "v4.2.0" },
        { side: "right" as const, label: "EST · 2024" },
      ].map((r) => (
        <div
          key={r.side}
          className="hidden lg:flex absolute top-0 bottom-0 flex-col items-center justify-between py-12 pointer-events-none"
          style={{
            [r.side]: 24,
            width: 16,
          }}
          aria-hidden
        >
          <span
            className="text-text-tertiary uppercase tabular-nums"
            style={{
              writingMode: "vertical-rl",
              fontSize: 9.5,
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            {r.label}
          </span>
          <div
            className="flex-1 my-3 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--foreground) 18%, transparent), transparent)",
            }}
          />
          <span
            className="text-text-tertiary"
            style={{
              writingMode: "vertical-rl",
              fontSize: 9.5,
              letterSpacing: "0.18em",
              fontWeight: 500,
            }}
          >
            {r.side === "left"
              ? "Scroll ↓"
              : "Bid Intelligence"}
          </span>
        </div>
      ))}
    </>
  );
}

function HeroCorners() {
  const Mark = ({ pos }: { pos: string }) => (
    <span
      className="absolute w-2.5 h-2.5 pointer-events-none"
      style={
        pos === "tl"
          ? { top: 16, left: 16 }
          : pos === "tr"
            ? { top: 16, right: 16 }
            : pos === "bl"
              ? { bottom: 16, left: 16 }
              : { bottom: 16, right: 16 }
      }
      aria-hidden
    >
      <span
        className="absolute bg-foreground/30"
        style={{
          width: 10,
          height: 1,
          [pos.includes("l") ? "left" : "right"]: 0,
          [pos.includes("t") ? "top" : "bottom"]: 0,
        }}
      />
      <span
        className="absolute bg-foreground/30"
        style={{
          width: 1,
          height: 10,
          [pos.includes("l") ? "left" : "right"]: 0,
          [pos.includes("t") ? "top" : "bottom"]: 0,
        }}
      />
    </span>
  );
  return (
    <>
      <Mark pos="tl" />
      <Mark pos="tr" />
      <Mark pos="bl" />
      <Mark pos="br" />
    </>
  );
}

function FloatingStats() {
  const cards = [
    {
      key: "left",
      side: "left" as const,
      label: "Avg win-rate lift",
      value: "+73%",
      tone: "var(--accent-green)",
      sub: "vs. last quarter",
      pos: { top: "18%", left: "4%" },
    },
    {
      key: "right",
      side: "right" as const,
      label: "Live RFPs",
      value: "1,284",
      tone: "var(--accent-blue)",
      sub: "tracked today",
      pos: { top: "30%", right: "4%" },
    },
    {
      key: "bl",
      side: "left" as const,
      label: "Compliance score",
      value: "98.2%",
      tone: "var(--accent-amber)",
      sub: "12-month avg",
      pos: { bottom: "12%", left: "6%" },
    },
    {
      key: "br",
      side: "right" as const,
      label: "Faster proposals",
      value: "4.2×",
      tone: "var(--accent-blue)",
      sub: "vs. baseline",
      pos: { bottom: "18%", right: "6%" },
    },
  ];
  return (
    <div
      className="absolute inset-0 pointer-events-none hidden md:block"
      aria-hidden
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5 + i * 0.12,
            duration: 0.55,
            ease: "easeOut",
          }}
          className="absolute rounded-xl border border-border/80 bg-card/85 backdrop-blur-md px-3.5 py-2.5"
          style={{
            ...c.pos,
            borderWidth: "0.5px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            minWidth: 132,
          }}
        >
          <div
            className="flex items-center gap-1.5 text-text-tertiary uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: c.tone }}
            />
            {c.label}
          </div>
          <div
            className="mt-1 tabular-nums"
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {c.value}
          </div>
          <div
            className="text-text-tertiary"
            style={{ fontSize: 10 }}
          >
            {c.sub}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function Home({
  onEnter,
  onSignIn,
  dark,
  setDark,
  isAuthed = false,
  userProfile,
  onOpenApp,
}: {
  onEnter: () => void;
  onSignIn: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  isAuthed?: boolean;
  userProfile?: { name: string; email: string; avatarUrl?: string } | null;
  onOpenApp?: () => void;
}) {
  return (
    <div className="min-h-full w-full bg-background text-foreground overflow-x-hidden relative">
      <div className="relative" style={{ zIndex: 1 }}>
        <Header
          onSignIn={onSignIn}
          onEnter={onEnter}
          dark={dark}
          setDark={setDark}
          isAuthed={isAuthed}
          userProfile={userProfile}
          onOpenApp={onOpenApp}
        />
        <Hero onEnter={onEnter} dark={dark} />
        <Features />
        <HowItWorks />
        <PlatformCircle />
        <ActivitySection />
        <CurvedBand />
        <Testimonials />
        <Pricing onEnter={onEnter} />
        <CTA onEnter={onEnter} />
        <Footer dark={dark} />
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */
function Header({
  onSignIn,
  onEnter,
  dark,
  setDark,
  isAuthed = false,
  userProfile,
  onOpenApp,
}: {
  onSignIn: () => void;
  onEnter: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  isAuthed?: boolean;
  userProfile?: { name: string; email: string; avatarUrl?: string } | null;
  onOpenApp?: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md bg-background/75 border-b border-border/60"
      style={{ borderBottomWidth: "0.5px" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-6">
        <ClickSpark color="var(--accent-blue)">
          <button
            onClick={onEnter}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-[5px] bg-foreground text-background flex items-center justify-center shrink-0">
              <IconCommand size={13} stroke={2.5} />
            </div>
            <MetallicText
              text="BidForge"
              dark={dark}
              className="hidden sm:inline"
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            />
          </button>
        </ClickSpark>

        <nav className="hidden md:flex items-center gap-5 ml-2">
          {[
            "Features",
            "How it works",
            "Pricing",
            "Customers",
          ].map((l) => (
            <a
              key={l}
              href={`#${l.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 13 }}
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="flex-1" />
        <ThemeToggle dark={dark} onChange={setDark} />
        {isAuthed ? (
          <ClickSpark color="var(--accent-blue)">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenApp}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 pl-1 pr-3 py-1 hover:bg-secondary transition-colors"
              style={{ borderWidth: "0.5px", fontSize: 12, fontWeight: 500 }}
              aria-label="Open dashboard"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shrink-0" style={{ fontSize: 10, fontWeight: 700 }}>
                  {userProfile
                    ? userProfile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                    : <IconUser size={13} stroke={2} />}
                </span>
              )}
              <span className="hidden sm:inline">Dashboard</span>
            </motion.button>
          </ClickSpark>
        ) : (
          <>
            <button
              onClick={onSignIn}
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              style={{ fontSize: 13 }}
            >
              Sign in
            </button>
            <ClickSpark color="var(--foreground)">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onEnter}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3.5 py-2"
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                Get started
                <IconArrowRight size={13} />
              </motion.button>
            </ClickSpark>
          </>
        )}
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero({
  onEnter,
  dark,
}: {
  onEnter: () => void;
  dark: boolean;
}) {
  return (
    <section className="relative pt-20 sm:pt-28 pb-24 sm:pb-32 overflow-hidden">
      {/* Typographic frame: dot grid + side rails + floating mini-cards */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--foreground) 14%, transparent) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      <HeroRails />
      <HeroCorners />
      <FloatingStats />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <FadeContent>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/50 backdrop-blur px-3 py-1.5 mb-8"
            style={{ borderWidth: "0.5px", fontSize: 11 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent-green)" }}
            />
            <span className="text-muted-foreground">New ·</span>
            <span style={{ fontWeight: 500 }}>
              BidForge AI v4.2 is live
            </span>
            <IconArrowRight
              size={11}
              className="text-muted-foreground"
            />
          </div>
        </FadeContent>

        {/* Clean headline — no competing animations */}
        <FadeContent delay={0.05}>
          <h1
            className="mx-auto max-w-4xl"
            style={{
              fontSize: "clamp(38px,5.5vw, 65px)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.06,
            }}
          >
            Win more bids with
            <br />
            <GradientText
              colors={[
                "#185fa5",
                "#639922",
                "#ba7517",
                "#185fa5",
              ]}
              className="inline-block mt-1"
            >
              <TypeText
                phrases={[
                  "AI-powered proposals.",
                  "compliance you trust.",
                  "answers in seconds.",
                ]}
              />
            </GradientText>
          </h1>
        </FadeContent>

        <FadeContent delay={0.18}>
          <p
            className="mx-auto max-w-xl mt-6 text-muted-foreground"
            style={{ fontSize: 16, lineHeight: 1.65 }}
          >
            BidForge extracts RFP requirements, drafts winning
            responses, and runs compliance checks — so your team
            ships better proposals in a fraction of the time.
          </p>
        </FadeContent>

        <FadeContent delay={0.28}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Antigravity strength={16}>
              <ClickSpark color="var(--foreground)">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onEnter}
                  className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-6 py-3"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  Start free trial
                  <IconArrowRight size={14} />
                </motion.button>
              </ClickSpark>
            </Antigravity>
            <ClickSpark color="var(--accent-blue)">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-card/60 backdrop-blur px-6 py-3 hover:bg-secondary transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  borderWidth: "0.5px",
                }}
              >
                <IconSparkles size={14} />
                Watch the demo
              </button>
            </ClickSpark>
          </div>
        </FadeContent>

        <FadeContent delay={0.36}>
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground"
            style={{ fontSize: 11 }}
          >
            {[
              "14-day free trial",
              "No credit card required",
              "SOC 2 Type II",
            ].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5"
              >
                <IconCircleCheck
                  size={12}
                  className="text-accent-green"
                />
                {t}
              </span>
            ))}
          </div>
        </FadeContent>

        {/* App preview — Container scroll + BorderGlow */}
        <FadeContent delay={0.45}>
          <div
            className="mt-16 relative mx-auto max-w-5xl"
            data-parallax="0.3"
          >
            <ContainerScroll>
              <BorderGlow
                className="rounded-xl"
                color="#6366f1"
              >
                <GlareHover className="rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden">
                  <div
                    className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/60"
                    style={{ borderBottomWidth: "0.5px" }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-red/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-amber/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-green/70" />
                    <span
                      className="ml-3 text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      app.bidforge.io / workspace / RFP-2031
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-3 p-4 sm:p-6">
                    <div className="col-span-12 sm:col-span-4 space-y-2">
                      {[
                        "Overview",
                        "Checklist",
                        "Proposal",
                        "Scoring",
                      ].map((t, i) => (
                        <div
                          key={t}
                          className={`px-3 py-2 rounded-md ${
                            i === 0
                              ? "bg-foreground text-background"
                              : "bg-secondary text-muted-foreground"
                          }`}
                          style={{ fontSize: 12 }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                    <div className="col-span-12 sm:col-span-8 space-y-3">
                      {[
                        {
                          l: "Win probability",
                          v: 78,
                          c: "var(--accent-green)",
                        },
                        {
                          l: "Compliance score",
                          v: 92,
                          c: "var(--accent-green)",
                        },
                        {
                          l: "Section coverage",
                          v: 64,
                          c: "var(--accent-amber)",
                        },
                      ].map((m) => (
                        <div
                          key={m.l}
                          className="p-3 rounded-md border border-border/60 bg-background/60"
                          style={{ borderWidth: "0.5px" }}
                        >
                          <div
                            className="flex items-center justify-between mb-2"
                            style={{ fontSize: 11 }}
                          >
                            <span className="text-muted-foreground">
                              {m.l}
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              {m.v}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${m.v}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 1.2,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full"
                              style={{ background: m.c }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlareHover>
              </BorderGlow>
            </ContainerScroll>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */
function Features() {
  const features = [
    {
      icon: IconBolt,
      title: "Instant RFP extraction",
      desc: "Upload a tender and get a structured requirements checklist in under 60 seconds.",
    },
    {
      icon: IconSparkles,
      title: "AI-drafted responses",
      desc: "Tailored sections that match your win themes and pull from your capability library.",
    },
    {
      icon: IconShieldCheck,
      title: "Compliance guardrails",
      desc: "Every clause is mapped to your response — gaps and risks flagged before submission.",
    },
    {
      icon: IconChartBar,
      title: "Win-probability scoring",
      desc: "Calibrated estimates with the drivers explained, updated as your draft evolves.",
    },
    {
      icon: IconUsers,
      title: "Built for teams",
      desc: "Comments, mentions, version history — proposal work without the inbox chaos.",
    },
    {
      icon: IconFileText,
      title: "Beautiful exports",
      desc: "Branded PDFs, DOCX, or sync to your CMS. Pixel-perfect every time.",
    },
  ];
  return (
    <section
      data-reveal
      id="features"
      className="py-24 sm:py-32 relative overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
        <div className="text-center mb-14">
          <div
            className="inline-block text-muted-foreground uppercase mb-3"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            Capabilities
          </div>
          <h2
            data-reveal
            className="mx-auto max-w-2xl"
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.12,
            }}
          >
            Everything bid managers wish they had — in one
            workspace.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <FadeContent key={f.title}>
                <BorderGlow
                  className="h-full rounded-xl"
                  color="#185fa5"
                >
                  <GlareHover className="h-full rounded-xl border border-border/80 bg-card p-6 hover:border-border/60 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center mb-4 text-foreground">
                      <Icon size={17} stroke={1.75} />
                    </div>
                    <div
                      className="mb-1.5"
                      style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                      }}
                    >
                      {f.title}
                    </div>
                    <p
                      className="text-muted-foreground"
                      style={{ fontSize: 13, lineHeight: 1.6 }}
                    >
                      {f.desc}
                    </p>
                  </GlareHover>
                </BorderGlow>
              </FadeContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Upload your RFP",
      d: "Drop in any PDF, DOCX, or paste a URL. We handle every format.",
    },
    {
      n: "02",
      t: "AI extracts everything",
      d: "Requirements, evaluation criteria, deadlines, and forms — structured automatically.",
    },
    {
      n: "03",
      t: "Draft & refine",
      d: "Generate first drafts grounded in your past wins. Edit collaboratively in real-time.",
    },
    {
      n: "04",
      t: "Submit with confidence",
      d: "Compliance checks pass, scoring is green, exports are ready.",
    },
  ];
  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 bg-secondary/30 border-y border-border/60 relative overflow-hidden"
      style={{
        borderTopWidth: "0.5px",
        borderBottomWidth: "0.5px",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
        <div className="text-center mb-14">
          <div
            className="inline-block text-muted-foreground uppercase mb-3"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            How it works
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            From RFP to submission in 4 steps
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <FadeContent key={s.n}>
              <div
                className="relative rounded-xl border border-border/80 bg-card p-6 h-full"
                style={{ borderWidth: "0.5px" }}
              >
                <div
                  className="text-muted-foreground mb-3"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  STEP {s.n}
                </div>
                <div
                  className="mb-2"
                  style={{ fontSize: 14.5, fontWeight: 600 }}
                >
                  {s.t}
                </div>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: 12.5, lineHeight: 1.6 }}
                >
                  {s.d}
                </p>
              </div>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Platform Circle (CircularGallery) ---------------- */
function PlatformCircle() {
  const items = [
    {
      label: "RFP Parsing",
      icon: <IconFileText size={17} stroke={1.5} />,
    },
    {
      label: "AI Drafting",
      icon: <IconSparkles size={17} stroke={1.5} />,
    },
    {
      label: "Compliance",
      icon: <IconShieldCheck size={17} stroke={1.5} />,
    },
    {
      label: "Win Scoring",
      icon: <IconChartBar size={17} stroke={1.5} />,
    },
    {
      label: "Team Collab",
      icon: <IconUsers size={17} stroke={1.5} />,
    },
    {
      label: "Fast Export",
      icon: <IconBolt size={17} stroke={1.5} />,
    },
  ];
  return (
    <section
      data-reveal
      className="py-24 sm:py-32 relative overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="text-muted-foreground uppercase mb-3"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Platform
            </div>
            <h2
              data-reveal
              className="mb-5"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Every tool in orbit.
            </h2>
            <p
              className="text-muted-foreground mb-8"
              style={{ fontSize: 14, lineHeight: 1.65 }}
            >
              One connected workspace — from upload to final
              PDF. BidForge keeps every capability in sync so
              nothing slips between the cracks of your bid
              process.
            </p>
            <div className="space-y-3">
              {[
                "Parse any tender format in seconds",
                "AI-generated sections grounded in your past wins",
                "Real-time compliance gap detection",
              ].map((p) => (
                <div
                  key={p}
                  className="flex items-start gap-2.5"
                  style={{ fontSize: 13 }}
                >
                  <IconCircleCheck
                    size={14}
                    className="text-accent-green mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <CircularGallery
              items={items}
              radius={148}
              speed={16}
              itemSize={74}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Activity / AnimatedList ---------------- */
function ActivitySection() {
  const items = [
    {
      id: "1",
      text: "RFP-2044 compliance check passed",
      time: "12m ago",
      tag: "Success",
    },
    {
      id: "2",
      text: "Maya regenerated Technical Approach",
      time: "1h ago",
      tag: "AI",
    },
    {
      id: "3",
      text: "RFP-2031 win probability ↑ 78%",
      time: "3h ago",
      tag: "Score",
    },
    {
      id: "4",
      text: "Draft v2 saved for RFQ-1188",
      time: "5h ago",
      tag: "Draft",
    },
    {
      id: "5",
      text: "3 new tenders matched your profile",
      time: "8h ago",
      tag: "Match",
    },
    {
      id: "6",
      text: "Capability Library updated",
      time: "1d ago",
      tag: "Library",
    },
  ];

  const metrics = [
    { v: 73, suf: "%", l: "Avg win-rate lift" },
    { v: 4.2, suf: "×", l: "Faster proposals", dec: 1 },
    { v: 500, suf: "+", l: "Teams onboard" },
    { v: 12000, suf: "+", l: "Bids processed" },
  ];

  return (
    <section
      data-reveal
      className="py-24 sm:py-32 bg-secondary/30 border-y border-border/60 relative overflow-hidden"
      style={{
        borderTopWidth: "0.5px",
        borderBottomWidth: "0.5px",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              className="text-muted-foreground uppercase mb-3"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Live activity
            </div>
            <h2
              data-reveal
              className="mb-4"
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              See what your team is shipping, as it happens.
            </h2>
            <p
              className="text-muted-foreground mb-8"
              style={{ fontSize: 14, lineHeight: 1.65 }}
            >
              Every action — extractions, regenerations,
              compliance passes — streams into a shared activity
              feed. No more "what did anyone do today?"
              standups.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div
                  key={m.l}
                  className="rounded-lg border border-border/80 bg-card p-4"
                  style={{ borderWidth: "0.5px" }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    <CountUp
                      to={m.v}
                      suffix={m.suf}
                      decimals={m.dec ?? 0}
                    />
                  </div>
                  <div
                    className="text-muted-foreground mt-1"
                    style={{ fontSize: 11 }}
                  >
                    {m.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BorderGlow className="rounded-xl" color="#185fa5">
            <div
              className="rounded-xl border border-border/80 bg-card p-4 sm:p-5"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Activity feed
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-muted-foreground"
                  style={{ fontSize: 11 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                  Live
                </span>
              </div>
              <AnimatedList
                className="space-y-2"
                stagger={0.07}
              >
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-background/60 hover:bg-secondary/60 transition-colors"
                    style={{ borderWidth: "0.5px" }}
                  >
                    <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <IconSparkles
                        size={12}
                        stroke={1.75}
                        className="text-muted-foreground"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                        }}
                      >
                        {it.text}
                      </div>
                      <div
                        className="text-muted-foreground"
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {it.time}
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 bg-secondary text-muted-foreground"
                      style={{ fontSize: 10, fontWeight: 500 }}
                    >
                      {it.tag}
                    </span>
                  </div>
                ))}
              </AnimatedList>
            </div>
          </BorderGlow>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Curved Band ---------------- */
function CurvedBand() {
  return (
    <section
      data-reveal
      className="py-10 sm:py-14 border-y border-border/60 bg-card/40 overflow-hidden"
      style={{
        borderTopWidth: "0.5px",
        borderBottomWidth: "0.5px",
      }}
    >
      <CurvedLoop
        text="Faster proposals · Higher win rate · Built for bid teams"
        className="text-foreground/80"
      />
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const items = [
    {
      name: "Priya Shah",
      role: "Head of Bids · Northwind",
      quote:
        "We cut proposal time from 9 days to 2. Compliance reviews catch things we used to miss on slide 80.",
    },
    {
      name: "Marcus Lee",
      role: "Capture Lead · Initech",
      quote:
        "BidForge feels like adding three senior writers to the team. The win-probability score is freakishly accurate.",
    },
    {
      name: "Aisha Khan",
      role: "Proposal Manager · Acme",
      quote:
        "Our team finally agrees on a single source of truth. The activity feed alone is worth it.",
    },
  ];
  return (
    <section
      data-reveal
      id="customers"
      className="py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <div
            className="text-muted-foreground uppercase mb-3"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            Customers
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            Loved by teams that win.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((t) => (
            <FadeContent key={t.name}>
              <GlareHover className="h-full rounded-xl border border-border/80 bg-card p-6">
                <div className="flex gap-0.5 mb-4 text-accent-amber">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar
                      key={i}
                      size={12}
                      fill="currentColor"
                      stroke={0}
                    />
                  ))}
                </div>
                <p
                  className="mb-5 text-foreground"
                  style={{ fontSize: 13.5, lineHeight: 1.65 }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shrink-0"
                    style={{ fontSize: 11, fontWeight: 600 }}
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </GlareHover>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
function Pricing({ onEnter }: { onEnter: () => void }) {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      desc: "For solo writers exploring BidForge.",
      features: [
        "3 RFPs / month",
        "AI drafts",
        "Compliance basics",
        "Community support",
      ],
      cta: "Start free",
    },
    {
      name: "Team",
      price: "$79",
      suf: "/seat/mo",
      desc: "For working bid teams.",
      features: [
        "Unlimited RFPs",
        "Capability library",
        "Advanced compliance",
        "Slack & Drive sync",
        "Priority support",
      ],
      cta: "Start trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For organizations with scale and security needs.",
      features: [
        "SSO / SAML",
        "FedRAMP-ready",
        "Dedicated CSM",
        "Custom integrations",
        "On-prem option",
      ],
      cta: "Talk to sales",
    },
  ];
  return (
    <section
      id="pricing"
      className="py-24 sm:py-32 bg-secondary/30 border-y border-border/60"
      style={{
        borderTopWidth: "0.5px",
        borderBottomWidth: "0.5px",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <div
            className="text-muted-foreground uppercase mb-3"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            Pricing
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            Simple plans for any team size.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-xl border p-6 ${
                t.featured
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border/80"
              }`}
              style={{ borderWidth: "0.5px" }}
            >
              {t.featured && (
                <span
                  className="absolute -top-2.5 left-6 rounded-full bg-accent-green text-white px-2.5 py-0.5"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  MOST POPULAR
                </span>
              )}
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {t.price}
                </span>
                {t.suf && (
                  <span
                    className="opacity-60"
                    style={{ fontSize: 12 }}
                  >
                    {t.suf}
                  </span>
                )}
              </div>
              <p
                className={`mt-2 ${t.featured ? "text-background/70" : "text-muted-foreground"}`}
                style={{ fontSize: 12.5 }}
              >
                {t.desc}
              </p>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2"
                    style={{ fontSize: 12.5 }}
                  >
                    <IconCircleCheck
                      size={14}
                      className={`${t.featured ? "text-background mt-0.5" : "text-accent-green mt-0.5"} shrink-0`}
                    />
                    <span
                      className={
                        t.featured ? "text-background/90" : ""
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onEnter}
                className={`mt-7 w-full rounded-md py-2.5 transition-opacity hover:opacity-90 ${
                  t.featured
                    ? "bg-background text-foreground"
                    : "bg-foreground text-background"
                }`}
                style={{ fontSize: 12.5, fontWeight: 600 }}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA({ onEnter }: { onEnter: () => void }) {
  return (
    <section
      data-reveal
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <FadeContent>
          <h2
            data-reveal
            className="mb-5"
            style={{
              fontSize: "clamp(30px, 5vw, 54px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
            }}
          >
            Ship your next proposal in{" "}
            <GradientText
              colors={[
                "#185fa5",
                "#639922",
                "#ba7517",
                "#185fa5",
              ]}
            >
              days, not weeks.
            </GradientText>
          </h2>
        </FadeContent>
        <FadeContent delay={0.1}>
          <p
            className="text-muted-foreground mb-8 mx-auto max-w-md"
            style={{ fontSize: 14.5, lineHeight: 1.65 }}
          >
            Join hundreds of bid teams turning RFPs into wins.
            Free 14-day trial, no credit card.
          </p>
        </FadeContent>
        <FadeContent delay={0.2}>
          <Antigravity strength={20}>
            <ClickSpark color="var(--foreground)">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-7 py-3.5"
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                Get started free
                <IconArrowRight size={15} />
              </motion.button>
            </ClickSpark>
          </Antigravity>
        </FadeContent>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ dark }: { dark: boolean }) {
  return (
    <footer
      className="border-t border-border/60 py-12 bg-secondary/30"
      style={{ borderTopWidth: "0.5px" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-[5px] bg-foreground text-background flex items-center justify-center shrink-0">
                <IconCommand size={13} stroke={2.5} />
              </div>
              <MetallicText
                text="BidForge"
                dark={dark}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              />
            </div>
            <p
              className="text-muted-foreground max-w-xs"
              style={{ fontSize: 12, lineHeight: 1.6 }}
            >
              The AI-powered bid &amp; proposal response engine
              for modern teams.
            </p>
            <div className="flex gap-3 mt-4 text-muted-foreground">
              {[
                IconBrandX,
                IconBrandLinkedin,
                IconBrandGithub,
              ].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-md border border-border/80 flex items-center justify-center hover:bg-secondary transition-colors"
                  style={{ borderWidth: "0.5px" }}
                >
                  <Icon size={13} stroke={1.75} />
                </a>
              ))}
            </div>
          </div>
          {[
            {
              h: "Product",
              links: [
                "Features",
                "Pricing",
                "Integrations",
                "Changelog",
              ],
            },
            {
              h: "Company",
              links: ["About", "Customers", "Careers", "Press"],
            },
            {
              h: "Resources",
              links: ["Docs", "API", "Security", "Status"],
            },
          ].map((c) => (
            <div key={c.h}>
              <div
                className="mb-3"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {c.h}
              </div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      style={{ fontSize: 12 }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground"
          style={{ borderTopWidth: "0.5px", fontSize: 11 }}
        >
          <span>
            © 2026 BidForge, Inc. All rights reserved.
          </span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}