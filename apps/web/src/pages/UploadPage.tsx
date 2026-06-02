import type { AuthUser, DocumentItem, DocumentType, UploadOptionsResponse } from "@itss/shared";
import { ArrowLeft, FileUp, LogIn, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { documentTypeLabels } from "../data/documentMeta";
import { getUploadOptions, uploadDocument } from "../lib/api";

type UploadPageProps = {
  currentUser: AuthUser | null;
  accessToken: string | null;
  onBack: () => void;
  onLogin: () => void;
  onUploaded: (document: DocumentItem) => void;
};

const emptyOptions: UploadOptionsResponse = {
  majors: [],
  subjectsByMajor: {},
  documentTypes: [],
  years: []
};

export function UploadPage({ currentUser, accessToken, onBack, onLogin, onUploaded }: UploadPageProps) {
  const [options, setOptions] = useState<UploadOptionsResponse>(emptyOptions);
  const [isLoading, setIsLoading] = useState(Boolean(currentUser));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [majorId, setMajorId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("summary_note");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [termLabel, setTermLabel] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [examName, setExamName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [pages, setPages] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);

    getUploadOptions(controller.signal)
      .then((payload) => {
        setOptions(payload);
        const nextMajorId = payload.majors[0]?.id ?? "";
        const nextSubjectId = nextMajorId ? payload.subjectsByMajor[nextMajorId]?.[0]?.id ?? "" : "";
        const nextType = payload.documentTypes[0]?.id ?? "summary_note";
        const nextYear = payload.years.find((item) => item.id === String(new Date().getFullYear()))?.id ?? payload.years[0]?.id ?? "";

        setMajorId((current) => current || nextMajorId);
        setSubjectId((current) => current || nextSubjectId);
        setDocumentType(nextType);
        setYear(nextYear);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải dữ liệu upload.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [currentUser]);

  const subjectOptions = useMemo(() => (majorId ? options.subjectsByMajor[majorId] ?? [] : []), [majorId, options.subjectsByMajor]);

  const selectMajor = (value: string) => {
    setMajorId(value);
    setSubjectId(options.subjectsByMajor[value]?.[0]?.id ?? "");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || !currentUser) {
      onLogin();
      return;
    }

    if (!file) {
      setErrorMessage("Vui lòng chọn file tài liệu.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("majorId", majorId);
    formData.set("subjectId", subjectId);
    formData.set("documentType", documentType);
    formData.set("year", year);
    formData.set("termLabel", termLabel);
    formData.set("instructorName", instructorName);
    formData.set("examName", examName);
    formData.set("authorName", authorName);
    formData.set("pages", pages);
    formData.set("tags", tags);
    formData.set("file", file);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await uploadDocument(formData, accessToken);
      onUploaded(result.document);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể upload tài liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <UploadShell onBack={onBack}>
        <div className="status-panel">
          <h2>Cần đăng nhập</h2>
          <p>Sinh viên cần đăng nhập trước khi đóng góp tài liệu.</p>
          <div className="status-panel__actions">
            <button className="primary-button" type="button" onClick={onLogin}>
              <LogIn size={18} /> Đăng nhập
            </button>
          </div>
        </div>
      </UploadShell>
    );
  }

  return (
    <UploadShell onBack={onBack}>
      <section className="upload-panel">
        <div className="upload-heading">
          <div>
            <p className="eyebrow">Đóng góp tài liệu</p>
            <h1>Upload tài liệu mới</h1>
            <span>Tài liệu mới sẽ vào trạng thái chờ kiểm duyệt và gắn badge chưa xác thực.</span>
          </div>
          <div className="upload-icon">
            <FileUp size={32} />
          </div>
        </div>

        {isLoading ? <div className="inline-status">Đang tải danh mục học thuật...</div> : null}

        <form className="upload-form" onSubmit={submit}>
          <section className="form-section">
            <h2>Thông tin chính</h2>
            <div className="form-grid">
              <label className="field field--wide">
                <span>Tiêu đề</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
              </label>
              <label className="field field--wide">
                <span>Mô tả</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} rows={4} />
              </label>
              <label className="field">
                <span>Ngành học</span>
                <select value={majorId} onChange={(event) => selectMajor(event.target.value)} required>
                  {options.majors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Môn học</span>
                <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} required>
                  {subjectOptions.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Loại tài liệu</span>
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)} required>
                  {options.documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {documentTypeLabels[type.id]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Năm</span>
                <select value={year} onChange={(event) => setYear(event.target.value)} required>
                  {options.years.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>Metadata bổ sung</h2>
            <div className="form-grid">
              <label className="field">
                <span>Học kỳ</span>
                <input value={termLabel} onChange={(event) => setTermLabel(event.target.value)} placeholder="HK1 2025-2026" required />
              </label>
              <label className="field">
                <span>Giảng viên</span>
                <input value={instructorName} onChange={(event) => setInstructorName(event.target.value)} />
              </label>
              <label className="field">
                <span>Kỳ thi liên quan</span>
                <input value={examName} onChange={(event) => setExamName(event.target.value)} placeholder="Final, Midterm..." />
              </label>
              <label className="field">
                <span>Tác giả/nhóm biên soạn</span>
                <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder={currentUser.fullName} />
              </label>
              <label className="field">
                <span>Số trang</span>
                <input type="number" min={1} value={pages} onChange={(event) => setPages(event.target.value)} />
              </label>
              <label className="field">
                <span>Tags</span>
                <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="SQL, final, tóm tắt" required />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>File</h2>
            <label className="file-drop">
              <UploadCloud size={28} />
              <span>{file ? file.name : "Chọn PDF, DOC/DOCX, PPT/PPTX hoặc TXT"}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </label>
          </section>

          {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onBack}>
              Hủy
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting || isLoading}>
              <UploadCloud size={18} /> {isSubmitting ? "Đang upload..." : "Upload tài liệu"}
            </button>
          </div>
        </form>
      </section>
    </UploadShell>
  );
}

function UploadShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="detail-header">
        <div className="detail-header__inner">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </header>
      <main className="upload-layout">{children}</main>
    </div>
  );
}
