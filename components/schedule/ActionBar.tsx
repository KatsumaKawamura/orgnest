"use client";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface ActionBarProps {
  deleteMode: boolean;
  onAdd: () => void;
  onToggleDeleteMode: () => void;
  onShowConfirm: () => void;
  showConfirm: boolean;
  onCancelConfirm: () => void;
  onConfirmDelete: () => void;
}

export default function ActionBar({
  deleteMode,
  onAdd,
  onToggleDeleteMode,
  onShowConfirm,
  showConfirm,
  onCancelConfirm,
  onConfirmDelete,
}: ActionBarProps) {
  return (
    <div className="flex space-x-2 mb-4 relative">
      <button
        onClick={onAdd}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        ＋カード追加
      </button>
      <button
        onClick={onToggleDeleteMode}
        className="flex items-center px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
      >
        <Trash2 className="w-4 h-4 mr-2 text-gray-800" />
        {deleteMode ? "戻る" : "選択"}
      </button>
      {deleteMode && (
        <div className="relative">
          <button
            onClick={onShowConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            削除
          </button>
          {showConfirm && (
            <ConfirmDialog
              message="削除しますか？"
              onCancel={onCancelConfirm}
              onConfirm={onConfirmDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
