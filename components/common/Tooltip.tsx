// components/common/Tooltip.tsx
"use client";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TOOLTIP_DELAY, TOOLTIP_FADE_DURATION } from "@/constants/timeline";

interface TooltipProps {
  content: ReactNode;
  position?: "top" | "bottom";
  visible: boolean;
  delay?: number;
  fadeDuration?: number;
  anchorRef: React.RefObject<HTMLElement | null>; // ← null 許容
}

const MARGIN = 8;

export default function Tooltip({
  content,
  position = "top",
  visible,
  delay = TOOLTIP_DELAY,
  fadeDuration = TOOLTIP_FADE_DURATION,
  anchorRef,
}: TooltipProps) {
  const [delayedVisible, setDelayedVisible] = useState(false);
  const [animateState, setAnimateState] = useState<
    "hidden" | "showing" | "hiding"
  >("hidden");
  const tipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  // タイマー参照
  const showTimerRef = useRef<number | undefined>(undefined);
  const hideTimerRef = useRef<number | undefined>(undefined);

  // 表示/非表示の制御（タイマー競合を必ず解消）
  useEffect(() => {
    // 既存タイマーは常にクリア
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = undefined;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
    }

    if (visible) {
      showTimerRef.current = window.setTimeout(() => {
        setDelayedVisible(true);
        setAnimateState("showing");
      }, delay);
    } else {
      // すぐにフェード開始
      setAnimateState("hiding");
      hideTimerRef.current = window.setTimeout(() => {
        setDelayedVisible(false);
        setAnimateState("hidden"); // ← フェード完了で hidden に戻す
      }, fadeDuration);
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [visible, delay, fadeDuration]);

  // 位置決定（viewport基準）
  useLayoutEffect(() => {
    if (!delayedVisible) return;

    const place = () => {
      const anchor = anchorRef?.current;
      const tip = tipRef.current;
      if (!anchor || !tip) return;

      const a = anchor.getBoundingClientRect();
      const t = tip.getBoundingClientRect();

      // 横：中央 → 端クランプ
      let left = a.left + a.width / 2 - t.width / 2;
      left = Math.max(
        MARGIN,
        Math.min(left, window.innerWidth - t.width - MARGIN)
      );

      // 縦：基本 top、はみ出せば bottom にフリップ
      let top =
        position === "top" ? a.top - t.height - MARGIN : a.bottom + MARGIN;
      if (position === "top" && top < MARGIN) {
        top = a.bottom + MARGIN; // flip
      }
      if (top + t.height > window.innerHeight - MARGIN) {
        top = Math.max(MARGIN, window.innerHeight - t.height - MARGIN);
      }

      setStyle({
        position: "fixed",
        left,
        top,
        opacity: 1,
        zIndex: 9999,
        pointerEvents: "none",
        transitionProperty: "opacity",
        transitionDuration: `${fadeDuration}ms`,
      });
    };

    place();
    const onScroll = () => place();
    const onResize = () => place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [delayedVisible, position, anchorRef, fadeDuration]);

  // 完全非表示時はアンマウント
  if (!delayedVisible && animateState === "hidden") return null;

  return createPortal(
    <div
      ref={tipRef}
      style={style}
      className={`max-w-[min(320px,calc(100vw-16px))] rounded bg-gray-800 px-2 py-1
                  text-xs text-white shadow-lg border border-white/20
                  ${animateState === "showing" ? "opacity-100" : "opacity-0"}`}
      role="tooltip"
    >
      {content}
    </div>,
    document.body
  );
}
