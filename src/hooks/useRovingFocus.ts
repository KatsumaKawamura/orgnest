"use client";
import { useEffect, useRef, useState } from "react";

type Orientation = "vertical" | "horizontal";

type Options = {
  length: number; // アイテム数
  orientation?: Orientation; // "vertical"=↑↓, "horizontal"=←→
  loop?: boolean; // 端で循環するか
  initialIndex?: number; // 初期インデックス
};

export function useRovingFocus<T extends HTMLElement>({
  length,
  orientation = "vertical",
  loop = true,
  initialIndex = 0,
}: Options) {
  const [index, setIndex] = useState(initialIndex);
  const [bump, setBump] = useState(0); // 同じ index でも再フォーカス用
  const refs = useRef<Array<T | null>>([]);
  const focusing = useRef(false);

  // 唯一の .focus() 実行場所
  useEffect(() => {
    const el = refs.current[index];
    if (!el) return;
    focusing.current = true;
    const id = requestAnimationFrame(() => {
      el.focus();
      setTimeout(() => (focusing.current = false), 0);
    });
    return () => cancelAnimationFrame(id);
  }, [index, bump]);

  // グローバルキー監視（未フォーカスでも復帰）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // ★ モーダル表示中は一切動かさない（ラッパーが data-modal-open を付与）
      if (document.body.dataset.modalOpen === "1") return;

      const isForward =
        orientation === "vertical"
          ? e.key === "ArrowDown"
          : e.key === "ArrowRight";
      const isBackward =
        orientation === "vertical"
          ? e.key === "ArrowUp"
          : e.key === "ArrowLeft";
      if (!isForward && !isBackward) return;

      // リピート or フォーカス適用中はスキップ（ジャンプ防止）
      if (e.repeat || focusing.current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      const active = document.activeElement as HTMLElement | null;
      const inside = refs.current.some((r) => r === active);

      if (!inside) {
        // 未フォーカス初回復帰: 後退キー=先頭(0)、前進キー=末尾(length-1)
        const to = isBackward ? 0 : length - 1;
        if (to === index) setBump((n) => n + 1);
        else setIndex(to);
        return;
      }

      // 通常ロービング
      let next = index + (isForward ? 1 : -1);
      if (loop) next = (next + length) % length;
      else next = Math.max(0, Math.min(length - 1, next));
      setIndex(next);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, length, orientation, loop]);

  // アイテム側に渡す props
  const getItemProps = (i: number) => ({
    ref: (el: T | null) => {
      refs.current[i] = el; // ← 戻り値なし（void）
    },
    tabIndex: index === i ? 0 : -1,
  });

  return { index, setIndex, getItemProps };
}
