"use client";
import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div>
      {label && <p className="text-xs text-gray-400 mb-1">{label}</p>}
      <input
        {...props}
        className={clsx(
          "w-full px-3 py-2 rounded border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400",
          className
        )}
      />
    </div>
  );
}
