import { useMemo, useState } from "react";
import { Bookmark, Filter, Search } from "lucide-react";
import { DocumentCard } from "../components/DocumentCard";
import { FilterSidebar } from "../components/FilterSidebar";
import { SortSelect, type SortValue } from "../components/SortSelect";
import { documents, type DocumentItem, type VerificationLevel } from "../data/mockDocuments";

type SearchPageProps = {
  onSelectDocument: (document: DocumentItem) => void;
};

export function SearchPage({ onSelectDocument }: SearchPageProps) {
  const [selectedField, setSelectedField] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedVerifications, setSelectedVerifications] = useState<VerificationLevel[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("relevance");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const documentTypes = useMemo(() => Array.from(new Set(documents.map((document) => document.type))), []);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return documents
      .filter((document) => {
        const matchesField = selectedField === "all" || document.field === selectedField;
        const matchesSubject = selectedSubject === null || document.subject === selectedSubject;
        const matchesVerification =
          selectedVerifications.length === 0 || selectedVerifications.includes(document.verification);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(document.type);
        const matchesSearch =
          normalizedQuery.length === 0 ||
          [document.title, document.author, document.subject, document.fieldName, document.description]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return matchesField && matchesSubject && matchesVerification && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.year - a.year;
        if (sortBy === "popular") return b.downloads - a.downloads;
        if (sortBy === "rating") return b.rating - a.rating;
        return verificationWeight(b.verification) - verificationWeight(a.verification) || b.rating - a.rating;
      });
  }, [searchQuery, selectedField, selectedSubject, selectedTypes, selectedVerifications, sortBy]);

  const activeFilterCount =
    (selectedField !== "all" ? 1 : 0) + (selectedSubject ? 1 : 0) + selectedVerifications.length + selectedTypes.length;

  const clearFilters = () => {
    setSelectedField("all");
    setSelectedSubject(null);
    setSelectedVerifications([]);
    setSelectedTypes([]);
  };

  const handleSelectField = (fieldId: string) => {
    setSelectedField(fieldId);
    setSelectedSubject(null);
  };

  const toggleVerification = (level: VerificationLevel) => {
    setSelectedVerifications((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  };

  const sidebar = (
    <FilterSidebar
      selectedField={selectedField}
      selectedSubject={selectedSubject}
      selectedVerifications={selectedVerifications}
      selectedTypes={selectedTypes}
      documentTypes={documentTypes}
      activeFilterCount={activeFilterCount}
      onSelectField={handleSelectField}
      onSelectSubject={setSelectedSubject}
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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <button className="ghost-button topbar__saved" type="button">
            <Bookmark size={16} /> Đã lưu
          </button>
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
              <span>{filteredDocuments.length} tài liệu phù hợp</span>
            </div>
            <div className="results-toolbar__actions">
              <button className="ghost-button mobile-filter-button" type="button" onClick={() => setShowMobileFilters(true)}>
                <Filter size={16} /> Lọc
              </button>
              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          <div className="document-list">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onClick={onSelectDocument} />
              ))
            ) : (
              <div className="empty-state">
                <h2>Không tìm thấy tài liệu phù hợp</h2>
                <p>Thử đổi từ khóa hoặc xóa bớt bộ lọc để mở rộng kết quả.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function verificationWeight(level: VerificationLevel) {
  return { gold: 4, silver: 3, bronze: 2, unverified: 1 }[level];
}
