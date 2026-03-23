export type Locale = "zh-CN" | "en";

export const LOCALE_COOKIE = "opensentry-locale";

export function normalizeLocale(value?: string | null): Locale {
  return value === "en" ? "en" : "zh-CN";
}
