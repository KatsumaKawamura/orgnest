// hooks/useProgressOverlay.ts
"use client";

import { useCallback, useRef, useState } from "react";

export type ProgressStatus = "processing" | "done";

/**
 * モーダルの進捗オーバーレイ用フック
 * - 常に同じ順序で useState を呼ぶ（条件分岐なし）
 * - 早期 return なし
 * - ミニマム遅延（minMs）を担保
 */
export function useProgressOverlay(minMs = 800) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<ProgressStatus>("processing");
  const runIdRef = useRef(0);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /**
   * 進捗表示と最小時間を担保しながら非同期処理を実行する。
   * 成功: { ok:true, data }
   * 失敗: { ok:false, error }
   */
  const runWithMinDelay = useCallback(
    async <T>(task: () => Promise<T>) => {
      const id = ++runIdRef.current;

      setStatus("processing");
      setShow(true);

      const start = performance.now();
      try {
        const data = await task();
        const elapsed = performance.now() - start;
        if (elapsed < minMs) await sleep(minMs - elapsed);
        // 直近の run だけが状態を更新
        if (runIdRef.current === id) setStatus("done");
        return { ok: true as const, data };
      } catch (error) {
        const elapsed = performance.now() - start;
        if (elapsed < minMs) await sleep(minMs - elapsed);
        if (runIdRef.current === id) {
          setShow(false); // エラー時はオーバーレイを閉じる
          setStatus("processing");
        }
        return { ok: false as const, error };
      }
    },
    [minMs]
  );

  return { show, setShow, status, setStatus, runWithMinDelay } as const;
}

export default useProgressOverlay;
