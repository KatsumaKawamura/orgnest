// @ts-nocheck
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
        {deleteMode ? "謌ｻ繧・ : "驕ｸ謚・}
      </button>
      {deleteMode ? (
        <div className="relative">
          <button
            onClick={onShowConfirm}
            className="w-[72px] px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            蜑企勁
          </button>
          {showConfirm && (
            <ConfirmDialog
              message="驕ｸ謚槭＠縺溘・繝ｭ繧ｸ繧ｧ繧ｯ繝医ｒ蜑企勁縺励∪縺吶°・・
              onCancel={onCancelConfirm}
              onConfirm={onBulkDelete}
              confirmLabel="蜑企勁"
              cancelLabel="謌ｻ繧・
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

