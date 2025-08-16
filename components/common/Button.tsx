// @/components/common/Button.tsx
"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "icon";
  size?: "sm" | "md" | "lg" | "responsive";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    fullWidth = false,
    isLoading = false,
    type = "button",
    disabled,
    ...props
  },
  ref
) {
  const base =
    "rounded font-medium inline-flex items-center justify-center " +
    "transition-colors transition-shadow motion-reduce:transition-none " +
    "focus:outline-none " +
    "focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 " +
    "focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 " +
    "enabled:hover:ring-2 enabled:hover:ring-gray-900 enabled:hover:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-default";

  const variants = {
    primary:
      "bg-gray-800 text-white hover:bg-gray-700 border border-gray-800 ring-offset-white",
    secondary:
      "bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 ring-offset-white",
    danger:
      "bg-red-600 text-white hover:bg-red-700 border border-red-700 ring-offset-white",
    icon: "bg-transparent text-gray-800 hover:bg-gray-200 border border-transparent rounded-full ring-offset-white",
  } as const;

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-base min-h-[44px]",
    lg: "px-5 py-3 text-lg min-h-[48px]",
    responsive: "px-5 text-base font-medium min-h-[48px] sm:min-h-[40px]",
  } as const;

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  } as const;

  // fullWidth 優先、それ以外はデフォルト w-32
  const widthClass = fullWidth ? "w-full" : "w-32";

  const sizeClass =
    variant === "icon"
      ? iconSizes[(size === "responsive" ? "md" : size) as "sm" | "md" | "lg"]
      : sizes[size];

  const spinnerPx =
    size === "lg" ? 18 : size === "sm" ? 14 : size === "responsive" ? 16 : 16;

  return (
    <button
      ref={ref}
      type={type}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      className={clsx(
        base,
        variants[variant],
        sizeClass,
        widthClass,
        className
      )}
      {...props}
    >
      {isLoading && variant !== "icon" && (
        <>
          <span className="sr-only">Loading</span>
          <span
            aria-hidden
            className="mr-2 inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]"
            style={{ width: spinnerPx, height: spinnerPx }}
          />
        </>
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
