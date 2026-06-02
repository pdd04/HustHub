export const verificationLevels = ["unverified", "bronze", "silver", "gold"] as const;

export type VerificationLevel = (typeof verificationLevels)[number];

export const verificationStatuses = ["pending", "approved", "rejected", "changes_requested"] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];

export const reviewDecisions = ["approved", "rejected", "changes_requested"] as const;

export type ReviewDecision = (typeof reviewDecisions)[number];

export const reportReasons = ["inaccurate", "outdated", "copyright", "inappropriate", "spam", "other"] as const;

export type ReportReason = (typeof reportReasons)[number];

export type ReportStatus = "open" | "resolved" | "dismissed";

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
  verificationStatus: VerificationStatus;
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

export type ReviewHistoryItem = {
  id: string;
  reviewerName: string;
  reviewerRole: UserRole;
  decision: ReviewDecision;
  verificationLevel: VerificationLevel;
  note: string | null;
  createdAt: string;
};

export type DocumentRatingItem = {
  id: string;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentCommentItem = {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentReportItem = {
  id: string;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
};

export type DocumentDetailResponse = {
  document: DocumentItem;
  comments: DocumentCommentItem[];
  reviewHistory: ReviewHistoryItem[];
};

export type ReviewQueueItem = {
  document: DocumentItem;
  uploaderName: string | null;
  pendingSince: string;
  lastReview: ReviewHistoryItem | null;
  reportCount: number;
  commentCount: number;
};

export type ReviewQueueSummary = {
  pending: number;
  changesRequested: number;
  approved: number;
  rejected: number;
  openReports: number;
};

export type ReviewQueueResponse = {
  items: ReviewQueueItem[];
  summary: ReviewQueueSummary;
};

export type ReviewDocumentResponse = {
  document: DocumentItem;
  review: ReviewHistoryItem;
};

export type RatingDocumentResponse = {
  document: DocumentItem;
  rating: DocumentRatingItem;
};

export type CommentDocumentResponse = {
  comment: DocumentCommentItem;
};

export type ReportDocumentResponse = {
  report: DocumentReportItem;
};
