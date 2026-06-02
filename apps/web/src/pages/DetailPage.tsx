import type { DocumentItem } from "@itss/shared";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Check,
  Download,
  ExternalLink,
  Eye,
  FileText,
  MessageCircle,
  Share2,
  Star,
  ThumbsUp,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { LargeVerificationSeal } from "../components/LargeVerificationSeal";
import { VerificationBadge } from "../components/VerificationBadge";
import { verificationLevels } from "../data/documentMeta";
import { getAssetUrl, getDocumentById } from "../lib/api";

type DetailPageProps = {
  documentId: string;
  onBack: () => void;
};

const sampleReviews = [
  {
    name: "Nguyễn Minh Tuấn",
    year: "Sinh viên năm 3",
    rating: 5,
    date: "2 tuần trước",
    content: "Tài liệu rất chi tiết, giải thích dễ hiểu. Các ví dụ thực tế hữu ích cho kỳ thi.",
    likes: 23
  },
  {
    name: "Trần Thu Hà",
    year: "Sinh viên năm 2",
    rating: 4,
    date: "1 tháng trước",
    content: "Nội dung tốt, phần bài tập cuối chương rõ ràng. Mong có thêm lời giải cho các bài khó.",
    likes: 12
  }
];

export function DetailPage({ documentId, onBack }: DetailPageProps) {
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    getDocumentById(documentId, controller.signal)
      .then((payload) => setDocument(payload.document))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải chi tiết tài liệu.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [documentId]);

  if (isLoading && !document) {
    return (
      <DetailShell onBack={onBack}>
        <StatusPanel title="Đang tải tài liệu" description="Hệ thống đang lấy thông tin chi tiết từ API." />
      </DetailShell>
    );
  }

  if (errorMessage || !document) {
    return (
      <DetailShell onBack={onBack}>
        <StatusPanel title="Không thể mở tài liệu" description={errorMessage ?? "Không tìm thấy tài liệu."}>
          <button className="secondary-button" type="button" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </StatusPanel>
      </DetailShell>
    );
  }

  const verification = verificationLevels[document.verification];
  const openFile = () => {
    if (document.fileUrl) {
      window.open(getAssetUrl(document.fileUrl), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <DetailShell onBack={onBack}>
      <main className="detail-layout">
        <article className="detail-main">
          <section className="detail-hero">
            <div className="document-preview">
              <FileText size={58} />
              <span>{document.format}</span>
            </div>
            <div className="detail-hero__content">
              <div className="document-card__meta">
                <VerificationBadge level={document.verification} />
                <span>{document.type}</span>
                <span>{document.year}</span>
                {document.verificationStatus === "pending" ? <span className="status-pill">Chờ kiểm duyệt</span> : null}
              </div>
              <h1>{document.title}</h1>
              <p>{document.description}</p>
              <div className="detail-facts">
                <span>
                  <User size={15} /> {document.author}
                </span>
                <span>
                  <Building2 size={15} /> {document.institution}
                </span>
                <span>
                  <Star size={15} fill="currentColor" /> {document.rating.toFixed(1)} ({document.reviews} đánh giá)
                </span>
              </div>
            </div>
          </section>

          <section className="action-strip">
            <button className="primary-button" type="button" disabled={!document.fileUrl} onClick={openFile}>
              <Download size={18} /> Tải tài liệu
            </button>
            <button className="secondary-button" type="button" disabled={!document.fileUrl} onClick={openFile}>
              <Eye size={18} /> Đọc online
            </button>
            <div>
              <strong>{document.downloads.toLocaleString("vi-VN")}</strong>
              <span>lượt tải</span>
            </div>
            <div>
              <strong>{document.views.toLocaleString("vi-VN")}</strong>
              <span>lượt xem</span>
            </div>
          </section>

          <section className="content-section">
            <h2>Thông tin học thuật</h2>
            <div className="info-grid">
              <InfoItem label="Ngành" value={document.fieldName} />
              <InfoItem label="Môn học" value={document.subject} />
              <InfoItem label="Học kỳ" value={document.termLabel ?? "Chưa rõ"} />
              <InfoItem label="Giảng viên" value={document.instructorName ?? "Chưa rõ"} />
              <InfoItem label="Số trang" value={document.pages > 0 ? `${document.pages} trang` : "Chưa rõ"} />
              <InfoItem label="Kích thước" value={document.size} />
              {document.examName ? <InfoItem label="Kỳ thi" value={document.examName} /> : null}
            </div>
            <div className="tag-row">
              {document.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <h2>Đánh giá từ sinh viên</h2>
              <button className="ghost-button" type="button">
                Xem tất cả ({document.reviews})
              </button>
            </div>
            {sampleReviews.map((review) => (
              <div className="review-item" key={review.name}>
                <div className="review-item__header">
                  <div className="avatar">{review.name.split(" ").at(-1)?.charAt(0)}</div>
                  <div>
                    <strong>{review.name}</strong>
                    <span>
                      {review.year} · {review.date}
                    </span>
                  </div>
                  <div className="review-stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={13} fill={index < review.rating ? "currentColor" : "transparent"} />
                    ))}
                  </div>
                </div>
                <p>{review.content}</p>
                <div className="review-actions">
                  <button type="button">
                    <ThumbsUp size={13} /> Hữu ích ({review.likes})
                  </button>
                  <button type="button">
                    <MessageCircle size={13} /> Trả lời
                  </button>
                </div>
              </div>
            ))}
          </section>
        </article>

        <aside className="detail-sidebar">
          <section className="trust-panel" style={{ backgroundColor: verification.bgColor, borderColor: `${verification.color}44` }}>
            <div className="trust-panel__heading" style={{ color: verification.color }}>
              <LargeVerificationSeal level={document.verification} />
              <span>Cấp độ tin cậy</span>
              <h2>{verification.label}</h2>
            </div>
            <p>{verification.description}</p>
            <div className="criteria-list">
              {verification.criteria.map((criterion) => (
                <span key={criterion}>
                  <Check size={14} style={{ color: verification.color }} /> {criterion}
                </span>
              ))}
            </div>
            <button className="secondary-button" type="button" onClick={() => setShowVerificationModal(true)}>
              Tìm hiểu hệ thống xác minh <ExternalLink size={14} />
            </button>
          </section>

          <section className="content-section compact">
            <h2>Thông tin tài liệu</h2>
            <InfoItem label="Loại" value={document.type} />
            <InfoItem label="Định dạng" value={document.format} />
            <InfoItem label="Ngôn ngữ" value="Tiếng Việt" />
            <InfoItem label="Năm phát hành" value={`${document.year}`} />
          </section>
        </aside>
      </main>

      {showVerificationModal ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowVerificationModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button modal__close" type="button" onClick={() => setShowVerificationModal(false)}>
              <X size={18} />
            </button>
            <LargeVerificationSeal level={document.verification} />
            <h2>
              Đây là <span style={{ color: verification.color }}>{verification.label}</span>
            </h2>
            <p>{verification.description}. Badge này giúp người học nhận biết tài liệu đã được kiểm duyệt.</p>
            <div className="verification-list">
              {Object.entries(verificationLevels).map(([level, config]) => (
                <div key={level} className={level === document.verification ? "is-active" : ""}>
                  <VerificationBadge level={level as keyof typeof verificationLevels} />
                  <p>{config.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </DetailShell>
  );
}

function DetailShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="detail-header">
        <div className="detail-header__inner">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="detail-header__actions">
            <button className="ghost-button" type="button">
              <Bookmark size={16} /> Lưu
            </button>
            <button className="ghost-button" type="button">
              <Share2 size={16} /> Chia sẻ
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function StatusPanel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <main className="detail-layout detail-layout--single">
      <div className="status-panel">
        <h2>{title}</h2>
        <p>{description}</p>
        {children ? <div className="status-panel__actions">{children}</div> : null}
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
