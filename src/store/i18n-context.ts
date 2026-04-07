import { createContext } from "react";

export interface I18nContextValue {
  lang: "en" | "ro" | "ru";
  setLang: (l: "en" | "ro" | "ru") => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
