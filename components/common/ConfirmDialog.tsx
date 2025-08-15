"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";
import { useDialogKeyFocus } from "@/hooks/useDialogKeyFocus";

interface ConfirmDialogProps {
  title?: string;
  message?: string | string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** FadeModalWrapper(asChild) の子として使う場合は true（推奨） */
  asModalChild?: boolean;
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
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const okRef = useRef<HTMLButtonElement | null>(null);

  // 行内ロービング（Tab 等は hook に任せる。左右は明示制御するので loop:false）
  const roving = useModalActionRoving({ loop: false, overrideInput: true });

  // 重要：ボタン外フォーカスでもキーで戻す/実行（Escape=Cancel, Enter=OK）
  const { rememberLastAction, onActionRowKeyDown } = useDialogKeyFocus({
    panelRef,
    cancelRef,
    okRef,
    enabled: true, // モーダル可視中のみ true にしたい場合は prop で受けてもOK
    onConfirm,
    onCancel,
  });

  // 初期フォーカス：キャンセル優先（なければOK）
  useEffect(() => {
    (cancelRef.current ?? okRef.current)?.focus();
  }, []);

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
      className="rounded-xl bg-white shadow-xl p-6 w-[min(92vw,420px)] text-gray-900"
    >
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-sm leading-6">{renderMessage(message)}</div>

      <div
        ref={roving.rowRef /* ← そのまま渡す（呼び出さない） */}
        data-confirm-actions
        role="group"
        aria-orientation="horizontal"
        className="mt-6 flex justify-end gap-3"
        onKeyDown={(e) => {
          onActionRowKeyDown(e);
          // roving も併用（Tab 等）
          // @ts-ignore: roving は KeyboardEvent/React.KeyboardEvent を受けられる前提
          roving.onRootKeyDown(e);
        }}
      >
        <Button
          ref={cancelRef}
          variant="secondary"
          onClick={onCancel}
          onFocus={() => rememberLastAction("cancel")}
          data-action="cancel"
          data-enter-ignore
        >
          {cancelLabel}
        </Button>
        <Button
          ref={okRef}
          variant="primary"
          onClick={onConfirm}
          onFocus={() => rememberLastAction("ok")}
          data-action="primary"
          data-enter
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );

  if (asModalChild) return Panel;

  // 単体利用（オーバーレイ込み）も可能に
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
    >
      {Panel}
    </div>
  );
}
