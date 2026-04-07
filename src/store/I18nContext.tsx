import React, { type ReactNode } from "react";
import { useState } from "react";
import { translations } from "./i18n-translations";
import { I18nContext } from "./i18n-context";

export type Language = "en" | "ro" | "ru";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    return (saved as Language) || "en";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("app_language", l);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
