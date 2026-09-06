"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, KeyRound, Mail, Plus, RefreshCw, Save, Send, ShieldCheck, Trash2 } from "lucide-react";
import { adminApiFetch, AdminApiError, getAdminNotificationStatus, updateAdminNotificationSettings, type AdminNotificationStatus } from "@/lib/admin-api";
import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { useToast } from "@/components/admin/Toast";
import {
  AdminLoadingState,
  AdminNotice,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import NotificationPermissionButton from "@/components/admin/NotificationPermissionButton";

type SiteSettings = {
  phone: string;
  email: string;
  address1: string;
  address2: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  twitter: string;
};

import { defaultSiteSettings } from "@/lib/site-settings";

const initialSettings: SiteSettings = {
  ...defaultSiteSettings,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_SETTING_KEYS = ["phone", "email", "address1", "address2", "whatsapp", "facebook", "instagram", "youtube", "linkedin", "twitter"] as const;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, isSuperAdmin } = useAdminSession();
  const toast = useToast();

  const [notificationStatus, setNotificationStatus] = useState<AdminNotificationStatus | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [recipientsSaving, setRecipientsSaving] = useState(false);

  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    adminApiFetch<Record<string, string | boolean>>("settings")
      .then((response) => {
        const { notification_recipients: storedRecipients, admin_notifications_enabled: _legacyToggle, ...rawSettings } = response.data;
        const publicSettings = Object.fromEntries(Object.entries(rawSettings).filter(([key, value]) => PUBLIC_SETTING_KEYS.includes(key as typeof PUBLIC_SETTING_KEYS[number]) && typeof value === "string")) as Partial<SiteSettings>;
        setSettings((current) => ({ ...current, ...publicSettings }));
        if (isSuperAdmin && typeof storedRecipients === "string") setRecipients(storedRecipients.split(/[,;\n]+/).map((email) => email.trim()).filter(Boolean));
      })
      .catch((caught: unknown) =>
        setError(
          caught instanceof Error ? caught.message : "Unable to load settings.",
        ),
      )
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  useEffect(() => {
    let active = true;
    setNotificationLoading(true);
    void getAdminNotificationStatus()
      .then((response) => {
        if (active) setNotificationStatus(response.data);
      })
      .catch(() => {
        // Notification controls are optional; contact settings must remain usable.
        if (active) toast.info("Notification status is temporarily unavailable.");
      })
      .finally(() => { if (active) setNotificationLoading(false); });

    return () => { active = false; };
  }, [toast]);

  async function toggleGlobalNotifications() {
    if (!notificationStatus || notificationSaving) return;
    const enabled = !notificationStatus.enabled;
    setNotificationSaving(true);
    try {
      await updateAdminNotificationSettings(enabled);
      setNotificationStatus((current) => current ? { ...current, enabled } : current);
      toast[enabled ? "success" : "info"](`Global admin notifications ${enabled ? "enabled" : "disabled"}.`);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update global notifications.");
    } finally { setNotificationSaving(false); }
  }

  function addRecipient() {
    setRecipients((current) => [...current, ""]);
    toast.success("Recipient row added.");
  }

  function removeRecipient(index: number) {
    setRecipients((current) => current.filter((_, currentIndex) => currentIndex !== index));
    toast.success("Recipient removed. Save recipients to apply the change.");
  }

  async function saveRecipients() {
    if (!isSuperAdmin || recipientsSaving) return;
    const cleaned = recipients.map((email) => email.trim()).filter(Boolean);
    const invalid = cleaned.find((email) => !EMAIL_PATTERN.test(email));
    if (invalid) { toast.error(`“${invalid}” is not a valid email address.`); return; }
    setRecipientsSaving(true);
    try {
      await adminApiFetch("settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notification_recipients: cleaned.join(",") }) });
      setRecipients(cleaned);
      toast.success("Notification recipients saved.");
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : "Unable to save notification recipients."); }
    finally { setRecipientsSaving(false); }
  }

  function updateSetting(key: keyof SiteSettings, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const settingsPayload = Object.fromEntries(PUBLIC_SETTING_KEYS.map((key) => [key, settings[key]]));

      await adminApiFetch("settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsPayload),
      });
      setMessage("Website contact and social details were saved.");
      toast.success("Website contact and social details were saved.");
      window.dispatchEvent(new Event("admin-content-changed"));
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields.length > 0) {
        setError(caught.fields.map((field) => field.message).join(" "));
      } else {
        setError(
          caught instanceof Error ? caught.message : "Unable to save settings.",
        );
      }
      toast.error(caught instanceof Error ? caught.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSendResetLink() {
    if (cooldown > 0 || resetSending) return;
    setResetSending(true);
    setError("");

    try {
      const response = await adminApiFetch<{
        emailed: boolean;
        email: string;
        ttlMinutes: number;
        resetUrl?: string;
      }>("request-password-reset", {
        method: "POST",
      });

      const emailAddress = response.data?.email || user?.email || "your email address";
      setResetEmail(emailAddress);
      setResetSent(true);
      setCooldown(60);

      toast.success(`Password reset link sent to ${emailAddress}.`);
    } catch (caught) {
      const errMsg =
        caught instanceof Error ? caught.message : "Unable to send password reset link.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setResetSending(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Site settings"
        description="Update the institute details reused across the footer, contact page, and quick-contact actions."
      />

      {error && (
        <AdminNotice>{error}</AdminNotice>
      )}
      {message && (
        <AdminNotice tone="success">{message}</AdminNotice>
      )}

      <section className="admin-card">
        <header className="admin-card-header">
          <div>
            <h2>Browser notifications</h2>
            <p>Opt in to timely admin alerts on this device. Your browser will only ask after you choose enable.</p>
          </div>
          <NotificationPermissionButton />
        </header>
        {/* <div className="admin-card-body admin-notification-settings-copy">
          <div className="admin-notification-summary">
            <div className="admin-notification-summary-icon"><Bell size={18} /></div>
            <div>
              <strong>{notificationLoading ? "Checking notification service…" : !notificationStatus?.vapidConfigured ? "Notification service needs setup" : !notificationStatus.enabled ? "Notifications are paused globally" : !notificationStatus.recipientEnabled ? "Alerts are disabled for your account" : "Notification service ready"}</strong>
              <p>Notifications are private to this browser and can be disabled at any time. Nothing sensitive is shown in a browser alert.</p>
            </div>
          </div>
        </div> */}
      </section>

      {isSuperAdmin && (
        <section className="admin-card admin-notification-admin-card">
          <header className="admin-card-header">
            <div>
              <h2>Admin notification routing</h2>
              <p>Control browser alerts globally and manage the email inboxes that receive internal updates.</p>
            </div>
            <ShieldCheck size={20} aria-hidden="true" />
          </header>
          <div className="admin-card-body admin-notification-admin-body">
            <div className="admin-notification-global-row">
              <div className="admin-notification-global-copy">
                <span className="admin-notification-label">Global notifications</span>
                <span>{notificationStatus?.enabled ? "Alerts are being delivered to enabled administrators." : "Alerts are paused for every administrator."}</span>
              </div>
              <button type="button" className={`admin-button ${notificationStatus?.enabled ? "secondary" : ""}`} onClick={toggleGlobalNotifications} disabled={notificationLoading || notificationSaving || !notificationStatus} aria-pressed={notificationStatus?.enabled}>
                {notificationSaving ? <span className="admin-spinner" aria-hidden="true" /> : <Bell size={16} />}
                {notificationStatus?.enabled ? "Disable globally" : "Enable globally"}
              </button>
            </div>
            <div className="admin-notification-recipients-head">
              <span>Internal email recipients</span>
              <button type="button" className="admin-icon-button" onClick={addRecipient} aria-label="Add notification recipient"><Plus size={16} /></button>
            </div>
            <div className="admin-email-recipient-list">
              {recipients.length === 0 && <p className="admin-notification-empty">No email recipients added yet.</p>}
              {recipients.map((email, index) => (
                <div className="admin-email-recipient-row" key={index}>
                  <input type="email" value={email} placeholder="admin@example.com" aria-label={`Recipient email ${index + 1}`} onChange={(event) => setRecipients((current) => current.map((value, currentIndex) => currentIndex === index ? event.target.value : value))} />
                  <button type="button" className="admin-icon-button admin-recipient-delete" onClick={() => removeRecipient(index)} aria-label={`Delete recipient ${index + 1}`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="admin-form-actions"><button type="button" className="admin-button" onClick={saveRecipients} disabled={recipientsSaving}><Save size={16} />{recipientsSaving ? "Saving…" : "Save recipients"}</button></div>
          </div>
        </section>
      )}

      <section className="admin-card">
        <header className="admin-card-header">
          <div>
            <h2>Contact information</h2>
            <p>These values are public and should be checked carefully.</p>
          </div>
        </header>
        <div className="admin-card-body">
          {loading ? (
            <AdminLoadingState label="Loading settings…" />
          ) : (
            <form className="admin-form" onSubmit={saveSettings}>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="settings-phone">Phone number</label>
                  <input
                    id="settings-phone"
                    value={settings.phone}
                    onChange={(event) =>
                      updateSetting("phone", event.target.value)
                    }
                    placeholder="+91 86004 70850"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="settings-email">Email address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={settings.email}
                    onChange={(event) =>
                      updateSetting("email", event.target.value)
                    }
                    placeholder="successcodeacademy@gmail.com"
                  />
                </div>
                <div className="admin-field full">
                  <label htmlFor="settings-address1">Girls Branch Address</label>
                  <textarea
                    id="settings-address1"
                    value={settings.address1}
                    onChange={(event) =>
                      updateSetting("address1", event.target.value)
                    }
                    rows={2}
                  />
                </div>
                <div className="admin-field full">
                  <label htmlFor="settings-address2">Boys Branch Address</label>
                  <textarea
                    id="settings-address2"
                    value={settings.address2}
                    onChange={(event) =>
                      updateSetting("address2", event.target.value)
                    }
                    rows={2}
                  />
                </div>
                <div className="admin-field full">
                  <label htmlFor="settings-whatsapp">
                    WhatsApp number or URL
                  </label>
                  <input
                    id="settings-whatsapp"
                    value={settings.whatsapp}
                    onChange={(event) =>
                      updateSetting("whatsapp", event.target.value)
                    }
                    placeholder="918600470850 or https://wa.me/918600470850"
                  />
                  <small>
                    Include the country code when entering only a number.
                  </small>
                </div>
              </div>

              <div className="admin-settings-divider">
                <strong>Social media links</strong>
                <span>Leave an unused platform blank.</span>
              </div>

              <div className="admin-form-grid">
                {(
                  [
                    ["facebook", "Facebook"],
                    ["instagram", "Instagram"],
                    ["youtube", "YouTube"],
                    ["linkedin", "LinkedIn"],
                    ["twitter", "X / Twitter"],
                  ] as const
                ).map(([key, label]) => (
                  <div className="admin-field" key={key}>
                    <label htmlFor={`settings-${key}`}>{label}</label>
                    <input
                      id={`settings-${key}`}
                      type="url"
                      value={settings[key]}
                      onChange={(event) =>
                        updateSetting(key, event.target.value)
                      }
                      placeholder="https://"
                    />
                  </div>
                ))}
              </div>
              <div className="admin-form-actions">
                <button className="admin-button" type="submit" disabled={saving}>
                  <Save size={17} />
                  {saving ? "Saving…" : "Save site settings"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-header">
          <div>
            <h2>Password &amp; Security</h2>
            <p>
              Request a secure, single-use link to reset your administrator password.
            </p>
          </div>
          <KeyRound size={20} aria-hidden="true" />
        </header>
        <div className="admin-card-body">
          <div className="admin-reset-box">
            <div className="admin-reset-info">
              <div className="admin-reset-icon" aria-hidden="true">
                <Mail size={18} />
              </div>
              <div className="admin-reset-meta">
                <span className="admin-reset-meta-label">Signed-in Account</span>
                <span className="admin-reset-meta-email">{user?.email || "Administrator"}</span>
                <p className="admin-reset-meta-desc">
                  Password updates are handled securely through an email verification link sent directly to your registered inbox. Links expire automatically in 60 minutes.
                </p>
              </div>
            </div>

            {resetSent && (
              <div className="admin-reset-status-card">
                <CheckCircle2 size={16} className="admin-reset-status-icon" />
                <div className="admin-reset-status-content">
                  <p className="admin-reset-status-title">Reset link dispatched</p>
                  <p className="admin-reset-status-desc">
                    A password reset email has been sent to <strong>{resetEmail}</strong>. Please check your inbox and follow the link to choose your new password.
                  </p>
                </div>
              </div>
            )}

            <div className="admin-reset-actions">
              <button
                type="button"
                className="admin-button"
                onClick={handleSendResetLink}
                disabled={resetSending || cooldown > 0}
              >
                {resetSending ? (
                  <>
                    <span className="admin-spinner" aria-hidden="true" />
                    Sending reset link...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock size={15} aria-hidden="true" />
                    Resend link in {cooldown}s
                  </>
                ) : resetSent ? (
                  <>
                    <RefreshCw size={15} aria-hidden="true" />
                    Resend password reset link
                  </>
                ) : (
                  <>
                    <Send size={15} aria-hidden="true" />
                    Send password reset link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
