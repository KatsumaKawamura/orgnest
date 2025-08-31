// src/components/common/Select.tsx
"use client";
import { useRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useDropdownController } from "@/hooks/useDropdownController";
import { SelectProps } from "@/types/common";
import {
  baseSelectClass,
  baseIconClass,
} from "@/components/common/selectStyles";

type Props = SelectProps & {
  /** 選択値を表示しているボックス（baseSelectClass が当たっている要素）への追加クラス */
  displayClassName?: string;
};

export default function Select({
  value,
  options,
  onChange,
  className, // wrapper 用
  displayClassName, // ★ 追加：表示エリア用
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const controller = useDropdownController({
    options,
    getOptionValue: (o) => o.value,
    value,
    onSelect: onChange,
  });

  useOutsideClick(wrapperRef, () => controller.close());

  return (
    <div
      ref={wrapperRef}
      className={clsx("relative", className)}
      tabIndex={0}
      onKeyDown={controller.handleKeyDown}
    >
      {/* 選択値表示エリア */}
      <div
        className={clsx(baseSelectClass, "cursor-pointer", displayClassName)} // ★ ここで反映
        onClick={controller.toggle}
      >
        {options.find((o) => o.value === value)?.label || "選択"}
      </div>

      {/* ▼アイコン */}
      <button
        type="button"
        onClick={controller.toggle}
        className={baseIconClass}
        aria-label="open options"
      >
        <ChevronDown className="w-4 h-4 text-gray-800" />
      </button>

      {/* 開閉アニメーション付き */}
      <ul
        className={clsx(
          "absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-800 rounded shadow max-h-40 overflow-y-auto transition-all duration-200 ease-out",
          controller.isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        role="listbox"
      >
        {options.map((opt, index) => (
          <li
            ref={(el) => {
              controller.itemRefs.current[index] = el;
            }}
            key={opt.value}
            className={clsx(
              "px-3 py-1 cursor-pointer",
              index === controller.highlightIndex
                ? "bg-gray-300 text-gray-900"
                : "text-gray-800 hover:bg-gray-200"
            )}
            onMouseEnter={() => controller.setHighlightIndex(index)}
            onClick={() => {
              onChange(opt.value);
              controller.close();
            }}
            role="option"
            aria-selected={value === opt.value || undefined}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
