import type {
  DocumentDetailResponse,
  DocumentFacets,
  DocumentItem,
  DocumentListResponse,
  DocumentSort,
  DocumentType,
  DocumentTypeFilterOption,
  FilterOption,
  UploadDocumentResponse,
  UploadOptionsResponse,
  VerificationLevel
} from "@itss/shared";
import { Prisma } from "@prisma/client";
import { Router, type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();
const uploadsDirectory = fileURLToPath(new URL("../../uploads/documents", import.meta.url));
const maxUploadFileSize = 25 * 1024 * 1024;

const documentTypeValues = [
  "textbook",
  "lecture",
  "past_exam",
  "summary_note",
  "exercise",
  "survival_kit",
  "other"
] as const satisfies readonly DocumentType[];

const verificationLevelValues = ["unverified", "bronze", "silver", "gold"] as const satisfies readonly VerificationLevel[];
const sortValues = ["relevance", "newest", "popular", "rating"] as const satisfies readonly DocumentSort[];
const uploadAllowedRoles = ["student", "reviewer", "admin"] as const;
const allowedFileExtensions = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain"
]);

const documentUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => {
      mkdir(uploadsDirectory, { recursive: true })
        .then(() => callback(null, uploadsDirectory))
        .catch((error: unknown) => callback(error as Error, uploadsDirectory));
    },
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    }
  }),
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const hasAllowedExtension = allowedFileExtensions.has(extension);
    const hasAllowedMimeType = allowedMimeTypes.has(file.mimetype);

    if (hasAllowedExtension && (hasAllowedMimeType || file.mimetype === "application/octet-stream")) {
      callback(null, true);
      return;
    }

    callback(new Error("Chỉ hỗ trợ PDF, DOC/DOCX, PPT/PPTX hoặc TXT."));
  },
  limits: {
    fileSize: maxUploadFileSize,
    files: 1
  }
});

const documentTypeLabels: Record<DocumentType, string> = {
  textbook: "Giáo trình",
  lecture: "Bài giảng",
  past_exam: "Đề thi cũ",
  summary_note: "Note tóm tắt",
  exercise: "Bài tập",
  survival_kit: "Survival kit",
  other: "Tài liệu khác"
};

const verificationWeight: Record<VerificationLevel, number> = {
  gold: 1,
  silver: 0.75,
  bronze: 0.45,
  unverified: 0.1
};

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

type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: typeof documentInclude;
}>;

type ListDocumentsQuery = {
  q: string;
  majorId: string | null;
  subjectId: string | null;
  types: DocumentType[];
  verificationLevels: VerificationLevel[];
  year: number | null;
  sort: DocumentSort;
  page: number;
  limit: number;
};

type UploadDocumentBody = {
  title: string;
  description: string;
  authorName: string | null;
  majorId: string;
  subjectId: string;
  instructorName: string | null;
  documentType: DocumentType;
  termLabel: string;
  year: number;
  examName: string | null;
  pages: number | null;
  tags: string[];
};

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const query = parseListDocumentsQuery(request.query);
    const where = buildDocumentWhere(query);

    const [documents, facets] = await Promise.all([
      prisma.document.findMany({
        where,
        include: documentInclude
      }),
      getDocumentFacets()
    ]);

    const sortedDocuments = sortDocuments(documents, query);
    const total = sortedDocuments.length;
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.limit;
    const items = sortedDocuments.slice(start, start + query.limit).map(mapDocumentItem);

    const payload: DocumentListResponse = {
      items,
      pagination: {
        page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      facets
    };

    response.status(200).json(payload);
  })
);

router.get(
  "/filters",
  asyncHandler(async (_request, response) => {
    response.status(200).json(await getDocumentFacets());
  })
);

router.get(
  "/upload-options",
  asyncHandler(async (_request, response) => {
    response.status(200).json(await getUploadOptions());
  })
);

router.post(
  "/",
  authenticate,
  requireRole([...uploadAllowedRoles]),
  uploadDocumentFile,
  asyncHandler(async (request, response) => {
    const file = request.file;
    const payload = parseUploadDocumentBody(request.body);

    if (!file) {
      response.status(400).json({ message: "Vui lòng chọn file tài liệu." });
      return;
    }

    if (!payload) {
      await removeUploadedFile(file.path);
      response.status(400).json({ message: "Vui lòng nhập đầy đủ metadata bắt buộc cho tài liệu." });
      return;
    }

    const [major, subject] = await Promise.all([
      prisma.major.findUnique({
        where: {
          id: payload.majorId
        },
        select: {
          id: true,
          institutionId: true
        }
      }),
      prisma.subject.findFirst({
        where: {
          id: payload.subjectId,
          majorId: payload.majorId
        },
        select: {
          id: true
        }
      })
    ]);

    if (!major || !subject) {
      await removeUploadedFile(file.path);
      response.status(400).json({ message: "Ngành học hoặc môn học không hợp lệ." });
      return;
    }

    const user = (request as AuthenticatedRequest).currentUser;
    const document = await createUploadedDocumentOrCleanup(file, {
      title: payload.title,
      description: payload.description,
      authorName: payload.authorName ?? user.fullName,
      uploaderId: user.id,
      institutionId: user.institutionId ?? major.institutionId,
      majorId: payload.majorId,
      subjectId: payload.subjectId,
      instructorName: payload.instructorName,
      termLabel: payload.termLabel,
      examName: payload.examName,
      tags: payload.tags,
      documentType: payload.documentType,
      year: payload.year,
      pages: payload.pages,
      language: "vi",
      fileUrl: `/uploads/documents/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      verificationLevel: "unverified",
      verificationStatus: "pending",
      visibility: "public"
    });
    const result: UploadDocumentResponse = {
      document: mapDocumentItem(document)
    };

    response.status(201).json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const documentId = String(request.params.id ?? "");
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        visibility: "public",
        verificationStatus: {
          not: "rejected"
        }
      },
      include: documentInclude
    });

    if (!document) {
      response.status(404).json({ message: "Không tìm thấy tài liệu." });
      return;
    }

    const payload: DocumentDetailResponse = {
      document: mapDocumentItem(document)
    };

    response.status(200).json(payload);
  })
);

function buildDocumentWhere(query: ListDocumentsQuery): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = {
    visibility: "public",
    verificationStatus: {
      not: "rejected"
    }
  };

  if (query.q) {
    where.OR = [
      { title: { contains: query.q } },
      { description: { contains: query.q } },
      { authorName: { contains: query.q } },
      { institution: { name: { contains: query.q } } },
      { major: { name: { contains: query.q } } },
      { subject: { name: { contains: query.q } } }
    ];
  }

  if (query.majorId) {
    where.majorId = query.majorId;
  }

  if (query.subjectId) {
    where.subjectId = query.subjectId;
  }

  if (query.types.length > 0) {
    where.documentType = {
      in: query.types
    };
  }

  if (query.verificationLevels.length > 0) {
    where.verificationLevel = {
      in: query.verificationLevels
    };
  }

  if (query.year) {
    where.year = query.year;
  }

  return where;
}

async function getDocumentFacets(): Promise<DocumentFacets> {
  const documents = await prisma.document.findMany({
    where: {
      visibility: "public",
      verificationStatus: {
        not: "rejected"
      }
    },
    include: {
      major: true,
      subject: true
    }
  });

  const majors = new Map<string, FilterOption>();
  const subjectsByMajor = new Map<string, Map<string, FilterOption>>();
  const documentTypeCounts = new Map<DocumentType, number>();
  const years = new Map<string, FilterOption>();

  for (const document of documents) {
    if (document.major) {
      const currentMajor = majors.get(document.major.id);
      majors.set(document.major.id, {
        id: document.major.id,
        name: document.major.name,
        count: (currentMajor?.count ?? 0) + 1
      });
    }

    if (document.major && document.subject) {
      const subjects = subjectsByMajor.get(document.major.id) ?? new Map<string, FilterOption>();
      const currentSubject = subjects.get(document.subject.id);
      subjects.set(document.subject.id, {
        id: document.subject.id,
        name: document.subject.name,
        count: (currentSubject?.count ?? 0) + 1
      });
      subjectsByMajor.set(document.major.id, subjects);
    }

    const documentType = document.documentType as DocumentType;
    documentTypeCounts.set(documentType, (documentTypeCounts.get(documentType) ?? 0) + 1);

    if (document.year) {
      const year = String(document.year);
      const currentYear = years.get(year);
      years.set(year, {
        id: year,
        name: year,
        count: (currentYear?.count ?? 0) + 1
      });
    }
  }

  const sortedMajors = Array.from(majors.values()).sort(sortFilterOptions);
  const sortedSubjectsByMajor = Object.fromEntries(
    Array.from(subjectsByMajor.entries()).map(([majorId, subjects]) => [
      majorId,
      Array.from(subjects.values()).sort(sortFilterOptions)
    ])
  );
  const documentTypes: DocumentTypeFilterOption[] = documentTypeValues
    .map((documentType) => ({
      id: documentType,
      name: documentTypeLabels[documentType],
      count: documentTypeCounts.get(documentType) ?? 0
    }))
    .filter((documentType) => documentType.count > 0);

  return {
    majors: sortedMajors,
    subjectsByMajor: sortedSubjectsByMajor,
    documentTypes,
    years: Array.from(years.values()).sort((a, b) => Number(b.id) - Number(a.id))
  };
}

async function getUploadOptions(): Promise<UploadOptionsResponse> {
  const [majors, subjects] = await Promise.all([
    prisma.major.findMany({
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.subject.findMany({
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        majorId: true
      }
    })
  ]);

  const subjectsByMajor = new Map<string, FilterOption[]>();

  for (const subject of subjects) {
    if (!subject.majorId) continue;

    const currentSubjects = subjectsByMajor.get(subject.majorId) ?? [];
    currentSubjects.push({
      id: subject.id,
      name: subject.name,
      count: 0
    });
    subjectsByMajor.set(subject.majorId, currentSubjects);
  }

  const currentYear = new Date().getFullYear();

  return {
    majors: majors.map((major) => ({
      id: major.id,
      name: major.name,
      count: 0
    })),
    subjectsByMajor: Object.fromEntries(subjectsByMajor.entries()),
    documentTypes: documentTypeValues.map((documentType) => ({
      id: documentType,
      name: documentTypeLabels[documentType],
      count: 0
    })),
    years: Array.from({ length: 7 }, (_value, index) => currentYear + 1 - index).map((year) => ({
      id: String(year),
      name: String(year),
      count: 0
    }))
  };
}

function parseListDocumentsQuery(query: Request["query"]): ListDocumentsQuery {
  return {
    q: readString(query.q),
    majorId: readNullableString(query.majorId),
    subjectId: readNullableString(query.subjectId),
    types: parseEnumList(query.type, documentTypeValues),
    verificationLevels: parseEnumList(query.verificationLevel, verificationLevelValues),
    year: readPositiveInteger(query.year, null, 1900, 2200),
    sort: parseEnumValue(query.sort, sortValues, "relevance"),
    page: readPositiveInteger(query.page, 1, 1, 10000),
    limit: readPositiveInteger(query.limit, 10, 1, 50)
  };
}

function parseUploadDocumentBody(body: Request["body"]): UploadDocumentBody | null {
  const title = readString(body.title);
  const description = readString(body.description);
  const authorName = readNullableString(body.authorName);
  const majorId = readNullableString(body.majorId);
  const subjectId = readNullableString(body.subjectId);
  const instructorName = readNullableString(body.instructorName);
  const documentType = parseOptionalEnumValue(body.documentType, documentTypeValues);
  const termLabel = readString(body.termLabel);
  const year = readPositiveInteger(body.year, null, 1900, 2200);
  const examName = readNullableString(body.examName);
  const pages = readPositiveInteger(body.pages, null, 1, 10000);
  const tags = parseUploadTags(body.tags);

  if (
    title.length < 3 ||
    description.length < 10 ||
    !majorId ||
    !subjectId ||
    !documentType ||
    termLabel.length < 2 ||
    !year ||
    tags.length === 0
  ) {
    return null;
  }

  return {
    title,
    description,
    authorName,
    majorId,
    subjectId,
    instructorName,
    documentType,
    termLabel,
    year,
    examName,
    pages,
    tags
  };
}

async function createUploadedDocumentOrCleanup(file: Express.Multer.File, data: Prisma.DocumentUncheckedCreateInput) {
  try {
    return await prisma.document.create({
      data,
      include: documentInclude
    });
  } catch (error) {
    await removeUploadedFile(file.path);
    throw error;
  }
}

function sortDocuments(documents: DocumentWithRelations[], query: ListDocumentsQuery): DocumentWithRelations[] {
  const sortedDocuments = [...documents];

  if (query.sort === "newest") {
    return sortedDocuments.sort((a, b) => compareDateDesc(a.createdAt, b.createdAt) || compareNumberDesc(a.year, b.year));
  }

  if (query.sort === "popular") {
    return sortedDocuments.sort(
      (a, b) =>
        compareNumberDesc(a.downloadCount, b.downloadCount) ||
        compareNumberDesc(a.viewCount, b.viewCount) ||
        compareRelevance(b, a, query)
    );
  }

  if (query.sort === "rating") {
    return sortedDocuments.sort(
      (a, b) =>
        compareNumberDesc(Number(a.ratingAvg), Number(b.ratingAvg)) ||
        compareNumberDesc(a.ratingCount, b.ratingCount) ||
        compareRelevance(b, a, query)
    );
  }

  return sortedDocuments.sort((a, b) => compareRelevance(b, a, query));
}

function compareRelevance(a: DocumentWithRelations, b: DocumentWithRelations, query: ListDocumentsQuery) {
  return relevanceScore(a, query) - relevanceScore(b, query);
}

function relevanceScore(document: DocumentWithRelations, query: ListDocumentsQuery) {
  const textScore = getTextMatchScore(document, query.q);
  const subjectScore = getSubjectMatchScore(document, query);
  const trustScore = verificationWeight[document.verificationLevel as VerificationLevel] ?? 0;
  const ratingScore = Math.min(Number(document.ratingAvg) / 5, 1);
  const popularityScore = Math.min(Math.log10(document.viewCount + document.downloadCount * 2 + 1) / 5, 1);
  const recencyScore = getRecencyScore(document);

  return textScore * 0.35 + subjectScore * 0.2 + trustScore * 0.2 + ratingScore * 0.1 + popularityScore * 0.1 + recencyScore * 0.05;
}

function getTextMatchScore(document: DocumentWithRelations, query: string) {
  if (!query) return 1;

  const normalizedQuery = normalizeSearchText(query);
  const weightedFields: Array<[string | null | undefined, number]> = [
    [document.title, 1],
    [document.subject?.name, 0.75],
    [document.major?.name, 0.65],
    [document.authorName, 0.5],
    [document.institution?.name, 0.45],
    [document.description, 0.35]
  ];

  return weightedFields.reduce((score, [value, weight]) => {
    const normalizedValue = normalizeSearchText(value ?? "");

    if (!normalizedValue) return score;
    if (normalizedValue === normalizedQuery) return score + weight;
    if (normalizedValue.includes(normalizedQuery)) return score + weight * 0.85;

    const matchedTokens = normalizedQuery
      .split(" ")
      .filter(Boolean)
      .filter((token) => normalizedValue.includes(token));

    return score + (matchedTokens.length / Math.max(1, normalizedQuery.split(" ").filter(Boolean).length)) * weight * 0.45;
  }, 0);
}

function getSubjectMatchScore(document: DocumentWithRelations, query: ListDocumentsQuery) {
  if (query.subjectId) return document.subjectId === query.subjectId ? 1 : 0;
  if (query.majorId) return document.majorId === query.majorId ? 0.7 : 0;
  return document.subjectId ? 0.6 : document.majorId ? 0.45 : 0.25;
}

function getRecencyScore(document: DocumentWithRelations) {
  const ageInDays = Math.max(1, (Date.now() - document.updatedAt.getTime()) / (1000 * 60 * 60 * 24));

  return Math.min(1, 365 / ageInDays);
}

function mapDocumentItem(document: DocumentWithRelations): DocumentItem {
  const documentType = document.documentType as DocumentType;
  const verification = document.verificationLevel as VerificationLevel;

  return {
    id: document.id,
    title: document.title,
    author: document.authorName ?? document.uploader?.fullName ?? "Chưa rõ tác giả",
    field: document.majorId ?? "unknown",
    fieldName: document.major?.name ?? "Chưa phân ngành",
    majorId: document.majorId,
    subjectId: document.subjectId,
    subject: document.subject?.name ?? "Chưa gán môn",
    documentType,
    type: documentTypeLabels[documentType],
    year: document.year ?? document.createdAt.getFullYear(),
    pages: document.pages ?? 0,
    verification,
    rating: Number(document.ratingAvg),
    reviews: document.ratingCount,
    downloads: document.downloadCount,
    views: document.viewCount,
    institution: document.institution?.name ?? "Chưa rõ đơn vị",
    description: document.description ?? "Tài liệu chưa có mô tả.",
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
  if (!fileSize || fileSize <= 0) return "Chưa rõ";

  const megabytes = fileSize / (1024 * 1024);

  if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`;

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
}

function formatMimeType(mimeType: string | null, fileUrl: string | null) {
  if (mimeType?.includes("pdf")) return "PDF";
  if (mimeType?.includes("word")) return "DOCX";
  if (mimeType?.includes("presentation")) return "PPTX";

  const extension = fileUrl?.split(".").pop();

  return extension ? extension.toUpperCase() : "Tệp";
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown) {
  const text = readString(value);

  return text.length > 0 && text !== "all" ? text : null;
}

function parseEnumList<const T extends readonly string[]>(value: unknown, allowedValues: T): T[number][] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const allowedSet = new Set<string>(allowedValues);

  return values.map((item) => String(item).trim()).filter((item): item is T[number] => allowedSet.has(item));
}

function parseEnumValue<const T extends readonly string[]>(value: unknown, allowedValues: T, fallback: T[number]): T[number] {
  const text = readString(value);

  return allowedValues.includes(text as T[number]) ? (text as T[number]) : fallback;
}

function parseOptionalEnumValue<const T extends readonly string[]>(value: unknown, allowedValues: T): T[number] | null {
  const text = readString(value);

  return allowedValues.includes(text as T[number]) ? (text as T[number]) : null;
}

function readPositiveInteger(value: unknown, fallback: number, min: number, max: number): number;
function readPositiveInteger(value: unknown, fallback: null, min: number, max: number): number | null;
function readPositiveInteger(value: unknown, fallback: number | null, min: number, max: number) {
  const text = readString(value);
  const parsedValue = Number.parseInt(text, 10);

  if (!Number.isFinite(parsedValue)) return fallback;

  return Math.min(Math.max(parsedValue, min), max);
}

function parseUploadTags(value: unknown) {
  const rawTags = Array.isArray(value) ? value.flatMap(parseTagInput) : parseTagInput(value);
  const tags: string[] = [];
  const seenTags = new Set<string>();

  for (const rawTag of rawTags) {
    const tag = rawTag.replace(/^#/, "").trim();
    const key = normalizeSearchText(tag);

    if (!tag || tag.length > 32 || seenTags.has(key)) continue;

    tags.push(tag);
    seenTags.add(key);

    if (tags.length >= 10) break;
  }

  return tags;
}

function parseTagInput(value: unknown): string[] {
  if (typeof value !== "string") return [];

  const text = value.trim();

  if (!text) return [];

  if (text.startsWith("[")) {
    try {
      const parsedValue = JSON.parse(text);

      if (Array.isArray(parsedValue)) {
        return parsedValue.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return [];
    }
  }

  return text.split(/[,;\n]/).map((tag) => tag.trim());
}

function uploadDocumentFile(request: Request, response: Response, next: NextFunction) {
  documentUpload.single("file")(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      response.status(400).json({ message: "File upload không được vượt quá 25 MB." });
      return;
    }

    const message = error instanceof Error ? error.message : "Không thể upload file.";
    response.status(400).json({ message });
  });
}

async function removeUploadedFile(filePath: string) {
  await unlink(filePath).catch(() => undefined);
}

function sortFilterOptions(a: FilterOption, b: FilterOption) {
  return b.count - a.count || a.name.localeCompare(b.name, "vi");
}

function compareNumberDesc(a: number | null, b: number | null) {
  return (b ?? 0) - (a ?? 0);
}

function compareDateDesc(a: Date, b: Date) {
  return b.getTime() - a.getTime();
}

function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

export { router as documentsRouter };
