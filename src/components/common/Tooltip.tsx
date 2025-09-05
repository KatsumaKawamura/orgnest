// components/common/Tooltip.tsx
"use client";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TOOLTIP_DELAY, TOOLTIP_FADE_DURATION } from "@/constants/timeline";
import { useRouter } from "next/router";

interface TooltipProps {
  content: ReactNode;
  position?: "top" | "bottom";
  visible: boolean;
  delay?: number;
  fadeDuration?: number;
  anchorRef: React.RefObject<HTMLElement | null>;
  onRequestClose?: () => void;
}

const MARGIN = 8;

export default function Tooltip({
  content,
  position = "top",
  visible,
  delay = TOOLTIP_DELAY,
  fadeDuration = TOOLTIP_FADE_DURATION,
  anchorRef,
  onRequestClose,
}: TooltipProps) {
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [animateState, setAnimateState] = useState<
    "idle" | "showing" | "hiding"
  >("idle");
  const [style, setStyle] = useState<React.CSSProperties | undefined>();
  const router = useRouter();

  // 採寸＆配置
  const recalc = () => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;

    const rect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();

    const docEl = document.documentElement;
    const viewportW = docEl.clientWidth;
    const viewportH = docEl.clientHeight;

    // visualViewport のオフセット（PCは通常 0 / モバイルで効く）
    const vv = (window as any).visualViewport;
    const offsetLeft = vv?.offsetLeft ?? 0;
    const offsetTop = vv?.offsetTop ?? 0;

    const baseTop =
      position === "top"
        ? rect.top - tipRect.height - MARGIN
        : rect.bottom + MARGIN;
    const baseLeft = rect.left + rect.width / 2 - tipRect.width / 2;

    const clampedLeft = Math.max(
      8 + offsetLeft,
      Math.min(baseLeft, offsetLeft + viewportW - tipRect.width - 8)
    );
    const clampedTop = Math.max(
      8 + offsetTop,
      Math.min(baseTop, offsetTop + viewportH - tipRect.height - 8)
    );

    setStyle({
      position: "fixed",
      top: clampedTop,
      left: clampedLeft,
      transition: `opacity ${fadeDuration}ms ease`,
      pointerEvents: "auto",
    });
  };

  // 表示・非表示のアニメーション管理（表示時は rAF で再採寸をもう一度）
  useEffect(() => {
    if (!mounted) return;
    let t: any;
    if (visible) {
      setAnimateState("idle");
      t = setTimeout(() => {
        setAnimateState("showing");
        recalc(); // 1回目
        // 次フレームで DOM レイアウト確定後にもう一度採寸
        requestAnimationFrame(() => recalc()); // 2回目
      }, delay);
    } else {
      setAnimateState("hiding");
      t = setTimeout(() => setAnimateState("idle"), fadeDuration);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mounted]);

  // 初回マウント
  useEffect(() => setMounted(true), []);

  // サイズ変化に追従（折り返し・フォント適用など）
  useLayoutEffect(() => {
    if (!mounted) return;
    const tip = tipRef.current;
    if (!tip) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(tip);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, visible]);

  // 再配置と自動クローズ
  useLayoutEffect(() => {
    if (!mounted) return;

    const onScroll = () => {
      recalc();
      if (onRequestClose && visible) onRequestClose();
    };
    const onResize = () => {
      recalc();
      if (onRequestClose && visible) onRequestClose();
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    // visualViewport 変化にも追従（モバイル）
    const vv = (window as any).visualViewport;
    const onVV = () => recalc();
    vv?.addEventListener?.("resize", onVV);
    vv?.addEventListener?.("scroll", onVV);

    // ルート遷移で閉じる（Pages Router）
    const onRoute = () => {
      if (onRequestClose && visible) onRequestClose();
    };
    router.events?.on("routeChangeStart", onRoute);

    // 外側タップ検知（capture）
    const onDocPointer = (e: Event) => {
      if (!visible) return;
      const anchor = anchorRef.current;
      if (!anchor) return;
      const target = e.target as Node | null;
      if (target && anchor.contains(target)) return; // アンカー内は閉じない
      onRequestClose?.();
    };

    document.addEventListener("pointerdown", onDocPointer, true);
    document.addEventListener("touchstart", onDocPointer, true);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener?.("resize", onVV);
      vv?.removeEventListener?.("scroll", onVV);
      router.events?.off("routeChangeStart", onRoute);
      document.removeEventListener("pointerdown", onDocPointer, true);
      document.removeEventListener("touchstart", onDocPointer, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, visible, anchorRef, onRequestClose]);

  if (!mounted) return null;
  if (animateState === "idle" && !visible) return null;

  return createPortal(
    <div
      ref={tipRef}
      style={style}
      className={`max-w-[min(320px,calc(100dvw-16px))] rounded bg-gray-800 px-2 py-1
                  text-xs text-white shadow-lg border border-white/ z-[800] whitespace-pre-line break-words
                  ${animateState === "showing" ? "opacity-100" : "opacity-0"}`}
      role="tooltip"
    >
      {content}
    </div>,
    document.body
  );
}
