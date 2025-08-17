"use client";

import { useEffect, useRef, useCallback } from "react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";
import { useFadeModal } from "@/components/common/FadeModalWrapper";

/** 長期運用のための安定API（Confirm/Info/Progressで共通使用） */
export type ActionsRowProps = {
  /** ラベル */
  cancelLabel?: string;
  confirmLabel?: string;

  /** ハンドラ */
  onCancel: () => void;
  onConfirm: () => void;

  /** レイアウト */
  align?: "center" | "between" | "end"; // 既定: center
  className?: string;

  /** キー操作方針 */
  horizontalOnly?: boolean;

  /** 見た目（公式） */
  size?: "sm" | "md" | "lg";
  confirmVariant?: "primary" | "danger" | "neutral";

  /** 必要最低限の上書き（公式） */
  confirmClassName?: string;
  cancelClassName?: string;

  /** 単一ボタン運用（Info/Progress 用） */
  showCancel?: boolean; // 既定: true
  confirmDisabled?: boolean; // 既定: false

  /** 実行順：true=onConfirm→close / false=close→onConfirm */
  confirmFirst?: boolean; // 既定: false

  /** 互換: 旧 position を残置（非推奨） */
  /** @deprecated 代わりに className/align を使用してください */
  position?: string;
};

export default function ActionsRow({
  cancelLabel = "キャンセル",
  confirmLabel = "OK",
  onCancel,
  onConfirm,
  align = "center",
  className,
  horizontalOnly = true,
  size = "md",
  confirmVariant = "primary",
  cancelClassName,
  confirmClassName,
  showCancel = true,
  confirmDisabled = false,
  confirmFirst = false,
  /** deprecated */ position,
}: ActionsRowProps) {
  const { close } = useFadeModal();

  const rowRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const okRef = useRef<HTMLButtonElement | null>(null);
  const last = useRef<"cancel" | "ok">("ok");

  const roving = useModalActionRoving({ loop: true, overrideInput: true });

  useEffect(() => {
    const enter = rowRef.current?.querySelector<HTMLElement>("[data-enter]");
    enter?.focus();
  }, []);

  const focusBack = useCallback(
    (prefer?: "cancel" | "ok") => {
      const target =
        prefer === "ok"
          ? okRef.current
          : prefer === "cancel"
          ? showCancel
            ? cancelRef.current
            : okRef.current
          : last.current === "ok" || !showCancel
          ? okRef.current
          : cancelRef.current;
      (target ?? okRef.current ?? cancelRef.current)?.focus();
    },
    [showCancel]
  );

  // 外側からキー引き込み（←/→/Enter/Esc）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const row = rowRef.current;
      if (!row) return;
      const tgt = e.target as HTMLElement | null;
      const inActions = !!(tgt && row.contains(tgt));

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        onCancel();
        return;
      }

      if (!inActions) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          e.stopPropagation();
          focusBack(showCancel ? "cancel" : "ok");
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          focusBack("ok");
          return;
        }
        if (!horizontalOnly && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
          e.preventDefault();
          e.stopPropagation();
          focusBack();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (!confirmDisabled) {
            focusBack("ok");
            okRef.current?.click();
          } else {
            focusBack();
          }
          return;
        }
        if (e.key.length === 1) {
          focusBack();
          return;
        }
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [close, onCancel, focusBack, horizontalOnly, showCancel, confirmDisabled]);

  const onRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      (showCancel ? cancelRef.current : okRef.current)?.focus();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      okRef.current?.focus();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
      onCancel();
      return;
    }
    // @ts-ignore
    roving.onRootKeyDown(e);
  };

  const alignClass =
    align === "between"
      ? "justify-between"
      : align === "end"
      ? "justify-end"
      : "justify-center";

  const wrapperClass = [
    position, // @deprecated
    "mt-6 flex gap-3",
    alignClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const confirmBtnVariant =
    confirmVariant === "danger"
      ? "danger"
      : confirmVariant === "neutral"
      ? "secondary"
      : "primary";

  const handleConfirmClick = () => {
    if (confirmDisabled) return;
    if (confirmFirst) {
      onConfirm();
      close();
    } else {
      close();
      onConfirm();
    }
  };

  return (
    <div
      ref={(node) => {
        rowRef.current = node;
        // @ts-ignore
        roving.rowRef.current = node;
      }}
      role="group"
      aria-orientation="horizontal"
      className={wrapperClass}
      onKeyDown={onRowKeyDown}
    >
      {showCancel && (
        <Button
          ref={cancelRef}
          variant="secondary"
          size={size}
          onClick={() => {
            close();
            onCancel();
          }}
          onFocus={() => (last.current = "cancel")}
          data-action="cancel"
          data-enter-ignore
          type="button"
          className={cancelClassName}
        >
          {cancelLabel}
        </Button>
      )}

      <Button
        ref={okRef}
        variant={confirmBtnVariant as any}
        size={size}
        onClick={handleConfirmClick}
        onFocus={() => (last.current = "ok")}
        data-action="primary"
        data-enter={confirmDisabled ? undefined : true}
        data-enter-ignore={confirmDisabled ? true : undefined}
        type="button"
        disabled={confirmDisabled}
        className={confirmClassName}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
