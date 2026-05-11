"use client";

import { useState } from "react";
import styles from "./lottery.module.css";

type LottoRow = {
  count: number;
  numbers: number[];
  highlightIdx: number;
};

function generateNumbers(): number[] {
  const set = new Set<number>();
  while (set.size < 6) {
    set.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export default function LotteryPage() {
  const [rows, setRows] = useState<LottoRow[]>([]);

  function handleCreate() {
    setRows((prev) => [
      ...prev,
      {
        count: prev.length + 1,
        numbers: generateNumbers(),
        highlightIdx: Math.floor(Math.random() * 6),
      },
    ]);
  }

  function handleDelete() {
    setRows([]);
  }

  return (
    <div className="main-container">
      <div className="title-container">
        <p className="words">Lottery Number Generator</p>
      </div>

      <div className={styles.searchContainer}>
        <button type="button" className={styles.createBtn} onClick={handleCreate}>
          Create
        </button>
        <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
          Delete
        </button>
      </div>

      <div className={styles.lotteryContainer}>
        <table className={styles.table}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.count}>
                <td className={styles.countCell}>{row.count}번</td>
                {row.numbers.map((num, idx) => (
                  <td
                    key={idx}
                    className={`${styles.numberCell} ${idx === row.highlightIdx ? styles.highlight : ""}`}
                  >
                    {num}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
