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

export default function ModalPanel({
  panelRef,
  role,
  labelledBy,
  describedBy,
  visible,
  transitionStyle,
  asChild = false,
  onPanelKeyDown,
  children,
}: Props) {
  if (asChild && isValidElement(children)) {
    const child: any = children;
    const injectedProps: any = {
      ref: composeRefs(child.props.ref, panelRef),
      tabIndex: child.props.tabIndex ?? -1,
      role: child.props.role ?? role,
      "aria-modal": child.props["aria-modal"] ?? true,
      "aria-labelledby": child.props["aria-labelledby"] ?? labelledBy,
      "aria-describedby": child.props["aria-describedby"] ?? describedBy,
      className: [
        child.props.className,
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
    return cloneElement(child, injectedProps);
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className={`
        bg-transparent shadow-none
        rounded-lg sm:rounded-xl
        w-full max-w-[92vw] mx-auto px-4
        sm:w-auto sm:min-w-[20rem] sm:max-w-none
        max-h-[80vh] overflow-y-auto
        sm:max-h-none sm:overflow-visible
        transform transition-all
        ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-[0.98]"
        }
      `}
      style={transitionStyle}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={onPanelKeyDown}
      role={role}
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      {children}
    </div>
  );
}
