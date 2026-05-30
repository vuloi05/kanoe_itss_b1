/**
 * Inline SVG icon strings for use inside dangerouslySetInnerHTML content.
 * Each function returns an SVG element as a string, styled with inline CSS
 * for consistent alignment with surrounding text.
 *
 * Shared base: w-5 h-5, inline-block, vertical-align middle, margin-right 6px
 */

const BASE_STYLE =
  'style="width:1.25rem;height:1.25rem;display:inline-block;vertical-align:middle;margin-right:0.375rem;flex-shrink:0"';

function wrapSvg(color: string, paths: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${BASE_STYLE}>${paths}</svg>`;
}

// --- Voice Lab icons ---

export const iconSmile = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'
  );

export const iconTone = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
  );

export const iconFluency = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'
  );

export const iconIntonation = (color = "var(--tertiary)") =>
  wrapSvg(
    color,
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>'
  );

export const iconTip = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>'
  );

// --- Learning path icons ---

export const iconBook = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
  );

export const iconThinking = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  );

export const iconCheckCircle = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
  );

export const iconChart = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
  );

export const iconPin = (color = "var(--error)") =>
  wrapSvg(
    color,
    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
  );

export const iconCelebrate = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a1 1 0 0 0-.64.64L18.38 5.6a1 1 0 0 1-.64.64L15.5 7a1 1 0 0 0-.64.64l-.75 2.24"/><path d="M8.5 13.5 5 16"/><path d="M14 17.85a4 4 0 0 0-5.7-5.7"/>'
  );

// --- Account & Technical icons ---

export const iconKey = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>'
  );

export const iconUser = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
  );

export const iconMail = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
  );

export const iconVolume = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>'
  );

export const iconGlobe = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
  );

export const iconTrash = (color = "var(--tertiary)") =>
  wrapSvg(
    color,
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
  );

export const iconRefresh = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'
  );

export const iconSmartphone = (color = "var(--tertiary)") =>
  wrapSvg(
    color,
    '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'
  );

// --- Contact icons ---

export const iconChat = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  );

export const iconClock = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
  );

export const iconStar = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  );

export const iconLightbulb = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>'
  );

export const iconIntonationTarget = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'
  );

export const iconWave = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M7 11V4a2 2 0 1 1 4 0v3"/><path d="M11 7V3a2 2 0 1 1 4 0v4"/><path d="M15 6V4a2 2 0 1 1 4 0v7"/><path d="M19 11a7 7 0 0 1-7 7H9a5 5 0 0 1-5-5V9a2 2 0 1 1 4 0v2"/>'
  );

export const iconHeart = (color = "var(--error)") =>
  wrapSvg(
    color,
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
  );

export const iconSparkles = (color = "var(--primary)") =>
  wrapSvg(
    color,
    '<path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>'
  );

export const iconLock = (color = "var(--secondary)") =>
  wrapSvg(
    color,
    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
  );

export const iconFlag = (color = "var(--error)") =>
  wrapSvg(
    color,
    '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'
  );