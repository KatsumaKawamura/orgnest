"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "rounded border border-gray-800 font-medium focus:outline-none transition-colors flex items-center justify-center";
  const variants = {
    primary: "bg-gray-800 text-white hover:bg-gray-700",
    secondary: "bg-white text-gray-800 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-700",
    icon: "bg-transparent text-gray-800 hover:bg-gray-200 rounded-full border-none p-1",
  };
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
