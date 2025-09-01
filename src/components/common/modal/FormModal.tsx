// @/components/common/modal/FormModal.tsx
"use client";

import { useEffect, useMemo } from "react";
import BaseModal, {
  type BaseModalProps,
} from "@/components/common/modal/BaseModal";

type FormModalProps = Omit<BaseModalProps, "children"> & {
  /** スマホ向け補助（visualViewport 追従など）をON/OFF（既定: true） */
  adaptToKeyboard?: boolean;
  /** 内部パネルの className を追加したい場合（任意） */
  panelClassName?: string;
  /** スクロール本文の className を追加したい場合（任意） */
  contentClassName?: string;
  children: React.ReactNode;
};

/**
 * FormModal = BaseModal + フォーム向け最小改善
 * - Backdropタップ時はまず blur でキーボードを閉じる
 * - open中は body.touchAction を "" にして iOSのジェスチャを妨げない
 * - visualViewport 変化時は必要に応じて scrollIntoView（ゆるいデバウンス）
 * - さらに "高さ上限 + 本文のみ縦スクロール" を付与（← SE対策の肝）
 */
export default function FormModal({
  open,
  onClose,
  children,
  backdropProps,
  containerProps,
  portalTargetId,
  closeOnEsc = false,
  closeOnBackdrop = false,
  adaptToKeyboard = true,
  panelClassName = "",
  contentClassName = "",
}: FormModalProps) {
  // ---- Backdrop onClick を差し込む（まず blur、必要なら close） ----
  const mergedBackdropProps = useMemo(() => {
    const originalOnClick = backdropProps?.onClick;
    return {
      ...backdropProps,
      onClick: (e: any) => {
        (document.activeElement as HTMLElement | null)?.blur?.(); // まずフォーカス解除＝キーボード閉じ
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
        originalOnClick?.(e);
      },
    } as typeof backdropProps;
  }, [backdropProps, closeOnBackdrop, onClose]);

  // ---- open中は iOS のキーボードジェスチャを妨げない ----
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.touchAction;
    body.style.touchAction = ""; // BaseModal の "none" を上書きして許可
    return () => {
      body.style.touchAction = prev;
    };
  }, [open]);

  // ---- visualViewport 追従（入力が被ったら中央付近に寄せる） ----
  useEffect(() => {
    if (!open || !adaptToKeyboard) return;

    const vv = window.visualViewport || null;
    let rafId: number | null = null;
    let timerId: number | null = null;
    let lastBlurAt = 0;
    let lastBlurEl: HTMLElement | null = null;

    const onBlur = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t) {
        lastBlurAt = Date.now();
        lastBlurEl = t;
      }
    };

    const VV_DEBOUNCE_MS = 120;
    const BLUR_SUPPRESS_MS = 400;

    const apply = () => {
      const ae = document.activeElement as HTMLElement | null;
      const justBlurred =
        lastBlurEl &&
        (!ae || ae === lastBlurEl) &&
        Date.now() - lastBlurAt < BLUR_SUPPRESS_MS;
      if (justBlurred) return;

      if (
        ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.getAttribute("contenteditable") === "true")
      ) {
        requestAnimationFrame(() => {
          try {
            ae.scrollIntoView({ block: "center", inline: "nearest" });
          } catch {}
        });
      }
    };

    const schedule = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (timerId != null) clearTimeout(timerId as any);
        timerId = window.setTimeout(() => {
          timerId = null;
          apply();
        }, VV_DEBOUNCE_MS) as unknown as number;
      });
    };

    apply(); // 初期適用
    document.addEventListener("blur", onBlur, true);
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      document.removeEventListener("blur", onBlur, true);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
      if (rafId != null) cancelAnimationFrame(rafId);
      if (timerId != null) clearTimeout(timerId as any);
    };
  }, [open, adaptToKeyboard]);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      backdropProps={mergedBackdropProps}
      containerProps={containerProps}
      portalTargetId={portalTargetId}
      closeOnEsc={closeOnEsc}
      closeOnBackdrop={closeOnBackdrop}
    >
      {/* ★ 追加：高さ上限 + 本文スクロール（iPhone SE 対策の肝） */}
      <div
        className={
          "flex max-h-[100dvh] sm:max-h-[90vh] w-full flex-col overscroll-contain " +
          panelClassName
        }
      >
        <div
          className={
            // iOS 慣性スクロールを有効化（-webkit-overflow-scrolling）
            "flex-1 overflow-y-auto px-4 py-3 [@supports(-webkit-touch-callout:none)]:[-webkit-overflow-scrolling:touch] " +
            contentClassName
          }
        >
          {children}
        </div>
      </div>
    </BaseModal>
  );
}
