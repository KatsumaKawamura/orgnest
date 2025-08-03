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
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].end <= s.start) active.splice(i, 1);
      }
      const usedSlots = active.map((a) => a.slotIndex);
      let slotIndex = 0;
      while (usedSlots.includes(slotIndex)) slotIndex++;
      s.slotIndex = slotIndex;
      active.push(s);
    });

    const maxSlot = Math.max(...arr.map((s) => s.slotIndex), 0) + 1;
    arr.forEach((s) => (s.slotCount = maxSlot));
  });

  return Object.values(grouped).flat();
}
