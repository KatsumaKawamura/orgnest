// components/common/PasswordInput.tsx
"use client";

import { useState, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

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
    <div>
      {label && <p className="text-xs text-gray-400 mb-1">{label}</p>}

      {/* 入力枠そのものをコンテナ化し、入力とアイコンを同一行に配置 */}
      <div
        className={clsx(
          "w-full rounded border border-gray-700 bg-gray-700 focus-within:ring-2 focus-within:ring-gray-400",
          // 既存 Input と同じ余白感（px-3 / py-2）
          "px-3",
          className
        )}
      >
        <div className="flex items-center">
          {/* 実際の入力域は透明背景で伸ばす */}
          <input
            {...props}
            type={hidden ? "password" : "text"}
            autoComplete={autoComplete}
            className={clsx(
              "flex-1 bg-transparent text-white placeholder-gray-400",
              // 既存と同じ高さ感
              "py-2 outline-none"
            )}
          />

          {/* 右端アイコン（同じ行なので常に縦中央） */}
          <button
            type="button"
            aria-label={hidden ? "パスワードを表示" : "パスワードを非表示"}
            aria-pressed={!hidden}
            className="ml-2 p-1 rounded leading-none text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onMouseDown={(e) => e.preventDefault()} // クリックでフォーカスを奪わない
            onClick={() => setHidden((v) => !v)}
          >
            {hidden ? (
              <Eye size={18} className="block" />
            ) : (
              <EyeOff size={18} className="block" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
