"use client";

interface ConfirmDialogProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="absolute right-0 mt-2 bg-white border border-gray-800 shadow-md rounded p-4 z-50 w-72">
      <p className="text-sm text-gray-800 mb-3">{message}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onConfirm}
          className="px-3 py-1 text-sm bg-gray-800 text-white hover:bg-gray-600 border border-gray-800 rounded"
        >
          削除
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
