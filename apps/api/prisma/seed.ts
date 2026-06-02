import "dotenv/config";
import { PrismaClient, type DocumentType, type VerificationLevel, type VerificationStatus } from "@prisma/client";

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
  institutionCode: string;
  majorCode: string;
  subjectCode: string;
  documentType: DocumentType;
  year: number;
  pages: number;
  fileSize: number;
  verificationLevel: VerificationLevel;
  verificationStatus: VerificationStatus;
  ratingAvg: string;
  ratingCount: number;
  viewCount: number;
  downloadCount: number;
};

const demoInstitutionCode = "VERITAS-DEMO";

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

  for (const document of documents) {
    const institution = institutionRecords.get(document.institutionCode);
    const major = majorRecords.get(document.majorCode);
    const subject = subjectRecords.get(document.subjectCode);

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
        institutionId: institution.id,
        majorId: major.id,
        subjectId: subject.id,
        documentType: document.documentType,
        year: document.year,
        pages: document.pages,
        fileSize: document.fileSize,
        mimeType: "application/pdf",
        fileUrl: `/files/${document.id}.pdf`,
        verificationLevel: document.verificationLevel,
        verificationStatus: document.verificationStatus,
        visibility: "public",
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
        institutionId: institution.id,
        majorId: major.id,
        subjectId: subject.id,
        documentType: document.documentType,
        year: document.year,
        pages: document.pages,
        fileSize: document.fileSize,
        mimeType: "application/pdf",
        fileUrl: `/files/${document.id}.pdf`,
        verificationLevel: document.verificationLevel,
        verificationStatus: document.verificationStatus,
        visibility: "public",
        ratingAvg: document.ratingAvg,
        ratingCount: document.ratingCount,
        viewCount: document.viewCount,
        downloadCount: document.downloadCount
      }
    });
  }
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
