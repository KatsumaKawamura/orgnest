// hooks/useModalVisibility.ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  openDelay: number;
  durationClose: number;
  onClose: () => void;
};

export function useModalVisibility({
  openDelay,
  durationClose,
  onClose,
}: Options) {
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // フェードイン開始
  useEffect(() => {
    openTimerRef.current = window.setTimeout(() => setVisible(true), openDelay);
    return () => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [openDelay]);

  // 閉じ要求（二重実行ガード＋遅延 onClose）
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, durationClose);
  }, [onClose, durationClose]);

  return { visible, requestClose };
}
