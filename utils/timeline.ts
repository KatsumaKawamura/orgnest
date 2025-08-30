// @/utils/timeline.ts
import { FLAG_COLORS } from "@/constants/timeline";

/**
 * minベースの座標計算
 * @param startMin 開始（分）
 * @param endMin   終了（分）
 * @param startHour タイムラインの開始時刻（少数可）
 * @param pxPerMinute 1分あたりのピクセル
 * @param memberIndex メンバー列のインデックス（0基点）
 * @param memberColumnWidth 各メンバー列の幅
 * @param slotIndex 重なり時のスロット番号
 * @param slotCount 同時間帯の重なり総数
 * @param padding バー左右の余白
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

export function getFlagColor(flag: string): string {
  return FLAG_COLORS[flag] || FLAG_COLORS.default;
}
