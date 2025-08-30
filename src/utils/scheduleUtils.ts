// @/utils/scheduleUtils.ts
import { Schedule } from "@/types/schedule";

/**
 * スケジュールの重なりを考慮して slotIndex / slotCount を割り当て（minベース）
 * - 同一 userId 単位で重なりを解消
 */
export function assignSlots(schedules: Schedule[]): Schedule[] {
  const grouped: Record<string, Schedule[]> = {};

  schedules.forEach((s) => {
    if (!grouped[s.userId]) grouped[s.userId] = [];
    grouped[s.userId].push(s);
  });

  Object.keys(grouped).forEach((userId) => {
    const arr = grouped[userId];

    // 開始時刻（分）で昇順
    arr.sort((a, b) => a.startMin - b.startMin);

    const active: Schedule[] = [];
    arr.forEach((s) => {
      // 現在のスケジュール s の開始までに終了したものを active から外す
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].endMin <= s.startMin) active.splice(i, 1);
      }

      // 空いているスロット番号を探す
      const usedSlots = active.map((a) => a.slotIndex);
      let slotIndex = 0;
      while (usedSlots.includes(slotIndex)) slotIndex++;
      s.slotIndex = slotIndex;

      // active に追加
      active.push(s);

      // 現在の重なり数（自身含む）を全員に反映
      const overlapCount = active.length;
      active.forEach((a) => (a.slotCount = overlapCount));
    });
  });

  // 順序は問わないため単純結合
  return Object.values(grouped).flat();
}
