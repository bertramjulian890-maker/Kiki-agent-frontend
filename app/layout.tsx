import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const myRetroSerif = localFont({
    src: "../public/fonts/MyRetroSerif-Regular.otf",
    variable: "--font-retro-serif",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Kiki Agent",
    description: "Your digital companion",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN" className={`${myRetroSerif.variable} antialiased`}>
            <body>{children}</body>
        </html>
    );
}
