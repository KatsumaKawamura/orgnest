"use client";
import { useEffect, useRef, RefObject } from "react";

/**
 * モーダル用フォーカス管理
 * - 開いたらモーダル内の適切な要素へ初期フォーカス
 * - 閉じたらオープナー（開いたときにアクティブだった要素）へフォーカス復帰
 * T はパネル要素の型（HTMLDivElement など）
 */
export function useModalFocus<T extends HTMLElement>(
  visible: boolean,
  panelRef: RefObject<T | null>
) {
  const openerRef = useRef<HTMLElement | null>(null);

  // 開いた時点のフォーカスを記録 & アンマウント時に戻す
  useEffect(() => {
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    return () => openerRef.current?.focus?.();
  }, []);

  // 表示開始後にモーダル内へ初期フォーカス
  useEffect(() => {
    if (!visible) return;
    const root = panelRef.current;
    if (!root) return;

    const target =
      root.querySelector<HTMLElement>("[data-autofocus]") ||
      root.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ||
      (root as unknown as HTMLElement);

    const t = window.setTimeout(() => target.focus(), 0);
    return () => window.clearTimeout(t);
  }, [visible, panelRef]);
}
