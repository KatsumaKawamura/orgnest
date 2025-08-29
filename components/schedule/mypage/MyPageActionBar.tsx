// @/components/mypage/MyPageActionBar.tsx
// @ts-nocheck
"use client";

import { Plus, Trash2 } from "lucide-react";
import SimplePopover from "@/components/common/SimplePopover";
import Button from "@/components/common/Button";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

type Props = {
  deleteMode: boolean;
  onAdd: () => void;
  onToggleDeleteMode: () => void;
  onConfirmDelete: () => void;
  className?: string;
  slot1?: React.ReactNode;
  slot2?: React.ReactNode;
};

export default function MyPageActionBar({
  deleteMode,
  onAdd,
  onToggleDeleteMode,
  onConfirmDelete,
  className = "",
  slot1,
  slot2,
}: Props) {
  const { isOpen, open, close } = useConfirmDialog();

  // 既定: スロット1（選択 or 戻る）
  const defaultSlot1 = (
    <Button
      onClick={onToggleDeleteMode}
      variant="secondary"
      className="flex items-center"
    >
      <Trash2 className="w-5 h-5 mr-2 text-gray-800" />
      {deleteMode ? "戻る" : "選択"}
    </Button>
  );

  // 既定: スロット2（削除）※削除モード時のみ見える
  const defaultSlot2Visible = (
    <div className="relative inline-block">
      <Button onClick={open} variant="danger">
        削除
      </Button>

      {isOpen && (
        <SimplePopover
          open={isOpen}
          onClose={close}
          onConfirm={() => {
            onConfirmDelete();
            close();
          }}
          message="選択したカードを削除しますか？"
          confirmLabel="削除"
          cancelLabel="戻る"
          initialFocus="confirm"
        />
      )}
    </div>
  );

  /**
   * レイアウト固定のキモ:
   * slot2 が無い時も「同じ幅」のダミーを置いて幅を確保する。
   * - visibility: hidden で不可視化（スペースは保持）
   * - pointer-events: none + aria-hidden で非操作・非アクセシブル
   * - 中身は実際の削除ボタンと同じ要素構造にして幅を揃える
   */
  const slot2Placeholder = (
    <div
      className="relative inline-block pointer-events-none"
      aria-hidden="true"
    >
      <div className="invisible">
        <Button variant="danger">削除</Button>
      </div>
    </div>
  );

  const slot2Node =
    slot2 ??
    (deleteMode
      ? defaultSlot2Visible
      : // 通常時はプレースホルダで幅だけ確保
        slot2Placeholder);

  return (
    <div className={`flex items-center gap-2 mb-4 relative ${className}`}>
      {/* 追加ボタン（固定位置） */}
      <Button
        onClick={onAdd}
        variant="primary"
        className="flex items-center w-auto"
      >
        <Plus className="w-5 h-5 mr-2" />
        予定を追加
      </Button>

      {/* ボタン群：スロット1（常在）・スロット2（プレースホルダで幅固定） */}
      <div className="flex items-center gap-2">
        <div className="inline-flex">{slot1 ?? defaultSlot1}</div>
        <div className="inline-flex">{slot2Node}</div>
      </div>
    </div>
  );
}
