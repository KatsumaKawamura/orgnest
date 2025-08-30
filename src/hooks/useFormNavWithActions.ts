"use client";
/* cspell:ignore contenteditable */

import { useCallback, useRef } from "react";
import useArrowFormNav from "@/hooks/useArrowFormNav";

type Options = {
  loop?: boolean;
  pullIn?: boolean;
  /** 既存フックに合わせて "start" | "end" のみ */
  caretOnFocus?: "start" | "end";
  /** 対象フォーカス要素のセレクタを上書きしたい場合のみ指定 */
  focusableSelector?: string;
};

export default function useFormNavWithActions(options: Options = {}) {
  const {
    loop = true,
    pullIn = true,
    caretOnFocus = "end",
    focusableSelector,
  } = options;

  // ↑/↓ の通常ロービング（フォーム全体）
  const { formRef, onKeyDown: onFormKeyDown } = useArrowFormNav({
    loop,
    pullIn,
    caretOnFocus,
  });

  // ActionsRow（ボタン群）コンテナ
  const actionRowRef = useRef<HTMLDivElement | null>(null);

  // フォーカス可能要素の一覧を取得
  const getFocusableElements = useCallback((): HTMLElement[] => {
    const root = formRef.current;
    if (!root) return [];
    const selector =
      focusableSelector ?? 'input, textarea, select, [contenteditable="true"]';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute("disabled")
    );
  }, [formRef, focusableSelector]);

  // 先頭/末尾へフォーカス（キャレットは末尾へ）
  const focusEdge = useCallback(
    (edge: "first" | "last") => {
      const nodes = getFocusableElements();
      const target = edge === "first" ? nodes[0] : nodes[nodes.length - 1];
      if (!target) return false;
      target.focus();
      try {
        const any = target as any;
        if ("selectionStart" in any && typeof any.selectionStart === "number") {
          const len = (target as HTMLInputElement).value?.length ?? 0;
          (target as HTMLInputElement).setSelectionRange?.(len, len);
        }
      } catch {}
      return true;
    },
    [getFocusableElements]
  );

  // ルート onKeyDown：ActionsRow 上の ↑/↓ は先頭/末尾へ“引き込み”
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const inActions =
        !!actionRowRef.current &&
        actionRowRef.current.contains(e.target as Node);

      if (inActions && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        e.stopPropagation();
        focusEdge(e.key === "ArrowUp" ? "first" : "last");
        return;
      }
      // 通常ロービングへ委譲
      onFormKeyDown(e);
    },
    [onFormKeyDown, focusEdge]
  );

  // JSX にそのまま渡せる props
  const getRootProps = () =>
    ({
      ref: formRef,
      onKeyDown,
    } as const);

  return { formRef, actionRowRef, getRootProps, onKeyDown, focusEdge };
}
