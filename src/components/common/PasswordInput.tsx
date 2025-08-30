"use client";

import React, { useState, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

type Base = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
>;

type Props = Base & {
  label?: string;
  defaultHidden?: boolean;
  value?: string;
  /** 既存互換: イベントを受ける */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** 追加: 文字列で受ける */
  onValueChange?: (value: string) => void;
};

export default function PasswordInput({
  label,
  className,
  defaultHidden = true,
  autoComplete = "new-password",
  value,
  onChange,
  onValueChange,
  ...props
}: Props) {
  const [hidden, setHidden] = useState(defaultHidden);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  return (
    <div>
      {label && <p className="text-xs text-gray-400 mb-1">{label}</p>}
      <div
        className={clsx(
          "w-full rounded border border-gray-700 bg-gray-700 focus-within:ring-2 focus-within:ring-gray-400",
          "px-3",
          className
        )}
      >
        <div className="flex items-center">
          <input
            {...props}
            type={hidden ? "password" : "text"}
            autoComplete={autoComplete}
            value={value}
            onChange={handleChange}
            className={clsx(
              "flex-1 bg-transparent text-white placeholder-gray-400",
              "py-2 outline-none"
            )}
          />
          <button
            type="button"
            aria-label={hidden ? "パスワードを表示" : "パスワードを非表示"}
            aria-pressed={!hidden}
            className="ml-2 p-1 rounded leading-none text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setHidden((v) => !v)}
          >
            {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
