import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 자유 접근
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const authed = request.cookies.get(AUTH_COOKIE)?.value === "ok";
  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // _next 정적 파일, /img, /favicon, /next.svg 등은 매칭 제외
  matcher: ["/((?!_next/|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)"],
};
