"use client";

import { useEffect, useRef, useCallback } from "react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";
import { useFadeModal } from "@/components/common/FadeModalWrapper";

export type ActionsRowProps = {
  cancelLabel?: string; // 左
  confirmLabel?: string; // 右
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
  /** 左右だけ運用（確認/レビュー用途）なので true 固定でOK */
  horizontalOnly?: boolean;
};

export default function ActionsRow({
  cancelLabel = "キャンセル",
  confirmLabel = "OK",
  onCancel,
  onConfirm,
  className,
  horizontalOnly = true,
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

  // 外側フォーカス時でもキーで“引き込み”
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

  return (
    <div
      ref={(node) => {
        rowRef.current = node;
        // @ts-ignore
        roving.rowRef.current = node;
      }}
      role="group"
      aria-orientation="horizontal"
      className={["mt-6 flex justify-center gap-3", className]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={onRowKeyDown}
    >
      <Button
        ref={cancelRef}
        variant="secondary"
        size="md"
        onClick={() => {
          close();
          onCancel();
        }}
        onFocus={() => (last.current = "cancel")}
        data-action="cancel"
        data-enter-ignore
        type="button"
      >
        {cancelLabel}
      </Button>
      <Button
        ref={okRef}
        variant="primary"
        size="md"
        onClick={() => {
          close();
          onConfirm();
        }}
        onFocus={() => (last.current = "ok")}
        data-action="primary"
        data-enter
        type="button"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
