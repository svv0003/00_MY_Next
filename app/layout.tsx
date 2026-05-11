import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "00 My",
  description: "Personal mini tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
