import type { DocumentType, DocumentTypeFilterOption, FilterOption, VerificationLevel } from "@itss/shared";
import { Filter, X } from "lucide-react";
import { verificationLevelOrder, verificationLevels } from "../data/documentMeta";

type FilterSidebarProps = {
  majors: FilterOption[];
  subjectsByMajor: Record<string, FilterOption[]>;
  selectedMajorId: string;
  selectedSubjectId: string | null;
  selectedYear: number | null;
  selectedVerifications: VerificationLevel[];
  selectedTypes: DocumentType[];
  documentTypes: DocumentTypeFilterOption[];
  years: FilterOption[];
  activeFilterCount: number;
  onSelectMajor: (majorId: string) => void;
  onSelectSubject: (subjectId: string | null) => void;
  onSelectYear: (year: number | null) => void;
  onToggleVerification: (level: VerificationLevel) => void;
  onToggleType: (type: DocumentType) => void;
  onClearFilters: () => void;
  onClose?: () => void;
};

export function FilterSidebar({
  majors,
  subjectsByMajor,
  selectedMajorId,
  selectedSubjectId,
  selectedYear,
  selectedVerifications,
  selectedTypes,
  documentTypes,
  years,
  activeFilterCount,
  onSelectMajor,
  onSelectSubject,
  onSelectYear,
  onToggleVerification,
  onToggleType,
  onClearFilters,
  onClose
}: FilterSidebarProps) {
  const currentSubjects = selectedMajorId !== "all" ? subjectsByMajor[selectedMajorId] ?? [] : [];
  const totalDocuments = majors.reduce((total, major) => total + major.count, 0);

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <div>
          <Filter size={16} />
          <span>Bộ lọc</span>
        </div>
        {onClose ? (
          <button className="icon-button" type="button" onClick={onClose} aria-label="Đóng bộ lọc">
            <X size={18} />
          </button>
        ) : null}
      </div>

      {activeFilterCount > 0 ? (
        <button className="link-button" type="button" onClick={onClearFilters}>
          Xóa {activeFilterCount} bộ lọc
        </button>
      ) : null}

      <FilterGroup title="Ngành học">
        <button
          className={`filter-option ${selectedMajorId === "all" ? "is-active" : ""}`}
          type="button"
          onClick={() => onSelectMajor("all")}
        >
          <span>Tất cả</span>
          <span>{totalDocuments}</span>
        </button>
        {majors.map((major) => (
          <button
            key={major.id}
            className={`filter-option ${selectedMajorId === major.id ? "is-active" : ""}`}
            type="button"
            onClick={() => onSelectMajor(major.id)}
          >
            <span>{major.name}</span>
            <span>{major.count}</span>
          </button>
        ))}
      </FilterGroup>

      {currentSubjects.length > 0 ? (
        <FilterGroup title="Môn học">
          <button
            className={`filter-chip ${selectedSubjectId === null ? "is-active" : ""}`}
            type="button"
            onClick={() => onSelectSubject(null)}
          >
            Tất cả môn
          </button>
          {currentSubjects.map((subject) => (
            <button
              key={subject.id}
              className={`filter-chip ${selectedSubjectId === subject.id ? "is-active" : ""}`}
              type="button"
              onClick={() => onSelectSubject(subject.id)}
            >
              {subject.name}
            </button>
          ))}
        </FilterGroup>
      ) : null}

      {years.length > 0 ? (
        <FilterGroup title="Năm học">
          <button
            className={`filter-chip ${selectedYear === null ? "is-active" : ""}`}
            type="button"
            onClick={() => onSelectYear(null)}
          >
            Tất cả năm
          </button>
          {years.map((year) => (
            <button
              key={year.id}
              className={`filter-chip ${selectedYear === Number(year.id) ? "is-active" : ""}`}
              type="button"
              onClick={() => onSelectYear(Number(year.id))}
            >
              {year.name}
            </button>
          ))}
        </FilterGroup>
      ) : null}

      <FilterGroup title="Mức xác thực">
        {verificationLevelOrder.map((level) => (
          <label key={level} className="checkbox-row">
            <input
              type="checkbox"
              checked={selectedVerifications.includes(level)}
              onChange={() => onToggleVerification(level)}
            />
            <span style={{ color: verificationLevels[level].color }}>{verificationLevels[level].label}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Loại tài liệu">
        {documentTypes.map((type) => (
          <label key={type.id} className="checkbox-row">
            <input type="checkbox" checked={selectedTypes.includes(type.id)} onChange={() => onToggleType(type.id)} />
            <span>
              {type.name} <small>({type.count})</small>
            </span>
          </label>
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="filter-group">
      <h3>{title}</h3>
      <div className="filter-group__body">{children}</div>
    </section>
  );
}
