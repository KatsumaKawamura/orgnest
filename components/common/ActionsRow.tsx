"use client";

import { useEffect, useRef, useCallback } from "react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";
import { useFadeModal } from "@/components/common/FadeModalWrapper";

/** 長期運用のための安定API */
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

  /** キー操作方針：確認/レビュー用途は true（既定） */
  horizontalOnly?: boolean;

  /** 見た目（公式） */
  size?: "sm" | "md" | "lg"; // ボタンサイズ（既定: md）
  confirmVariant?: "primary" | "danger" | "neutral"; // 確定ボタンの意図（既定: primary）

  /** 必要最低限の上書き（公式） */
  confirmClassName?: string;
  cancelClassName?: string;

  /** 互換: 旧い呼び出しが使っていた position を残置 */
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

  const focusBack = useCallback((prefer?: "cancel" | "ok") => {
    const target =
      prefer === "ok"
        ? okRef.current
        : prefer === "cancel"
        ? cancelRef.current
        : last.current === "ok"
        ? okRef.current
        : cancelRef.current;
    (target ?? okRef.current ?? cancelRef.current)?.focus();
  }, []);

  // 外側からキー引き込み（←→/Enter/Esc）
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
          focusBack("cancel");
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
          focusBack("ok");
          okRef.current?.click();
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
  }, [close, onCancel, focusBack, horizontalOnly]);

  const onRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      cancelRef.current?.focus();
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

  // 旧互換 position を素直に className に足す
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

      <Button
        ref={okRef}
        variant={confirmBtnVariant as any}
        size={size}
        onClick={() => {
          close();
          onConfirm();
        }}
        onFocus={() => (last.current = "ok")}
        data-action="primary"
        data-enter
        type="button"
        className={confirmClassName}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
