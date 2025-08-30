// @/components/mypage/myschedule/MyscheduleActionBar.tsx
"use client";

import { Trash2 } from "lucide-react";
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

  // 既定: スロット1（選択 or 戻る）※ Trashアイコンは外す
  const defaultSlot1 = (
    <Button
      onClick={onToggleDeleteMode}
      variant="secondary"
      className="flex items-center"
    >
      {deleteMode ? "戻る" : "選択"}
    </Button>
  );

  // 既定: スロット2（削除）※削除モード時のみ見える／Trashアイコンはこちらへ
  const defaultSlot2Visible = (
    <div className="relative inline-block">
      <Button onClick={open} variant="danger" className="flex items-center">
        <Trash2 className="w-5 h-5 mr-2" />
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
          initialFocus="none"
          tone="danger"
        />
      )}
    </div>
  );

  // 幅固定用のプレースホルダ（削除モードでない時）
  const slot2Placeholder = (
    <div
      className="relative inline-block pointer-events-none"
      aria-hidden="true"
    >
      <div className="invisible">
        <Button variant="danger" className="flex items-center">
          <Trash2 className="w-5 h-5 mr-2" />
          削除
        </Button>
      </div>
    </div>
  );

  const slot2Node =
    slot2 ?? (deleteMode ? defaultSlot2Visible : slot2Placeholder);

  return (
    <div className={`flex items-center gap-2 mb-4 relative ${className}`}>
      {/* 追加ボタン（固定位置） */}
      <Button
        onClick={onAdd}
        variant="primary"
        className="flex items-center shrink-0 whitespace-nowrap"
      >
        予定を追加
      </Button>

      {/* スロット群：選択/戻る（常在）＋ 削除（モード時のみ、未時は幅固定） */}
      <div className="flex items-center gap-2">
        <div className="inline-flex">{slot1 ?? defaultSlot1}</div>
        <div className="inline-flex">{slot2Node}</div>
      </div>
    </div>
  );
}
