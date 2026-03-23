"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function setLocale(nextLocale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="locale-toggle" aria-label="language switcher">
      <button
        type="button"
        className={`chip ${locale === "zh-CN" ? "selected" : ""}`}
        onClick={() => setLocale("zh-CN")}
      >
        中
      </button>
      <button
        type="button"
        className={`chip ${locale === "en" ? "selected" : ""}`}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
