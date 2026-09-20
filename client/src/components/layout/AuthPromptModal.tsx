"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, X } from "lucide-react";

function safeReturnTo(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function AuthPromptModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [returnTo, setReturnTo] = useState("/");

  useEffect(() => {
    const handleOpen = () => {
      try {
        setReturnTo(
          safeReturnTo(
            `${window.location.pathname}${window.location.search}`,
          ),
        );
      } catch {
        setReturnTo("/");
      }
      setOpen(true);
    };
    window.addEventListener("open-signin-modal", handleOpen);
    return () => window.removeEventListener("open-signin-modal", handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open ]);

  const close = useCallback(() => setOpen(false), []);

  if (!open) return null;

  const go = (path: "/login" | "/signup") => {
    setOpen(false);
    const target =
      returnTo === "/"
        ? path
        : `${path}?returnTo=${encodeURIComponent(returnTo)}`;
    router.push(target);
  };

  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      role="presentation"
    >
      <section
        className="admin-modal auth-prompt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
      >
        <header className="admin-modal-header">
          <h2 id="auth-prompt-title">Sign in to continue</h2>
          <button
            className="admin-icon-button"
            type="button"
            onClick={close}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>
        <div className="admin-modal-body">
          <p className="auth-prompt-copy">
            Create a free account or sign in to submit this form. It only takes
            a minute, and your details will be filled in automatically.
          </p>
          <div className="auth-prompt-actions">
            <button
              type="button"
              className="app-login-submit"
              onClick={() => go("/signup")}
            >
              <UserPlus size={15} aria-hidden="true" />
              Create account
            </button>
            <button
              type="button"
              className="admin-button secondary auth-prompt-secondary"
              onClick={() => go("/login")}
            >
              <LogIn size={15} aria-hidden="true" />
              Sign in
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
