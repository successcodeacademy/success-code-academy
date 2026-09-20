"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { EditableText } from "@/components/admin/EditableText";
import { usePageBanner } from "@/lib/use-page-banner";
import { useEditModeOptional } from "@/components/admin/EditModeContext";
import { useToast } from "@/components/admin/Toast";

export default function AdmissionsClient({ courses = [], scholarshipPrograms = [] }: { courses?: any[]; scholarshipPrograms?: any[] }) {
  const [formData, setFormData] = useState({
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    parentPhone: "",
    studentClass: "11th",
    schoolName: "",
    city: "",
    preferredCourse: "",
    scholarshipProgram: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasExistingRegistration, setHasExistingRegistration] = useState(false);
  const [savedRegistration, setSavedRegistration] = useState<typeof formData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const hasInteracted = useRef(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { src: scholarshipBanner, isLoading: isBannerLoading } = usePageBanner("scholarships");
  const { editMode } = useEditModeOptional();
  const toast = useToast();
  const hasChanges = savedRegistration
    ? Object.keys(savedRegistration).some((key) => formData[key as keyof typeof formData] !== savedRegistration[key as keyof typeof formData])
    : false;

  useEffect(() => {
    const fetchExistingRegistration = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/public/scholarships/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data?.registration || data.registration) {
            setHasExistingRegistration(true);
            const registration = data.data?.registration || data.registration;
            const saved = { studentName: registration.studentName || "", studentPhone: registration.studentPhone || "", studentEmail: registration.studentEmail || "", parentPhone: registration.parentPhone || "", studentClass: registration.studentClass || "11th", schoolName: registration.schoolName || "", city: registration.city || "", preferredCourse: registration.preferredCourse || "", scholarshipProgram: registration.scholarshipProgram || "" };
            setSavedRegistration(saved);
            if (!hasInteracted.current) setFormData(saved);
            setSubmitStatus("success");
          }
        }
      } catch (err) {
        console.error("Error fetching registration:", err);
      }
    };

    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setIsAuthenticated(true);
          if (!hasInteracted.current) setFormData(prev => ({
            ...prev,
            studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            studentPhone: user.mobileNumber || prev.studentPhone,
            studentEmail: user.email || prev.studentEmail,
          }));
          fetchExistingRegistration();
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setFormData(prev => ({ ...prev, studentName: "", studentPhone: "", studentEmail: "" }));
        setHasExistingRegistration(false);
        setSavedRegistration(null);
        setSubmitStatus("idle");
        setIsEditing(false);
      }
    };

    checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    return () => window.removeEventListener("auth-changed", checkAuth);
  }, []);

  const handleAuthInterceptor = (e: React.MouseEvent | React.FocusEvent) => {
    if (editMode) return;
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(new Event("open-signin-modal"));
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    hasInteracted.current = true;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (savedRegistration) setSubmitStatus("idle");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) return;
    const token = localStorage.getItem("token")?.trim();
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser || !isAuthenticated) {
      window.dispatchEvent(new Event("open-signin-modal"));
      return;
    }
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (savedRegistration && !hasChanges) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const url = hasExistingRegistration ? "/api/public/scholarships/me" : "/api/public/scholarships/register";
      const method = hasExistingRegistration ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409 && (data.data?.registration || data.registration)) {
        const registration = data.data?.registration || data.registration;
        const saved = {
          studentName: registration.studentName || "",
          studentPhone: registration.studentPhone || "",
          studentEmail: registration.studentEmail || "",
          parentPhone: registration.parentPhone || "",
          studentClass: registration.studentClass || "11th",
          schoolName: registration.schoolName || "",
          city: registration.city || "",
          preferredCourse: registration.preferredCourse || "",
          scholarshipProgram: registration.scholarshipProgram || "",
        };
        setHasExistingRegistration(true);
        setSavedRegistration(saved);
        setFormData(saved);
        setSubmitStatus("success");
        setIsEditing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit registration");
      }

      setSubmitStatus("success");
      setHasExistingRegistration(true);
      setSavedRegistration(formData);
      setIsEditing(false);
      if (hasExistingRegistration) toast.success("Your scholarship registration was updated.");
      else track("scholarship_registration_submitted");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admissions-page-container">
      {/* Background visual elements */}
      <div className="bg-pattern-dots-left">
        <svg viewBox="0 0 100 100" width="80" height="80" fill="#cbd5e1" opacity="0.3">
          <circle cx="10" cy="10" r="3" /><circle cx="30" cy="10" r="3" /><circle cx="50" cy="10" r="3" /><circle cx="70" cy="10" r="3" /><circle cx="90" cy="10" r="3" />
          <circle cx="10" cy="30" r="3" /><circle cx="30" cy="30" r="3" /><circle cx="50" cy="30" r="3" /><circle cx="70" cy="30" r="3" /><circle cx="90" cy="30" r="3" />
          <circle cx="10" cy="50" r="3" /><circle cx="30" cy="50" r="3" /><circle cx="50" cy="50" r="3" /><circle cx="70" cy="50" r="3" /><circle cx="90" cy="50" r="3" />
          <circle cx="10" cy="70" r="3" /><circle cx="30" cy="70" r="3" /><circle cx="50" cy="70" r="3" /><circle cx="70" cy="70" r="3" /><circle cx="90" cy="70" r="3" />
          <circle cx="10" cy="90" r="3" /><circle cx="30" cy="90" r="3" /><circle cx="50" cy="90" r="3" /><circle cx="70" cy="90" r="3" /><circle cx="90" cy="90" r="3" />
        </svg>
      </div>

      <div className="bg-pattern-circles-right">
        <svg viewBox="0 0 200 200" width="240" height="240" stroke="#0257d0" strokeWidth="1.5" fill="none" opacity="0.08">
          <circle cx="200" cy="0" r="80" />
          <circle cx="200" cy="0" r="120" />
          <circle cx="200" cy="0" r="160" />
          <circle cx="200" cy="0" r="200" />
        </svg>
      </div>

      {/* ══════════════════════════════════════════
          HERO BANNER — Scholarship Poster Section
          ══════════════════════════════════════════ */}
      <div className="admissions-hero-banner">
        <div className="admissions-hero-container">
          <motion.div
            className="admissions-poster-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="poster-img-container">
              {isBannerLoading && (
                <div className="skeleton-pulse" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(203, 213, 225, 0.4)", zIndex: 1, borderRadius: "inherit" }}></div>
              )}
              <Image
                src={scholarshipBanner}
                alt="NEET Admissions & Scholarship Test Hero Banner"
                width={800}
                height={500}
                className="admissions-poster-img"
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </div>
      </div>
      {/* ══════════════════════════════════════════
          MAIN GRID SECTION (Details on Left, Form on Right)
          ══════════════════════════════════════════ */}
      <div className="scholarship-grid-container">

        {/* Left Side: Poster Details */}
        <div className="scholarship-left-details">
          <div className="poster-header">
            <div className="poster-header-icon">
              <svg viewBox="0 0 100 100" width="70" height="70" fill="none">
                <path d="M15 45 L50 25 L85 45 L50 65 Z" fill="#0257d0" />
                <path d="M30 53 L30 75 C30 80 70 80 70 75 L70 53" fill="none" stroke="#0257d0" strokeWidth="4" />
                <path d="M85 45 L85 65 L80 65" fill="none" stroke="#0257d0" strokeWidth="3" />
                <polygon points="50,34 52,39 58,39 53,43 55,48 50,45 45,48 47,43 42,39 48,39" fill="#ffffff" />
              </svg>
            </div>

            <h1 className="poster-main-title">
              <EditableText
                contentKey="scholarship.heading-prefix"
                label="scholarship heading"
              >
                Register for
              </EditableText>
              <br />
              <span className="blue-title-highlight">
                <EditableText
                  contentKey="scholarship.heading-highlight"
                  label="scholarship highlighted heading"
                >
                  Success Code Scholarship Exam
                </EditableText>
              </span>
            </h1>

            <p className="poster-intro-text">
              <EditableText
                contentKey="scholarship.introduction"
                label="scholarship introduction"
                kind="multiline"
              >
                This scholarship assessment helps us understand your foundational strength in Physics, Chemistry, and Biology, along with your analytical thinking and concept application. This enables us to provide the right guidance for your NEET journey from the very beginning.
              </EditableText>
            </p>

            <div className="poster-star-divider">
              <div className="divider-line"></div>
              <svg className="star-svg" viewBox="0 0 24 24" width="16" height="16" fill="#0257d0">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
              <div className="divider-line"></div>
            </div>
          </div>

          <div className="poster-features-list">
            <div className="poster-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0257d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="feature-text-block">
                <h4 className="feature-title">
                  <EditableText contentKey="features.foundation.title" label="foundation assessment title">
                    Foundation Assessment
                  </EditableText>
                </h4>
                <p className="feature-description">
                  <EditableText contentKey="features.foundation.description" label="foundation assessment description">
                    Evaluate basics in Physics, Chemistry &amp; Biology
                  </EditableText>
                </p>
              </div>
            </div>

            <div className="poster-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0257d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                  <path d="M3 18 L10 10 L16 12 L21 5" />
                  <polyline points="17 5 21 5 21 9" />
                </svg>
              </div>
              <div className="feature-text-block">
                <h4 className="feature-title">
                  <EditableText contentKey="features.analysis.title" label="performance analysis title">
                    Performance Analysis
                  </EditableText>
                </h4>
                <p className="feature-description">
                  <EditableText contentKey="features.analysis.description" label="performance analysis description">
                    Understand strengths and improvement areas
                  </EditableText>
                </p>
              </div>
            </div>

            <div className="poster-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0257d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="feature-text-block">
                <h4 className="feature-title">
                  <EditableText contentKey="features.guidance.title" label="personalized guidance title">
                    Personalized Guidance
                  </EditableText>
                </h4>
                <p className="feature-description">
                  <EditableText contentKey="features.guidance.description" label="personalized guidance description">
                    Get the right academic direction from the start
                  </EditableText>
                </p>
              </div>
            </div>

            <div className="poster-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0257d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <div className="feature-text-block">
                <h4 className="feature-title">
                  <EditableText contentKey="features.roadmap.title" label="NEET roadmap title">
                    NEET Preparation Roadmap
                  </EditableText>
                </h4>
                <p className="feature-description">
                  <EditableText contentKey="features.roadmap.description" label="NEET roadmap description">
                    Build a clear roadmap for the NEET journey
                  </EditableText>
                </p>
              </div>
            </div>

            <div className="poster-feature-card-boxed">
              <div className="feature-icon-circle-dark">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 11l2 2 4-4" />
                </svg>
              </div>
              <div className="feature-text-block">
                <h4 className="feature-title-blue">
                  <EditableText contentKey="features.scholarship.title" label="scholarship opportunity title">
                    Scholarship Opportunity
                  </EditableText>
                </h4>
                <p className="feature-description-blue">
                  <EditableText
                    contentKey="features.scholarship.description"
                    label="scholarship opportunity description"
                    kind="multiline"
                  >
                    Eligible students may receive scholarship benefits based on performance.
                  </EditableText>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form Card */}
        <div className="scholarship-right-form">
          <div className="registration-form-card">

            <div className="form-card-header">
              <div className="form-header-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#0257d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="form-card-title">
                <EditableText
                  contentKey="form.heading"
                  label="scholarship form heading"
                >
                  Fill in your details to Register for the Scholarship Exam
                </EditableText>
              </h3>
              <div className="title-underline"></div>
            </div>

            {submitStatus === "success" && !isEditing ? (
              <motion.div
                className="success-feedback-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="success-checkmark-badge">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#22c55e" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h4>Registration Complete!</h4>
                <p>Thank you for registering for the Success Code Scholarship Exam. Our advisors will contact you shortly with test venue and timing details.</p>
                {savedRegistration && (
                  <button type="button" onClick={() => setIsEditing(true)} className="register-submit-btn">
                    Edit registration
                  </button>
                )}
              </motion.div>
            ) : (
              <form
                onSubmit={handleFormSubmit}
                className="register-exam-form"
                onClickCapture={handleAuthInterceptor}
                onFocusCapture={handleAuthInterceptor}
              >

                <div className="form-input-group">
                  <label className="form-label">Full Name (Student)</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      name="studentName"
                      placeholder="Enter student full name"
                      required
                      value={formData.studentName}
                      onChange={handleInputChange}
                      readOnly={isAuthenticated && !isEditing}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">
                    Email Address (Student)
                    {isAuthenticated && (
                      <span className="form-locked-badge">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:3}}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      name="studentEmail"
                      placeholder="Enter student email address"
                      required
                      value={formData.studentEmail}
                      onChange={handleInputChange}
                      readOnly={isAuthenticated && !isEditing}
                      className={isAuthenticated ? "input-locked" : ""}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">
                    Mobile Number (Student)
                    {isAuthenticated && (
                      <span className="form-locked-badge">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:3}}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      name="studentPhone"
                      placeholder="Enter student mobile number"
                      required
                      pattern="[0-9]{10}"
                      value={formData.studentPhone}
                      onChange={handleInputChange}
                      readOnly={isAuthenticated && !isEditing}
                      className={isAuthenticated ? "input-locked" : ""}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">Parent / Guardian Mobile Number</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      name="parentPhone"
                      placeholder="Enter parent / guardian mobile number"
                      required
                      pattern="[0-9]{10}"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">Class</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                    </svg>
                    <select
                      name="studentClass"
                      value={formData.studentClass}
                      onChange={handleInputChange}
                    >
                      <option value="11th">11th</option>
                      <option value="12th">12th</option>
                      <option value="10th Pass">10th Pass</option>
                    </select>
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">School / College Name</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 22H2M20 22V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14M10 12h4" />
                    </svg>
                    <input
                      type="text"
                      name="schoolName"
                      placeholder="Enter school or college name"
                      required
                      value={formData.schoolName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">City</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter your city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">Preferred Course</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <select
                      name="preferredCourse"
                      required
                      value={formData.preferredCourse}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.title}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-input-group">
                  <label className="form-label">Scholarship Program</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <select
                      name="scholarshipProgram"
                      required
                      value={formData.scholarshipProgram}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select a scholarship program</option>
                      {scholarshipPrograms.map(prog => (
                        <option key={prog.id} value={prog.title}>{prog.title}{prog.description ? ` — ${prog.description}` : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {errorMessage && (
                  <div className="form-error-message">
                    {errorMessage}
                  </div>
                )}

                <button type="submit" className="register-submit-btn" disabled={isSubmitting || Boolean(savedRegistration && !hasChanges)}>
                  {isSubmitting ? "Saving..." : (
                    <EditableText
                      contentKey="scholarship.submit-btn"
                      label="scholarship submit button"
                    >
                      {hasExistingRegistration ? "Update Registration →" : "Register for Scholarship Exam →"}
                    </EditableText>
                  )}
                </button>
                {savedRegistration && (
                  <button type="button" onClick={() => { setFormData(savedRegistration); setSubmitStatus("success"); setIsEditing(false); }} className="register-submit-btn">
                    Cancel
                  </button>
                )}

              </form>
            )}

            <div className="form-card-footer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Your information is safe and secure with us.</span>
            </div>

          </div>
        </div>

      </div>

      {/* Styled JSX Styles */}
      <style jsx global>{`
        .admissions-page-container {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 50%, #f1f7fe 0%, #ffffff 100%);
          position: relative;
          padding-top: 80px; /* Offset header height */
          overflow: hidden;
        }

        /* Ambient background graphics */
        .bg-pattern-dots-left {
          position: absolute;
          top: 180px;
          left: 40px;
          z-index: 0;
          pointer-events: none;
        }
        .bg-pattern-circles-right {
          position: absolute;
          top: 140px;
          right: 0;
          z-index: 0;
          pointer-events: none;
        }

        /* ════════════════════════════════
           HERO BANNER — Admissions Poster Section
           ════════════════════════════════ */
        /* No full-bleed hack needed: .site-main and .admissions-page-container
           apply no horizontal padding, so this block already spans the viewport.
           The old left:50% + width:100vw + -50vw margins shifted it ~4px left of
           the viewport edge and made it a scrollbar-width too wide, which
           html { overflow-x: clip } was quietly hiding. */
        .admissions-hero-banner {
          position: relative;
          background: #ffffff;
          overflow: hidden;
        }
        .admissions-hero-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .admissions-poster-wrapper {
          width: 100% !important;
          border-radius: 0 !important;
          overflow: hidden;
          box-shadow: none !important;
          border: none !important;
          background: #f8fafc;
        }
        .poster-img-container {
          position: relative;
          width: 100%;
          display: block;
          line-height: 0;
          aspect-ratio: 1916 / 821;
          overflow: hidden;
        }
        :global(.admissions-poster-img) {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          display: block !important;
          object-fit: cover !important;
          object-position: center center !important;
        }
        /* ════════════════════════════════
           SCHOLARSHIP GRID LAYOUT
           ════════════════════════════════ */
        .scholarship-grid-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 50px;
          width: 100%;
          max-width: 1200px;
          margin: 60px auto 100px;
          padding: 48px;
          box-sizing: border-box;
          position: relative;
          z-index: 10;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 28px;
          box-shadow: 
            0 20px 40px -15px rgba(15, 23, 42, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.02);
        }

        /* ════════════════════════════════
           LEFT SIDE DETAILS
           ════════════════════════════════ */
        .scholarship-left-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
          font-family: 'Outfit', sans-serif !important;
          padding-right: 40px;
          border-right: 1.5px solid #edf2f9;
        }
        .poster-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .poster-header-icon {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .poster-main-title {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 850;
          color: #0f172a;
          line-height: 1.25;
          margin: 0 0 16px;
          letter-spacing: -0.03em;
        }
        .blue-title-highlight {
          color: #1e3a8a;
        }
        .poster-badge-pill {
          display: inline-block;
          background: #1e3a8a;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }
        .poster-intro-text {
          font-size: 1rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 32px;
        }
        .poster-star-divider {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 16px;
          margin-bottom: 36px;
        }
        .divider-line {
          flex-grow: 1;
          height: 1.5px;
          background: #e2e8f0;
        }
        .star-svg {
          flex-shrink: 0;
        }
        .poster-features-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }
        .poster-feature-item {
          display: flex;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        .feature-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-icon-circle-dark {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #0257d0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-text-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .feature-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .feature-description {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }
        .poster-feature-card-boxed {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #eff6ff;
          border: 1.5px solid #dbeafe;
          border-radius: 16px;
          padding: 18px 24px;
          width: 100%;
          box-sizing: border-box;
          margin-top: 8px;
        }
        .feature-title-blue {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0257d0;
          margin: 0;
        }
        .feature-description-blue {
          font-size: 0.95rem;
          color: #1d4ed8;
          margin: 0;
        }

        /* ════════════════════════════════
           RIGHT SIDE FORM CARD
           ════════════════════════════════ */
        .scholarship-right-form {
          width: 100%;
          box-sizing: border-box;
        }
        .registration-form-card {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
          box-sizing: border-box;
          width: 100%;
        }
        .form-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 30px;
          width: 100%;
        }
        .form-header-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .form-card-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.4;
          margin: 0;
          font-family: 'Outfit', sans-serif;
        }
        .title-underline {
          width: 60px;
          height: 3px;
          background: #0257d0;
          margin-top: 14px;
          border-radius: 99px;
        }
        .register-exam-form {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .form-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          text-align: left;
        }
        .form-label {
          font-size: 0.88rem;
          font-weight: 750;
          color: #1e293b;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .form-locked-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          padding: 1px 7px;
          letter-spacing: 0.02em;
        }
        .input-locked {
          background: #f8fafc !important;
          color: #64748b !important;
          cursor: not-allowed;
          border-color: #e2e8f0 !important;
        }
        .input-locked:focus {
          box-shadow: none !important;
          border-color: #e2e8f0 !important;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          pointer-events: none;
        }
        .input-with-icon input, 
        .input-with-icon select {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: 'Outfit', sans-serif;
        }
        .input-with-icon input:focus, 
        .input-with-icon select:focus {
          border-color: #0257d0;
          box-shadow: 0 0 0 3px rgba(2, 87, 208, 0.1);
        }
        .register-submit-btn {
          width: 100%;
          background: #0257d0;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 16px 24px;
          font-size: 1.05rem;
          font-weight: 800;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          box-shadow: 0 4px 12px rgba(2, 87, 208, 0.15);
        }
        .register-submit-btn:hover {
          background: #1d4ed8;
          box-shadow: 0 6px 20px rgba(2, 87, 208, 0.25);
        }
        .register-submit-btn:active {
          transform: translateY(0);
        }
        .form-card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          width: 100%;
        }
        .form-error-message {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: left;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.05);
        }

        /* Success screen feedback style */
        .success-feedback-container {
          text-align: center;
          padding: 30px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .success-checkmark-badge {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 1px solid rgba(34, 197, 94, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.1);
        }
        .success-feedback-container h4 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0;
          font-family: 'Outfit', sans-serif;
        }
        .success-feedback-container p {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.55;
          margin: 0 0 10px;
          font-family: 'Outfit', sans-serif;
        }

        /* ─── Responsive Styles ─── */
        /* Was 992/768/640 -- all three are phone-tier intent. 768-1023 belongs
           to the tablet rules in public.css, which hold this grid at two
           columns; 767 also stops these overlapping min-width:768 rules. */
        @media (max-width: 767px) {
          .scholarship-grid-container {
            grid-template-columns: 1fr;
            gap: 40px;
            margin: 40px auto 60px;
            padding: 32px 24px;
            border-radius: 20px;
          }
          .scholarship-left-details {
            border-right: none;
            padding-right: 0;
            border-bottom: 1.5px solid #edf2f9;
            padding-bottom: 32px;
          }
        }

        @media (max-width: 767px) {
          .admissions-page-container {
            padding-top: calc(var(--header-h) + 4px) !important;
          }
          .registration-form-card {
            padding: 0;
          }
          .bg-pattern-dots-left,
          .bg-pattern-circles-right {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .scholarship-grid-container {
            padding: 24px 16px;
            margin: 24px auto 40px;
            border-radius: 16px;
            gap: 24px;
          }
          .poster-main-title {
            font-size: clamp(1.75rem, 6vw, 2.25rem);
          }
          .poster-features-list {
            gap: 16px;
          }
          .poster-feature-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            border-radius: 12px;
            background: #f8fafc;
          }
          .poster-feature-card-boxed {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
          }
          .form-card-title {
            font-size: 1.15rem;
          }
          .input-with-icon input,
          .input-with-icon select {
            padding: 10px 14px 10px 42px;
            font-size: 0.9rem;
          }
          .input-icon {
            left: 12px;
            width: 16px;
            height: 16px;
          }
          .register-submit-btn {
            padding: 14px 20px;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 380px) {
          .scholarship-grid-container {
            padding: 16px 12px;
          }
          .poster-main-title {
            font-size: 1.5rem;
          }
          .form-header-icon {
            width: 48px;
            height: 48px;
          }
          .form-header-icon svg {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
}
