import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="main-container">
      <div className={styles.functionContainer}>
        <Link href="/youtube" className={styles.linkBtn}>
          Free YouTube Premium
        </Link>
        <Link href="/lottery" className={styles.linkBtn}>
          Lottery Number Generator
        </Link>
      </div>
    </div>
  );
}
