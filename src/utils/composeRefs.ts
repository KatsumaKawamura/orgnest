// @/utils/composeRefs.ts
import type React from "react";

export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else {
        try {
          (ref as any).current = node;
        } catch {}
      }
    }
  };
}
