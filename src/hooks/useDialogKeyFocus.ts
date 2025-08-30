// hooks/useDialogKeyFocus.ts
"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";

type Action = "cancel" | "ok";

type Options = {
  /** このダイアログのパネル（判定の起点） */
  panelRef: RefObject<HTMLElement | null>;
  /** アクション行の CSS セレクタ（配下判定に利用） */
  actionRowSelector?: string;
  /** フォーカス復帰先：キャンセル／OK */
  cancelRef: RefObject<HTMLElement | null>;
  okRef: RefObject<HTMLElement | null>;
  /** 有効/無効（モーダル可視中のみ true 推奨） */
  enabled?: boolean;

  /** 決定（Enter / 明示実行）時のコールバック */
  onConfirm: () => void;
  /** 取消（Esc）時のコールバック */
  onCancel: () => void;
};

/**
 * ダイアログ配下でのキー入力を捕捉し、
 * - ボタン外フォーカス時でも ←/→/↑/↓/Enter でアクション行へフォーカス復帰（EnterはOK実行）
 * - Esc でキャンセル
 * また、行上の ←/→ を「left=キャンセル / right=OK」に明示マップする onKeyDown も提供。
 */
export function useDialogKeyFocus({
  panelRef,
  actionRowSelector = "[data-confirm-actions]",
  cancelRef,
  okRef,
  enabled = true,
  onConfirm,
  onCancel,
}: Options) {
  const lastAction = useRef<Action>("cancel");

  const focusBackToActions = useCallback(
    (prefer?: Action) => {
      const target =
        prefer === "ok"
          ? okRef.current
          : prefer === "cancel"
          ? cancelRef.current
          : lastAction.current === "ok"
          ? okRef.current
          : cancelRef.current;
      (target as HTMLElement | null)?.focus?.();
    },
    [cancelRef, okRef]
  );

  const rememberLastAction = useCallback((kind: Action) => {
    lastAction.current = kind;
  }, []);

  // document(capture) で拾い、パネル外でも対処（=ボタン外フォーカス対応）
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      const tgt = e.target as HTMLElement | null;
      const inPanel = !!(tgt && panel.contains(tgt));
      const inActions = inPanel && tgt ? tgt.closest(actionRowSelector) : null;

      // Esc は常にキャンセル
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }

      // ボタン外（パネル外 or パネル内の本文など）
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
          focusBackToActions("ok"); // 視覚的にもOKへ寄せる
          onConfirm();
          return;
        }
        // 文字キーなど → まずは戻すだけ（押し直しで意図確定）
        if (e.key.length === 1) {
          focusBackToActions();
          return;
        }
      }
      // ボタン上は行 onKeyDown に委譲
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [
    enabled,
    panelRef,
    actionRowSelector,
    focusBackToActions,
    onCancel,
    onConfirm,
  ]);

  // 行上：左右は明示マッピング（←=キャンセル / →=OK）
  const onActionRowKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        (cancelRef.current as HTMLElement | null)?.focus?.();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        (okRef.current as HTMLElement | null)?.focus?.();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }
      // それ以外（Tabなど）は親へ任せる
    },
    [cancelRef, okRef, onCancel]
  );

  return {
    focusBackToActions, // 使う場面があれば
    rememberLastAction, // ボタン onFocus に付ける
    onActionRowKeyDown, // 行 onKeyDown に付ける
  };
}
