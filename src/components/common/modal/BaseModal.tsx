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
    // スマホの“キーボード閉じ”ジェスチャを殺さない
    body.style.touchAction = "";
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

/** 微小変化を無視するしきい値（px） */
const VV_THRESHOLD_PX = 3;
/** VisualViewport 反応を束ねる遅延（ms） */
const VV_DEBOUNCE_MS = 120;
/** 同一要素への過剰 scrollIntoView 抑止（ms） */
const SCROLL_REPEAT_BLOCK_MS = 400;

/** container 内で el が十分に見えているかを判定 */
function isFullyVisibleInContainer(container: HTMLElement, el: HTMLElement) {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();

  const verticallyVisible = r.top >= c.top && r.bottom <= c.bottom;
  const horizontallyVisible = r.left >= c.left && r.right <= c.right;

  return verticallyVisible && horizontallyVisible;
}

/** container 内で el を“近い方向”にスクロール（必要なときだけ） */
function scrollIntoContainerView(container: HTMLElement, el: HTMLElement) {
  const now = Date.now();
  const lastEl = (scrollIntoContainerView as any)._lastEl as HTMLElement | null;
  const lastAt = (scrollIntoContainerView as any)._lastAt as number | undefined;

  if (lastEl === el && lastAt && now - lastAt < SCROLL_REPEAT_BLOCK_MS) {
    return; // 直近に同一要素へスクロール済みなら抑止
  }

  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();

  const margin = 16; // 少し余白を確保
  let dy = 0;

  if (r.bottom > c.bottom - margin) {
    dy = r.bottom - (c.bottom - margin);
  } else if (r.top < c.top + margin) {
    dy = r.top - (c.top + margin);
  }

  let dx = 0;
  if (r.right > c.right - margin) {
    dx = r.right - (c.right - margin);
  } else if (r.left < c.left + margin) {
    dx = r.left - (c.left + margin);
  }

  if (dx !== 0 || dy !== 0) {
    // “instant”寄りで揺れを抑える
    container.scrollBy({ left: dx, top: dy, behavior: "auto" });
    (scrollIntoContainerView as any)._lastEl = el;
    (scrollIntoContainerView as any)._lastAt = now;
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

  // container をスクロールルートとして扱う
  const containerElRef = useRef<HTMLDivElement | null>(null);

  // VV コアレッシング用
  const rafIdRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const lastAppliedRef = useRef<number>(0); // 直近の kbOffset 値

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

  // モバイル：キーボード出現に追従（安定化版）
  useEffect(() => {
    if (!open || !adaptToKeyboard) return;
    const vv = window.visualViewport || null;
    vvRef.current = vv;

    const applyUpdate = () => {
      if (!vv) return;

      const heightLoss = Math.max(
        0,
        window.innerHeight - Math.round(vv.height)
      );
      const prev = lastAppliedRef.current;

      // 微振動（±数px）を無視
      if (Math.abs(heightLoss - prev) >= VV_THRESHOLD_PX) {
        lastAppliedRef.current = heightLoss;
        setKbOffset(heightLoss);
      }

      // 入力要素が見切れていたら、“container 内でだけ”スクロール
      const ae = document.activeElement as HTMLElement | null;
      const container = containerElRef.current;
      if (
        ae &&
        container &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.getAttribute("contenteditable") === "true")
      ) {
        // レイアウト確定後に実行
        requestAnimationFrame(() => {
          if (!isFullyVisibleInContainer(container, ae)) {
            scrollIntoContainerView(container, ae);
          }
        });
      }
    };

    const scheduleUpdate = () => {
      if (rafIdRef.current != null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;

        // デバウンス（複数イベント連発を 1 回に集約）
        if (debounceTimerRef.current != null) {
          window.clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = window.setTimeout(() => {
          debounceTimerRef.current = null;
          applyUpdate();
        }, VV_DEBOUNCE_MS) as unknown as number;
      });
    };

    // 初回適用
    applyUpdate();

    vv?.addEventListener("resize", scheduleUpdate);
    vv?.addEventListener("scroll", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);

    return () => {
      vv?.removeEventListener("resize", scheduleUpdate);
      vv?.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
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

  // .bm-panel をデフォルト付与（未指定でもCSSアニメが効く）
  const containerClass = [
    "bm-container",
    "bm-panel",
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
    // コンテナをスクロールルートとして扱う
    WebkitOverflowScrolling: "touch",
  };

  return createPortal(
    <div
      {...backdropProps}
      className={backdropClass}
      style={{ position: "fixed", inset: 0, ...(backdropProps?.style ?? {}) }}
      onClick={(e) => {
        // まずフォーカス解除でキーボードを閉じる（Backdrop タップ時は“閉じない”前提）
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
        ref={containerElRef}
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
