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

  // 行内ロービング（Tab などは任せる。左右は明示的に制御するため loop:false）
  const roving = useModalActionRoving({ loop: false, overrideInput: true });

  // 直近でフォーカスしたボタン（戻し先の既定）
  const lastAction = useRef<"cancel" | "ok">("cancel");

  // 初期フォーカス：キャンセル優先（なければOK）
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

  // === 重要：document(capture) で拾い、パネル「外」でも処理する ==================
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      const tgt = e.target as HTMLElement | null;
      const inPanel = !!(tgt && panel.contains(tgt));
      const inActions = inPanel ? tgt!.closest("[data-confirm-actions]") : null;

      // Esc は常にキャンセル（どこにフォーカスがあっても）
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }

      // ---- パネル外 or パネル内ボタン外：キー押下でアクション行へ復帰 ----
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
          // 視覚的整合のため OK へ寄せてから実行
          focusBackToActions("ok");
          okRef.current?.click();
          return;
        }
        // その他（文字キーなど）は「戻すだけ」
        if (e.key.length === 1) {
          focusBackToActions();
          return;
        }
      }
      // ボタン上でのキーは行ハンドラに委ねる
    };

    document.addEventListener("keydown", handler, true); // capture
    return () => document.removeEventListener("keydown", handler, true);
  }, [focusBackToActions, onCancel]);
  // =======================================================================

  // 行上：左右は明示マッピング（left=キャンセル / right=OK）
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
    // その他（Tab など）は roving 側に委ねる
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
        onKeyDown={onActionRowKeyDown}
      >
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
