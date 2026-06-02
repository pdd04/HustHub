import type { AuthUser, DocumentCommentItem, DocumentItem, ReportReason, ReviewHistoryItem } from "@itss/shared";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Check,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  LogIn,
  MessageCircle,
  Share2,
  Star,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { LargeVerificationSeal } from "../components/LargeVerificationSeal";
import { VerificationBadge } from "../components/VerificationBadge";
import { verificationLevels } from "../data/documentMeta";
import { addDocumentComment, getAssetUrl, getDocumentById, rateDocument, reportDocument } from "../lib/api";

type DetailPageProps = {
  documentId: string;
  currentUser: AuthUser | null;
  accessToken: string | null;
  onBack: () => void;
  onLogin: () => void;
};

const reportReasonLabels: Record<ReportReason, string> = {
  inaccurate: "Sai nội dung",
  outdated: "Đã lỗi thời",
  copyright: "Bản quyền",
  inappropriate: "Không phù hợp",
  spam: "Spam",
  other: "Khác"
};

export function DetailPage({ documentId, currentUser, accessToken, onBack, onLogin }: DetailPageProps) {
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [comments, setComments] = useState<DocumentCommentItem[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [reportReason, setReportReason] = useState<ReportReason>("inaccurate");
  const [reportDetail, setReportDetail] = useState("");
  const [interactionMessage, setInteractionMessage] = useState<string | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    getDocumentById(documentId, controller.signal)
      .then((payload) => {
        setDocument(payload.document);
        setComments(payload.comments);
        setReviewHistory(payload.reviewHistory);
      })
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

  const requireLogin = () => {
    if (accessToken && currentUser) return true;

    onLogin();
    return false;
  };

  const submitRating = async () => {
    if (!requireLogin() || !accessToken) return;

    setIsSubmittingInteraction(true);
    setInteractionError(null);
    setInteractionMessage(null);

    try {
      const result = await rateDocument(document.id, ratingValue, accessToken);
      setDocument(result.document);
      setInteractionMessage("Rating da duoc luu.");
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : "Khong the luu rating.");
    } finally {
      setIsSubmittingInteraction(false);
    }
  };

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requireLogin() || !accessToken) return;

    const content = commentText.trim();

    if (content.length < 2) {
      setInteractionError("Binh luan can co noi dung.");
      return;
    }

    setIsSubmittingInteraction(true);
    setInteractionError(null);
    setInteractionMessage(null);

    try {
      const result = await addDocumentComment(document.id, content, accessToken);
      setComments((current) => [result.comment, ...current]);
      setCommentText("");
      setInteractionMessage("Binh luan da duoc them.");
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : "Khong the gui binh luan.");
    } finally {
      setIsSubmittingInteraction(false);
    }
  };

  const submitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requireLogin() || !accessToken) return;

    setIsSubmittingInteraction(true);
    setInteractionError(null);
    setInteractionMessage(null);

    try {
      await reportDocument(document.id, reportReason, reportDetail.trim(), accessToken);
      setReportDetail("");
      setInteractionMessage("Bao cao da duoc ghi nhan.");
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : "Khong the gui bao cao.");
    } finally {
      setIsSubmittingInteraction(false);
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
            <div className="rating-composer">
              <div className="rating-control" aria-label="Chọn số sao">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;

                  return (
                    <button
                      className={value <= ratingValue ? "is-active" : ""}
                      key={value}
                      type="button"
                      onClick={() => setRatingValue(value)}
                    >
                      <Star size={17} fill={value <= ratingValue ? "currentColor" : "transparent"} />
                    </button>
                  );
                })}
              </div>
              <button className="secondary-button" type="button" disabled={isSubmittingInteraction} onClick={submitRating}>
                <Star size={16} /> Lưu rating
              </button>
            </div>

            <form className="comment-form" onSubmit={submitComment}>
              <label className="field">
                <span>Bình luận</span>
                <textarea rows={3} value={commentText} onChange={(event) => setCommentText(event.target.value)} />
              </label>
              <button className="primary-button" type="submit" disabled={isSubmittingInteraction}>
                <MessageCircle size={16} /> Gửi bình luận
              </button>
            </form>

            {interactionMessage ? <div className="form-success">{interactionMessage}</div> : null}
            {interactionError ? <div className="form-error">{interactionError}</div> : null}

            {comments.length > 0 ? (
              comments.map((comment) => (
                <div className="review-item" key={comment.id}>
                  <div className="review-item__header">
                    <div className="avatar">{comment.authorName.split(" ").at(-1)?.charAt(0)}</div>
                    <div>
                      <strong>{comment.authorName}</strong>
                      <span>
                        {comment.authorRole} · {formatRelativeDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="muted-text">Chưa có bình luận nào cho tài liệu này.</p>
            )}
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

          <section className="content-section compact">
            <h2>Review history</h2>
            {reviewHistory.length > 0 ? (
              <div className="trust-history">
                {reviewHistory.map((review) => (
                  <div key={review.id}>
                    <VerificationBadge level={review.verificationLevel} size="sm" />
                    <strong>{review.decision}</strong>
                    <span>
                      {review.reviewerName} · {formatRelativeDate(review.createdAt)}
                    </span>
                    {review.note ? <p>{review.note}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-text">Chưa có lịch sử review.</p>
            )}
          </section>

          <section className="content-section compact">
            <h2>Báo cáo tài liệu</h2>
            {!currentUser ? (
              <button className="secondary-button" type="button" onClick={onLogin}>
                <LogIn size={16} /> Đăng nhập để báo cáo
              </button>
            ) : (
              <form className="report-form" onSubmit={submitReport}>
                <label className="field">
                  <span>Lý do</span>
                  <select value={reportReason} onChange={(event) => setReportReason(event.target.value as ReportReason)}>
                    {Object.entries(reportReasonLabels).map(([reason, label]) => (
                      <option key={reason} value={reason}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Chi tiết</span>
                  <textarea rows={3} value={reportDetail} onChange={(event) => setReportDetail(event.target.value)} />
                </label>
                <button className="secondary-button" type="submit" disabled={isSubmittingInteraction}>
                  <Flag size={16} /> Gửi báo cáo
                </button>
              </form>
            )}
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

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) return "vừa xong";

  const diffInSeconds = Math.max(1, Math.round((Date.now() - timestamp) / 1000));
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60]
  ];
  const formatter = new Intl.RelativeTimeFormat("vi", {
    numeric: "auto"
  });

  for (const [unit, seconds] of units) {
    if (diffInSeconds >= seconds) {
      return formatter.format(-Math.floor(diffInSeconds / seconds), unit);
    }
  }

  return "vừa xong";
}
