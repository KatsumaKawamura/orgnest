// /hooks/useArrowFormNav.ts
"use client";
import { useCallback, useRef } from "react";

type Options = {
  loop?: boolean; // 端でループ（既定: true）
  pullIn?: boolean; // 外から↑/↓でフォームへ“引き込み”（既定: true）
  caretOnFocus?: "start" | "end"; // フォーカス時のカーソル位置（既定: "end"）
  selector?: string; // 対象フィールドのセレクタ上書き
};

const DEFAULT_SELECTOR = [
  // 入力可能なものだけに限定（disabled, readonly, hidden は除外）
  'input:not([type="hidden"]):not([disabled]):not([readonly])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  // 任意フォーカス可能（明示的に tabindex が与えられている要素）
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isHTMLElement = (el: any): el is HTMLElement =>
  el && typeof el === "object" && "tagName" in el;

const isTextLike = (el: Element | null) => {
  if (!isHTMLElement(el)) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const t = (el as HTMLInputElement).type;
    return (
      t === "text" ||
      t === "email" ||
      t === "password" ||
      t === "search" ||
      t === "tel" ||
      t === "url" ||
      t === "number"
    );
  }
  return (el as HTMLElement).isContentEditable === true;
};

function setCaret(el: HTMLElement, where: "start" | "end") {
  // テキスト系：キャレット位置を端に寄せる
  if (isTextLike(el)) {
    const pos = where === "start" ? 0 : (el as any).value?.length ?? 0;

    // input/textarea
    if ("setSelectionRange" in (el as any)) {
      try {
        (el as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
          pos,
          pos
        );
      } catch {
        // number など一部タイプは setSelectionRange が例外を投げることがある
      }
    } else if ((el as any).isContentEditable) {
      // contenteditable の場合
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(where === "start");
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }
}

export function useArrowFormNav(options: Options = {}) {
  const {
    loop = true,
    pullIn = true,
    caretOnFocus = "end",
    selector = DEFAULT_SELECTOR,
  } = options;

  // フォーム領域（ダイアログ全体など）に付与する
  const formRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      const key = e.key;
      if (key !== "ArrowUp" && key !== "ArrowDown") return;

      const root = formRef.current;
      if (!root) return;

      // 候補フィールド一覧（表示中のみ）
      const fields = Array.from(
        root.querySelectorAll<HTMLElement>(selector)
      ).filter((el) => {
        // 見えないものを除外（display:none / visibility:hidden / 位置なし）
        const rect = el.getBoundingClientRect();
        const hiddenByStyle =
          rect.width === 0 && rect.height === 0 && el.offsetParent === null;
        // aria-disabled / disabled はセレクタ側でも弾いているが二重でケア
        const disabled =
          (el as any).disabled === true ||
          el.getAttribute("aria-disabled") === "true";
        return !hiddenByStyle && !disabled;
      });
      if (fields.length === 0) return;

      const active = (document.activeElement ?? null) as HTMLElement | null;
      const inRoot = !!active && root.contains(active);

      // 1) 入力中でも必ず奪う（＝常にナビゲーションを優先）
      e.preventDefault();

      // 2) 外からの引き込み
      if (!inRoot) {
        if (!pullIn) return;
        const target =
          key === "ArrowUp" ? fields[0] : fields[fields.length - 1];
        target?.focus();
        if (target) setCaret(target, caretOnFocus);
        return;
      }

      // 3) root 内の移動
      const i = fields.indexOf(active as HTMLElement);
      let nextIndex = i;

      if (key === "ArrowUp") {
        nextIndex = i - 1;
        if (nextIndex < 0) nextIndex = loop ? fields.length - 1 : 0;
      } else {
        // ArrowDown
        nextIndex = i + 1;
        if (nextIndex >= fields.length)
          nextIndex = loop ? 0 : fields.length - 1;
      }

      const target = fields[nextIndex];
      if (target) {
        target.focus();
        setCaret(target, caretOnFocus);
      }
    },
    [loop, pullIn, caretOnFocus, selector]
  );

  return { formRef, onKeyDown };
}

export default useArrowFormNav;
