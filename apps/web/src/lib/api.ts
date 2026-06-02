import type {
  AuthResponse,
  MeResponse,
  DocumentDetailResponse,
  DocumentListResponse,
  DocumentSort,
  DocumentType,
  UploadDocumentResponse,
  UploadOptionsResponse,
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
