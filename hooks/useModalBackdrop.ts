// hooks/useModalBackdrop.ts
"use client";
import { useEffect } from "react";

// グローバルカウンタ（モジュールスコープで共有）
let MODAL_OPEN_COUNT = 0;

function applyBackdropState() {
  if (typeof document === "undefined") return;
  const root = document.getElementById("__next") as any;
  const hasOpen = MODAL_OPEN_COUNT > 0;
  if (root) root.inert = hasOpen;
  if (hasOpen) document.body.setAttribute("data-modal-open", "1");
  else document.body.removeAttribute("data-modal-open");
}

export function useModalBackdrop(visible: boolean) {
  useEffect(() => {
    if (!visible) return;
    MODAL_OPEN_COUNT += 1;
    applyBackdropState();
    return () => {
      MODAL_OPEN_COUNT = Math.max(0, MODAL_OPEN_COUNT - 1);
      applyBackdropState();
    };
  }, [visible]);
}
