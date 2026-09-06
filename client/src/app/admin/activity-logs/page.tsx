"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Download, FilePlus2, GitCompareArrows, Minus, Search, X } from "lucide-react";
import { adminApiFetch } from "@/lib/admin-api";
import AdminDetailDrawer from "@/components/admin/AdminDetailDrawer";
import { AdminNotice, AdminPageHeader, AdminTableSkeleton } from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/Toast";

type LogRow = {
  id: number;
  adminId: number;
  adminName: string | null;
  adminEmail: string;
  adminRole: string;
  action: string;
  resource: string;
  resourceId: string | null;
  method: string;
  route: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
};

type ChangeKind = "changed" | "added" | "removed";
type Change = { path: string; before: unknown; after: unknown; kind: ChangeKind };

const IGNORED_SNAPSHOT_FIELDS = new Set(["createdAt", "updatedAt"]);

function prettyLabel(path: string): string {
  return path.split(".").map((part) => part.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())).join(" / ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function flattenSnapshot(value: unknown, path = "", output: Map<string, unknown> = new Map()): Map<string, unknown> {
  if (value === null || value === undefined) {
    if (path) output.set(path, value);
    return output;
  }
  if (Array.isArray(value)) {
    // Site settings are stored as [{ key, value }]. Present them as named settings,
    // not as opaque array indexes, so an address change is immediately recognizable.
    if (value.every((item) => isRecord(item) && typeof item.key === "string")) {
      value.forEach((item) => flattenSnapshot(item.value, item.key as string, output));
    } else {
      value.forEach((item, index) => flattenSnapshot(item, path ? `${path}.${index + 1}` : String(index + 1), output));
    }
    return output;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([key]) => !IGNORED_SNAPSHOT_FIELDS.has(key));
    if (!entries.length && path) output.set(path, value);
    entries.forEach(([key, item]) => flattenSnapshot(item, path ? `${path}.${key}` : key, output));
    return output;
  }
  if (path) output.set(path, value);
  return output;
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function collectChanges(before: unknown, after: unknown): Change[] {
  const oldValues = flattenSnapshot(before);
  const newValues = flattenSnapshot(after);
  const paths = new Set([...oldValues.keys(), ...newValues.keys()]);
  return [...paths].sort((left, right) => left.localeCompare(right)).flatMap((path) => {
    const oldValue = oldValues.get(path);
    const newValue = newValues.get(path);
    if (sameValue(oldValue, newValue)) return [];
    return [{ path, before: oldValue, after: newValue, kind: !oldValues.has(path) ? "added" : !newValues.has(path) ? "removed" : "changed" }];
  });
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Empty";
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString();
  return JSON.stringify(value, null, 2) || "Empty";
}

function ChangeReview({ log }: { log: LogRow }) {
  const changes = collectChanges(log.before, log.after);
  const isCreate = log.action === "create";
  const isDelete = log.action === "delete";
  return (
    <div className="admin-drawer-section admin-change-review">
      <div className="admin-change-review-heading">
        <div>
          <h3 className="admin-drawer-section-title">What changed</h3>
        </div>
        <GitCompareArrows size={18} aria-hidden="true" />
      </div>
      {isCreate && <div className="admin-change-empty is-added"><FilePlus2 size={17} /><span>This record was added with the values shown below.</span></div>}
      {isDelete && <div className="admin-change-empty is-removed"><Minus size={17} /><span>This record was removed. The “before” values show exactly what was deleted.</span></div>}
      {!isCreate && !isDelete && changes.length === 0 && <div className="admin-change-empty"><Check size={17} /><span>No field-level difference was detected for this entry.</span></div>}
      {changes.length > 0 && <div className="admin-change-list">{changes.map((change) => (
        <article key={change.path} className={`admin-change-item is-${change.kind}`}>
          <div className="admin-change-item-label"><span>{prettyLabel(change.path)}</span><span className="admin-change-kind">{change.kind === "changed" ? "Changed" : change.kind === "added" ? "Added" : "Removed"}</span></div>
          <div className="admin-change-values">
            {change.kind !== "added" && <div className="admin-change-value is-before"><span className="admin-change-value-label">Before</span><code>{displayValue(change.before)}</code></div>}
            {change.kind === "changed" && <ArrowRight className="admin-change-arrow" size={15} aria-hidden="true" />}
            {change.kind !== "removed" && <div className="admin-change-value is-after"><span className="admin-change-value-label">After</span><code>{displayValue(change.after)}</code></div>}
          </div>
        </article>
      ))}</div>}
    </div>
  );
}

type SortKey = "createdAt" | "adminEmail" | "adminRole" | "action" | "resource";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function titleCase(value: string): string {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function AdminActivityLogsPage() {
  const toast = useToast();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [selected, setSelected] = useState<LogRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const params = useCallback((withPage = true) => {
    const value = new URLSearchParams({ limit: String(pageSize), sortBy, sortDirection });
    if (withPage) value.set("page", String(page));
    if (query.trim()) value.set("q", query.trim());
    if (role) value.set("role", role);
    if (action) value.set("action", action);
    if (resource) value.set("resource", resource);
    if (dateFrom) value.set("dateFrom", dateFrom);
    if (dateTo) value.set("dateTo", dateTo);
    return value;
  }, [action, dateFrom, dateTo, page, pageSize, query, resource, role, sortBy, sortDirection]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await adminApiFetch<LogRow[]>(`activity-logs?${params().toString()}`);
      setRows(response.data || []);
      const pagination = response.pagination as typeof response.pagination & { total?: number; totalPages?: number; page?: number };
      setTotal(pagination?.total ?? 0);
      setTotalPages(Math.max(1, pagination?.totalPages ?? 1));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load activity logs.";
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  }, [params, toast]);

  useEffect(() => { void load(); }, [load]);

  const clearFilters = () => {
    setQuery(""); setRole(""); setAction(""); setResource(""); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const changeSort = (key: SortKey) => {
    setPage(1);
    if (sortBy === key) setSortDirection((current) => current === "ASC" ? "DESC" : "ASC");
    else { setSortBy(key); setSortDirection(key === "createdAt" ? "DESC" : "ASC"); }
  };

  const exportLogs = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/activity-logs/export.csv?${params(false).toString()}`, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("Export could not be created.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "admin-activity-logs.csv"; anchor.click(); URL.revokeObjectURL(url);
      toast.success("Activity log CSV downloaded.");
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : "Export failed."); }
    finally { setExporting(false); }
  };

  const sortIcon = (key: SortKey) => sortBy === key ? (sortDirection === "ASC" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronsUpDown size={12} />;
  const drawerFields = useMemo(() => selected ? [
    { label: "Administrator", value: selected.adminName || "Former administrator" },
    { label: "Role", value: titleCase(selected.adminRole) },
    { label: "Email", value: selected.adminEmail, fullWidth: true, isEmail: true },
    { label: "Activity", value: `${titleCase(selected.action)} ${titleCase(selected.resource)}`, fullWidth: true },
  ] : [], [selected]);

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="Access & security" title="Activity logs" description="Read-only history of successful mutations made through the admin dashboard." />
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      <section className="admin-dash-panel admin-activity-log-panel" aria-label="Admin activity logs">
        <header className="admin-dash-table-toolbar">
          <div className="admin-dash-search-box"><Search size={14} className="admin-dash-search-icon" /><input className="admin-dash-search-input" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search administrator, action, resource..." aria-label="Search activity logs" />{query && <button type="button" className="admin-dash-search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={11} /></button>}</div>
          <div className="admin-dash-filter-grid">
            <select className="admin-dash-filter-input" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter by role"><option value="">All roles</option><option value="admin">Admin</option><option value="super-admin">Super admin</option></select>
            <input className="admin-dash-filter-input" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} placeholder="Action" aria-label="Filter by action" />
            <input className="admin-dash-filter-input" value={resource} onChange={(event) => { setResource(event.target.value); setPage(1); }} placeholder="Resource" aria-label="Filter by resource" />
            <input className="admin-dash-filter-input" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} type="date" aria-label="Date from" />
            <input className="admin-dash-filter-input" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} type="date" aria-label="Date to" />
            <button type="button" className="admin-button secondary" onClick={clearFilters}>Clear filters</button>
            <button type="button" className="admin-button secondary" onClick={exportLogs} disabled={exporting}><Download size={14} /> {exporting ? "Exporting..." : "Export CSV"}</button>
          </div>
        </header>
        {loading ? <AdminTableSkeleton rows={6} columns={6} /> : <div className="admin-dash-table-wrap"><table className="admin-dash-table"><thead><tr><th><button type="button" className="admin-dash-sort" onClick={() => changeSort("createdAt")}>Date {sortIcon("createdAt")}</button></th><th><button type="button" className="admin-dash-sort" onClick={() => changeSort("adminEmail")}>Administrator {sortIcon("adminEmail")}</button></th><th><button type="button" className="admin-dash-sort" onClick={() => changeSort("action")}>Action {sortIcon("action")}</button></th><th><button type="button" className="admin-dash-sort" onClick={() => changeSort("resource")}>Resource {sortIcon("resource")}</button></th><th>Summary</th><th className="admin-dash-action-heading">Action</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6} className="admin-dash-empty">No activity logs found.</td></tr> : rows.map((row) => <tr key={row.id} className="admin-dash-row" onClick={() => setSelected(row)}><td data-label="Date">{formatDate(row.createdAt)}</td><td data-label="Administrator">{row.adminName || "Former administrator"}<small>{row.adminEmail} · {titleCase(row.adminRole)}</small></td><td data-label="Action"><span className="admin-dash-pill is-courses">{titleCase(row.action)}</span></td><td data-label="Resource">{titleCase(row.resource)}</td><td data-label="Summary">{titleCase(row.action)} {titleCase(row.resource)}</td><td className="admin-dash-action-cell"><button type="button" className="admin-dash-link-btn" onClick={(event) => { event.stopPropagation(); setSelected(row); }}>View &rarr;</button></td></tr>)}</tbody></table></div>}
        <footer className="admin-dash-footer"><span>Showing {rows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, total)} of {total} activity logs</span><div className="admin-dash-pagination admin-pagination-controls"><label>Rows <select value={pageSize} onChange={(event) => changePageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><button type="button" className="admin-icon-button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2).map((number) => <button type="button" key={number} className={`admin-dash-page-number ${page === number ? "is-active" : ""}`} onClick={() => setPage(number)}>{number}</button>)}<button type="button" className="admin-icon-button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight size={15} /></button></div></footer>
      </section>
      {selected && <AdminDetailDrawer open onClose={() => setSelected(null)} badge={{ label: "Activity log", variant: "messages" }} title={`${titleCase(selected.action)} ${titleCase(selected.resource)}`} avatarText={(selected.adminName || selected.adminEmail).charAt(0).toUpperCase()} timestamp={formatDate(selected.createdAt)} fields={drawerFields} changeReview={<ChangeReview log={selected} />} />}
    </div>
  );
}
