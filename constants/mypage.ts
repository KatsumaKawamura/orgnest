// components/schedule/mypage/MyPageConstants.ts

// フラグ選択肢
export const FLAG_OPTIONS = ["事務所", "現場", "打ち合わせ"] as const;

// 時間選択肢
export const HOURS = [
  ...Array.from({ length: 18 }, (_, i) => String(i + 6).padStart(2, "0")), // 6〜23
  ...Array.from({ length: 6 }, (_, i) => String(i).padStart(2, "0")), // 0〜5
];

export const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

// デフォルト時刻
export const DEFAULT_START = { hour: "08", minute: "30" };
export const DEFAULT_END = { hour: "23", minute: "55" };

// バリデーションメッセージ
export const VALIDATION_MESSAGES = {
  EMPTY_BOTH: "開始時間と終了時間を入力してください",
  INVALID_RANGE: "終了時間は開始時間より後にしてください",
};

// フラグごとのカード背景色
export const FLAG_COLORS: Record<string, string> = {
  事務所: "bg-[#F8F8F8]",
  現場: "bg-[#E99F67]/20",
  打ち合わせ: "bg-[#8AB5A3]/20",
};

// 保存後のソートディレイ（ms）
export const SORT_DELAY_MS = 600; // 保存後のソートディレイ（ms）
