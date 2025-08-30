"use client";
import { useEffect, RefObject } from "react";

/**
 * モーダル内で Tab フォーカスを循環させる
 * - visible=true の間だけ有効
 */
export function useFocusTrap<T extends HTMLElement>(
  panelRef: RefObject<T | null>,
  visible: boolean
) {
  useEffect(() => {
    if (!visible) return;
    const root = panelRef.current;
    if (!root) return;

    const getFocusable = () => {
      const nodes = root.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter(
        (el) => el.offsetParent !== null || el === root
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        // 何もフォーカスできる要素が無ければパネルに固定
        (root as unknown as HTMLElement).focus();
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        // 逆方向
        if (!active || active === first || !root.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        // 順方向
        if (!active || active === last || !root.contains(active)) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [panelRef, visible]);
}
