import { FLAG_COLORS } from "@/constants/timeline";

// utils/timeline.ts
export function calculateBarPosition(
  start: string,
  end: string,
  startHour: number,
  pxPerMinute: number,
  memberIndex: number,
  memberColumnWidth: number,
  slotIndex: number,
  slotCount: number,
  padding: number
) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = (sh - startHour) * 60 + sm;
  const endMinutes = (eh - startHour) * 60 + em;

  const top = startMinutes * pxPerMinute;
  const height = (endMinutes - startMinutes) * pxPerMinute;

  const slotWidth = memberColumnWidth / slotCount;
  const width = slotWidth - padding * 2;
  const left =
    memberIndex * memberColumnWidth + slotIndex * slotWidth + padding;

  return { top, height, width, left };
}

export function getFlagColor(flag: string): string {
  return FLAG_COLORS[flag] || FLAG_COLORS.default;
}
