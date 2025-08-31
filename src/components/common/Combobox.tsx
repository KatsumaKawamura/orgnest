// @/components/common/Combobox.tsx
"use client";
import { useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useDropdownController } from "@/hooks/useDropdownController";
import { ComboboxProps, SelectOption } from "@/types/common";
import {
  baseSelectClass,
  baseIconClass,
} from "@/components/common/selectStyles";

/**
 * 変更点:
 * - inputClassName?: string を追加（input の高さ/文字サイズなどを外部から直接指定可能）
 * - 既存の className は wrapper <div> に適用（従来どおり）
 */
export default function Combobox({
  value,
  options,
  placeholder,
  onChange,
  className,
  inputClassName, // ★ 追加
  allowCustom = false,
  allowFiltering = false,
}: ComboboxProps & { inputClassName?: string }) {
  const [showAll, setShowAll] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 文字列 or SelectOption → SelectOption 型に統一
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // フィルタリング or 全件表示
  const filteredOptions =
    showAll || !allowFiltering
      ? normalizedOptions
      : normalizedOptions.filter((opt) =>
          opt.label.toLowerCase().includes(String(value ?? "").toLowerCase())
        );

  const controller = useDropdownController({
    options: filteredOptions,
    getOptionValue: (o) => o.value,
    value,
    onSelect: onChange,
  });

  useOutsideClick(wrapperRef, () => controller.close());

  return (
    <div ref={wrapperRef} className={clsx("relative", className)}>
      <div className="relative">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            const inputValue = e.target.value;
            onChange(inputValue);
            setShowAll(false);
            controller.open();
          }}
          onFocus={() => {
            setShowAll(false);
            controller.open();
          }}
          onKeyDown={controller.handleKeyDown}
          className={clsx(baseSelectClass, inputClassName)} // ★ ここで反映
        />
        {/* ▼アイコン */}
        <button
          type="button"
          onClick={() => {
            setShowAll(true);
            controller.toggle();
          }}
          className={baseIconClass}
          aria-label="open options"
        >
          <ChevronDown className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {/* 開閉アニメーション付き */}
      <ul
        className={clsx(
          "absolute z-20 mt-1 w-full bg-white border border-gray-800 rounded shadow max-h-40 overflow-y-auto transition-all duration-200 ease-out",
          controller.isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        role="listbox"
      >
        {filteredOptions.map((opt, index) => (
          <li
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
            aria-selected={
              String(value ?? "") === String(opt.value ?? "") || undefined
            }
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
