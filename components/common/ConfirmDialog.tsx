"use client";

import { useRef } from "react";
import ActionsRow from "@/components/common/ActionsRow";

interface ConfirmDialogProps {
  title?: string;
  message?: string | string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  asModalChild?: boolean; // asChild 前提
}

export default function ConfirmDialog({
  title = "確認",
  message = "よろしいですか？",
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
  asModalChild = true,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const renderMessage = (msg: string | string[]) => {
    if (Array.isArray(msg)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {msg.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      );
    }
    return <p>{msg}</p>;
  };

  const Panel = (
    <div
      ref={panelRef}
      data-confirm-root
      className="rounded-xl bg-white shadow-xl p-6 w-[min(92vw,420px)] text-gray-900 text-center"
    >
      <h2 className="text-lg font-semibold mb-3" data-modal-title>
        {title}
      </h2>
      <div className="text-sm leading-6">{renderMessage(message)}</div>

      <ActionsRow
        className="mt-6"
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
        horizontalOnly
      />
    </div>
  );

  if (!asModalChild) return Panel;
  return Panel;
}
