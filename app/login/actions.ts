"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    return { error: "서버에 APP_PASSWORD 환경변수가 설정되지 않았습니다." };
  }
  if (password !== expected) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}
