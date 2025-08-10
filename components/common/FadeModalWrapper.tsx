// @/components/common/FadeModalWrapper.tsx
"use client";
import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalFocus } from "@/hooks/useModalFocus";
import { useFocusTrap } from "@/hooks/useFocusTrap";

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
  openDelay?: number;
  durationOpen?: number;
  easingOpen?: string;
  durationClose?: number;
  easingClose?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  enterSubmits?: boolean;
  labelledBy?: string;
  describedBy?: string;
  role?: "dialog" | "alertdialog";
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
}: FadeModalWrapperProps) {
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // フェードイン開始
  useEffect(() => {
    openTimerRef.current = window.setTimeout(() => setVisible(true), openDelay);
    return () => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [openDelay]);

  // 初期フォーカス & 復帰
  useModalFocus(visible, panelRef);

  // Tab/Shift+Tab をモーダル内にトラップ
  useFocusTrap?.(panelRef, visible);

  // 背面スクロールロック（body補正あり）
  useScrollLock();

  // ★ 背面キー処理用フラグ：body に data-modal-open を付与/解除
  useEffect(() => {
    if (visible) {
      document.body.setAttribute("data-modal-open", "1");
    } else {
      document.body.removeAttribute("data-modal-open");
    }
    return () => document.body.removeAttribute("data-modal-open");
  }, [visible]);

  // ★ 背面を inert 化（フォーカス＆イベントを無効化）
  useEffect(() => {
    const root = document.getElementById("__next");
    if (!root) return;
    // inert は型定義がない環境もあるので any キャストでOK
    (root as any).inert = !!visible;
    return () => {
      (root as any).inert = false;
    };
  }, [visible]);

  // 閉じ要求（見た目の durationClose と同期）
  const requestClose = useMemo(
    () => () => {
      if (closingRef.current) return;
      closingRef.current = true;
      setVisible(false);
      closeTimerRef.current = window.setTimeout(() => {
        onClose();
      }, durationClose);
    },
    [onClose, durationClose]
  );

  // Escで閉じる
  useEffect(() => {
    if (!closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (closingRef.current) return;
        requestClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc, requestClose]);

  // Enter で“決定”押下
  useEffect(() => {
    if (!enterSubmits) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === "TEXTAREA") return;
      if (active?.hasAttribute("data-enter-ignore")) return;

      const root = panelRef.current;
      if (!root) return;

      const target =
        root.querySelector<HTMLElement>("[data-enter]") ||
        root.querySelector<HTMLElement>("[data-autofocus]") ||
        root.querySelector<HTMLElement>('button[type="submit"]') ||
        root.querySelector<HTMLElement>("button");

      if (target) {
        e.preventDefault();
        (target as HTMLButtonElement).click();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enterSubmits]);

  const transitionStyle: React.CSSProperties = {
    transitionDuration: `${visible ? durationOpen : durationClose}ms`,
    transitionTimingFunction: visible ? easingOpen : easingClose,
  };

  // ARIA 自動配線
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (!labelledBy) {
      const titleEl = panel.querySelector<HTMLElement>("[data-modal-title]");
      if (titleEl?.id) panel.setAttribute("aria-labelledby", titleEl.id);
    }
    if (!describedBy) {
      const descEl = panel.querySelector<HTMLElement>("[data-modal-desc]");
      if (descEl?.id) panel.setAttribute("aria-describedby", descEl.id);
    }
  }, [visible, labelledBy, describedBy]);

  const modalNode = (
    <FadeModalContext.Provider value={{ close: requestClose }}>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity
          ${visible ? "opacity-100" : "opacity-0"} bg-black/50`}
        style={{
          ...transitionStyle,
          padding:
            "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
        }}
        onClick={closeOnBackdrop ? requestClose : undefined}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`
            bg-transparent shadow-none
            rounded-lg sm:rounded-xl
            w-full max-w-[92vw] mx-auto px-4
            sm:w-auto sm:min-w-[20rem] sm:max-w-none
            max-h-[80vh] overflow-y-auto
            sm:max-h-none sm:overflow-visible
            transform transition-all
            ${
              visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-[0.98]"
            }
          `}
          style={transitionStyle}
          onClick={(e) => e.stopPropagation()}
          role={role}
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          {children}
        </div>
      </div>
    </FadeModalContext.Provider>
  );

  if (typeof document === "undefined") return modalNode;
  return createPortal(modalNode, document.body);
}
