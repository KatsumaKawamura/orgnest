// @/components/common/ModalOverlay.tsx
"use client";
import type React from "react";

type Props = {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  visible: boolean;
  transitionStyle: React.CSSProperties;
  closeOnBackdrop: boolean;
  onBackdrop: () => void;
  children: React.ReactNode;
};

export default function ModalOverlay({
  overlayRef,
  visible,
  transitionStyle,
  closeOnBackdrop,
  onBackdrop,
  children,
}: Props) {
  return (
    <div
      ref={overlayRef}
      data-fmw-overlay="1"
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      } bg-black/50`}
      style={{
        ...transitionStyle,
        padding:
          "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
      }}
      onClick={closeOnBackdrop ? onBackdrop : undefined}
    >
      {children}
    </div>
  );
}
