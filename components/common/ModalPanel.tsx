// @/components/common/ModalPanel.tsx
"use client";
import type React from "react";
import { isValidElement, cloneElement } from "react";
import { composeRefs } from "@/utils/composeRefs";

type Props = {
  panelRef: React.RefObject<HTMLDivElement | null>;
  role: "dialog" | "alertdialog";
  labelledBy?: string;
  describedBy?: string;
  visible: boolean;
  transitionStyle: React.CSSProperties;
  asChild?: boolean;
  onPanelKeyDown: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
};

function isFocusable(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName.toLowerCase();
  if (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    tag === "button" ||
    tag === "a"
  )
    return !(el as HTMLInputElement).disabled;
  const tabindex = el.getAttribute("tabindex");
  return tabindex !== null && Number(tabindex) >= 0;
}

function getFirstFocusable(root: HTMLElement): HTMLElement | null {
  const nodes = root.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  for (const el of Array.from(nodes)) {
    if (isFocusable(el)) return el;
  }
  return null;
}

export default function ModalPanel({
  panelRef,
  role,
  labelledBy,
  describedBy,
  visible,
  transitionStyle,
  asChild,
  onPanelKeyDown,
  children,
}: Props) {
  // 共通: 素地クリックでパネルへフォーカスさせない + 万一当たっても即移す
  const attachGuards = (props: any, rootGetter: () => HTMLElement | null) => {
    const origOnMouseDownCapture = props.onMouseDownCapture;
    const origOnFocusCapture = props.onFocusCapture;
    return {
      ...props,
      onMouseDownCapture: (e: any) => {
        // クリックした要素がフォーカス可能でなければ、既定のフォーカス遷移を抑止
        const t = e.target as Element | null;
        if (!isFocusable(t)) {
          e.preventDefault();
          // 次フレームで安全に最初の操作対象へ移す（描画チラつき回避）
          requestAnimationFrame(() => {
            const root = rootGetter();
            if (!root) return;
            const first = getFirstFocusable(root);
            if (first) first.focus();
          });
        }
        origOnMouseDownCapture?.(e);
      },
      onFocusCapture: (e: any) => {
        // 万一パネル自身が focus を受けたら、直ちに最初の要素へ移す
        const current = e.currentTarget as HTMLElement;
        if (e.target === current) {
          const first = getFirstFocusable(current);
          if (first) {
            // 同期で移すとUAリングが映る環境があるため、次フレームで
            requestAnimationFrame(() => first.focus());
          }
        }
        origOnFocusCapture?.(e);
      },
    };
  };

  if (asChild && isValidElement(children)) {
    const child: any = children;
    const injectedPropsBase: any = {
      ref: composeRefs(child.props.ref, panelRef),
      tabIndex: child.props.tabIndex ?? -1,
      role: child.props.role ?? role,
      "aria-modal": child.props["aria-modal"] ?? true,
      "aria-labelledby": child.props["aria-labelledby"] ?? labelledBy,
      "aria-describedby": child.props["aria-describedby"] ?? describedBy,
      className: [
        child.props.className,
        // パネル自身のフォーカスリングは非表示（子要素には影響しない）
        "focus:outline-none focus-visible:outline-none",
        "transform transition-all",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-[0.98]",
      ]
        .filter(Boolean)
        .join(" "),
      style: { ...(child.props.style || {}), ...transitionStyle },
      onClick: (e: any) => {
        child.props.onClick?.(e);
        e.stopPropagation();
      },
      onKeyDown: (e: any) => {
        child.props.onKeyDown?.(e);
        if (!e.defaultPrevented) onPanelKeyDown(e);
      },
    };
    const injectedProps = attachGuards(
      injectedPropsBase,
      () => panelRef.current
    );
    return cloneElement(child, injectedProps);
  }

  const baseProps = {
    ref: panelRef,
    tabIndex: -1,
    className: [
      // パネル自身のフォーカスリングは非表示（子要素には影響しない）
      "focus:outline-none focus-visible:outline-none",
      "bg-transparent shadow-none",
      "rounded-lg sm:rounded-xl",
      "w-full max-w-[92vw] mx-auto px-4",
      "sm:w-auto sm:min-w-[20rem] sm:max-w-none",
      "max-h-[80vh] overflow-y-auto",
      "sm:max-h-none sm:overflow-visible",
      "transform transition-all",
      visible
        ? "opacity-100 translate-y-0 scale-100"
        : "opacity-0 translate-y-2 scale-[0.98]",
    ].join(" "),
    style: transitionStyle,
    onClick: (e: any) => e.stopPropagation(),
    onKeyDown: onPanelKeyDown,
    role,
    "aria-modal": true,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
  };

  const guarded = attachGuards(baseProps, () => panelRef.current);

  return <div {...guarded}>{children}</div>;
}
