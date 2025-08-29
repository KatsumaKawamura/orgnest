// @/utils/mypageUtils.ts
import { MyPageCard } from "@/types/schedule";
import { FLAG_OPTIONS } from "@/constants/mypage";

export const createNewCard = (): MyPageCard => ({
  id: crypto.randomUUID(),
  startHour: "",
  startMinute: "",
  endHour: "",
  endMinute: "",
  project: "",
  notes: "",
  flag: FLAG_OPTIONS[0],
});

// 保存時のみ時間昇順でソート
export const sortCards = (cards: MyPageCard[]): MyPageCard[] => {
  return cards.slice().sort((a, b) => {
    const aStart =
      a.startHour && a.startMinute
        ? Number(a.startHour) * 60 + Number(a.startMinute)
        : Infinity;
    const bStart =
      b.startHour && b.startMinute
        ? Number(b.startHour) * 60 + Number(b.startMinute)
        : Infinity;

    return aStart - bStart; // 時間昇順のみ
  });
};

export const toggleSelection = (selectedIds: string[], id: string): string[] =>
  selectedIds.includes(id)
    ? selectedIds.filter((i) => i !== id)
    : [...selectedIds, id];

export const selectAllOrClear = (
  selectedIds: string[],
  cards: MyPageCard[]
): string[] =>
  selectedIds.length === cards.length ? [] : cards.map((c) => c.id);

export const validateTimeRange = (
  startHour: string,
  startMinute: string,
  endHour: string,
  endMinute: string
): string | null => {
  const start = Number(startHour) * 60 + Number(startMinute);
  const end = Number(endHour) * 60 + Number(endMinute);
  if (start >= end) return "開始時間は終了時間より前にしてください。";
  return null;
};

export const setDefaultTimes = (
  startHour: string,
  startMinute: string,
  endHour: string,
  endMinute: string
): Partial<MyPageCard> => ({
  startHour: startHour || "08",
  startMinute: startMinute || "30",
  endHour: endHour || "23",
  endMinute: endMinute || "55",
});
