import type {
  AuthUser,
  DocumentItem,
  DocumentListResponse,
  DocumentSort,
  DocumentType,
  VerificationLevel
} from "@itss/shared";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, LogIn, LogOut, Search, ShieldCheck, UploadCloud, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DocumentCard } from "../components/DocumentCard";
import { FilterSidebar } from "../components/FilterSidebar";
import { SortSelect } from "../components/SortSelect";
import { isDocumentSort, isDocumentType, isVerificationLevel } from "../data/documentMeta";
import { getDocuments } from "../lib/api";

const pageSize = 6;

const emptyResult: DocumentListResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  },
  facets: {
    majors: [],
    subjectsByMajor: {},
    documentTypes: [],
    years: []
  }
};

type SearchPageProps = {
  currentUser: AuthUser | null;
  isAuthLoading: boolean;
  onSelectDocument: (document: DocumentItem) => void;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateUpload: () => void;
  onNavigateReview: () => void;
  onNavigateExamMode: () => void;
  onLogout: () => void;
};

type QueryState = {
  q: string;
  majorId: string;
  subjectId: string | null;
  year: number | null;
  verificationLevels: VerificationLevel[];
  types: DocumentType[];
  sort: DocumentSort;
  page: number;
};

export function SearchPage({
  currentUser,
  isAuthLoading,
  onSelectDocument,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateUpload,
  onNavigateReview,
  onNavigateExamMode,
  onLogout
}: SearchPageProps) {
  const [queryState, setQueryState] = useState<QueryState>(() => readQueryStateFromUrl());
  const [result, setResult] = useState<DocumentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const handlePopState = () => setQueryState(readQueryStateFromUrl());

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const searchParams = buildUrlSearchParams(queryState);
    const queryString = searchParams.toString();
    const path = window.location.pathname === "/" ? "/documents" : window.location.pathname;

    window.history.replaceState(null, "", `${path}${queryString ? `?${queryString}` : ""}`);
    setIsLoading(true);
    setErrorMessage(null);

    getDocuments(
      {
        q: queryState.q,
        majorId: queryState.majorId,
        subjectId: queryState.subjectId,
        year: queryState.year,
        verificationLevels: queryState.verificationLevels,
        types: queryState.types,
        sort: queryState.sort,
        page: queryState.page,
        limit: pageSize
      },
      controller.signal
    )
      .then((payload) => setResult(payload))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách tài liệu.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [queryState]);

  const currentResult = result ?? emptyResult;
  const activeFilterCount =
    (queryState.majorId !== "all" ? 1 : 0) +
    (queryState.subjectId ? 1 : 0) +
    (queryState.year ? 1 : 0) +
    queryState.verificationLevels.length +
    queryState.types.length;

  const resultsLabel = useMemo(() => {
    if (isLoading && !result) return "Đang tải tài liệu...";
    if (errorMessage) return "Không thể tải kết quả";

    return `${currentResult.pagination.total.toLocaleString("vi-VN")} tài liệu phù hợp`;
  }, [currentResult.pagination.total, errorMessage, isLoading, result]);

  const updateQuery = (patch: Partial<QueryState>, resetPage = true) => {
    setQueryState((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page
    }));
  };

  const clearFilters = () => {
    updateQuery({
      majorId: "all",
      subjectId: null,
      year: null,
      verificationLevels: [],
      types: []
    });
  };

  const handleSelectMajor = (majorId: string) => {
    updateQuery({
      majorId,
      subjectId: null
    });
  };

  const toggleVerification = (level: VerificationLevel) => {
    updateQuery({
      verificationLevels: toggleArrayItem(queryState.verificationLevels, level)
    });
  };

  const toggleType = (type: DocumentType) => {
    updateQuery({
      types: toggleArrayItem(queryState.types, type)
    });
  };

  const retry = () => {
    setQueryState((current) => ({ ...current }));
  };

  const sidebar = (
    <FilterSidebar
      majors={currentResult.facets.majors}
      subjectsByMajor={currentResult.facets.subjectsByMajor}
      selectedMajorId={queryState.majorId}
      selectedSubjectId={queryState.subjectId}
      selectedYear={queryState.year}
      selectedVerifications={queryState.verificationLevels}
      selectedTypes={queryState.types}
      documentTypes={currentResult.facets.documentTypes}
      years={currentResult.facets.years}
      activeFilterCount={activeFilterCount}
      onSelectMajor={handleSelectMajor}
      onSelectSubject={(subjectId) => updateQuery({ subjectId })}
      onSelectYear={(year) => updateQuery({ year })}
      onToggleVerification={toggleVerification}
      onToggleType={toggleType}
      onClearFilters={clearFilters}
      onClose={showMobileFilters ? () => setShowMobileFilters(false) : undefined}
    />
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand" aria-label="Veritas">
            <div className="brand__mark">V</div>
            <div>
              <strong>Veritas</strong>
              <span>Thư viện học thuật</span>
            </div>
          </div>

          <label className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Tìm kiếm tài liệu, tác giả, chủ đề..."
              value={queryState.q}
              onChange={(event) => updateQuery({ q: event.target.value })}
            />
          </label>

          <div className="topbar__actions">
            {isAuthLoading ? <span className="auth-chip">Đang kiểm tra...</span> : null}
            {!isAuthLoading && currentUser ? (
              <>
                <span className="auth-chip">{currentUser.fullName}</span>
                {currentUser.role === "reviewer" || currentUser.role === "admin" ? (
                  <button className="ghost-button" type="button" onClick={onNavigateReview}>
                    <ShieldCheck size={16} /> Review
                  </button>
                ) : null}
                <button className="ghost-button" type="button" onClick={onNavigateExamMode}>
                  <CalendarDays size={16} /> Exam mode
                </button>
                <button className="primary-button" type="button" onClick={onNavigateUpload}>
                  <UploadCloud size={16} /> Upload
                </button>
                <button className="ghost-button" type="button" onClick={onLogout}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : null}
            {!isAuthLoading && !currentUser ? (
              <>
                <button className="ghost-button" type="button" onClick={onNavigateLogin}>
                  <LogIn size={16} /> Đăng nhập
                </button>
                <button className="primary-button" type="button" onClick={onNavigateRegister}>
                  <UserPlus size={16} /> Đăng ký
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="search-layout">
        <div className="desktop-only">{sidebar}</div>
        {showMobileFilters ? <div className="filter-drawer">{sidebar}</div> : null}

        <section className="results-panel">
          <div className="results-toolbar">
            <div>
              <p className="eyebrow">Kho tài liệu học tập</p>
              <h1>Tìm tài liệu đáng tin cậy</h1>
              <span>{resultsLabel}</span>
            </div>
            <div className="results-toolbar__actions">
              <button className="ghost-button mobile-filter-button" type="button" onClick={() => setShowMobileFilters(true)}>
                <Filter size={16} /> Lọc
              </button>
              <SortSelect value={queryState.sort} onChange={(sort) => updateQuery({ sort })} />
            </div>
          </div>

          {isLoading && !result ? (
            <StatusPanel title="Đang tải tài liệu" description="Hệ thống đang lấy dữ liệu từ API." />
          ) : null}

          {errorMessage ? (
            <StatusPanel title="Không thể tải tài liệu" description={errorMessage}>
              <button className="secondary-button" type="button" onClick={retry}>
                Thử lại
              </button>
            </StatusPanel>
          ) : null}

          {!errorMessage && currentResult.items.length > 0 ? (
            <>
              {isLoading ? <div className="inline-status">Đang cập nhật kết quả...</div> : null}
              <div className="document-list">
                {currentResult.items.map((document) => (
                  <DocumentCard key={document.id} document={document} onClick={onSelectDocument} />
                ))}
              </div>
              <Pagination
                page={currentResult.pagination.page}
                totalPages={currentResult.pagination.totalPages}
                isLoading={isLoading}
                onPageChange={(page) => updateQuery({ page }, false)}
              />
            </>
          ) : null}

          {!isLoading && !errorMessage && currentResult.items.length === 0 ? (
            <div className="empty-state">
              <h2>Không tìm thấy tài liệu phù hợp</h2>
              <p>Thử đổi từ khóa hoặc xóa bớt bộ lọc để mở rộng kết quả.</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  isLoading,
  onPageChange
}: {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang tài liệu">
      <button className="ghost-button" type="button" disabled={page <= 1 || isLoading} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} /> Trước
      </button>
      <span>
        Trang {page} / {totalPages}
      </span>
      <button
        className="ghost-button"
        type="button"
        disabled={page >= totalPages || isLoading}
        onClick={() => onPageChange(page + 1)}
      >
        Sau <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function StatusPanel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="status-panel">
      <h2>{title}</h2>
      <p>{description}</p>
      {children ? <div className="status-panel__actions">{children}</div> : null}
    </div>
  );
}

function readQueryStateFromUrl(): QueryState {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") ?? "relevance";
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const year = Number.parseInt(params.get("year") ?? "", 10);

  return {
    q: params.get("q") ?? "",
    majorId: params.get("majorId") ?? "all",
    subjectId: params.get("subjectId"),
    year: Number.isFinite(year) ? year : null,
    verificationLevels: readListParam(params, "verificationLevel", isVerificationLevel),
    types: readListParam(params, "type", isDocumentType),
    sort: isDocumentSort(sort) ? sort : "relevance",
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

function buildUrlSearchParams(queryState: QueryState) {
  const params = new URLSearchParams();

  if (queryState.q.trim()) params.set("q", queryState.q.trim());
  if (queryState.majorId !== "all") params.set("majorId", queryState.majorId);
  if (queryState.subjectId) params.set("subjectId", queryState.subjectId);
  if (queryState.year) params.set("year", String(queryState.year));
  if (queryState.verificationLevels.length > 0) params.set("verificationLevel", queryState.verificationLevels.join(","));
  if (queryState.types.length > 0) params.set("type", queryState.types.join(","));
  if (queryState.sort !== "relevance") params.set("sort", queryState.sort);
  if (queryState.page > 1) params.set("page", String(queryState.page));

  return params;
}

function readListParam<T extends string>(params: URLSearchParams, name: string, guard: (value: string) => value is T) {
  const rawValue = params.get(name);

  if (!rawValue) return [];

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(guard);
}

function toggleArrayItem<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item];
}
