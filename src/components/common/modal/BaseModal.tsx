// @/components/common/modal/BaseModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropProps?: DivProps;
  containerProps?: DivProps;
  portalTargetId?: string;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;

  /** モバイル対策：trueでVisualViewportに追従（既定: true） */
  adaptToKeyboard?: boolean;
};

let lockCount = 0;
let savedStyles: {
  htmlOverflow?: string;
  bodyOverflow?: string;
  htmlOverscroll?: string;
  bodyOverscroll?: string;
  bodyPaddingRight?: string;
  bodyTouchAction?: string;
} | null = null;

function lockScroll() {
  if (typeof window === "undefined") return;

  const html = document.documentElement;
  const body = document.body;

  if (lockCount === 0) {
    savedStyles = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: (html.style as any).overscrollBehavior,
      bodyOverscroll: (body.style as any).overscrollBehavior,
      bodyPaddingRight: body.style.paddingRight,
      bodyTouchAction: body.style.touchAction,
    };

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    // 画面外のオーバースクロールを抑制
    (html.style as any).overscrollBehavior = "none";
    (body.style as any).overscrollBehavior = "none";
    // ← ここは "none" だとモーダル内のスクロール自体は許可される（子要素に依存）
    body.style.touchAction = ""; // ★スマホでの“キーボード閉じジェスチャ”を殺さないよう解除
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function unlockScroll() {
  if (typeof window === "undefined") return;
  if (lockCount === 0) return;

  lockCount -= 1;
  if (lockCount === 0 && savedStyles) {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = savedStyles.htmlOverflow ?? "";
    body.style.overflow = savedStyles.bodyOverflow ?? "";
    (html.style as any).overscrollBehavior = savedStyles.htmlOverscroll ?? "";
    (body.style as any).overscrollBehavior = savedStyles.bodyOverscroll ?? "";
    body.style.touchAction = savedStyles.bodyTouchAction ?? "";
    body.style.paddingRight = savedStyles.bodyPaddingRight ?? "";

    savedStyles = null;
  }
}

export default function BaseModal({
  open,
  onClose,
  children,
  backdropProps,
  containerProps,
  portalTargetId,
  closeOnEsc = false,
  closeOnBackdrop = false,
  adaptToKeyboard = true,
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  // VisualViewport 差分から“キーボード分の食い込み”を算出
  const [kbOffset, setKbOffset] = useState(0);
  const vvRef = useRef<VisualViewport | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // open中のみスクロールロック
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [open]);

  // Esc で閉じる（オプトイン）
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        // 入力中ならキーボードを先に閉じる
        (document.activeElement as HTMLElement | null)?.blur?.();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open, closeOnEsc, onClose]);

  // モバイル：キーボード出現に追従
  useEffect(() => {
    if (!open || !adaptToKeyboard) return;
    const vv = window.visualViewport || null;
    vvRef.current = vv;

    const update = () => {
      if (!vv) return;
      const heightLoss = Math.max(
        0,
        window.innerHeight - Math.round(vv.height)
      );
      setKbOffset(heightLoss);
      // 入力要素が隠れていたら中央に見えるようスクロール
      const ae = document.activeElement as HTMLElement | null;
      if (
        ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.getAttribute("contenteditable") === "true")
      ) {
        // レイアウト確定後に実行
        requestAnimationFrame(() => {
          ae.scrollIntoView({ block: "center", inline: "nearest" });
        });
      }
    };

    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [open, adaptToKeyboard]);

  if (!mounted || !open) return null;

  const target =
    (portalTargetId && typeof document !== "undefined"
      ? document.getElementById(portalTargetId)
      : null) || (typeof document !== "undefined" ? document.body : null);

  if (!target) return null;

  const backdropClass = ["bm-overlay", backdropProps?.className]
    .filter(Boolean)
    .join(" ");
  const containerClass = [
    "bm-container",
    "overflow-auto",
    containerProps?.className,
  ]
    .filter(Boolean)
    .join(" ");

  // “キーボード分”を差し引いた高さでモーダルを表示
  // 100dvh / 100svh は iOS/Android の動的ビューポートに追従
  const containerStyleExtra: React.CSSProperties = {
    maxHeight: `calc(100dvh - ${kbOffset}px)`,
    // iOS のセーフエリア下部
    paddingBottom: `max(${kbOffset}px, env(safe-area-inset-bottom, 0px))`,
    // 一応の保険（外から fixed 等でサイズ指定されても中はスクロール可能に）
    WebkitOverflowScrolling: "touch",
  };

  return createPortal(
    <div
      {...backdropProps}
      className={backdropClass}
      style={{ position: "fixed", inset: 0, ...(backdropProps?.style ?? {}) }}
      onClick={(e) => {
        // まずフォーカス解除でキーボードを閉じる
        (document.activeElement as HTMLElement | null)?.blur?.();

        if (closeOnBackdrop) {
          // Backdrop 自身へのクリックのみ反応
          if (e.target === e.currentTarget) onClose();
        }
        backdropProps?.onClick?.(e);
      }}
    >
      <div
        {...containerProps}
        className={containerClass}
        onClick={(e) => {
          containerProps?.onClick?.(e);
          e.stopPropagation();
        }}
        style={{
          ...(containerProps?.style ?? {}),
          ...containerStyleExtra,
        }}
      >
        {children}
      </div>
    </div>,
    target
  );
}
