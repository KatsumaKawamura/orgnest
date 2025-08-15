// utils/pushThenClose.ts
import type { NextRouter } from "next/router";
import type { UrlObject } from "url";

/**
 * Next.js Pages Router 用の「push → 次ティックで close」ユーティリティ。
 * - UI/挙動は従来の setTimeout(close, 0) と完全同一
 * - shallow/scroll などの push オプションをそのまま渡せます
 * - afterClose により、close の直後に追加処理を行えます（任意）
 *
 * 注意: router.push の第3引数に渡すオブジェクトは History API で clone されるため、
 * 関数等（afterClose/closeDelayMs）は絶対に混ぜないこと。
 */
export function pushThenClose(
  router: NextRouter,
  close: () => void,
  href: string | UrlObject,
  options?: Parameters<NextRouter["push"]>[2] & {
    closeDelayMs?: number;
    afterClose?: () => void;
  }
) {
  // 追加フィールドを剥がし、router.push には純正の PushOptions のみ渡す
  const { closeDelayMs, afterClose, ...pushOptions } = (options ||
    {}) as NonNullable<typeof options>;

  // fire-and-forget: push して、即座に close を次ティックへ
  void router.push(href as any, undefined, pushOptions as any);

  const delay = closeDelayMs ?? 0;
  setTimeout(() => {
    try {
      close();
    } finally {
      // close 完了後の追従処理（関数は pushOptions に含めない）
      afterClose?.();
    }
  }, delay);
}
