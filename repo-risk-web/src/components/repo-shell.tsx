"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/ui-copy";

const EXPANDED_WIDTH = 320;
const COLLAPSED_WIDTH = 56;
const SIDEBAR_GAP = 16;
const DEFAULT_TOPBAR_HEIGHT = 76;

export function RepoShell({
  children,
  repoId,
  locale,
}: {
  children: ReactNode;
  repoId: string;
  locale: Locale;
}) {
  const [expanded, setExpanded] = useState(true);
  const [topbarHeight, setTopbarHeight] = useState(DEFAULT_TOPBAR_HEIGHT);
  const activeSegment = useSelectedLayoutSegment() ?? "overview";
  const t = getDictionary(locale);
  const navItems = useMemo(
    () =>
      [
        ["overview", t.tabs.overview],
        ["commits", t.tabs.commits],
        ["issues", t.tabs.issues],
        ["prs", t.tabs.prs],
        ["users", t.tabs.users],
        ["risk", t.tabs.risk],
      ] as const,
    [t]
  );

  useEffect(() => {
    const topbar = document.querySelector<HTMLElement>(".topbar");
    if (!topbar) {
      return;
    }

    const updateHeight = () => {
      setTopbarHeight(Math.ceil(topbar.getBoundingClientRect().height));
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(topbar);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const sidebarWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const sidebarTop = topbarHeight + SIDEBAR_GAP;

  return (
    <div className="relative">
      <div className="mb-4 rounded-[8px] border border-[#d5dde5] bg-white lg:hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[#d5dde5] px-4 py-4">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#5d6d7e]">
            {locale === "en" ? "Repository Navigation" : "仓库导航"}
          </div>
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? locale === "en"
                  ? "Collapse navigation"
                  : "收起导航"
                : locale === "en"
                  ? "Expand navigation"
                  : "展开导航"
            }
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-[8px] border border-[#bdc3c7] bg-[#3498db] px-3 text-sm font-black text-white transition-colors duration-150 hover:bg-[#2980b9]"
          >
            {expanded ? "←" : "→"}
          </button>
        </div>
        {expanded ? (
          <nav
            className="grid gap-2 p-4"
            aria-label={locale === "en" ? "Repository views" : "仓库视图"}
          >
            {navItems.map(([segment, label]) => {
              const active = segment === activeSegment;
              return (
                <Link
                  key={segment}
                  href={`/repo/${repoId}/${segment}`}
                  className={`inline-flex min-h-12 items-center rounded-[8px] border px-4 py-3 text-base font-semibold transition-colors duration-150 ${
                    active
                      ? "border-[#3498db] bg-[#3498db] text-white"
                      : "border-[#d5dde5] bg-white text-[#34495e] hover:border-[#3498db] hover:bg-[#eef6fc]"
                  }`}
                >
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>

      <aside
        className="fixed left-0 z-10 hidden overflow-hidden border-r border-t border-b border-[#d5dde5] bg-white shadow-none transition-[width] duration-200 lg:block"
        style={{
          top: `${sidebarTop}px`,
          height: `calc(100vh - ${sidebarTop}px)`,
          width: `${sidebarWidth}px`,
          borderLeft: "none",
          borderTopRightRadius: "12px",
          borderBottomRightRadius: "12px",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[#d5dde5] px-4 py-4">
            {expanded ? (
              <div className="min-w-0 text-xs font-black uppercase tracking-[0.14em] text-[#5d6d7e]">
                {locale === "en" ? "Repository Navigation" : "仓库导航"}
              </div>
            ) : (
              <div className="flex-1 text-center text-xs font-black uppercase tracking-[0.14em] text-[#5d6d7e]">
                {locale === "en" ? "Nav" : "导航"}
              </div>
            )}
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? locale === "en"
                    ? "Collapse sidebar"
                    : "收起侧边栏"
                  : locale === "en"
                    ? "Expand sidebar"
                    : "展开侧边栏"
              }
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-[8px] border border-[#bdc3c7] bg-[#3498db] px-3 text-sm font-black text-white transition-colors duration-150 hover:bg-[#2980b9]"
            >
              {expanded ? "←" : "→"}
            </button>
          </div>

          {expanded ? (
            <nav
              className="flex-1 overflow-y-auto p-4"
              aria-label={locale === "en" ? "Repository views" : "仓库视图"}
            >
              <div className="grid gap-2">
                {navItems.map(([segment, label]) => {
                  const active = segment === activeSegment;
                  return (
                    <Link
                      key={segment}
                      href={`/repo/${repoId}/${segment}`}
                      className={`inline-flex min-h-12 items-center rounded-[8px] border px-4 py-3 text-base font-semibold transition-colors duration-150 ${
                        active
                          ? "border-[#3498db] bg-[#3498db] text-white"
                          : "border-[#d5dde5] bg-white text-[#34495e] hover:border-[#3498db] hover:bg-[#eef6fc]"
                      }`}
                    >
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          ) : (
            <div className="flex flex-1 items-start justify-center p-3">
              <div className="flex min-h-28 w-full items-center justify-center rounded-[8px] border border-[#d5dde5] bg-[#ecf0f1] px-2 text-center text-xl font-black text-[#34495e]">
                {locale === "en" ? (
                  "Nav"
                ) : (
                  <span className="flex flex-col leading-tight">
                    <span>导</span>
                    <span>航</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`min-w-0 transition-[margin] duration-200 ${
          expanded ? "lg:ml-[336px]" : "lg:ml-[72px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
