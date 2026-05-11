"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./sidebar.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  const [serviceOpen, setServiceOpen] = useState(false);

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={onClose}
      />
      <aside
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/" className={styles.item} onClick={onClose}>
            Home
          </Link>

          <button
            type="button"
            className={`${styles.item} ${styles.toggleItem}`}
            onClick={() => setServiceOpen((v) => !v)}
            aria-expanded={serviceOpen}
          >
            <span>Service</span>
            <span className={`${styles.chevron} ${serviceOpen ? styles.chevronOpen : ""}`}>
              ▾
            </span>
          </button>

          <div
            className={`${styles.subItems} ${serviceOpen ? styles.subItemsOpen : ""}`}
          >
            <Link href="/youtube" className={styles.subItem} onClick={onClose}>
              YouTube
            </Link>
            <Link href="/lottery" className={styles.subItem} onClick={onClose}>
              Lottery
            </Link>
          </div>

          <Link href="/setting" className={styles.item} onClick={onClose}>
            Setting
          </Link>
        </nav>
      </aside>
    </>
  );
}
