"use client";
import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";

type Base = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">;

interface InputProps extends Base {
  label?: string;
  value?: string;
  /** 既存互換: イベントを受ける */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** 追加: 文字列で受ける */
  onValueChange?: (value: string) => void;
}

export default function Input({
  label,
  className,
  onChange,
  onValueChange,
  value,
  ...rest
}: InputProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  return (
    <div>
      {label && <p className="text-xs text-gray-400 mb-1">{label}</p>}
      <input
        {...rest}
        value={value}
        onChange={handleChange}
        className={clsx(
          "w-full px-3 py-2 rounded border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400",
          className
        )}
      />
    </div>
  );
}
