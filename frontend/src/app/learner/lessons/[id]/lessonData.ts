export interface Dialogue {
  speaker: string;
  speakerJp: string;
  lineVi: string;
  lineJp: string;
  isActive?: boolean;
  highlightWords?: { index: number; color: string }[];
}

export interface ToneNote {
  tone: string;
  desc: string;
  descJp: string;
  example: string;
  color: string;
}

export interface LessonData {
  sceneLabel: string;
  sceneLabelJp: string;
  titleVi: string;
  titleJp: string;
  subtitleVi: string;
  subtitleJp: string;
  dialogues: Dialogue[];
  toneNotes?: ToneNote[];
}

export const LESSONS: Record<string, LessonData> = {
  "1": {
    sceneLabel: "Bài 02 • Chương 1",
    sceneLabelJp: "レッスン02 • 第1章",
    titleVi: "Thanh hỏi & Thanh ngã",
    titleJp: "疑問声調と転がり声調",
    subtitleVi: "Luyện tập hai thanh điệu khó nhất của tiếng Bắc",
    subtitleJp: "北部ベトナム語の最難関声調をマスターしよう",
    toneNotes: [
      {
        tone: "Thanh hỏi (?)",
        desc: "Bắt đầu thấp, xuống rồi lên nhẹ — như hỏi han",
        descJp: "低く始まり、下がってから少し上がる — 問いかけるような声調",
        example: "bể, ngỏ, để, mỉa",
        color: "var(--secondary)",
      },
      {
        tone: "Thanh ngã (~)",
        desc: "Bắt đầu cao, gãy giữa chừng với tiếng tắt thanh quản",
        descJp: "高く始まり、途中で声門閉鎖音で切れる — 強くシャープな声調",
        example: "bẽ, ngõ, dễ, mãi",
        color: "var(--error)",
      },
    ],
    dialogues: [
      {
        speaker: "GIÁO VIÊN",
        speakerJp: "先生",
        lineVi: "Bạn thử đọc: Ngỏ nhỏ và Ngõ nhỏ xem nào.",
        lineJp: "試しに読んでみて：「Ngỏ nhỏ」と「Ngõ nhỏ」。",
      },
      {
        speaker: "BẠN",
        speakerJp: "あなた",
        lineVi: "Ngỏ nhỏ... Ngõ nhỏ.",
        lineJp: "ンゴォ・ニョォ... ンゴォ・ニョォ。",
        isActive: true,
        highlightWords: [
          { index: 0, color: "var(--secondary)" },
          { index: 2, color: "var(--error)" },
        ],
      },
      {
        speaker: "GIÁO VIÊN",
        speakerJp: "先生",
        lineVi: "Rất tốt! Thanh ngã cần bị gãy — hãy cảm nhận tiếng tắt.",
        lineJp: "よくできました！「ngã」は途中で切れます。声門閉鎖音を感じて。",
      },
    ],
  },
  "2": {
    sceneLabel: "Bài 01 • Chương 1",
    sceneLabelJp: "レッスン01 • 第1章",
    titleVi: "Thanh sắc & Thanh huyền",
    titleJp: "昇り声調と降り声調",
    subtitleVi: "Nền tảng âm điệu — học cách lên và xuống giọng đúng chuẩn Hà Nội",
    subtitleJp: "声調の基礎 — ハノイ式の上がり・下がりを正しく習得しよう",
    toneNotes: [
      {
        tone: "Thanh sắc (/)",
        desc: "Bắt đầu từ giữa, lên cao và căng — nghe mạnh, rõ ràng",
        descJp: "中音から高音へ上がる、張りのある声調 — 強くはっきり聞こえる",
        example: "bé, cá, mái, tớ",
        color: "var(--primary)",
      },
      {
        tone: "Thanh huyền (\\)",
        desc: "Bắt đầu cao vừa, xuống thấp dần — nghe trầm, nhẹ nhàng",
        descJp: "中高音から低音へ下がる — 落ち着いた穏やかな声調",
        example: "bề, cà, mài, tờ",
        color: "var(--secondary)",
      },
    ],
    dialogues: [
      {
        speaker: "GIÁO VIÊN",
        speakerJp: "先生",
        lineVi: "Chúng ta học thanh sắc trước. Đọc theo tôi: Cá má bé.",
        lineJp: "まず「thanh sắc（昇り声調）」を練習。私の後に：「Cá má bé」。",
      },
      {
        speaker: "BẠN",
        speakerJp: "あなた",
        lineVi: "Cá má bé.",
        lineJp: "カー、マー、ベー。",
        isActive: true,
        highlightWords: [
          { index: 0, color: "var(--primary)" },
          { index: 1, color: "var(--primary)" },
          { index: 2, color: "var(--primary)" },
        ],
      },
      {
        speaker: "GIÁO VIÊN",
        speakerJp: "先生",
        lineVi: "Tốt lắm! Bây giờ thanh huyền: Cà mà bè. Giọng xuống nhẹ nhé.",
        lineJp: "よかった！次は「thanh huyền」：「Cà mà bè」。優しく下げてね。",
      },
    ],
  },
  "3": {
    sceneLabel: "Bài 01 • Chương 2",
    sceneLabelJp: "レッスン01 • 第2章",
    titleVi: "Gọi món tại quán Bún Chả",
    titleJp: "ブンチャー屋での注文",
    subtitleVi: "Hội thoại thực tế tại quán ăn Hà Nội",
    subtitleJp: "ハノイの食堂での実践会話",
    dialogues: [
      {
        speaker: "BÁN HÀNG",
        speakerJp: "店員",
        lineVi: "Em ơi em dùng bún chả hay bún nem?",
        lineJp: "お姉さん、ブンチャーにしますか、それともブンネムにしますか？",
      },
      {
        speaker: "BẠN",
        speakerJp: "あなた",
        lineVi: "Cho em một suất bún chả nhé.",
        lineJp: "ブンチャーを一つください。",
        isActive: true,
        highlightWords: [
          { index: 3, color: "var(--secondary)" },
          { index: 5, color: "var(--error)" },
        ],
      },
      {
        speaker: "BÁN HÀNG",
        speakerJp: "店員",
        lineVi: "Có ngay! Đợi chị một chút.",
        lineJp: "すぐ行きます！ちょっと待ってね。",
      },
    ],
  },
};
