"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Eye, EyeOff, Lock, LogIn, Mail, RefreshCw, Send } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { isAdminRole } from "@/lib/roles";

type LoginFailure = {
  status?: string;
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

function getReturnTo(): string {
  try {
    const value = new URLSearchParams(window.location.search).get("returnTo");
    if (value && value.startsWith("/") && !value.startsWith("//")) {
      return value;
    }
  } catch {
    /* Fall through to the home page. */
  }
  return "/";
}

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Timer for cooldown
  if (cooldown > 0) {
    setTimeout(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  }

  async function handleForgotSubmit(event?: React.FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    if (cooldown > 0 || forgotSubmitting) return;

    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setForgotSubmitting(true);
    try {
      const response = await fetch("/api/public/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Unable to send reset link.");
      }

      setForgotSuccess(true);
      setCooldown(60);
      toast.success(`Password reset link sent to ${targetEmail}.`);
    } catch (caught) {
      const errMsg =
        caught instanceof Error ? caught.message : "Unable to send reset link.";
      toast.error(errMsg);
    } finally {
      setForgotSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/public/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      
      if (!response.ok) {
        throw new Error(payload.message || "Unable to sign in.");
      }

      // Store token and user data for frontend usage
      if (payload.data?.token) {
        localStorage.setItem("token", payload.data.token);
      }
      if (payload.data?.user) {
        localStorage.setItem("user", JSON.stringify(payload.data.user));
      }
      
      // Dispatch event to sync Header
      window.dispatchEvent(new Event("auth-changed"));
      
      toast.success("Successfully signed in!");
      
      if (isAdminRole(payload.data?.user?.role) && payload.data?.token) {
        // Sync the token into the secure HTTP-only cookie required by the admin console
        await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncToken: payload.data.token }),
        });
        window.location.replace("/admin");
      } else {
        router.push(getReturnTo());
      }
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="app-login public-auth-page">
      <div className="app-login-frame public-auth-frame public-auth-frame-narrow">
            <div className="app-login-logo">
              <Image
                src="/images/ui/logo2.png"
                alt="Success Code Academy"
                width={212}
                height={68}
                priority
                style={{ width: "auto", height: 42, objectFit: "contain" }}
              />
            </div>

            {mode === "login" ? (
              <>
                <p className="app-login-frame-label">Student sign in</p>
                <form className="app-login-form" onSubmit={handleSubmit} noValidate>
              <div className="app-login-field">
                <label className="sr-only" htmlFor="email">Email address</label>
                <div className="app-login-control">
                  <Mail size={15} className="app-login-control-icon" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email address"
                    required
                  />
                </div>
              </div>

              <div className="app-login-field">
                <label className="sr-only" htmlFor="password">Password</label>
                <div className="app-login-control">
                  <Lock size={15} className="app-login-control-icon" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="app-login-password-toggle"
                    onClick={() => setShowPassword((open) => !open)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="app-login-forgot-row" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '24px' }}>
                <button
                  type="button"
                  className="app-login-forgot-link"
                  onClick={() => {
                    setMode("forgot");
                    setForgotEmail(email);
                    setForgotSuccess(false);
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--brand-primary)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
              </div>
              
              <button
                className="app-login-submit"
                type="submit"
                disabled={submitting || !email || !password}
              >
                {submitting ? (
                  <>
                    <span className="app-login-spinner" aria-hidden="true" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <LogIn size={15} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Don&apos;t have an account? </span>
              <Link href={`/signup${typeof window !== "undefined" ? window.location.search : ""}`} style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                Sign up
              </Link>
            </div>
            </>
            ) : (
              <>
                <p className="app-login-frame-label">Reset your password</p>
                <p className="app-login-frame-desc" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                  Enter your email address. We&apos;ll send you a secure link to choose a new password.
                </p>

                <form className="app-login-form" onSubmit={handleForgotSubmit} noValidate>
                  <div className="app-login-field">
                    <label className="sr-only" htmlFor="forgot-email">Email address</label>
                    <div className="app-login-control">
                      <Mail size={15} className="app-login-control-icon" aria-hidden="true" />
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        placeholder="Email address"
                        required
                        disabled={forgotSubmitting || forgotSuccess}
                      />
                    </div>
                  </div>

                  {forgotSuccess && (
                    <div className="app-login-success-box" style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary-dark)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      <div className="app-login-success-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '8px' }}>
                        <CheckCircle2 size={16} className="app-login-success-icon" />
                        <span>Link sent</span>
                      </div>
                      <p style={{ margin: 0 }}>
                        A password reset link was sent to <strong>{forgotEmail}</strong>. It expires automatically in 60 minutes.
                      </p>
                    </div>
                  )}

                  {forgotSuccess ? (
                    <button
                      type="button"
                      className="app-login-submit"
                      style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                      onClick={() => handleForgotSubmit()}
                      disabled={forgotSubmitting || cooldown > 0}
                    >
                      {forgotSubmitting ? (
                        <>
                          <span className="app-login-spinner" aria-hidden="true" />
                          Sending link...
                        </>
                      ) : cooldown > 0 ? (
                        <>
                          <Clock size={14} aria-hidden="true" style={{ marginRight: '8px' }} />
                          Resend link in {cooldown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw size={14} aria-hidden="true" style={{ marginRight: '8px' }} />
                          Resend reset link
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="app-login-submit"
                      type="submit"
                      disabled={forgotSubmitting || cooldown > 0}
                    >
                      {forgotSubmitting ? (
                        <>
                          <span className="app-login-spinner" aria-hidden="true" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          Send reset link
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  )}
                </form>

                <button
                  type="button"
                  className="app-login-back-btn"
                  onClick={() => {
                    setMode("login");
                    setForgotSuccess(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '24px', cursor: 'pointer', padding: 0 }}
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </button>
              </>
            )}      </div>
    </div>
  );
}
