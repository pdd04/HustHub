export const verificationLevels = ["unverified", "bronze", "silver", "gold"] as const;

export type VerificationLevel = (typeof verificationLevels)[number];

export const userRoles = ["student", "reviewer", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export const documentTypes = [
  "textbook",
  "lecture",
  "past_exam",
  "summary_note",
  "exercise",
  "survival_kit",
  "other"
] as const;

export type DocumentType = (typeof documentTypes)[number];

export const documentSortValues = ["relevance", "newest", "popular", "rating"] as const;

export type DocumentSort = (typeof documentSortValues)[number];

export type FilterOption = {
  id: string;
  name: string;
  count: number;
};

export type DocumentTypeFilterOption = FilterOption & {
  id: DocumentType;
};

export type DocumentItem = {
  id: string;
  title: string;
  author: string;
  field: string;
  fieldName: string;
  majorId: string | null;
  subjectId: string | null;
  subject: string;
  documentType: DocumentType;
  type: string;
  year: number;
  pages: number;
  verification: VerificationLevel;
  rating: number;
  reviews: number;
  downloads: number;
  views: number;
  institution: string;
  description: string;
  size: string;
  format: string;
  tags: string[];
  instructorName: string | null;
  termLabel: string | null;
  examName: string | null;
  verificationStatus: "pending" | "approved" | "rejected";
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentFacets = {
  majors: FilterOption[];
  subjectsByMajor: Record<string, FilterOption[]>;
  documentTypes: DocumentTypeFilterOption[];
  years: FilterOption[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type DocumentListResponse = {
  items: DocumentItem[];
  pagination: PaginationMeta;
  facets: DocumentFacets;
};

export type DocumentDetailResponse = {
  document: DocumentItem;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  studentCode: string | null;
  institutionId: string | null;
  majorId: string | null;
  role: UserRole;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type MeResponse = {
  user: AuthUser;
};

export type UploadOptionsResponse = {
  majors: FilterOption[];
  subjectsByMajor: Record<string, FilterOption[]>;
  documentTypes: DocumentTypeFilterOption[];
  years: FilterOption[];
};

export type UploadDocumentResponse = {
  document: DocumentItem;
};
