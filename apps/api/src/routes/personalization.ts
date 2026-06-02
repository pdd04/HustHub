import type {
  CourseEnrollmentItem,
  DeleteCourseEnrollmentResponse,
  DocumentItem,
  DocumentType,
  ExamDocumentRecommendation,
  ExamItem,
  ExamType,
  PersonalizationDashboardResponse,
  QuickReviewSection,
  SubjectOption,
  SurvivalKitSection,
  UpsertCourseEnrollmentResponse,
  VerificationLevel
} from "@itss/shared";
import { Prisma } from "@prisma/client";
import { Router, type NextFunction, type Request, type Response } from "express";
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();
const enrollmentRoles = ["student", "reviewer", "admin"] as const;
const daysInMilliseconds = 24 * 60 * 60 * 1000;

const documentInclude = {
  institution: true,
  major: true,
  subject: true,
  uploader: {
    select: {
      fullName: true
    }
  }
} satisfies Prisma.DocumentInclude;

const documentTypeLabels: Record<DocumentType, string> = {
  textbook: "Giao trinh",
  lecture: "Bai giang",
  past_exam: "De thi cu",
  summary_note: "Note tom tat",
  exercise: "Bai tap",
  survival_kit: "Survival kit",
  other: "Tai lieu khac"
};

const examTypeLabels: Record<ExamType, string> = {
  midterm: "Midterm",
  final: "Final",
  quiz: "Quiz"
};

const verificationWeight: Record<VerificationLevel, number> = {
  gold: 30,
  silver: 24,
  bronze: 17,
  unverified: 4
};

type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: typeof documentInclude;
}>;

type ExamWithSubject = {
  id: string;
  subjectId: string;
  name: string;
  examType: string;
  examDate: Date;
  termLabel: string | null;
  location: string | null;
  subject: {
    name: string;
    major: {
      name: string;
    } | null;
  };
};

type EnrollmentWithSubject = {
  id: string;
  subjectId: string;
  termLabel: string | null;
  emailReminderEnabled: boolean;
  subject: {
    name: string;
    major: {
      name: string;
    } | null;
    exams: Array<Omit<ExamWithSubject, "subject">>;
  };
  createdAt: Date;
  updatedAt: Date;
};

router.get(
  "/dashboard",
  authenticate,
  requireRole([...enrollmentRoles]),
  asyncHandler(async (request, response) => {
    const user = (request as AuthenticatedRequest).currentUser;
    const now = new Date();
    const [enrollments, subjects] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where: {
          userId: user.id
        },
        include: {
          subject: {
            include: {
              major: true,
              exams: {
                where: {
                  examDate: {
                    gte: now
                  }
                },
                orderBy: {
                  examDate: "asc"
                },
                take: 5
              }
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      }),
      prisma.subject.findMany({
        include: {
          major: true
        },
        orderBy: {
          name: "asc"
        }
      })
    ]);

    const enrolledSubjectIds = enrollments.map((enrollment) => enrollment.subjectId);
    const enrolledSubjectSet = new Set(enrolledSubjectIds);
    const [upcomingExamRecords, documents] =
      enrolledSubjectIds.length > 0
        ? await Promise.all([
            prisma.exam.findMany({
              where: {
                subjectId: {
                  in: enrolledSubjectIds
                },
                examDate: {
                  gte: now
                }
              },
              include: {
                subject: {
                  include: {
                    major: true
                  }
                }
              },
              orderBy: {
                examDate: "asc"
              },
              take: 12
            }),
            prisma.document.findMany({
              where: {
                subjectId: {
                  in: enrolledSubjectIds
                },
                visibility: "public",
                verificationStatus: "approved"
              },
              include: documentInclude
            })
          ])
        : [[], []];

    const upcomingExams = upcomingExamRecords.map((exam) => mapExamItem(exam, true, now));
    const payload: PersonalizationDashboardResponse = {
      enrolledSubjects: enrollments.map((enrollment) => mapEnrollmentItem(enrollment, now)),
      availableSubjects: subjects.map((subject): SubjectOption => ({
        id: subject.id,
        name: subject.name,
        majorId: subject.majorId,
        majorName: subject.major?.name ?? "Chua phan nganh",
        enrolled: enrolledSubjectSet.has(subject.id)
      })),
      upcomingExams,
      quickReview: buildQuickReviewSections(upcomingExamRecords, documents, now),
      survivalKits: buildSurvivalKitSections(enrollments, upcomingExams, documents),
      notifications: buildNotificationSummary(enrollments, upcomingExamRecords)
    };

    response.status(200).json(payload);
  })
);

router.post(
  "/enrollments",
  authenticate,
  requireRole([...enrollmentRoles]),
  asyncHandler(async (request, response) => {
    const user = (request as AuthenticatedRequest).currentUser;
    const payload = parseEnrollmentBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Vui long chon mon hoc hop le." });
      return;
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: payload.subjectId
      },
      select: {
        id: true
      }
    });

    if (!subject) {
      response.status(404).json({ message: "Khong tim thay mon hoc." });
      return;
    }

    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        userId_subjectId: {
          userId: user.id,
          subjectId: payload.subjectId
        }
      },
      update: {
        termLabel: payload.termLabel,
        emailReminderEnabled: payload.emailReminderEnabled
      },
      create: {
        userId: user.id,
        subjectId: payload.subjectId,
        termLabel: payload.termLabel,
        emailReminderEnabled: payload.emailReminderEnabled
      },
      include: {
        subject: {
          include: {
            major: true,
            exams: {
              where: {
                examDate: {
                  gte: new Date()
                }
              },
              orderBy: {
                examDate: "asc"
              },
              take: 5
            }
          }
        }
      }
    });
    const result: UpsertCourseEnrollmentResponse = {
      enrollment: mapEnrollmentItem(enrollment, new Date())
    };

    response.status(200).json(result);
  })
);

router.delete(
  "/enrollments/:subjectId",
  authenticate,
  requireRole([...enrollmentRoles]),
  asyncHandler(async (request, response) => {
    const user = (request as AuthenticatedRequest).currentUser;
    const subjectId = readString(request.params.subjectId);

    if (!subjectId) {
      response.status(400).json({ message: "Mon hoc khong hop le." });
      return;
    }

    const result = await prisma.courseEnrollment.deleteMany({
      where: {
        userId: user.id,
        subjectId
      }
    });
    const payload: DeleteCourseEnrollmentResponse = {
      deleted: result.count > 0
    };

    response.status(200).json(payload);
  })
);

function buildQuickReviewSections(exams: ExamWithSubject[], documents: DocumentWithRelations[], now: Date): QuickReviewSection[] {
  return exams.slice(0, 3).map((exam) => ({
    exam: mapExamItem(exam, true, now),
    documents: rankDocumentsForExam(
      documents.filter((document) => document.subjectId === exam.subjectId && document.documentType !== "survival_kit"),
      exam,
      false
    ).slice(0, 5)
  }));
}

function buildSurvivalKitSections(
  enrollments: EnrollmentWithSubject[],
  upcomingExams: ExamItem[],
  documents: DocumentWithRelations[]
): SurvivalKitSection[] {
  return enrollments.map((enrollment) => {
    const nextExam = upcomingExams.find((exam) => exam.subjectId === enrollment.subjectId) ?? null;
    const subjectDocuments = documents.filter((document) => document.subjectId === enrollment.subjectId);

    return {
      subjectId: enrollment.subjectId,
      subjectName: enrollment.subject.name,
      majorName: enrollment.subject.major?.name ?? "Chua phan nganh",
      nextExam,
      documents: rankDocumentsForExam(subjectDocuments, null, true).slice(0, 4)
    };
  });
}

function rankDocumentsForExam(
  documents: DocumentWithRelations[],
  exam: ExamWithSubject | null,
  preferSurvivalKit: boolean
): ExamDocumentRecommendation[] {
  return documents
    .map((document) => ({
      document: mapDocumentItem(document),
      score: calculateExamScore(document, exam, preferSurvivalKit),
      reason: buildRecommendationReason(document, exam, preferSurvivalKit)
    }))
    .sort((a, b) => b.score - a.score || b.document.rating - a.document.rating || b.document.downloads - a.document.downloads);
}

function calculateExamScore(document: DocumentWithRelations, exam: ExamWithSubject | null, preferSurvivalKit: boolean) {
  const typeScore = getDocumentTypeExamScore(document.documentType as DocumentType, exam, preferSurvivalKit);
  const trustScore = verificationWeight[document.verificationLevel as VerificationLevel] ?? 0;
  const ratingScore = Math.min(Number(document.ratingAvg) / 5, 1) * 18;
  const popularityScore = Math.min(Math.log10(document.viewCount + document.downloadCount * 2 + 1) / 5, 1) * 14;
  const recencyScore = document.year && document.year >= new Date().getFullYear() - 1 ? 8 : 3;
  const examNameScore = exam && document.examName && matchesExamName(document.examName, exam) ? 8 : 0;

  return Math.round((typeScore + trustScore + ratingScore + popularityScore + recencyScore + examNameScore) * 10) / 10;
}

function getDocumentTypeExamScore(documentType: DocumentType, exam: ExamWithSubject | null, preferSurvivalKit: boolean) {
  if (preferSurvivalKit && documentType === "survival_kit") return 34;
  if (documentType === "past_exam") return exam?.examType === "final" || exam?.examType === "midterm" ? 28 : 20;
  if (documentType === "summary_note") return 24;
  if (documentType === "exercise") return exam?.examType === "quiz" ? 24 : 18;
  if (documentType === "survival_kit") return 22;
  if (documentType === "lecture") return 14;
  if (documentType === "textbook") return 10;

  return 6;
}

function buildRecommendationReason(document: DocumentWithRelations, exam: ExamWithSubject | null, preferSurvivalKit: boolean) {
  const type = documentTypeLabels[document.documentType as DocumentType];
  const badge = document.verificationLevel === "gold" || document.verificationLevel === "silver" ? `${document.verificationLevel} badge` : "rating tot";

  if (preferSurvivalKit && document.documentType === "survival_kit") return "Survival kit uu tien cho mon dang hoc";
  if (exam && matchesExamName(document.examName, exam)) return `${type} gan voi ${examTypeLabels[exam.examType as ExamType]}`;

  return `${type} co ${badge}`;
}

function matchesExamName(documentExamName: string | null, exam: ExamWithSubject) {
  if (!documentExamName) return false;

  const source = normalizeSearchText(documentExamName);
  const examType = normalizeSearchText(exam.examType);
  const examName = normalizeSearchText(exam.name);

  return source.includes(examType) || source.includes(examName);
}

function buildNotificationSummary(enrollments: EnrollmentWithSubject[], exams: ExamWithSubject[]) {
  const enabledSubjectIds = new Set(enrollments.filter((enrollment) => enrollment.emailReminderEnabled).map((enrollment) => enrollment.subjectId));
  const nextExam = exams.find((exam) => enabledSubjectIds.has(exam.subjectId)) ?? null;
  const nextReminderAt = nextExam ? new Date(nextExam.examDate.getTime() - 3 * daysInMilliseconds).toISOString() : null;
  const enabledCount = enabledSubjectIds.size;

  return {
    enabledCount,
    nextReminderAt,
    message:
      enabledCount > 0 && nextExam
        ? `Email reminder se gui truoc ${nextExam.name} 3 ngay.`
        : "Chua co lich nhac email cho mon dang hoc."
  };
}

function mapEnrollmentItem(enrollment: EnrollmentWithSubject, now: Date): CourseEnrollmentItem {
  const upcomingExams = enrollment.subject.exams.map((exam) => ({
    ...exam,
    subject: {
      name: enrollment.subject.name,
      major: enrollment.subject.major
    }
  }));

  return {
    id: enrollment.id,
    subjectId: enrollment.subjectId,
    subjectName: enrollment.subject.name,
    majorName: enrollment.subject.major?.name ?? "Chua phan nganh",
    termLabel: enrollment.termLabel,
    emailReminderEnabled: enrollment.emailReminderEnabled,
    upcomingExamCount: upcomingExams.length,
    nextExam: upcomingExams[0] ? mapExamItem(upcomingExams[0], true, now) : null,
    createdAt: enrollment.createdAt.toISOString(),
    updatedAt: enrollment.updatedAt.toISOString()
  };
}

function mapExamItem(exam: ExamWithSubject, enrolled: boolean, now: Date): ExamItem {
  return {
    id: exam.id,
    subjectId: exam.subjectId,
    subjectName: exam.subject.name,
    majorName: exam.subject.major?.name ?? "Chua phan nganh",
    name: exam.name,
    examType: exam.examType as ExamType,
    examDate: exam.examDate.toISOString(),
    daysUntil: Math.max(0, Math.ceil((exam.examDate.getTime() - now.getTime()) / daysInMilliseconds)),
    termLabel: exam.termLabel,
    location: exam.location,
    enrolled
  };
}

function mapDocumentItem(document: DocumentWithRelations): DocumentItem {
  const documentType = document.documentType as DocumentType;

  return {
    id: document.id,
    title: document.title,
    author: document.authorName ?? document.uploader?.fullName ?? "Chua ro tac gia",
    field: document.majorId ?? "unknown",
    fieldName: document.major?.name ?? "Chua phan nganh",
    majorId: document.majorId,
    subjectId: document.subjectId,
    subject: document.subject?.name ?? "Chua gan mon",
    documentType,
    type: documentTypeLabels[documentType],
    year: document.year ?? document.createdAt.getFullYear(),
    pages: document.pages ?? 0,
    verification: document.verificationLevel as VerificationLevel,
    rating: Number(document.ratingAvg),
    reviews: document.ratingCount,
    downloads: document.downloadCount,
    views: document.viewCount,
    institution: document.institution?.name ?? "Chua ro don vi",
    description: document.description ?? "Tai lieu chua co mo ta.",
    size: formatFileSize(document.fileSize),
    format: formatMimeType(document.mimeType, document.fileUrl),
    tags: buildDocumentTags(document),
    instructorName: document.instructorName,
    termLabel: document.termLabel,
    examName: document.examName,
    verificationStatus: document.verificationStatus,
    fileUrl: document.fileUrl,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

function buildDocumentTags(document: DocumentWithRelations) {
  return [...readStoredTags(document.tags), document.subject?.name, document.major?.name, document.year ? String(document.year) : null]
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 4);
}

function readStoredTags(value: Prisma.JsonValue | null) {
  if (!Array.isArray(value)) return [];

  return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
}

function formatFileSize(fileSize: number | null) {
  if (!fileSize || fileSize <= 0) return "Chua ro";

  const megabytes = fileSize / (1024 * 1024);

  if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`;

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
}

function formatMimeType(mimeType: string | null, fileUrl: string | null) {
  if (mimeType?.includes("pdf")) return "PDF";
  if (mimeType?.includes("word")) return "DOCX";
  if (mimeType?.includes("presentation")) return "PPTX";

  const extension = fileUrl?.split(".").pop();

  return extension ? extension.toUpperCase() : "Tep";
}

function parseEnrollmentBody(body: unknown) {
  const source = readBodyObject(body);
  const subjectId = readString(source.subjectId);
  const termLabel = readNullableString(source.termLabel);
  const emailReminderEnabled = typeof source.emailReminderEnabled === "boolean" ? source.emailReminderEnabled : true;

  if (subjectId.length < 3) return null;

  return {
    subjectId,
    termLabel,
    emailReminderEnabled
  };
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function readBodyObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown) {
  const text = readString(value);

  return text.length > 0 ? text : null;
}

function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

export { router as personalizationRouter };
