// @/components/common/ConfirmPopover.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import type { ButtonProps } from "@/components/common/Button";

interface ConfirmPopoverProps {
  open: boolean;
  onClose: () => void; // キャンセル/外クリック/Esc で閉じる
  onConfirm: () => void; // OK 押下時

  // テキスト
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;

  // ボタン外観（呼び出し元で変更可）
  confirmVariant?: Extract<
    ButtonProps["variant"],
    "primary" | "secondary" | "danger"
  >;
  cancelVariant?: Extract<ButtonProps["variant"], "primary" | "secondary">;
  buttonSize?: Exclude<ButtonProps["size"], "responsive">; // sm | md | lg（Popoverはコンパクト前提）
  buttonFullWidth?: boolean; // trueなら両ボタンを横幅いっぱいに
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  cancelDisabled?: boolean;

  // ボタンの個別クラス追加（必要なら）
  confirmClassName?: string;
  cancelClassName?: string;

  /** アンカー位置の上書き（例: "absolute right-0 mt-2"） */
  anchorClassName?: string;

  /** 閉じたときにフォーカスを戻したい要素（例: Logout ボタン） */
  returnFocusEl?: HTMLElement | null;
}

export default function ConfirmPopover({
  open,
  onClose,
  onConfirm,

  // 文言
  message = "ログアウトしますか？",
  confirmLabel = "OK",
  cancelLabel = "キャンセル",

  // 外観の既定
  confirmVariant = "primary",
  cancelVariant = "secondary",
  buttonSize = "sm",
  buttonFullWidth = false,
  confirmDisabled = false,
  confirmLoading = false,
  cancelDisabled = false,
  confirmClassName,
  cancelClassName,

  anchorClassName = "absolute right-0 mt-2",
  returnFocusEl,
}: ConfirmPopoverProps) {
  const [shouldRender, setShouldRender] = useState(open); // 退場中も残す
  const [isClosing, setIsClosing] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // open の変化に応じてレンダリング/クローズ制御
  useEffect(() => {
    if (open) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setIsClosing(false);
      setShouldRender(true);
    } else if (shouldRender) {
      // 退場アニメ後にアンマウント
      setIsClosing(true);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 180);
    }
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [open, shouldRender]);

  // 初期フォーカス & Escで閉じる（開いている間のみ）
  useEffect(() => {
    if (!(open && !isClosing)) return;
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
  }, [open, isClosing]);

  // 外クリック（開いている間のみ）
  useEffect(() => {
    if (!(open && !isClosing)) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        closeAndReturnFocus();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isClosing]);

  const closeAndReturnFocus = () => {
    onClose();
    if (returnFocusEl) {
      setTimeout(() => returnFocusEl.focus(), 0);
    }
  };

  if (!shouldRender) return null;

  const isEntering = open && !isClosing;

  return (
    <div
      ref={rootRef}
      className={[
        anchorClassName,
        "z-60 w-70 overflow-hidden rounded-lg border border-gray-200 bg-white",
        "origin-top-right will-change-transform will-change-opacity",
        isEntering ? "pop-enter" : "pop-leave",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="確認"
    >
      <div className="px-4 py-3 text-center">
        <p className="text-sm font-medium text-gray-800 mt-5 mb-6">{message}</p>

        <div
          className={[
            "mt-3 flex items-center justify-center gap-2", // ← 中央寄せ
          ].join(" ")}
        >
          <Button
            variant={cancelVariant}
            size={buttonSize}
            fullWidth={buttonFullWidth}
            disabled={cancelDisabled}
            className={cancelClassName}
            onClick={closeAndReturnFocus}
          >
            {cancelLabel}
          </Button>

          <Button
            ref={okRef}
            variant={confirmVariant}
            size={buttonSize}
            fullWidth={buttonFullWidth}
            isLoading={confirmLoading}
            disabled={confirmDisabled}
            className={confirmClassName}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>

      <style jsx>{`
        /* 入場：fade + translateY(8px→0) + scale(0.95→1) を 200ms ease-out（マウント時に必ず走る） */
        .pop-enter {
          animation: popInBasic 200ms ease-out both;
        }
        @keyframes popInBasic {
          from {
            opacity: 0;
            transform: translateY(0.5rem) scale(0.95); /* = translate-y-2 & scale-95 */
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* 退場：逆方向にフェードアウト（必要なら keyframes でもOK） */
        .pop-leave {
          animation: popOutBasic 180ms ease-in forwards;
        }
        @keyframes popOutBasic {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(0.5rem) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
