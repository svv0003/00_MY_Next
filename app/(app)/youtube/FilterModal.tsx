"use client";

import type { Category } from "@/lib/supabase";
import styles from "./youtube.module.css";

type Props = {
  categories: Category[];
  filterCategoryIds: number[];
  columns: number;
  onToggle: (catId: number) => void;
  onSelectAll: () => void;
  onColumnsChange: (cols: number) => void;
  onClose: () => void;
};

export default function FilterModal({
  categories,
  filterCategoryIds,
  columns,
  onToggle,
  onSelectAll,
  onColumnsChange,
  onClose,
}: Props) {
  const allActive = filterCategoryIds.length === 0;
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.modalCloseX}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
        {/*<h2 className={styles.modalTitle}>필터</h2>*/}

        <label className={styles.modalLabel}>표시 방식</label>
        <div className={styles.filterRowModal}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.filterChip} ${columns === n ? styles.filterChipActive : ""}`}
              onClick={() => onColumnsChange(n)}
            >
              {n}열
            </button>
          ))}
        </div>
<div style={{ height: '20px'}}>

</div>
        <label className={styles.modalLabel}>카테고리</label>
        <div className={styles.filterRowModal}>
          <button
            type="button"
            className={`${styles.filterChip} ${allActive ? styles.filterChipActive : ""}`}
            onClick={onSelectAll}
          >
            모두
          </button>
          {categories.map((c) => (
            <button
              key={c.category_id}
              type="button"
              className={`${styles.filterChip} ${
                filterCategoryIds.includes(c.category_id)
                  ? styles.filterChipActive
                  : ""
              }`}
              onClick={() => onToggle(c.category_id)}
            >
              {c.category_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
