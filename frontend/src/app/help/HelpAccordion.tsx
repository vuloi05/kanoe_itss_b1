"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HelpAccordionProps {
  question: string;
  answer: string;
}

export default function HelpAccordion({
  question,
  answer,
}: HelpAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    updateHeight();

    // Recalculate on window resize for responsive layouts
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [updateHeight]);

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        isOpen
          ? "bg-surface-container-lowest border-primary/20 shadow-sm"
          : "bg-surface-container-lowest/50 border-surface-container-high hover:border-primary/10"
      }`}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm font-semibold transition-colors ${
            isOpen ? "text-primary" : "text-on-surface group-hover:text-primary"
          }`}
        >
          {question}
        </span>
        <span
          className={`material-symbols-outlined text-xl flex-shrink-0 transition-all duration-300 ${
            isOpen
              ? "rotate-180 text-primary"
              : "text-on-surface-variant group-hover:text-primary"
          }`}
        >
          expand_more
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? `${contentHeight}px` : "0px" }}
      >
        <div
          ref={contentRef}
          className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed prose-help"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      </div>
    </div>
  );
}
