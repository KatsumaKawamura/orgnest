// hooks/useModalKeyEvents.ts
"use client";
import type React from "react";
import { RefObject, useEffect, useMemo } from "react";

const FIELDS_SELECTOR = [
  'input:not([type="hidden"]):not([disabled]):not([readonly])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(",");

const isUsable = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const hidden =
    (rect.width === 0 &&
      rect.height === 0 &&
      (el as any).offsetParent === null) ||
    getComputedStyle(el).visibility === "hidden";
  const disabled =
    (el as any).disabled === true ||
    el.getAttribute("aria-disabled") === "true";
  return !hidden && !disabled;
};

const setCaretToEnd = (el: HTMLElement) => {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const len = el.value?.length ?? 0;
    try {
      el.setSelectionRange(len, len);
    } catch {}
  }
};

type Opts = {
  // ★ ここを null 許容にする
  panelRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
  closeOnEsc: boolean;
  enterSubmits: boolean;
  requestClose: () => void;
};

export function useModalKeyEvents({
  panelRef,
  overlayRef,
  visible,
  closeOnEsc,
  enterSubmits,
  requestClose,
}: Opts) {
  // 最前面判定（同一APIをここに内包）
  const isTopOverlay = useMemo(() => {
    return () => {
      const overlays = document.body.querySelectorAll('[data-fmw-overlay="1"]');
      const last = overlays[overlays.length - 1] as HTMLElement | undefined;
      return last != null && last === overlayRef.current;
    };
  }, [overlayRef]);

  // Esc（ドキュメント）
  useEffect(() => {
    if (!closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTopOverlay()) return;
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc, isTopOverlay, requestClose]);

  // Enter（ドキュメント）
  useEffect(() => {
    if (!enterSubmits) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTopOverlay()) return;
      if (e.key !== "Enter") return;

      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === "TEXTAREA") return;
      if (active?.hasAttribute("data-enter-ignore")) return;

      const root = panelRef.current;
      if (!root) return;

      const target =
        root.querySelector<HTMLElement>("[data-enter]:not([disabled])") ||
        root.querySelector<HTMLElement>("[data-autofocus]:not([disabled])") ||
        root.querySelector<HTMLElement>(
          'button[type="submit"]:not([disabled])'
        ) ||
        root.querySelector<HTMLElement>(
          'button:not([disabled]):not([aria-disabled="true"]):not([data-enter-ignore])'
        );

      if (target) {
        e.preventDefault();
        (target as HTMLButtonElement).click();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enterSubmits, isTopOverlay, panelRef]);

  // ドキュメント救出（Arrowキー, capture）
  useEffect(() => {
    if (!visible) return;
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (!isTopOverlay()) return;

      const key = e.key;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key))
        return;

      const root = panelRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return; // 既にパネル内

      e.preventDefault();

      if (key === "ArrowLeft" || key === "ArrowRight") {
        const sel =
          key === "ArrowLeft"
            ? '[data-action="cancel"]'
            : '[data-action="primary"]';
        const explicit = root.querySelector<HTMLElement>(
          `${sel}:not([disabled])`
        );
        if (explicit) {
          explicit.focus();
          return;
        }

        const buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
        ).filter(isUsable);
        if (buttons.length) {
          (key === "ArrowLeft"
            ? buttons[0]
            : buttons[buttons.length - 1]
          ).focus();
        }
        return;
      }

      const fields = Array.from(
        root.querySelectorAll<HTMLElement>(FIELDS_SELECTOR)
      ).filter(isUsable);
      if (fields.length) {
        const target =
          key === "ArrowUp" ? fields[0] : fields[fields.length - 1];
        target.focus();
        setCaretToEnd(target);
      }
    };
    document.addEventListener("keydown", onDocKeyDown, true);
    return () => document.removeEventListener("keydown", onDocKeyDown, true);
  }, [visible, isTopOverlay, panelRef]);

  // パネル内用（onKeyDown に渡すハンドラ）
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key))
      return;

    const root = panelRef.current;
    if (!root) return;

    const t = e.target as HTMLElement | null;
    const inField =
      !!t &&
      root.contains(t) &&
      (t.matches(FIELDS_SELECTOR) || !!t.closest(FIELDS_SELECTOR));
    const inButton =
      !!t &&
      root.contains(t) &&
      (t.tagName === "BUTTON" || !!t.closest("button"));
    if (inField || inButton) return;

    e.preventDefault();

    if (key === "ArrowLeft" || key === "ArrowRight") {
      const sel =
        key === "ArrowLeft"
          ? '[data-action="cancel"]'
          : '[data-action="primary"]';
      const explicit = root.querySelector<HTMLElement>(
        `${sel}:not([disabled])`
      );
      if (explicit) {
        explicit.focus();
        return;
      }

      const buttons = Array.from(
        root.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
      ).filter(isUsable);
      if (buttons.length) {
        (key === "ArrowLeft"
          ? buttons[0]
          : buttons[buttons.length - 1]
        ).focus();
      }
      return;
    }

    const fields = Array.from(
      root.querySelectorAll<HTMLElement>(FIELDS_SELECTOR)
    ).filter(isUsable);
    if (fields.length) {
      const focusTo = key === "ArrowUp" ? fields[0] : fields[fields.length - 1];
      focusTo.focus();
      setCaretToEnd(focusTo);
    }
  };

  return { onPanelKeyDown };
}
