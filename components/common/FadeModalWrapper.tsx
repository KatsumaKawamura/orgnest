// @/components/common/FadeModalWrapper.tsx
"use client";
import type React from "react";
import {
  ReactNode,
  createContext,
  useContext,
  useRef,
  useEffect,
  isValidElement,
  cloneElement,
} from "react";
import { createPortal } from "react-dom";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalFocus } from "@/hooks/useModalFocus";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useModalKeyEvents } from "@/hooks/useModalKeyEvents";
import { useModalVisibility } from "@/hooks/useModalVisibility";
import { useModalBackdrop } from "@/hooks/useModalBackdrop";
import { useAriaAutolink } from "@/hooks/useAriaAutolink";
import { useInertStack } from "@/hooks/useInertStack";

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

  // ★ 追加：表示方法（"modal"=従来, "inline"=オーバーレイ無しでその場フェード）
  variant?: "modal" | "inline";
}

export default function FadeModalWrapper({
  children,
  onClose,
  openDelay = 20,
  durationOpen = 150,
  durationClose = 150,
  easingOpen = "ease",
  easingClose = "ease",
  closeOnBackdrop = false,
  closeOnEsc = true,
  enterSubmits = false,
  labelledBy,
  describedBy,
  role = "dialog",
  asChild = false,
  variant = "modal",
}: FadeModalWrapperProps) {
  // 可視状態 + requestClose（遅延クローズ）
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const { visible, requestClose } = useModalVisibility({
    openDelay,
    durationClose,
    onClose,
  });

  // 共通のトランジション
  const transitionStyle: React.CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: `${visible ? durationOpen : durationClose}ms`,
    transitionTimingFunction: visible ? easingOpen : easingClose,
    opacity: visible ? 1 : 0,
  };

  // ★ inline 変種：オーバーレイ・ポータル・フォーカス制御なしで、その場フェード
  if (variant === "inline") {
    // Esc で閉じるだけ有効化（必要なければ closeOnEsc=false に）
    useEffect(() => {
      if (!closeOnEsc) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") requestClose();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [closeOnEsc, requestClose]);

    const node =
      asChild && isValidElement(children) ? (
        cloneElement(children as any, {
          // `contents` でレイアウト影響ゼロ、子の絶対配置も維持
          // ラッパーが必要ないため、styleを子自身に付与
          style: { ...(children as any).props?.style, ...transitionStyle },
        })
      ) : (
        <div className="contents" style={transitionStyle}>
          {children}
        </div>
      );

    return (
      <FadeModalContext.Provider value={{ close: requestClose }}>
        {node}
      </FadeModalContext.Provider>
    );
  }

  // ===== ここから従来の "modal" 変種 =====

  // 初期フォーカス & 復帰、Tab トラップ、背面スクロールロック
  useModalFocus(visible, panelRef);
  useFocusTrap(panelRef, visible);
  useScrollLock(visible);

  // inert スタック
  useInertStack(overlayRef, visible);

  // backdrop/data-attr
  useModalBackdrop(visible);

  // ARIA 自動配線
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
