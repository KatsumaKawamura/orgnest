// @/utils/myscheduleStorage.ts
import { MyPageCard } from "@/types/schedule";
import type { MyScheduleItem } from "@/components/mypage/myschedule/MyScheduleContainer";

const KEY = "myschedule:all";

function safeParse<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function loadAll(): MyScheduleItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<MyScheduleItem[]>(localStorage.getItem(KEY), []);
}

export function saveAll(items: MyScheduleItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function upsert(
  item: MyScheduleItem,
  base?: MyScheduleItem[]
): MyScheduleItem[] {
  const items = base ?? loadAll();
  const idx = items.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const next = items.slice();
    next[idx] = { ...items[idx], ...item };
    return next;
  }
  return [...items, item];
}

export function remove(id: string, base?: MyScheduleItem[]): MyScheduleItem[] {
  const items = base ?? loadAll();
  return items.filter((x) => x.id !== id);
}
