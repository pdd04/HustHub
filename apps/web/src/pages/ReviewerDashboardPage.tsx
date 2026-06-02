import type { AuthUser, ReviewDecision, ReviewQueueItem, ReviewQueueResponse, VerificationLevel } from "@itss/shared";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  LogIn,
  MessageSquareWarning,
  RefreshCw,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VerificationBadge } from "../components/VerificationBadge";
import { verificationLevels } from "../data/documentMeta";
import { getReviewQueue, reviewDocument } from "../lib/api";

type ReviewerDashboardPageProps = {
  currentUser: AuthUser | null;
  accessToken: string | null;
  onBack: () => void;
  onLogin: () => void;
  onSelectDocument: (document: ReviewQueueItem["document"]) => void;
};

const emptyQueue: ReviewQueueResponse = {
  items: [],
  summary: {
    pending: 0,
    changesRequested: 0,
    approved: 0,
    rejected: 0,
    openReports: 0
  }
};

const statusLabels: Record<ReviewQueueItem["document"]["verificationStatus"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested"
};

const badgeChoices: VerificationLevel[] = ["silver", "bronze", "gold"];

export function ReviewerDashboardPage({
  currentUser,
  accessToken,
  onBack,
  onLogin,
  onSelectDocument
}: ReviewerDashboardPageProps) {
  const [queue, setQueue] = useState<ReviewQueueResponse>(emptyQueue);
  const [isLoading, setIsLoading] = useState(Boolean(currentUser));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submittingDocumentId, setSubmittingDocumentId] = useState<string | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<Record<string, VerificationLevel>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const canReview = currentUser?.role === "reviewer" || currentUser?.role === "admin";
  const availableBadges = useMemo(
    () => (currentUser?.role === "admin" ? badgeChoices : badgeChoices.filter((badge) => badge !== "gold")),
    [currentUser?.role]
  );

  useEffect(() => {
    if (!accessToken || !canReview) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    getReviewQueue(accessToken, controller.signal)
      .then((payload) => setQueue(payload))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : "Khong the tai hang doi review.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [accessToken, canReview]);

  const reloadQueue = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setQueue(await getReviewQueue(accessToken));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Khong the tai hang doi review.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async (item: ReviewQueueItem, decision: ReviewDecision) => {
    if (!accessToken) return;

    const note = (notes[item.document.id] ?? "").trim();

    if (decision !== "approved" && note.length < 5) {
      setErrorMessage("Reject hoac request changes can ghi chu toi thieu 5 ky tu.");
      return;
    }

    const fallbackBadge = availableBadges[0] ?? "silver";
    const verificationLevel = decision === "approved" ? selectedBadges[item.document.id] ?? fallbackBadge : "unverified";

    setSubmittingDocumentId(item.document.id);
    setErrorMessage(null);
    setToastMessage(null);

    try {
      await reviewDocument(
        item.document.id,
        {
          decision,
          verificationLevel,
          note
        },
        accessToken
      );
      setToastMessage(`${item.document.title} da duoc cap nhat.`);
      await reloadQueue();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Khong the cap nhat review.");
    } finally {
      setSubmittingDocumentId(null);
    }
  };

  if (!currentUser) {
    return (
      <ReviewShell onBack={onBack}>
        <StatusPanel title="Can dang nhap" description="Reviewer can dang nhap truoc khi mo dashboard kiem duyet.">
          <button className="primary-button" type="button" onClick={onLogin}>
            <LogIn size={18} /> Dang nhap
          </button>
        </StatusPanel>
      </ReviewShell>
    );
  }

  if (!canReview) {
    return (
      <ReviewShell onBack={onBack}>
        <StatusPanel title="Khong co quyen review" description="Tai khoan nay chua co role reviewer hoac admin." />
      </ReviewShell>
    );
  }

  const summaryItems = [
    { label: "Pending", value: queue.summary.pending },
    { label: "Changes", value: queue.summary.changesRequested },
    { label: "Approved", value: queue.summary.approved },
    { label: "Rejected", value: queue.summary.rejected },
    { label: "Reports", value: queue.summary.openReports }
  ];

  return (
    <ReviewShell onBack={onBack}>
      <main className="review-layout">
        <section className="review-heading">
          <div>
            <p className="eyebrow">Trust workflow</p>
            <h1>Reviewer dashboard</h1>
            <span>{queue.items.length} tai lieu dang cho xu ly</span>
          </div>
          <button className="secondary-button" type="button" disabled={isLoading} onClick={reloadQueue}>
            <RefreshCw size={17} /> Refresh
          </button>
        </section>

        <section className="review-summary" aria-label="Review summary">
          {summaryItems.map((item) => (
            <div className="review-summary__item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value.toLocaleString("vi-VN")}</strong>
            </div>
          ))}
        </section>

        {toastMessage ? <div className="form-success">{toastMessage}</div> : null}
        {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
        {isLoading ? <div className="inline-status">Dang tai hang doi review...</div> : null}

        {!isLoading && queue.items.length === 0 ? (
          <div className="empty-state">
            <h2>Khong con tai lieu can review</h2>
            <p>Hang doi pending va request changes dang trong.</p>
          </div>
        ) : null}

        <div className="review-list">
          {queue.items.map((item) => {
            const document = item.document;
            const selectedBadge = selectedBadges[document.id] ?? availableBadges[0] ?? "silver";
            const isSubmitting = submittingDocumentId === document.id;

            return (
              <article className="review-card" key={document.id}>
                <div className="review-card__main">
                  <div className="review-card__icon">
                    <ClipboardCheck size={28} />
                  </div>
                  <div>
                    <div className="document-card__meta">
                      <VerificationBadge level={document.verification} size="sm" />
                      <span>{statusLabels[document.verificationStatus]}</span>
                      <span>{document.type}</span>
                      <span>{document.year}</span>
                    </div>
                    <h2>{document.title}</h2>
                    <p>{document.description}</p>
                    <div className="review-card__facts">
                      <span>{document.subject}</span>
                      <span>{document.fieldName}</span>
                      <span>{item.uploaderName ?? document.author}</span>
                      <span>{item.commentCount} comments</span>
                      <span>{item.reportCount} reports</span>
                    </div>
                    {item.lastReview ? (
                      <div className="review-card__last">
                        <ShieldCheck size={14} />
                        {item.lastReview.reviewerName}: {item.lastReview.decision}
                        {item.lastReview.note ? ` - ${item.lastReview.note}` : ""}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="review-card__controls">
                  <label className="field">
                    <span>Badge khi approve</span>
                    <select
                      value={selectedBadge}
                      onChange={(event) =>
                        setSelectedBadges((current) => ({
                          ...current,
                          [document.id]: event.target.value as VerificationLevel
                        }))
                      }
                    >
                      {availableBadges.map((badge) => (
                        <option key={badge} value={badge}>
                          {verificationLevels[badge].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Review note</span>
                    <textarea
                      rows={3}
                      value={notes[document.id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [document.id]: event.target.value
                        }))
                      }
                    />
                  </label>

                  <div className="review-card__actions">
                    <button className="secondary-button" type="button" onClick={() => onSelectDocument(document)}>
                      <Eye size={16} /> Open
                    </button>
                    <button className="primary-button" type="button" disabled={isSubmitting} onClick={() => submitReview(item, "approved")}>
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => submitReview(item, "changes_requested")}
                    >
                      <MessageSquareWarning size={16} /> Changes
                    </button>
                    <button className="danger-button" type="button" disabled={isSubmitting} onClick={() => submitReview(item, "rejected")}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </ReviewShell>
  );
}

function ReviewShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="detail-header">
        <div className="detail-header__inner">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lai
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

function StatusPanel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <main className="review-layout review-layout--single">
      <div className="status-panel">
        <h2>{title}</h2>
        <p>{description}</p>
        {children ? <div className="status-panel__actions">{children}</div> : null}
      </div>
    </main>
  );
}
