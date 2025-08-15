// hooks/useAriaAutolink.ts
"use client";
import { RefObject, useEffect } from "react";

type Options = {
  labelledBy?: string;
  describedBy?: string;
  enabled?: boolean; // 例: visible
};

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
      if (titleEl?.id) panel.setAttribute("aria-labelledby", titleEl.id);
    }
    if (!describedBy && !panel.hasAttribute("aria-describedby")) {
      const descEl = panel.querySelector<HTMLElement>("[data-modal-desc]");
      if (descEl?.id) panel.setAttribute("aria-describedby", descEl.id);
    }
  }, [enabled, panelRef, labelledBy, describedBy]);
}
