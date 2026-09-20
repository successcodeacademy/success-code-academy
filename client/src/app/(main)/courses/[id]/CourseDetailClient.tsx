"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@vercel/analytics";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaCheck,
  FaChevronDown,
  FaCircleExclamation,
  FaFilePdf,
} from "react-icons/fa6";
import { EditableText } from "@/components/admin/EditableText";
import { useToast } from "@/components/admin/Toast";

interface CourseDetailClientProps {
  course: {
    id: string | number;
    category: string;
    type: string;
    title: string;
    description: string;
    highlights: string[];
    badge: string;
  };
}

const timeSlots = [
  "Choose a convenient time slot",
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
];

const courseVisuals: Record<string, string> = {
  freshers: "/images/courses/neet-foundation.png",
  repeaters: "/images/courses/neet-repeaters.png",
  "test-series": "/images/courses/test-series.png",
};

const classroomFeatures = [
  {
    title: "Our Results Speak for Themselves",
    bullets: [
      "36+ Selections in NEET 2025",
      "3 Students selected for AIIMS Delhi",
      "Selections in top Government Medical Colleges across Maharashtra",
      "One of the best selection ratios in Maharashtra",
    ],
    image: "/images/crops/results_graphic.png",
    width: 1672,
    height: 941,
  },
  {
    title: "Personalized Mentorship",
    bullets: [
      "One-on-one mentoring",
      "Personalized study plans",
      "Regular parent interaction",
      "Progress tracking",
      "Exam strategy guidance",
    ],
    image: "/images/crops/mentorship_graphic.png",
    width: 1672,
    height: 941,
  },
  {
    title: "Concept-Driven Classroom Learning",
    bullets: [
      "Deep conceptual teaching",
      "NCERT-first approach",
      "Application-based learning",
      "Interactive classes",
      "Strong fundamentals over memorization",
    ],
    image: "/images/crops/learning_graphic.png",
    width: 1672,
    height: 941,
  },
  {
    title: "Study Material & Daily Practice",
    bullets: [
      "Printed notes",
      "Daily Practice Papers (DPPs)",
      "Topic-wise assignments",
      "NEET question bank",
      "Revision booklets & PYQs",
    ],
    image: "/images/crops/material_graphic.png",
    width: 1672,
    height: 941,
  },
  {
    title: "Smart Assessment System",
    badge: "OMR",
    bullets: [
      "Topic-wise tests",
      "Full syllabus tests",
      "Revision tests",
      "NEET-pattern mock exams",
      "Time-management practice",
    ],
    image: "/images/crops/assessment_graphic.png",
    width: 1672,
    height: 941,
  },
  {
    title: "Personalized Performance Analytics",
    bullets: [
      "Detailed reports",
      "Error analysis",
      "Chapter-wise performance",
      "Improvement roadmap",
      "Faculty feedback",
    ],
    image: "/images/crops/analytics_graphic.png",
    width: 1672,
    height: 941,
  },
  {
    title: "Student Wellness & Motivation",
    bullets: [
      "Stress management",
      "Confidence building",
      "Positive learning environment",
      "Continuous motivation",
    ],
    image: "/images/crops/wellness_graphic.png",
    width: 1672,
    height: 941,
  },
];

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    visitingDate: "",
    visitingTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedRegistration, setSavedRegistration] = useState<typeof formData | null>(null);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const hasInteracted = useRef(false);
  const toast = useToast();
  const hasChanges = savedRegistration
    ? Object.keys(savedRegistration).some((key) => formData[key as keyof typeof formData] !== savedRegistration[key as keyof typeof formData])
    : false;

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setIsAuthenticated(false);
        setSavedRegistration(null);
        setFormStatus("idle");
        setIsEditing(false);
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        if (!hasInteracted.current) {
          setFormData((previous) => ({
            ...previous,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email || previous.email,
            phone: user.mobileNumber || previous.phone,
          }));
        }
        setIsLoadingRegistration(true);
        fetch("/api/public/forms/course-register/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then(async (response) => {
          if (!response.ok) return null;
          const data = await response.json();
          return data.data?.registration || data.registration || null;
        }).then((registration) => {
          if (!registration) return;
          const saved = { name: registration.studentName || "", email: registration.studentEmail || "", phone: registration.studentPhone || "", visitingDate: registration.visitingDate || "", visitingTime: registration.visitingTime || "" };
          setSavedRegistration(saved);
          if (!hasInteracted.current) setFormData(saved);
          setFormStatus("success");
        }).catch((error) => console.error("Error fetching course enquiry:", error))
          .finally(() => setIsLoadingRegistration(false));
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    return () => window.removeEventListener("auth-changed", checkAuth);
  }, []);

  const handleAuthInterceptor = (event: React.MouseEvent | React.FocusEvent) => {
    const token = localStorage.getItem("token")?.trim();
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      return;
    }

    // Let submit reach handleSubmit so it can show the specific auth error.
    if (event.target instanceof Element && event.target.closest('button[type="submit"]')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new Event("open-signin-modal"));

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    setSubmissionError("");
    const token = localStorage.getItem("token")?.trim();
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      setSubmissionError("");
      setFormStatus("idle");
      window.dispatchEvent(new Event("open-signin-modal"));
      return;
    }

    const values = new FormData(form);
    const submittedData = {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      phone: String(values.get("phone") || "").trim(),
      visitingDate: String(values.get("visitingDate") || "").trim(),
      visitingTime: String(values.get("visitingTime") || "").trim(),
    };
    const dateParts = submittedData.visitingDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const validDate = Boolean(dateParts) && (() => {
      const [, year, month, day] = dateParts!;
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      return date.getUTCFullYear() === Number(year)
        && date.getUTCMonth() === Number(month) - 1
        && date.getUTCDate() === Number(day);
    })();

    if (
      !submittedData.name ||
      !submittedData.email ||
      !submittedData.phone ||
      !validDate ||
      !timeSlots.slice(1).includes(submittedData.visitingTime)
    ) {
      setSubmissionError("Please complete all required form fields.");
      setFormStatus("error");
      return;
    }

    if (isLoadingRegistration) return;

    setIsSubmitting(true);

    try {
      const hasSaved = Boolean(savedRegistration);
      const response = await fetch(
        hasSaved ? "/api/public/forms/course-register/me" : "/api/public/forms/course-register",
        {
          method: hasSaved ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseTitle: course.title,
            studentName: submittedData.name,
            studentEmail: submittedData.email,
            studentPhone: submittedData.phone,
            visitingDate: submittedData.visitingDate,
            visitingTime: submittedData.visitingTime,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));
      if (response.status === 409 && (result.data?.registration || result.registration)) {
        const registration = result.data?.registration || result.registration;
        const saved = { name: registration.studentName || "", email: registration.studentEmail || "", phone: registration.studentPhone || "", visitingDate: registration.visitingDate || "", visitingTime: registration.visitingTime || "" };
        setSavedRegistration(saved);
        setFormData(saved);
        setFormStatus("success");
        setIsEditing(false);
        return;
      }
      if (!response.ok) {
        throw new Error(result.message || "Failed to save the course enquiry");
      }

      setFormStatus("success");
      setSavedRegistration(submittedData);
      setFormData(submittedData);
      setIsEditing(false);
      if (hasSaved) toast.success("Your course enquiry was updated.");
      else track("course_enquiry_submitted");
    } catch (error) {
      console.error(error);
      setSubmissionError(error instanceof Error ? error.message : "Failed to save the course enquiry.");
      setFormStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`course-detail-page course-detail-${course.category}`}>
      <section className="course-detail-hero">
        <div className="course-detail-container">
          <button
            type="button"
            className="course-detail-back"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/courses");
              }
            }}
          >
            <FaArrowLeft aria-hidden="true" />
            <EditableText
              contentKey="navigation.back"
              label="back to courses link"
              showInlineControls={false}
            >
              Back
            </EditableText>
          </button>

          <div className="course-detail-hero-card">
            <div className="course-detail-hero-copy">
              <div className="course-detail-type">
                <EditableText
                  contentKey={`course-${course.id}.type`}
                  label={`${course.title} type`}
                  showInlineControls={false}
                >
                  {course.type}
                </EditableText>
              </div>

              <h1 className="course-detail-title">
                <EditableText contentKey={`course-${course.id}.heading`} label="course heading" scope="global">
                  {course.title}
                </EditableText>
              </h1>

              <p className="course-detail-description">
                <EditableText
                  contentKey={`course-${course.id}.description`}
                  label="course description"
                  kind="multiline"
                >
                  {course.description}
                </EditableText>
              </p>

              <ul className="course-detail-highlights">
                {course.highlights.map((highlight: string, index: number) => (
                  <li key={highlight}>
                    <span aria-hidden="true">
                      <FaCheck />
                    </span>
                    <EditableText
                      contentKey={`course-${course.id}.highlight-${index + 1}`}
                      label={`${course.title} highlight ${index + 1}`}
                      showInlineControls={false}
                    >
                      {highlight}
                    </EditableText>
                  </li>
                ))}
              </ul>
</div>

            <div
              className="course-detail-hero-visual"
              aria-hidden="true"
              style={{
                backgroundImage: `url("${courseVisuals[course.category] || courseVisuals.freshers}")`,
              }}
            >
              <div className="course-detail-batch">
                <EditableText
                  contentKey={`course-${course.id}.badge`}
                  label={`${course.title} batch badge`}
                  showInlineControls={false}
                >
                  {course.badge}
                </EditableText>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="course-detail-body">
        <div className="course-detail-container course-detail-layout">
          <div className="course-detail-content">
            <div className="course-detail-section-heading">
              <span className="course-detail-section-line" aria-hidden="true" />
              <h2>
                <EditableText
                  contentKey="course.offerings-heading"
                  label="course offerings heading"
                >
                  NEET Course Offerings &amp; Why Choose Us
                </EditableText>
              </h2>
            </div>

            <div className="course-detail-feature-grid">
              {classroomFeatures.map((feature, index) => (
                <article
                  key={feature.title}
                  className="course-detail-feature-card"
                  data-feature={index + 1}
                >
                  <div className="course-detail-feature-copy">
                    <h3>
                      <EditableText
                        contentKey={`offerings.item-${index + 1}.heading`}
                        label={`course offering ${index + 1} heading`}
                      >
                        {feature.title}
                      </EditableText>
                      {feature.badge && (
                        <span className="course-detail-feature-badge">
                          <EditableText
                            contentKey={`offerings.item-${index + 1}.badge`}
                            label={`course offering ${index + 1} badge`}
                            showInlineControls={false}
                          >
                            {feature.badge}
                          </EditableText>
                        </span>
                      )}
                    </h3>

                    <ul>
                      {feature.bullets.map((bullet, bulletIndex) => (
                        <li key={bullet}>
                          <EditableText
                            contentKey={`offerings.item-${index + 1}.point-${bulletIndex + 1}`}
                            label={`course offering ${index + 1}, point ${bulletIndex + 1}`}
                            showInlineControls={false}
                          >
                            {bullet}
                          </EditableText>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="course-detail-feature-visual">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={feature.width}
                      height={feature.height}
                      sizes="(max-width: 720px) 45vw, 180px"
                      priority={index === 0}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="course-detail-syllabus">
              <div className="course-detail-syllabus-icon" aria-hidden="true">
                <FaFilePdf />
              </div>
              <h3>
                <EditableText
                  contentKey="syllabus.heading"
                  label="syllabus download heading"
                >
                  Download Course Syllabus
                </EditableText>
              </h3>
              <a
                href="/documents/Syllabus_neet_2026.pdf"
                download
                className="course-detail-syllabus-action"
              >
                <EditableText
                  contentKey="syllabus.action"
                  label="syllabus download action"
                  showInlineControls={false}
                >
                  Download PDF Syllabus
                </EditableText>
              </a>
            </div>
          </div>

          <aside className="course-detail-sidebar">
            <div className="course-detail-register-card">
              {formStatus === "success" && !isEditing ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="course-registration-success"
                  >
                    <div className="course-registration-success-icon">
                      <FaCheck />
                    </div>
                    <h2>Registration Successful!</h2>
                    <p>
                      Thank you, <strong>{formData.name}</strong>. Your seat reservation has been recorded.
                    </p>

                    <div className="course-registration-summary">
                      <div>
                        <span>Batch:</span>
                        <strong>{course.badge.replace("Starts: ", "")}</strong>
                      </div>
                      <div>
                        <span>Visiting Date:</span>
                        <strong>{formData.visitingDate}</strong>
                      </div>
                      <div>
                        <span>Visiting Time:</span>
                        <strong>{formData.visitingTime}</strong>
                      </div>
                    </div>

                    <p className="course-registration-note">
                      Our admissions team will call you at {formData.phone} shortly.
                    </p>
                    <button type="button" className="course-registration-reset" onClick={() => setIsEditing(true)}>
                      Edit enquiry
                    </button>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="course-registration-form"
                  onClickCapture={handleAuthInterceptor}
                  onFocusCapture={handleAuthInterceptor}
                >
                  <div className="course-registration-heading">
                    <h2>
                      <EditableText
                        contentKey="registration.heading"
                        label="registration form heading"
                      >
                        Register for the course
                      </EditableText>
                    </h2>
                    <span>
                      <EditableText
                        contentKey={`course-${course.id}.heading`}
                        label="course heading"
                        showInlineControls={false}
                        scope="global"
                      >
                        {course.title}
                      </EditableText>
                    </span>
                  </div>

                  <div className="course-registration-section-label">
                    <EditableText
                      contentKey="registration.student-section"
                      label="student information label"
                      showInlineControls={false}
                    >
                      STUDENT INFORMATION
                    </EditableText>
                  </div>

                  <div className="course-registration-fields">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(event) => { hasInteracted.current = true; setFormData({ ...formData, name: event.target.value }); }}
                      required
                      readOnly={isAuthenticated && !isEditing}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(event) => { hasInteracted.current = true; setFormData({ ...formData, email: event.target.value }); }}
                      required
                      readOnly={isAuthenticated && !isEditing}
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={(event) => { hasInteracted.current = true; setFormData({ ...formData, phone: event.target.value }); }}
                      required
                      readOnly={isAuthenticated && !isEditing}
                    />
                  </div>

                  <div className="course-registration-visit">
                    <div className="course-registration-field">
                      <span className="course-registration-section-label">
                        <EditableText
                          contentKey="registration.batch-label"
                          label="batch starting label"
                          showInlineControls={false}
                        >
                          BATCH STARTING FROM
                        </EditableText>
                      </span>
                      <div className="course-registration-batch">
                        <FaCalendarDays aria-hidden="true" />
                        <strong>{course.badge.replace("Starts: ", "")}</strong>
                      </div>
                    </div>

                    <div className="course-registration-field">
                      <label htmlFor="visiting-date">SELECT VISITING DATE</label>
                      <input
                        id="visiting-date"
                        name="visitingDate"
                        type="date"
                        value={formData.visitingDate}
                        onChange={(event) => {
                          hasInteracted.current = true;
                          setFormData({ ...formData, visitingDate: event.target.value });
                        }}
                        required
                      />
                    </div>

                    <div className="course-registration-field">
                      <label htmlFor="visiting-time">
                        SELECT VISITING TIME (9:00 AM - 7:00 PM)
                      </label>
                      <div className="course-registration-select">
                        <select
                          id="visiting-time"
                          name="visitingTime"
                          value={formData.visitingTime}
                          onChange={(event) => {
                            hasInteracted.current = true;
                            setFormData({ ...formData, visitingTime: event.target.value });
                          }}
                          required
                        >
                          {timeSlots.map((slot, index) => (
                            <option key={slot} value={slot} disabled={index === 0}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        <FaChevronDown aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="course-registration-submit"
                    disabled={isSubmitting || isLoadingRegistration || Boolean(savedRegistration && !hasChanges)}
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <EditableText
                        contentKey="registration.action"
                        label="registration action"
                        showInlineControls={false}
                      >
                        {savedRegistration ? "Update enquiry" : "Register Now"}
                      </EditableText>
                    )}
                  </button>

                  {savedRegistration && (
                    <button type="button" className="course-registration-reset" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  )}

                  {formStatus === "error" && (
                    <p className="course-registration-error">
                      <FaCircleExclamation aria-hidden="true" />
                      {submissionError || "Please complete all required form fields."}
                    </p>
                  )}
                </form>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
