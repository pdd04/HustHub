export const verificationLevels = ["unverified", "bronze", "silver", "gold"] as const;

export type VerificationLevel = (typeof verificationLevels)[number];

export const verificationStatuses = ["pending", "approved", "rejected", "changes_requested"] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];

export const reviewDecisions = ["approved", "rejected", "changes_requested"] as const;

export type ReviewDecision = (typeof reviewDecisions)[number];

export const reportReasons = ["inaccurate", "outdated", "copyright", "inappropriate", "spam", "other"] as const;

export type ReportReason = (typeof reportReasons)[number];

export type ReportStatus = "open" | "resolved" | "dismissed";

export const documentVisibilities = ["public", "private", "hidden"] as const;

export type DocumentVisibility = (typeof documentVisibilities)[number];

export const examTypes = ["midterm", "final", "quiz"] as const;

export type ExamType = (typeof examTypes)[number];

export const userRoles = ["student", "reviewer", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["active", "suspended"] as const;

export type UserStatus = (typeof userStatuses)[number];

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

export type SubjectOption = {
  id: string;
  name: string;
  majorId: string | null;
  majorName: string;
  enrolled: boolean;
};

export type ExamItem = {
  id: string;
  subjectId: string;
  subjectName: string;
  majorName: string;
  name: string;
  examType: ExamType;
  examDate: string;
  daysUntil: number;
  termLabel: string | null;
  location: string | null;
  enrolled: boolean;
};

export type CourseEnrollmentItem = {
  id: string;
  subjectId: string;
  subjectName: string;
  majorName: string;
  termLabel: string | null;
  emailReminderEnabled: boolean;
  upcomingExamCount: number;
  nextExam: ExamItem | null;
  createdAt: string;
  updatedAt: string;
};

export type ExamDocumentRecommendation = {
  document: DocumentItem;
  score: number;
  reason: string;
};

export type QuickReviewSection = {
  exam: ExamItem;
  documents: ExamDocumentRecommendation[];
};

export type SurvivalKitSection = {
  subjectId: string;
  subjectName: string;
  majorName: string;
  nextExam: ExamItem | null;
  documents: ExamDocumentRecommendation[];
};

export type PersonalizationNotificationSummary = {
  enabledCount: number;
  nextReminderAt: string | null;
  message: string;
};

export type PersonalizationDashboardResponse = {
  enrolledSubjects: CourseEnrollmentItem[];
  availableSubjects: SubjectOption[];
  upcomingExams: ExamItem[];
  quickReview: QuickReviewSection[];
  survivalKits: SurvivalKitSection[];
  notifications: PersonalizationNotificationSummary;
};

export type UpsertCourseEnrollmentResponse = {
  enrollment: CourseEnrollmentItem;
};

export type DeleteCourseEnrollmentResponse = {
  deleted: boolean;
};

export type AdminInstitutionItem = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  majorCount: number;
  userCount: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminMajorItem = {
  id: string;
  institutionId: string | null;
  institutionName: string | null;
  code: string | null;
  name: string;
  description: string | null;
  subjectCount: number;
  userCount: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminSubjectItem = {
  id: string;
  majorId: string | null;
  majorName: string | null;
  code: string | null;
  name: string;
  description: string | null;
  documentCount: number;
  examCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminInstructorItem = {
  id: string;
  institutionId: string | null;
  institutionName: string | null;
  majorId: string | null;
  majorName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  fullName: string;
  title: string | null;
  email: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminExamItem = {
  id: string;
  subjectId: string;
  subjectName: string;
  majorName: string | null;
  name: string;
  examType: ExamType;
  examDate: string;
  termLabel: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTaxonomyResponse = {
  institutions: AdminInstitutionItem[];
  majors: AdminMajorItem[];
  subjects: AdminSubjectItem[];
  instructors: AdminInstructorItem[];
  exams: AdminExamItem[];
};

export type AdminUserItem = {
  id: string;
  email: string;
  fullName: string;
  studentCode: string | null;
  institutionId: string | null;
  institutionName: string | null;
  majorId: string | null;
  majorName: string | null;
  role: UserRole;
  status: UserStatus;
  documentCount: number;
  reviewCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersResponse = {
  items: AdminUserItem[];
  pagination: PaginationMeta;
};

export type AdminReportItem = {
  id: string;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  reporterName: string;
  reporterEmail: string;
  document: Pick<DocumentItem, "id" | "title" | "verificationStatus" | "verification" | "subject" | "fieldName"> & {
    visibility: DocumentVisibility;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdminReportsResponse = {
  items: AdminReportItem[];
};

export type AdminAuditLogItem = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AdminAuditLogsResponse = {
  items: AdminAuditLogItem[];
};

export type AdminSummaryResponse = {
  users: {
    total: number;
    admins: number;
    reviewers: number;
    suspended: number;
  };
  documents: {
    total: number;
    pending: number;
    hidden: number;
    openReports: number;
  };
  taxonomy: {
    institutions: number;
    majors: number;
    subjects: number;
    instructors: number;
    exams: number;
  };
};

export type AdminMutationResponse<T> = {
  item: T;
};

export type AdminDeleteResponse = {
  deleted: boolean;
};
