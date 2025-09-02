export const BAR_PADDING = 2; // バー左右の余白
export const DEFAULT_MEMBER_COLUMN_WIDTH = 120;
export const DEFAULT_PX_PER_MINUTE = 2;

export const DEFAULT_START_HOUR = 7.5; // デフォルト開始時間
export const DEFAULT_END_HOUR = 24.5; // デフォルト終了時間

// Tooltip関連
export const TOOLTIP_DELAY = 0; // 表示ディレイ(ms)
export const TOOLTIP_FADE_DURATION = 100; // フェード時間(ms)

export const FLAG_COLORS: Record<string, string> = {
  事務所: "bg-[#F8F8F8]",
  現場: "bg-[#E99F67]",
  打ち合わせ: "bg-[#8AB5A3]",
  default: "bg-[#F8F8F8]",
};

// ===== 追加: タイムライン表示窓の高さ（左右で共用する Tailwind クラス） =====
export const TIMELINE_VIEWPORT_CLASS = "h-[70vh] sm:h-[85vh] sm:max-h-[720px]";
