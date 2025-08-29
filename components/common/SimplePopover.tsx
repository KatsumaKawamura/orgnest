// @/components/common/SimplePopover.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";

type Tone = "default" | "danger";
type FocusTarget = "confirm" | "cancel" | "none";

export interface SimplePopoverProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;

  message?: React.ReactNode;
  confirmLabel?: string; // 既定: "OK"
  cancelLabel?: string; // 既定: "キャンセル"
  tone?: Tone; // 既定: "default"

  confirmDisabled?: boolean;
  confirmLoading?: boolean;

  /** 位置/スタイルの上書き用 */
  className?: string;

  /** 開いた直後の初期フォーカス先（既定: "confirm"） */
  initialFocus?: FocusTarget;
}

export default function SimplePopover({
  open,
  onClose,
  onConfirm,

  message = "この操作を実行しますか？",
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  tone = "default",

  confirmDisabled = false,
  confirmLoading = false,

  className = "",
  initialFocus = "none",
}: SimplePopoverProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // フォーカス復帰
  const openerElRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const okRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null); // ★ 追加

  // open変化監視（表示/非表示の遷移）
  useEffect(() => {
    if (open) {
      if (!openerElRef.current) {
        const el = document.activeElement;
        if (el instanceof HTMLElement) openerElRef.current = el;
      }
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setIsClosing(false);
      setShouldRender(true);
    } else if (shouldRender) {
      setIsClosing(true);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        openerElRef.current?.focus?.();
        openerElRef.current = null;
      }, 180);
    }

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [open, shouldRender]);

  // ★ 初期フォーカス制御
  useEffect(() => {
    if (!(open && !isClosing)) return;

    const focus = () => {
      if (initialFocus === "none") return;

      // 希望のターゲットがフォーカス不可（例：confirmDisabled）ならフォールバック
      const wantConfirm = initialFocus === "confirm";
      const primary = wantConfirm ? okRef.current : cancelRef.current;
      const secondary = wantConfirm ? cancelRef.current : okRef.current;

      // confirmDisabled の場合、confirm への初期フォーカスは避ける
      if (wantConfirm && confirmDisabled) {
        (secondary ?? primary)?.focus?.();
        return;
      }

      (primary ?? secondary)?.focus?.();
    };

    const t = setTimeout(focus, 0);
    return () => clearTimeout(t);
  }, [open, isClosing, initialFocus, confirmDisabled]);

  // Escキーで閉じる
  useEffect(() => {
    if (!(open && !isClosing)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKey, { capture: true } as any);
    };
  }, [open, isClosing, onClose]);

  // 外クリックで閉じる
  useEffect(() => {
    if (!(open && !isClosing)) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, isClosing, onClose]);

  if (!shouldRender) return null;
  const isEntering = open && !isClosing;

  const confirmVariant = tone === "danger" ? "danger" : "primary";
  const cancelVariant = "secondary";

  return (
    <div
      ref={rootRef}
      className={[
        "absolute right-0 mt-2", // 既定位置（必要に応じて className で上書き）
        "z-[900] w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
        "origin-top-right will-change-transform will-change-opacity will-change-filter",
        isEntering
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1",
        "transition-[opacity,transform,filter,box-shadow] duration-180 ease-in",
        className,
      ].join(" ")}
      role="dialog"
      aria-label="確認"
    >
      <div className="px-4 py-3 text-center">
        <p className="mt-5 mb-6 text-sm font-medium text-gray-800">{message}</p>

        <div className="mt-3 flex items-center justify-center gap-2">
          <Button
            ref={cancelRef}
            variant={cancelVariant as any}
            size="sm"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>

          <Button
            ref={okRef}
            variant={confirmVariant as any}
            size="sm"
            isLoading={confirmLoading}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
