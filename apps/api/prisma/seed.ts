import "dotenv/config";
import { PrismaClient, type DocumentType, type ExamType, type VerificationLevel, type VerificationStatus } from "@prisma/client";
import { hashPassword } from "../src/auth/password.js";

const prisma = new PrismaClient();

type DemoMajor = {
  code: string;
  name: string;
};

type DemoSubject = {
  code: string;
  majorCode: string;
  name: string;
};

type DemoDocument = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  uploaderEmail?: string;
  institutionCode: string;
  majorCode: string;
  subjectCode: string;
  documentType: DocumentType;
  year: number;
  pages: number;
  fileSize: number;
  termLabel?: string;
  instructorName?: string;
  examName?: string;
  tags?: string[];
  verificationLevel: VerificationLevel;
  verificationStatus: VerificationStatus;
  ratingAvg: string;
  ratingCount: number;
  viewCount: number;
  downloadCount: number;
};

type DemoExam = {
  id: string;
  subjectCode: string;
  name: string;
  examType: ExamType;
  examDate: Date;
  termLabel: string;
  location: string;
};

type DemoInstructor = {
  fullName: string;
  title: string;
  email: string;
  institutionCode: string;
  majorCode: string;
  subjectCode: string;
};

const demoInstitutionCode = "VERITAS-DEMO";
const demoPassword = "Password123";

const demoUsers = [
  {
    email: "student@veritas.local",
    fullName: "Demo Student",
    studentCode: "SV-DEMO-001",
    role: "student" as const
  },
  {
    email: "reviewer@veritas.local",
    fullName: "Demo Reviewer",
    studentCode: "RV-DEMO-001",
    role: "reviewer" as const
  },
  {
    email: "admin@veritas.local",
    fullName: "Academic Admin",
    studentCode: "AD-DEMO-001",
    role: "admin" as const
  }
];

const institutions = [
  { code: demoInstitutionCode, name: "Veritas Demo Academic Network" },
  { code: "HUST", name: "ĐH Bách Khoa Hà Nội" },
  { code: "NEU", name: "ĐH Kinh tế Quốc dân" },
  { code: "VNU", name: "ĐH Quốc gia Hà Nội" },
  { code: "HMU", name: "ĐH Y Hà Nội" },
  { code: "HLU", name: "ĐH Luật Hà Nội" },
  { code: "NUCE", name: "ĐH Xây dựng Hà Nội" }
];

const majors: DemoMajor[] = [
  { code: "CNTT", name: "Công nghệ thông tin" },
  { code: "KT", name: "Kinh tế" },
  { code: "YK", name: "Y khoa" },
  { code: "LU", name: "Luật" },
  { code: "KTXD", name: "Kỹ thuật và Xây dựng" },
  { code: "TN", name: "Khoa học tự nhiên" }
];

const subjects: DemoSubject[] = [
  { code: "ALG", majorCode: "CNTT", name: "Giải thuật" },
  { code: "DB", majorCode: "CNTT", name: "Cơ sở dữ liệu" },
  { code: "ML", majorCode: "CNTT", name: "Học máy" },
  { code: "MACRO", majorCode: "KT", name: "Kinh tế vĩ mô" },
  { code: "MKT", majorCode: "KT", name: "Marketing" },
  { code: "ANAT", majorCode: "YK", name: "Giải phẫu" },
  { code: "CIVIL", majorCode: "LU", name: "Luật Dân sự" },
  { code: "SOM", majorCode: "KTXD", name: "Sức bền vật liệu" },
  { code: "STAT", majorCode: "TN", name: "Xác suất thống kê" }
];

const documents: DemoDocument[] = [
  {
    id: "doc-algorithms-data-structures",
    title: "Giáo trình Giải thuật và Cấu trúc dữ liệu",
    description:
      "Giáo trình chính thức bao gồm thuật toán cơ bản, cấu trúc dữ liệu, phân tích độ phức tạp và hệ thống bài tập ôn thi.",
    authorName: "PGS. TS. Nguyễn Văn An",
    institutionCode: "HUST",
    majorCode: "CNTT",
    subjectCode: "ALG",
    documentType: "textbook",
    year: 2024,
    pages: 412,
    fileSize: 18_400_000,
    verificationLevel: "gold",
    verificationStatus: "approved",
    ratingAvg: "4.80",
    ratingCount: 1247,
    viewCount: 24531,
    downloadCount: 8934
  },
  {
    id: "doc-macro-economics-principles",
    title: "Nguyên lý Kinh tế học Vĩ mô",
    description: "Tài liệu chuẩn cho chương trình kinh tế, trình bày cung cầu tổng hợp, lạm phát và chính sách tiền tệ.",
    authorName: "TS. Trần Minh Hoàng",
    institutionCode: "NEU",
    majorCode: "KT",
    subjectCode: "MACRO",
    documentType: "textbook",
    year: 2023,
    pages: 356,
    fileSize: 12_100_000,
    verificationLevel: "gold",
    verificationStatus: "approved",
    ratingAvg: "4.70",
    ratingCount: 892,
    viewCount: 18239,
    downloadCount: 6421
  },
  {
    id: "doc-basic-machine-learning-exercises",
    title: "Tổng hợp bài tập Học máy cơ bản",
    description: "Bộ bài tập thực hành Python, regression, classification và đánh giá mô hình đã được reviewer bộ môn kiểm tra.",
    authorName: "Nhóm sinh viên K66 AI",
    institutionCode: "VNU",
    majorCode: "CNTT",
    subjectCode: "ML",
    documentType: "exercise",
    year: 2024,
    pages: 87,
    fileSize: 5_200_000,
    verificationLevel: "silver",
    verificationStatus: "approved",
    ratingAvg: "4.30",
    ratingCount: 234,
    viewCount: 9823,
    downloadCount: 3421
  },
  {
    id: "doc-database-final-outline",
    title: "Cơ sở dữ liệu - Đề cương ôn tập cuối kỳ",
    description: "Tóm tắt SQL, chuẩn hóa, transaction, index và các dạng bài thường gặp trong kỳ thi cuối kỳ.",
    authorName: "Lê Thị Minh Thu",
    institutionCode: "VNU",
    majorCode: "CNTT",
    subjectCode: "DB",
    documentType: "summary_note",
    year: 2024,
    pages: 45,
    fileSize: 3_800_000,
    verificationLevel: "bronze",
    verificationStatus: "approved",
    ratingAvg: "4.10",
    ratingCount: 128,
    viewCount: 6543,
    downloadCount: 2134
  },
  {
    id: "doc-human-anatomy-atlas",
    title: "Giải phẫu người - Atlas hình ảnh",
    description: "Atlas giải phẫu có hình minh họa chi tiết, phù hợp cho sinh viên y khoa ôn thi thực hành.",
    authorName: "GS. BS. Phạm Quốc Bảo",
    institutionCode: "HMU",
    majorCode: "YK",
    subjectCode: "ANAT",
    documentType: "textbook",
    year: 2023,
    pages: 528,
    fileSize: 124_600_000,
    verificationLevel: "gold",
    verificationStatus: "approved",
    ratingAvg: "4.90",
    ratingCount: 2103,
    viewCount: 31204,
    downloadCount: 12456
  },
  {
    id: "doc-civil-law-commentary",
    title: "Luật Dân sự 2015 - Bình luận chuyên sâu",
    description: "Bình luận các điều khoản trọng tâm của Bộ luật Dân sự 2015, kèm ví dụ tình huống và câu hỏi ôn tập.",
    authorName: "ThS. Hoàng Nam Phong",
    institutionCode: "HLU",
    majorCode: "LU",
    subjectCode: "CIVIL",
    documentType: "lecture",
    year: 2024,
    pages: 234,
    fileSize: 8_900_000,
    verificationLevel: "silver",
    verificationStatus: "approved",
    ratingAvg: "4.50",
    ratingCount: 456,
    viewCount: 11234,
    downloadCount: 4321
  },
  {
    id: "doc-strength-materials-lecture",
    title: "Sức bền vật liệu - Bài giảng",
    description: "Bài giảng chính thức về kéo nén, xoắn, uốn, ứng suất và biến dạng trong kết cấu.",
    authorName: "TS. Vũ Đình Cường",
    institutionCode: "NUCE",
    majorCode: "KTXD",
    subjectCode: "SOM",
    documentType: "lecture",
    year: 2024,
    pages: 178,
    fileSize: 15_300_000,
    verificationLevel: "gold",
    verificationStatus: "approved",
    ratingAvg: "4.60",
    ratingCount: 387,
    viewCount: 9456,
    downloadCount: 3892
  },
  {
    id: "doc-statistics-200-exercises",
    title: "Xác suất thống kê - 200 bài tập chọn lọc",
    description: "Bộ bài tập xác suất, biến ngẫu nhiên, phân phối thường gặp và thống kê suy diễn cho sinh viên năm nhất.",
    authorName: "Nguyễn Thanh Hương",
    institutionCode: "VNU",
    majorCode: "TN",
    subjectCode: "STAT",
    documentType: "exercise",
    year: 2023,
    pages: 156,
    fileSize: 4_100_000,
    verificationLevel: "bronze",
    verificationStatus: "approved",
    ratingAvg: "4.00",
    ratingCount: 89,
    viewCount: 4532,
    downloadCount: 1876
  },
  {
    id: "doc-marketing-kotler-summary",
    title: "Marketing căn bản - Tóm tắt theo Philip Kotler",
    description: "Tóm tắt các khái niệm marketing cốt lõi, phân khúc thị trường, định vị thương hiệu và marketing mix.",
    authorName: "Khoa Marketing NEU",
    institutionCode: "NEU",
    majorCode: "KT",
    subjectCode: "MKT",
    documentType: "summary_note",
    year: 2023,
    pages: 96,
    fileSize: 6_700_000,
    verificationLevel: "gold",
    verificationStatus: "approved",
    ratingAvg: "4.80",
    ratingCount: 1543,
    viewCount: 22145,
    downloadCount: 9234
  },
  {
    id: "doc-database-past-exam-2024",
    title: "Đề thi Cơ sở dữ liệu cuối kỳ 2024",
    description: "Đề thi tham khảo có ma trận đề, câu SQL, thiết kế ERD và đáp án gợi ý.",
    authorName: "Bộ môn Hệ thống thông tin",
    institutionCode: "HUST",
    majorCode: "CNTT",
    subjectCode: "DB",
    documentType: "past_exam",
    year: 2024,
    pages: 18,
    fileSize: 1_900_000,
    verificationLevel: "silver",
    verificationStatus: "approved",
    ratingAvg: "4.40",
    ratingCount: 312,
    viewCount: 12980,
    downloadCount: 5210
  },
  {
    id: "doc-database-final-survival-kit",
    title: "Database Final Survival Kit",
    description:
      "Checklist on thi CSDL gom SQL, chuan hoa, transaction, index, ERD va cac loi thuong gap trong bai final.",
    authorName: "Reviewer Team CNTT",
    institutionCode: "HUST",
    majorCode: "CNTT",
    subjectCode: "DB",
    documentType: "survival_kit",
    year: 2026,
    pages: 32,
    fileSize: 2_400_000,
    termLabel: "HK2 2025-2026",
    instructorName: "Bo mon He thong thong tin",
    examName: "Final",
    tags: ["database", "final", "survival-kit"],
    verificationLevel: "silver",
    verificationStatus: "approved",
    ratingAvg: "4.60",
    ratingCount: 218,
    viewCount: 17420,
    downloadCount: 8320
  },
  {
    id: "doc-algorithms-midterm-survival-kit",
    title: "Algorithms Midterm Survival Kit",
    description:
      "Ban do on thi nhanh cho sorting, recursion, graph traversal va dynamic programming co bai tap mau kem dap an.",
    authorName: "K66 Algorithm Review Group",
    institutionCode: "VNU",
    majorCode: "CNTT",
    subjectCode: "ALG",
    documentType: "survival_kit",
    year: 2026,
    pages: 28,
    fileSize: 2_100_000,
    termLabel: "HK2 2025-2026",
    instructorName: "TS. Nguyen Minh",
    examName: "Midterm",
    tags: ["algorithm", "midterm", "survival-kit"],
    verificationLevel: "bronze",
    verificationStatus: "approved",
    ratingAvg: "4.30",
    ratingCount: 96,
    viewCount: 8220,
    downloadCount: 3190
  },
  {
    id: "doc-pending-algorithm-cheatsheet",
    title: "Algorithm quick review sheet",
    description: "Student contributed summary for sorting, graph traversal, dynamic programming and common final exam patterns.",
    authorName: "Demo Student",
    uploaderEmail: "student@veritas.local",
    institutionCode: "VNU",
    majorCode: "CNTT",
    subjectCode: "ALG",
    documentType: "summary_note",
    year: 2026,
    pages: 24,
    fileSize: 980_000,
    termLabel: "HK2 2025-2026",
    instructorName: "TS. Nguyen Minh",
    examName: "Final",
    tags: ["algorithm", "final", "review"],
    verificationLevel: "unverified",
    verificationStatus: "pending",
    ratingAvg: "0.00",
    ratingCount: 0,
    viewCount: 12,
    downloadCount: 3
  },
  {
    id: "doc-changes-requested-db-lab",
    title: "Database lab answer collection",
    description: "Draft answer collection for SQL labs that needs clearer source attribution before approval.",
    authorName: "Demo Student",
    uploaderEmail: "student@veritas.local",
    institutionCode: "HUST",
    majorCode: "CNTT",
    subjectCode: "DB",
    documentType: "exercise",
    year: 2026,
    pages: 31,
    fileSize: 1_240_000,
    termLabel: "HK2 2025-2026",
    instructorName: "ThS. Tran Thu",
    examName: "Lab",
    tags: ["sql", "lab", "answer"],
    verificationLevel: "unverified",
    verificationStatus: "changes_requested",
    ratingAvg: "0.00",
    ratingCount: 0,
    viewCount: 6,
    downloadCount: 1
  }
];

const exams: DemoExam[] = [
  {
    id: "exam-db-final-2026",
    subjectCode: "DB",
    name: "CSDL Final 2026",
    examType: "final",
    examDate: daysFromNow(12, 8),
    termLabel: "HK2 2025-2026",
    location: "G2-301"
  },
  {
    id: "exam-alg-midterm-2026",
    subjectCode: "ALG",
    name: "Giai thuat Midterm 2026",
    examType: "midterm",
    examDate: daysFromNow(7, 9),
    termLabel: "HK2 2025-2026",
    location: "A1-204"
  },
  {
    id: "exam-ml-quiz-2026",
    subjectCode: "ML",
    name: "Hoc may Quiz 2",
    examType: "quiz",
    examDate: daysFromNow(4, 14),
    termLabel: "HK2 2025-2026",
    location: "Lab AI-02"
  },
  {
    id: "exam-stat-final-2026",
    subjectCode: "STAT",
    name: "Xac suat thong ke Final",
    examType: "final",
    examDate: daysFromNow(16, 8),
    termLabel: "HK2 2025-2026",
    location: "B3-102"
  }
];

const instructors: DemoInstructor[] = [
  {
    fullName: "Dr. Nguyen Minh",
    title: "Lecturer",
    email: "nguyen.minh@veritas.local",
    institutionCode: "VNU",
    majorCode: "CNTT",
    subjectCode: "ALG"
  },
  {
    fullName: "ThS. Tran Thu",
    title: "Teaching Assistant",
    email: "tran.thu@veritas.local",
    institutionCode: "HUST",
    majorCode: "CNTT",
    subjectCode: "DB"
  },
  {
    fullName: "Dr. Pham Linh",
    title: "Reviewer",
    email: "pham.linh@veritas.local",
    institutionCode: "VNU",
    majorCode: "CNTT",
    subjectCode: "ML"
  }
];

async function main() {
  const institutionRecords = new Map<string, { id: string }>();

  for (const institution of institutions) {
    const record = await prisma.institution.upsert({
      where: {
        code: institution.code
      },
      update: {
        name: institution.name
      },
      create: {
        code: institution.code,
        name: institution.name
      },
      select: {
        id: true
      }
    });

    institutionRecords.set(institution.code, record);
  }

  const demoInstitution = institutionRecords.get(demoInstitutionCode);

  if (!demoInstitution) {
    throw new Error("Missing demo institution.");
  }

  const majorRecords = new Map<string, { id: string }>();

  for (const major of majors) {
    const record = await prisma.major.upsert({
      where: {
        institutionId_code: {
          institutionId: demoInstitution.id,
          code: major.code
        }
      },
      update: {
        name: major.name
      },
      create: {
        institutionId: demoInstitution.id,
        code: major.code,
        name: major.name
      },
      select: {
        id: true
      }
    });

    majorRecords.set(major.code, record);
  }

  const subjectRecords = new Map<string, { id: string }>();

  for (const subject of subjects) {
    const major = majorRecords.get(subject.majorCode);

    if (!major) {
      throw new Error(`Missing major ${subject.majorCode}.`);
    }

    const record = await prisma.subject.upsert({
      where: {
        majorId_code: {
          majorId: major.id,
          code: subject.code
        }
      },
      update: {
        name: subject.name
      },
      create: {
        majorId: major.id,
        code: subject.code,
        name: subject.name
      },
      select: {
        id: true
      }
    });

    subjectRecords.set(subject.code, record);
  }

  const userRecords = new Map<string, { id: string }>();
  const demoUserPasswordHash = await hashPassword(demoPassword);
  const defaultMajor = majorRecords.get("CNTT");

  for (const user of demoUsers) {
    const record = await prisma.user.upsert({
      where: {
        email: user.email
      },
      update: {
        fullName: user.fullName,
        studentCode: user.studentCode,
        institutionId: demoInstitution.id,
        majorId: defaultMajor?.id,
        role: user.role,
        status: "active"
      },
      create: {
        email: user.email,
        passwordHash: demoUserPasswordHash,
        fullName: user.fullName,
        studentCode: user.studentCode,
        institutionId: demoInstitution.id,
        majorId: defaultMajor?.id,
        role: user.role,
        status: "active"
      },
      select: {
        id: true
      }
    });

    userRecords.set(user.email, record);
  }

  for (const document of documents) {
    const institution = institutionRecords.get(document.institutionCode);
    const major = majorRecords.get(document.majorCode);
    const subject = subjectRecords.get(document.subjectCode);
    const uploader = document.uploaderEmail ? userRecords.get(document.uploaderEmail) : null;
    const visibility = document.verificationStatus === "rejected" ? "hidden" : "public";

    if (!institution || !major || !subject) {
      throw new Error(`Missing relation for ${document.id}.`);
    }

    await prisma.document.upsert({
      where: {
        id: document.id
      },
      update: {
        title: document.title,
        description: document.description,
        authorName: document.authorName,
        uploaderId: uploader?.id,
        institutionId: institution.id,
        majorId: major.id,
        subjectId: subject.id,
        documentType: document.documentType,
        year: document.year,
        pages: document.pages,
        termLabel: document.termLabel,
        instructorName: document.instructorName,
        examName: document.examName,
        tags: document.tags ?? [],
        fileSize: document.fileSize,
        mimeType: "application/pdf",
        fileUrl: `/files/${document.id}.pdf`,
        verificationLevel: document.verificationLevel,
        verificationStatus: document.verificationStatus,
        visibility,
        ratingAvg: document.ratingAvg,
        ratingCount: document.ratingCount,
        viewCount: document.viewCount,
        downloadCount: document.downloadCount
      },
      create: {
        id: document.id,
        title: document.title,
        description: document.description,
        authorName: document.authorName,
        uploaderId: uploader?.id,
        institutionId: institution.id,
        majorId: major.id,
        subjectId: subject.id,
        documentType: document.documentType,
        year: document.year,
        pages: document.pages,
        termLabel: document.termLabel,
        instructorName: document.instructorName,
        examName: document.examName,
        tags: document.tags ?? [],
        fileSize: document.fileSize,
        mimeType: "application/pdf",
        fileUrl: `/files/${document.id}.pdf`,
        verificationLevel: document.verificationLevel,
        verificationStatus: document.verificationStatus,
        visibility,
        ratingAvg: document.ratingAvg,
        ratingCount: document.ratingCount,
        viewCount: document.viewCount,
        downloadCount: document.downloadCount
      }
    });
  }

  for (const exam of exams) {
    const subject = subjectRecords.get(exam.subjectCode);

    if (!subject) {
      throw new Error(`Missing subject ${exam.subjectCode}.`);
    }

    await prisma.exam.upsert({
      where: {
        id: exam.id
      },
      update: {
        subjectId: subject.id,
        name: exam.name,
        examType: exam.examType,
        examDate: exam.examDate,
        termLabel: exam.termLabel,
        location: exam.location
      },
      create: {
        id: exam.id,
        subjectId: subject.id,
        name: exam.name,
        examType: exam.examType,
        examDate: exam.examDate,
        termLabel: exam.termLabel,
        location: exam.location
      }
    });
  }

  for (const instructor of instructors) {
    const institution = institutionRecords.get(instructor.institutionCode);
    const major = majorRecords.get(instructor.majorCode);
    const subject = subjectRecords.get(instructor.subjectCode);

    if (!institution || !major || !subject) {
      throw new Error(`Missing instructor relation for ${instructor.fullName}.`);
    }

    await prisma.instructor.upsert({
      where: {
        subjectId_fullName: {
          subjectId: subject.id,
          fullName: instructor.fullName
        }
      },
      update: {
        institutionId: institution.id,
        majorId: major.id,
        title: instructor.title,
        email: instructor.email
      },
      create: {
        institutionId: institution.id,
        majorId: major.id,
        subjectId: subject.id,
        fullName: instructor.fullName,
        title: instructor.title,
        email: instructor.email
      }
    });
  }

  const demoStudent = userRecords.get("student@veritas.local");

  if (demoStudent) {
    for (const subjectCode of ["DB", "ALG", "ML"]) {
      const subject = subjectRecords.get(subjectCode);

      if (!subject) {
        throw new Error(`Missing subject ${subjectCode}.`);
      }

      await prisma.courseEnrollment.upsert({
        where: {
          userId_subjectId: {
            userId: demoStudent.id,
            subjectId: subject.id
          }
        },
        update: {
          termLabel: "HK2 2025-2026",
          emailReminderEnabled: true
        },
        create: {
          userId: demoStudent.id,
          subjectId: subject.id,
          termLabel: "HK2 2025-2026",
          emailReminderEnabled: true
        }
      });
    }
  }
}

function daysFromNow(days: number, hour: number) {
  const date = new Date();

  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);

  return date;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
