import { logoutAction } from "../../login/actions";
import styles from "./setting.module.css";

export default function SettingPage() {
  return (
    <div className="main-container">
      <div className="title-container">
        <p className="words">Setting</p>
      </div>

      <div className={styles.section}>
        <form action={logoutAction}>
          <button type="submit" className={styles.logoutBtn}>
            로그아웃
          </button>
        </form>
      </div>
    </div>
  );
}
