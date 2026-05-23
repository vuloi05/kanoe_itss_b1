"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { lessonApi, ttsApi, voiceLabApi, type LessonDetailDto, type DialogueDto } from "@/lib/api";
// Hàm chuyển đổi audio chunks (webm/opus) → WAV (PCM, 16kHz, Mono)
// để tối ưu cho FPT.AI ASR API — xem chi tiết lý do kỹ thuật trong audio-utils.ts
import { exportToWav } from "@/lib/audio-utils";

// In-memory cache to avoid redundant API calls for the same text
const ttsCache = new Map<string, string>();

// Parsed highlight data from JSON string
interface HighlightWord {
  index: number;
  color: string;
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
function useTTSShadowing(text: string) {
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const words = text.split(/\s+/);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const play = useCallback(async () => {
    if (typeof window === "undefined" || isLoading) return;

    // Stop any current playback first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    let audioUrl = ttsCache.get(text);

    if (!audioUrl) {
      setIsLoading(true);
      try {
        const result = await ttsApi.synthesize(text);
        audioUrl = result.audioUrl;
        ttsCache.set(text, audioUrl);
      } catch (err) {
        console.error("TTS synthesis failed:", err);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Retry wrapper — FPT CDN may still be processing even after backend poll
    const tryPlay = (retriesLeft: number) => {
      audio.onplay = () => {
        setIsPlaying(true);
        const estimatedDuration = audio.duration || words.length * 0.35;
        const interval = (estimatedDuration / words.length) * 1000;
        let idx = 0;
        setActiveWordIdx(0);
        intervalRef.current = window.setInterval(() => {
          idx++;
          if (idx < words.length) {
            setActiveWordIdx(idx);
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }, interval);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setActiveWordIdx(-1);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      audio.onerror = () => {
        if (retriesLeft > 0) {
          setTimeout(() => {
            audio.load();
            tryPlay(retriesLeft - 1);
          }, 800);
          return;
        }
        console.error("Audio playback failed after retries");
        setIsPlaying(false);
        setActiveWordIdx(-1);
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Evict stale cache entry so next click fetches a fresh URL
        ttsCache.delete(text);
      };

      audio.play().catch((err) => {
        if (retriesLeft > 0) {
          setTimeout(() => {
            audio.load();
            tryPlay(retriesLeft - 1);
          }, 800);
          return;
        }
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
        ttsCache.delete(text);
      });
    };

    tryPlay(3);
  }, [text, words.length, isLoading]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setActiveWordIdx(-1);
  }, []);

  return { words, activeWordIdx, isPlaying, isLoading, play, stop };
}

// ─── Dialogue Line Component ───────────────────────────────────────────────────
function DialogueLine({ dlg, isLast, lang, showSubtitle }: {
  dlg: DialogueDto;
  isLast: boolean;
  lang: string;
  showSubtitle: boolean;
}) {
  const { words, activeWordIdx, isPlaying, isLoading, play, stop } = useTTSShadowing(dlg.lineVi);
  const highlightWords = parseHighlightWords(dlg.highlightWordsJson);

  if (dlg.isActive) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 ring-2 ring-primary ring-offset-4 ring-offset-background shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-primary text-xs tracking-tighter">
            {dlg.speaker} / {dlg.speakerJp} {lang === "ja" ? "（あなた）" : "(Active)"}
          </span>
          <button
            onClick={isPlaying ? stop : play}
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
      className={`bg-surface-container-low rounded-xl p-6 ${
        isLast ? "opacity-60" : "hover:bg-surface-container transition-all"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-primary text-xs tracking-tighter">
          {dlg.speaker} / {dlg.speakerJp}
        </span>
        <button
          onClick={isPlaying ? stop : play}
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
}

// ─── Voice Lab (Mic Recorder + Real Scoring) ─────────────────────────────────
// Pipeline: Thu âm (MediaRecorder) → Chuyển đổi WAV 16kHz Mono (Web Audio API)
//           → Gửi lên backend → FPT ASR chấm điểm phát âm
// MediaRecorder ghi ở codec mặc định của trình duyệt (thường là webm/opus),
// nên bắt buộc phải chuyển đổi sang WAV trước khi gửi API.
function VoiceLab({ titleJp, subtitleJp, lang, expectedText }: { titleJp: string; subtitleJp: string; lang: string; expectedText: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState("Ready to record");
  const [elapsed, setElapsed] = useState(0);
  const [isPlayingRec, setIsPlayingRec] = useState(false);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [scores, setScores] = useState<{ actualText: string | null; completeness: number; accuracy: number; fluency: number; prosody: number } | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioBlobRef = useRef<Blob | null>(null);
  const recordedAudioUrlRef = useRef(recordedAudioUrl);
  useEffect(() => { recordedAudioUrlRef.current = recordedAudioUrl; }, [recordedAudioUrl]);

  useEffect(() => () => {
    if (recRef.current?.state !== "inactive") recRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedAudioUrlRef.current) URL.revokeObjectURL(recordedAudioUrlRef.current);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !recordedAudioUrl) return;
    const onMeta = () => setDuration(a.duration);
    const onTime = () => setCurTime(a.currentTime);
    const onPlay = () => { setIsPlayingRec(true); setStatusLabel("Playing..."); };
    const onPause = () => { setIsPlayingRec(false); setStatusLabel("Ready to play"); };
    const onEnd = () => { setIsPlayingRec(false); setCurTime(0); setStatusLabel("Done"); };
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
    setStatusLabel(lang === "ja" ? "AI採点中..." : "AI đang chấm điểm...");
    try {
      const formData = new FormData();
      formData.append("AudioFile", blob, "recording.wav");
      formData.append("ExpectedText", expectedText);
      formData.append("DurationSeconds", durationSec.toFixed(3));

      const result = await voiceLabApi.evaluate(formData);
      setScores(result);
      setStatusLabel(lang === "ja" ? "採点完了" : "Đã chấm điểm xong");
    } catch (err) {
      console.error("Voice Lab evaluation failed:", err);
      setEvalError(lang === "ja" ? "採点に失敗しました" : "Chấm điểm thất bại");
      setStatusLabel("Error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const startRec = async () => {
    try {
      if (recordedAudioUrl) { URL.revokeObjectURL(recordedAudioUrl); setRecordedAudioUrl(null); }
      setScores(null);
      setEvalError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        // Calculate actual duration before async conversion
        const durationSec = (Date.now() - startTimeRef.current) / 1000;
        setStatusLabel(lang === "ja" ? "WAV変換中..." : "Đang chuyển đổi WAV...");

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
          setStatusLabel("Ready to play");

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
          setStatusLabel("Ready to play");
          evaluateRecording(fallbackBlob, durationSec);
        }
      };
      recRef.current = rec;
      startTimeRef.current = Date.now();
      rec.start();
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((v) => v + 1), 1000);
      setIsRecording(true);
      setStatusLabel("Recording...");
    } catch { setStatusLabel("Mic unavailable"); }
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
    setScores(null); setEvalError(null);
    audioBlobRef.current = null;
    setStatusLabel("Ready to record");
  };

  const togglePlay = () => {
    if (!recordedAudioUrl || !audioRef.current) return;
    if (isPlayingRec) audioRef.current.pause();
    else { audioRef.current.currentTime = 0; audioRef.current.play(); }
  };

  const bars = [30, 60, 45, 80, 20, 55, 75, 40, 65, 30, 90, 50, 35];
  const statusIcon = isEvaluating ? "hourglass_empty" : isRecording ? "fiber_manual_record" : isPlayingRec ? "pause_circle" : recordedAudioUrl ? "play_circle" : "mic_none";

  const L = {
    voiceLab: lang === "ja" ? "ボイスラボ" : "Voice Lab",
    shadowing: lang === "ja" ? "シャドーイング中" : "Shadowing Active",
    analyzing: lang === "ja" ? "ピッチ分析中..." : "Analyzing Pitch...",
    accuracy: lang === "ja" ? "精度" : "Accuracy",
    fluency: lang === "ja" ? "流暢さ" : "Fluency",
    complete: lang === "ja" ? "完成度" : "Completeness",
    prosody: lang === "ja" ? "韻律" : "Prosody",
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
              <p className="text-[10px] uppercase tracking-widest text-on-primary-container/60 mb-1">{L.recognized}</p>
              <p className="text-sm text-on-primary-container/90 font-medium italic">&ldquo;{scores.actualText}&rdquo;</p>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-on-primary-container/90">{L.analyzing}</p>
          )}
          <p className="text-center text-xs text-on-primary-container/60 mt-1">{titleJp} — {subtitleJp}</p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center justify-center gap-8">
            <button onClick={reset} disabled={(!recordedAudioUrl && !isRecording) || isEvaluating}
              className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Reset">
              <span className="material-symbols-outlined text-on-primary-container">replay</span>
            </button>
            <button onClick={isRecording ? stopRec : startRec} disabled={isEvaluating}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isRecording ? "bg-error text-on-error" : isEvaluating ? "bg-surface-container text-on-surface-variant cursor-wait" : "bg-secondary text-on-secondary hover:scale-105"}`}
              aria-label={isRecording ? "Stop" : "Record"}>
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isEvaluating ? "hourglass_empty" : isRecording ? "stop" : "mic"}
              </span>
            </button>
            <button onClick={togglePlay} disabled={!recordedAudioUrl || isEvaluating}
              className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Play">
              <span className="material-symbols-outlined text-on-primary-container">
                {isPlayingRec ? "pause" : "play_arrow"}
              </span>
            </button>
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
                : "No recording yet"}
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
          <div key={s.label} className={`bg-surface-container-lowest p-5 rounded-3xl text-center shadow-sm transition-all duration-300 ${scores ? "ring-2 ring-primary/20" : ""}`}>
            <span className={`block text-2xl font-headline font-extrabold ${scores ? "text-primary" : "text-on-surface-variant/40"}`}>{s.val}</span>
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
  const lessonId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const { lang, t } = useLanguage();
  const [lesson, setLesson] = useState<LessonDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubtitle, setShowSubtitle] = useState(true);

  useEffect(() => {
    if (!lessonId) return;
    lessonApi
      .getLessonById(lessonId)
      .then(setLesson)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const L = {
    toggleSubtitle: t("Bật/Tắt phụ đề", "字幕 ON/OFF"),
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

          {/* Subtitle toggle */}
          <div className="flex justify-end">
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
            {lesson.dialogues.map((dlg, idx) => (
              <DialogueLine
                key={idx}
                dlg={dlg}
                isLast={idx === lesson.dialogues.length - 1 && !dlg.isActive}
                lang={lang}
                showSubtitle={showSubtitle}
              />
            ))}
          </div>


        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-5">
          <VoiceLab titleJp={lesson.titleJp} subtitleJp={lesson.subtitleJp} lang={lang} expectedText={lesson.dialogues.find(d => d.isActive)?.lineVi ?? lesson.dialogues[0]?.lineVi ?? ""} />
        </div>
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
