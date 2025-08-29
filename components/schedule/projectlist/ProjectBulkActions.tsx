// components/schedule/projectlist/ProjectBulkActions.tsx
"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";

interface ProjectBulkActionsProps {
  deleteMode: boolean;
  onToggleDeleteMode: () => void;
  onBulkDelete: () => void;
  showConfirm: boolean;
  onShowConfirm: () => void;
  onCancelConfirm: () => void;
}

export default function ProjectBulkActions({
  deleteMode,
  onToggleDeleteMode,
  onBulkDelete,
  showConfirm,
  onShowConfirm,
  onCancelConfirm,
}: ProjectBulkActionsProps) {
  return (
    <div className="flex space-x-2 w-[220px] justify-end">
      {/* 削除モード トグル */}
      <button
        type="button"
        onClick={onToggleDeleteMode}
        className="flex items-center justify-center w-[120px] px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
      >
        {deleteMode ? "終了" : "削除モード"}
      </button>

      {/* 一括削除（削除モード時のみ表示） */}
      {deleteMode ? (
        <div className="relative">
          <button
            type="button"
            onClick={onShowConfirm}
            className="w-[84px] px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            削除
          </button>

          {showConfirm && (
            <ConfirmDialog
              message="選択中のプロジェクトを削除します。よろしいですか？"
              onCancel={onCancelConfirm}
              onConfirm={onBulkDelete}
              cancelLabel="キャンセル"
              confirmLabel="削除する"
            />
          )}
        </div>
      ) : (
        // ボタン幅合わせのダミー
        <div className="w-[84px]" />
      )}
    </div>
  );
}
