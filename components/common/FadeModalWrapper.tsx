// @/components/common/FadeModalWrapper.tsx
"use client";
import type React from "react";
import { ReactNode, createContext, useContext, useRef } from "react";
import { createPortal } from "react-dom";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalFocus } from "@/hooks/useModalFocus";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useModalKeyEvents } from "@/hooks/useModalKeyEvents";
import { useModalVisibility } from "@/hooks/useModalVisibility";
import { useModalBackdrop } from "@/hooks/useModalBackdrop";
import { useAriaAutolink } from "@/hooks/useAriaAutolink";

import ModalOverlay from "@/components/common/ModalOverlay";
import ModalPanel from "@/components/common/ModalPanel";

type Ctx = { close: () => void };
const FadeModalContext = createContext<Ctx | null>(null);
export const useFadeModal = () => {
  const ctx = useContext(FadeModalContext);
  if (!ctx)
    throw new Error("useFadeModal must be used inside <FadeModalWrapper>");
  return ctx;
};

interface FadeModalWrapperProps {
  children: ReactNode;
  onClose: () => void;

  // 開き始めのワンテンポ
  openDelay?: number;

  // open/close の速度＆カーブ
  durationOpen?: number;
  easingOpen?: string;
  durationClose?: number;
  easingClose?: string;

  // 挙動
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  enterSubmits?: boolean;

  // ARIA
  labelledBy?: string;
  describedBy?: string;
  role?: "dialog" | "alertdialog";

  // asChild
  asChild?: boolean;
}

export default function FadeModalWrapper({
  children,
  onClose,
  openDelay = 20,
  durationOpen = 150,
  durationClose = 350,
  easingOpen = "ease",
  easingClose = "ease",
  closeOnBackdrop = false,
  closeOnEsc = true,
  enterSubmits = true,
  labelledBy,
  describedBy,
  role = "dialog",
  asChild = false,
}: FadeModalWrapperProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 開閉可視状態 + requestClose（遅延クローズ）
  const { visible, requestClose } = useModalVisibility({
    openDelay,
    durationClose,
    onClose,
  });

  // 初期フォーカス & 復帰、Tab トラップ、背面スクロールロック
  useModalFocus(visible, panelRef);
  useFocusTrap?.(panelRef, visible);
  useScrollLock();

  // 背面 inert / data-attr 管理
  useModalBackdrop(visible);

  // ARIA 自動配線（data-modal-title / data-modal-desc を拾う）
  useAriaAutolink(panelRef, { labelledBy, describedBy, enabled: visible });

  // キーイベント（Esc / Enter / Arrow）
  const { onPanelKeyDown } = useModalKeyEvents({
    panelRef,
    overlayRef,
    visible,
    closeOnEsc,
    enterSubmits,
    requestClose,
  });

  const transitionStyle: React.CSSProperties = {
    transitionDuration: `${visible ? durationOpen : durationClose}ms`,
    transitionTimingFunction: visible ? easingOpen : easingClose,
  };

  const modalNode = (
    <FadeModalContext.Provider value={{ close: requestClose }}>
      <ModalOverlay
        overlayRef={overlayRef}
        visible={visible}
        transitionStyle={transitionStyle}
        closeOnBackdrop={!!closeOnBackdrop}
        onBackdrop={requestClose}
      >
        <ModalPanel
          panelRef={panelRef}
          role={role}
          labelledBy={labelledBy}
          describedBy={describedBy}
          visible={visible}
          transitionStyle={transitionStyle}
          asChild={asChild}
          onPanelKeyDown={onPanelKeyDown}
        >
          {children}
        </ModalPanel>
      </ModalOverlay>
    </FadeModalContext.Provider>
  );

  if (typeof document === "undefined") return modalNode;
  return createPortal(modalNode, document.body);
}
