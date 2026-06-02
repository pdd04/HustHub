import type {
  AdminAuditLogItem,
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
  DocumentVisibility,
  ExamType,
  ReportStatus,
  UserRole,
  UserStatus
} from "@itss/shared";
import { Prisma } from "@prisma/client";
import { Router, type NextFunction, type Request, type Response } from "express";
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();
const adminRoles = ["admin"] as const satisfies readonly UserRole[];
const examTypeValues = ["midterm", "final", "quiz"] as const satisfies readonly ExamType[];
const reportStatusValues = ["open", "resolved", "dismissed"] as const satisfies readonly ReportStatus[];
const userRoleValues = ["student", "reviewer", "admin"] as const satisfies readonly UserRole[];
const userStatusValues = ["active", "suspended"] as const satisfies readonly UserStatus[];
const documentVisibilityValues = ["public", "private", "hidden"] as const satisfies readonly DocumentVisibility[];

type InstitutionRecord = Prisma.InstitutionGetPayload<{
  include: {
    _count: {
      select: {
        majors: true;
        users: true;
        documents: true;
      };
    };
  };
}>;

type MajorRecord = Prisma.MajorGetPayload<{
  include: {
    institution: true;
    _count: {
      select: {
        subjects: true;
        users: true;
        documents: true;
      };
    };
  };
}>;

type SubjectRecord = Prisma.SubjectGetPayload<{
  include: {
    major: true;
    _count: {
      select: {
        documents: true;
        exams: true;
      };
    };
  };
}>;

type InstructorRecord = Prisma.InstructorGetPayload<{
  include: {
    institution: true;
    major: true;
    subject: true;
  };
}>;

type ExamRecord = Prisma.ExamGetPayload<{
  include: {
    subject: {
      include: {
        major: true;
      };
    };
  };
}>;

type UserRecord = Prisma.UserGetPayload<{
  include: {
    institution: true;
    major: true;
    _count: {
      select: {
        documents: true;
        reviews: true;
        reports: true;
      };
    };
  };
}>;

type ReportRecord = Prisma.DocumentReportGetPayload<{
  include: {
    reporter: true;
    document: {
      include: {
        major: true;
        subject: true;
      };
    };
  };
}>;

type AuditLogRecord = Prisma.AuditLogGetPayload<{
  include: {
    actor: {
      select: {
        email: true;
        fullName: true;
      };
    };
  };
}>;

const institutionInclude = {
  _count: {
    select: {
      majors: true,
      users: true,
      documents: true
    }
  }
} satisfies Prisma.InstitutionInclude;

const majorInclude = {
  institution: true,
  _count: {
    select: {
      subjects: true,
      users: true,
      documents: true
    }
  }
} satisfies Prisma.MajorInclude;

const subjectInclude = {
  major: true,
  _count: {
    select: {
      documents: true,
      exams: true
    }
  }
} satisfies Prisma.SubjectInclude;

const instructorInclude = {
  institution: true,
  major: true,
  subject: true
} satisfies Prisma.InstructorInclude;

const examInclude = {
  subject: {
    include: {
      major: true
    }
  }
} satisfies Prisma.ExamInclude;

const userInclude = {
  institution: true,
  major: true,
  _count: {
    select: {
      documents: true,
      reviews: true,
      reports: true
    }
  }
} satisfies Prisma.UserInclude;

const reportInclude = {
  reporter: true,
  document: {
    include: {
      major: true,
      subject: true
    }
  }
} satisfies Prisma.DocumentReportInclude;

router.use(authenticate, requireRole([...adminRoles]));

router.get(
  "/summary",
  asyncHandler(async (_request, response) => {
    const [
      totalUsers,
      admins,
      reviewers,
      suspendedUsers,
      totalDocuments,
      pendingDocuments,
      hiddenDocuments,
      openReports,
      institutions,
      majors,
      subjects,
      instructors,
      exams
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "reviewer" } }),
      prisma.user.count({ where: { status: "suspended" } }),
      prisma.document.count(),
      prisma.document.count({ where: { verificationStatus: "pending" } }),
      prisma.document.count({ where: { visibility: "hidden" } }),
      prisma.documentReport.count({ where: { status: "open" } }),
      prisma.institution.count(),
      prisma.major.count(),
      prisma.subject.count(),
      prisma.instructor.count(),
      prisma.exam.count()
    ]);

    const payload: AdminSummaryResponse = {
      users: {
        total: totalUsers,
        admins,
        reviewers,
        suspended: suspendedUsers
      },
      documents: {
        total: totalDocuments,
        pending: pendingDocuments,
        hidden: hiddenDocuments,
        openReports
      },
      taxonomy: {
        institutions,
        majors,
        subjects,
        instructors,
        exams
      }
    };

    response.status(200).json(payload);
  })
);

router.get(
  "/taxonomy",
  asyncHandler(async (_request, response) => {
    response.status(200).json(await getAdminTaxonomy());
  })
);

router.post(
  "/institutions",
  asyncHandler(async (request, response) => {
    const payload = parseInstitutionBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Institution name is required." });
      return;
    }

    const item = await prisma.institution.create({
      data: payload,
      include: institutionInclude
    });

    await writeAudit(request, "admin.institution.create", "institution", item.id, { code: item.code, name: item.name });
    response.status(201).json({ item: mapInstitution(item) } satisfies AdminMutationResponse<AdminInstitutionItem>);
  })
);

router.patch(
  "/institutions/:id",
  asyncHandler(async (request, response) => {
    const payload = parseInstitutionBody(request.body);
    const id = readString(request.params.id);

    if (!payload) {
      response.status(400).json({ message: "Institution name is required." });
      return;
    }

    const item = await prisma.institution.update({
      where: { id },
      data: payload,
      include: institutionInclude
    });

    await writeAudit(request, "admin.institution.update", "institution", item.id, { code: item.code, name: item.name });
    response.status(200).json({ item: mapInstitution(item) } satisfies AdminMutationResponse<AdminInstitutionItem>);
  })
);

router.delete(
  "/institutions/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const existing = await prisma.institution.findUnique({ where: { id }, select: { id: true, code: true, name: true } });

    if (!existing) {
      response.status(404).json({ message: "Institution not found." });
      return;
    }

    await prisma.institution.delete({ where: { id } });
    await writeAudit(request, "admin.institution.delete", "institution", existing.id, existing);
    response.status(200).json({ deleted: true } satisfies AdminDeleteResponse);
  })
);

router.post(
  "/majors",
  asyncHandler(async (request, response) => {
    const payload = parseMajorBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Major name is required." });
      return;
    }

    const item = await prisma.major.create({
      data: payload,
      include: majorInclude
    });

    await writeAudit(request, "admin.major.create", "major", item.id, { code: item.code, name: item.name });
    response.status(201).json({ item: mapMajor(item) } satisfies AdminMutationResponse<AdminMajorItem>);
  })
);

router.patch(
  "/majors/:id",
  asyncHandler(async (request, response) => {
    const payload = parseMajorBody(request.body);
    const id = readString(request.params.id);

    if (!payload) {
      response.status(400).json({ message: "Major name is required." });
      return;
    }

    const item = await prisma.major.update({
      where: { id },
      data: payload,
      include: majorInclude
    });

    await writeAudit(request, "admin.major.update", "major", item.id, { code: item.code, name: item.name });
    response.status(200).json({ item: mapMajor(item) } satisfies AdminMutationResponse<AdminMajorItem>);
  })
);

router.delete(
  "/majors/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const existing = await prisma.major.findUnique({ where: { id }, select: { id: true, code: true, name: true } });

    if (!existing) {
      response.status(404).json({ message: "Major not found." });
      return;
    }

    await prisma.major.delete({ where: { id } });
    await writeAudit(request, "admin.major.delete", "major", existing.id, existing);
    response.status(200).json({ deleted: true } satisfies AdminDeleteResponse);
  })
);

router.post(
  "/subjects",
  asyncHandler(async (request, response) => {
    const payload = parseSubjectBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Subject name is required." });
      return;
    }

    const item = await prisma.subject.create({
      data: payload,
      include: subjectInclude
    });

    await writeAudit(request, "admin.subject.create", "subject", item.id, { code: item.code, name: item.name });
    response.status(201).json({ item: mapSubject(item) } satisfies AdminMutationResponse<AdminSubjectItem>);
  })
);

router.patch(
  "/subjects/:id",
  asyncHandler(async (request, response) => {
    const payload = parseSubjectBody(request.body);
    const id = readString(request.params.id);

    if (!payload) {
      response.status(400).json({ message: "Subject name is required." });
      return;
    }

    const item = await prisma.subject.update({
      where: { id },
      data: payload,
      include: subjectInclude
    });

    await writeAudit(request, "admin.subject.update", "subject", item.id, { code: item.code, name: item.name });
    response.status(200).json({ item: mapSubject(item) } satisfies AdminMutationResponse<AdminSubjectItem>);
  })
);

router.delete(
  "/subjects/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const existing = await prisma.subject.findUnique({ where: { id }, select: { id: true, code: true, name: true } });

    if (!existing) {
      response.status(404).json({ message: "Subject not found." });
      return;
    }

    await prisma.subject.delete({ where: { id } });
    await writeAudit(request, "admin.subject.delete", "subject", existing.id, existing);
    response.status(200).json({ deleted: true } satisfies AdminDeleteResponse);
  })
);

router.post(
  "/instructors",
  asyncHandler(async (request, response) => {
    const payload = parseInstructorBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Instructor full name is required." });
      return;
    }

    const item = await prisma.instructor.create({
      data: payload,
      include: instructorInclude
    });

    await writeAudit(request, "admin.instructor.create", "instructor", item.id, { fullName: item.fullName });
    response.status(201).json({ item: mapInstructor(item) } satisfies AdminMutationResponse<AdminInstructorItem>);
  })
);

router.patch(
  "/instructors/:id",
  asyncHandler(async (request, response) => {
    const payload = parseInstructorBody(request.body);
    const id = readString(request.params.id);

    if (!payload) {
      response.status(400).json({ message: "Instructor full name is required." });
      return;
    }

    const item = await prisma.instructor.update({
      where: { id },
      data: payload,
      include: instructorInclude
    });

    await writeAudit(request, "admin.instructor.update", "instructor", item.id, { fullName: item.fullName });
    response.status(200).json({ item: mapInstructor(item) } satisfies AdminMutationResponse<AdminInstructorItem>);
  })
);

router.delete(
  "/instructors/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const existing = await prisma.instructor.findUnique({ where: { id }, select: { id: true, fullName: true } });

    if (!existing) {
      response.status(404).json({ message: "Instructor not found." });
      return;
    }

    await prisma.instructor.delete({ where: { id } });
    await writeAudit(request, "admin.instructor.delete", "instructor", existing.id, existing);
    response.status(200).json({ deleted: true } satisfies AdminDeleteResponse);
  })
);

router.post(
  "/exams",
  asyncHandler(async (request, response) => {
    const payload = parseExamBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Exam name, subject, type and date are required." });
      return;
    }

    const item = await prisma.exam.create({
      data: payload,
      include: examInclude
    });

    await writeAudit(request, "admin.exam.create", "exam", item.id, { name: item.name, examDate: item.examDate.toISOString() });
    response.status(201).json({ item: mapExam(item) } satisfies AdminMutationResponse<AdminExamItem>);
  })
);

router.patch(
  "/exams/:id",
  asyncHandler(async (request, response) => {
    const payload = parseExamBody(request.body);
    const id = readString(request.params.id);

    if (!payload) {
      response.status(400).json({ message: "Exam name, subject, type and date are required." });
      return;
    }

    const item = await prisma.exam.update({
      where: { id },
      data: payload,
      include: examInclude
    });

    await writeAudit(request, "admin.exam.update", "exam", item.id, { name: item.name, examDate: item.examDate.toISOString() });
    response.status(200).json({ item: mapExam(item) } satisfies AdminMutationResponse<AdminExamItem>);
  })
);

router.delete(
  "/exams/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const existing = await prisma.exam.findUnique({ where: { id }, select: { id: true, name: true, examDate: true } });

    if (!existing) {
      response.status(404).json({ message: "Exam not found." });
      return;
    }

    await prisma.exam.delete({ where: { id } });
    await writeAudit(request, "admin.exam.delete", "exam", existing.id, {
      name: existing.name,
      examDate: existing.examDate.toISOString()
    });
    response.status(200).json({ deleted: true } satisfies AdminDeleteResponse);
  })
);

router.get(
  "/users",
  asyncHandler(async (request, response) => {
    const query = parseUsersQuery(request.query);
    const where = buildUsersWhere(query);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: {
          createdAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      prisma.user.count({ where })
    ]);
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const payload: AdminUsersResponse = {
      items: users.map(mapUser),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1
      }
    };

    response.status(200).json(payload);
  })
);

router.patch(
  "/users/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const payload = parseUserPatchBody(request.body);

    if (!payload || Object.keys(payload).length === 0) {
      response.status(400).json({ message: "Provide a role, status, institution or major update." });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        status: true
      }
    });

    if (!existing) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    if (await wouldRemoveLastActiveAdmin(existing, payload)) {
      response.status(400).json({ message: "At least one active admin must remain." });
      return;
    }

    const item = await prisma.user.update({
      where: { id },
      data: payload,
      include: userInclude
    });

    await writeAudit(request, "admin.user.update", "user", item.id, {
      role: item.role,
      status: item.status,
      institutionId: item.institutionId,
      majorId: item.majorId
    });
    response.status(200).json({ item: mapUser(item) } satisfies AdminMutationResponse<AdminUserItem>);
  })
);

router.get(
  "/reports",
  asyncHandler(async (request, response) => {
    const statuses = parseEnumList(request.query.status, reportStatusValues);
    const reports = await prisma.documentReport.findMany({
      where: {
        status: statuses.length > 0 ? { in: statuses } : undefined
      },
      include: reportInclude,
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });
    const payload: AdminReportsResponse = {
      items: reports.map(mapReport)
    };

    response.status(200).json(payload);
  })
);

router.patch(
  "/reports/:id",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const payload = parseReportPatchBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Report status is required." });
      return;
    }

    const existing = await prisma.documentReport.findUnique({
      where: { id },
      select: {
        id: true,
        documentId: true
      }
    });

    if (!existing) {
      response.status(404).json({ message: "Report not found." });
      return;
    }

    const report = await prisma.$transaction(async (transaction) => {
      if (payload.hideDocument) {
        await transaction.document.update({
          where: {
            id: existing.documentId
          },
          data: {
            visibility: "hidden"
          }
        });
      }

      return transaction.documentReport.update({
        where: { id },
        data: {
          status: payload.status
        },
        include: reportInclude
      });
    });

    await writeAudit(request, "admin.report.update", "document_report", report.id, {
      status: report.status,
      hideDocument: payload.hideDocument,
      documentId: report.documentId
    });
    response.status(200).json({ item: mapReport(report) } satisfies AdminMutationResponse<AdminReportItem>);
  })
);

router.patch(
  "/documents/:id/visibility",
  asyncHandler(async (request, response) => {
    const id = readString(request.params.id);
    const visibility = parseOptionalEnumValue(readBodyObject(request.body).visibility, documentVisibilityValues);

    if (!visibility) {
      response.status(400).json({ message: "Document visibility is required." });
      return;
    }

    const document = await prisma.document.update({
      where: { id },
      data: { visibility },
      select: {
        id: true,
        title: true,
        visibility: true
      }
    });

    await writeAudit(request, "admin.document.visibility", "document", document.id, {
      title: document.title,
      visibility: document.visibility
    });
    response.status(200).json({ item: document });
  })
);

router.get(
  "/audit-logs",
  asyncHandler(async (request, response) => {
    const limit = readPositiveInteger(request.query.limit, 50, 1, 100);
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            email: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
    const payload: AdminAuditLogsResponse = {
      items: logs.map(mapAuditLog)
    };

    response.status(200).json(payload);
  })
);

async function getAdminTaxonomy(): Promise<AdminTaxonomyResponse> {
  const [institutions, majors, subjects, instructors, exams] = await Promise.all([
    prisma.institution.findMany({
      include: institutionInclude,
      orderBy: {
        name: "asc"
      }
    }),
    prisma.major.findMany({
      include: majorInclude,
      orderBy: {
        name: "asc"
      }
    }),
    prisma.subject.findMany({
      include: subjectInclude,
      orderBy: {
        name: "asc"
      }
    }),
    prisma.instructor.findMany({
      include: instructorInclude,
      orderBy: {
        fullName: "asc"
      }
    }),
    prisma.exam.findMany({
      include: examInclude,
      orderBy: {
        examDate: "asc"
      }
    })
  ]);

  return {
    institutions: institutions.map(mapInstitution),
    majors: majors.map(mapMajor),
    subjects: subjects.map(mapSubject),
    instructors: instructors.map(mapInstructor),
    exams: exams.map(mapExam)
  };
}

function parseInstitutionBody(body: unknown) {
  const source = readBodyObject(body);
  const name = readString(source.name);

  if (name.length < 2) return null;

  return {
    name,
    code: readNullableString(source.code)?.toUpperCase() ?? null,
    description: readNullableString(source.description)
  };
}

function parseMajorBody(body: unknown) {
  const source = readBodyObject(body);
  const name = readString(source.name);

  if (name.length < 2) return null;

  return {
    institutionId: readNullableString(source.institutionId),
    code: readNullableString(source.code)?.toUpperCase() ?? null,
    name,
    description: readNullableString(source.description)
  };
}

function parseSubjectBody(body: unknown) {
  const source = readBodyObject(body);
  const name = readString(source.name);

  if (name.length < 2) return null;

  return {
    majorId: readNullableString(source.majorId),
    code: readNullableString(source.code)?.toUpperCase() ?? null,
    name,
    description: readNullableString(source.description)
  };
}

function parseInstructorBody(body: unknown) {
  const source = readBodyObject(body);
  const fullName = readString(source.fullName);
  const email = readNullableString(source.email);

  if (fullName.length < 2) return null;
  if (email && !isEmail(email)) return null;

  return {
    institutionId: readNullableString(source.institutionId),
    majorId: readNullableString(source.majorId),
    subjectId: readNullableString(source.subjectId),
    fullName,
    title: readNullableString(source.title),
    email,
    bio: readNullableString(source.bio)
  };
}

function parseExamBody(body: unknown) {
  const source = readBodyObject(body);
  const subjectId = readString(source.subjectId);
  const name = readString(source.name);
  const examType = parseOptionalEnumValue(source.examType, examTypeValues);
  const examDate = readDate(source.examDate);

  if (subjectId.length < 3 || name.length < 2 || !examType || !examDate) return null;

  return {
    subjectId,
    name,
    examType,
    examDate,
    termLabel: readNullableString(source.termLabel),
    location: readNullableString(source.location)
  };
}

function parseUsersQuery(query: Request["query"]) {
  return {
    q: readString(query.q),
    role: parseOptionalEnumValue(query.role, userRoleValues),
    status: parseOptionalEnumValue(query.status, userStatusValues),
    page: readPositiveInteger(query.page, 1, 1, 10000),
    limit: readPositiveInteger(query.limit, 20, 1, 100)
  };
}

function buildUsersWhere(query: ReturnType<typeof parseUsersQuery>): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.q) {
    where.OR = [
      { email: { contains: query.q } },
      { fullName: { contains: query.q } },
      { studentCode: { contains: query.q } }
    ];
  }

  return where;
}

function parseUserPatchBody(body: unknown): Prisma.UserUncheckedUpdateInput | null {
  const source = readBodyObject(body);
  const payload: Prisma.UserUncheckedUpdateInput = {};

  if ("role" in source) {
    const role = parseOptionalEnumValue(source.role, userRoleValues);

    if (!role) return null;

    payload.role = role;
  }

  if ("status" in source) {
    const status = parseOptionalEnumValue(source.status, userStatusValues);

    if (!status) return null;

    payload.status = status;
  }

  if ("institutionId" in source) {
    payload.institutionId = readNullableString(source.institutionId);
  }

  if ("majorId" in source) {
    payload.majorId = readNullableString(source.majorId);
  }

  return payload;
}

function parseReportPatchBody(body: unknown) {
  const source = readBodyObject(body);
  const status = parseOptionalEnumValue(source.status, reportStatusValues);

  if (!status) return null;

  return {
    status,
    hideDocument: source.hideDocument === true
  };
}

async function wouldRemoveLastActiveAdmin(
  existingUser: {
    id: string;
    role: string;
    status: string;
  },
  payload: Prisma.UserUncheckedUpdateInput
) {
  const nextRole = (payload.role ?? existingUser.role) as UserRole;
  const nextStatus = (payload.status ?? existingUser.status) as UserStatus;

  if (existingUser.role !== "admin" || existingUser.status !== "active") return false;
  if (nextRole === "admin" && nextStatus === "active") return false;

  const activeAdminCount = await prisma.user.count({
    where: {
      role: "admin",
      status: "active"
    }
  });

  return activeAdminCount <= 1;
}

function mapInstitution(institution: InstitutionRecord): AdminInstitutionItem {
  return {
    id: institution.id,
    code: institution.code,
    name: institution.name,
    description: institution.description,
    majorCount: institution._count.majors,
    userCount: institution._count.users,
    documentCount: institution._count.documents,
    createdAt: institution.createdAt.toISOString(),
    updatedAt: institution.updatedAt.toISOString()
  };
}

function mapMajor(major: MajorRecord): AdminMajorItem {
  return {
    id: major.id,
    institutionId: major.institutionId,
    institutionName: major.institution?.name ?? null,
    code: major.code,
    name: major.name,
    description: major.description,
    subjectCount: major._count.subjects,
    userCount: major._count.users,
    documentCount: major._count.documents,
    createdAt: major.createdAt.toISOString(),
    updatedAt: major.updatedAt.toISOString()
  };
}

function mapSubject(subject: SubjectRecord): AdminSubjectItem {
  return {
    id: subject.id,
    majorId: subject.majorId,
    majorName: subject.major?.name ?? null,
    code: subject.code,
    name: subject.name,
    description: subject.description,
    documentCount: subject._count.documents,
    examCount: subject._count.exams,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString()
  };
}

function mapInstructor(instructor: InstructorRecord): AdminInstructorItem {
  return {
    id: instructor.id,
    institutionId: instructor.institutionId,
    institutionName: instructor.institution?.name ?? null,
    majorId: instructor.majorId,
    majorName: instructor.major?.name ?? null,
    subjectId: instructor.subjectId,
    subjectName: instructor.subject?.name ?? null,
    fullName: instructor.fullName,
    title: instructor.title,
    email: instructor.email,
    bio: instructor.bio,
    createdAt: instructor.createdAt.toISOString(),
    updatedAt: instructor.updatedAt.toISOString()
  };
}

function mapExam(exam: ExamRecord): AdminExamItem {
  return {
    id: exam.id,
    subjectId: exam.subjectId,
    subjectName: exam.subject.name,
    majorName: exam.subject.major?.name ?? null,
    name: exam.name,
    examType: exam.examType as ExamType,
    examDate: exam.examDate.toISOString(),
    termLabel: exam.termLabel,
    location: exam.location,
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString()
  };
}

function mapUser(user: UserRecord): AdminUserItem {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    studentCode: user.studentCode,
    institutionId: user.institutionId,
    institutionName: user.institution?.name ?? null,
    majorId: user.majorId,
    majorName: user.major?.name ?? null,
    role: user.role as UserRole,
    status: user.status as UserStatus,
    documentCount: user._count.documents,
    reviewCount: user._count.reviews,
    reportCount: user._count.reports,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

function mapReport(report: ReportRecord): AdminReportItem {
  return {
    id: report.id,
    reason: report.reason,
    detail: report.detail,
    status: report.status,
    reporterName: report.reporter.fullName,
    reporterEmail: report.reporter.email,
    document: {
      id: report.document.id,
      title: report.document.title,
      verificationStatus: report.document.verificationStatus,
      verification: report.document.verificationLevel,
      visibility: report.document.visibility as DocumentVisibility,
      subject: report.document.subject?.name ?? "Unassigned subject",
      fieldName: report.document.major?.name ?? "Unassigned major"
    },
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  };
}

function mapAuditLog(log: AuditLogRecord): AdminAuditLogItem {
  return {
    id: log.id,
    actorId: log.actorId,
    actorName: log.actor?.fullName ?? null,
    actorEmail: log.actor?.email ?? null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString()
  };
}

async function writeAudit(
  request: Request,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown>
) {
  const user = (request as AuthenticatedRequest).currentUser;

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action,
      entityType,
      entityId,
      metadata: toJson(metadata),
      ipAddress: request.ip || request.socket.remoteAddress || null,
      userAgent: request.header("user-agent") ?? null
    }
  });
}

function toJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readBodyObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown) {
  const text = readString(value);

  return text.length > 0 && text !== "all" ? text : null;
}

function readDate(value: unknown) {
  const text = readString(value);
  const date = new Date(text);

  return text && Number.isFinite(date.getTime()) ? date : null;
}

function parseEnumList<const T extends readonly string[]>(value: unknown, allowedValues: T): T[number][] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const allowedSet = new Set<string>(allowedValues);

  return values.map((item) => String(item).trim()).filter((item): item is T[number] => allowedSet.has(item));
}

function parseOptionalEnumValue<const T extends readonly string[]>(value: unknown, allowedValues: T): T[number] | null {
  const text = readString(value);

  return allowedValues.includes(text as T[number]) ? (text as T[number]) : null;
}

function readPositiveInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsedValue = Number.parseInt(readString(value), 10);

  if (!Number.isFinite(parsedValue)) return fallback;

  return Math.min(Math.max(parsedValue, min), max);
}

function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

export { router as adminRouter };
