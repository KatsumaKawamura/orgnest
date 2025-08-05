"use client";
import { ReactNode, useEffect, useState } from "react";
import { TOOLTIP_DELAY, TOOLTIP_FADE_DURATION } from "@/constants/timeline";

interface TooltipProps {
  content: ReactNode;
  position?: "top" | "bottom";
  visible: boolean;
  delay?: number; // 任意で上書き
  fadeDuration?: number; // 任意で上書き
}

export default function Tooltip({
  content,
  position = "top",
  visible,
  delay = TOOLTIP_DELAY,
  fadeDuration = TOOLTIP_FADE_DURATION,
}: TooltipProps) {
  const [delayedVisible, setDelayedVisible] = useState(false);
  const [animateState, setAnimateState] = useState<
    "hidden" | "showing" | "hiding"
  >("hidden");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      timer = setTimeout(() => {
        setDelayedVisible(true);
        setAnimateState("showing");
      }, delay);
    } else {
      setAnimateState("hiding");
      setTimeout(() => setDelayedVisible(false), fadeDuration);
    }
    return () => clearTimeout(timer);
  }, [visible, delay, fadeDuration]);

  if (!delayedVisible && animateState === "hidden") return null;

  const positionClasses =
    position === "top"
      ? "-top-14 left-1/2 -translate-x-1/2 after:top-full after:left-[30%] after:border-t-gray-800"
      : "top-full left-1/2 -translate-x-1/2 after:bottom-full after:left-[30%] after:border-b-gray-800";

  return (
    <div
      className={`absolute z-50 w-max max-w-xs px-2 py-1 bg-gray-800 text-white text-xs rounded shadow border-2 border-white 
        ${positionClasses} 
        after:content-[''] after:absolute after:-translate-x-1/2 
        after:border-4 after:border-transparent
        transition-opacity duration-${fadeDuration} ease-in-out
        ${animateState === "showing" ? "opacity-100" : "opacity-0"}`}
    >
      {content}
    </div>
  );
}
