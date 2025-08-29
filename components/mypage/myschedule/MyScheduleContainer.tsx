// @/components/mypage/myschedule/MyScheduleContainer.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MyPageCard } from "@/types/schedule";
import { createNewCard } from "@/utils/mypageUtils";
import {
  loadAll,
  saveAll,
  upsert,
  remove as removeById,
} from "@/utils/myscheduleStorage";
import { fetchProjectList } from "@/utils/projectSource";
import MyScheduleList from "@/components/mypage/myschedule/MyScheduleList";
import MyScheduleActionBar from "@/components/mypage/myschedule/MyscheduleActionBar";

export type MyScheduleItem = MyPageCard & { date: string };

function todayJP(): string {
  const tz = "Asia/Tokyo";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function sortByTime<T extends { startHour?: string; startMinute?: string }>(
  arr: T[]
): T[] {
  return arr.slice().sort((a, b) => {
    const aSet = !!(a.startHour && a.startMinute);
    const bSet = !!(b.startHour && b.startMinute);
    if (!aSet && !bSet) return 0;
    if (!aSet) return 1;
    if (!bSet) return -1;
    const aMin = Number(a.startHour) * 60 + Number(a.startMinute);
    const bMin = Number(b.startHour) * 60 + Number(b.startMinute);
    return aMin - bMin;
  });
}

export default function MyScheduleContainer() {
  const [projectList, setProjectList] = useState<string[]>([]);
  const [items, setItems] = useState<MyScheduleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 選択削除モード
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const names = await fetchProjectList();
        if (!alive) return;
        setProjectList(names);
      } catch {
        setProjectList([]);
      }
    })();

    try {
      const all = loadAll();
      setItems(sortByTime(all));
    } catch {
      setItems([]);
    }

    return () => {
      alive = false;
    };
  }, []);

  const handleAdd = useCallback(() => {
    const base = createNewCard();
    const newItem: MyScheduleItem = { ...base, date: todayJP() };
    setItems((prev) => {
      const next = [...prev, newItem];
      saveAll(next);
      return sortByTime(next);
    });
    setEditingId(newItem.id);
  }, []);

  const handleChange = useCallback((id: string, patch: Partial<MyPageCard>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }, []);

  const handleSave = useCallback((id: string) => {
    setItems((prev) => {
      const cur = prev.find((it) => it.id === id);
      if (!cur) return prev;
      const withDate: MyScheduleItem = { ...cur, date: cur.date || todayJP() };
      const updated = upsert(withDate, prev);
      saveAll(updated);
      return sortByTime(updated);
    });
    setEditingId(null);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = removeById(id, prev);
        saveAll(next);
        return next;
      });
      if (editingId === id) setEditingId(null);
    },
    [editingId]
  );

  // 選択削除モードのトグル
  const handleToggleDeleteMode = useCallback(() => {
    setDeleteMode((v) => {
      const next = !v;
      if (!next) {
        setSelectedIds(new Set());
      } else {
        setEditingId(null); // 編集中は解除
      }
      return next;
    });
  }, []);

  // 個別選択のトグル
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 全選択のトグル
  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) {
        return new Set();
      } else {
        return new Set(items.map((c) => c.id));
      }
    });
  }, [items]);

  // 削除確定
  const handleConfirmDelete = useCallback(() => {
    setItems((prev) => {
      const next = prev.filter((c) => !selectedIds.has(c.id));
      saveAll(next);
      return next;
    });
    setSelectedIds(new Set());
    setDeleteMode(false);
    setEditingId(null);
  }, [selectedIds]);

  // 全選択状態の判定
  const allSelected = selectedIds.size > 0 && selectedIds.size === items.length;
  const partiallySelected =
    selectedIds.size > 0 && selectedIds.size < items.length;

  const sortedItems = useMemo(() => sortByTime(items), [items]);

  return (
    <div className="p-4">
      <MyScheduleActionBar
        deleteMode={deleteMode}
        onAdd={handleAdd}
        onToggleDeleteMode={handleToggleDeleteMode}
        onConfirmDelete={handleConfirmDelete}
        className="mb-3"
      />

      <MyScheduleList
        items={sortedItems}
        projectList={projectList}
        editingId={editingId}
        setEditingId={setEditingId}
        onChange={handleChange}
        onSave={handleSave}
        onCancel={handleCancel}
        deleteMode={deleteMode}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        allSelected={allSelected}
        partiallySelected={partiallySelected}
      />
    </div>
  );
}
