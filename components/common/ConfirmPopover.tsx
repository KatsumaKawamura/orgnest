// @/components/common/ConfirmPopover.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface ConfirmPopoverProps {
  open: boolean;
  onClose: () => void; // キャンセル/外クリック/Esc で閉じる
  onConfirm: () => void; // OK 押下時
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** アンカー位置の上書き（例: "absolute right-0 mt-2"） */
  anchorClassName?: string;
  /** 閉じたときにフォーカスを戻したい要素（例: Logout ボタン） */
  returnFocusEl?: HTMLElement | null;
}

export default function ConfirmPopover({
  open,
  onClose,
  onConfirm,
  message = "ログアウトしますか？",
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  anchorClassName = "absolute right-0 mt-2",
  returnFocusEl,
}: ConfirmPopoverProps) {
  const [entered, setEntered] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // 入場アニメ（AccountMenuDropdown と同じトーン）
  useEffect(() => {
    if (!open) return;
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // 初期フォーカス & Escで閉じる
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => okRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeAndReturnFocus();
      }
    };
    document.addEventListener("keydown", onKey, { capture: true });
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey, { capture: true } as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 外クリック（Popoverのみ閉じる）
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        closeAndReturnFocus();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const closeAndReturnFocus = () => {
    onClose();
    // Dropdownに復帰できるよう、Logoutボタンへ戻す（なければ何もしない）
    if (returnFocusEl) {
      setTimeout(() => returnFocusEl.focus(), 0);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className={[
        anchorClassName,
        "z-60 w-64 overflow-hidden",
        "rounded-lg border border-gray-200 bg-white shadow-lg",
        "origin-top-right transition-[opacity,transform] duration-200 ease-out",
        entered
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0   scale-95  translate-y-2",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="確認"
    >
      <div className="px-4 py-3">
        <p className="text-sm text-gray-800">{message}</p>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={closeAndReturnFocus}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={okRef}
            className="rounded px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
