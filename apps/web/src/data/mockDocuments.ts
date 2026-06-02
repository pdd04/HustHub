export type VerificationLevel = "gold" | "silver" | "bronze" | "unverified";

export type FieldItem = {
  id: string;
  name: string;
  count: number;
};

export type DocumentItem = {
  id: number;
  title: string;
  author: string;
  field: string;
  fieldName: string;
  subject: string;
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
};

export type VerificationConfig = {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  description: string;
  criteria: string[];
};

export const fields: FieldItem[] = [
  { id: "all", name: "Tất cả", count: 2847 },
  { id: "cntt", name: "Công nghệ thông tin", count: 512 },
  { id: "kt", name: "Kinh tế", count: 428 },
  { id: "yk", name: "Y khoa", count: 317 },
  { id: "lu", name: "Luật", count: 289 },
  { id: "kt-xd", name: "Kỹ thuật & Xây dựng", count: 356 },
  { id: "nn", name: "Ngôn ngữ", count: 241 },
  { id: "sp", name: "Sư phạm", count: 198 },
  { id: "tn", name: "Khoa học tự nhiên", count: 276 },
  { id: "xh", name: "Khoa học xã hội", count: 230 }
];

export const subjectsByField: Record<string, string[]> = {
  cntt: ["Giải thuật", "Cấu trúc dữ liệu", "Học máy", "Mạng máy tính", "Cơ sở dữ liệu", "Trí tuệ nhân tạo"],
  kt: ["Kinh tế vi mô", "Kinh tế vĩ mô", "Tài chính doanh nghiệp", "Marketing", "Kế toán"],
  yk: ["Giải phẫu", "Sinh lý học", "Dược lý", "Nội khoa", "Ngoại khoa"],
  lu: ["Luật Hiến pháp", "Luật Dân sự", "Luật Hình sự", "Luật Thương mại"],
  "kt-xd": ["Sức bền vật liệu", "Cơ học kết cấu", "Kỹ thuật điện", "Vật liệu xây dựng"],
  nn: ["Ngữ pháp tiếng Anh", "Dịch thuật", "Ngôn ngữ học"],
  sp: ["Tâm lý giáo dục", "Phương pháp giảng dạy"],
  tn: ["Vật lý đại cương", "Hóa học", "Toán cao cấp", "Xác suất thống kê"],
  xh: ["Xã hội học", "Triết học", "Lịch sử"]
};

export const documents: DocumentItem[] = [
  {
    id: 1,
    title: "Giáo trình Giải thuật và Cấu trúc dữ liệu",
    author: "PGS. TS. Nguyễn Văn An",
    field: "cntt",
    fieldName: "Công nghệ thông tin",
    subject: "Giải thuật",
    type: "Giáo trình",
    year: 2024,
    pages: 412,
    verification: "gold",
    rating: 4.8,
    reviews: 1247,
    downloads: 8934,
    views: 24531,
    institution: "ĐH Bách Khoa Hà Nội",
    description:
      "Giáo trình chính thức được hội đồng khoa học thẩm định, bao gồm các thuật toán cơ bản và nâng cao cùng hệ thống bài tập phong phú.",
    size: "18.4 MB",
    format: "PDF",
    tags: ["Thuật toán", "Cấu trúc dữ liệu", "Lập trình"]
  },
  {
    id: 2,
    title: "Nguyên lý Kinh tế học Vĩ mô",
    author: "TS. Trần Minh Hoàng",
    field: "kt",
    fieldName: "Kinh tế",
    subject: "Kinh tế vĩ mô",
    type: "Giáo trình",
    year: 2023,
    pages: 356,
    verification: "gold",
    rating: 4.7,
    reviews: 892,
    downloads: 6421,
    views: 18239,
    institution: "ĐH Kinh tế Quốc dân",
    description: "Tài liệu chuẩn được công nhận cho chương trình đào tạo cử nhân kinh tế.",
    size: "12.1 MB",
    format: "PDF",
    tags: ["Kinh tế vĩ mô", "Chính sách tiền tệ"]
  },
  {
    id: 3,
    title: "Tổng hợp bài tập Học máy cơ bản",
    author: "Nhóm sinh viên K66 AI",
    field: "cntt",
    fieldName: "Công nghệ thông tin",
    subject: "Học máy",
    type: "Bài tập",
    year: 2024,
    pages: 87,
    verification: "silver",
    rating: 4.3,
    reviews: 234,
    downloads: 3421,
    views: 9823,
    institution: "ĐH Quốc gia Hà Nội",
    description: "Tổng hợp bài tập thực hành được giảng viên bộ môn kiểm duyệt.",
    size: "5.2 MB",
    format: "PDF",
    tags: ["Machine Learning", "Python"]
  },
  {
    id: 4,
    title: "Cơ sở Dữ liệu - Đề cương ôn tập",
    author: "Lê Thị Minh Thu",
    field: "cntt",
    fieldName: "Công nghệ thông tin",
    subject: "Cơ sở dữ liệu",
    type: "Tài liệu ôn tập",
    year: 2024,
    pages: 45,
    verification: "bronze",
    rating: 4.1,
    reviews: 128,
    downloads: 2134,
    views: 6543,
    institution: "Sinh viên đóng góp",
    description: "Tài liệu tự biên soạn được cộng đồng đánh giá tốt.",
    size: "3.8 MB",
    format: "PDF",
    tags: ["SQL", "Database"]
  },
  {
    id: 5,
    title: "Giải phẫu người - Atlas hình ảnh",
    author: "GS. BS. Phạm Quốc Bảo",
    field: "yk",
    fieldName: "Y khoa",
    subject: "Giải phẫu",
    type: "Atlas",
    year: 2023,
    pages: 528,
    verification: "gold",
    rating: 4.9,
    reviews: 2103,
    downloads: 12456,
    views: 31204,
    institution: "ĐH Y Hà Nội",
    description: "Atlas giải phẫu chính thức được thẩm định bởi hội đồng chuyên môn.",
    size: "124.6 MB",
    format: "PDF",
    tags: ["Giải phẫu", "Y học"]
  },
  {
    id: 6,
    title: "Luật Dân sự 2015 - Bình luận",
    author: "ThS. Hoàng Nam Phong",
    field: "lu",
    fieldName: "Luật",
    subject: "Luật Dân sự",
    type: "Chuyên khảo",
    year: 2024,
    pages: 234,
    verification: "silver",
    rating: 4.5,
    reviews: 456,
    downloads: 4321,
    views: 11234,
    institution: "ĐH Luật Hà Nội",
    description: "Bình luận chuyên sâu về Bộ luật Dân sự 2015.",
    size: "8.9 MB",
    format: "PDF",
    tags: ["Luật Dân sự", "Pháp luật"]
  },
  {
    id: 7,
    title: "Sức bền vật liệu - Bài giảng",
    author: "TS. Vũ Đình Cường",
    field: "kt-xd",
    fieldName: "Kỹ thuật & Xây dựng",
    subject: "Sức bền vật liệu",
    type: "Bài giảng",
    year: 2024,
    pages: 178,
    verification: "gold",
    rating: 4.6,
    reviews: 387,
    downloads: 3892,
    views: 9456,
    institution: "ĐH Xây dựng",
    description: "Bài giảng chính thức được bộ môn Cơ học kỹ thuật phê duyệt.",
    size: "15.3 MB",
    format: "PDF",
    tags: ["Cơ học", "Vật liệu"]
  },
  {
    id: 8,
    title: "Xác suất thống kê - 200 bài tập",
    author: "Nguyễn Thanh Hương",
    field: "tn",
    fieldName: "Khoa học tự nhiên",
    subject: "Xác suất thống kê",
    type: "Bài tập",
    year: 2023,
    pages: 156,
    verification: "bronze",
    rating: 4.0,
    reviews: 89,
    downloads: 1876,
    views: 4532,
    institution: "Sinh viên đóng góp",
    description: "Bộ bài tập chọn lọc tự biên soạn.",
    size: "4.1 MB",
    format: "PDF",
    tags: ["Thống kê", "Xác suất"]
  },
  {
    id: 9,
    title: "Marketing căn bản - Philip Kotler",
    author: "Dịch: Khoa Marketing ĐH NEU",
    field: "kt",
    fieldName: "Kinh tế",
    subject: "Marketing",
    type: "Sách dịch",
    year: 2023,
    pages: 487,
    verification: "gold",
    rating: 4.8,
    reviews: 1543,
    downloads: 9234,
    views: 22145,
    institution: "ĐH Kinh tế Quốc dân",
    description: "Bản dịch chính thức được tác giả ủy quyền và hội đồng khoa học thẩm định.",
    size: "22.7 MB",
    format: "PDF",
    tags: ["Marketing", "Kinh doanh"]
  }
];

export const verificationLevels: Record<VerificationLevel, VerificationConfig> = {
  gold: {
    label: "Xác thực Vàng",
    shortLabel: "Vàng",
    color: "#C8102E",
    bgColor: "#FEF2F3",
    description: "Được cơ sở đào tạo, giảng viên chính thức hoặc admin học thuật phê duyệt",
    criteria: [
      "Được hội đồng khoa học hoặc giảng viên phụ trách thẩm định",
      "Tác giả là giảng viên hoặc chuyên gia có học hàm, học vị",
      "Đã kiểm tra trùng lặp, đạo văn và tính cập nhật",
      "Nội dung phù hợp chương trình đào tạo hiện hành"
    ]
  },
  silver: {
    label: "Xác thực Bạc",
    shortLabel: "Bạc",
    color: "#64748B",
    bgColor: "#F1F5F9",
    description: "Được giảng viên, TA hoặc reviewer bộ môn xác minh",
    criteria: [
      "Được reviewer bộ môn kiểm tra nội dung",
      "Đánh giá cộng đồng từ 4.0 sao trở lên",
      "Có metadata học thuật đầy đủ"
    ]
  },
  bronze: {
    label: "Cộng đồng tin cậy",
    shortLabel: "Đồng",
    color: "#B45309",
    bgColor: "#FEF3C7",
    description: "Được cộng đồng đánh giá tốt và chưa có báo cáo nghiêm trọng",
    criteria: [
      "Đánh giá trung bình từ 3.5 sao trở lên",
      "Có ít nhất 20 lượt đánh giá",
      "Không có báo cáo vi phạm nghiêm trọng"
    ]
  },
  unverified: {
    label: "Chưa xác thực",
    shortLabel: "Mới",
    color: "#78716C",
    bgColor: "#F5F5F4",
    description: "Tài liệu mới đăng, đang chờ kiểm duyệt",
    criteria: ["Chưa có reviewer xác minh", "Không được ưu tiên trong xếp hạng tin cậy"]
  }
};
