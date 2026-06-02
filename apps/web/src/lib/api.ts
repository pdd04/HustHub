import type {
  AdminAuditLogsResponse,
  AdminDeleteResponse,
  AdminExamItem,
  AdminInstructorItem,
  AdminInstitutionItem,
  AdminMajorItem,
  AdminMutationResponse,
  AdminReportItem,
  AdminReportsResponse,
  AdminSubjectItem,
  AdminSummaryResponse,
  AdminTaxonomyResponse,
  AdminUserItem,
  AdminUsersResponse,
  AuthResponse,
  CommentDocumentResponse,
  DocumentVisibility,
  MeResponse,
  DeleteCourseEnrollmentResponse,
  DocumentDetailResponse,
  DocumentListResponse,
  DocumentSort,
  DocumentType,
  PersonalizationDashboardResponse,
  RatingDocumentResponse,
  ReportDocumentResponse,
  ReportReason,
  ReportStatus,
  ReviewDecision,
  ReviewDocumentResponse,
  ReviewQueueResponse,
  UpsertCourseEnrollmentResponse,
  UploadDocumentResponse,
  UploadOptionsResponse,
  UserRole,
  UserStatus,
  VerificationLevel
} from "@itss/shared";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export type DocumentsQuery = {
  q?: string;
  majorId?: string | null;
  subjectId?: string | null;
  types?: DocumentType[];
  verificationLevels?: VerificationLevel[];
  year?: number | null;
  sort?: DocumentSort;
  page?: number;
  limit?: number;
};

export async function getDocuments(query: DocumentsQuery, signal?: AbortSignal) {
  return fetchJson<DocumentListResponse>(`/api/documents${buildDocumentsQueryString(query)}`, { signal });
}

export async function getDocumentById(documentId: string, signal?: AbortSignal) {
  return fetchJson<DocumentDetailResponse>(`/api/documents/${encodeURIComponent(documentId)}`, { signal });
}

export async function getUploadOptions(signal?: AbortSignal) {
  return fetchJson<UploadOptionsResponse>("/api/documents/upload-options", { signal });
}

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  studentCode?: string;
}) {
  return fetchJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return fetchJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function getCurrentUser(token: string, signal?: AbortSignal) {
  return fetchJson<MeResponse>("/api/auth/me", {
    signal,
    token
  });
}

export async function logoutUser(token: string) {
  return fetchJson<{ message: string }>("/api/auth/logout", {
    method: "POST",
    token
  });
}

export async function uploadDocument(formData: FormData, token: string) {
  return fetchJson<UploadDocumentResponse>("/api/documents", {
    method: "POST",
    body: formData,
    token
  });
}

export async function getReviewQueue(token: string, signal?: AbortSignal) {
  return fetchJson<ReviewQueueResponse>("/api/documents/review/queue", {
    signal,
    token
  });
}

export async function reviewDocument(
  documentId: string,
  payload: {
    decision: ReviewDecision;
    verificationLevel: VerificationLevel;
    note?: string;
  },
  token: string
) {
  return fetchJson<ReviewDocumentResponse>(`/api/documents/${encodeURIComponent(documentId)}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function rateDocument(documentId: string, rating: number, token: string) {
  return fetchJson<RatingDocumentResponse>(`/api/documents/${encodeURIComponent(documentId)}/rating`, {
    method: "POST",
    body: JSON.stringify({ rating }),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function addDocumentComment(documentId: string, content: string, token: string) {
  return fetchJson<CommentDocumentResponse>(`/api/documents/${encodeURIComponent(documentId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function reportDocument(documentId: string, reason: ReportReason, detail: string, token: string) {
  return fetchJson<ReportDocumentResponse>(`/api/documents/${encodeURIComponent(documentId)}/reports`, {
    method: "POST",
    body: JSON.stringify({ reason, detail }),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function getExamDashboard(token: string, signal?: AbortSignal) {
  return fetchJson<PersonalizationDashboardResponse>("/api/personalization/dashboard", {
    signal,
    token
  });
}

export async function upsertCourseEnrollment(
  payload: {
    subjectId: string;
    termLabel?: string;
    emailReminderEnabled: boolean;
  },
  token: string
) {
  return fetchJson<UpsertCourseEnrollmentResponse>("/api/personalization/enrollments", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function deleteCourseEnrollment(subjectId: string, token: string) {
  return fetchJson<DeleteCourseEnrollmentResponse>(`/api/personalization/enrollments/${encodeURIComponent(subjectId)}`, {
    method: "DELETE",
    token
  });
}

export type AdminResourceItemMap = {
  institutions: AdminInstitutionItem;
  majors: AdminMajorItem;
  subjects: AdminSubjectItem;
  instructors: AdminInstructorItem;
  exams: AdminExamItem;
};

export type AdminResource = keyof AdminResourceItemMap;

export async function getAdminSummary(token: string, signal?: AbortSignal) {
  return fetchJson<AdminSummaryResponse>("/api/admin/summary", {
    signal,
    token
  });
}

export async function getAdminTaxonomy(token: string, signal?: AbortSignal) {
  return fetchJson<AdminTaxonomyResponse>("/api/admin/taxonomy", {
    signal,
    token
  });
}

export async function createAdminResource<R extends AdminResource>(resource: R, payload: Record<string, unknown>, token: string) {
  return fetchJson<AdminMutationResponse<AdminResourceItemMap[R]>>(`/api/admin/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function updateAdminResource<R extends AdminResource>(
  resource: R,
  id: string,
  payload: Record<string, unknown>,
  token: string
) {
  return fetchJson<AdminMutationResponse<AdminResourceItemMap[R]>>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function deleteAdminResource(resource: AdminResource, id: string, token: string) {
  return fetchJson<AdminDeleteResponse>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token
  });
}

export async function getAdminUsers(
  token: string,
  query: {
    q?: string;
    role?: UserRole | "all";
    status?: UserStatus | "all";
    page?: number;
    limit?: number;
  } = {},
  signal?: AbortSignal
) {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.role && query.role !== "all") params.set("role", query.role);
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  return fetchJson<AdminUsersResponse>(`/api/admin/users${params.toString() ? `?${params.toString()}` : ""}`, {
    signal,
    token
  });
}

export async function updateAdminUser(
  userId: string,
  payload: {
    role?: UserRole;
    status?: UserStatus;
    institutionId?: string | null;
    majorId?: string | null;
  },
  token: string
) {
  return fetchJson<AdminMutationResponse<AdminUserItem>>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function getAdminReports(token: string, status: ReportStatus | "all" = "open", signal?: AbortSignal) {
  const suffix = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;

  return fetchJson<AdminReportsResponse>(`/api/admin/reports${suffix}`, {
    signal,
    token
  });
}

export async function updateAdminReport(reportId: string, payload: { status: ReportStatus; hideDocument: boolean }, token: string) {
  return fetchJson<AdminMutationResponse<AdminReportItem>>(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    token
  });
}

export async function updateAdminDocumentVisibility(documentId: string, visibility: DocumentVisibility, token: string) {
  return fetchJson<{ item: { id: string; title: string; visibility: DocumentVisibility } }>(
    `/api/admin/documents/${encodeURIComponent(documentId)}/visibility`,
    {
      method: "PATCH",
      body: JSON.stringify({ visibility }),
      headers: {
        "Content-Type": "application/json"
      },
      token
    }
  );
}

export async function getAdminAuditLogs(token: string, signal?: AbortSignal) {
  return fetchJson<AdminAuditLogsResponse>("/api/admin/audit-logs", {
    signal,
    token
  });
}

export function getAssetUrl(fileUrl: string) {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  return `${apiBaseUrl}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}

function buildDocumentsQueryString(query: DocumentsQuery) {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.majorId && query.majorId !== "all") params.set("majorId", query.majorId);
  if (query.subjectId) params.set("subjectId", query.subjectId);
  if (query.types?.length) params.set("type", query.types.join(","));
  if (query.verificationLevels?.length) params.set("verificationLevel", query.verificationLevels.join(","));
  if (query.year) params.set("year", String(query.year));
  if (query.sort) params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

type FetchJsonOptions = {
  signal?: AbortSignal;
  method?: string;
  body?: BodyInit;
  headers?: Record<string, string>;
  token?: string;
};

async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    signal: options.signal,
    method: options.method,
    body: options.body,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Không thể tải dữ liệu từ API.";

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
