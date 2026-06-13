"use client";
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";

// SSR-safe dynamic import: react-confetti requires window dimensions
// and Canvas API which are unavailable during server-side rendering.
// Using `ssr: false` prevents hydration mismatch errors in Next.js.
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });
import { useLanguage } from "@/contexts/LanguageContext";
import { lessonApi, ttsApi, voiceLabApi, userApi, vocabApi, type LessonDetailDto, type DialogueDto } from "@/lib/api";
import { useAuth } from "@/lib/auth";
// Hàm chuyển đổi audio chunks (webm/opus) → WAV (PCM, 16kHz, Mono)
// để tối ưu cho FPT.AI ASR API — xem chi tiết lý do kỹ thuật trong audio-utils.ts
import { exportToWav } from "@/lib/audio-utils";
import { useStudyTimeTracker } from "@/hooks/useStudyTimeTracker";

type WordMark = "none" | "omission" | "mispronunciation";
type EvaluatedWord = {
  word: string;
  mark: WordMark;
};
type AssessmentView = {
  words: EvaluatedWord[];
  insertionsBeforeWord: number[];
};

function mapAssessmentFromBackend(
  assessmentWords: { word: string; errorType: string }[],
  referenceWords: string[]
): AssessmentView {
  const words: EvaluatedWord[] = referenceWords.map((word) => ({ word, mark: "none" }));
  const insertionsBeforeWord = new Array(referenceWords.length + 1).fill(0);

  let referenceIndex = 0;

  for (const aw of assessmentWords) {
    const errorType = aw.errorType.toLowerCase();

    if (errorType === "insertion") {
      insertionsBeforeWord[Math.min(referenceIndex, referenceWords.length)] += 1;
      continue;
    }

    if (referenceIndex >= referenceWords.length) continue;

    const spokenWord = aw.word.toLowerCase().replace(/[.,!?;:"'“”‘’]/g, "");
    let matchedIndex = -1;

    for (let index = referenceIndex; index < referenceWords.length; index += 1) {
      if (referenceWords[index].toLowerCase().replace(/[.,!?;:"'“”‘’]/g, "") === spokenWord) {
        matchedIndex = index;
        break;
      }
    }

    if (matchedIndex === -1) {
      if (errorType === "omission") words[referenceIndex].mark = "omission";
      else if (errorType === "mispronunciation") words[referenceIndex].mark = "mispronunciation";
      referenceIndex += 1;
      continue;
    }

    for (let index = referenceIndex; index < matchedIndex; index += 1) {
      words[index].mark = "omission";
    }

    if (errorType === "omission") words[matchedIndex].mark = "omission";
    else if (errorType === "mispronunciation") words[matchedIndex].mark = "mispronunciation";

    referenceIndex = matchedIndex + 1;
  }

  return { words, insertionsBeforeWord };
}

// Encouraging pass thresholds for Japanese learners studying Vietnamese pronunciation.
// Completeness is strict (must read all words), but accuracy is lenient to avoid discouragement.
const PASS_COMPLETENESS = 80;
const PASS_ACCURACY = 60;

import { type TtsResponse } from "@/lib/api";

// In-memory cache to avoid redundant API calls for the same text
const ttsCache = new Map<string, TtsResponse>();

// Parsed highlight data from JSON string
interface HighlightWord {
  index: number;
  color: string;
}

// Word timestamp for precise karaoke-style highlighting
interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

/**
 * Estimate word-level timestamps based on syllable count.
 * Vietnamese TTS typically speaks at ~4-5 syllables/second.
 * This gives much better accuracy than uniform distribution.
 */
function estimateWordTimestamps(words: string[], totalDuration: number): WordTimestamp[] {
  if (words.length === 0) return [];

  const countSyllables = (word: string): number => {
    const cleaned = word.toLowerCase().replace(/[.,!?;:]/g, "");
    const vowels = cleaned.match(/[aăâeêioôơuưy]+/g);
    return vowels ? vowels.length : 1;
  };

  const getPauseAfterWord = (word: string): number => {
    if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) return 0.8;
    if (word.endsWith(",") || word.endsWith(";") || word.endsWith(":")) return 0.4;
    return 0;
  };

  const syllableCounts = words.map(countSyllables);
  const totalSyllables = syllableCounts.reduce((sum, c) => sum + c, 0);

  const pauses = words.map(getPauseAfterWord);
  const totalIdealPauseTime = pauses.reduce((sum, p) => sum + p, 0);

  // Ensure pauses don't consume all duration (max 40% of duration can be pauses)
  const maxPauseTime = totalDuration * 0.4;
  const pauseScale = totalIdealPauseTime > maxPauseTime ? maxPauseTime / totalIdealPauseTime : 1;

  const actualTotalPauseTime = totalIdealPauseTime * pauseScale;
  const totalSpeakingTime = totalDuration - actualTotalPauseTime;

  const timestamps: WordTimestamp[] = [];
  let currentTime = 0;

  for (let i = 0; i < words.length; i++) {
    const syllableRatio = syllableCounts[i] / totalSyllables;
    const wordDuration = totalSpeakingTime * syllableRatio;

    timestamps.push({
      word: words[i],
      start: currentTime,
      end: currentTime + wordDuration,
    });

    currentTime += wordDuration + (pauses[i] * pauseScale);
  }

  return timestamps;
}

function parseHighlightWords(json: string | null): HighlightWord[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

// ─── TTS Shadowing Hook ────────────────────────────────────────────────────────
// Uses Web Audio API for sample-accurate timing + requestAnimationFrame for smooth UI updates.
// Eliminates decode latency and provides microsecond-precision playback tracking.

function useTTSShadowing(text: string, playbackRate: number = 1.0, voice: string = "banmai", onEnded?: () => void) {
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Web Audio API refs for sample-accurate playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  // Word timestamps for syllable-weighted highlight sync (Tier 3)
  const wordTimestampsRef = useRef<WordTimestamp[]>([]);

  const rafRef = useRef<number | null>(null);
  const lastWordIdxRef = useRef<number>(-1);
  const onEndedRef = useRef(onEnded);
  const playbackRateRef = useRef(playbackRate);

  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (sourceNodeRef.current) {
      sourceNodeRef.current.playbackRate.value = playbackRate;
    }
  }, [playbackRate]);

  const words = text.split(/\s+/);
  const wordCountRef = useRef(words.length);
  useEffect(() => { wordCountRef.current = words.length; }, [words.length]);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopSource = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, []);

  // rAF loop: reads AudioContext.currentTime (sample-accurate, no decode lag)
  // instead of HTMLAudioElement.currentTime which has ~50-100ms decode latency.
  // Uses syllable-weighted timestamps (Tier 3) for precise per-word sync.
  const startTrackingLoop = useCallback(() => {
    const tick = () => {
      const ctx = audioContextRef.current;
      if (!ctx || !sourceNodeRef.current) return;

      const elapsed = (ctx.currentTime - startTimeRef.current) * playbackRateRef.current;
      const duration = durationRef.current;

      if (elapsed >= duration) return;

      const timestamps = wordTimestampsRef.current;
      let newIdx: number;

      if (timestamps.length > 0) {
        // Binary search for current word by elapsed time
        let lo = 0, hi = timestamps.length - 1;
        newIdx = -1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (elapsed < timestamps[mid].start) {
            hi = mid - 1;
          } else if (elapsed >= timestamps[mid].end) {
            lo = mid + 1;
          } else {
            newIdx = mid;
            break;
          }
        }

        // If elapsed falls in a gap between words, 'break' is not called.
        // 'hi' will point to the index of the word that just finished.
        // We hold the highlight on that word during the pause.
        if (newIdx === -1) {
          newIdx = hi >= 0 ? hi : -1;
        }

        if (elapsed >= timestamps[timestamps.length - 1].end) {
          newIdx = timestamps.length - 1;
        }
      } else {
        // Fallback: uniform distribution
        const wordCount = wordCountRef.current;
        const segmentDuration = duration / wordCount;
        newIdx = Math.floor(elapsed / segmentDuration);
        if (newIdx >= wordCount) newIdx = wordCount - 1;
        if (newIdx < 0) newIdx = 0;
      }

      if (newIdx !== lastWordIdxRef.current) {
        lastWordIdxRef.current = newIdx;
        setActiveWordIdx(newIdx);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Preload: fetch + decode audio into AudioBuffer as soon as component mounts.
  // This eliminates the fetch + decode latency on first click entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const preload = async () => {
      const cacheKey = `${voice}_${text}`;
      if (ttsCache.get(cacheKey)) return; // URL already cached, skip

      try {
        const result = await ttsApi.synthesize(text, voice);
        if (!cancelled) ttsCache.set(cacheKey, result);
      } catch {
        // Preload failure is silent — play() will retry on demand
      }
    };

    preload();
    return () => { cancelled = true; };
  }, [text, voice]);

  // Cleanup on unmount: stop source, cancel rAF, close AudioContext
  useEffect(() => {
    return () => {
      cancelRaf();
      stopSource();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [cancelRaf, stopSource]);

  const play = useCallback(async () => {
    if (typeof window === "undefined" || isLoading) return;

    cancelRaf();
    stopSource();

    const cacheKey = `${voice}_${text}`;
    let ttsResult = ttsCache.get(cacheKey);

    if (!ttsResult) {
      setIsLoading(true);
      try {
        const result = await ttsApi.synthesize(text, voice);
        ttsResult = result;
        ttsCache.set(cacheKey, ttsResult);
      } catch (err) {
        console.error("TTS synthesis failed:", err);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    try {
      let arrayBuffer: ArrayBuffer;
      if (ttsResult.audioBase64) {
        const response = await fetch(ttsResult.audioBase64);
        if (!response.ok) throw new Error(`Fetch base64 failed: ${response.status}`);
        arrayBuffer = await response.arrayBuffer();
      } else if (ttsResult.audioUrl) {
        // Proxy through backend to avoid CORS block on FPT CDN.
        // FPT CDN does not set Access-Control-Allow-Origin, so direct fetch() fails.
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const proxyUrl = `${backendUrl}/api/tts/audio?url=${encodeURIComponent(ttsResult.audioUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        arrayBuffer = await response.arrayBuffer();
      } else {
        throw new Error("No audio provided");
      }

      // Reuse or create AudioContext (browsers limit total contexts per page)
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") await ctx.resume();

      // decodeAudioData gives us a fully decoded AudioBuffer — zero decode latency at playback
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      durationRef.current = audioBuffer.duration;

      // Use backend timestamps if available, otherwise fallback to estimation
      if (ttsResult.wordTimestamps && ttsResult.wordTimestamps.length > 0) {
        // Azure returns word boundaries in seconds. Convert to match the duration scale if needed.
        // Align timestamps by character position to handle punctuation and compound word differences robustly.
        const azureTimestamps = ttsResult.wordTimestamps;
        const mappedTimestamps: WordTimestamp[] = [];
        
        const wordSpans: { word: string; startC: number; endC: number; cleanLength: number }[] = [];
        let charIdx = 0;
        for (const w of words) {
          // Remove punctuation and spaces to get the raw pronunciation characters
          const clean = w.toLowerCase().replace(/[.,!?;:"'“”‘’()\[\]{}-]/g, "").replace(/\s+/g, "");
          wordSpans.push({ word: w, startC: charIdx, endC: charIdx + clean.length, cleanLength: clean.length });
          charIdx += clean.length;
        }

        const azSpans: { start: number; end: number; startC: number; endC: number; cleanLength: number }[] = [];
        charIdx = 0;
        for (const az of azureTimestamps) {
          const clean = az.word.toLowerCase().replace(/[.,!?;:"'“”‘’()\[\]{}-]/g, "").replace(/\s+/g, "");
          azSpans.push({ start: az.start, end: az.end, startC: charIdx, endC: charIdx + clean.length, cleanLength: clean.length });
          charIdx += clean.length;
        }

        for (let i = 0; i < wordSpans.length; i++) {
          const wSpan = wordSpans[i];
          if (wSpan.cleanLength === 0) {
            mappedTimestamps.push({
              word: wSpan.word,
              start: mappedTimestamps[i - 1]?.end || 0,
              end: (mappedTimestamps[i - 1]?.end || 0) + 0.1
            });
            continue;
          }

          // Find all azure spans that overlap with this word's characters
          const overlapping = azSpans.filter(az => az.cleanLength > 0 && az.startC < wSpan.endC && az.endC > wSpan.startC);

          if (overlapping.length > 0) {
            mappedTimestamps.push({
              word: wSpan.word,
              start: overlapping[0].start / 1000,
              end: overlapping[overlapping.length - 1].end / 1000
            });
          } else {
            // Fallback for missing words
            mappedTimestamps.push({
              word: wSpan.word,
              start: mappedTimestamps[i - 1]?.end || 0,
              end: (mappedTimestamps[i - 1]?.end || 0) + 0.3
            });
          }
        }

        wordTimestampsRef.current = mappedTimestamps;
      } else {
        // Tier 3: Calculate syllable-weighted word timestamps for precise sync
        wordTimestampsRef.current = estimateWordTimestamps(words, audioBuffer.duration);
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRateRef.current;
      source.connect(ctx.destination);
      sourceNodeRef.current = source;

      // Record the exact AudioContext timestamp at start — used for sample-accurate elapsed calc
      startTimeRef.current = ctx.currentTime;
      lastWordIdxRef.current = 0;
      setActiveWordIdx(0);
      setIsPlaying(true);

      source.onended = () => {
        cancelRaf();
        setIsPlaying(false);
        setActiveWordIdx(-1);
        lastWordIdxRef.current = -1;
        onEndedRef.current?.();
      };

      source.start(0);
      startTrackingLoop();
    } catch (err) {
      console.error("Audio playback failed:", err);
      // Evict stale cache entry so next click re-fetches
      ttsCache.delete(`${voice}_${text}`);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [text, voice, words, isLoading, cancelRaf, stopSource, startTrackingLoop]);

  const stop = useCallback(() => {
    cancelRaf();
    stopSource();
    setIsPlaying(false);
    setActiveWordIdx(-1);
    lastWordIdxRef.current = -1;
  }, [cancelRaf, stopSource]);

  return { words, activeWordIdx, isPlaying, isLoading, play, stop };
}

// ─── Dialogue Line Component ───────────────────────────────────────────────────
// Exposed handle allows parent to programmatically trigger TTS playback
// (used by auto-play flow for partner/AI dialogue lines)
interface DialogueLineHandle {
  playTTS: () => void;
}

interface DialogueLineProps {
  dlg: DialogueDto;
  index: number;
  isLast: boolean;
  lang: string;
  showSubtitle: boolean;
  isSelected: boolean;
  isPassed: boolean;
  isLocked: boolean;
  onSelect: () => void;
  onAudioEnded?: () => void;
  playbackRate: number;
  voice: string;
}

const DialogueLine = forwardRef<DialogueLineHandle, DialogueLineProps>(function DialogueLine(
  { dlg, index, isLast, lang, showSubtitle, isSelected, isPassed, isLocked, onSelect, onAudioEnded, playbackRate, voice },
  ref
) {
  const { words, activeWordIdx, isPlaying, isLoading, play, stop } = useTTSShadowing(dlg.lineVi, playbackRate, voice, onAudioEnded);
  const highlightWords = parseHighlightWords(dlg.highlightWordsJson);

  useImperativeHandle(ref, () => ({
    playTTS: play,
  }), [play]);

  // Visual ring style: selected (actively recording for) vs passed vs default
  const ringClass = isSelected
    ? "ring-2 ring-primary ring-offset-4 ring-offset-background shadow-md"
    : isPassed
    ? "ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-background"
    : "";

  if (dlg.isActive) {
    return (
      <div
        data-dialogue-index={index}
        className={`bg-surface-container-lowest rounded-xl p-6 transition-all ${ringClass} ${isLocked ? "opacity-40 grayscale pointer-events-none" : "cursor-pointer"}`}
        onClick={isLocked ? undefined : () => { if (!isSelected) { onSelect(); } else { if (isPlaying) { stop(); } else { play(); } } }}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-primary text-xs tracking-tighter flex items-center gap-1.5">
            {isPassed && <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
            {lang === "ja" ? dlg.speakerJp : dlg.speaker} {lang === "ja" ? "（あなた）" : "(Active)"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isSelected) {
                onSelect();
              } else {
                if (isPlaying) { stop(); } else { play(); }
              }
            }}
            disabled={isLoading}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isLoading
                ? "bg-surface-container text-on-surface-variant opacity-70 cursor-wait"
                : isPlaying
                ? "bg-error text-on-error animate-pulse"
                : "bg-primary text-on-primary hover:opacity-90"
            }`}
            aria-label={isLoading ? "Đang tải" : isPlaying ? "Dừng" : "Nghe & Shadowing"}
          >
            <span className="material-symbols-outlined text-sm">
              {isLoading ? "hourglass_empty" : isPlaying ? "stop" : "record_voice_over"}
            </span>
            {isLoading
              ? (lang === "ja" ? "読込中" : "Đang tải...")
              : isPlaying
              ? (lang === "ja" ? "停止" : "Dừng")
              : (lang === "ja" ? "再生" : "Nghe")}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1 items-end mt-2">
          {words.map((w, i) => {
            const highlight = highlightWords.find((h) => h.index === i);
            const isActive = activeWordIdx === i;
            return (
              <div key={i} className="group relative flex flex-col items-center">
                <span className="text-[10px] text-on-surface-variant block text-center opacity-60 leading-none mb-0.5">
                  {w.replace(/[.,!?]/g, "")}
                </span>
                <span
                  className={`text-2xl font-headline font-bold transition-all duration-150 ${
                    isActive
                      ? "scale-110 drop-shadow-md"
                      : ""
                  } ${highlight ? "underline decoration-2 underline-offset-8" : "text-primary"}`}
                  style={{
                    color: isActive
                      ? "var(--secondary)"
                      : highlight
                      ? highlight.color
                      : undefined,
                    textDecorationColor: highlight ? highlight.color : undefined,
                    textShadow: isActive ? "0 0 12px var(--secondary)" : undefined,
                  }}
                >
                  {w}
                </span>
              </div>
            );
          })}
        </div>
        {showSubtitle && <p className="text-sm text-secondary mt-4 opacity-80">{dlg.lineJp}</p>}
      </div>
    );
  }

  return (
    <div
      data-dialogue-index={index}
      className={`bg-surface-container-low rounded-xl p-6 transition-all ${ringClass} ${
        isLocked ? "opacity-40 grayscale pointer-events-none" : isLast && !isSelected ? "opacity-60 cursor-pointer" : "cursor-pointer hover:bg-surface-container"
      }`}
      onClick={isLocked ? undefined : () => { if (!isSelected) { onSelect(); } else { if (isPlaying) { stop(); } else { play(); } } }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-primary text-xs tracking-tighter flex items-center gap-1.5">
          {isPassed && <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          {lang === "ja" ? dlg.speakerJp : dlg.speaker}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isSelected) {
              onSelect();
            } else {
              if (isPlaying) { stop(); } else { play(); }
            }
          }}
          disabled={isLoading}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isLoading
              ? "bg-surface-container text-on-surface-variant opacity-70 cursor-wait"
              : isPlaying
              ? "bg-error/20 text-error animate-pulse"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
          aria-label={isLoading ? "Đang tải" : "Nghe"}
        >
          <span className="material-symbols-outlined text-sm">
            {isLoading ? "hourglass_empty" : isPlaying ? "stop" : "volume_up"}
          </span>
          {isLoading
            ? (lang === "ja" ? "読込中" : "Đang tải...")
            : isPlaying ? (lang === "ja" ? "停止" : "Dừng") : (lang === "ja" ? "再生" : "Nghe")}
        </button>
      </div>
      {/* Word-by-word highlight for non-active lines too */}
      <div className="flex flex-wrap gap-x-1.5 gap-y-1 items-end mt-1">
        {words.map((w, i) => (
          <span
            key={i}
            className={`text-lg font-medium transition-all duration-150 ${
              activeWordIdx === i
                ? "text-secondary font-bold scale-105 inline-block drop-shadow-sm"
                : "text-primary"
            }`}
            style={{
              textShadow: activeWordIdx === i ? "0 0 8px var(--secondary)" : undefined,
            }}
          >
            {w}
          </span>
        ))}
      </div>
      {showSubtitle && <p className="text-sm text-secondary mt-2 opacity-80">{dlg.lineJp}</p>}
    </div>
  );
});

// ─── Voice Lab (Mic Recorder + Real Scoring) ─────────────────────────────────
// Pipeline: Thu âm (MediaRecorder) → Chuyển đổi WAV 16kHz Mono (Web Audio API)
//           → Gửi lên backend → FPT ASR chấm điểm phát âm
// MediaRecorder ghi ở codec mặc định của trình duyệt (thường là webm/opus),
// nên bắt buộc phải chuyển đổi sang WAV trước khi gửi API.
// Status key constants — stored in state instead of localized strings
// so that language switches are reflected immediately without cascading effects
type StatusKey = "ready" | "recording" | "playing" | "readyPlay" | "done" | "error" | "micUnavail" | "scoring" | "scored" | "converting" | "processingFile";

const STATUS_LABELS: Record<StatusKey, Record<string, string>> = {
  ready:          { vi: "Sẵn sàng thu âm",       ja: "録音準備完了" },
  recording:      { vi: "Đang thu âm...",         ja: "録音中..." },
  playing:        { vi: "Đang phát...",           ja: "再生中..." },
  readyPlay:      { vi: "Sẵn sàng phát",          ja: "再生可能" },
  done:           { vi: "Hoàn tất",               ja: "完了" },
  error:          { vi: "Lỗi",                    ja: "エラー" },
  micUnavail:     { vi: "Không thể truy cập mic", ja: "マイクが使用できません" },
  scoring:        { vi: "AI đang chấm điểm...",   ja: "AI採点中..." },
  scored:         { vi: "Đã chấm điểm xong",      ja: "採点完了" },
  converting:     { vi: "Đang chuyển đổi WAV...",  ja: "WAV変換中..." },
  processingFile: { vi: "Đang xử lý file...",      ja: "ファイル処理中..." },
};

function VoiceLab({ titleJp, subtitleJp, lang, expectedText, sentenceId, isPassed, onPassed, disabled }: { titleJp: string; subtitleJp: string; lang: string; expectedText: string; sentenceId?: string; isPassed?: boolean; onPassed?: () => void; disabled?: boolean }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState<StatusKey>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [isPlayingRec, setIsPlayingRec] = useState(false);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [scores, setScores] = useState<{ actualText: string | null; completeness: number; accuracy: number; fluency: number; prosody: number } | null>(null);
  const referenceWords = expectedText.split(/\s+/);
  const [assessmentView, setAssessmentView] = useState<AssessmentView | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioBlobRef = useRef<Blob | null>(null);
  const recordedAudioUrlRef = useRef(recordedAudioUrl);
  useEffect(() => { recordedAudioUrlRef.current = recordedAudioUrl; }, [recordedAudioUrl]);

  // Derive display label from key + lang each render — no effect needed
  const statusLabel = STATUS_LABELS[statusKey]?.[lang] ?? STATUS_LABELS[statusKey]?.vi ?? "";

  useEffect(() => () => {
    if (recRef.current?.state !== "inactive") recRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedAudioUrlRef.current) URL.revokeObjectURL(recordedAudioUrlRef.current);
  }, []);

  useEffect(() => {
    if (isPassed && sentenceId) {
      const fetchScore = async () => {
        setIsLoadingScore(true);
        try {
          const res = await voiceLabApi.getRecord(sentenceId);
          setScores(res);
          setStatusKey("scored");
          setAssessmentView(null);
        } catch {
          // Do nothing if not found
          setScores(null);
          setStatusKey("ready");
        } finally {
          setIsLoadingScore(false);
        }
      };
      fetchScore();
    }
  }, [isPassed, sentenceId]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !recordedAudioUrl) return;
    const onMeta = () => setDuration(a.duration);
    const onTime = () => setCurTime(a.currentTime);
    const onPlay = () => { setIsPlayingRec(true); setStatusKey("playing"); };
    const onPause = () => { setIsPlayingRec(false); setStatusKey("readyPlay"); };
    const onEnd = () => { setIsPlayingRec(false); setCurTime(0); setStatusKey("done"); };
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, [recordedAudioUrl]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  const evaluateRecording = async (blob: Blob, durationSec: number) => {
    if (!expectedText.trim()) return;
    setIsEvaluating(true);
    setEvalError(null);
    setStatusKey("scoring");
    try {
      const formData = new FormData();
      formData.append("AudioFile", blob, "recording.wav");
      formData.append("ExpectedText", expectedText);
      formData.append("DurationSeconds", durationSec.toFixed(3));
      if (sentenceId) {
        formData.append("SentenceId", sentenceId);
      }

      const result = await voiceLabApi.evaluate(formData);
      setScores(result);
      setStatusKey("scored");
      
      if (result.assessmentWords && result.assessmentWords.length > 0) {
        setAssessmentView(mapAssessmentFromBackend(result.assessmentWords, referenceWords));
      } else {
        setAssessmentView(null);
      }

      // Check pass condition and notify parent
      if (
        result.completeness >= PASS_COMPLETENESS &&
        result.accuracy >= PASS_ACCURACY &&
        onPassed
      ) {
        onPassed();
      }
    } catch (err) {
      console.error("Voice Lab evaluation failed:", err);
      setEvalError(lang === "ja" ? "採点に失敗しました" : "Chấm điểm thất bại");
      setStatusKey("error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const startRec = async () => {
    try {
      if (recordedAudioUrl) { URL.revokeObjectURL(recordedAudioUrl); setRecordedAudioUrl(null); }
      setScores(null);
      setEvalError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        // Calculate actual duration before async conversion
        const durationSec = (Date.now() - startTimeRef.current) / 1000;
        setStatusKey("converting");

        try {
          // Chuyển đổi webm/opus chunks → PCM 16kHz Mono WAV.
          // Bắt buộc phải ép chuẩn vì FPT ASR cho kết quả kém hoặc lỗi
          // nếu nhận file webm hoặc WAV có sampleRate khác 16kHz.
          const wavBlob = await exportToWav(chunksRef.current);
          audioBlobRef.current = wavBlob;
          const url = URL.createObjectURL(wavBlob);
          setRecordedAudioUrl(url);
          setIsPlayingRec(false);
          setCurTime(0);
          setStatusKey("readyPlay");

          // Auto-evaluate after stopping
          evaluateRecording(wavBlob, durationSec);
        } catch (err) {
          console.error("WAV conversion failed:", err);
          // Fallback: nếu chuyển đổi WAV thất bại (trình duyệt cũ, codec không hỗ trợ),
          // vẫn gửi raw webm để UI không crash. Chất lượng ASR có thể giảm nhưng
          // trải nghiệm người dùng không bị gián đoạn.
          const fallbackBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          audioBlobRef.current = fallbackBlob;
          const url = URL.createObjectURL(fallbackBlob);
          setRecordedAudioUrl(url);
          setIsPlayingRec(false);
          setCurTime(0);
          setStatusKey("readyPlay");
          evaluateRecording(fallbackBlob, durationSec);
        }
      };
      recRef.current = rec;
      startTimeRef.current = Date.now();
      rec.start();
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((v) => v + 1), 1000);
      setIsRecording(true);
      setStatusKey("recording");
    } catch { setStatusKey("micUnavail"); }
  };

  const stopRec = () => {
    if (recRef.current?.state !== "inactive") recRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
  };

  const reset = () => {
    stopRec();
    if (isPlayingRec) audioRef.current?.pause();
    if (recordedAudioUrl) { URL.revokeObjectURL(recordedAudioUrl); setRecordedAudioUrl(null); }
    setElapsed(0); setIsPlayingRec(false); setDuration(0); setCurTime(0);
    setScores(null); setEvalError(null); setAssessmentView(null);
    audioBlobRef.current = null;
    setStatusKey("ready");
  };

  const togglePlay = () => {
    if (!recordedAudioUrl || !audioRef.current) return;
    if (isPlayingRec) audioRef.current.pause();
    else { audioRef.current.currentTime = 0; audioRef.current.play(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();
    setScores(null);
    setEvalError(null);
    setStatusKey("processingFile");

    try {
      // 1. Decode audio using browser's AudioContext to get duration
      const arrayBuffer = await file.arrayBuffer();
      const tempCtx = new AudioContext();
      const decoded = await tempCtx.decodeAudioData(arrayBuffer);
      const durationSec = decoded.duration;
      await tempCtx.close();

      setStatusKey("converting");

      // 2. Convert raw file buffer using exportToWav
      const wavBlob = await exportToWav([file]);
      audioBlobRef.current = wavBlob;
      const url = URL.createObjectURL(wavBlob);
      setRecordedAudioUrl(url);
      setIsPlayingRec(false);
      setCurTime(0);

      // 3. Trigger evaluation
      evaluateRecording(wavBlob, durationSec);
    } catch (err) {
      console.error("File processing failed:", err);
      setEvalError(lang === "ja" ? "ファイルの処理に失敗しました" : "Lỗi xử lý file âm thanh.");
      setStatusKey("error");
    }
  };

  const bars = [30, 60, 45, 80, 20, 55, 75, 40, 65, 30, 90, 50, 35];
  const statusIcon = isEvaluating ? "hourglass_empty" : isRecording ? "fiber_manual_record" : isPlayingRec ? "pause_circle" : recordedAudioUrl ? "play_circle" : "mic_none";

  const L = {
    voiceLab: lang === "ja" ? "ボイスラボ" : "Phòng luyện giọng",
    shadowing: lang === "ja" ? "シャドーイング中" : "Đang luyện Shadowing",
    analyzing: lang === "ja" ? "ピッチ/音声分析..." : "Đang phân tích âm thanh...",
    accuracy: lang === "ja" ? "精度" : "Độ chính xác",
    fluency: lang === "ja" ? "流暢さ" : "Độ trôi chảy",
    complete: lang === "ja" ? "完成度" : "Độ hoàn thiện",
    prosody: lang === "ja" ? "韻律" : "Ngữ điệu",
    recognized: lang === "ja" ? "認識されたテキスト" : "Hệ thống nghe được",
  };

  const scoreData = scores
    ? [
        { val: `${Math.round(scores.accuracy)}%`, label: "Accuracy", jp: L.accuracy },
        { val: `${Math.round(scores.fluency)}%`, label: "Fluency", jp: L.fluency },
        { val: `${Math.round(scores.completeness)}%`, label: "Completeness", jp: L.complete },
        { val: `${Math.round(scores.prosody)}%`, label: "Prosody", jp: L.prosody },
      ]
    : [
        { val: "—", label: "Accuracy", jp: L.accuracy },
        { val: "—", label: "Fluency", jp: L.fluency },
        { val: "—", label: "Completeness", jp: L.complete },
        { val: "—", label: "Prosody", jp: L.prosody },
      ];

  return (
    <div className="space-y-6">
      <div className="bg-primary-container text-on-primary rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: "400px" }}>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline font-bold text-xl text-on-primary-container">{L.voiceLab}</h3>
              <p className="text-xs text-on-primary-container/80 tracking-widest uppercase">{L.shadowing}</p>
            </div>
            <div className="bg-surface-container-lowest/10 px-3 py-1 rounded-full text-xs font-bold border border-on-primary-container/20">
              AI v2.4
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 h-32 px-4">
            {bars.map((h, i) => (
              <div
                key={i}
                className="waveform-bar w-1.5 rounded-full"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${h}%`,
                  backgroundColor: i % 2 === 0 ? "var(--on-primary-container)" : "var(--secondary-fixed)",
                }}
              />
            ))}
          </div>
          {isEvaluating ? (
            <p className="mt-6 text-center text-sm text-on-primary-container/90 animate-pulse">{L.analyzing}</p>
          ) : scores?.actualText ? (
            <div className="mt-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-on-primary-container/60 mb-2">{L.recognized}</p>
              {assessmentView ? (
                <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1 px-4">
                  {assessmentView.words.map(({ word, mark }, index) => (
                    <span
                      key={`${word}-${index}`}
                      className={`text-sm font-medium transition-all ${
                        mark === "omission"
                          ? "line-through text-on-primary-container/40"
                          : mark === "mispronunciation"
                            ? "text-error border-b-2 border-error border-dotted"
                            : "text-emerald-400"
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-primary-container/90 font-medium italic">&ldquo;{scores.actualText}&rdquo;</p>
              )}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-on-primary-container/90">{L.analyzing}</p>
          )}
          <p className="text-center text-xs text-on-primary-container/60 mt-1">{titleJp} — {subtitleJp}</p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center justify-center gap-6">
            <button onClick={reset} disabled={(!recordedAudioUrl && !isRecording) || isEvaluating || disabled}
              className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Reset">
              <span className="material-symbols-outlined text-on-primary-container">replay</span>
            </button>
            <button onClick={isRecording ? stopRec : startRec} disabled={isEvaluating || disabled}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isRecording ? "bg-error text-on-error" : isEvaluating || disabled ? "bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50" : "bg-secondary text-on-secondary hover:scale-105"}`}
              aria-label={isRecording ? "Stop" : "Record"}>
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isEvaluating ? "hourglass_empty" : isRecording ? "stop" : "mic"}
              </span>
            </button>
            <button onClick={togglePlay} disabled={!recordedAudioUrl || isEvaluating || disabled}
              className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Play">
              <span className="material-symbols-outlined text-on-primary-container">
                {isPlayingRec ? "pause" : "play_arrow"}
              </span>
            </button>
            <label className={`w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors cursor-pointer ${isEvaluating || disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Upload file to test">
              <span className="material-symbols-outlined text-on-primary-container">upload_file</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" disabled={isEvaluating || disabled} />
            </label>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-on-primary-container/10 px-3 py-1 text-xs text-on-primary-container">
              <span className="material-symbols-outlined text-sm">{statusIcon}</span>
              <span>{statusLabel}</span>
            </div>
            <div className="text-[10px] text-on-primary-container/70">
              {isRecording ? `Rec: ${fmt(elapsed)}`
                : recordedAudioUrl
                ? isPlayingRec ? `${fmt(curTime)} / ${fmt(duration)}` : `${fmt(duration)}`
                : lang === "ja" ? "未録音" : "Chưa thu âm"}
            </div>
          </div>
          <audio ref={audioRef} src={recordedAudioUrl ?? undefined} hidden />
        </div>
      </div>

      {evalError && (
        <div className="bg-error/10 border border-error/30 text-error rounded-2xl px-5 py-3 text-sm text-center">
          <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
          {evalError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {scoreData.map((s) => (
          <div key={s.label} className={`bg-surface-container-lowest p-5 rounded-3xl text-center shadow-sm transition-all duration-300 ${scores ? "ring-2 ring-primary/20" : ""} ${isLoadingScore ? "opacity-60 animate-pulse" : ""}`}>
            {isLoadingScore ? (
              <div className="h-8 w-16 bg-surface-container mx-auto rounded mb-1" />
            ) : (
              <span className={`block text-2xl font-headline font-extrabold ${scores ? "text-primary" : "text-on-surface-variant/40"}`}>{s.val}</span>
            )}
            <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">{s.jp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const { lang, t } = useLanguage();
  const [lesson, setLesson] = useState<LessonDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, updateUser } = useAuth();
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const speedDropdownRef = useRef<HTMLDivElement>(null);
  const [speakerVoices, setSpeakerVoices] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(event.target as Node)) {
        setShowSpeedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Heartbeat: record 60s of study time every minute the learner stays on this page
  useStudyTimeTracker();

  // Index of the dialogue currently focused for Voice Lab recording
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);

  // Sequential flow watermark: tracks the furthest dialogue the learner has reached.
  // Lines beyond this index are locked to enforce top-down shadowing progression.
  const [furthestIndex, setFurthestIndex] = useState(0);

  // Per-dialogue pass tracking (Set of dialogue indices that meet the pass condition)
  const [passedDialogues, setPassedDialogues] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  // Guard to prevent duplicate auto-complete calls
  const isAutoCompletingRef = useRef(false);
  // Prevent duplicate record-study API calls within the same session
  const hasRecordedStudyRef = useRef(false);

  // ── Auto-flow refs ──────────────────────────────────────────────────────────
  // Refs array for each DialogueLine to trigger programmatic TTS playback
  const dialogueRefs = useRef<(DialogueLineHandle | null)[]>([]);
  // Timer ref for auto-advance delay (prevents stale/orphan timers on rapid step changes)
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether user has started the lesson (any interaction = autoplay is safe)
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    const handleInteract = () => {
      hasUserInteractedRef.current = true;
      window.removeEventListener("click", handleInteract);
      window.removeEventListener("touchstart", handleInteract);
    };
    window.addEventListener("click", handleInteract);
    window.addEventListener("touchstart", handleInteract);
    return () => {
      window.removeEventListener("click", handleInteract);
      window.removeEventListener("touchstart", handleInteract);
    };
  }, []);

  // ── Lesson Complete celebration state ──────────────────────────────────────
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  // Window dimensions for confetti canvas to fill the entire viewport
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const updateSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Only count learner lines (isActive) for mastery progress —
  // teacher/partner lines should not inflate the completion requirement
  const totalLearnerLines = lesson?.dialogues.filter((d) => d.isActive).length ?? 0;
  const passedCount = passedDialogues.size;
  const masteryProgress = totalLearnerLines > 0 ? passedCount / totalLearnerLines : 0;

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const previousPassedCountRef = useRef(passedCount);

  // Sync partial progress to backend
  useEffect(() => {
    if (
      passedCount > previousPassedCountRef.current &&
      totalLearnerLines > 0 &&
      passedCount < totalLearnerLines &&
      isAuthenticated &&
      !lesson?.isCompleted
    ) {
      previousPassedCountRef.current = passedCount;
      const newProgress = Math.round((passedCount / totalLearnerLines) * 100);
      lessonApi.updateLessonProgress(lessonId, newProgress).catch(console.error);
    }
  }, [passedCount, totalLearnerLines, isAuthenticated, lessonId, lesson?.isCompleted]);

  // Auto-complete lesson when all learner lines are passed → trigger celebration
  useEffect(() => {
    if (
      totalLearnerLines > 0 &&
      passedCount === totalLearnerLines &&
      isAuthenticated &&
      !isAutoCompletingRef.current &&
      !lesson?.isCompleted
    ) {
      isAutoCompletingRef.current = true;
      lessonApi
        .completeLesson(lessonId)
        .then((res) => {
          if (res && res.newLevel) {
            updateUser({ level: res.newLevel });
          }
          // Delay to let the last score animation settle before showing celebration
          setTimeout(() => setIsLessonCompleted(true), 1000);
        })
        .catch((err) => {
          console.error("Auto-complete lesson failed:", err);
          showToast("error", t(
            "Lưu tiến độ thất bại, vui lòng thử lại.",
            "進捗の保存に失敗しました。もう一度お試しください。"
          ));
          isAutoCompletingRef.current = false;
        });
    }
  }, [passedCount, totalLearnerLines, isAuthenticated, lessonId, lesson?.isCompleted, showToast, t, updateUser]);

  useEffect(() => {
    if (!lessonId) return;
    lessonApi
      .getLessonById(lessonId)
      .then((data) => {
        setLesson(data);

        // Assign random voices for each speaker
        const fptVoices = ["banmai", "lannhi", "thuminh", "giahan", "leminh", "thientri"];
        const voiceMapping: Record<string, string> = {};
        const availableVoices = [...fptVoices];
        
        data.dialogues.forEach((dlg) => {
          if (!voiceMapping[dlg.speaker]) {
            const randomIdx = Math.floor(Math.random() * availableVoices.length);
            voiceMapping[dlg.speaker] = availableVoices[randomIdx];
            availableVoices.splice(randomIdx, 1);
            if (availableVoices.length === 0) availableVoices.push(...fptVoices);
          }
        });
        setSpeakerVoices(voiceMapping);

        // Initialize passedDialogues from saved progress
        const activeLines = data.dialogues.filter((d) => d.isActive);
        if (data.isCompleted) {
          // All active dialogues passed
          const allPassed = new Set<number>(
            data.dialogues
              .map((d, i) => (d.isActive ? i : -1))
              .filter((i) => i >= 0)
          );
          setPassedDialogues(allPassed);
          setFurthestIndex(data.dialogues.length - 1);
        } else if (data.progress > 0 && activeLines.length > 0) {
          // Calculate how many dialogues were passed based on saved progress
          const passedCount = Math.round((data.progress / 100) * activeLines.length);
          const passedIndices = data.dialogues
            .map((d, i) => (d.isActive ? i : -1))
            .filter((i) => i >= 0)
            .slice(0, passedCount);

          setPassedDialogues(new Set(passedIndices));
          // Set furthestIndex and activeDialogueIndex to the next dialogue
          if (passedIndices.length > 0) {
            const nextIdx = Math.min(passedIndices[passedIndices.length - 1] + 1, data.dialogues.length - 1);
            setFurthestIndex(nextIdx);
            setActiveDialogueIndex(nextIdx);
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  // ── Auto-play & Auto-scroll on step change ────────────────────────────────
  // When activeDialogueIndex changes:
  // 1. Scroll the active dialogue card into view (smooth, centered)
  // 2. If current line is a partner/AI line (!isActive), auto-play TTS
  //    and auto-advance to the next step when audio ends
  useEffect(() => {
    if (!lesson) return;

    // Auto-scroll: find the DOM element for the current dialogue and scroll it into view
    // Uses requestAnimationFrame to ensure DOM has rendered after state change
    requestAnimationFrame(() => {
      const activeEl = document.querySelector(`[data-dialogue-index="${activeDialogueIndex}"]`);
      activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    const currentDlg = lesson.dialogues[activeDialogueIndex];
    if (!currentDlg) return;

    // Auto-play for partner/AI lines: only trigger if user has already interacted
    // (first interaction = clicking "Bắt đầu" or recording mic) to comply with
    // browser autoplay policy
    if (!currentDlg.isActive && hasUserInteractedRef.current) {
      // Small delay to let the scroll animation settle before audio starts
      const playTimer = setTimeout(() => {
        dialogueRefs.current[activeDialogueIndex]?.playTTS();
      }, 300);
      return () => clearTimeout(playTimer);
    }
  }, [activeDialogueIndex, lesson]);

  // Cleanup auto-advance timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Wrapper: advance dialogue AND update watermark in the same render batch.
  // Avoids cascading renders that would occur if watermark was updated in an effect.
  const advanceToDialogue = useCallback((nextIdx: number) => {
    setActiveDialogueIndex(nextIdx);
    setFurthestIndex(prev => Math.max(prev, nextIdx));
  }, []);

  // Handler: when partner/AI TTS audio finishes → auto-advance to next step
  const handlePartnerAudioEnded = useCallback(() => {
    if (!lesson) return;
    const nextIdx = activeDialogueIndex + 1;
    if (nextIdx < lesson.dialogues.length) {
      advanceToDialogue(nextIdx);
    }
  }, [activeDialogueIndex, lesson, advanceToDialogue]);

  // Handler: when learner passes a line → show score for 1.5s then auto-advance
  const handleAutoAdvanceAfterPass = useCallback(() => {
    if (!lesson) return;
    // Cancel any pending auto-advance to avoid double-firing
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);

    const nextIdx = activeDialogueIndex + 1;
    if (nextIdx < lesson.dialogues.length) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToDialogue(nextIdx);
        autoAdvanceTimerRef.current = null;
      }, 4000);
    }
  }, [activeDialogueIndex, lesson, advanceToDialogue]);

  // Resets all practice state to allow learner to redo the lesson from scratch
  const handleRestartLesson = useCallback(() => {
    setIsLessonCompleted(false);
    setActiveDialogueIndex(0);
    setFurthestIndex(0);
    setPassedDialogues(new Set());
    isAutoCompletingRef.current = false;
    hasRecordedStudyRef.current = false;
    hasUserInteractedRef.current = false;
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const L = {
    toggleSubtitle: t("Bật/Tắt phụ đề", "字幕 ON/OFF"),
    speed: t("Tốc độ", "速度"),
    back: t("Quay lại danh sách bài học", "レッスン一覧に戻る"),
    shadowingTip: t(
      "Bấm nút 'Nghe' để nghe từng câu, sau đó nhấn mic để luyện shadowing.",
      "「再生」ボタンで各文を聞き、その後マイクでシャドーイング練習をしましょう。"
    ),
    toneExamples: t("Ví dụ:", "例："),
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background font-body min-h-screen pb-24">
        <LearnerNavbar />
        <main className="pt-24 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-48 bg-surface-container rounded" />
            <div className="bg-surface-container-lowest rounded-3xl p-8 space-y-4">
              <div className="h-4 w-32 bg-surface-container rounded" />
              <div className="h-8 w-3/4 bg-surface-container rounded" />
              <div className="h-4 w-1/2 bg-surface-container rounded" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-xl p-6 space-y-3">
                <div className="h-4 w-24 bg-surface-container rounded" />
                <div className="h-6 w-full bg-surface-container rounded" />
              </div>
            ))}
          </div>
        </main>
        <LearnerBottomNav />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="bg-background text-on-background font-body min-h-screen pb-24">
        <LearnerNavbar />
        <main className="pt-24 px-4 md:px-8 max-w-6xl mx-auto text-center py-16">
          <span className="material-symbols-outlined text-4xl text-error mb-4 block">error</span>
          <p className="text-on-surface-variant">{t("Không tìm thấy bài học.", "レッスンが見つかりませんでした。")}</p>
          <Link href="/learner/lessons" className="mt-4 inline-block px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold">
            {L.back}
          </Link>
        </main>
        <LearnerBottomNav />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-24">
      <LearnerNavbar />
      <main className="pt-24 px-4 md:px-8 max-w-6xl mx-auto">
        <Link href="/learner/lessons"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium mb-6"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {L.back}
        </Link>

        {/* ── Lesson Complete Celebration View ── */}
        {isLessonCompleted ? (
          <>
            {/* Confetti — fixed fullscreen canvas */}
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.12}
              style={{ position: "fixed", top: 0, left: 0, zIndex: 100, pointerEvents: "none" }}
            />

            <div className="flex flex-col items-center justify-center py-16 animate-[fadeInUp_0.6s_ease-out]">
              {/* Trophy icon */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-400 flex items-center justify-center shadow-2xl mb-8 animate-bounce">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 56, fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>

              {/* Celebration heading */}
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary text-center mb-3">
                {t("Xuất sắc! 🎉", "素晴らしい！ 🎉")}
              </h2>
              <p className="text-lg text-on-surface-variant text-center max-w-md mb-10">
                {t(
                  "Bạn đã hoàn thành tất cả các câu thoại trong bài học này!",
                  "このレッスンのすべてのセリフを完了しました！"
                )}
              </p>

              {/* Lesson summary card */}
              <div className="bg-surface-container-lowest rounded-3xl p-8 w-full max-w-lg shadow-xl mb-10">
                <h3 className="font-headline font-bold text-lg text-primary mb-1">{lesson.titleVi}</h3>
                <p className="text-sm text-on-surface-variant italic mb-6">{t(lesson.subtitleVi, lesson.subtitleJp)}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                    <span className="block text-3xl font-headline font-extrabold text-emerald-600">{passedCount}/{totalLearnerLines}</span>
                    <span className="block text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider mt-1">
                      {t("Câu đạt", "合格フレーズ")}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-2xl p-4 text-center">
                    <span className="block text-3xl font-headline font-extrabold text-primary">100%</span>
                    <span className="block text-[10px] font-bold text-primary/80 uppercase tracking-wider mt-1">
                      {t("Hoàn thành", "完了率")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <button
                  onClick={() => router.push("/learner/home")}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">home</span>
                  {t("Về Trang chủ", "ホームへ戻る")}
                </button>
                <button
                  onClick={handleRestartLesson}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-surface-container-low text-primary border-2 border-primary/20 rounded-2xl font-bold text-sm hover:bg-surface-container transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">replay</span>
                  {t("Luyện tập lại", "もう一度練習")}
                </button>
              </div>
            </div>
          </>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left Column ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header */}
          <div className="bg-surface-container-lowest rounded-3xl p-8">
            <span className="text-secondary font-label tracking-widest uppercase text-xs">
              {t(lesson.sceneLabel, lesson.sceneLabelJp)}
            </span>
            <h2 className="text-3xl font-headline font-extrabold text-primary mt-2 mb-1">
              {lesson.titleVi}
            </h2>
            <p className="text-on-surface-variant italic">
              {t(lesson.subtitleVi, lesson.subtitleJp)}
            </p>
          </div>

          {/* Shadowing tip banner */}
          <div className="flex items-start gap-3 bg-secondary/10 border border-secondary/20 rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-secondary mt-0.5">tips_and_updates</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">{L.shadowingTip}</p>
          </div>

          {/* Tone Notes */}
          {lesson.toneNotes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lesson.toneNotes.map((note) => (
                <div key={note.tone} className="bg-surface-container-low rounded-2xl p-6 border-l-4"
                  style={{ borderColor: note.color }}>
                  <p className="font-headline font-extrabold text-xl mb-1" style={{ color: note.color }}>
                    {note.tone}
                  </p>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
                    {t(note.descVi, note.descJp)}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                    {L.toneExamples}
                  </p>
                  <p className="font-headline font-bold text-primary text-lg">{note.example}</p>
                </div>
              ))}
            </div>
          )}

          {/* Controls: Speed and Subtitle */}
          <div className="flex justify-end gap-3">
            <div className="relative" ref={speedDropdownRef}>
              <button
                onClick={() => setShowSpeedDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary rounded-full hover:bg-surface-container transition-all shadow-sm active:scale-95 border border-primary/10"
                title={L.speed}
              >
                <span className="material-symbols-outlined text-sm">speed</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{L.speed}: {playbackRate}X</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: showSpeedDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
              </button>
              
              {showSpeedDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-surface-container-lowest border border-surface-container-low rounded-xl shadow-lg z-50 overflow-hidden min-w-[120px] py-1 animate-[fadeInUp_0.1s_ease-out]">
                  {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-container flex items-center justify-between ${
                        playbackRate === rate ? "text-primary bg-primary/10" : "text-on-surface"
                      }`}
                    >
                      <span>{rate}X {rate === 1 && <span className="text-xs opacity-60 ml-1">(Chuẩn)</span>}</span>
                      {playbackRate === rate && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSubtitle((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">
                {showSubtitle ? "visibility_off" : "visibility"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{L.toggleSubtitle}</span>
            </button>
          </div>

          {/* Dialogues */}
          <div className="space-y-4">
            {lesson.dialogues.map((dlg, idx) => {
              const isLocked = idx > furthestIndex;
              return (
                <DialogueLine
                  key={idx}
                  ref={(el) => { dialogueRefs.current[idx] = el; }}
                  dlg={dlg}
                  index={idx}
                  isLast={idx === lesson.dialogues.length - 1 && !dlg.isActive}
                  lang={lang}
                  showSubtitle={showSubtitle}
                  isSelected={idx === activeDialogueIndex}
                  isPassed={passedDialogues.has(idx)}
                  isLocked={isLocked}
                  playbackRate={playbackRate}
                  voice={speakerVoices[dlg.speaker] || "banmai"}
                  onSelect={() => {
                    if (isLocked) return;
                    hasUserInteractedRef.current = true;
                    advanceToDialogue(idx);
                  }}
                  onAudioEnded={!dlg.isActive ? handlePartnerAudioEnded : undefined}
                />
              );
            })}
          </div>


        </div>

        {/* ── Right Column (Sticky Voice Lab) ── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Single Voice Lab — driven by activeDialogueIndex */}
            {(() => {
              const activeDlg = lesson.dialogues[activeDialogueIndex];
              if (!activeDlg) return null;
              return (
                <VoiceLab
                  key={activeDialogueIndex}
                  titleJp={lesson.titleJp}
                  subtitleJp={`${activeDlg.speaker}: ${activeDlg.lineVi}`}
                  lang={lang}
                  expectedText={activeDlg.lineVi}
                  sentenceId={activeDlg.dialogueId}
                  isPassed={passedDialogues.has(activeDialogueIndex)}
                  disabled={!activeDlg.isActive}
                  onPassed={() => {
                    // Mark user has interacted for autoplay policy compliance
                    hasUserInteractedRef.current = true;

                    // Only credit learner lines — teacher/partner lines
                    // can be practiced for fun but don't count toward mastery
                    if (!activeDlg.isActive) return;
                    setPassedDialogues((prev) => {
                      if (prev.has(activeDialogueIndex)) return prev;
                      const next = new Set(prev);
                      next.add(activeDialogueIndex);
                      return next;
                    });

                    // Auto-advance to next dialogue after 1.5s delay
                    handleAutoAdvanceAfterPass();

                    // Fire-and-forget: report study activity for streak tracking.
                    // Only call once per page load to avoid spamming the endpoint.
                    if (!hasRecordedStudyRef.current) {
                      hasRecordedStudyRef.current = true;
                      userApi.recordStudyActivity()
                        .then((res) => {
                          if (res && typeof res.currentStreak === "number") {
                            updateUser({ currentStreak: res.currentStreak });
                          }
                        })
                        .catch(console.error);
                    }

                    // Fire-and-forget: record learned vocabulary words.
                    // Extract highlight words (key vocab) from dialogue; fallback to all words.
                    const hlWords = activeDlg.highlightWordsJson
                      ? (() => {
                          try {
                            const parsed: { index: number }[] = JSON.parse(activeDlg.highlightWordsJson);
                            const allWords = activeDlg.lineVi.split(/\s+/);
                            return parsed
                              .map((h) => allWords[h.index])
                              .filter((w): w is string => !!w);
                          } catch {
                            return [];
                          }
                        })()
                      : [];
                    const wordsToRecord = hlWords.length > 0
                      ? hlWords
                      : activeDlg.lineVi.split(/\s+/).filter((w) => w.length > 0);
                    vocabApi.recordLearnedWords(wordsToRecord).catch(console.error);
                  }}
                />
              );
            })()}

            {/* Mastery Progress — Lotus Progress Tracker (SRS design) */}
            <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col items-center">
              <h4 className="font-label text-xs font-bold text-primary mb-6 tracking-widest uppercase">
                {t("Tiến độ luyện tập", "習得状況")}
              </h4>
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Decorative lotus petal background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 100, transform: "rotate(45deg)" }}>filter_vintage</span>
                </div>
                {/* Center text */}
                <div className="z-10 text-center">
                  <span className="text-xl font-headline font-extrabold text-primary">
                    {passedCount}/{totalLearnerLines}
                  </span>
                  <span className="block text-[8px] font-bold text-secondary uppercase">
                    {t("Câu", "フレーズ")}
                  </span>
                </div>
                {/* Circular progress ring — circumference = 2π × 44 ≈ 276 */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    className="text-primary-container/10"
                    cx="48" cy="48" r="44"
                    fill="transparent" stroke="currentColor" strokeWidth="4"
                  />
                  <circle
                    cx="48" cy="48" r="44"
                    fill="transparent" strokeWidth="4"
                    stroke={masteryProgress === 1 ? "#4caf50" : "var(--primary)"}
                    strokeDasharray="276"
                    strokeDashoffset={276 - 276 * masteryProgress}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-4 text-center">
                {masteryProgress === 1
                  ? t("🎉 Tất cả câu đã đạt!", "🎉 全文合格！")
                  : t(
                      `Chính xác ≥ ${PASS_ACCURACY}% & Hoàn thiện ≥ ${PASS_COMPLETENESS}%`,
                      `合格: 精度 ≥ ${PASS_ACCURACY}% & 完成度 ≥ ${PASS_COMPLETENESS}%`
                    )}
              </p>
            </div>

          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-[slideUp_0.3s_ease-out] ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            {toast.message}
          </div>
        )}
        </div>
        )}
      </main>
      <LearnerBottomNav />
    </div>
  );
}