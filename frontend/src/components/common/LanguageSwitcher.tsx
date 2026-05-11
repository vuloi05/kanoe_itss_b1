"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === "vi" ? "ja" : "vi");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
      title="Toggle Language"
    >
      <span className="material-symbols-outlined text-[20px] text-primary">
        language
      </span>
      <span className="font-headline font-bold text-sm uppercase text-on-surface">
        {lang}
      </span>
    </button>
  );
}
