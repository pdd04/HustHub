import type {
  AuthUser,
  CourseEnrollmentItem,
  DocumentItem,
  ExamItem,
  ExamType,
  PersonalizationDashboardResponse,
  QuickReviewSection,
  SubjectOption,
  SurvivalKitSection
} from "@itss/shared";
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LogIn,
  Plus,
  RefreshCw,
  Star,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VerificationBadge } from "../components/VerificationBadge";
import { deleteCourseEnrollment, getExamDashboard, upsertCourseEnrollment } from "../lib/api";

type ExamModePageProps = {
  currentUser: AuthUser | null;
  accessToken: string | null;
  onBack: () => void;
  onLogin: () => void;
  onSelectDocument: (document: DocumentItem) => void;
};

const emptyDashboard: PersonalizationDashboardResponse = {
  enrolledSubjects: [],
  availableSubjects: [],
  upcomingExams: [],
  quickReview: [],
  survivalKits: [],
  notifications: {
    enabledCount: 0,
    nextReminderAt: null,
    message: ""
  }
};

const examTypeLabels: Record<ExamType, string> = {
  midterm: "Midterm",
  final: "Final",
  quiz: "Quiz"
};

const defaultTermLabel = "HK2 2025-2026";

export function ExamModePage({ currentUser, accessToken, onBack, onLogin, onSelectDocument }: ExamModePageProps) {
  const [dashboard, setDashboard] = useState<PersonalizationDashboardResponse>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(Boolean(currentUser));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [termLabel, setTermLabel] = useState(defaultTermLabel);
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(true);

  const subjectsToEnroll = useMemo(
    () => dashboard.availableSubjects.filter((subject) => !subject.enrolled),
    [dashboard.availableSubjects]
  );

  useEffect(() => {
    if (!accessToken || !currentUser) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);

    getExamDashboard(accessToken, controller.signal)
      .then((payload) => {
        setDashboard(payload);
        const firstOpenSubject = payload.availableSubjects.find((subject) => !subject.enrolled)?.id ?? "";
        setSelectedSubjectId((current) => current || firstOpenSubject);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : "Khong the tai exam mode.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [accessToken, currentUser]);

  const reloadDashboard = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = await getExamDashboard(accessToken);
      setDashboard(payload);
      const firstOpenSubject = payload.availableSubjects.find((subject) => !subject.enrolled)?.id ?? "";
      setSelectedSubjectId((current) => (current && payload.availableSubjects.some((subject) => subject.id === current && !subject.enrolled) ? current : firstOpenSubject));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Khong the tai exam mode.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitEnrollment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      onLogin();
      return;
    }

    if (!selectedSubjectId) {
      setErrorMessage("Chon mot mon hoc truoc khi them vao dashboard.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setToastMessage(null);

    try {
      await upsertCourseEnrollment(
        {
          subjectId: selectedSubjectId,
          termLabel,
          emailReminderEnabled
        },
        accessToken
      );
      setToastMessage("Da cap nhat mon dang hoc.");
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Khong the cap nhat mon dang hoc.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeEnrollment = async (enrollment: CourseEnrollmentItem) => {
    if (!accessToken) return;

    setIsSaving(true);
    setErrorMessage(null);
    setToastMessage(null);

    try {
      await deleteCourseEnrollment(enrollment.subjectId, accessToken);
      setToastMessage(`${enrollment.subjectName} da duoc go khoi dashboard.`);
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Khong the go mon hoc.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <ExamShell onBack={onBack}>
        <StatusPanel title="Can dang nhap" description="Dang nhap de mo dashboard on thi ca nhan.">
          <button className="primary-button" type="button" onClick={onLogin}>
            <LogIn size={18} /> Dang nhap
          </button>
        </StatusPanel>
      </ExamShell>
    );
  }

  return (
    <ExamShell onBack={onBack}>
      <main className="exam-layout">
        <section className="exam-heading">
          <div>
            <p className="eyebrow">Exam mode</p>
            <h1>Bang on thi ca nhan</h1>
            <span>{dashboard.enrolledSubjects.length} mon dang hoc</span>
          </div>
          <button className="secondary-button" type="button" disabled={isLoading} onClick={reloadDashboard}>
            <RefreshCw size={17} /> Refresh
          </button>
        </section>

        <section className="exam-summary" aria-label="Exam mode summary">
          <SummaryItem icon={<BookOpenCheck size={20} />} label="Mon hoc" value={dashboard.enrolledSubjects.length} />
          <SummaryItem icon={<CalendarDays size={20} />} label="Ky thi" value={dashboard.upcomingExams.length} />
          <SummaryItem icon={<FileText size={20} />} label="Quick review" value={dashboard.quickReview.reduce((total, section) => total + section.documents.length, 0)} />
          <SummaryItem icon={<Bell size={20} />} label="Email reminders" value={dashboard.notifications.enabledCount} />
        </section>

        {toastMessage ? <div className="form-success">{toastMessage}</div> : null}
        {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
        {isLoading ? <div className="inline-status">Dang tai exam mode...</div> : null}

        <div className="exam-grid">
          <section className="exam-panel">
            <div className="section-heading">
              <h2>Mon dang hoc</h2>
              <span>{dashboard.notifications.message}</span>
            </div>

            <form className="exam-enroll-form" onSubmit={submitEnrollment}>
              <label className="field">
                <span>Mon hoc</span>
                <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} disabled={subjectsToEnroll.length === 0}>
                  {subjectsToEnroll.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {formatSubjectOption(subject)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Hoc ky</span>
                <input value={termLabel} onChange={(event) => setTermLabel(event.target.value)} placeholder={defaultTermLabel} />
              </label>
              <label className="toggle-row">
                <input type="checkbox" checked={emailReminderEnabled} onChange={(event) => setEmailReminderEnabled(event.target.checked)} />
                <span>Email reminder</span>
              </label>
              <button className="primary-button" type="submit" disabled={isSaving || subjectsToEnroll.length === 0}>
                <Plus size={17} /> Them mon
              </button>
            </form>

            <div className="course-list">
              {dashboard.enrolledSubjects.map((enrollment) => (
                <article className="course-card" key={enrollment.id}>
                  <div>
                    <strong>{enrollment.subjectName}</strong>
                    <span>{enrollment.majorName}</span>
                  </div>
                  <div className="course-card__meta">
                    <span>{enrollment.termLabel ?? "Chua gan hoc ky"}</span>
                    {enrollment.nextExam ? <span>{enrollment.nextExam.daysUntil} ngay toi {examTypeLabels[enrollment.nextExam.examType]}</span> : <span>Chua co ky thi</span>}
                  </div>
                  <button className="icon-button" type="button" disabled={isSaving} onClick={() => removeEnrollment(enrollment)} aria-label={`Go ${enrollment.subjectName}`}>
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>

            {!isLoading && dashboard.enrolledSubjects.length === 0 ? (
              <div className="empty-state empty-state--compact">
                <h2>Chua co mon dang hoc</h2>
                <p>Them mon hoc de bat dau exam mode.</p>
              </div>
            ) : null}
          </section>

          <section className="exam-panel">
            <div className="section-heading">
              <h2>Ky thi sap toi</h2>
              <span>{formatReminderDate(dashboard.notifications.nextReminderAt)}</span>
            </div>
            <div className="exam-timeline">
              {dashboard.upcomingExams.map((exam) => (
                <ExamTimelineItem key={exam.id} exam={exam} />
              ))}
            </div>
            {!isLoading && dashboard.upcomingExams.length === 0 ? (
              <div className="empty-state empty-state--compact">
                <h2>Chua co lich thi</h2>
                <p>Seed hoac admin co the them lich thi cho mon dang hoc.</p>
              </div>
            ) : null}
          </section>
        </div>

        <section className="exam-panel exam-panel--wide">
          <div className="section-heading">
            <h2>Quick review</h2>
            <span>Tai lieu uu tien theo ky thi gan nhat</span>
          </div>
          <div className="quick-review-grid">
            {dashboard.quickReview.map((section) => (
              <QuickReviewCard key={section.exam.id} section={section} onSelectDocument={onSelectDocument} />
            ))}
          </div>
          {!isLoading && dashboard.quickReview.length === 0 ? (
            <div className="empty-state empty-state--compact">
              <h2>Chua co quick review</h2>
              <p>Dang can mon hoc va lich thi sap toi.</p>
            </div>
          ) : null}
        </section>

        <section className="exam-panel exam-panel--wide">
          <div className="section-heading">
            <h2>Survival kit</h2>
            <span>Theo mon dang hoc</span>
          </div>
          <div className="survival-grid">
            {dashboard.survivalKits.map((section) => (
              <SurvivalKitCard key={section.subjectId} section={section} onSelectDocument={onSelectDocument} />
            ))}
          </div>
        </section>
      </main>
    </ExamShell>
  );
}

function ExamShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
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

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="exam-summary__item">
      <span>{icon}</span>
      <div>
        <strong>{value.toLocaleString("vi-VN")}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function ExamTimelineItem({ exam }: { exam: ExamItem }) {
  return (
    <article className="exam-timeline__item">
      <div className="exam-date-box">
        <strong>{exam.daysUntil}</strong>
        <span>ngay</span>
      </div>
      <div>
        <div className="document-card__meta">
          <span>{examTypeLabels[exam.examType]}</span>
          <span>{formatDate(exam.examDate)}</span>
        </div>
        <h3>{exam.name}</h3>
        <p>{exam.subjectName} - {exam.majorName}</p>
        {exam.location ? <span className="muted-text">{exam.location}</span> : null}
      </div>
    </article>
  );
}

function QuickReviewCard({ section, onSelectDocument }: { section: QuickReviewSection; onSelectDocument: (document: DocumentItem) => void }) {
  return (
    <article className="quick-review-card">
      <div className="quick-review-card__header">
        <Clock3 size={18} />
        <div>
          <strong>{section.exam.name}</strong>
          <span>{section.exam.subjectName} - {section.exam.daysUntil} ngay</span>
        </div>
      </div>
      <RecommendationList documents={section.documents} onSelectDocument={onSelectDocument} />
    </article>
  );
}

function SurvivalKitCard({ section, onSelectDocument }: { section: SurvivalKitSection; onSelectDocument: (document: DocumentItem) => void }) {
  return (
    <article className="quick-review-card">
      <div className="quick-review-card__header">
        <CheckCircle2 size={18} />
        <div>
          <strong>{section.subjectName}</strong>
          <span>{section.nextExam ? `${section.nextExam.daysUntil} ngay toi ${examTypeLabels[section.nextExam.examType]}` : section.majorName}</span>
        </div>
      </div>
      <RecommendationList documents={section.documents} onSelectDocument={onSelectDocument} />
    </article>
  );
}

function RecommendationList({
  documents,
  onSelectDocument
}: {
  documents: QuickReviewSection["documents"];
  onSelectDocument: (document: DocumentItem) => void;
}) {
  if (documents.length === 0) {
    return <p className="muted-text">Chua co tai lieu phu hop.</p>;
  }

  return (
    <div className="recommendation-list">
      {documents.map((item) => (
        <button className="recommendation-card" key={item.document.id} type="button" onClick={() => onSelectDocument(item.document)}>
          <div>
            <div className="document-card__meta">
              <VerificationBadge level={item.document.verification} size="sm" />
              <span>{item.document.type}</span>
              <span>{item.reason}</span>
            </div>
            <strong>{item.document.title}</strong>
          </div>
          <span className="recommendation-card__score">
            <Star size={14} /> {item.document.rating.toFixed(1)}
          </span>
        </button>
      ))}
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

function formatSubjectOption(subject: SubjectOption) {
  return `${subject.name} - ${subject.majorName}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatReminderDate(value: string | null) {
  if (!value) return "Chua co reminder";

  return `Reminder: ${formatDate(value)}`;
}
