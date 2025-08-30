// @/components/common/Checkbox.tsx
"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

type CheckboxSize = "sm" | "md" | "lg" | "xl";

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string | React.ReactNode;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  size?: CheckboxSize; // ← これで全体サイズを一括制御
}

/** サイズ定義をここだけいじれば全体に反映される */
const SIZES: Record<
  CheckboxSize,
  {
    box: string; // input の W/H
    icon: string; // チェックアイコンの W/H
    barW: string; // indeterminate 横棒の幅
    barH: string; // indeterminate 横棒の高さ
    ringOffset: string; // focus ring offset（デザイン合わせ）
  }
> = {
  sm: {
    box: "w-4 h-4",
    icon: "w-3 h-3",
    barW: "w-2.5",
    barH: "h-0.5",
    ringOffset: "focus-visible:ring-offset-2",
  },
  md: {
    box: "w-5 h-5",
    icon: "w-4 h-4",
    barW: "w-3.5",
    barH: "h-0.5",
    ringOffset: "focus-visible:ring-offset-2",
  },
  lg: {
    box: "w-6 h-6",
    icon: "w-5 h-5",
    barW: "w-4.5",
    barH: "h-[3px]",
    ringOffset: "focus-visible:ring-offset-[6px]",
  },
  xl: {
    box: "w-7 h-7",
    icon: "w-6 h-6",
    barW: "w-5",
    barH: "h-[3px]",
    ringOffset: "focus-visible:ring-offset-[6px]",
  },
};

export default function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
  id,
  className,
  size = "md",
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sz = SIZES[size];

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.indeterminate = indeterminate;
    // A11y: indeterminate は mixed を表明
    inputRef.current.setAttribute(
      "aria-checked",
      indeterminate && !checked ? "mixed" : checked ? "true" : "false"
    );
  }, [indeterminate, checked]);

  return (
    <label
      className={clsx(
        "inline-flex items-center gap-2 select-none",
        disabled ? "cursor-default opacity-60" : "cursor-pointer",
        className
      )}
    >
      <span className="relative inline-flex items-center justify-center">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          className={clsx(
            "peer appearance-none rounded-sm border-2 border-gray-800 bg-white",
            sz.box,
            // Button と同じ感じのフォーカスリング
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900",
            sz.ringOffset,
            disabled && "cursor-not-allowed"
          )}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />

        {/* ✓ マーク（lucide）— 塗りなし・黒線、クリックは透過 */}
        <Check
          className={clsx(
            "pointer-events-none absolute text-gray-800",
            sz.icon,
            checked ? "opacity-100" : "opacity-0"
          )}
          strokeWidth={3}
          aria-hidden="true"
        />

        {/* indeterminate（横棒）— チェック時は非表示 */}
        {indeterminate && !checked && (
          <span
            className={clsx(
              "pointer-events-none absolute bg-gray-800 rounded",
              sz.barW,
              sz.barH
            )}
            aria-hidden="true"
          />
        )}
      </span>

      {label && (
        <span className={disabled ? "text-gray-400" : "text-gray-800"}>
          {label}
        </span>
      )}
    </label>
  );
}
