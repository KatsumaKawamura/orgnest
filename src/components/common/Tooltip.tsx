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
  anchorRef: React.RefObject<HTMLElement | null>; // ← null 許容
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

  // 位置再計算
  const recalc = () => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;

    const rect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();

    const top =
      position === "top"
        ? rect.top - tipRect.height - MARGIN
        : rect.bottom + MARGIN;
    const left = rect.left + rect.width / 2 - tipRect.width / 2;

    const clampedLeft = Math.max(
      8,
      Math.min(left, window.innerWidth - tipRect.width - 8)
    );
    const clampedTop = Math.max(
      8,
      Math.min(top, window.innerHeight - tipRect.height - 8)
    );

    setStyle({
      position: "fixed",
      top: clampedTop,
      left: clampedLeft,
      transition: `opacity ${fadeDuration}ms ease`,
      pointerEvents: "auto",
    });
  };

  // 表示・非表示のアニメーション管理
  useEffect(() => {
    if (!mounted) return;
    let t: any;
    if (visible) {
      setAnimateState("idle");
      t = setTimeout(() => {
        setAnimateState("showing");
        recalc();
      }, delay);
    } else {
      setAnimateState("hiding");
      t = setTimeout(() => setAnimateState("idle"), fadeDuration);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mounted]);

  // マウント
  useEffect(() => setMounted(true), []);

  // 再配置と自動クローズ
  useLayoutEffect(() => {
    if (!mounted) return;

    const onScroll = () => {
      // 位置再計算は従来通り
      recalc();
      // 追加：表示中はスクロールでクローズ要求（要件）
      if (onRequestClose && visible) onRequestClose();
    };
    const onResize = () => {
      recalc();
      if (onRequestClose && visible) onRequestClose();
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

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
      if (target && anchor.contains(target)) {
        // アンカー内は閉じない（呼び出し元が制御）
        return;
      }
      onRequestClose?.();
    };

    document.addEventListener("pointerdown", onDocPointer, true);
    document.addEventListener("touchstart", onDocPointer, true);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
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
      className={`max-w-[min(320px,calc(100vw-16px))] rounded bg-gray-800 px-2 py-1
                  text-xs text-white shadow-lg border border-white/ z-[800]
                  ${animateState === "showing" ? "opacity-100" : "opacity-0"}`}
      role="tooltip"
    >
      {content}
    </div>,
    document.body
  );
}
