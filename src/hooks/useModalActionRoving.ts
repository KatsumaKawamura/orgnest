// /hooks/useModalActionRoving.ts
"use client";
import { useCallback, useRef } from "react";

type Options = {
  loop?: boolean; // 端ループ
  overrideInput?: boolean; // 入力中でも奪うか（既定 false）
};

function isWithin(el: Element | null, container: HTMLElement | null) {
  return !!(el && container && container.contains(el));
}

function isRole(el: Element | null, role: string) {
  return !!(el instanceof HTMLElement && el.getAttribute("role") === role);
}

function isTextEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (isRole(el, "textbox") || isRole(el, "combobox")) return true;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    const t = (el.type || "text").toLowerCase();
    const textLikes = new Set([
      "text",
      "search",
      "email",
      "url",
      "tel",
      "password",
      "number",
    ]);
    if (textLikes.has(t)) return true;
  }
  return false;
}

function getActionButtons(row: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    row.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
  );
}

// 共通プロパティだけを参照するためのナロー型
type KeyLikeEvent = {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  preventDefault: () => void;
  target: EventTarget | null;
};

export default function useModalActionRoving(options: Options = {}) {
  const { loop = true, overrideInput = false } = options;
  const rowRef = useRef<HTMLDivElement | null>(null);

  // ここを「広い受け取り型」に変更
  const onRootKeyDown = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent<Element>) => {
      const ev = e as unknown as KeyLikeEvent;

      // 修飾キー中は無視
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;

      // 入力中は奪わない（overrideInput が true の時のみ許可）
      if (!overrideInput && isTextEditable(ev.target)) return;

      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;

      const row = rowRef.current;
      if (!row) return;

      const targetEl = ev.target as Element | null;
      const buttons = getActionButtons(row);
      if (buttons.length === 0) return;

      // 行内にフォーカスがある場合のみハンドリング
      if (!isWithin(targetEl, row)) return;

      const active = document.activeElement as HTMLElement | null;
      const idx = buttons.findIndex((b) => b === active);
      let current = idx >= 0 ? idx : 0;

      if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        const prev = current - 1;
        if (prev >= 0) buttons[prev].focus();
        else if (loop) buttons[buttons.length - 1].focus();
        return;
      }

      if (ev.key === "ArrowRight") {
        ev.preventDefault();
        const next = current + 1;
        if (next < buttons.length) buttons[next].focus();
        else if (loop) buttons[0].focus();
        return;
      }
    },
    [loop, overrideInput]
  );

  return { rowRef, onRootKeyDown };
}
