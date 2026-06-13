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
import { api, rfpNames, type RfpListItem } from "./lib/api";
import {
  IconPlus,
  IconDownload,
  IconLayoutDashboard,
  IconCloudUpload,
  IconChartHistogram,
  IconFileText,
} from "@tabler/icons-react";

const meta: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of pipeline, bids, and AI activity" },
  workspace: { title: "Workspace", subtitle: "RFP detail" },
  upload: { title: "Upload & Intake", subtitle: "Add new RFP, RFQ, or tender" },
  analytics: { title: "Analytics", subtitle: "Pipeline health and win distribution" },
  settings: { title: "Settings", subtitle: "Manage your account and workspace preferences" },
};

const inbox: InboxItem[] = [];

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
  const [selectedRfpId, setSelectedRfpId] = useState<string | null>(null);
  const [rfpList, setRfpList] = useState<RfpListItem[]>([]);
  const enterApp = (v: ViewKey = "dashboard") => {
    setView(v);
    setRoute(v);
  };
  const openRfp = (id: string) => {
    setSelectedRfpId(id);
    setView("workspace");
    setRoute("workspace");
  };
  const refreshRfpList = async () => {
    try {
      const list = await api.list();
      setRfpList(list.filter((r) => !!rfpNames.get(r.rfp_id)));
    } catch {
      setRfpList([]);
    }
  };
  useEffect(() => {
    if (route !== "home") refreshRfpList();
  }, [route]);
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

  const banners: { text: string; cta: string; target: ViewKey }[] = [];

  const bids: BidResult[] = rfpList.map((r) => ({
    id: r.rfp_id,
    title: rfpNames.get(r.rfp_id) ?? r.rfp_id,
    owner: "",
    category: r.status,
    year: new Date(r.created_at).getFullYear(),
    amount: "",
    due: new Date(r.created_at).toLocaleDateString(),
    status: r.status === "complete" ? "go" : r.status === "failed" ? "nogo" : "draft",
    thumbHue: 210,
  }));

  const commands: CommandItem[] = [
    { id: "go-dash", label: "Go to Dashboard", group: "Navigate", icon: <IconLayoutDashboard size={14} />, shortcut: "g d", onRun: () => setView("dashboard") },
    { id: "go-up", label: "Upload & Intake", group: "Navigate", icon: <IconCloudUpload size={14} />, shortcut: "g u", onRun: () => setView("upload") },
    { id: "go-an", label: "Open Analytics", group: "Navigate", icon: <IconChartHistogram size={14} />, shortcut: "g a", onRun: () => setView("analytics") },
    { id: "new-bid", label: "Start a new bid", group: "Actions", icon: <IconPlus size={14} />, onRun: () => { setView("upload"); } },
    { id: "inbox", label: "Open Inbox", group: "Quick", icon: <IconFileText size={14} />, onRun: () => setInboxOpen(true) },
    { id: "theme", label: dark ? "Switch to Light mode" : "Switch to Dark mode", group: "Quick", onRun: () => setDark(!dark) },
    ...rfpList.map((r) => ({
      id: r.rfp_id,
      label: rfpNames.get(r.rfp_id) ?? r.rfp_id,
      hint: `${r.status} · ${new Date(r.created_at).toLocaleDateString()}`,
      group: "Open bid",
      onRun: () => openRfp(r.rfp_id),
    })),
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
      {banners.length > 0 && (
        <NotificationBar
          messages={banners}
          onAction={(i) => navigate(banners[i].target)}
        />
      )}
      <div className="flex-1 min-h-0">
        <Shell
          view={view}
          setView={setView}
          title={
            view === "workspace" && selectedRfpId
              ? rfpNames.get(selectedRfpId) ?? selectedRfpId
              : meta[view].title
          }
          subtitle={meta[view].subtitle}
          workspaces={rfpList}
          onOpenRfp={openRfp}
          onDeleteRfp={(id) => {
            setRfpList((prev) => prev.filter((r) => r.rfp_id !== id));
            if (selectedRfpId === id) {
              setSelectedRfpId(null);
              setView("dashboard");
              setRoute("dashboard");
            }
          }}
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
          <PageTransition keyId={view + (selectedRfpId ?? "")}>
            {view === "dashboard" && (
              <Dashboard onOpen={setView} onOpenRfp={openRfp} onChanged={refreshRfpList} />
            )}
            {view === "workspace" && <Workspace rfpId={selectedRfpId} />}
            {view === "upload" && <Upload onOpen={setView} onUploaded={refreshRfpList} />}
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
        onOpenBid={(b) => openRfp(b.id)}
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
