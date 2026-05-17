"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LESSONS, type Dialogue } from "./lessonData";

// ─── TTS Shadowing Hook ────────────────────────────────────────────────────────
function useTTSShadowing(text: string) {
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const words = text.split(/\s+/);

  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "vi-VN";
    utt.rate = 0.85;

    // Try to find a Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith("vi"));
    if (viVoice) utt.voice = viVoice;

    let wordIndex = 0;
    utt.onboundary = (e) => {
      if (e.name === "word") {
        setActiveWordIdx(wordIndex);
        wordIndex++;
      }
    };
    utt.onstart = () => setIsPlaying(true);
    utt.onend = () => { setIsPlaying(false); setActiveWordIdx(-1); };
    utt.onerror = () => { setIsPlaying(false); setActiveWordIdx(-1); };
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [text]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setActiveWordIdx(-1);
  }, []);

  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  return { words, activeWordIdx, isPlaying, play, stop };
}

// ─── Dialogue Line Component ───────────────────────────────────────────────────
function DialogueLine({ dlg, isLast, lang }: {
  dlg: Dialogue;
  isLast: boolean;
  lang: string;
}) {
  const { words, activeWordIdx, isPlaying, play, stop } = useTTSShadowing(dlg.lineVi);

  if (dlg.isActive) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 ring-2 ring-primary ring-offset-4 ring-offset-background shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-primary text-xs tracking-tighter">
            {dlg.speaker} / {dlg.speakerJp} {lang === "ja" ? "（あなた）" : "(Active)"}
          </span>
          <button
            onClick={isPlaying ? stop : play}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isPlaying
                ? "bg-error text-on-error animate-pulse"
                : "bg-primary text-on-primary hover:opacity-90"
            }`}
            aria-label={isPlaying ? "Dừng" : "Nghe & Shadowing"}
          >
            <span className="material-symbols-outlined text-sm">
              {isPlaying ? "stop" : "record_voice_over"}
            </span>
            {isPlaying
              ? (lang === "ja" ? "停止" : "Dừng")
              : (lang === "ja" ? "再生" : "Nghe")}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1 items-end mt-2">
          {words.map((w, i) => {
            const highlight = dlg.highlightWords?.find((h) => h.index === i);
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
        <p className="text-sm text-secondary mt-4 opacity-80">{dlg.lineJp}</p>
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
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isPlaying
              ? "bg-error/20 text-error animate-pulse"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
          aria-label="Nghe"
        >
          <span className="material-symbols-outlined text-sm">
            {isPlaying ? "stop" : "volume_up"}
          </span>
          {isPlaying ? (lang === "ja" ? "停止" : "Dừng") : (lang === "ja" ? "再生" : "Nghe")}
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
      <p className="text-sm text-secondary mt-2 opacity-80">{dlg.lineJp}</p>
    </div>
  );
}

// ─── Voice Lab (Mic Recorder) ─────────────────────────────────────────────────
function VoiceLab({ titleJp, subtitleJp, lang }: { titleJp: string; subtitleJp: string; lang: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState("Ready to record");
  const [elapsed, setElapsed] = useState(0);
  const [isPlayingRec, setIsPlayingRec] = useState(false);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    if (recRef.current?.state !== "inactive") recRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
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

  const startRec = async () => {
    try {
      if (recordedAudioUrl) { URL.revokeObjectURL(recordedAudioUrl); setRecordedAudioUrl(null); }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }));
        setRecordedAudioUrl(url);
        setIsPlayingRec(false);
        setCurTime(0);
        stream.getTracks().forEach((t) => t.stop());
        setStatusLabel("Ready to play");
      };
      recRef.current = rec;
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
    setStatusLabel("Ready to record");
  };

  const togglePlay = () => {
    if (!recordedAudioUrl || !audioRef.current) return;
    if (isPlayingRec) audioRef.current.pause();
    else { audioRef.current.currentTime = 0; audioRef.current.play(); }
  };

  const bars = [30, 60, 45, 80, 20, 55, 75, 40, 65, 30, 90, 50, 35];
  const statusIcon = isRecording ? "fiber_manual_record" : isPlayingRec ? "pause_circle" : recordedAudioUrl ? "play_circle" : "mic_none";

  const L = {
    voiceLab: lang === "ja" ? "ボイスラボ" : "Voice Lab",
    shadowing: lang === "ja" ? "シャドーイング中" : "Shadowing Active",
    analyzing: lang === "ja" ? "ピッチ分析中..." : "Analyzing Pitch...",
    accuracy: lang === "ja" ? "精度" : "Accuracy",
    fluency: lang === "ja" ? "流暢さ" : "Fluency",
    complete: lang === "ja" ? "完成度" : "Completeness",
    prosody: lang === "ja" ? "韻律" : "Prosody",
  };

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
          <p className="mt-6 text-center text-sm text-on-primary-container/90">{L.analyzing}</p>
          <p className="text-center text-xs text-on-primary-container/60 mt-1">{titleJp} — {subtitleJp}</p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center justify-center gap-8">
            <button onClick={reset} disabled={!recordedAudioUrl && !isRecording}
              className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Reset">
              <span className="material-symbols-outlined text-on-primary-container">replay</span>
            </button>
            <button onClick={isRecording ? stopRec : startRec}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isRecording ? "bg-error text-on-error" : "bg-secondary text-on-secondary hover:scale-105"}`}
              aria-label={isRecording ? "Stop" : "Record"}>
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRecording ? "stop" : "mic"}
              </span>
            </button>
            <button onClick={togglePlay} disabled={!recordedAudioUrl}
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
      <div className="grid grid-cols-2 gap-4">
        {[
          { val: "82%", label: "Accuracy", jp: L.accuracy },
          { val: "7.5", label: "Fluency", jp: L.fluency },
          { val: "90%", label: "Completeness", jp: L.complete },
          { val: "68%", label: "Prosody", jp: L.prosody },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-3xl text-center shadow-sm">
            <span className="block text-2xl font-headline font-extrabold text-primary">{s.val}</span>
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
  const lessonId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "1");
  const lesson = LESSONS[lessonId] ?? LESSONS["1"];
  const { lang, t } = useLanguage();

  const L = {
    toggleSubtitle: t("Bật/Tắt phụ đề", "字幕 ON/OFF"),
    back: t("Quay lại danh sách bài học", "レッスン一覧に戻る"),
    shadowingTip: t(
      "Bấm nút 'Nghe' để nghe từng câu, sau đó nhấn mic để luyện shadowing.",
      "「再生」ボタンで各文を聞き、その後マイクでシャドーイング練習をしましょう。"
    ),
    toneExamples: t("Ví dụ:", "例："),
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-24">
      <LearnerNavbar />
      <main className="pt-4 px-4 md:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

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
          {lesson.toneNotes && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lesson.toneNotes.map((note) => (
                <div key={note.tone} className="bg-surface-container-low rounded-2xl p-6 border-l-4"
                  style={{ borderColor: note.color }}>
                  <p className="font-headline font-extrabold text-xl mb-1" style={{ color: note.color }}>
                    {note.tone}
                  </p>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
                    {t(note.desc, note.descJp)}
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
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-sm">visibility_off</span>
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
              />
            ))}
          </div>

          <Link href="/learner/lessons"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {L.back}
          </Link>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-5">
          <VoiceLab titleJp={lesson.titleJp} subtitleJp={lesson.subtitleJp} lang={lang} />
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
