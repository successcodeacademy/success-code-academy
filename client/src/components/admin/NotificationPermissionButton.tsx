"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, LoaderCircle } from "lucide-react";
import { adminApiFetch, adminNotificationPaths, getAdminNotificationStatus, type AdminNotificationStatus } from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";

const SW_PATH = "/sw.js";

function decodeKey(value: string): ArrayBuffer {
  const padded = value.padEnd(value.length + (4 - (value.length % 4)) % 4, "=").replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes.buffer;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) throw new Error("This browser does not support notifications.");
  return navigator.serviceWorker.register(SW_PATH, { scope: "/" });
}

type Props = { compact?: boolean };

export default function NotificationPermissionButton({ compact = false }: Props) {
  const toast = useToast();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<AdminNotificationStatus | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let active = true;
    if (typeof window === "undefined") return;
    const browserSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(browserSupported);
    void getAdminNotificationStatus()
      .then((response) => { if (active) setStatus(response.data); })
      .catch(() => undefined);
    if (!browserSupported) return () => { active = false; };
    void navigator.serviceWorker.getRegistration("/").then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      if (active) setEnabled(Boolean(subscription));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const registration = await getRegistration();
      if (enabled) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const endpoint = subscription.endpoint;
          if (!endpoint) throw new Error("This browser subscription is invalid. Refresh the page and try again.");
          await adminApiFetch(adminNotificationPaths.subscriptions, { method: "DELETE", body: JSON.stringify({ endpoint }) });
          await subscription.unsubscribe();
        }
        setEnabled(false);
        toast.info("Browser notifications disabled.");
        return;
      }
      if (Notification.permission === "denied") throw new Error("Notifications are blocked in this browser. Allow them in browser settings, then try again.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      if (status && !status.vapidConfigured) throw new Error("Browser notifications are not configured yet.");
      const vapidResponse = await adminApiFetch<{ publicKey: string }>(adminNotificationPaths.vapidPublicKey);
      const vapidKey = vapidResponse.data.publicKey;
      if (!vapidKey) throw new Error("Browser notifications are not configured.");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(vapidKey) });
      const serialized = subscription.toJSON();
      if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) {
        await subscription.unsubscribe();
        throw new Error("The browser returned an incomplete notification subscription.");
      }
      await adminApiFetch(adminNotificationPaths.subscriptions, { method: "POST", body: JSON.stringify({ endpoint: serialized.endpoint, expirationTime: serialized.expirationTime ?? null, keys: { p256dh: serialized.keys.p256dh, auth: serialized.keys.auth } }) });
      setEnabled(true);
      toast.success("Browser notifications are now enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update browser notifications.");
    } finally { setBusy(false); }
  }

  return <button type="button" className={`admin-button ${enabled ? "secondary" : ""}`} onClick={toggle} disabled={busy || !supported} aria-pressed={enabled} title={!supported ? "Browser notifications are not supported on this device." : undefined}>
    {busy ? <LoaderCircle size={16} className="admin-notification-spin" /> : enabled ? <CheckCircle2 size={16} /> : <Bell size={16} />}
    {compact ? (enabled ? "Enabled" : "Enable alerts") : !supported ? "Notifications unsupported" : (enabled ? "Disable browser notifications" : "Enable browser notifications")}
  </button>;
}
