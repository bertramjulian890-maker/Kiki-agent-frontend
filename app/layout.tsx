import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const myRetroSerif = localFont({
    src: "../public/fonts/MyRetroSerif-Regular.subset.woff2",
    variable: "--font-retro-serif",
    display: "swap",
    adjustFontFallback: false,
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
        // 🚀 必须在 html 标签加上 suppressHydrationWarning
        <html lang="zh-CN" className={`${myRetroSerif.variable} antialiased`} suppressHydrationWarning>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}