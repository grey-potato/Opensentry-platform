import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenSentry Repo Platform",
  description: "Repository metadata and risk visualization platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="bg-shape bg-shape-a" />
        <div className="bg-shape bg-shape-b" />
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">OS</span>
            <div>
              <h1>OpenSentry Repo View</h1>
              <p>production frontend scaffold</p>
            </div>
          </div>
          <form className="global-search" role="search" action="/search" method="get">
            <input
              name="q"
              type="search"
              placeholder="搜索 SHA / #编号 / 标题关键词 / 用户名"
              autoComplete="off"
            />
            <button type="submit">搜索</button>
          </form>
        </header>
        <main className="page-wrap">{children}</main>
      </body>
    </html>
  );
}
