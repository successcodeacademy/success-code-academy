"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";

export type AdminDrawerField = {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
  isEmail?: boolean;
  isPhone?: boolean;
};

export type AdminDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  recordId?: string | number;
  badge?: {
    label: string;
    variant?: string;
  };
  title: string;
  timestamp?: string;
  avatarText?: string;
  avatarImage?: string;
  avatarIcon?: React.ReactNode;
  email?: string;
  phone?: string;
  fields?: AdminDrawerField[];
  changeReview?: React.ReactNode;
  message?: {
    title?: string;
    content: string;
    replySubject?: string;
  };
  imagePreview?: string;
  externalLink?: {
    label: string;
    url: string;
  };
  databaseLink?: {
    label: string;
    href: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  extraActions?: React.ReactNode;
};

export default function AdminDetailDrawer({
  open,
  onClose,
  recordId,
  badge,
  title,
  timestamp,
  avatarText,
  avatarImage,
  avatarIcon,
  email,
  phone,
  fields = [],
  changeReview,
  message,
  imagePreview,
  externalLink,
  databaseLink,
  onEdit,
  onDelete,
  editLabel = "Edit Record",
  deleteLabel = "Delete Record",
  extraActions,
}: AdminDetailDrawerProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Clean phone number for tel: and WhatsApp links
  const cleanPhone = useCallback((p?: string) => {
    if (!p) return "";
    return p.replace(/\D/g, "");
  }, []);

  const handleCopyAll = useCallback(() => {
    const textLines: string[] = [
      `${badge?.label || "Record"} Details:`,
      `Title / Name: ${title}`,
      recordId ? `ID: #${recordId}` : "",
      timestamp ? `Date: ${timestamp}` : "",
      phone ? `Phone: ${phone}` : "",
      email ? `Email: ${email}` : "",
      ...fields.map(
        (f) =>
          `${f.label}: ${
            typeof f.value === "string" || typeof f.value === "number"
              ? f.value
              : ""
          }`
      ),
      message?.content ? `Message:\n${message.content}` : "",
    ].filter(Boolean);

    navigator.clipboard.writeText(textLines.join("\n")).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }, [badge, title, recordId, timestamp, phone, email, fields, message]);

  const handleCopyMessage = useCallback(() => {
    if (!message?.content) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    });
  }, [message]);

  const handleCopyEmail = useCallback((emailValue: string) => {
    if (!emailValue) return;
    navigator.clipboard.writeText(emailValue).then(() => {
      setCopiedEmail(emailValue);
      setTimeout(() => setCopiedEmail(null), 2000);
    });
  }, []);

  const displayFields = useMemo<AdminDrawerField[]>(() => {
    const list: AdminDrawerField[] = [...fields];
    const hasEmailField = list.some(
      (f) => f.isEmail || f.label.toLowerCase().includes("email")
    );
    if (
      email &&
      !hasEmailField &&
      email !== "No email provided" &&
      email !== "Entrance Form"
    ) {
      list.push({
        label: "Email Address",
        value: email,
        fullWidth: true,
        isEmail: true,
      });
    }
    return list;
  }, [fields, email]);

  if (!open) return null;

  const initial =
    avatarText ||
    (title && title.trim() ? title.trim()[0].toUpperCase() : "R");

  const cleanedPhone = cleanPhone(phone);
  const hasPhone = Boolean(phone && phone !== "—" && cleanedPhone.length >= 7);
  const hasEmail = Boolean(email && email.includes("@"));

  return (
    <>
      <div
        className="admin-drawer-scrim"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
      >
        <header className="admin-drawer-header">
          <div className="admin-drawer-header-meta">
            {badge && (
              <span
                className={`admin-dash-pill ${
                  badge.variant ? `is-${badge.variant}` : ""
                }`}
              >
                {badge.label}
              </span>
            )}
            {recordId !== undefined && (
              <span className="admin-drawer-id">Record #{recordId}</span>
            )}
          </div>
          <button
            type="button"
            className="admin-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </header>

        <div className="admin-drawer-body">
          {/* Hero Identity */}
          <div className="admin-drawer-hero">
            {avatarImage ? (
              // CMS / Thumbnail avatar
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarImage}
                alt=""
                className="admin-drawer-avatar"
              />
            ) : avatarIcon ? (
              <div className="admin-drawer-avatar" aria-hidden="true">
                {avatarIcon}
              </div>
            ) : (
              <div className="admin-drawer-avatar" aria-hidden="true">
                {initial}
              </div>
            )}
            <div className="admin-drawer-hero-info">
              <h2 id="admin-drawer-title" className="admin-drawer-name">
                {title || "Untitled Record"}
              </h2>
              {timestamp && (
                <p className="admin-drawer-timestamp">
                  <Calendar size={12} aria-hidden="true" />
                  <span>{timestamp}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Communication & Copy Actions */}
          <div className="admin-drawer-quick-actions">
            {hasPhone && (
              <>
                <a
                  href={`tel:${phone}`}
                  className="admin-drawer-action-btn"
                  title={`Call ${phone}`}
                >
                  <Phone size={13} aria-hidden="true" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${cleanedPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-drawer-action-btn is-whatsapp"
                  title={`Message ${phone} on WhatsApp`}
                >
                  <MessageSquare size={13} aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              </>
            )}

            {hasEmail && (
              <a
                href={`mailto:${email}`}
                className="admin-drawer-action-btn"
                title={`Send email to ${email}`}
              >
                <Mail size={13} aria-hidden="true" />
                <span>Email</span>
              </a>
            )}

            <button
              type="button"
              className={`admin-drawer-action-btn ${copiedAll ? "is-copied" : ""}`}
              onClick={handleCopyAll}
              title="Copy record summary to clipboard"
            >
              {copiedAll ? (
                <>
                  <Check size={13} aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {externalLink && (
              <a
                href={externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-drawer-action-btn"
                title={externalLink.label}
              >
                <ExternalLink size={13} aria-hidden="true" />
                <span>{externalLink.label}</span>
              </a>
            )}

            {extraActions}
          </div>

          {/* Media Preview if attached */}
          {imagePreview && (
            <div className="admin-drawer-section">
              <h3 className="admin-drawer-section-title">Media Preview</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt={title}
                className="admin-drawer-media-preview"
              />
            </div>
          )}

          {/* Structured Details Card */}
          {displayFields.length > 0 && (
            <div className="admin-drawer-section">
              <h3 className="admin-drawer-section-title">Record Details</h3>
              <div className="admin-drawer-card">
                {displayFields.map((field, idx) => {
                  const isEmailField =
                    field.isEmail ||
                    field.label.toLowerCase().includes("email");

                  if (isEmailField && typeof field.value === "string") {
                    const emailVal = field.value;
                    const isValidEmail = emailVal.includes("@");

                    return (
                      <div
                        key={idx}
                        className="admin-drawer-field full is-email"
                      >
                        <span className="admin-drawer-field-label">
                          {field.label}
                        </span>
                        <div className="admin-drawer-email-val">
                          {isValidEmail ? (
                            <a
                              href={`mailto:${emailVal}`}
                              className="admin-drawer-email-link"
                              title={`Send email to ${emailVal}`}
                            >
                              <Mail
                                size={13}
                                aria-hidden="true"
                              />
                              <span>{emailVal}</span>
                            </a>
                          ) : (
                            <span className="admin-drawer-field-val">
                              {emailVal}
                            </span>
                          )}
                          {isValidEmail && (
                            <button
                              type="button"
                              className={`admin-drawer-message-copy-btn ${copiedEmail === emailVal ? "is-copied" : ""}`}
                              onClick={() => handleCopyEmail(emailVal)}
                              title="Copy email address"
                            >
                              {copiedEmail === emailVal ? (
                                <>
                                  <Check size={11} aria-hidden="true" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} aria-hidden="true" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`admin-drawer-field ${
                        field.fullWidth ? "full" : ""
                      }`}
                    >
                      <span className="admin-drawer-field-label">
                        {field.label}
                      </span>
                      <div className="admin-drawer-field-val">
                        {field.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {changeReview}

          {/* Inquiry Message Card */}
          {message?.content && (
            <div className="admin-drawer-section">
              <h3 className="admin-drawer-section-title">
                {message.title || "Inquiry Message Content"}
              </h3>
              <div className="admin-drawer-message-card">
                <div className="admin-drawer-message-header">
                  <span className="admin-drawer-message-title">
                    <FileText size={13} aria-hidden="true" />
                    <span>Inquiry Text</span>
                  </span>
                  <button
                    type="button"
                    className="admin-drawer-message-copy-btn"
                    onClick={handleCopyMessage}
                    title="Copy full message text"
                  >
                    {copiedMessage ? (
                      <>
                        <Check size={11} aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} aria-hidden="true" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="admin-drawer-message-body">
                  {message.content}
                </div>
                {(hasEmail || hasPhone) && (
                  <div className="admin-drawer-message-actions">
                    {hasEmail && (
                      <a
                        href={`mailto:${email}?subject=${encodeURIComponent(
                          message.replySubject || `Regarding your inquiry at Success Code Academy`
                        )}`}
                        className="admin-drawer-action-btn"
                        title="Reply via email client"
                      >
                        <Mail size={12} aria-hidden="true" />
                        <span>Reply via Email</span>
                      </a>
                    )}
                    {hasPhone && (
                      <a
                        href={`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
                          `Hello ${title}, regarding your message to Success Code Academy:`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-drawer-action-btn is-whatsapp"
                        title="Reply on WhatsApp"
                      >
                        <MessageSquare size={12} aria-hidden="true" />
                        <span>Reply on WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(databaseLink || onEdit || onDelete) && (
          <footer className="admin-drawer-footer">
            {databaseLink && (
              <Link
                href={databaseLink.href}
                className="admin-button primary full"
                onClick={onClose}
              >
                <span>{databaseLink.label}</span>
                <ExternalLink size={14} aria-hidden="true" />
              </Link>
            )}

            {onEdit && (
              <button
                type="button"
                className="admin-button primary full"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
              >
                <Edit2 size={14} aria-hidden="true" />
                <span>{editLabel}</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="admin-button secondary"
                onClick={() => {
                  onClose();
                  onDelete();
                }}
                title={deleteLabel}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}
