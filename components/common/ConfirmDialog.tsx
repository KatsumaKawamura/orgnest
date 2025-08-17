"use client";

import { useEffect, useRef, useCallback } from "react";
import Button from "@/components/common/Button";
import useModalActionRoving from "@/hooks/useModalActionRoving";

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

  const roving = useModalActionRoving({ loop: false, overrideInput: true });
  const lastAction = useRef<"cancel" | "ok">("cancel");

  useEffect(() => {
    (cancelRef.current ?? okRef.current)?.focus();
  }, []);

  const rememberLastAction = (kind: "cancel" | "ok") => () => {
    lastAction.current = kind;
  };

  const focusBackToActions = useCallback((prefer?: "cancel" | "ok") => {
    const target =
      prefer === "ok"
        ? okRef.current
        : prefer === "cancel"
        ? cancelRef.current
        : lastAction.current === "ok"
        ? okRef.current
        : cancelRef.current;
    target?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      const tgt = e.target as HTMLElement | null;
      const inPanel = !!(tgt && panel.contains(tgt));
      const inActions = inPanel ? tgt!.closest("[data-confirm-actions]") : null;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }

      if (!inActions) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          e.stopPropagation();
          focusBackToActions("cancel");
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          focusBackToActions("ok");
          return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          focusBackToActions();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          focusBackToActions("ok");
          okRef.current?.click();
          return;
        }
        if (e.key.length === 1) {
          focusBackToActions();
          return;
        }
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [focusBackToActions, onCancel]);

  const onActionRowKeyDown = (e: React.KeyboardEvent) => {
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
      onCancel();
      return;
    }
    // @ts-ignore
    roving.onRootKeyDown(e);
  };

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

      <div
        ref={roving.rowRef}
        data-confirm-actions
        role="group"
        aria-orientation="horizontal"
        className="mt-6 flex justify-center gap-4"
        onKeyDown={onActionRowKeyDown}
      >
        <div>
          <Button
            ref={cancelRef}
            variant="secondary"
            onClick={onCancel}
            onFocus={rememberLastAction("cancel")}
            data-action="cancel"
            data-enter-ignore
          >
            {cancelLabel}
          </Button>
        </div>
        <div>
          <Button
            ref={okRef}
            variant="primary"
            onClick={onConfirm}
            onFocus={rememberLastAction("ok")}
            data-action="primary"
            data-enter
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  if (asModalChild) return Panel;

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
