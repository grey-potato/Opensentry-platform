import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleToggle } from "@/components/locale-toggle";
import { getRequestLocale } from "@/lib/locale-server";
import { getDictionary } from "@/lib/ui-copy";
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
  title: "OpenSentry 仓库视图 | OpenSentry Repository View",
  description: "Repository metadata and portrait visualization platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="bg-shape bg-shape-a" />
        <div className="bg-shape bg-shape-b" />
        <header className="topbar">
          <Link className="brand brand-link" href="/">
            <span className="brand-mark">OS</span>
            <div>
              <h1>{t.layout.title}</h1>
              <p>{t.layout.subtitle}</p>
            </div>
          </Link>
          <div className="topbar-actions">
            <form className="global-search" role="search" action="/search" method="get">
              <input
                name="q"
                type="search"
                placeholder={t.layout.searchPlaceholder}
                autoComplete="off"
              />
              <button type="submit">{t.layout.searchButton}</button>
            </form>
            <LocaleToggle locale={locale} />
          </div>
        </header>
        <main className="page-wrap">{children}</main>
      </body>
    </html>
  );
}
