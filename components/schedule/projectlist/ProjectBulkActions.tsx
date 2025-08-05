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
      <button
        onClick={onToggleDeleteMode}
        className="flex items-center justify-center w-[96px] px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
      >
        {deleteMode ? "戻る" : "選択"}
      </button>
      {deleteMode ? (
        <div className="relative">
          <button
            onClick={onShowConfirm}
            className="w-[72px] px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            削除
          </button>
          {showConfirm && (
            <ConfirmDialog
              message="選択したプロジェクトを削除しますか？"
              onCancel={onCancelConfirm}
              onConfirm={onBulkDelete}
              confirmLabel="削除"
              cancelLabel="戻る"
              confirmClassName="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 border border-gray-800 rounded"
              cancelClassName="px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded"
              position="absolute"
            />
          )}
        </div>
      ) : (
        <div className="w-[72px]" />
      )}
    </div>
  );
}
