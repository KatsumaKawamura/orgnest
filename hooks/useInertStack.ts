// hooks/useInertStack.ts
"use client";

import { RefObject, useLayoutEffect } from "react";
import { modalInertStack } from "@/lib/modalInertStack";

/**
 * body直下にぶら下がるモーダルの“ルート要素”（= overlay の div など）を
 * inertスタックに登録する。enabled=false の間は何もしない。
 */
export function useInertStack(
  hostRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    host.setAttribute("data-modal-layer", ""); // 目印（任意）
    const unregister = modalInertStack.register(host);
    return unregister;
  }, [hostRef, enabled]);
}
