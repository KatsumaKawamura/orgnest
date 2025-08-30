// @/components/mypage/myschedule/MyScheduleCard.tsx
"use client";

import type { MyPageCard } from "@/types/schedule";
import MyScheduleTimeSelect from "@/components/mypage/myschedule/MyScheduleTimeSelect";
import MyScheduleProjectSelect from "@/components/mypage/myschedule/MyScheduleProjectSelect";
import MyScheduleNotes from "@/components/mypage/myschedule/MyScheduleNotes";
import Button from "@/components/common/Button";
import { Pencil, Check } from "lucide-react";

type Props = MyPageCard & {
  isEditing: boolean;
  projectList: string[];
  onChange: (updated: Partial<MyPageCard>) => void;
  onEditStart: () => void;
  onSaveClick: () => void;
  /** 保存ボタンの右上に重ねるポップ（SimplePopover等）を差し込むための口 */
  actionPopover?: React.ReactNode; // ★ 追加
  disableActions?: boolean;
};

// このファイル内で flag → 背景クラスを“リテラルで”決定
function bgClassForFlag(flag?: string): string {
  switch (flag) {
    case "現場":
      return "bg-[#E99F67]/20";
    case "打ち合わせ":
      return "bg-[#8AB5A3]/20";
    case "事務所":
    default:
      return "bg-[#F8F8F8]";
  }
}

export default function MyScheduleCard({
  startHour,
  startMinute,
  endHour,
  endMinute,
  project,
  notes,
  flag,
  isEditing,
  projectList,
  onChange,
  onEditStart,
  onSaveClick,
  actionPopover, // ★ 追加
  disableActions = false,
}: Props) {
  const bg = bgClassForFlag(flag); // ← 直書きリテラルに基づくので Tailwind が確実に拾う

  return (
    <div
      className={`w-full max-w-2xl rounded-lg border-2 p-4 border-gray-800 text-gray-800 ${bg}`}
    >
      {/* 上段：時間入力 + 編集/保存アイコン（同一行） */}
      <div className="mb-3 flex items-center justify-between">
        <MyScheduleTimeSelect
          startHour={startHour}
          startMinute={startMinute}
          endHour={endHour}
          endMinute={endMinute}
          isEditing={isEditing}
          onChange={onChange}
        />

        {isEditing ? (
          // ★ 保存ボタンをアンカー化（relative）し、右上にポップを重ねる
          <div className="relative inline-block">
            <Button
              variant="icon"
              size="sm"
              aria-label="保存"
              onClick={onSaveClick}
              title="保存"
              disabled={disableActions}
            >
              <Check className="h-5 w-5 text-green-600 hover:bg-gray-100 hover:text-green-700" />
            </Button>
            {actionPopover /* ← ここに SimplePopover を差し込む */}
          </div>
        ) : (
          <Button
            variant="icon"
            size="sm"
            aria-label="編集開始"
            onClick={onEditStart}
            title="編集"
            disabled={disableActions}
          >
            <Pencil className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* 下段：プロジェクト選択とメモ */}
      <div className="space-y-3">
        <MyScheduleProjectSelect
          value={project}
          options={projectList}
          flag={flag}
          isEditing={isEditing}
          onChange={(v) => onChange({ project: v })}
          onFlagChange={(f) => onChange({ flag: f })} // ← ここで state 更新 → 背景も即反映
        />

        <MyScheduleNotes
          notes={notes}
          isEditing={isEditing}
          onChange={(v) => onChange(v)}
        />
      </div>
    </div>
  );
}
