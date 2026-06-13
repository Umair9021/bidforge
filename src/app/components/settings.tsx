import { useEffect, useRef, useState } from "react";
import {
  IconUser,
  IconBell,
  IconShieldLock,
  IconTrash,
  IconCheck,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconCamera,
  IconQrcode,
  IconShieldCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { OutlineButton } from "./shell";
import { getSupabase } from "../lib/supabase";
import { projectId, publicAnonKey } from "/utils/supabase/info";

type SectionKey = "profile" | "notifications" | "security";

const SECTIONS: { key: SectionKey; label: string; icon: any; hint: string }[] = [
  { key: "profile", label: "Profile", icon: IconUser, hint: "Your account info" },
  { key: "notifications", label: "Notifications", icon: IconBell, hint: "Alerts and digests" },
  { key: "security", label: "Security", icon: IconShieldLock, hint: "Password and 2FA" },
];

export function Settings({
  onProfileUpdate,
}: {
  dark?: boolean;
  setDark?: (b: boolean) => void;
  onProfileUpdate?: () => void;
}) {
  const [active, setActive] = useState<SectionKey>("profile");

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-7 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Side nav */}
        <aside className="lg:sticky lg:top-4 self-start">
          <div
            className="mb-2 px-2 text-text-tertiary uppercase"
            style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 600 }}
          >
            Settings
          </div>
          <nav className="flex lg:block overflow-x-auto scrollbar-none gap-1 lg:gap-0 lg:space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={`relative shrink-0 flex items-center gap-2 px-3 py-2 rounded-md w-full text-left transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                  style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}
                >
                  <Icon size={14} stroke={1.75} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="min-w-0"
        >
          {active === "profile" && <ProfilePanel onProfileUpdate={onProfileUpdate} />}
          {active === "notifications" && <NotificationsPanel />}
          {active === "security" && <SecurityPanel />}
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

function Card({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="bg-card border border-border/80 rounded-lg mb-4 overflow-hidden"
      style={{ borderWidth: "0.5px" }}
    >
      <div className="px-5 pt-4 pb-3">
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        {description && (
          <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>
            {description}
          </div>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
      {footer && (
        <div
          className="px-5 py-3 border-t border-border/80 bg-secondary/40 flex justify-end gap-2"
          style={{ borderTopWidth: "0.5px" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block mb-1 text-foreground" style={{ fontSize: 11, fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {hint && (
        <div className="text-text-tertiary mt-1" style={{ fontSize: 10 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full bg-background border rounded-md px-3 py-2 text-foreground outline-none focus:border-foreground/50 transition-colors ${
        invalid ? "border-[color:var(--accent-red)]" : "border-border/80"
      } ${className ?? ""}`}
      style={{ fontSize: 12, borderWidth: "0.5px", ...(rest.style ?? {}) }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-background border border-border/80 rounded-md px-3 py-2 text-foreground outline-none focus:border-foreground/50 transition-colors ${
        props.className ?? ""
      }`}
      style={{ fontSize: 12, borderWidth: "0.5px" }}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        {description && (
          <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>
            {description}
          </div>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-secondary"
        }`}
        style={{ width: 32, height: 18 }}
      >
        <motion.span
          animate={{ x: checked ? 15 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-[2px] rounded-full bg-background shadow"
          style={{ width: 14, height: 14 }}
        />
      </button>
    </div>
  );
}

function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <div className="mt-1 flex items-center gap-1 text-[color:var(--accent-red)]" style={{ fontSize: 11 }}>
      <IconAlertTriangle size={11} />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile panel                                                        */
/* ------------------------------------------------------------------ */

function ProfilePanel({ onProfileUpdate }: { onProfileUpdate?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Bid Manager");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      setName(meta.name ?? meta.full_name ?? user.email?.split("@")[0] ?? "");
      setEmail(user.email ?? "");
      setRole(meta.role ?? "Bid Manager");
      if (meta.avatar_path) {
        getSupabase().auth.getSession().then(({ data: { session } }) => {
          const token = session?.access_token ?? publicAnonKey;
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b819b135/avatar`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((j) => { if (j.url) setAvatarUrl(j.url); })
            .catch(() => {});
        });
      }
    });
  }, []);

  const save = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setError(null);
    setLoading(true);
    try {
      const { error: updateErr } = await getSupabase().auth.updateUser({
        data: { name: name.trim(), role },
      });
      if (updateErr) {
        console.error(`Profile update error: ${updateErr.message}`);
        setError(updateErr.message);
        return;
      }
      toast.success("Profile updated");
      onProfileUpdate?.();
    } catch (err) {
      console.error(`Unexpected profile update error: ${err}`);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2 MB"); return; }

    setUploading(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const token = session?.access_token ?? publicAnonKey;

      const form = new FormData();
      form.append("file", file);
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b819b135/avatar`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form },
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Upload failed");
        return;
      }
      setAvatarUrl(json.url);
      toast.success("Photo updated");
      onProfileUpdate?.();
    } catch (err) {
      console.error(`Avatar upload error: ${err}`);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card
      title="Profile"
      description="This information appears across BidForge."
      footer={
        <OutlineButton
          tone="primary"
          icon={loading ? undefined : IconCheck}
          onClick={save}
        >
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <IconLoader2 size={12} className="animate-spin" /> Saving…
            </span>
          ) : (
            "Save changes"
          )}
        </OutlineButton>
      }
    >
      {/* Avatar upload */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center"
              style={{ fontSize: 18, fontWeight: 600 }}
            >
              {initials || <IconUser size={22} stroke={1.75} />}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border/80 flex items-center justify-center hover:bg-secondary transition-colors"
            style={{ borderWidth: "0.5px" }}
            title="Change photo"
          >
            {uploading ? (
              <IconLoader2 size={11} className="animate-spin text-muted-foreground" />
            ) : (
              <IconCamera size={11} className="text-muted-foreground" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{name || "Your name"}</div>
          <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>
            PNG or JPG, max 2 MB
          </div>
        </div>
      </div>

      <FieldError>{error}</FieldError>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email" hint="Contact support to change your email.">
          <Input type="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
        </Field>
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Bid Manager</option>
            <option>Proposal Writer</option>
            <option>Capture Lead</option>
            <option>Reviewer</option>
            <option>Admin</option>
          </Select>
        </Field>
        <Field label="Timezone">
          <Select defaultValue="America/New_York">
            <option>America/New_York</option>
            <option>America/Los_Angeles</option>
            <option>Europe/London</option>
            <option>Asia/Kolkata</option>
            <option>Asia/Singapore</option>
          </Select>
        </Field>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications panel                                                  */
/* ------------------------------------------------------------------ */

function NotificationsPanel() {
  const [bidUpdates, setBidUpdates] = useState(true);
  const [compliance, setCompliance] = useState(true);
  const [digest, setDigest] = useState(false);
  const [mentions, setMentions] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const all = [bidUpdates, compliance, digest, mentions, marketing];
  const allOn = all.every(Boolean);
  const allOff = all.every((v) => !v);

  const toggleAll = () => {
    const next = !allOn;
    setBidUpdates(next);
    setCompliance(next);
    setDigest(next);
    setMentions(next);
    setMarketing(next);
  };

  return (
    <Card
      title="Notifications"
      description="Choose what we send and where."
      footer={
        <div className="flex items-center gap-2 w-full justify-between">
          <button
            onClick={toggleAll}
            className="text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {allOn ? "Turn all off" : "Turn all on"}
          </button>
          <OutlineButton tone="primary" onClick={() => toast.success("Preferences saved")}>
            Save
          </OutlineButton>
        </div>
      }
    >
      <div className="divide-y divide-border/60">
        <Toggle
          checked={bidUpdates}
          onChange={setBidUpdates}
          label="Bid activity"
          description="Status changes, deadline reminders, win-probability shifts"
        />
        <Toggle
          checked={compliance}
          onChange={setCompliance}
          label="Compliance alerts"
          description="Failed checks and missing controls"
        />
        <Toggle
          checked={mentions}
          onChange={setMentions}
          label="Mentions and comments"
          description="When teammates @ you in a workspace"
        />
        <Toggle
          checked={digest}
          onChange={setDigest}
          label="Daily digest"
          description="One email summary at 8:00 AM in your timezone"
        />
        <Toggle
          checked={marketing}
          onChange={setMarketing}
          label="Product updates"
          description="Occasional emails about new features"
        />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Security panel                                                       */
/* ------------------------------------------------------------------ */

function SecurityPanel() {
  return (
    <>
      <PasswordCard />
      <TwoFACard />
      <Card title="Danger zone" description="Irreversible account actions.">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Delete account</div>
            <div className="text-text-tertiary" style={{ fontSize: 11 }}>
              Permanently remove your account and all related data.
            </div>
          </div>
          <OutlineButton
            tone="nogo"
            icon={IconTrash}
            onClick={() => toast.error("Account deletion requires admin approval")}
          >
            Delete
          </OutlineButton>
        </div>
      </Card>
    </>
  );
}

function PasswordCard() {
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (newPw.length < 8) next.newPw = "Use at least 8 characters";
    if (confirm !== newPw) next.confirm = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const { error } = await getSupabase().auth.updateUser({ password: newPw });
      if (error) {
        console.error(`Password update error: ${error.message}`);
        setErrors({ form: error.message || "Could not update password" });
        return;
      }
      setNewPw("");
      setConfirm("");
      toast.success("Password updated");
    } catch (err) {
      console.error(`Unexpected password update error: ${err}`);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Password">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="New password">
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="At least 8 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                invalid={!!errors.newPw}
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-text-tertiary hover:text-foreground"
              >
                {showNew ? <IconEyeOff size={13} /> : <IconEye size={13} />}
              </button>
            </div>
            <FieldError>{errors.newPw}</FieldError>
          </Field>
          <Field label="Confirm new password">
            <Input
              type={showNew ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              invalid={!!errors.confirm}
            />
            <FieldError>{errors.confirm}</FieldError>
          </Field>
        </div>
        <FieldError>{errors.form}</FieldError>
        <OutlineButton type="submit" tone="primary">
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <IconLoader2 size={12} className="animate-spin" /> Updating…
            </span>
          ) : (
            "Update password"
          )}
        </OutlineButton>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* TOTP 2FA card                                                        */
/* ------------------------------------------------------------------ */

type TwoFAStep = "idle" | "enrolling" | "verifying" | "enabled";

function TwoFACard() {
  const [step, setStep] = useState<TwoFAStep>("idle");
  const [factorId, setFactorId] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null);

  // Check if TOTP is already enrolled on mount
  useEffect(() => {
    getSupabase().auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find((f) => f.status === "verified");
      if (verified) {
        setEnrolledFactorId(verified.id);
        setStep("enabled");
      }
    });
  }, []);

  const startEnroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: enrollErr } = await getSupabase().auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "BidForge Authenticator",
      });
      if (enrollErr || !data) {
        console.error(`MFA enroll error: ${enrollErr?.message}`);
        setError(enrollErr?.message ?? "Could not start enrollment");
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep("enrolling");
    } catch (err) {
      console.error(`Unexpected MFA enroll error: ${err}`);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: verifyErr } = await getSupabase().auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (verifyErr) {
        console.error(`MFA verify error: ${verifyErr.message}`);
        setError(
          verifyErr.message?.toLowerCase().includes("invalid")
            ? "Invalid code — check your authenticator app and try again."
            : verifyErr.message,
        );
        return;
      }
      setEnrolledFactorId(factorId);
      setStep("enabled");
      setCode("");
      toast.success("Two-factor authentication enabled");
    } catch (err) {
      console.error(`Unexpected MFA verify error: ${err}`);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!enrolledFactorId) return;
    setLoading(true);
    setError(null);
    try {
      const { error: unenrollErr } = await getSupabase().auth.mfa.unenroll({
        factorId: enrolledFactorId,
      });
      if (unenrollErr) {
        console.error(`MFA unenroll error: ${unenrollErr.message}`);
        setError(unenrollErr.message);
        return;
      }
      setEnrolledFactorId(null);
      setStep("idle");
      toast.success("Two-factor authentication disabled");
    } catch (err) {
      console.error(`Unexpected MFA unenroll error: ${err}`);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Two-factor authentication"
      description="Add an extra layer of security with an authenticator app."
    >
      {step === "idle" && (
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(24,95,165,0.14)", color: "var(--accent-blue)" }}
          >
            <IconShieldLock size={17} stroke={1.75} />
          </div>
          <div className="flex-1">
            <div style={{ fontSize: 12, fontWeight: 500 }}>Authenticator app (TOTP)</div>
            <div className="text-text-tertiary mt-0.5 mb-3" style={{ fontSize: 11 }}>
              Use Google Authenticator, Authy, or any TOTP app to generate codes.
            </div>
            <FieldError>{error}</FieldError>
            <OutlineButton tone="primary" icon={IconQrcode} onClick={startEnroll}>
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconLoader2 size={12} className="animate-spin" /> Setting up…
                </span>
              ) : (
                "Set up authenticator"
              )}
            </OutlineButton>
          </div>
        </div>
      )}

      {step === "enrolling" && (
        <div className="space-y-4">
          <div style={{ fontSize: 12 }} className="text-muted-foreground">
            Scan this QR code with your authenticator app, then enter the 6-digit code below.
          </div>
          {/* QR Code — Supabase returns an SVG data URL */}
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-lg border border-border/80" style={{ borderWidth: "0.5px" }}>
              <img src={qrCode} alt="QR code for 2FA setup" width={160} height={160} />
            </div>
          </div>
          {/* Manual entry fallback */}
          <details className="text-center">
            <summary className="text-muted-foreground cursor-pointer" style={{ fontSize: 11 }}>
              Can't scan? Enter manually
            </summary>
            <div
              className="mt-2 font-mono bg-secondary rounded-md px-3 py-2 break-all text-center"
              style={{ fontSize: 11, letterSpacing: "0.08em" }}
            >
              {secret}
            </div>
          </details>
          <form onSubmit={verifyCode} className="space-y-2">
            <Field label="Verification code">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center tracking-widest"
                style={{ fontSize: 18, fontWeight: 600, letterSpacing: "0.2em" }}
                autoFocus
              />
            </Field>
            <FieldError>{error}</FieldError>
            <div className="flex gap-2">
              <OutlineButton type="submit" tone="primary">
                {loading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <IconLoader2 size={12} className="animate-spin" /> Verifying…
                  </span>
                ) : (
                  "Verify & enable"
                )}
              </OutlineButton>
              <OutlineButton onClick={() => { setStep("idle"); setCode(""); setError(null); }}>
                Cancel
              </OutlineButton>
            </div>
          </form>
        </div>
      )}

      {step === "enabled" && (
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(99,153,34,0.14)", color: "var(--accent-green)" }}
          >
            <IconShieldCheck size={17} stroke={1.75} />
          </div>
          <div className="flex-1">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-green)" }}>
              Two-factor authentication is active
            </div>
            <div className="text-text-tertiary mt-0.5 mb-3" style={{ fontSize: 11 }}>
              Your account is protected with TOTP. You'll need your authenticator app on every sign-in.
            </div>
            <FieldError>{error}</FieldError>
            <OutlineButton tone="nogo" onClick={disable2FA}>
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconLoader2 size={12} className="animate-spin" /> Disabling…
                </span>
              ) : (
                "Disable 2FA"
              )}
            </OutlineButton>
          </div>
        </div>
      )}
    </Card>
  );
}
