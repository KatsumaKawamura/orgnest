// @/hooks/useScrollLock.ts
"use client";
import { useEffect, useRef } from "react";

/** グローバルにロックの取得数を管理（複数モーダル対応） */
let lockCount = 0;

/** 適用前のスタイルを保持（最初のロック時のみ保存） */
let saved: {
  htmlOverflow: string;
  bodyOverflow: string;
  htmlOverscroll: string | undefined;
  bodyOverscroll: string | undefined;
  bodyTouchAction: string;
  bodyPaddingRight: string;
} | null = null;

function applyLock() {
  const html = document.documentElement;
  const body = document.body;

  // 初回ロック時のみスタイル退避
  if (lockCount === 0) {
    saved = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: (html.style as any).overscrollBehavior,
      bodyOverscroll: (body.style as any).overscrollBehavior,
      bodyTouchAction: body.style.touchAction,
      bodyPaddingRight: body.style.paddingRight,
    };

    // スクロールバー幅ぶんだけ右パディングを足してレイアウトシフト防止
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

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

function releaseLock() {
  if (lockCount === 0) return;
  lockCount -= 1;

  // すべてのロックが解除されたら元に戻す
  if (lockCount === 0 && saved) {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = saved.htmlOverflow;
    body.style.overflow = saved.bodyOverflow;
    (html.style as any).overscrollBehavior = saved.htmlOverscroll;
    (body.style as any).overscrollBehavior = saved.bodyOverscroll;
    body.style.touchAction = saved.bodyTouchAction;
    body.style.paddingRight = saved.bodyPaddingRight;

    saved = null;
  }
}

/**
 * ページ全体のスクロールロックを制御するフック
 * @param active true のときロック、false のとき解除
 */
export function useScrollLock(active: boolean = true) {
  // 直近の active を覚えて切り替え時に適切に操作
  const prevActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    // 初回・active=true ならロック取得
    if (active) applyLock();

    prevActiveRef.current = active;

    return () => {
      // アンマウント時：active=true だった場合のみ解除
      if (prevActiveRef.current) releaseLock();
    };
  }, [active]);
}
