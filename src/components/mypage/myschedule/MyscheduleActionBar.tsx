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

  // 既定: スロット1（選択 or 戻る）
  const defaultSlot1 = (
    <Button
      onClick={onToggleDeleteMode}
      variant="secondary"
      className="flex items-center w-full sm:w-auto justify-center"
    >
      {deleteMode ? "戻る" : "選択"}
    </Button>
  );

  // 既定: スロット2（削除）※削除モード時のみ見える
  const defaultSlot2Visible = (
    <div className="relative inline-block w-full sm:w-auto">
      <Button
        onClick={open}
        variant="danger"
        className="flex items-center w-full sm:w-auto justify-center"
      >
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
      className="relative inline-block pointer-events-none w-full sm:w-auto"
      aria-hidden="true"
    >
      <div className="invisible">
        <Button
          className="flex items-center w-full sm:w-auto justify-center"
          variant="danger"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          削除
        </Button>
      </div>
    </div>
  );

  const slot2Node =
    slot2 ?? (deleteMode ? defaultSlot2Visible : slot2Placeholder);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2 mb-4 relative ${className}`}
    >
      {/* 上段：追加ボタン（スマホは幅いっぱい） */}
      <div className="shrink-0 w-full sm:w-auto">
        <Button
          onClick={onAdd}
          variant="primary"
          className="flex items-center shrink-0 whitespace-nowrap w-full sm:w-auto justify-center"
        >
          予定を追加
        </Button>
      </div>

      {/* 下段：スマホは2カラム/各カラム内ボタンが幅いっぱい。PCは横並び */}
      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:ml-2">
        <div className="w-full sm:w-auto flex">{slot1 ?? defaultSlot1}</div>
        <div className="w-full sm:w-auto flex">{slot2Node}</div>
      </div>
    </div>
  );
}
