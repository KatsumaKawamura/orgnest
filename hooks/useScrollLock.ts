"use client";
import { useEffect } from "react";

export function useScrollLock() {
  useEffect(() => {
    const html = document.documentElement;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverscroll = (html.style as any).overscrollBehavior;
    const prevBodyOverscroll = (document.body.style as any).overscrollBehavior;
    const prevTouchAction = document.body.style.touchAction;
    const prevBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    (html.style as any).overscrollBehavior = "none";
    (document.body.style as any).overscrollBehavior = "none";
    document.body.style.touchAction = "none";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      (html.style as any).overscrollBehavior = prevHtmlOverscroll;
      (document.body.style as any).overscrollBehavior = prevBodyOverscroll;
      document.body.style.touchAction = prevTouchAction;
      document.body.style.paddingRight = prevBodyPaddingRight;
    };
  }, []);
}
