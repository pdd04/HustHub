import type { DocumentSort } from "@itss/shared";

type SortSelectProps = {
  value: DocumentSort;
  onChange: (value: DocumentSort) => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="sort-select">
      <span>Sắp xếp</span>
      <select value={value} onChange={(event) => onChange(event.target.value as DocumentSort)}>
        <option value="relevance">Liên quan nhất</option>
        <option value="newest">Mới nhất</option>
        <option value="popular">Tải nhiều</option>
        <option value="rating">Đánh giá cao</option>
      </select>
    </label>
  );
}
