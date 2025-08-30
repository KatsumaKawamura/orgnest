// hooks/useAriaAutolink.ts
"use client";
import { RefObject, useEffect } from "react";

type Options = {
  labelledBy?: string;
  describedBy?: string;
  enabled?: boolean; // 例: visible
};

let seq = 0;
const uid = (p: string) => `${p}-${++seq}`;

export function useAriaAutolink(
  panelRef: RefObject<HTMLDivElement | null>,
  { labelledBy, describedBy, enabled = true }: Options
) {
  useEffect(() => {
    if (!enabled) return;
    const panel = panelRef.current;
    if (!panel) return;

    if (!labelledBy && !panel.hasAttribute("aria-labelledby")) {
      const titleEl = panel.querySelector<HTMLElement>("[data-modal-title]");
      if (titleEl) {
        if (!titleEl.id) titleEl.id = uid("modal-title");
        panel.setAttribute("aria-labelledby", titleEl.id);
      }
    }
    if (!describedBy && !panel.hasAttribute("aria-describedby")) {
      const descEl = panel.querySelector<HTMLElement>("[data-modal-desc]");
      if (descEl) {
        if (!descEl.id) descEl.id = uid("modal-desc");
        panel.setAttribute("aria-describedby", descEl.id);
      }
    }
  }, [enabled, panelRef, labelledBy, describedBy]);
}
