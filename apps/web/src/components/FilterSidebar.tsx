import { Filter, X } from "lucide-react";
import {
  fields,
  subjectsByField,
  verificationLevels,
  type FieldItem,
  type VerificationLevel
} from "../data/mockDocuments";

type FilterSidebarProps = {
  selectedField: string;
  selectedSubject: string | null;
  selectedVerifications: VerificationLevel[];
  selectedTypes: string[];
  documentTypes: string[];
  activeFilterCount: number;
  onSelectField: (fieldId: string) => void;
  onSelectSubject: (subject: string | null) => void;
  onToggleVerification: (level: VerificationLevel) => void;
  onToggleType: (type: string) => void;
  onClearFilters: () => void;
  onClose?: () => void;
};

export function FilterSidebar({
  selectedField,
  selectedSubject,
  selectedVerifications,
  selectedTypes,
  documentTypes,
  activeFilterCount,
  onSelectField,
  onSelectSubject,
  onToggleVerification,
  onToggleType,
  onClearFilters,
  onClose
}: FilterSidebarProps) {
  const currentSubjects = selectedField !== "all" ? subjectsByField[selectedField] ?? [] : [];

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
        {fields.map((field: FieldItem) => (
          <button
            key={field.id}
            className={`filter-option ${selectedField === field.id ? "is-active" : ""}`}
            type="button"
            onClick={() => onSelectField(field.id)}
          >
            <span>{field.name}</span>
            <span>{field.count}</span>
          </button>
        ))}
      </FilterGroup>

      {currentSubjects.length > 0 ? (
        <FilterGroup title="Môn học">
          <button
            className={`filter-chip ${selectedSubject === null ? "is-active" : ""}`}
            type="button"
            onClick={() => onSelectSubject(null)}
          >
            Tất cả môn
          </button>
          {currentSubjects.map((subject) => (
            <button
              key={subject}
              className={`filter-chip ${selectedSubject === subject ? "is-active" : ""}`}
              type="button"
              onClick={() => onSelectSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </FilterGroup>
      ) : null}

      <FilterGroup title="Mức xác thực">
        {(Object.keys(verificationLevels) as VerificationLevel[]).map((level) => (
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
          <label key={type} className="checkbox-row">
            <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => onToggleType(type)} />
            <span>{type}</span>
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
