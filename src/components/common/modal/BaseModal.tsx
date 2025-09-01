// @/components/common/modal/BaseModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export type BaseModalProps = {
  /** 親が完全制御する開閉フラグ */
  open: boolean;
  /** 親が明示的に閉じるためのハンドラ（Esc/外クリック有効時にも使用） */
  onClose: () => void;
  /** モーダル内容（見た目は親が定義） */
  children: React.ReactNode;

  /** 既存デザインを壊さないための受け皿（クラスやstyleを親から付与） */
  backdropProps?: DivProps; // 画面全体を覆う要素（固定配置などは親が指定）
  containerProps?: DivProps; // 子要素を入れるコンテナ（位置やサイズは親で指定）

  /** ポータル挿入先。未指定なら document.body */
  portalTargetId?: string;

  /** オプトイン動作：既定は両方とも無効（false） */
  /** Esc キーで閉じる */
  closeOnEsc?: boolean;
  /** Backdrop（外側）クリックで閉じる */
  closeOnBackdrop?: boolean;
};

/* ===== スクロールロック（複数モーダル対応） ===== */
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
    body.style.touchAction = "none";
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

/* ===== BaseModal（Esc/外クリックはデフォルト無効。必要なときだけ有効化） ===== */
export default function BaseModal({
  open,
  onClose,
  children,
  backdropProps,
  containerProps,
  portalTargetId,
  closeOnEsc = false,
  closeOnBackdrop = false,
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  // クライアントマウント判定（SSR回避）
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
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open, closeOnEsc, onClose]);

  if (!mounted || !open) return null;

  const target =
    (portalTargetId && typeof document !== "undefined"
      ? document.getElementById(portalTargetId)
      : null) || (typeof document !== "undefined" ? document.body : null);

  if (!target) return null;

  // モーション用クラスを自動付与：
  // - overlay: bm-overlay（フェード）
  // - container: bm-container（直下の子に入場アニメ）
  const backdropClass = ["bm-overlay", backdropProps?.className]
    .filter(Boolean)
    .join(" ");

  // 変更点：
  // - container に「最大高さ（まずは 100vh）」＋「縦スクロール（auto）」＋「スクロールバー非表示」を付与
  // - 既存のクラス/スタイルは維持しつつ上書き最小限
  const containerClass = [
    "bm-container",
    "hide-scrollbar",
    containerProps?.className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerStyle: React.CSSProperties = {
    maxHeight: "100vh", // 不具合が出たら 100svh に切替予定
    overflowY: "auto",
    WebkitOverflowScrolling: "touch", // iOS慣性スクロール
    ...(containerProps?.style ?? {}),
  };

  return createPortal(
    <div
      {...backdropProps}
      className={backdropClass}
      // イベント捕捉のため position/inset は最低限確保（クラス指定があればそちらが優先）
      style={{ position: "fixed", inset: 0, ...(backdropProps?.style ?? {}) }}
      onClick={
        closeOnBackdrop
          ? (e) => {
              // Backdrop 自身へのクリックのみ反応
              if (e.target === e.currentTarget) onClose();
              backdropProps?.onClick?.(e);
            }
          : backdropProps?.onClick
      }
    >
      <div
        {...containerProps}
        className={containerClass}
        style={containerStyle}
        // クリックがBackdropへバブリングして閉じないように
        onClick={(e) => {
          containerProps?.onClick?.(e);
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>,
    target
  );
}
