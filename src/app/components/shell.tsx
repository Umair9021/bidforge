import { useState, useEffect } from "react";
import {
  IconLayoutDashboard,
  IconFolders,
  IconUpload,
  IconChartHistogram,
  IconBell,
  IconCommand,
  IconChevronDown,
  IconMenu2,
  IconX,
  IconSearch,
  IconLayoutSidebarLeftCollapse,
  IconSettings,
  IconArrowLeft,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import type { UserProfile } from "../App";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ThemeToggle } from "./reactbits";
import { ActionSearchBar } from "./action-search-bar";

export type ViewKey = "dashboard" | "workspace" | "upload" | "analytics" | "settings";

const NAV: { key: ViewKey | string; label: string; icon: any; disabled?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { key: "workspace", label: "Workspace", icon: IconFolders },
  { key: "upload", label: "Upload", icon: IconUpload },
  { key: "analytics", label: "Analytics", icon: IconChartHistogram },
];

const WORKSPACES = [
  { id: "RFP-2031", name: "DOT Infrastructure", status: "go" },
  { id: "RFQ-1188", name: "Cloud Migration", status: "go" },
  { id: "RFP-2044", name: "AI Risk Platform", status: "go" },
  { id: "RFP-1972", name: "Smart Grid", status: "nogo" },
  { id: "RFP-2055", name: "Naval Logistics", status: "go" },
  { id: "RFQ-1201", name: "FedRAMP IL5", status: "nogo" },
];

export function Shell({
  view,
  setView,
  title,
  subtitle,
  actions,
  dark,
  setDark,
  userProfile,
  onOpenPalette,
  onOpenInbox,
  onLogout,
  onBackHome,
  children,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  dark: boolean;
  setDark: (b: boolean) => void;
  userProfile?: UserProfile | null;
  onOpenPalette?: () => void;
  onOpenInbox?: () => void;
  onLogout?: () => void;
  onBackHome?: () => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!profileOpen) return;
    const onDocClick = () => setProfileOpen(false);
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, [profileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNav = (key: ViewKey) => {
    setView(key);
    setMobileOpen(false);
  };

  const sidebarWidth = collapsed ? 56 : 234;

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className={`shrink-0 bg-sidebar border-r border-border/80 flex flex-col z-40 fixed inset-y-0 left-0 lg:relative ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ borderRightWidth: "0.5px", overflow: "hidden" }}
      >
        {/* Header — click to collapse/expand */}
        <div
          className="h-12 border-b border-border/80 flex items-center"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`group flex items-center w-full h-full hover:bg-secondary transition-colors ${
              collapsed ? "justify-center px-2" : "gap-2 px-4"
            }`}
          >
            <motion.div
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-5 h-5 rounded-[4px] bg-foreground text-background flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
            >
              <IconCommand size={12} stroke={2.5} />
            </motion.div>
            {!collapsed && (
              <>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}
                >
                  BidForge
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Collapse sidebar"
                >
                  <IconLayoutSidebarLeftCollapse size={14} stroke={1.75} />
                </motion.span>
              </>
            )}
          </button>
          {!collapsed && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden px-3 text-muted-foreground"
              aria-label="Close menu"
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav
          className={`${collapsed ? "px-2" : "px-3"} py-4 relative`}
          onMouseLeave={() => setHovered(null)}
        >
          {!collapsed && (
            <div
              className="px-2 mb-2 text-text-tertiary uppercase"
              style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 600 }}
            >
              Navigate
            </div>
          )}
          <div className="relative space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = view === item.key;
              const isHover = hovered === item.key;
              return (
                <button
                  key={item.key}
                  disabled={item.disabled}
                  onMouseEnter={() => setHovered(item.key)}
                  onClick={() => {
                    if (item.disabled) {
                      toast(`${item.label} coming soon`, {
                        description: "This module is under active development.",
                      });
                      return;
                    }
                    handleNav(item.key as ViewKey);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center rounded-lg transition-colors ${
                    collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"
                  } ${
                    item.disabled
                      ? "text-text-tertiary"
                      : active
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    letterSpacing: "-0.005em",
                    height: 34,
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "var(--foreground)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  {isHover && !active && !item.disabled && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-lg bg-secondary"
                      transition={{ type: "spring", stiffness: 480, damping: 34 }}
                    />
                  )}
                  <Icon
                    size={16}
                    stroke={active ? 2 : 1.75}
                    className="relative z-10 shrink-0"
                  />
                  {!collapsed && (
                    <>
                      <span className="relative z-10 truncate">{item.label}</span>
                      {item.disabled && (
                        <span
                          className="ml-auto relative z-10 rounded px-1.5 bg-secondary text-text-tertiary"
                          style={{
                            fontSize: 9,
                            fontWeight: 500,
                            letterSpacing: "0.03em",
                          }}
                        >
                          SOON
                        </span>
                      )}
                      {active && !item.disabled && (
                        <motion.span
                          layoutId="nav-dot"
                          className="ml-auto relative z-10 rounded-full"
                          style={{
                            width: 5,
                            height: 5,
                            background: "rgba(255,255,255,0.7)",
                          }}
                        />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Workspaces list (hidden when collapsed) */}
        {!collapsed && (
          <div
            className="mt-2 px-2 pt-3 border-t border-border/80 flex-1 overflow-y-auto"
            style={{ borderTopWidth: "0.5px" }}
          >
            <div className="flex items-center justify-between px-2 mb-2">
              <span
                className="text-text-tertiary uppercase"
                style={{ fontSize: 10, letterSpacing: "0.06em" }}
              >
                Workspaces
              </span>
              <IconChevronDown size={11} className="text-text-tertiary" />
            </div>
            <div className="space-y-0.5">
              {WORKSPACES.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    toast(`Opened ${w.id}`, { description: w.name });
                    handleNav("workspace");
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
                  style={{ fontSize: 12 }}
                >
                  <span
                    className="shrink-0 rounded-full"
                    style={{
                      width: 7,
                      height: 7,
                      background:
                        w.status === "go" ? "var(--accent-green)" : "var(--accent-red)",
                    }}
                  />
                  <span className="truncate">{w.id}</span>
                  <span
                    className="ml-auto text-text-tertiary truncate"
                    style={{ fontSize: 10, maxWidth: 90 }}
                  >
                    {w.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {collapsed && <div className="flex-1" />}

        {/* Profile */}
        <div
          className={`relative border-t border-border/80 ${
            collapsed ? "py-2 px-1.5 flex justify-center" : "px-3 py-2.5 flex items-center gap-2"
          }`}
          style={{ borderTopWidth: "0.5px" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen((o) => !o);
            }}
            className={`hover:bg-secondary rounded-md transition-colors ${
              collapsed ? "p-1" : "flex items-center gap-2 flex-1 min-w-0 p-1 -m-1"
            }`}
          >
            {/* Avatar */}
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center shrink-0"
                style={{ fontSize: 10, fontWeight: 700 }}
              >
                {userProfile
                  ? userProfile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                  : <IconUser size={13} stroke={2} />}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0 leading-tight text-left">
                <div className="truncate" style={{ fontSize: 12, fontWeight: 600 }}>
                  {userProfile?.name ?? "User"}
                </div>
                <div className="text-text-tertiary truncate" style={{ fontSize: 10 }}>
                  {userProfile?.email ?? ""}
                </div>
              </div>
            )}
          </button>

          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.14 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full mb-2 left-2 right-2 bg-popover text-popover-foreground border border-border/80 rounded-md shadow-lg z-50 overflow-hidden"
              style={{ borderWidth: "0.5px", minWidth: collapsed ? 160 : undefined, left: collapsed ? "100%" : undefined, marginLeft: collapsed ? 6 : undefined, right: collapsed ? "auto" : undefined }}
            >
              <MenuItem
                icon={IconSettings}
                label="Settings"
                onClick={() => {
                  setProfileOpen(false);
                  setView("settings");
                }}
              />
              <MenuItem
                icon={IconArrowLeft}
                label="Back to homepage"
                onClick={() => {
                  setProfileOpen(false);
                  if (onBackHome) onBackHome();
                  else setView("dashboard");
                }}
              />
              <div className="h-px bg-border/80" style={{ height: "0.5px" }} />
              <MenuItem
                icon={IconLogout}
                label="Logout"
                onClick={() => {
                  setProfileOpen(false);
                  if (onLogout) onLogout();
                  else toast.success("Logged out");
                }}
              />
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-12 shrink-0 border-b border-border/80 bg-background flex items-center px-3 sm:px-4 gap-3 sticky top-0 z-20"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="Open menu"
          >
            <IconMenu2 size={15} />
          </button>
          <div className="leading-tight min-w-0">
            <div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>
              {title}
            </div>
            <div
              className="text-text-tertiary truncate hidden sm:block"
              style={{ fontSize: 11 }}
            >
              {subtitle}
            </div>
          </div>
          <div className="flex-1" />
          <ActionSearchBar onOpen={() => onOpenPalette?.()} />
          <button
            onClick={onOpenPalette}
            className="md:hidden w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="Open command palette"
          >
            <IconSearch size={14} />
          </button>
          <button
            onClick={onOpenInbox}
            className="w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground relative"
            aria-label="Notifications"
          >
            <IconBell size={14} stroke={1.75} />
            <span
              className="absolute top-1.5 right-1.5 rounded-full"
              style={{ width: 5, height: 5, background: "var(--accent-red)" }}
            />
          </button>
          <ThemeToggle dark={dark} onChange={setDark} />
          {actions}
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left text-foreground transition-colors"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      <Icon size={14} stroke={1.75} className="text-muted-foreground" />
      <span>{label}</span>
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  tone = "default",
  icon: Icon,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "primary" | "go" | "nogo";
  icon?: any;
  type?: "button" | "submit";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-foreground text-background border-foreground hover:opacity-90"
      : tone === "go"
      ? "border-accent-green text-accent-green hover:bg-accent-green-bg"
      : tone === "nogo"
      ? "border-accent-red text-accent-red hover:bg-accent-red-bg"
      : "border-border/80 text-foreground bg-card hover:bg-secondary";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border whitespace-nowrap ${toneCls} transition-colors`}
      style={{
        padding: "6px 13px",
        fontSize: 12,
        fontWeight: 500,
        borderWidth: "0.5px",
      }}
    >
      {Icon && <Icon size={13} stroke={1.75} />}
      {children}
    </motion.button>
  );
}
