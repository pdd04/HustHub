import type {
  AdminAuditLogItem,
  AdminReportItem,
  AdminSummaryResponse,
  AdminTaxonomyResponse,
  AdminUserItem,
  AdminUsersResponse,
  AuthUser,
  DocumentVisibility,
  ExamType,
  ReportStatus,
  UserRole,
  UserStatus
} from "@itss/shared";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Database,
  GraduationCap,
  History,
  LogIn,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserCog,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type AdminResource,
  createAdminResource,
  deleteAdminResource,
  getAdminAuditLogs,
  getAdminReports,
  getAdminSummary,
  getAdminTaxonomy,
  getAdminUsers,
  updateAdminReport,
  updateAdminDocumentVisibility,
  updateAdminResource,
  updateAdminUser
} from "../lib/api";

type AdminDashboardPageProps = {
  currentUser: AuthUser | null;
  accessToken: string | null;
  onBack: () => void;
  onLogin: () => void;
};

type AdminTab = "overview" | "taxonomy" | "users" | "reports" | "audit";

type FormState = Record<string, string>;

const emptySummary: AdminSummaryResponse = {
  users: {
    total: 0,
    admins: 0,
    reviewers: 0,
    suspended: 0
  },
  documents: {
    total: 0,
    pending: 0,
    hidden: 0,
    openReports: 0
  },
  taxonomy: {
    institutions: 0,
    majors: 0,
    subjects: 0,
    instructors: 0,
    exams: 0
  }
};

const emptyTaxonomy: AdminTaxonomyResponse = {
  institutions: [],
  majors: [],
  subjects: [],
  instructors: [],
  exams: []
};

const emptyUsers: AdminUsersResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }
};

const adminTabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "taxonomy", label: "Taxonomy" },
  { id: "users", label: "Users" },
  { id: "reports", label: "Reports" },
  { id: "audit", label: "Audit" }
];

const resources: Array<{ id: AdminResource; label: string }> = [
  { id: "institutions", label: "Institution" },
  { id: "majors", label: "Major" },
  { id: "subjects", label: "Subject" },
  { id: "instructors", label: "Instructor" },
  { id: "exams", label: "Exam" }
];

const userRoles: UserRole[] = ["student", "reviewer", "admin"];
const userStatuses: UserStatus[] = ["active", "suspended"];
const reportStatuses: ReportStatus[] = ["open", "resolved", "dismissed"];
const documentVisibilities: DocumentVisibility[] = ["public", "private", "hidden"];
const examTypes: ExamType[] = ["midterm", "final", "quiz"];

export function AdminDashboardPage({ currentUser, accessToken, onBack, onLogin }: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [summary, setSummary] = useState<AdminSummaryResponse>(emptySummary);
  const [taxonomy, setTaxonomy] = useState<AdminTaxonomyResponse>(emptyTaxonomy);
  const [users, setUsers] = useState<AdminUsersResponse>(emptyUsers);
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(currentUser));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canAdmin = currentUser?.role === "admin";

  const loadDashboard = async (token: string, signal?: AbortSignal) => {
    const [summaryPayload, taxonomyPayload, usersPayload, reportsPayload, auditPayload] = await Promise.all([
      getAdminSummary(token, signal),
      getAdminTaxonomy(token, signal),
      getAdminUsers(token, { limit: 30 }, signal),
      getAdminReports(token, "open", signal),
      getAdminAuditLogs(token, signal)
    ]);

    setSummary(summaryPayload);
    setTaxonomy(taxonomyPayload);
    setUsers(usersPayload);
    setReports(reportsPayload.items);
    setAuditLogs(auditPayload.items);
  };

  useEffect(() => {
    if (!accessToken || !canAdmin) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    loadDashboard(accessToken, controller.signal)
      .catch((error) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : "Khong the tai admin dashboard.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [accessToken, canAdmin]);

  const refreshDashboard = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loadDashboard(accessToken);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Khong the tai lai admin dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <AdminShell onBack={onBack}>
        <StatusPanel title="Can dang nhap" description="Admin can dang nhap truoc khi mo trang van hanh.">
          <button className="primary-button" type="button" onClick={onLogin}>
            <LogIn size={18} /> Dang nhap
          </button>
        </StatusPanel>
      </AdminShell>
    );
  }

  if (!canAdmin) {
    return (
      <AdminShell onBack={onBack}>
        <StatusPanel title="Khong co quyen admin" description="Tai khoan nay chua co role admin." />
      </AdminShell>
    );
  }

  return (
    <AdminShell onBack={onBack}>
      <main className="admin-layout">
        <section className="admin-heading">
          <div>
            <p className="eyebrow">Phase 6 operations</p>
            <h1>Admin dashboard</h1>
            <span>Taxonomy, users, reports va audit log cho pilot noi bo</span>
          </div>
          <button className="secondary-button" type="button" disabled={isLoading} onClick={refreshDashboard}>
            <RefreshCw size={17} /> Refresh
          </button>
        </section>

        <nav className="admin-tabs" aria-label="Admin sections">
          {adminTabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "is-active" : ""}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {toastMessage ? <div className="form-success">{toastMessage}</div> : null}
        {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
        {isLoading ? <div className="inline-status">Dang tai du lieu admin...</div> : null}

        {activeTab === "overview" ? <OverviewTab summary={summary} /> : null}
        {activeTab === "taxonomy" ? (
          <TaxonomyTab
            accessToken={accessToken}
            taxonomy={taxonomy}
            onChanged={async (message) => {
              setToastMessage(message);
              await refreshDashboard();
            }}
            onError={setErrorMessage}
          />
        ) : null}
        {activeTab === "users" ? (
          <UsersTab
            accessToken={accessToken}
            users={users.items}
            taxonomy={taxonomy}
            onChanged={async (message) => {
              setToastMessage(message);
              await refreshDashboard();
            }}
            onError={setErrorMessage}
          />
        ) : null}
        {activeTab === "reports" ? (
          <ReportsTab
            accessToken={accessToken}
            reports={reports}
            onChanged={async (message) => {
              setToastMessage(message);
              await refreshDashboard();
            }}
            onError={setErrorMessage}
          />
        ) : null}
        {activeTab === "audit" ? <AuditTab logs={auditLogs} /> : null}
      </main>
    </AdminShell>
  );
}

function OverviewTab({ summary }: { summary: AdminSummaryResponse }) {
  const cards = [
    { label: "Users", value: summary.users.total, detail: `${summary.users.admins} admins, ${summary.users.reviewers} reviewers`, icon: Users },
    { label: "Pending docs", value: summary.documents.pending, detail: `${summary.documents.openReports} open reports`, icon: ClipboardList },
    { label: "Hidden docs", value: summary.documents.hidden, detail: `${summary.documents.total} total documents`, icon: ShieldCheck },
    { label: "Taxonomy", value: summary.taxonomy.subjects, detail: `${summary.taxonomy.exams} exams, ${summary.taxonomy.instructors} instructors`, icon: Database }
  ];

  return (
    <section className="admin-summary-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="admin-summary-card" key={card.label}>
            <span>
              <Icon size={20} />
            </span>
            <div>
              <strong>{card.value.toLocaleString("vi-VN")}</strong>
              <p>{card.label}</p>
              <small>{card.detail}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function TaxonomyTab({
  accessToken,
  taxonomy,
  onChanged,
  onError
}: {
  accessToken: string | null;
  taxonomy: AdminTaxonomyResponse;
  onChanged: (message: string) => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [resource, setResource] = useState<AdminResource>("institutions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => createEmptyForm("institutions"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItems = taxonomy[resource];
  const resourceLabel = resources.find((item) => item.id === resource)?.label ?? resource;

  const switchResource = (nextResource: AdminResource) => {
    setResource(nextResource);
    setEditingId(null);
    setForm(createEmptyForm(nextResource));
  };

  const submit = async () => {
    if (!accessToken) return;

    setIsSubmitting(true);
    onError(null);

    try {
      const payload = serializeResourcePayload(resource, form);

      if (editingId) {
        await updateAdminResource(resource, editingId, payload, accessToken);
      } else {
        await createAdminResource(resource, payload, accessToken);
      }

      setEditingId(null);
      setForm(createEmptyForm(resource));
      await onChanged(`${resourceLabel} da duoc luu.`);
    } catch (error) {
      onError(error instanceof Error ? error.message : `Khong the luu ${resourceLabel}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!accessToken) return;
    if (!window.confirm(`Xoa ${resourceLabel}?`)) return;

    setIsSubmitting(true);
    onError(null);

    try {
      await deleteAdminResource(resource, id, accessToken);
      await onChanged(`${resourceLabel} da duoc xoa.`);
    } catch (error) {
      onError(error instanceof Error ? error.message : `Khong the xoa ${resourceLabel}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-panel">
      <div className="section-heading">
        <div>
          <h2>Taxonomy CRUD</h2>
          <span>Quan ly institution, major, subject, instructor va exam.</span>
        </div>
      </div>

      <div className="admin-resource-tabs">
        {resources.map((item) => (
          <button className={resource === item.id ? "is-active" : ""} key={item.id} type="button" onClick={() => switchResource(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="admin-editor-grid">
        <div className="admin-form">
          <h3>{editingId ? `Edit ${resourceLabel}` : `New ${resourceLabel}`}</h3>
          <ResourceFields resource={resource} form={form} taxonomy={taxonomy} onChange={(patch) => setForm((current) => ({ ...current, ...patch }))} />
          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setEditingId(null);
                setForm(createEmptyForm(resource));
              }}
            >
              Reset
            </button>
            <button className="primary-button" type="button" disabled={isSubmitting} onClick={submit}>
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        <div className="admin-list">
          {selectedItems.length === 0 ? (
            <div className="empty-state empty-state--compact">
              <h2>Chua co du lieu</h2>
              <p>Tao ban ghi dau tien bang form ben trai.</p>
            </div>
          ) : null}

          {selectedItems.map((item) => (
            <article className="admin-row" key={item.id}>
              <div>
                <strong>{getResourceTitle(resource, item)}</strong>
                <span>{getResourceMeta(resource, item)}</span>
              </div>
              <div className="admin-row__actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setForm(createFormFromItem(resource, item));
                  }}
                >
                  Edit
                </button>
                <button className="danger-button" type="button" disabled={isSubmitting} onClick={() => remove(item.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourceFields({
  resource,
  form,
  taxonomy,
  onChange
}: {
  resource: AdminResource;
  form: FormState;
  taxonomy: AdminTaxonomyResponse;
  onChange: (patch: FormState) => void;
}) {
  if (resource === "institutions") {
    return (
      <div className="form-stack">
        <TextField label="Name" value={form.name} onChange={(name) => onChange({ name })} />
        <TextField label="Code" value={form.code} onChange={(code) => onChange({ code })} />
        <TextAreaField label="Description" value={form.description} onChange={(description) => onChange({ description })} />
      </div>
    );
  }

  if (resource === "majors") {
    return (
      <div className="form-stack">
        <SelectField
          label="Institution"
          value={form.institutionId}
          options={taxonomy.institutions.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(institutionId) => onChange({ institutionId })}
        />
        <TextField label="Name" value={form.name} onChange={(name) => onChange({ name })} />
        <TextField label="Code" value={form.code} onChange={(code) => onChange({ code })} />
        <TextAreaField label="Description" value={form.description} onChange={(description) => onChange({ description })} />
      </div>
    );
  }

  if (resource === "subjects") {
    return (
      <div className="form-stack">
        <SelectField
          label="Major"
          value={form.majorId}
          options={taxonomy.majors.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(majorId) => onChange({ majorId })}
        />
        <TextField label="Name" value={form.name} onChange={(name) => onChange({ name })} />
        <TextField label="Code" value={form.code} onChange={(code) => onChange({ code })} />
        <TextAreaField label="Description" value={form.description} onChange={(description) => onChange({ description })} />
      </div>
    );
  }

  if (resource === "instructors") {
    return (
      <div className="form-stack">
        <SelectField
          label="Institution"
          value={form.institutionId}
          options={taxonomy.institutions.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(institutionId) => onChange({ institutionId })}
        />
        <SelectField
          label="Major"
          value={form.majorId}
          options={taxonomy.majors.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(majorId) => onChange({ majorId })}
        />
        <SelectField
          label="Subject"
          value={form.subjectId}
          options={taxonomy.subjects.map((item) => ({ value: item.id, label: item.name }))}
          onChange={(subjectId) => onChange({ subjectId })}
        />
        <TextField label="Full name" value={form.fullName} onChange={(fullName) => onChange({ fullName })} />
        <TextField label="Title" value={form.title} onChange={(title) => onChange({ title })} />
        <TextField label="Email" value={form.email} onChange={(email) => onChange({ email })} />
        <TextAreaField label="Bio" value={form.bio} onChange={(bio) => onChange({ bio })} />
      </div>
    );
  }

  return (
    <div className="form-stack">
      <SelectField
        label="Subject"
        value={form.subjectId}
        options={taxonomy.subjects.map((item) => ({ value: item.id, label: item.name }))}
        onChange={(subjectId) => onChange({ subjectId })}
      />
      <TextField label="Name" value={form.name} onChange={(name) => onChange({ name })} />
      <label className="field">
        <span>Exam type</span>
        <select value={form.examType} onChange={(event) => onChange({ examType: event.target.value })}>
          {examTypes.map((examType) => (
            <option key={examType} value={examType}>
              {examType}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Exam date</span>
        <input type="datetime-local" value={form.examDate} onChange={(event) => onChange({ examDate: event.target.value })} />
      </label>
      <TextField label="Term" value={form.termLabel} onChange={(termLabel) => onChange({ termLabel })} />
      <TextField label="Location" value={form.location} onChange={(location) => onChange({ location })} />
    </div>
  );
}

function UsersTab({
  accessToken,
  users,
  taxonomy,
  onChanged,
  onError
}: {
  accessToken: string | null;
  users: AdminUserItem[];
  taxonomy: AdminTaxonomyResponse;
  onChanged: (message: string) => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, { role: UserRole; status: UserStatus; institutionId: string; majorId: string }>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const readDraft = (user: AdminUserItem) =>
    drafts[user.id] ?? {
      role: user.role,
      status: user.status,
      institutionId: user.institutionId ?? "",
      majorId: user.majorId ?? ""
    };

  const patchDraft = (user: AdminUserItem, patch: Partial<ReturnType<typeof readDraft>>) => {
    setDrafts((current) => ({
      ...current,
      [user.id]: {
        ...readDraft(user),
        ...patch
      }
    }));
  };

  const saveUser = async (user: AdminUserItem) => {
    if (!accessToken) return;

    const draft = readDraft(user);

    setSavingUserId(user.id);
    onError(null);

    try {
      await updateAdminUser(
        user.id,
        {
          role: draft.role,
          status: draft.status,
          institutionId: draft.institutionId || null,
          majorId: draft.majorId || null
        },
        accessToken
      );
      await onChanged(`${user.fullName} da duoc cap nhat.`);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Khong the cap nhat user.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <section className="admin-panel">
      <div className="section-heading">
        <div>
          <h2>User role management</h2>
          <span>Cap role reviewer/admin, khoa tai khoan va gan taxonomy.</span>
        </div>
      </div>

      <div className="admin-list">
        {users.map((user) => {
          const draft = readDraft(user);

          return (
            <article className="admin-user-row" key={user.id}>
              <div>
                <strong>{user.fullName}</strong>
                <span>{user.email}</span>
                <small>
                  {user.documentCount} docs / {user.reviewCount} reviews / {user.reportCount} reports
                </small>
              </div>
              <label className="field">
                <span>Role</span>
                <select value={draft.role} onChange={(event) => patchDraft(user, { role: event.target.value as UserRole })}>
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select value={draft.status} onChange={(event) => patchDraft(user, { status: event.target.value as UserStatus })}>
                  {userStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <SelectField
                label="Institution"
                value={draft.institutionId}
                options={taxonomy.institutions.map((item) => ({ value: item.id, label: item.name }))}
                onChange={(institutionId) => patchDraft(user, { institutionId })}
              />
              <SelectField
                label="Major"
                value={draft.majorId}
                options={taxonomy.majors.map((item) => ({ value: item.id, label: item.name }))}
                onChange={(majorId) => patchDraft(user, { majorId })}
              />
              <button className="primary-button" type="button" disabled={savingUserId === user.id} onClick={() => saveUser(user)}>
                <Save size={16} /> Save
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReportsTab({
  accessToken,
  reports,
  onChanged,
  onError
}: {
  accessToken: string | null;
  reports: AdminReportItem[];
  onChanged: (message: string) => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, { status: ReportStatus; hideDocument: boolean; visibility: DocumentVisibility }>>({});
  const [savingReportId, setSavingReportId] = useState<string | null>(null);

  const readDraft = (report: AdminReportItem) =>
    drafts[report.id] ?? {
      status: report.status,
      hideDocument: report.document.visibility === "hidden",
      visibility: report.document.visibility
    };

  const patchDraft = (report: AdminReportItem, patch: Partial<ReturnType<typeof readDraft>>) => {
    setDrafts((current) => ({
      ...current,
      [report.id]: {
        ...readDraft(report),
        ...patch
      }
    }));
  };

  const saveReport = async (report: AdminReportItem) => {
    if (!accessToken) return;

    const draft = readDraft(report);

    setSavingReportId(report.id);
    onError(null);

    try {
      if (draft.visibility !== report.document.visibility) {
        await updateAdminDocumentVisibility(report.document.id, draft.visibility, accessToken);
      }

      await updateAdminReport(report.id, { status: draft.status, hideDocument: draft.hideDocument }, accessToken);
      await onChanged(`Report ${report.id} da duoc cap nhat.`);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Khong the cap nhat report.");
    } finally {
      setSavingReportId(null);
    }
  };

  return (
    <section className="admin-panel">
      <div className="section-heading">
        <div>
          <h2>Report moderation</h2>
          <span>Xu ly report va an tai lieu vi pham khi can.</span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <h2>Khong co open report</h2>
          <p>Report moi se xuat hien tai day.</p>
        </div>
      ) : null}

      <div className="admin-list">
        {reports.map((report) => {
          const draft = readDraft(report);

          return (
            <article className="admin-report-row" key={report.id}>
              <div>
                <strong>{report.document.title}</strong>
                <span>
                  {report.reason} / {report.status} / {report.document.visibility}
                </span>
                <p>{report.detail ?? "No detail"}</p>
                <small>
                  Reported by {report.reporterName} ({report.reporterEmail})
                </small>
              </div>
              <label className="field">
                <span>Status</span>
                <select value={draft.status} onChange={(event) => patchDraft(report, { status: event.target.value as ReportStatus })}>
                  {reportStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Visibility</span>
                <select
                  value={draft.visibility}
                  onChange={(event) =>
                    patchDraft(report, {
                      visibility: event.target.value as DocumentVisibility,
                      hideDocument: event.target.value === "hidden"
                    })
                  }
                >
                  {documentVisibilities.map((visibility) => (
                    <option key={visibility} value={visibility}>
                      {visibility}
                    </option>
                  ))}
                </select>
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={draft.hideDocument}
                  onChange={(event) => patchDraft(report, { hideDocument: event.target.checked, visibility: event.target.checked ? "hidden" : "public" })}
                />
                Hide document
              </label>
              <button className="primary-button" type="button" disabled={savingReportId === report.id} onClick={() => saveReport(report)}>
                <Save size={16} /> Save
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AuditTab({ logs }: { logs: AdminAuditLogItem[] }) {
  return (
    <section className="admin-panel">
      <div className="section-heading">
        <div>
          <h2>Audit log</h2>
          <span>100 hanh dong admin gan nhat.</span>
        </div>
      </div>

      <div className="admin-list">
        {logs.map((log) => (
          <article className="admin-audit-row" key={log.id}>
            <span>
              <History size={16} />
            </span>
            <div>
              <strong>{log.action}</strong>
              <small>
                {log.actorName ?? "System"} / {log.entityType}
                {log.entityId ? `:${log.entityId}` : ""} / {formatDate(log.createdAt)}
              </small>
              <code>{JSON.stringify(log.metadata ?? {})}</code>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="detail-header">
        <div className="detail-header__inner">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lai
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

function StatusPanel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <main className="admin-layout admin-layout--single">
      <div className="status-panel">
        <h2>{title}</h2>
        <p>{description}</p>
        {children ? <div className="status-panel__actions">{children}</div> : null}
      </div>
    </main>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">None</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function createEmptyForm(resource: AdminResource): FormState {
  if (resource === "exams") {
    return {
      subjectId: "",
      name: "",
      examType: "midterm",
      examDate: "",
      termLabel: "",
      location: ""
    };
  }

  if (resource === "instructors") {
    return {
      institutionId: "",
      majorId: "",
      subjectId: "",
      fullName: "",
      title: "",
      email: "",
      bio: ""
    };
  }

  if (resource === "majors") {
    return {
      institutionId: "",
      name: "",
      code: "",
      description: ""
    };
  }

  if (resource === "subjects") {
    return {
      majorId: "",
      name: "",
      code: "",
      description: ""
    };
  }

  return {
    name: "",
    code: "",
    description: ""
  };
}

function serializeResourcePayload(resource: AdminResource, form: FormState): Record<string, unknown> {
  if (resource === "exams") {
    return {
      subjectId: form.subjectId,
      name: form.name,
      examType: form.examType,
      examDate: form.examDate ? new Date(form.examDate).toISOString() : "",
      termLabel: form.termLabel,
      location: form.location
    };
  }

  if (resource === "instructors") {
    return {
      institutionId: form.institutionId,
      majorId: form.majorId,
      subjectId: form.subjectId,
      fullName: form.fullName,
      title: form.title,
      email: form.email,
      bio: form.bio
    };
  }

  if (resource === "majors") {
    return {
      institutionId: form.institutionId,
      name: form.name,
      code: form.code,
      description: form.description
    };
  }

  if (resource === "subjects") {
    return {
      majorId: form.majorId,
      name: form.name,
      code: form.code,
      description: form.description
    };
  }

  return {
    name: form.name,
    code: form.code,
    description: form.description
  };
}

function createFormFromItem(resource: AdminResource, item: (AdminTaxonomyResponse[AdminResource])[number]): FormState {
  if (resource === "exams") {
    const exam = item as AdminTaxonomyResponse["exams"][number];

    return {
      subjectId: exam.subjectId,
      name: exam.name,
      examType: exam.examType,
      examDate: formatDateForInput(exam.examDate),
      termLabel: exam.termLabel ?? "",
      location: exam.location ?? ""
    };
  }

  if (resource === "instructors") {
    const instructor = item as AdminTaxonomyResponse["instructors"][number];

    return {
      institutionId: instructor.institutionId ?? "",
      majorId: instructor.majorId ?? "",
      subjectId: instructor.subjectId ?? "",
      fullName: instructor.fullName,
      title: instructor.title ?? "",
      email: instructor.email ?? "",
      bio: instructor.bio ?? ""
    };
  }

  if (resource === "majors") {
    const major = item as AdminTaxonomyResponse["majors"][number];

    return {
      institutionId: major.institutionId ?? "",
      name: major.name,
      code: major.code ?? "",
      description: major.description ?? ""
    };
  }

  if (resource === "subjects") {
    const subject = item as AdminTaxonomyResponse["subjects"][number];

    return {
      majorId: subject.majorId ?? "",
      name: subject.name,
      code: subject.code ?? "",
      description: subject.description ?? ""
    };
  }

  const institution = item as AdminTaxonomyResponse["institutions"][number];

  return {
    name: institution.name,
    code: institution.code ?? "",
    description: institution.description ?? ""
  };
}

function getResourceTitle(resource: AdminResource, item: (AdminTaxonomyResponse[AdminResource])[number]) {
  if (resource === "instructors") return (item as AdminTaxonomyResponse["instructors"][number]).fullName;

  return (item as { name: string }).name;
}

function getResourceMeta(resource: AdminResource, item: (AdminTaxonomyResponse[AdminResource])[number]) {
  if (resource === "institutions") {
    const institution = item as AdminTaxonomyResponse["institutions"][number];

    return `${institution.code ?? "no-code"} / ${institution.majorCount} majors / ${institution.documentCount} docs`;
  }

  if (resource === "majors") {
    const major = item as AdminTaxonomyResponse["majors"][number];

    return `${major.institutionName ?? "no institution"} / ${major.subjectCount} subjects / ${major.documentCount} docs`;
  }

  if (resource === "subjects") {
    const subject = item as AdminTaxonomyResponse["subjects"][number];

    return `${subject.majorName ?? "no major"} / ${subject.examCount} exams / ${subject.documentCount} docs`;
  }

  if (resource === "instructors") {
    const instructor = item as AdminTaxonomyResponse["instructors"][number];

    return `${instructor.title ?? "no title"} / ${instructor.subjectName ?? "no subject"} / ${instructor.email ?? "no email"}`;
  }

  const exam = item as AdminTaxonomyResponse["exams"][number];

  return `${exam.examType} / ${exam.subjectName} / ${formatDate(exam.examDate)}`;
}

function formatDateForInput(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return "";

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
