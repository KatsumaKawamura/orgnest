// hooks/useProgressOverlay.ts
"use client";
import { useState } from "react";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MIN_MS = 800;

export type ProgressStatus = "processing" | "done";

export function useProgressOverlay() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<ProgressStatus>("processing");

  async function runWithMinDelay<T>(fn: () => Promise<T>) {
    setStatus("processing");
    setShow(true);
    const start = performance.now();
    try {
      const result = await fn();
      const elapsed = performance.now() - start;
      if (elapsed < MIN_MS) await sleep(MIN_MS - elapsed);
      setStatus("done");
      return { ok: true as const, result };
    } catch (err) {
      const elapsed = performance.now() - start;
      if (elapsed < MIN_MS) await sleep(MIN_MS - elapsed);
      setShow(false); // 失敗時はここで閉じる（呼び出し側でInfo表示）
      return { ok: false as const, error: err };
    }
  }

  return { show, setShow, status, setStatus, runWithMinDelay };
}
