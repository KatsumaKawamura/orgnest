// @/components/common/modal/BaseModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
    (html.style as any).overscrollBehavior = "none";
    (body.style as any).overscrollBehavior = "none";
    // iOSの“キーボード閉じ”ジェスチャは殺さない
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
/** blur直後の scrollIntoView 抑止（ms） */
const BLUR_SUPPRESS_MS = 500;

function isFullyVisibleInContainer(container: HTMLElement, el: HTMLElement) {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const verticallyVisible = r.top >= c.top && r.bottom <= c.bottom;
  const horizontallyVisible = r.left >= c.left && r.right <= c.right;
  return verticallyVisible && horizontallyVisible;
}

function scrollIntoContainerView(container: HTMLElement, el: HTMLElement) {
  const now = Date.now();
  const lastEl = (scrollIntoContainerView as any)._lastEl as HTMLElement | null;
  const lastAt = (scrollIntoContainerView as any)._lastAt as number | undefined;
  if (lastEl === el && lastAt && now - lastAt < SCROLL_REPEAT_BLOCK_MS) return;

  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const margin = 16;

  let dy = 0;
  if (r.bottom > c.bottom - margin) dy = r.bottom - (c.bottom - margin);
  else if (r.top < c.top + margin) dy = r.top - (c.top + margin);

  let dx = 0;
  if (r.right > c.right - margin) dx = r.right - (c.right - margin);
  else if (r.left < c.left + margin) dx = r.left - (c.left + margin);

  if (dx !== 0 || dy !== 0) {
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

  // container / backdrop 参照
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const backdropElRef = useRef<HTMLDivElement | null>(null);

  // VV コアレッシング用
  const rafIdRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const lastAppliedRef = useRef<number>(0);

  // blur直後の scrollIntoView 抑止
  const lastBlurElRef = useRef<HTMLElement | null>(null);
  const lastBlurAtRef = useRef<number>(0);

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
        (document.activeElement as HTMLElement | null)?.blur?.();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open, closeOnEsc, onClose]);

  // document 全体で blur を捕捉（scrollIntoView 抑止に使用）
  useEffect(() => {
    if (!open) return;
    const onBlur = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t) {
        lastBlurElRef.current = t;
        lastBlurAtRef.current = Date.now();
      }
    };
    document.addEventListener("blur", onBlur, true);
    return () => document.removeEventListener("blur", onBlur, true);
  }, [open]);

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

      // 微振動を無視
      if (Math.abs(heightLoss - prev) >= VV_THRESHOLD_PX) {
        lastAppliedRef.current = heightLoss;
        setKbOffset(heightLoss);
      }

      // 入力要素が見切れていたら、“container 内でだけ”スクロール
      const ae = document.activeElement as HTMLElement | null;
      const container = containerElRef.current;

      // blur 直後はスクロールさせない
      const justBlurred =
        lastBlurElRef.current &&
        (ae === null || ae === lastBlurElRef.current) &&
        Date.now() - lastBlurAtRef.current < BLUR_SUPPRESS_MS;

      if (
        !justBlurred &&
        ae &&
        container &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.getAttribute("contenteditable") === "true")
      ) {
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

  // Backdrop 上のスクロールを完全ブロック（背面スクロールの抑止）
  useEffect(() => {
    if (!open) return;
    const el = backdropElRef.current;
    if (!el) return;

    const stop = (e: Event) => {
      // Backdrop（灰色領域）上のジェスチャは常に阻止
      e.preventDefault();
    };

    el.addEventListener("touchmove", stop, { passive: false });
    el.addEventListener("wheel", stop, { passive: false });

    return () => {
      el.removeEventListener("touchmove", stop as EventListener);
      el.removeEventListener("wheel", stop as EventListener);
    };
  }, [open]);

  if (!mounted || !open) return null;

  const target =
    (portalTargetId && typeof document !== "undefined"
      ? document.getElementById(portalTargetId)
      : null) || (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;

  const backdropClass = ["bm-overlay", backdropProps?.className]
    .filter(Boolean)
    .join(" ");

  // .bm-panel をデフォルト付与
  const containerClass = [
    "bm-container",
    "bm-panel",
    "overflow-auto",
    containerProps?.className,
  ]
    .filter(Boolean)
    .join(" ");

  // “キーボード分”を差し引いた高さでモーダルを表示
  const containerStyleExtra: React.CSSProperties = {
    maxHeight: `calc(100dvh - ${kbOffset}px)`,
    paddingBottom: `max(${kbOffset}px, env(safe-area-inset-bottom, 0px))`,
    WebkitOverflowScrolling: "touch",
    // ゴムバンドの連鎖抑制（対応ブラウザで有効）
    overscrollBehavior: "contain",
  };

  // キーボード閉じ直後にVVが遅延する問題への“強制フル高さ”復帰
  const forceFullHeightAfterBlur = () => {
    // 即時で 0 に戻す
    lastAppliedRef.current = 0;
    setKbOffset(0);
    // rAF 後にもう一度 0（レイアウトが安定してから）
    requestAnimationFrame(() => {
      lastAppliedRef.current = 0;
      setKbOffset(0);
    });
    // さらに短い遅延後にも 0（iOSの遅延復帰を潰す）
    window.setTimeout(() => {
      lastAppliedRef.current = 0;
      setKbOffset(0);
    }, VV_DEBOUNCE_MS);
  };

  return createPortal(
    <div
      {...backdropProps}
      ref={backdropElRef}
      className={backdropClass}
      style={{ position: "fixed", inset: 0, ...(backdropProps?.style ?? {}) }}
      onClick={(e) => {
        // まずフォーカス解除でキーボードを閉じる（モーダルは閉じない仕様）
        (document.activeElement as HTMLElement | null)?.blur?.();
        lastBlurElRef.current = document.activeElement as HTMLElement | null;
        lastBlurAtRef.current = Date.now();

        // フル高さへ強制復帰
        forceFullHeightAfterBlur();

        if (closeOnBackdrop) {
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
