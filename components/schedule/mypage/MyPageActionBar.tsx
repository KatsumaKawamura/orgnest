// @ts-nocheck
"use client";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { MyPageActionBarProps } from "@/types/schedule";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import Button from "@/components/common/Button";

export default function MyPageActionBar({
  deleteMode,
  onAdd,
  onToggleDeleteMode,
  onConfirmDelete,
}: MyPageActionBarProps) {
  const { isOpen, open, close } = useConfirmDialog();

  return (
    <div className="flex space-x-2 mb-4 relative">
      <Button onClick={onAdd} variant="primary">
        ・九き繝ｼ繝芽ｿｽ蜉
      </Button>

      <Button
        onClick={onToggleDeleteMode}
        variant="secondary"
        className="flex items-center"
      >
        <Trash2 className="w-4 h-4 mr-2 text-gray-800" />
        {deleteMode ? "謌ｻ繧・ : "驕ｸ謚・}
      </Button>

      {deleteMode && (
        <div className="relative">
          <Button onClick={open} variant="danger">
            蜑企勁
          </Button>
          {isOpen && (
            <ConfirmDialog
              message="驕ｸ謚槭＠縺溘き繝ｼ繝峨ｒ蜑企勁縺励∪縺吶°・・
              onCancel={close}
              onConfirm={() => {
                onConfirmDelete();
                close();
              }}
              confirmLabel="蜑企勁"
              cancelLabel="謌ｻ繧・
              confirmClassName="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 border border-gray-800 rounded"
              cancelClassName="px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded"
              position="absolute"
            />
          )}
        </div>
      )}
    </div>
  );
}

