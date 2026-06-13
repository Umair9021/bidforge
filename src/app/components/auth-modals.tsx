import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getSupabase } from "../lib/supabase";
import {
  IconX,
  IconEye,
  IconEyeOff,
  IconBrandGoogle,
  IconLoader2,
  IconCheck,
  IconMail,
  IconAlertTriangle,
  IconArrowLeft,
  IconShieldCheck,
} from "@tabler/icons-react";

/* ---------------- Types ---------------- */
export type AuthMode =
  | "signin"
  | "signup"
  | "signup-success"
  | "otp"
  | "forgot"
  | "forgot-success"
  | "reset-otp"
  | "reset-password";

export type ConfirmConfig = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => Promise<void> | void;
};

/* ---------------- Modal shell ---------------- */
function ModalShell({
  open,
  onClose,
  children,
  maxWidth = 420,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background:
                "radial-gradient(70% 50% at 50% 30%, rgba(24,95,165,0.18), rgba(0,0,0,0.6))",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: 18, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full rounded-2xl overflow-hidden border border-border/80"
            style={{
              maxWidth,
              borderWidth: "0.5px",
              background: "color-mix(in srgb, var(--card) 94%, transparent)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-text-tertiary hover:text-foreground transition-colors z-10"
            >
              <IconX size={14} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Primitives ---------------- */
function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-1.5 text-foreground"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-md bg-background border outline-none transition-colors px-3 ${
        invalid
          ? "border-[color:var(--accent-red)] focus:border-[color:var(--accent-red)]"
          : "border-border/80 focus:border-[color:var(--accent-blue)]"
      } ${className ?? ""}`}
      style={{
        height: 38,
        borderWidth: "0.5px",
        fontSize: 13,
        ...(rest.style ?? {}),
      }}
    />
  );
}

function PrimaryButton({
  children,
  loading,
  tone = "default",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  tone?: "default" | "danger";
}) {
  const bg = tone === "danger" ? "var(--accent-red)" : "var(--foreground)";
  const fg = tone === "danger" ? "#fff" : "var(--background)";
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      {...(rest as any)}
      disabled={loading || rest.disabled}
      className={`relative inline-flex w-full items-center justify-center gap-2 rounded-md transition-opacity disabled:opacity-60 ${rest.className ?? ""}`}
      style={{
        height: 40,
        background: bg,
        color: fg,
        fontSize: 13,
        fontWeight: 600,
        ...(rest.style ?? {}),
      }}
    >
      {loading ? <IconLoader2 size={14} className="animate-spin" /> : children}
    </motion.button>
  );
}

function GhostButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-border/80 hover:bg-secondary transition-colors ${rest.className ?? ""}`}
      style={{
        height: 40,
        borderWidth: "0.5px",
        fontSize: 13,
        fontWeight: 500,
        ...(rest.style ?? {}),
      }}
    >
      {children}
    </button>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <div
      className="mt-1 flex items-center gap-1 text-[color:var(--accent-red)]"
      style={{ fontSize: 11 }}
    >
      <IconAlertTriangle size={11} />
      {children}
    </div>
  );
}

function Header({
  title,
  subtitle,
  id,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
}) {
  return (
    <div className="px-6 pt-7 pb-2 text-center">
      <h2 id={id} style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-1.5 text-muted-foreground"
          style={{ fontSize: 12.5, lineHeight: 1.55 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  }, [value]);
  const colors = [
    "var(--accent-red)",
    "var(--accent-amber)",
    "var(--accent-amber)",
    "var(--accent-green)",
  ];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!value) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-secondary overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{
                width: i < score ? "100%" : "0%",
                background: colors[Math.max(0, score - 1)],
              }}
              transition={{ duration: 0.25 }}
              className="h-full rounded-full"
            />
          </div>
        ))}
      </div>
      <div className="mt-1 text-text-tertiary" style={{ fontSize: 10.5 }}>
        Password strength · {labels[Math.max(0, score - 1)]}
      </div>
    </div>
  );
}

/* ---------------- Sign In ---------------- */
export function SignInDialog({
  open,
  onClose,
  onSuccess,
  onSwitch,
  onForgot,
  onNeedsVerification,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitch: () => void;
  onForgot: () => void;
  onNeedsVerification?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setLoading(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (password.length < 6) next.password = "Password is too short";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error(`Sign-in error for ${email}: ${error.message}`);
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("not confirmed") || msg.includes("confirm")) {
          // Account exists but the email was never verified — resend the code
          // and send the user to the OTP screen.
          await getSupabase().auth.resend({ type: "signup", email });
          onNeedsVerification?.(email);
          return;
        }
        if (msg.includes("invalid login credentials")) {
          setErrors({
            form:
              "Email or password is incorrect. If you just signed up, verify your email first — or create an account.",
          });
          return;
        }
        setErrors({ form: error.message || "Invalid email or password" });
        return;
      }
      onSuccess();
    } catch (err) {
      console.error(`Unexpected sign-in error for ${email}: ${err}`);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error(`Google sign-in error: ${error.message}`);
      setErrors({ form: error.message });
    }
    // Browser will redirect to Google; no further action needed here.
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="signin-title">
      <Header
        id="signin-title"
        title="Welcome back"
        subtitle="Sign in to continue to BidForge"
      />
      <form onSubmit={submit} className="px-6 pb-6 pt-3 space-y-3">
        <div>
          <Label htmlFor="si-email">Email</Label>
          <Input
            id="si-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!errors.email}
            autoFocus
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="si-pw">Password</Label>
            <button
              type="button"
              onClick={onForgot}
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 11 }}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="si-pw"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!errors.password}
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-text-tertiary"
            >
              {show ? <IconEyeOff size={13} /> : <IconEye size={13} />}
            </button>
          </div>
          <FieldError>{errors.password}</FieldError>
        </div>
        <label className="flex items-center gap-2 select-none" style={{ fontSize: 12 }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-border/80"
          />
          <span className="text-muted-foreground">Remember me on this device</span>
        </label>

        <FieldError>{errors.form}</FieldError>

        <PrimaryButton type="submit" loading={loading}>
          Sign in
        </PrimaryButton>

        <Divider>or</Divider>
        <GhostButton type="button" className="w-full" onClick={signInWithGoogle}>
          <IconBrandGoogle size={14} /> Continue with Google
        </GhostButton>

        <div className="text-center text-muted-foreground" style={{ fontSize: 12 }}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-foreground hover:underline"
            style={{ fontWeight: 600 }}
          >
            Sign up
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------------- Sign Up ---------------- */
export function SignUpDialog({
  open,
  onClose,
  onRegistered,
  onSwitch,
}: {
  open: boolean;
  onClose: () => void;
  onRegistered: (email: string) => void;
  onSwitch: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setLoading(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (password.length < 8) next.password = "Use at least 8 characters";
    if (confirm !== password) next.confirm = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      // Create the account client-side. With "Confirm email" enabled in Supabase,
      // this sends a one-time verification code to the user's inbox. No session is
      // created until the code is verified on the next screen (verifyOtp).
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error(`Signup failed for ${email}: ${error.message}`);
        const msg = (error.message || "").toLowerCase();
        setErrors({
          form: msg.includes("already")
            ? "An account with this email already exists. Try signing in."
            : msg.includes("rate limit")
              ? "Too many attempts. Please wait a few minutes before trying again."
              : error.message || "Could not create account",
        });
        return;
      }

      // If the project has email confirmation disabled, a session is returned
      // immediately and we can skip the OTP step.
      if (data.session) {
        onRegistered(email);
        return;
      }

      // Otherwise move to the OTP verification screen.
      onRegistered(email);
    } catch (err) {
      console.error(`Unexpected signup error for ${email}: ${err}`);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error(`Google sign-up error: ${error.message}`);
      setErrors({ form: error.message });
    }
    // Browser will redirect to Google; no further action needed here.
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="signup-title">
      <Header
        id="signup-title"
        title="Create your account"
        subtitle="Start winning more bids in under 2 minutes"
      />
      <form onSubmit={submit} className="px-6 pb-6 pt-3 space-y-3">
        <div>
          <Label htmlFor="su-name">Full name</Label>
          <Input
            id="su-name"
            autoComplete="name"
            placeholder="Maya Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={!!errors.name}
            autoFocus
          />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="su-email">Email</Label>
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!errors.email}
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="su-pw">Password</Label>
          <div className="relative">
            <Input
              id="su-pw"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!errors.password}
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-text-tertiary"
            >
              {show ? <IconEyeOff size={13} /> : <IconEye size={13} />}
            </button>
          </div>
          <PasswordStrength value={password} />
          <FieldError>{errors.password}</FieldError>
        </div>
        <div>
          <Label htmlFor="su-confirm">Confirm password</Label>
          <Input
            id="su-confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            invalid={!!errors.confirm}
          />
          <FieldError>{errors.confirm}</FieldError>
        </div>

        <FieldError>{errors.form}</FieldError>

        <PrimaryButton type="submit" loading={loading}>
          Create account
        </PrimaryButton>

        <Divider>or</Divider>
        <GhostButton type="button" className="w-full" onClick={signUpWithGoogle}>
          <IconBrandGoogle size={14} /> Continue with Google
        </GhostButton>

        <div className="text-center text-muted-foreground" style={{ fontSize: 12 }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-foreground hover:underline"
            style={{ fontWeight: 600 }}
          >
            Sign in
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------------- OTP ---------------- */
export function OtpDialog({
  open,
  onClose,
  email,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}) {
  const length = 8;
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(45);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      setCode(Array(length).fill(""));
      setVerified(false);
      setError(null);
      setLoading(false);
      setCountdown(45);
      setTimeout(() => refs.current[0]?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [open, countdown]);

  const setDigit = (i: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setCode(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const joined = code.join("");
    if (joined.length < length) {
      setError(`Enter all ${length} digits`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Verify the email confirmation code. Supabase opens a session on success,
      // but we immediately sign back out so the user must explicitly sign in to
      // reach the dashboard (verification only confirms the email address).
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email,
        token: joined,
        type: "signup",
      });
      if (verifyError) {
        console.error(`OTP verification failed for ${email}: ${verifyError.message}`);
        setError(
          verifyError.message?.toLowerCase().includes("expired")
            ? "That code has expired. Request a new one."
            : "Invalid code. Please check and try again.",
        );
        setLoading(false);
        return;
      }
      await getSupabase().auth.signOut();
      setLoading(false);
      setVerified(true);
      setTimeout(() => onVerified(), 900);
    } catch (err) {
      console.error(`Unexpected OTP error for ${email}: ${err}`);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setError(null);
    const { error: resendError } = await getSupabase().auth.resend({
      type: "signup",
      email,
    });
    if (resendError) {
      console.error(`OTP resend failed for ${email}: ${resendError.message}`);
      setError(resendError.message);
      return;
    }
    setCountdown(45);
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="otp-title">
      <Header
        id="otp-title"
        title="Verify your email"
        subtitle={
          <>
            We sent an 8-digit code to <strong>{email}</strong>
          </>
        }
      />
      <AnimatePresence mode="wait">
        {verified ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-8 pt-3 flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: "rgba(99,153,34,0.18)", color: "var(--accent-green)" }}
            >
              <IconCheck size={26} />
            </motion.div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Email verified</div>
            <div className="mt-1 text-muted-foreground" style={{ fontSize: 12 }}>
              Now sign in to open your workspace…
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-6 pt-3 space-y-4"
          >
            <div className="flex justify-center gap-1.5" onPaste={onPaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  className="w-9 sm:w-10 text-center rounded-md bg-background border border-border/80 outline-none focus:border-[color:var(--accent-blue)] tabular-nums"
                  style={{
                    height: 46,
                    borderWidth: "0.5px",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
            <FieldError>{error ?? undefined}</FieldError>

            <PrimaryButton type="submit" loading={loading}>
              Verify account
            </PrimaryButton>
            <div className="text-center text-muted-foreground" style={{ fontSize: 12 }}>
              {countdown > 0 ? (
                <>Didn't get a code? Resend in {countdown}s</>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  className="text-foreground hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Resend code
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}

/* ---------------- Forgot Password ---------------- */
export function ForgotPasswordDialog({
  open,
  onClose,
  onSent,
  onBack,
}: {
  open: boolean;
  onClose: () => void;
  onSent: (email: string) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Send a one-time code via email using the same OTP mechanism as signup.
      const { error: otpError } = await getSupabase().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpError) {
        console.error(`Password reset OTP error for ${email}: ${otpError.message}`);
        const msg = (otpError.message || "").toLowerCase();
        setError(
          msg.includes("not found") || msg.includes("no user")
            ? "No account found with that email address."
            : otpError.message,
        );
        return;
      }
      onSent(email);
    } catch (err) {
      console.error(`Unexpected password reset error for ${email}: ${err}`);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="forgot-title">
      <Header
        id="forgot-title"
        title="Reset your password"
        subtitle="Enter your email and we'll send a verification code"
      />
      <form onSubmit={submit} className="px-6 pb-6 pt-3 space-y-3">
        <div>
          <Label htmlFor="fp-email">Email</Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!error}
            autoFocus
          />
          <FieldError>{error ?? undefined}</FieldError>
        </div>
        <PrimaryButton type="submit" loading={loading}>
          Send reset link
        </PrimaryButton>
        <GhostButton type="button" onClick={onBack} className="w-full">
          <IconArrowLeft size={13} /> Back to sign in
        </GhostButton>
      </form>
    </ModalShell>
  );
}

/* ---------------- Reset Password OTP ---------------- */
export function ResetOtpDialog({
  open,
  onClose,
  email,
  onVerified,
  onBack,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const length = 6;
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(45);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      setCode(Array(length).fill(""));
      setError(null);
      setLoading(false);
      setCountdown(45);
      setTimeout(() => refs.current[0]?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [open, countdown]);

  const setDigit = (i: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setCode(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const joined = code.join("");
    if (joined.length < length) {
      setError(`Enter all ${length} digits`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Verify the OTP sent via signInWithOtp; this creates a session we'll use
      // to update the password on the next screen.
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email,
        token: joined,
        type: "email",
      });
      if (verifyError) {
        console.error(`Reset OTP verification failed for ${email}: ${verifyError.message}`);
        setError(
          verifyError.message?.toLowerCase().includes("expired")
            ? "That code has expired. Request a new one."
            : "Invalid code. Please check and try again.",
        );
        setLoading(false);
        return;
      }
      setLoading(false);
      onVerified();
    } catch (err) {
      console.error(`Unexpected reset OTP error for ${email}: ${err}`);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setError(null);
    const { error: resendError } = await getSupabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (resendError) {
      console.error(`Reset OTP resend failed for ${email}: ${resendError.message}`);
      setError(resendError.message);
      return;
    }
    setCountdown(45);
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="reset-otp-title">
      <Header
        id="reset-otp-title"
        title="Enter verification code"
        subtitle={
          <>
            We sent a {length}-digit code to <strong>{email}</strong>
          </>
        }
      />
      <form onSubmit={submit} className="px-6 pb-6 pt-3 space-y-4">
        <div className="flex justify-center gap-1.5" onPaste={onPaste}>
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="w-10 sm:w-12 text-center rounded-md bg-background border border-border/80 outline-none focus:border-[color:var(--accent-blue)] tabular-nums"
              style={{ height: 50, borderWidth: "0.5px", fontSize: 20, fontWeight: 600 }}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        <FieldError>{error ?? undefined}</FieldError>

        <PrimaryButton type="submit" loading={loading}>
          Verify code
        </PrimaryButton>
        <GhostButton type="button" onClick={onBack} className="w-full">
          <IconArrowLeft size={13} /> Back
        </GhostButton>
        <div className="text-center text-muted-foreground" style={{ fontSize: 12 }}>
          {countdown > 0 ? (
            <>Didn't get a code? Resend in {countdown}s</>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="text-foreground hover:underline"
              style={{ fontWeight: 600 }}
            >
              Resend code
            </button>
          )}
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------------- New Password ---------------- */
export function NewPasswordDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirm("");
      setErrors({});
      setLoading(false);
      setDone(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "Use at least 8 characters";
    if (confirm !== password) next.confirm = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const { error } = await getSupabase().auth.updateUser({ password });
      if (error) {
        console.error(`Password update error: ${error.message}`);
        setErrors({ form: error.message || "Could not update password" });
        return;
      }
      await getSupabase().auth.signOut();
      setDone(true);
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      console.error(`Unexpected password update error: ${err}`);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="newpw-title">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-8 pt-8 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: "rgba(99,153,34,0.18)", color: "var(--accent-green)" }}
            >
              <IconCheck size={26} />
            </motion.div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Password updated</div>
            <div className="mt-1 text-muted-foreground" style={{ fontSize: 12 }}>
              Redirecting you to sign in…
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Header
              id="newpw-title"
              title="Set new password"
              subtitle="Choose a strong password for your account"
            />
            <form onSubmit={submit} className="px-6 pb-6 pt-3 space-y-3">
              <div>
                <Label htmlFor="np-pw">New password</Label>
                <div className="relative">
                  <Input
                    id="np-pw"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    invalid={!!errors.password}
                    style={{ paddingRight: 36 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-text-tertiary"
                  >
                    {show ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                  </button>
                </div>
                <PasswordStrength value={password} />
                <FieldError>{errors.password}</FieldError>
              </div>
              <div>
                <Label htmlFor="np-confirm">Confirm password</Label>
                <Input
                  id="np-confirm"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  invalid={!!errors.confirm}
                />
                <FieldError>{errors.confirm}</FieldError>
              </div>
              <FieldError>{errors.form}</FieldError>
              <PrimaryButton type="submit" loading={loading}>
                Update password
              </PrimaryButton>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}

/** @deprecated Use ResetOtpDialog instead */
export function ForgotSuccessDialog({
  open,
  onClose,
  onBackToSignIn,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onBackToSignIn: () => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose} labelledBy="forgot-ok-title">
      <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
          style={{ background: "rgba(24,95,165,0.18)", color: "var(--accent-blue)" }}>
          <IconMail size={24} />
        </div>
        <h2 id="forgot-ok-title" style={{ fontSize: 18, fontWeight: 700 }}>Check your inbox</h2>
        <div className="w-full mt-5">
          <PrimaryButton onClick={onBackToSignIn}>Return to sign in</PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------------- Sign-up success (email confirmation link) ---------------- */
export function SignupSuccessDialog({
  open,
  onClose,
  email,
  onBackToSignIn,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onBackToSignIn: () => void;
}) {
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (open) {
      setResent(false);
      setResending(false);
    }
  }, [open]);

  const resend = async () => {
    setResending(true);
    const { error } = await getSupabase().auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      console.error(`Could not resend confirmation link to ${email}: ${error.message}`);
      return;
    }
    setResent(true);
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="signup-ok-title">
      <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
          className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
          style={{ background: "rgba(24,95,165,0.18)", color: "var(--accent-blue)" }}
        >
          <IconMail size={24} />
        </motion.div>
        <h2 id="signup-ok-title" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Confirm your email
        </h2>
        <p className="mt-1.5 text-muted-foreground" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click the link in
          that email to verify your account, then come back and sign in.
        </p>
        <div className="w-full mt-5">
          <PrimaryButton onClick={onBackToSignIn}>Back to sign in</PrimaryButton>
        </div>
        <div className="mt-3 text-text-tertiary" style={{ fontSize: 11.5 }}>
          {resent ? (
            <span className="inline-flex items-center gap-1 text-[color:var(--accent-green)]">
              <IconCheck size={12} /> Confirmation link sent again
            </span>
          ) : (
            <>
              Didn't get it?{" "}
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="text-foreground hover:underline disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                {resending ? "Sending…" : "Resend link"}
              </button>
            </>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------------- Confirmation ---------------- */
export function ConfirmDialog({
  open,
  config,
  onClose,
}: {
  open: boolean;
  config: ConfirmConfig | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(false);
      setDone(false);
    }
  }, [open]);

  if (!config) return null;
  const tone = config.tone ?? "default";

  const run = async () => {
    setLoading(true);
    try {
      await config.onConfirm();
      setDone(true);
      setTimeout(() => onClose(), 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="confirm-title" maxWidth={400}>
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background:
                tone === "danger"
                  ? "rgba(220,69,69,0.16)"
                  : "rgba(24,95,165,0.16)",
              color: tone === "danger" ? "var(--accent-red)" : "var(--accent-blue)",
            }}
          >
            {tone === "danger" ? (
              <IconAlertTriangle size={18} />
            ) : (
              <IconShieldCheck size={18} />
            )}
          </div>
          <div className="flex-1">
            <h2
              id="confirm-title"
              style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              {config.title}
            </h2>
            <div
              className="mt-1 text-muted-foreground"
              style={{ fontSize: 12.5, lineHeight: 1.55 }}
            >
              {config.message}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <GhostButton onClick={onClose} className="flex-1" disabled={loading}>
            {config.cancelLabel ?? "Cancel"}
          </GhostButton>
          <div className="flex-1">
            <PrimaryButton
              onClick={run}
              loading={loading}
              tone={tone}
            >
              {done ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconCheck size={14} /> Done
                </span>
              ) : (
                config.confirmLabel ?? "Confirm"
              )}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------------- Divider ---------------- */
function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-border/80" />
      <span className="text-text-tertiary" style={{ fontSize: 10.5 }}>
        {children}
      </span>
      <div className="flex-1 h-px bg-border/80" />
    </div>
  );
}

/* ---------------- Controller hook ---------------- */
export function useAuthFlow({
  onAuthenticated,
}: {
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [email, setEmail] = useState("");

  return {
    mode,
    email,
    open: (m: AuthMode) => setMode(m),
    close: () => setMode(null),
    render: () => (
      <>
        <SignInDialog
          open={mode === "signin"}
          onClose={() => setMode(null)}
          onSuccess={() => {
            setMode(null);
            onAuthenticated();
          }}
          onSwitch={() => setMode("signup")}
          onForgot={() => setMode("forgot")}
          onNeedsVerification={(e) => {
            setEmail(e);
            // Account exists but email isn't confirmed — resend the code and show
            // the verification screen.
            setMode("otp");
          }}
        />
        <SignUpDialog
          open={mode === "signup"}
          onClose={() => setMode(null)}
          onRegistered={(e) => {
            setEmail(e);
            // First-time signups must confirm their email with the 6-digit code.
            setMode("otp");
          }}
          onSwitch={() => setMode("signin")}
        />
        <OtpDialog
          open={mode === "otp"}
          email={email}
          onClose={() => setMode(null)}
          onVerified={() => {
            // Email confirmed; the user must now sign in to open the dashboard.
            setMode("signin");
          }}
        />
        <SignupSuccessDialog
          open={mode === "signup-success"}
          email={email}
          onClose={() => setMode(null)}
          onBackToSignIn={() => setMode("signin")}
        />
        <ForgotPasswordDialog
          open={mode === "forgot"}
          onClose={() => setMode(null)}
          onSent={(e) => {
            setEmail(e);
            setMode("reset-otp");
          }}
          onBack={() => setMode("signin")}
        />
        <ResetOtpDialog
          open={mode === "reset-otp"}
          email={email}
          onClose={() => setMode(null)}
          onVerified={() => setMode("reset-password")}
          onBack={() => setMode("forgot")}
        />
        <NewPasswordDialog
          open={mode === "reset-password"}
          onClose={() => setMode(null)}
          onSuccess={() => setMode("signin")}
        />
      </>
    ),
  };
}

export function useConfirm() {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [open, setOpen] = useState(false);
  return {
    confirm: (c: ConfirmConfig) => {
      setConfig(c);
      setOpen(true);
    },
    render: () => (
      <ConfirmDialog
        open={open}
        config={config}
        onClose={() => setOpen(false)}
      />
    ),
  };
}
