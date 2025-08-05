// components/common/ConfirmDialog.tsx
"use client";

interface ConfirmDialogProps {
  message: string | string[];
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmClassName?: string;
  cancelClassName?: string;
  position?: "absolute" | "fixed";
}

export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  confirmClassName = "px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded", // デフォルト白ボタン
  cancelClassName = "px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded", // デフォルト白ボタン
  position = "fixed",
}: ConfirmDialogProps) {
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div
      className={`${position} ${
        position === "fixed"
          ? "inset-0 flex items-center justify-center bg-black bg-opacity-30"
          : "right-0 mt-2"
      } z-50`}
    >
      <div className="bg-white border border-gray-800 shadow-md rounded p-4 w-72">
        {messages.map((msg, idx) => (
          <p key={idx} className="text-sm text-gray-800 mb-2">
            {msg}
          </p>
        ))}
        <div className="flex justify-end space-x-2 mt-3">
          <button onClick={onCancel} className={cancelClassName}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={confirmClassName}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
