"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/supabase";
import styles from "./youtube.module.css";

type Props = {
  categories: Category[];
  defaultCategoryName?: string;
  onConfirm: (categoryId: number) => Promise<void> | void;
  onCancel: () => void;
  onCreateCategory: (name: string) => Promise<Category>;
};

export default function CategoryModal({
  categories,
  defaultCategoryName = "노래",
  onConfirm,
  onCancel,
  onCreateCategory,
}: Props) {
  const findDefault = () =>
    categories.find((c) => c.category_name === defaultCategoryName)?.category_id ??
    null;

  const [selectedId, setSelectedId] = useState<number | null>(findDefault);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 목록이 외부에서 변경되었는데 아직 선택값이 없으면 기본값 시도
  useEffect(() => {
    if (selectedId == null) {
      const id = findDefault();
      if (id != null) setSelectedId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const created = await onCreateCategory(trimmed);
      setSelectedId(created.category_id); // 새로 만든 카테고리를 자동 선택
      setNewName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "카테고리 추가 실패");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (selectedId == null) {
      setError("카테고리를 선택하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>카테고리 선택</h2>

        {error && <p className={styles.modalError}>{error}</p>}

        {/*<label className={styles.modalLabel}>카테고리</label>*/}
        <select
          className={styles.categorySelect}
          value={selectedId ?? ""}
          onChange={(e) =>
            setSelectedId(e.target.value ? Number(e.target.value) : null)
          }
          disabled={busy}
        >
          {categories.length === 0 ? (
            <option value="">카테고리가 없습니다. 아래에서 추가하세요.</option>
          ) : (
            <>
              <option value="" disabled>
                선택하세요
              </option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </>
          )}
        </select>

        {/*<label className={styles.modalLabel}>새 카테고리 추가</label>*/}
        <div className={styles.categoryAddRow}>
          <input
            className={styles.categoryAddInput}
            type="text"
            placeholder="이름 입력"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            disabled={busy}
          />
          <button
            type="button"
            className={styles.categoryAddBtn}
            onClick={handleCreate}
            disabled={busy || !newName.trim()}
          >
            추가
          </button>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancel}
            onClick={onCancel}
            disabled={busy}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.modalConfirm}
            onClick={handleConfirm}
            disabled={busy || selectedId == null}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
