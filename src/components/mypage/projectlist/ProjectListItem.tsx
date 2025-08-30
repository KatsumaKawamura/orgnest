// @/components/mypage/projectlist/ProjectListItem.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Project } from "@/hooks/useProjectApi";
import Button from "@/components/common/Button";
import { Pencil, Check } from "lucide-react";
import {
  PROJECT_TEXT_COLOR,
  PROJECT_EDIT_PLACEHOLDER,
  PROJECT_VALIDATION_ERROR,
} from "@/constants/project";

type Props = {
  item: Project;

  // 編集（親管理：短編集）
  isEditing: boolean;
  editDisabled: boolean;
  value: string; // 親の state（編集中の値）
  setValue: (v: string) => void; // 親の setEditValue

  // 操作（親ハンドラ）
  onStartEdit: () => void;
  onSave: () => void; // 空→削除 / 値→更新 は親で判定
  onCancel: () => void;

  // 状態
  busy?: boolean;
  errorMessage?: string | null;
};

export default function ProjectListItem({
  item,
  isEditing,
  editDisabled,
  value,
  setValue,
  onStartEdit,
  onSave,
  onCancel,
  busy,
  errorMessage,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  // バリデーション
  const trimmed = useMemo(
    () => (isEditing ? value.trim() : item.project),
    [isEditing, value, item.project]
  );
  const tooLong = isEditing && trimmed.length > 100;

  return (
    <li className="flex items-center gap-2">
      {/* 本文 / 編集欄 */}
      <div className="flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !tooLong && !busy) onSave();
              if (e.key === "Escape" && !busy) onCancel();
            }}
            disabled={!!busy}
            className={`w-full px-2 py-1 bg-transparent border-0 border-b border-gray-400 focus:outline-none focus:border-gray-800 ${PROJECT_TEXT_COLOR}`}
            aria-label="プロジェクト名編集"
            placeholder={PROJECT_EDIT_PLACEHOLDER}
          />
        ) : (
          <span className={PROJECT_TEXT_COLOR}>{item.project}</span>
        )}
      </div>

      {/* 右端アイコンボタン（✎ / ✓）— Header のギアと同じ Button を使用 */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Button
            variant="icon"
            size="sm"
            onClick={onSave}
            disabled={!!busy || tooLong}
            aria-label="保存"
            title="保存"
            // 丸＋緑トーン（塗り）
            className="rounded-full bg-transparent text-green-600 hover:bg-gray-100 hover:text-green-700 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="icon"
            size="sm"
            onClick={onStartEdit}
            disabled={editDisabled || !!busy}
            aria-label="編集"
            title="編集"
            // 丸＋枠線グレー＋背景透過（ヘッダーの雰囲気を踏襲）
            className="rounded-full border border-gray-800 text-gray-800 bg-transparent hover:bg-gray-100 disabled:opacity-50"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 行内エラー */}
      {tooLong && (
        <span className="ml-2 text-sm text-red-600">
          {PROJECT_VALIDATION_ERROR}
        </span>
      )}
      {errorMessage && !tooLong && (
        <span className="ml-2 text-sm text-red-600">{errorMessage}</span>
      )}
    </li>
  );
}
