// components/common/Tooltip.tsx
"use client";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  TOOLTIP_DELAY,
  TOOLTIP_FADE_DURATION,
  TIMELINE_VIEWPORT_CLASS,
} from "@/constants/timeline";
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

// 複数クラスに対応した安全なコンテナ探索
function findViewportContainer(
  startEl: HTMLElement | null
): HTMLElement | null {
  if (!startEl) return null;
  const tokens = TIMELINE_VIEWPORT_CLASS.split(/\s+/).filter(Boolean);
  let el: HTMLElement | null = startEl.parentElement;
  while (el) {
    const ok = tokens.every((t) => el!.classList.contains(t));
    if (ok) return el;
    el = el.parentElement;
  }
  return null;
}

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

    // 横方向：ビューポート基準（100dvw + clientWidth + visualViewport offset）
    const docEl = document.documentElement;
    const viewportW = docEl.clientWidth;
    const viewportH = docEl.clientHeight;
    const vv = (window as any).visualViewport;
    const offsetLeft = vv?.offsetLeft ?? 0;
    const offsetTop = vv?.offsetTop ?? 0;

    const baseLeft = rect.left + rect.width / 2 - tipRect.width / 2;
    const clampedLeft = Math.max(
      8 + offsetLeft,
      Math.min(baseLeft, offsetLeft + viewportW - tipRect.width - 8)
    );

    // 縦方向：描画エリア（スクロール容器）基準でクランプ（オートフリップなし）
    const containerEl = findViewportContainer(anchor);
    const containerRect = containerEl?.getBoundingClientRect();
    const baseTop =
      position === "top"
        ? rect.top - tipRect.height - MARGIN
        : rect.bottom + MARGIN;

    const verticalMin = containerRect
      ? containerRect.top + MARGIN
      : offsetTop + MARGIN;
    const verticalMax = containerRect
      ? containerRect.bottom - tipRect.height - MARGIN
      : offsetTop + viewportH - tipRect.height - MARGIN;

    const clampedTop = Math.max(verticalMin, Math.min(baseTop, verticalMax));

    setStyle({
      position: "fixed",
      top: clampedTop,
      left: clampedLeft,
      transition: `opacity ${fadeDuration}ms ease`,
      // pointerEvents は描画時に animateState と合成して制御
    });
  };

  // 表示/非表示の制御：表示は「採寸2回 → 表示開始」の順に変更（チラつき防止）
  useEffect(() => {
    if (!mounted) return;
    let t: any;
    if (visible) {
      setAnimateState("idle"); // レンダーさせるが非表示（visibility: hidden / pointer-events: none）
      t = setTimeout(() => {
        recalc(); // 1回目
        requestAnimationFrame(() => {
          recalc(); // 2回目（幅・折返し確定後）
          setAnimateState("showing"); // ← ここで初めて表示（opacity 0→1）
        });
      }, delay);
    } else {
      // フェードアウトは従来通り（見えるまま opacity 1→0）
      setAnimateState("hiding");
      t = setTimeout(() => setAnimateState("idle"), fadeDuration);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mounted]);

  // 初回マウント
  useEffect(() => setMounted(true), []);

  // Tip サイズ変化に追従
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

    const vv = (window as any).visualViewport;
    const onVV = () => recalc();
    vv?.addEventListener?.("resize", onVV);
    vv?.addEventListener?.("scroll", onVV);

    const onRoute = () => {
      if (onRequestClose && visible) onRequestClose();
    };
    router.events?.on("routeChangeStart", onRoute);

    const onDocPointer = (e: Event) => {
      if (!visible) return;
      const anchor = anchorRef.current;
      if (!anchor) return;
      const target = e.target as Node | null;
      if (target && anchor.contains(target)) return;
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

  // 表示タイミング制御（チラつき防止）：showing の時だけ可視＆クリック可能
  const renderStyle: React.CSSProperties = {
    ...style,
    visibility:
      animateState === "showing" || animateState === "hiding"
        ? "visible"
        : "hidden",
    pointerEvents: animateState === "showing" ? "auto" : "none",
  };

  return createPortal(
    <div
      ref={tipRef}
      style={renderStyle}
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
