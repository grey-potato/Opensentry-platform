import type { Metadata } from "next";
import Link from "next/link";
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
          <Link className="brand brand-link" href="/">
            <span className="brand-mark">OS</span>
            <div>
              <h1>OpenSentry Repo View</h1>
              <p>production frontend scaffold</p>
            </div>
          </Link>
          <form className="global-search" role="search" action="/search" method="get">
            <input
              name="q"
              type="search"
              placeholder="Search SHA / issue number / title / user"
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
        </header>
        <main className="page-wrap">{children}</main>
      </body>
    </html>
  );
}
