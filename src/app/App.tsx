import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Shell, OutlineButton, type ViewKey } from "./components/shell";
import { Dashboard } from "./components/dashboard";
import { Workspace } from "./components/workspace";
import { Upload } from "./components/upload";
import { Analytics } from "./components/analytics";
import { Settings } from "./components/settings";
import { Home } from "./components/home";
import { SmoothScroll } from "./components/smooth-scroll";
import {
  NotificationBar,
  PageTransition,
  InboxDrawer,
  type CommandItem,
  type InboxItem,
} from "./components/reactbits";
import { ActionSearchPalette, type BidResult } from "./components/action-search-bar";
import { useAuthFlow, useConfirm } from "./components/auth-modals";
import { getSupabase } from "./lib/supabase";
import {
  IconPlus,
  IconDownload,
  IconLayoutDashboard,
  IconFolders,
  IconCloudUpload,
  IconChartHistogram,
  IconSparkles,
  IconShieldCheck,
  IconFileText,
} from "@tabler/icons-react";

const meta: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of pipeline, bids, and AI activity" },
  workspace: { title: "RFP-2031", subtitle: "Workspace · last sync 12m ago" },
  upload: { title: "Upload & Intake", subtitle: "Add new RFP, RFQ, or tender" },
  analytics: { title: "Analytics", subtitle: "Pipeline health and win distribution" },
  settings: { title: "Settings", subtitle: "Manage your account and workspace preferences" },
};

const inbox: InboxItem[] = [
  { id: "1", text: "RFP-2044 compliance check passed (10/10 controls)", time: "12m ago", tone: "success", hint: "All clear" },
  { id: "2", text: "RFP-2031 flagged 2 gaps in past-performance section", time: "1h ago", tone: "warn", hint: "Needs review" },
  { id: "3", text: "Maya regenerated Technical Approach for RFP-2031", time: "3h ago", tone: "info" },
  { id: "4", text: "Draft v2 saved for RFQ-1188", time: "5h ago", tone: "success" },
  { id: "5", text: "RFP-1972 win probability dropped below threshold (41%)", time: "7h ago", tone: "danger", hint: "Action needed" },
  { id: "6", text: "AI model v4.2 deployed — scores refreshed", time: "9h ago", tone: "info" },
  { id: "7", text: "RFP-2055 deadline reminder set", time: "12h ago", tone: "info" },
  { id: "8", text: "Capability Library updated with 3 new entries", time: "1d ago", tone: "info" },
];

type AppRoute = "home" | ViewKey;

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>("home");
  const [view, setView] = useState<ViewKey>("dashboard");
  const enterApp = (v: ViewKey = "dashboard") => {
    setView(v);
    setRoute(v);
  };
  const [dark, setDark] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const auth = useAuthFlow({
    onAuthenticated: () => enterApp("dashboard"),
  });
  const confirm = useConfirm();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Restore an existing session on load and keep auth state in sync. Note: we no
  // longer auto-enter the dashboard — a returning user lands on the homepage and
  // taps their avatar to open the app. New users must verify their email and then
  // sign in before any session exists.
  const refreshUser = async () => {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) { setUserProfile(null); return; }
    const meta = user.user_metadata ?? {};
    const profile: UserProfile = {
      id: user.id,
      name: meta.name ?? meta.full_name ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
      avatarUrl: undefined,
    };
    // Fetch fresh signed avatar URL if user has one stored
    if (meta.avatar_path) {
      try {
        const { projectId } = await import("../utils/supabase/info");
        const { data: { session } } = await getSupabase().auth.getSession();
        if (session?.access_token) {
          const res = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b819b135/avatar`,
            { headers: { Authorization: `Bearer ${session.access_token}` } },
          );
          if (res.ok) {
            const json = await res.json();
            if (json.url) profile.avatarUrl = json.url;
          }
        }
      } catch (_) {}
    }
    setUserProfile(profile);
  };

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error(`Error restoring session on load: ${error.message}`);
        return;
      }
      setIsAuthed(!!session);
      if (session) refreshUser();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthed(!!session);
      if (session) {
        refreshUser();
        // After a Google OAuth redirect the event is SIGNED_IN — go straight to
        // the dashboard so the user doesn't stay on the marketing page.
        if (event === "SIGNED_IN") {
          setRoute("dashboard");
          setView("dashboard");
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (!isMod && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
        toast("Keyboard shortcuts", {
          description: "⌘K palette · g d Dashboard · g w Workspace · g u Upload",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const banners = [
    { text: "RFP-2031 is due in 5 days · compliance check pending", cta: "Review", target: "workspace" as ViewKey },
    { text: "AI model v4.2 deployed — win-probability scores refreshed", cta: "View dashboard", target: "dashboard" as ViewKey },
    { text: "3 new tenders matched your capability profile this morning", cta: "Add a bid", target: "upload" as ViewKey },
  ];

  const bids: BidResult[] = [
    { id: "RFP-2031", title: "DOT Infrastructure Modernization", owner: "Maya Chen", category: "Federal · Infra", year: 2026, amount: "$4.2M", due: "in 5 days", status: "go", thumbHue: 210 },
    { id: "RFP-2044", title: "AI Risk Assessment Platform", owner: "Diego Park", category: "Civilian · AI", year: 2026, amount: "$2.9M", due: "in 3 days", status: "go", thumbHue: 265 },
    { id: "RFQ-1188", title: "Cloud Migration & SecOps", owner: "Priya Shah", category: "Commercial · Cloud", year: 2026, amount: "$1.8M", due: "in 12 days", status: "go", thumbHue: 175 },
    { id: "RFP-1972", title: "Smart Grid Analytics", owner: "Sam Iyer", category: "Energy · Analytics", year: 2025, amount: "$3.1M", due: "Closed", status: "lost", thumbHue: 35 },
    { id: "RFP-2055", title: "Naval Logistics Orchestration", owner: "Eve Tanaka", category: "DoD · Logistics", year: 2026, amount: "$6.4M", due: "in 21 days", status: "draft", thumbHue: 130 },
    { id: "RFQ-1201", title: "FedRAMP IL5 Enclave Buildout", owner: "Noah Kim", category: "Federal · Security", year: 2026, amount: "$2.2M", due: "in 9 days", status: "nogo", thumbHue: 0 },
  ];

  const commands: CommandItem[] = [
    { id: "go-dash", label: "Go to Dashboard", group: "Navigate", icon: <IconLayoutDashboard size={14} />, shortcut: "g d", onRun: () => setView("dashboard") },
    { id: "go-ws", label: "Open Workspace", group: "Navigate", icon: <IconFolders size={14} />, shortcut: "g w", onRun: () => setView("workspace") },
    { id: "go-up", label: "Upload & Intake", group: "Navigate", icon: <IconCloudUpload size={14} />, shortcut: "g u", onRun: () => setView("upload") },
    { id: "go-an", label: "Open Analytics", group: "Navigate", icon: <IconChartHistogram size={14} />, shortcut: "g a", onRun: () => setView("analytics") },
    { id: "new-bid", label: "Start a new bid", group: "Actions", icon: <IconPlus size={14} />, onRun: () => { setView("upload"); toast.success("New bid started"); } },
    { id: "regen", label: "Regenerate all proposal sections", group: "Actions", icon: <IconSparkles size={14} />, onRun: () => toast.success("Regenerating all sections...", { description: "~18 seconds" }) },
    { id: "compliance", label: "Run compliance check on current bid", group: "Actions", icon: <IconShieldCheck size={14} />, onRun: () => toast.success("Compliance check started") },
    { id: "export", label: "Export current proposal as PDF", group: "Actions", icon: <IconDownload size={14} />, onRun: () => toast.success("PDF export queued") },
    { id: "inbox", label: "Open Inbox", group: "Quick", icon: <IconFileText size={14} />, onRun: () => setInboxOpen(true) },
    { id: "theme", label: dark ? "Switch to Light mode" : "Switch to Dark mode", group: "Quick", onRun: () => setDark(!dark) },
    { id: "rfp-2031", label: "RFP-2031 · DOT Infrastructure", hint: "$4.2M · due 5 days", group: "Open bid", onRun: () => setView("workspace") },
    { id: "rfp-2044", label: "RFP-2044 · AI Risk Assessment Platform", hint: "$2.9M · due 3 days", group: "Open bid", onRun: () => setView("workspace") },
    { id: "rfq-1188", label: "RFQ-1188 · Cloud Migration & SecOps", hint: "$1.8M · due 12 days", group: "Open bid", onRun: () => setView("workspace") },
  ];

  const actions =
    view === "dashboard" ? (
      <OutlineButton
        icon={IconDownload}
        onClick={() =>
          toast.success("Export started", { description: "dashboard-2026-06-11.csv" })
        }
      >
        <span className="hidden sm:inline">Export</span>
      </OutlineButton>
    ) : view === "upload" ? (
      <OutlineButton onClick={() => setView("dashboard")}>Cancel</OutlineButton>
    ) : null;

  if (route === "home") {
    return (
      <div className="size-full">
        <SmoothScroll>
          <Home
            dark={dark}
            setDark={setDark}
            isAuthed={isAuthed}
            userProfile={userProfile}
            onEnter={() => (isAuthed ? enterApp("dashboard") : auth.open("signup"))}
            onSignIn={() => auth.open("signin")}
            onOpenApp={() => enterApp("dashboard")}
          />
        </SmoothScroll>
        {auth.render()}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontSize: 12,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.08)",
            },
          }}
        />
      </div>
    );
  }

  const navigate = (v: ViewKey) => {
    setView(v);
    setRoute(v);
  };

  return (
    <div className="size-full flex flex-col">
      <NotificationBar
        messages={banners}
        onAction={(i) => navigate(banners[i].target)}
      />
      <div className="flex-1 min-h-0">
        <Shell
          view={view}
          setView={setView}
          title={meta[view].title}
          subtitle={meta[view].subtitle}
          actions={actions}
          dark={dark}
          setDark={setDark}
          userProfile={userProfile}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenInbox={() => setInboxOpen(true)}
          onBackHome={() => setRoute("home")}
          onLogout={() =>
            confirm.confirm({
              title: "Log out of BidForge?",
              message:
                "You'll be returned to the marketing site. Any unsaved drafts will remain in your workspace.",
              confirmLabel: "Log out",
              tone: "danger",
              onConfirm: async () => {
                const { error } = await getSupabase().auth.signOut();
                if (error) {
                  console.error(`Error signing out: ${error.message}`);
                  toast.error("Could not sign out. Please try again.");
                  return;
                }
                setRoute("home");
                toast.success("Signed out");
              },
            })
          }
        >
          <PageTransition keyId={view}>
            {view === "dashboard" && <Dashboard onOpen={setView} />}
            {view === "workspace" && <Workspace />}
            {view === "upload" && <Upload onOpen={setView} />}
            {view === "analytics" && <Analytics />}
            {view === "settings" && <Settings dark={dark} setDark={setDark} onProfileUpdate={refreshUser} />}
          </PageTransition>
        </Shell>
      </div>
      <ActionSearchPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        bids={bids}
        actions={commands}
        onOpenBid={(b) => {
          toast.success(`Opening ${b.id}`, { description: b.title });
          navigate("workspace");
        }}
        onQuickAction={(b, kind) => {
          if (kind === "favorite") toast.success(`Starred ${b.id}`);
          else toast.success(`Exporting ${b.id}…`, { description: "PDF queued" });
        }}
      />
      <InboxDrawer
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        items={inbox}
        onMarkAllRead={() => {
          toast.success("All notifications marked as read");
          setInboxOpen(false);
        }}
      />
      {confirm.render()}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: 12,
            borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.08)",
          },
        }}
      />
    </div>
  );
}
