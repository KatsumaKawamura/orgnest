// @/components/common/ActionsRow.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";
import { useFadeModal } from "@/components/common/FadeModalWrapper";

/** 長期運用のための安定API（Confirm/Info/Progressで共通使用） */
export type ActionsRowProps = {
  cancelLabel?: string;
  confirmLabel?: string;

  onCancel: () => void;
  onConfirm: () => void;

  align?: "center" | "between" | "end";
  className?: string;
  horizontalOnly?: boolean;

  size?: "sm" | "md" | "lg";
  confirmVariant?: "primary" | "danger" | "neutral";

  confirmClassName?: string;
  cancelClassName?: string;

  showCancel?: boolean;
  confirmDisabled?: boolean;

  /** 実行順：true=onConfirm→close / false=close→onConfirm */
  confirmFirst?: boolean;

  /** キャンセル時に親モーダルを閉じない（親側で確認ダイアログを出す用途） */
  cancelDoesNotClose?: boolean;

  /** @deprecated */
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
  cancelDoesNotClose = false,
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

  // 入力系要素かどうかを判定
  const isEditableTarget = (el: HTMLElement | null) => {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    // contentEditable, role="textbox" にも配慮
    if ((el as any).isContentEditable) return true;
    const role = el.getAttribute("role");
    if (role === "textbox" || role === "combobox") return true;
    return false;
  };

  // 外側からキー引き込み（←/→/Enter/Esc のみ）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const row = rowRef.current;
      if (!row) return;
      const tgt = e.target as HTMLElement | null;
      const inActions = !!(tgt && row.contains(tgt));

      // 入力系にフォーカスがある間は一切介入しない
      if (isEditableTarget(tgt)) return;

      // ここからは文字キーは無視（以前の「e.key.length===1」は削除）
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (!cancelDoesNotClose) close();
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
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [
    close,
    onCancel,
    focusBack,
    horizontalOnly,
    showCancel,
    confirmDisabled,
    cancelDoesNotClose,
  ]);

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
      if (!cancelDoesNotClose) close();
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

  const wrapperClass = [position, "mt-6 flex gap-3", alignClass, className]
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

  const handleCancelClick = () => {
    if (!cancelDoesNotClose) close();
    onCancel();
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
          onClick={handleCancelClick}
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
