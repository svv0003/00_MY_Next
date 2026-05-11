"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import styles from "./login.module.css";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className={styles.wrap}>
      <form className={styles.card} action={formAction}>
        <h1 className={styles.title}>로그인</h1>
        {state?.error && <p className={styles.error}>{state.error}</p>}
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="비밀번호"
          autoComplete="current-password"
          autoFocus
          required
        />
        <button className={styles.button} type="submit" disabled={pending}>
          {pending ? "확인 중…" : "들어가기"}
        </button>
      </form>
    </div>
  );
}
