// @/components/common/modal/FormModal.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import BaseModal, {
  type BaseModalProps,
} from "@/components/common/modal/BaseModal";

type FormModalProps = Omit<BaseModalProps, "children"> & {
  /** BaseModal完全準拠。スマホ向け補助をON/OFF（既定: true） */
  adaptToKeyboard?: boolean;
  children: React.ReactNode;
};

/**
 * FormModal = BaseModal 完全準拠 + スマホ体験の最小改善
 * - 見た目（カード）は付けない
 * - Backdropタップ時はまず blur（= キーボード閉じ）
 * - open中は body.touchAction を一時的に "" にして iOS のキーボードジェスチャを妨げない
 * - VisualViewport 追従（任意）で入力が被ったら scrollIntoView（高さ・paddingは変更しない）
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
}: FormModalProps) {
  // ---- Backdrop onClick を差し込む（まず blur、必要なら close） ----
  const mergedBackdropProps = useMemo(() => {
    const originalOnClick = backdropProps?.onClick;
    return {
      ...backdropProps,
      onClick: (e: any) => {
        // まずフォーカス解除（= キーボードを閉じる）
        (document.activeElement as HTMLElement | null)?.blur?.();

        if (closeOnBackdrop) {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }
        // 既存ハンドラも呼ぶ
        originalOnClick?.(e);
      },
    } as typeof backdropProps;
  }, [backdropProps, closeOnBackdrop, onClose]);

  // ---- open中は iOS のキーボードジェスチャを妨げない ----
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.touchAction;
    // BaseModalは body.touchAction="none" にするが、ここで "" に上書きしてジェスチャ許可
    body.style.touchAction = "";
    return () => {
      // 復帰は BaseModal の unlock に任せるが、万一のため上書きを戻す
      body.style.touchAction = prev;
    };
  }, [open]);

  // ---- VisualViewport 追従（高さは変えず、必要なときだけ scrollIntoView） ----
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
      // blur直後は何もしない（不要なスクロール抑止）
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
        // レイアウト確定後に中央付近へ寄せる（ウィンドウ側スクロールに任せる）
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

    // 初期適用
    apply();

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
      {children}
    </BaseModal>
  );
}
