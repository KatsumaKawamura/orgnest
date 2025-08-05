import { Schedule } from "@/types/schedule";

/**
 * スケジュールの重なりを考慮して slotIndex / slotCount を割り当て
 */
export function assignSlots(schedules: Schedule[]): Schedule[] {
  const grouped: Record<number, Schedule[]> = {};

  schedules.forEach((s) => {
    if (!grouped[s.memberId]) grouped[s.memberId] = [];
    grouped[s.memberId].push(s);
  });

  Object.keys(grouped).forEach((memberId) => {
    const arr = grouped[Number(memberId)];
    arr.sort((a, b) => a.start.localeCompare(b.start));

    const active: Schedule[] = [];
    arr.forEach((s) => {
      // 終了したものを削除
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].end <= s.start) active.splice(i, 1);
      }

      // 空いているスロット番号を探す
      const usedSlots = active.map((a) => a.slotIndex);
      let slotIndex = 0;
      while (usedSlots.includes(slotIndex)) slotIndex++;
      s.slotIndex = slotIndex;

      active.push(s);

      // 現在の重なり数（自分＋アクティブ）を全員にセット
      const overlapCount = active.length;
      active.forEach((a) => (a.slotCount = overlapCount));
    });
  });

  return Object.values(grouped).flat();
}
