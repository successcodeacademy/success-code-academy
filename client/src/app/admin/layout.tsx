"use client";

import "./admin.css";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  Globe2,
  ImagePlus,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  Newspaper,
  PanelLeft,
  ChevronDown,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Trophy,
  TrendingUp,
  Users,
  Video,
  Award,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminUser } from "@/lib/admin-api";
import { isAdminRole, isSuperAdminRole, adminRoleLabel } from "@/lib/roles";
import { AdminSessionProvider } from "@/components/admin/AdminSessionContext";
import { ToastProvider } from "@/components/admin/Toast";
import {
  getAdminHref,
  getAdminLogoutHref,
  getLiveWebsiteHref,
} from "@/lib/admin-routing";
import AdminNotifications from "@/components/admin/AdminNotifications";

type SessionState = "loading" | "authenticated" | "guest";
type AdminTheme = "light" | "dark";

const THEME_STORAGE_KEY = "sca-admin-theme";
const EDIT_MODE_STORAGE_KEY = "sca_edit_mode";
const ADMIN_LOGOUT_PENDING_KEY = "sca_admin_logout_pending";

function clearClientAuthStorage() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    /* Browser storage is optional. */
  }
  try {
    sessionStorage.removeItem(EDIT_MODE_STORAGE_KEY);
  } catch {
    /* Browser storage is optional. */
  }
}

function markAdminLogoutPending() {
  try {
    sessionStorage.setItem(ADMIN_LOGOUT_PENDING_KEY, "1");
  } catch {
    /* Browser storage is optional. */
  }
}

const navigation = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Web analytics", href: "/admin/analytics", icon: TrendingUp },
      { label: "Activity logs", href: "/admin/activity-logs", icon: ClipboardList },
      { label: "Visual website editor", href: "/?edit=1", icon: Globe2 },
    ],
  },
  {
    label: "Website content",
    items: [
      { label: "Banners", href: "/admin/banners", icon: Images },
      { label: "Page banners", href: "/admin/page-banners", icon: ImagePlus },
      { label: "Course catalog", href: "/admin/content/courses", icon: ClipboardList },
      { label: "Scholarship programs", href: "/admin/content/scholarships", icon: Award },
      { label: "Announcements", href: "/admin/notifications", icon: Bell },
      { label: "News articles", href: "/admin/content/news", icon: Newspaper },
      { label: "Academy videos", href: "/admin/content/videos", icon: Video },
      { label: "Star students", href: "/admin/content/stars", icon: Star },
      { label: "Results", href: "/admin/results", icon: Trophy },
      { label: "Site settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Enquiries & records",
    items: [
      {
        label: "Student accounts",
        href: "/admin/database/students",
        icon: Users,
      },
      {
        label: "Course enquiries",
        href: "/admin/database/course-forms",
        icon: ClipboardList,
      },
      {
        label: "Scholarship forms",
        href: "/admin/database/scholarship-forms",
        icon: GraduationCap,
      },
      {
        label: "Contact messages",
        href: "/admin/database/contact-messages",
        icon: MessageSquareText,
      },
    ],
  },
  {
    label: "Access & security",
    // Managing who can sign in belongs to super administrators only. The API
    // refuses /database/admins for anyone else, so this group would be a dead
    // end for a standard administrator.
    superAdminOnly: true,
    items: [
      {
        label: "Administrators",
        href: "/admin/database/administrators",
        icon: ShieldCheck,
      },
    ],
  },
] as const;

type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
};

const allNavItems: readonly NavItem[] = navigation.flatMap(
  (group) => [...group.items] as NavItem[],
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  /*
   * Routes that must render without an admin session. Sign-in obviously needs
   * one, and so does the password reset page: whoever follows a reset link is
   * by definition locked out.
   */
  const isSubdomain = !pathname.startsWith("/admin");
  const isPublicRoute =
    pathname === "/admin/login" ||
    pathname === "/login" ||
    pathname.startsWith("/admin/reset-password") ||
    pathname.startsWith("/reset-password");
  const [session, setSession] = useState<SessionState>(
    isPublicRoute ? "guest" : "loading",
  );
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);
  const [scrollHint, setScrollHint] = useState({ visible: false, hasMoreBelow: false });
  const [theme, setTheme] = useState<AdminTheme | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutStartedRef = useRef(false);
  const verificationVersionRef = useRef(0);

  const invalidateLocalSession = useCallback(() => {
    logoutStartedRef.current = true;
    verificationVersionRef.current += 1;
    setSession("guest");
    setUser(null);
    setIsLoggingOut(true);
    clearClientAuthStorage();
    markAdminLogoutPending();
  }, []);

  /*
   * The attribute lives on <html> because admin.css is shared with the public
   * site and AdminModal portals outside .admin-shell. Adding it on mount and
   * removing it on unmount keeps dark theming confined to /admin routes.
   */
  useEffect(() => {
    const root = document.documentElement;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      saved = null;
    }
    const next: AdminTheme = saved === "dark" ? "dark" : "light";
    root.setAttribute("data-admin-theme", next);
    setTheme(next);
    return () => root.removeAttribute("data-admin-theme");
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const setThemeMode = useCallback((next: AdminTheme) => {
    const root = document.documentElement;
    root.setAttribute("data-admin-theme", next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Private mode blocks writes; the theme still applies for this session. */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next: AdminTheme =
      root.getAttribute("data-admin-theme") === "dark" ? "light" : "dark";
    setThemeMode(next);
  }, [setThemeMode]);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  const showTooltip = (label: string, element: HTMLElement) => {
    if (!isSidebarCollapsed) return;
    const rect = element.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2 });
  };

  const getTooltipHandlers = (label: string) => ({
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => showTooltip(label, event.currentTarget),
    onMouseLeave: () => setTooltip(null),
  });

  const navRef = useRef<HTMLElement>(null);

  const updateScrollThumb = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const { scrollTop, scrollHeight, clientHeight } = nav;
    const visible = scrollHeight > clientHeight + 1;
    const hasMoreBelow = scrollTop + clientHeight < scrollHeight - 1;
    if (!visible) {
      setScrollHint({ visible: false, hasMoreBelow: false });
      return;
    }
    setScrollHint({ visible: true, hasMoreBelow });
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateScrollThumb);
    window.addEventListener('resize', updateScrollThumb);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateScrollThumb);
    };
  }, [isSidebarCollapsed, updateScrollThumb]);

  const verifySession = useCallback(async () => {
    if (logoutStartedRef.current) return false;
    const requestVersion = ++verificationVersionRef.current;
    try {
      const response = await fetch("/api/admin/session", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (
        logoutStartedRef.current ||
        requestVersion !== verificationVersionRef.current
      ) {
        return false;
      }
      if (!response.ok) {
        setUser(null);
        setSession("guest");
        return false;
      }
      const payload = (await response.json()) as {
        data?: { user?: AdminUser };
      };
      if (
        logoutStartedRef.current ||
        requestVersion !== verificationVersionRef.current
      ) {
        return false;
      }
      if (!payload.data?.user || !isAdminRole(payload.data.user.role)) {
        setUser(null);
        setSession("guest");
        return false;
      }
      setUser(payload.data.user);
      setSession("authenticated");
      return true;
    } catch {
      if (
        logoutStartedRef.current ||
        requestVersion !== verificationVersionRef.current
      ) {
        return false;
      }
      setUser(null);
      setSession("guest");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isPublicRoute) {
      // Remote session verification is the external system synchronized here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void verifySession();
    }
  }, [isPublicRoute, verifySession]);

  useEffect(() => {
    const expire = () => {
      // A click handler may have dispatched the same event synchronously.
      // It already performed the invalidation and owns the one redirect.
      if (logoutStartedRef.current) return;
      invalidateLocalSession();
      if (isPublicRoute) return;

      window.dispatchEvent(new Event("auth-changed"));
      window.location.replace(
        getAdminLogoutHref(isSubdomain ? "/login" : "/admin/login"),
      );
    };
    window.addEventListener("admin-session-expired", expire);
    return () => window.removeEventListener("admin-session-expired", expire);
  }, [invalidateLocalSession, isPublicRoute, isSubdomain]);

  useEffect(() => {
    if (
      !isPublicRoute &&
      session === "guest" &&
      !logoutStartedRef.current
    ) {
      router.replace(isSubdomain ? "/login" : "/admin/login");
    }
  }, [isPublicRoute, isSubdomain, router, session]);

  const normalizedPath = useMemo(() => {
    if (pathname.startsWith("/admin")) return pathname;
    return pathname === "/" ? "/admin" : `/admin${pathname}`;
  }, [pathname]);

  const currentNavItem = useMemo(() => {
    const exact = allNavItems.find((item) => item.href === normalizedPath);
    if (exact) return exact;

    const prefixes = allNavItems.filter(
      (item) => item.href !== "/admin" && normalizedPath.startsWith(item.href),
    );
    if (prefixes.length > 0) {
      return prefixes.sort((a, b) => b.href.length - a.href.length)[0];
    }

    if (normalizedPath === "/admin") {
      return allNavItems.find((item) => item.href === "/admin") || null;
    }

    return null;
  }, [normalizedPath]);

  const CurrentPageIcon = currentNavItem?.icon || LayoutDashboard;
  const currentPageTitle = currentNavItem?.label || "Dashboard";

  const isSuperAdmin = isSuperAdminRole(user?.role);

  const userDisplayName = useMemo(() => {
    if (user?.firstName) {
      return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Administrator";
  }, [user]);

  const userInitial = useMemo(() => {
    return (user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase();
  }, [user]);

  const userRoleLabel = useMemo(() => {
    return adminRoleLabel(user?.role);
  }, [user?.role]);

  const visibleNavigation = useMemo(
    () =>
      navigation.filter(
        (group) =>
          !("superAdminOnly" in group && group.superAdminOnly) || isSuperAdmin,
      ),
    [isSuperAdmin],
  );

  /*
   * A standard administrator who reaches a super-admin-only page directly — a
   * bookmark, a shared link, a typed URL — is sent back to the dashboard. The
   * API would refuse the page's requests anyway; this avoids showing a screen
   * made entirely of permission errors.
   */
  useEffect(() => {
    if (session !== "authenticated" || isSuperAdmin) return;
    if (
      pathname.startsWith("/admin/database/administrators") ||
      pathname.startsWith("/database/administrators")
    ) {
      router.replace(isSubdomain ? "/" : "/admin");
    }
  }, [isSubdomain, isSuperAdmin, pathname, router, session]);

  function handleLogout() {
    if (logoutStartedRef.current) return;
    // Invalidate before dispatching or navigating so a pending verification
    // cannot restore the administrator during the logout transition.
    invalidateLocalSession();
    // This is a one-way invalidation signal. Consumers clear their own state;
    // none of them should start a fresh session verification during logout.
    window.dispatchEvent(new Event("admin-session-expired"));
    window.dispatchEvent(new Event("auth-changed"));
    window.location.replace(
      getAdminLogoutHref(isSubdomain ? "/login" : "/admin/login"),
    );
  }

  if (isPublicRoute) {
    return (
      <ToastProvider>{children}</ToastProvider>
    );
  }

  if (session !== "authenticated") {
    return (
      <ToastProvider>
        <div className="admin-auth-loading" role="status" aria-live="polite">
          <span className="admin-auth-spinner" aria-hidden="true" />
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
    <AdminSessionProvider user={user}>
    <link rel="manifest" href="/manifest.webmanifest" />
    <div className={`admin-shell ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      <button
        className={`admin-sidebar-backdrop ${sidebarOpen ? "is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close navigation"
      />

      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className={`admin-brand ${isSidebarCollapsed ? 'is-collapsed justify-center px-2' : 'is-expanded justify-between px-3.5'}`}>
          {isSidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="admin-header-toggle is-collapsed group/header-toggle"
              aria-label="Open sidebar"
              {...getTooltipHandlers("Open sidebar")}
            >
              <Image src="/images/ui/SCA-Logo.png" alt="Logo" width={28} height={28} className="collapsed-logo" />
              <PanelLeft size={17} strokeWidth={2} className="collapsed-icon" />
            </button>
          ) : (
            <>
              <Link
                href={isSubdomain ? "/" : "/admin"}
                className="admin-brand-link"
                aria-label="Admin dashboard"
                onClick={() => setSidebarOpen(false)}
              >
                <Image
                  src="/images/ui/logo-nav-full.png"
                  alt="Success Code Academy"
                  width={160}
                  height={55}
                  className="admin-brand-logo-full"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="admin-header-toggle group/header-toggle"
                aria-label="Close sidebar"
              >
                <PanelLeft size={17} strokeWidth={2} />
                <span className="tooltip">Close sidebar</span>
              </button>
            </>
          )}
        </div>

        <div className="admin-navigation-container">
          <nav ref={navRef} className="admin-navigation scrollbar-hide" aria-label="Admin navigation" onScroll={updateScrollThumb}>
            {visibleNavigation.map((group, groupIndex) => (
              <div className={`admin-nav-group ${isSidebarCollapsed && groupIndex > 0 ? 'is-collapsed-group' : ''}`} key={group.label}>
                {!isSidebarCollapsed && <p>{group.label}</p>}
                {isSidebarCollapsed && groupIndex > 0 && <div className="collapsed-divider" />}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    normalizedPath === item.href ||
                    (item.href !== "/admin" && normalizedPath.startsWith(item.href));
                  const linkHref = getAdminHref(item.href, isSubdomain);
                  const isExternal = item.href.startsWith("/?");
                  return (
                    <Link
                      key={item.href}
                      href={linkHref}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={`admin-nav-link ${active ? "is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      {...getTooltipHandlers(item.label)}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!isSidebarCollapsed && <span className="min-w-0 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {scrollHint.visible && scrollHint.hasMoreBelow && (
            <div className="admin-scroll-hint">
              <div className="admin-scroll-hint-icon">
                <ChevronDown size={14} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* <div className={`admin-sidebar-footer ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
          <Link href="/" className="admin-website-link" target="_blank" {...getTooltipHandlers("Live website")}>
            <ExternalLink size={17} className="shrink-0" />
            {!isSidebarCollapsed && <span>View live website</span>}
          </Link>
          <div className="admin-account-summary">
            <span className="admin-avatar" aria-hidden="true" {...getTooltipHandlers(user?.firstName || "Admin")}>
              {(user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}
            </span>
            {!isSidebarCollapsed && (
              <div>
                <strong>{user?.firstName || "Administrator"}</strong>
                <span>{user?.email}</span>
                <span>{adminRoleLabel(user?.role)}</span>
              </div>
            )}
          </div>
        </div> */}
      </aside>

      {isSidebarCollapsed && tooltip && (
        <div
          className="admin-sidebar-tooltip"
          style={{ top: tooltip.top }}
        >
          {tooltip.label}
        </div>
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button
              className="admin-icon-button admin-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="admin-topbar-page">
              <CurrentPageIcon size={18} className="admin-topbar-page-icon" aria-hidden="true" />
              <span className="admin-topbar-page-title">{currentPageTitle}</span>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <AdminNotifications />
            <div className="admin-profile-container" ref={profileMenuRef}>
              <button
                type="button"
                className={`admin-profile-trigger ${isProfileOpen ? "is-active" : ""}`}
                onClick={() => setIsProfileOpen((prev) => !prev)}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                aria-label="User profile and settings"
              >
                <span className="admin-profile-trigger-avatar" aria-hidden="true">
                  {userInitial}
                </span>
                <span className="admin-profile-trigger-name">
                  {userDisplayName}
                </span>
                <ChevronDown
                  size={14}
                  className={`admin-profile-trigger-chevron ${isProfileOpen ? "is-open" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isProfileOpen && (
                <div className="admin-profile-dropdown" role="menu" aria-label="User profile menu">
                  <div className="admin-profile-header">
                    <div className="admin-profile-header-avatar" aria-hidden="true">
                      {userInitial}
                    </div>
                    <div className="admin-profile-header-meta">
                      <span className="admin-profile-name">{userDisplayName}</span>
                      <span className="admin-profile-email">{user?.email || "No email provided"}</span>
                      <div className="admin-profile-badges">
                        <span className="admin-profile-role-badge">
                          <ShieldCheck size={11} aria-hidden="true" />
                          <span>{userRoleLabel}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-profile-divider" />

                  <div className="admin-profile-section">
                    <div className="admin-profile-section-row">
                      <span className="admin-profile-section-title">Theme</span>
                      <div className="admin-profile-segmented" role="radiogroup" aria-label="Theme selection">
                        <button
                          type="button"
                          className={`admin-profile-segment-btn ${theme === "light" ? "is-active" : ""}`}
                          onClick={() => setThemeMode("light")}
                          role="radio"
                          aria-checked={theme === "light"}
                          title="Switch to light theme"
                        >
                          <Sun size={13} aria-hidden="true" />
                          <span>Light</span>
                        </button>
                        <button
                          type="button"
                          className={`admin-profile-segment-btn ${theme === "dark" ? "is-active" : ""}`}
                          onClick={() => setThemeMode("dark")}
                          role="radio"
                          aria-checked={theme === "dark"}
                          title="Switch to dark theme"
                        >
                          <Moon size={13} aria-hidden="true" />
                          <span>Dark</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="admin-profile-divider" />

                  <div className="admin-profile-links">
                    <Link
                      href={getLiveWebsiteHref("/")}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-profile-link-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Globe2 size={15} className="admin-profile-link-icon" aria-hidden="true" />
                      <span>View live website</span>
                      <ExternalLink size={12} className="admin-profile-link-ext" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="admin-profile-divider" />

                  <div className="admin-profile-footer">
                    <button
                      type="button"
                      className="admin-profile-logout-btn"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut size={15} aria-hidden="true" />
                      <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
    </AdminSessionProvider>
    </ToastProvider>
  );
}
