// @/utils/timeline.ts
import { FLAG_COLORS, FLAG_COLORS_MYPAGE } from "@/constants/timeline";

/**
 * minベースの座標計算
 */
export function calculateBarPosition(
  startMin: number,
  endMin: number,
  startHour: number,
  pxPerMinute: number,
  memberIndex: number,
  memberColumnWidth: number,
  slotIndex: number,
  slotCount: number,
  padding: number
) {
  const startBaseMin = Math.round(startHour * 60);
  const top = (startMin - startBaseMin) * pxPerMinute;
  const height = (endMin - startMin) * pxPerMinute;

  const slotWidth = memberColumnWidth / Math.max(1, slotCount);
  const width = slotWidth - padding * 2;
  const left =
    memberIndex * memberColumnWidth + slotIndex * slotWidth + padding;

  return { top, height, width, left };
}

/**
 * 文脈別の背景クラス（固定文字列で返すので Tailwind 抽出に安全）
 * ctx: "timeline" | "mypage"
 */
export function getFlagBg(
  flag: string,
  ctx: "timeline" | "mypage" = "timeline"
): string {
  if (ctx === "mypage") {
    return FLAG_COLORS_MYPAGE[flag] || FLAG_COLORS_MYPAGE.default;
  }
  return FLAG_COLORS[flag] || FLAG_COLORS.default;
}

/**
 * 後方互換：既存の Timeline 向け API
 * ＝ timeline (不透明) を返す
 */
export function getFlagColor(flag: string): string {
  return getFlagBg(flag, "timeline");
}
