// @/constants/timeline.ts
export const BAR_PADDING = 2; // バー左右の余白
export const DEFAULT_MEMBER_COLUMN_WIDTH = 120;
export const DEFAULT_PX_PER_MINUTE = 2;

export const DEFAULT_START_HOUR = 7.5; // デフォルト開始時間
export const DEFAULT_END_HOUR = 24.5; // デフォルト終了時間

// Tooltip関連
export const TOOLTIP_DELAY = 0; // 表示ディレイ(ms)
export const TOOLTIP_FADE_DURATION = 100; // フェード時間(ms)

/**
 * 単一ソース（HEX）
 * 事務所：#F8F8F8 / 現場：#E99F67 / 打ち合わせ：#8AB5A3 / default：#F8F8F8
 */
export const FLAG_HEX: Record<string, string> = {
  事務所: "#F8F8F8",
  現場: "#E99F67",
  打ち合わせ: "#8AB5A3",
  default: "#F8F8F8",
};

/**
 * 後方互換：Timeline（不透明）向けのクラス文字列
 * 既存の getFlagColor() から参照される想定
 */
export const FLAG_COLORS: Record<string, string> = {
  事務所: "bg-[#F8F8F8] hover:bg-[#E0E0E0] focus:bg-[#E0E0E0]",
  現場: "bg-[#E99F67] hover:bg-[#F1B380] focus:bg-[#F1B380]",
  打ち合わせ: "bg-[#8AB5A3] hover:bg-[#A1C8B6] focus:bg-[#A1C8B6]",
  default: "bg-[#F8F8F8] hover:bg-[#E0E0E0] focus:bg-[#E0E0E0]",
};

/**
 * MyPage（カード /20 透過）向けのクラス文字列
 * Tailwind 抽出のため“リテラル”で保持（安全）
 */
export const FLAG_COLORS_MYPAGE: Record<string, string> = {
  事務所: "bg-[#F8F8F8]/20",
  現場: "bg-[#E99F67]/20",
  打ち合わせ: "bg-[#8AB5A3]/20",
  default: "bg-[#F8F8F8]/20",
};

// タイムライン表示窓の高さ（左右で共用する Tailwind クラス）
export const TIMELINE_VIEWPORT_CLASS = "h-[70vh] sm:h-[85vh] sm:max-h-[720px]";
