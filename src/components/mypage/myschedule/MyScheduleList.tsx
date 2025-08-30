// @/components/mypage/myschedule/MyScheduleList.tsx
"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { MyPageCard } from "@/types/schedule";
import MyScheduleCard from "@/components/mypage/myschedule/MyScheduleCard";
import type { MyScheduleItem } from "@/components/mypage/myschedule/MyScheduleContainer";
import SimplePopover from "@/components/common/SimplePopover";
import { validateTimeRange, setDefaultTimes } from "@/utils/mypageUtils";
import Checkbox from "@/components/common/Checkbox";

type Props = {
  items: MyScheduleItem[];
  projectList: string[];
  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  onChange: (id: string, patch: Partial<MyPageCard>) => void;
  onSave: (id: string) => void;
  onCancel: () => void;

  // 選択削除用
  deleteMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  partiallySelected: boolean;
};

type ConfirmKind = "autoAdjust" | "errorConfirm";

export default function MyScheduleList({
  items,
  projectList,
  editingId,
  setEditingId,
  onChange,
  onSave,
  onCancel,

  deleteMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  partiallySelected,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | string[]>("");
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>("autoAdjust");
  const [targetId, setTargetId] = useState<string | null>(null);

  const editingCard = useMemo(
    () => items.find((c) => c.id === editingId) ?? null,
    [items, editingId]
  );

  const handleEditStart = (id: string) => {
    setEditingId(id);
  };

  const handleSaveClick = (id: string) => {
    const card = items.find((c) => c.id === id);
    if (!card) return;

    const isStartEmpty = !card.startHour || !card.startMinute;
    const isEndEmpty = !card.endHour || !card.endMinute;

    if (isStartEmpty && isEndEmpty) {
      setConfirmMsg([
        "開始時間と終了時間が未入力です。",
        "変更を破棄して編集を終了しますか？",
      ]);
      setConfirmKind("errorConfirm");
      setTargetId(id);
      setConfirmOpen(true);
      return;
    }

    if (isStartEmpty || isEndEmpty) {
      const lines = [
        "以下の項目が未入力です。",
        isStartEmpty ? "開始時間 → 08:30" : "",
        isEndEmpty ? "終了時間 → 23:55" : "",
        "自動で調整して保存しますか？",
      ].filter(Boolean);
      setConfirmMsg(lines);
      setConfirmKind("autoAdjust");
      setTargetId(id);
      setConfirmOpen(true);
      return;
    }

    const error = validateTimeRange(
      card.startHour!,
      card.startMinute!,
      card.endHour!,
      card.endMinute!
    );
    if (error) {
      setConfirmMsg([error, "変更を破棄して編集を終了しますか？"]);
      setConfirmKind("errorConfirm");
      setTargetId(id);
      setConfirmOpen(true);
      return;
    }

    onSave(id);
  };

  const handleConfirm = () => {
    if (!targetId) {
      setConfirmOpen(false);
      return;
    }

    if (confirmKind === "autoAdjust") {
      const card = items.find((c) => c.id === targetId);
      if (card) {
        const patched = setDefaultTimes(
          card.startHour || "",
          card.startMinute || "",
          card.endHour || "",
          card.endMinute || ""
        );
        onChange(targetId, patched);
        onSave(targetId);
      }
    } else {
      onCancel();
    }
    setConfirmOpen(false);
    setTargetId(null);
  };

  const handleClose = () => {
    setConfirmOpen(false);
    setTargetId(null);
  };

  const confirmLabel =
    confirmKind === "autoAdjust" ? "自動調整して保存" : "破棄する";
  const cancelLabel = confirmKind === "autoAdjust" ? "キャンセル" : "戻る";

  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 全選択チェックボックス */}
      {deleteMode && (
        <div className="mb-2">
          <Checkbox
            checked={allSelected}
            indeterminate={partiallySelected}
            onChange={onToggleSelectAll}
            label="全選択"
          />
        </div>
      )}

      <ul className="space-y-3">
        {items.map((card) => (
          <li key={card.id} className="flex items-start gap-2">
            {deleteMode && (
              <Checkbox
                checked={selectedIds.has(card.id)}
                onChange={() => onToggleSelect(card.id)}
              />
            )}
            <MyScheduleCard
              {...card}
              isEditing={editingId === card.id}
              projectList={projectList}
              onChange={(patch) => onChange(card.id, patch)}
              onEditStart={() => handleEditStart(card.id)}
              onSaveClick={() => handleSaveClick(card.id)}
              actionPopover={
                targetId === card.id ? (
                  <SimplePopover
                    open={confirmOpen}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    message={confirmMsg}
                    confirmLabel={confirmLabel}
                    cancelLabel={cancelLabel}
                    tone="default"
                    className="absolute right-0 top-0"
                    initialFocus="none"
                  />
                ) : null
              }
              disableActions={confirmOpen} // ★ 全カード無効化
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
