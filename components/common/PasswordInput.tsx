// components/common/PasswordInput.tsx
"use client";

import { useState, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react"; // ← 追加

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  defaultHidden?: boolean;
};

export default function PasswordInput({
  label,
  className,
  defaultHidden = true,
  autoComplete = "new-password",
  ...props
}: Props) {
  const [hidden, setHidden] = useState(defaultHidden);

  return (
    <div className="relative">
      {label && <p className="text-xs text-gray-400 mb-1">{label}</p>}

      <input
        {...props}
        type={hidden ? "password" : "text"}
        autoComplete={autoComplete}
        className={clsx(
          "w-full px-3 py-2 pr-10 rounded border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400",
          className
        )}
      />

      <button
        type="button"
        aria-label={hidden ? "パスワードを表示" : "パスワードを非表示"}
        aria-pressed={!hidden}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setHidden((v) => !v)}
      >
        {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}
