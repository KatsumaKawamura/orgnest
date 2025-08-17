"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  /** 左側ラベル（例：USER_ID） */
  label: string;
  /** 値（空・未設定は "None" を表示） */
  value?: string;
  /** パスワードなど、マスク可否 */
  maskable?: boolean;
  /** 初期はマスクするか（maskable=true のとき有効） */
  defaultMasked?: boolean;
  /** ラベル列の幅（例 "8rem"） */
  labelWidth?: string;
  /** 値エリアの幅（例 "20rem"） */
  fieldWidth?: string;
  /** a11y: 値エリアの aria-label */
  ariaLabel?: string;
};

export default function ReviewFieldRow({
  label,
  value,
  maskable = false,
  defaultMasked = true,
  labelWidth = "8rem",
  fieldWidth = "20rem",
  ariaLabel,
}: Props) {
  const [masked, setMasked] = useState(maskable ? defaultMasked : false);

  const display = (() => {
    const v = (value ?? "").trim();
    if (!v) return "None";
    if (!maskable || !masked) return v;
    return "•".repeat(v.length);
  })();

  return (
    <div className="flex items-center justify-center gap-4">
      <div
        className="shrink-0 text-sm text-gray-600 text-left"
        style={{ width: labelWidth }}
      >
        {label}
      </div>

      <div
        className="relative text-left px-2 border-b border-gray-400"
        style={{ width: fieldWidth }}
        aria-label={ariaLabel ?? label}
      >
        <span className="block py-1 pr-6 break-all">{display}</span>

        {maskable && (
          <button
            type="button"
            onClick={() => setMasked((v) => !v)}
            aria-pressed={!masked ? true : false}
            aria-label={masked ? "パスワードを表示" : "パスワードを非表示"}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {masked ? (
              <Eye className="w-4 h-4" aria-hidden="true" />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
