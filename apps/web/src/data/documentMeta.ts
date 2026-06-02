import type { DocumentSort, DocumentType, VerificationLevel } from "@itss/shared";

export type VerificationConfig = {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  description: string;
  criteria: string[];
};

export const verificationLevelOrder: VerificationLevel[] = ["gold", "silver", "bronze", "unverified"];

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

export const documentTypeLabels: Record<DocumentType, string> = {
  textbook: "Giáo trình",
  lecture: "Bài giảng",
  past_exam: "Đề thi cũ",
  summary_note: "Note tóm tắt",
  exercise: "Bài tập",
  survival_kit: "Survival kit",
  other: "Tài liệu khác"
};

export const documentTypeOrder = Object.keys(documentTypeLabels) as DocumentType[];

export const sortValueOrder: DocumentSort[] = ["relevance", "newest", "popular", "rating"];

export function isVerificationLevel(value: string): value is VerificationLevel {
  return verificationLevelOrder.includes(value as VerificationLevel);
}

export function isDocumentType(value: string): value is DocumentType {
  return documentTypeOrder.includes(value as DocumentType);
}

export function isDocumentSort(value: string): value is DocumentSort {
  return sortValueOrder.includes(value as DocumentSort);
}
