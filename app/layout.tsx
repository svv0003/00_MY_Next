import type { Metadata, Viewport } from "next"; // Viewport 타입 추가
import "./globals.css";

export const metadata: Metadata = {
    title: "00 My",
    description: "Personal mini tools",
};

// 화면 확대 방지를 위한 viewport 설정 추가
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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