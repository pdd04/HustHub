export type SortValue = "relevance" | "newest" | "popular" | "rating";

type SortSelectProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="sort-select">
      <span>Sắp xếp</span>
      <select value={value} onChange={(event) => onChange(event.target.value as SortValue)}>
        <option value="relevance">Liên quan nhất</option>
        <option value="newest">Mới nhất</option>
        <option value="popular">Tải nhiều</option>
        <option value="rating">Đánh giá cao</option>
      </select>
    </label>
  );
}
