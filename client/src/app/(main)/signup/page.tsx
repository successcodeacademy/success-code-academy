"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone, Calendar, ArrowRight, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

export default function StudentSignupPage() {
  const router = useRouter();
  
  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Step 2 fields
  const [otp, setOtp] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

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

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/public/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      
      if (!response.ok) {
        throw new Error(payload.message || "Unable to send verification code.");
      }

      toast.success(`Verification code sent to ${email}`);
      setStep(2);
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Unable to send verification code.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/public/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          mobileNumber,
          age: parseInt(age, 10),
          email,
          password,
          otp
        }),
      });
      const payload = await response.json();
      
      if (!response.ok) {
        throw new Error(payload.message || "Unable to sign up.");
      }

      // Store token and user data
      if (payload.data?.token) {
        localStorage.setItem("token", payload.data.token);
      }
      if (payload.data?.user) {
        localStorage.setItem("user", JSON.stringify(payload.data.user));
      }
      
      // Dispatch event to sync Header
      window.dispatchEvent(new Event("auth-changed"));
      
      toast.success("Successfully signed up!");
      router.push(getReturnTo());
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Unable to complete sign up.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="app-login public-auth-page">
      <div className="app-login-frame public-auth-frame">
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

            {step === 1 ? (
              <>
                <p className="app-login-frame-label">Create an account</p>
                <form className="app-login-form" onSubmit={handleSendOtp} noValidate>
                  
                  <div className="split-row">
                    <div className="app-login-field" style={{ flex: 1 }}>
                      <label className="sr-only" htmlFor="firstName">First name</label>
                      <div className="app-login-control">
                        <User size={15} className="app-login-control-icon" aria-hidden="true" />
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          required
                        />
                      </div>
                    </div>
                    <div className="app-login-field" style={{ flex: 1 }}>
                      <label className="sr-only" htmlFor="lastName">Last name</label>
                      <div className="app-login-control">
                        <User size={15} className="app-login-control-icon" aria-hidden="true" />
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="app-login-field">
                    <label className="sr-only" htmlFor="email">Email address</label>
                    <div className="app-login-control">
                      <Mail size={15} className="app-login-control-icon" aria-hidden="true" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="split-row">
                    <div className="app-login-field" style={{ flex: 2 }}>
                      <label className="sr-only" htmlFor="mobileNumber">Mobile number</label>
                      <div className="app-login-control">
                        <Phone size={15} className="app-login-control-icon" aria-hidden="true" />
                        <input
                          id="mobileNumber"
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="Mobile number"
                          required
                        />
                      </div>
                    </div>
                    <div className="app-login-field" style={{ flex: 1 }}>
                      <label className="sr-only" htmlFor="age">Age</label>
                      <div className="app-login-control">
                        <Calendar size={15} className="app-login-control-icon" aria-hidden="true" />
                        <input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Age"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="app-login-field">
                    <label className="sr-only" htmlFor="password">Create password</label>
                    <div className="app-login-control">
                      <Lock size={15} className="app-login-control-icon" aria-hidden="true" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
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
                  
                  <button
                    className="app-login-submit"
                    type="submit"
                    disabled={submitting || !firstName || !lastName || !mobileNumber || !age || !email || !password}
                  >
                    {submitting ? (
                      <>
                        <span className="app-login-spinner" aria-hidden="true" />
                        Sending verification...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                  <Link href={`/login${typeof window !== "undefined" ? window.location.search : ""}`} style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="app-login-frame-label">Verify your email</p>
                <div className="app-login-success-box">
                  <div className="app-login-success-header">
                    <CheckCircle2 size={16} className="app-login-success-icon" />
                    <span>Verification code sent</span>
                  </div>
                  <p>
                    We sent a 6-digit code to <strong>{email}</strong>. Enter it below to complete your registration.
                  </p>
                </div>

                <form className="app-login-form" onSubmit={handleVerifyOtp} noValidate>
                  <div className="app-login-field">
                    <label className="sr-only" htmlFor="otp">Verification code</label>
                    <div className="app-login-control">
                      <KeyRound size={15} className="app-login-control-icon" aria-hidden="true" />
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    className="app-login-submit"
                    type="submit"
                    disabled={submitting || otp.length < 6}
                  >
                    {submitting ? (
                      <>
                        <span className="app-login-spinner" aria-hidden="true" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Sign up
                        <CheckCircle2 size={15} />
                      </>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  className="app-login-back-btn"
                  onClick={() => {
                    setStep(1);
                  }}
                >
                  <ArrowLeft size={14} />
                  Back to edit details
                </button>
              </>
            )}
      </div>
    </div>
  );
}
