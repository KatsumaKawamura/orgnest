// /hooks/useModalActionRoving.ts
"use client";
import { useCallback, useRef } from "react";

type Options = {
  loop?: boolean; // 端でループするか（既定: true）
  overrideInput?: boolean; // 入力中でも ←/→ で“引き込む”か（既定: true）
};

const isEditable = (el: Element | null) => {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable === true
  );
};

export function useModalActionRoving(options: Options = {}) {
  const { loop = true, overrideInput = true } = options;

  // アクション行（ボタン群）のラッパー
  const rowRef = useRef<HTMLDivElement | null>(null);

  const focusFirstEnabled = (buttons: HTMLButtonElement[]) => {
    const b = buttons.find((btn) => !btn.disabled);
    b?.focus();
  };

  const focusLastEnabled = (buttons: HTMLButtonElement[]) => {
    for (let i = buttons.length - 1; i >= 0; i--) {
      if (!buttons[i].disabled) {
        buttons[i].focus();
        break;
      }
    }
  };

  const onRootKeyDown = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      const row = rowRef.current;
      if (!row) return;

      const active = (document.activeElement ?? null) as HTMLElement | null;

      // 入力中の左右を奪うかどうか
      if (!overrideInput && isEditable(active)) {
        return;
      }

      // 行内の「有効なボタン」だけを候補にする
      const buttons = Array.from(
        row.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
      );
      if (buttons.length === 0) return;

      const inRow = !!active && row.contains(active);

      // ① 行の外 → “引き込み”
      if (!inRow) {
        const targetSelector =
          e.key === "ArrowLeft"
            ? '[data-action="cancel"]'
            : '[data-action="primary"]';

        const target =
          row.querySelector<HTMLButtonElement>(
            `${targetSelector}:not([disabled])`
          ) ||
          // フォールバック（cancel/primary が無効だった場合）
          (e.key === "ArrowLeft" ? buttons[0] : buttons[buttons.length - 1]);

        if (target) {
          e.preventDefault();
          target.focus();
        }
        return;
      }

      // ② 行の中 → roving
      const i = buttons.indexOf(active as HTMLButtonElement);
      if (i === -1) {
        // 行の中だが候補外（tabIndex等でズレた）→ 近いほうへフォールバック
        e.preventDefault();
        e.key === "ArrowLeft"
          ? focusLastEnabled(buttons)
          : focusFirstEnabled(buttons);
        return;
      }

      e.preventDefault();
      if (e.key === "ArrowLeft") {
        const prev = i - 1;
        if (prev >= 0) {
          buttons[prev].focus();
        } else if (loop) {
          buttons[buttons.length - 1].focus();
        }
      } else {
        // ArrowRight
        const next = i + 1;
        if (next < buttons.length) {
          buttons[next].focus();
        } else if (loop) {
          buttons[0].focus();
        }
      }
    },
    [loop, overrideInput]
  );

  return { rowRef, onRootKeyDown };
}

export default useModalActionRoving;
