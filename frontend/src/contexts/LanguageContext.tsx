"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "ja";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: {
    (viText: string, jaText: string): string;
    (viText: React.ReactNode, jaText: React.ReactNode): React.ReactNode;
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      const savedLang = localStorage.getItem("app_lang") as Language;
      if (savedLang === "vi" || savedLang === "ja") {
        setLangState(savedLang);
      }
    });
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
  };

  const t = ((viText: React.ReactNode, jaText: React.ReactNode): React.ReactNode => {
    // Avoid hydration mismatch by always returning vi on first server render
    if (!mounted) return viText;
    return lang === "vi" ? viText : jaText;
  }) as LanguageContextType["t"];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
