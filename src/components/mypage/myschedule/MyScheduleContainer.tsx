// @/components/mypage/myschedule/MyScheduleContainer.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { MyPageCard } from "@/types/schedule";
import MyScheduleList from "@/components/mypage/myschedule/MyScheduleList";
import MyScheduleActionBar from "@/components/mypage/myschedule/MyscheduleActionBar";
import { createNewCard } from "@/utils/mypageUtils";

export type MyScheduleItem = MyPageCard & { id: string; date: string };

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

export default function MyScheduleContainer() {
  const [projectList, setProjectList] = useState<string[]>([]);
  const [items, setItems] = useState<MyScheduleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // プロジェクト一覧
  useEffect(() => {
    fetch("/api/project-list", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setProjectList(list.map((p: any) => p.project)))
      .catch(() => setProjectList([]));
  }, []);

  // 当日のスケジュール取得（DB → UI へ snake_case → camelCase 変換）
  const loadSchedules = useCallback(async () => {
    try {
      const res = await fetch(`/api/myschedule`, {
        credentials: "include",
      });
      if (res.ok) {
        const raw: any[] = await res.json();
        const mapped: MyScheduleItem[] = (raw ?? []).map((r) => ({
          id: String(r.id),
          date: r.date,
          startHour:
            r.start_hour === null || r.start_hour === undefined
              ? ""
              : String(r.start_hour).padStart(2, "0"),
          startMinute:
            r.start_minute === null || r.start_minute === undefined
              ? ""
              : String(r.start_minute).padStart(2, "0"),
          endHour:
            r.end_hour === null || r.end_hour === undefined
              ? ""
              : String(r.end_hour).padStart(2, "0"),
          endMinute:
            r.end_minute === null || r.end_minute === undefined
              ? ""
              : String(r.end_minute).padStart(2, "0"),
          project: r.project ?? "",
          notes: r.notes ?? "",
          flag: r.flag ?? "",
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 追加：未保存カードには tmp_ を付与
  const handleAdd = useCallback(() => {
    const base = createNewCard();
    const newItem: MyScheduleItem = {
      ...base,
      id: `tmp_${base.id}`,
      date: todayJP(),
    };
    setItems((prev) => [newItem, ...prev]);
    setEditingId(newItem.id);
  }, []);

  // 入力変更（未保存ローカル更新）
  const handleChange = useCallback((id: string, patch: Partial<MyPageCard>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }, []);

  // 保存：tmp_ は POST、それ以外は PUT → 保存後のみ再取得
  const handleSave = useCallback(
    async (id: string) => {
      const target = items.find((it) => it.id === id);
      if (!target) return;

      const payload = {
        date: todayJP(),
        start_hour:
          target.startHour !== "" && target.startHour != null
            ? Number(target.startHour)
            : null,
        start_minute:
          target.startMinute !== "" && target.startMinute != null
            ? Number(target.startMinute)
            : null,
        end_hour:
          target.endHour !== "" && target.endHour != null
            ? Number(target.endHour)
            : null,
        end_minute:
          target.endMinute !== "" && target.endMinute != null
            ? Number(target.endMinute)
            : null,
        project: target.project ?? "",
        notes: target.notes ?? null,
        flag: target.flag ?? "",
      };

      try {
        if (id.startsWith("tmp_")) {
          await fetch("/api/myschedule", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(`/api/myschedule/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        await loadSchedules(); // 保存後のみ整列したリストを再取得
      } catch (e) {
        console.error("save failed", e);
      }
      setEditingId(null);
    },
    [items, loadSchedules]
  );

  const handleCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  // 選択削除モード
  const handleToggleDeleteMode = useCallback(() => {
    setDeleteMode((v) => {
      const next = !v;
      if (!next) setSelectedIds(new Set());
      else setEditingId(null);
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((c) => c.id))
    );
  }, [items]);

  // 複数削除：tmp_ はローカル削除、DB id は DELETE
  const handleConfirmDelete = useCallback(async () => {
    const tmpIds: string[] = [];
    const dbIds: string[] = [];
    for (const id of selectedIds) {
      if (id.startsWith("tmp_")) tmpIds.push(id);
      else dbIds.push(id);
    }

    // DB削除
    for (const id of dbIds) {
      try {
        await fetch(`/api/myschedule/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (e) {
        console.error("delete failed", e);
      }
    }

    // ローカル削除（tmp_）
    if (tmpIds.length > 0) {
      setItems((prev) => prev.filter((c) => !tmpIds.includes(c.id)));
    }

    // DB側が変わったので再取得
    if (dbIds.length > 0) {
      await loadSchedules();
    }

    setSelectedIds(new Set());
    setDeleteMode(false);
    setEditingId(null);
  }, [selectedIds, loadSchedules]);

  const allSelected = selectedIds.size > 0 && selectedIds.size === items.length;
  const partiallySelected =
    selectedIds.size > 0 && selectedIds.size < items.length;

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
        items={items}
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
